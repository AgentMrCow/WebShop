// @/app/api/checkout/route.tsx

import { NextResponse, NextRequest } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import crypto from 'crypto';
import { getServerSession } from "next-auth/next"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("PayPal credentials are not defined in environment variables.");
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

type Category = "DIGITAL_GOODS" | "PHYSICAL_GOODS";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  unit_amount: { currency_code: string; value: string };
  category: Category;
}



export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const body = await req.json();
  const clientItems: CartItem[] = body.items;
  const clientTotal = parseFloat(body.total);
  const invoiceId = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const username = session?.user?.email ?? "Guest";

  let serverTotal = 0;
  let validationError = null;

  for (const item of clientItems) {
    const dbItem = await prisma.product.findUnique({
      where: { id: item.id }
    });

    if (!dbItem) {
      console.error(`Item not found in DB: ${item.id}`);
      validationError = { message: `Item not found: ${item.id}`, status: 404 };
      break;
    }

    const dbPriceFormatted = Number(dbItem.price).toFixed(2);
    if (item.unit_amount.value !== dbPriceFormatted) {
      console.error(`Price tampering detected for item ${item.id}`);
      validationError = { message: `Price mismatch for item ${item.id}`, status: 403 };
      break;
    }

    serverTotal += dbItem.price * item.quantity;
  }

  if (validationError) {
    return new NextResponse(JSON.stringify({ error: validationError.message }), { status: validationError.status, headers: { "Content-Type": "application/json" } });
  }

  let purchase_units: Array<{
    name: string;
    quantity: string;
    unit_amount: { currency_code: string; value: string };
    category: Category;
  }> = [];
  
  for (const item of clientItems) {
    const dbItem = await prisma.product.findUnique({ where: { id: item.id } });
    if (!dbItem) {
      throw new Error(`Item not found in DB: ${item.id}`);
    }
    purchase_units.push({
      name: dbItem.name,
      quantity: item.quantity.toString(),
      unit_amount: { currency_code: "USD", value: dbItem.price.toString() },
      category: "PHYSICAL_GOODS" as Category,
    });
  }

  if (Math.abs(serverTotal - clientTotal) > 0.01) {
    console.error(`Price tampering detected. Client total: ${clientTotal}, Calculated total: ${serverTotal}`);
    return new NextResponse(JSON.stringify({ error: 'Price verification failed' }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const digestString = purchase_units.map(item => `${item.name}:${item.quantity}`).join('|') + `|${serverTotal.toFixed(2)}|${username}|${salt}`;
  const digest = crypto.createHash('sha256').update(digestString).digest('hex');

  const order = await prisma.order.create({
    data: {
      uuid: invoiceId,
      username,
      digest,
      salt,
    },
  });

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: serverTotal.toString(),
        breakdown: {
          item_total: {
            currency_code: "USD",
            value: serverTotal.toString(),
          },
          discount: { currency_code: "USD", value: "0" },
          handling: { currency_code: "USD", value: "0" },
          insurance: { currency_code: "USD", value: "0" },
          shipping_discount: { currency_code: "USD", value: "0" },
          shipping: { currency_code: "USD", value: "0" },
          tax_total: { currency_code: "USD", value: "0" },
        }
      },
      items: purchase_units,
      custom_id: digest,
      invoice_id: invoiceId,
    }],
  });

  try {
    const response = await client.execute(request);
    return NextResponse.json({
      id: response.result.id,
      uuid: order.uuid,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ error: 'Error creating order' });
  }
}


export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const body = await req.json();
  const { orderUUID, orderDetails } = body;

  const unescapedOrderDetails = orderDetails.replace(/\\"/g, '"');
  const parsedOrderDetails = JSON.parse(unescapedOrderDetails);

  const existingOrder = await prisma.order.findUnique({
    where: { uuid: orderUUID },
  });

  if (!existingOrder) {
    console.error(`Order with UUID ${orderUUID} not found.`);
    return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  interface OrderItem {
    name: string;
    quantity: number;
  }

  const items: OrderItem[] = parsedOrderDetails.items;
  const total = parsedOrderDetails.total;

  const digestString = items.map((item: OrderItem) => `${item.name}:${item.quantity}`).join('|') + `|${total}|${existingOrder.username}|${existingOrder.salt}`;
  const recalculatedDigest = crypto.createHash('sha256').update(digestString).digest('hex');

  if (existingOrder.digest !== recalculatedDigest) {
    console.error('Digest does not match. Order may have been tampered with.');
    return new NextResponse(JSON.stringify({ error: 'Order verification failed' }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const updatedOrder = await prisma.order.update({
    where: { uuid: orderUUID },
    data: { orderDetails: JSON.stringify(parsedOrderDetails) },
  });

  return new NextResponse(JSON.stringify({ message: 'Order confirmed', order: updatedOrder }), { status: 200, headers: { "Content-Type": "application/json" } });
}


export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const body = await req.json();
  const { orderUUID } = body;

  await prisma.order.delete({
    where: { uuid: orderUUID },
  });

  return NextResponse.json({ message: 'Order cancelled' });
}
