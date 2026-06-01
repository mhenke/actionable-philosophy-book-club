// Service B - Invoice Management
const orderStates = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled"
};

function generateInvoice(orderId, paymentIntentId) {
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

// Export for service_a to use
module.exports = { generateInvoice, notifyFulfillment };
