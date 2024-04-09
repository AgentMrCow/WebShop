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
  const items: CartItem[] = body.items;
  const totalValue = body.total;
  const invoiceId = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const username = session?.user?.email ?? "Guest";

  const digestString = items.map((item: CartItem) => `${item.name}:${item.quantity}`).join('|')
    + `|${totalValue}|${username}|${salt}`;
  const digest = crypto.createHash('sha256').update(digestString).digest('hex');

  const order = await prisma.order.create({
    data: {
      uuid: invoiceId,
      username,
      digest,
      salt,
    },
  });

  const purchase_units = items.map(item => ({
    name: item.name,
    quantity: item.quantity.toString(),
    unit_amount: item.unit_amount,
    category: item.category,
  }));

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: totalValue.toString(),
        breakdown: {
          item_total: {
            currency_code: "USD",
            value: totalValue.toString(),
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

  const existingOrder = await prisma.order.findUnique({
    where: { uuid: orderUUID },
  });

  if (!existingOrder) {
    console.error(`Order with UUID ${orderUUID} not found.`);
    return NextResponse.json({ error: 'Order not found' });
  }

  const updatedOrder = await prisma.order.update({
    where: { uuid: orderUUID },
    data: { orderDetails },
  });

  return NextResponse.json({ message: 'Order confirmed', order: updatedOrder });
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
