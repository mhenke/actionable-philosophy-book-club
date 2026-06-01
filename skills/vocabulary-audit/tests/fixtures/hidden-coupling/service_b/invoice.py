// Service B - Invoice Management
const orderStates = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled"
};

function generateInvoice(orderId, paymentIntentId) {
    // Use payment intent to generate invoice
    const payment = PaymentIntent.findById(paymentIntentId);
    return {
        orderState: orderStates.PENDING,
        amount: payment.amount,
        fulfillmentStatus: "pending"
    };
}

async function notifyFulfillment(orderId, fulfillmentStatus) {
    await NotificationService.send(orderId, fulfillmentStatus);
}
