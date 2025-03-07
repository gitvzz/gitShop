# GitShop Shopping Process

This document describes in detail the complete shopping process of the GitShop platform, from browsing products to completing payment.

## Shopping Process Overview

GitShop's shopping process is based on various features of the GitHub platform, implementing a serverless e-commerce solution. The entire process includes: product browsing, shopping cart management, order submission, payment processing, and order confirmation.

## Detailed Process

### 1. Browsing Products

1. Users access the GitShop frontend page hosted on GitHub Pages
2. Browse the product list, filter by category or search for specific products
3. View product details, including price, description, images, etc.
4. View user reviews and ratings (if available)

### 2. Shopping Cart Management

1. Users select desired products and click the "Add to Cart" button
2. The system adds the product to the cart and displays the number of items on the cart icon
3. Users can continue shopping or go to the cart page
4. On the cart page, users can:
   - Adjust product quantities
   - Remove unwanted items
   - View product subtotals and total amount
   - View applicable discounts and promotions

### 3. Checkout Process

1. Users click the "Checkout" button on the cart page
2. If the cart contains physical products, the system requires users to fill in shipping information:
   - Recipient name
   - Contact phone number
   - Detailed address
   - Notes (optional)
3. The system encrypts sensitive user information using an RSA public key
4. The system generates an order summary, including:
   - Order number
   - Product list and quantities
   - Price subtotal
   - Discount amount
   - Final payment amount

### 4. Order Submission

1. The system integrates encrypted user information and order details into GitHub Issue content
2. Users click the "Submit Order" button, and the system guides them to create a new GitHub Issue
3. Issue title format: `Order: [Order Number]`
4. Issue content includes:
   - Order summary (plaintext)
   - Encrypted user information (such as shipping address)
   - Order creation time
   - Other necessary information

### 5. Payment Processing

1. After submitting the Issue, GitHub Actions automatically triggers the backend processing flow
2. The backend decrypts user information using the private key
3. The system generates a unique USDT payment address
4. GitHub Actions automatically replies to the Issue, providing:
   - USDT payment address
   - Payment amount
   - Payment QR code (if applicable)
   - Payment instructions

### 6. Payment Confirmation

1. Users transfer funds to the specified address using any wallet app that supports USDT
2. The backend monitoring system automatically detects payment status
3. After payment confirmation, GitHub Actions automatically updates the Issue status:
   - Changes Issue label from `pending-payment` to `paid`
   - Adds payment confirmation information to the Issue
   - Notifies the merchant of a new paid order via Telegram Bot

### 7. Order Processing

1. For digital products:
   - The system automatically replies with download links or activation codes in the Issue
   - Updates the Issue label to `completed`
   
2. For physical products:
   - The merchant processes the order after receiving notification
   - The merchant updates the Issue with shipping information after dispatch
   - Updates the Issue label to `shipped`

### 8. Order Completion

1. After receiving the product or service, users can leave feedback in the Issue
2. The merchant can reply to user questions or thank users for their purchase
3. When the order is fully processed, the Issue can be closed and marked as `closed`

## Distribution Process

If users access the store through a distribution link:

1. The system automatically identifies the distribution code
2. Records distribution information during order processing
3. After payment confirmation, the system automatically calculates distribution commission
4. Commission information is recorded in the system and paid to distributors at appropriate times

## Exception Handling

### Payment Timeout

1. If users do not complete payment within the specified time (usually 24 hours):
   - The Issue will be marked as `payment-timeout`
   - Users can request regeneration of payment information in the Issue

### Order Cancellation

1. Users can cancel orders before payment by closing the Issue
2. For paid orders that need to be cancelled, users need to negotiate with the merchant in the Issue

### Refund Process

1. If a refund is needed, users can submit an application in the Issue
2. After review, the merchant can refund the amount to the user's wallet address via USDT
3. After the refund is completed, the Issue will be marked as `refunded`

## Security Considerations

- All sensitive information (such as shipping address, contact information) is encrypted using RSA
- Encrypted data can only be decrypted by merchants holding the private key
- The payment process is conducted through blockchain, ensuring transparency and immutability
- Users can ensure the authenticity of orders through GitHub's authentication mechanism

## Summary

GitShop's shopping process fully utilizes the features of the GitHub platform, creating a secure, transparent, and efficient e-commerce experience. By combining encryption technology and blockchain payments, it ensures the security of user information and the reliability of transactions. 