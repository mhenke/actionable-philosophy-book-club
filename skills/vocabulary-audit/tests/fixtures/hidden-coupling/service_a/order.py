# Service A - Order Management
class OrderService:
    def create_order(self, user_id: int, items: list) -> OrderState:
        if not items:
            raise ValueError("Order must have items")
        return OrderState.PENDING

    def process_payment(self, payment_intent_id: str) -> None:
        # Validate PaymentIntent before charging
        PaymentGateway.charge(payment_intent_id)

    def fulfill_order(self, order_id: int) -> FulfillmentStatus:
        return FulfillmentStatus.SHIPPED
