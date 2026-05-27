# Meeting 03: Code Review Anchors

Review these patterns alongside your reading to prepare for the code-review segment.

---

### Anchor A: The Deep Module Triumph

```java
String content = Files.readString(Path.of("production_log.txt"));
```

The caller is entirely insulated from encoding charsets, buffer allocation loops, native OS-specific system calls, resource leak protections, and file-handle state tracking.

### Anchor B: The Shallow Enterprise Pass-Through

```text
Controller --> Service --> Manager --> Repository --> Adapter --> DAO
```

Each layer absorbs zero complexity -- purely shallow conduits forwarding parameters and inflating class counts.

### Anchor C: The I/O Performance Tradeoff

```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream("file.dat"));
FileChannel channel = FileChannel.open(Path.of("file.dat"));
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 4);
```

Pattern 1 optimizes for readability. Pattern 2 achieves zero-copy performance with manual buffer management.

### Anchor D: Exception-as-Control-Flow

```java
try {
    return Integer.parseInt(userInput);
} catch (NumberFormatException e) {
    return -1;
}
```

Cognitively straightforward, but the JVM must pause execution, freeze the thread state, capture the stack trace, and unwind the execution pipeline.

### Anchor Evolved: The Third-Party Volatility Boundary

```java
public class PaymentGateway {
    private final StripeEngine internalEngine;

    public PaymentGateway(StripeEngine internalEngine) {
        this.internalEngine = internalEngine;
    }

    public Optional<TransactionReceipt> charge(Invoice invoice, PaymentToken token) {
        try {
            var stripeParams = MapToStripe.buildParams(invoice, token);
            var intent = internalEngine.executeWithRetry(stripeParams);
            return Optional.of(new TransactionReceipt(intent.getId(), invoice.getId()));
        } catch (Exception e) {
            System.getLogger("Payments").log(System.Logger.Level.ERROR, "Transaction failed internally", e);
            return Optional.empty();
        }
    }
}
```

Completely isolates volatile external vendor changes -- swap Stripe for PayPal tomorrow without changing caller code.
