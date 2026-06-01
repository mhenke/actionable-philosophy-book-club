# Test file for tokenization
class OrderStateManager:
    MAX_RETRY_COUNT = 3
    payment_intent_id = "pi_123"
    kebab-case-identifier = "test"

    def get_payment_amount(self, order_id):
        return calculatePaymentTotal(order_id, self.MAX_RETRY_COUNT)
