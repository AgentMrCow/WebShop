# Webshop Phase 3

## Overview

This project implements a dynamic, interactive web-based shopping platform with a focus on enhancing the user experience through seamless shopping list management without requiring page reloads. The implementation leverages a cart context to facilitate real-time updates to the shopping cart.

## Key Features

- **Dynamic Shopping Cart**: Utilizes a cart context to enable real-time additions, updates, and deletions within the shopping cart without necessitating page reloads.
- **Product Management**:
  - Products can be added to the cart with a single click on the "Add to Cart" button.
  - If a product is added multiple times, it is represented as a single item in the cart with an adjustable quantity.
- **Cart Functionality**:
  - Users can modify the quantity of each item directly within the cart using input fields and increment/decrement buttons.
  - The shopping cart contents, including product IDs and quantities, are stored in the browser's localStorage for persistence.
  - Product names and prices are fetched from the server using the product ID.
  - The total cart amount is calculated and displayed client-side.
- **Cart Restoration**: Upon page reload, the shopping cart's state is restored using stored data from localStorage.
- **Infinite Scroll**: Implemented on the main product browsing page to facilitate seamless product discovery.
- **Optimization**: Utilizes `next/image` for optimized and lazy-loaded images, enhancing page load performance.

## Implementation Details

### Cart Context

The cart context (`CartContext.tsx`) manages the state and interactions of the shopping cart, encapsulating logic for adding items, updating quantities, and storing cart data in localStorage.

### Components

- **Header (`header.tsx`)**: Incorporates navigation and direct access to the shopping cart and user login page.
- **Shopping Cart (`ShoppingCart.tsx`)**: Displays the items in the cart, allowing users to adjust quantities or remove items, with real-time updates to the total amount.
- **Add To Cart Button (`AddToCartButton.tsx`)**: Enables users to add products to the cart, with logic to handle duplicates by updating quantities.
- **Quantity Selector (`QuantitySelector.tsx`)**: Provides a UI for users to adjust the quantity of cart items, supporting both manual input and increment/decrement actions.

## Setup and Configuration

- Ensure all dependencies are installed by running `npm install`.
- Start the development server with `npm run dev` or `npm run build` + `npm start`
- Access the application via `http://localhost:3000` or the configured port.

## Deployment

The application is deployed on an AWS EC2 instance, accessible at [http://s24.ierg4210.ie.cuhk.edu.hk/](http://s24.ierg4210.ie.cuhk.edu.hk/). The domain is configured to point to the EC2 instance's Elastic IP [http://52.203.52.33/](http://52.203.52.33/), ensuring seamless access to the deployed application.

### Nginx Configuration

The `nginx.conf` file is configured to serve the application efficiently, with specific rules for static file caching and proxying requests to the Next.js server. No further changes are required post-domain setup, as the application is fully functional and accessible via the provided domain.