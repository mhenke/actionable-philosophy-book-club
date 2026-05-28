# Supplement 1: API Design & Information Hiding

> Information Hiding scales from a single module secret to an organizational contract. When it fails, the cost shows up in error rates, not elegance.

## The API Friction Checklist

Piccioni's usability tokens mapped to structural root causes and prescriptive fixes:

| Usability Token | Structural Friction | Remediation |
|---|---|---|
| **Miss Token** | Undocumented REST endpoints leading to discovery failure | Enforce OpenAPI autogeneration. Every endpoint surfaces in the developer's IDE from a central spec. No discovery blind spots. |
| **Surprise Token** | Type-unsafe parameters or implicit state transition assumptions | Strict compile-time contracts. Replace raw JSON with encapsulated schema validation before compilation. |
| **Choice Token** | Redundant entry points or poorly structured service paths | Prune to exactly one public gateway interface per bounded context. Hide alternatives behind module boundaries. |

## The Closed-Laptop Synchronization Pattern

When downstream microservice changes introduce cross-team friction, trigger an immediate **Closed-Laptop Architecture Review**:

1. Domain experts from both teams enter a room (physical or virtual).
2. **All laptops remain closed.** No code, no debugger, no terminal.
3. Align on first principles: what is the contract, what changes, what breaks.
4. Only after verbal alignment do laptops open for implementation.

**Why it works:** Prevents teams from hiding behind incomplete code fixes and forces agreement on the interface before anyone touches implementation. Formalized from Stripe's "Links" conference room habit.

## The Useful Fiction of the Stream Abstraction

```java
while ((n = input.read(buf)) > 0) {
    output.write(buf, 0, n);
}
```

This loop is readable only because the `InputStream` model aggressively flattens hardware reality. Beneath it: file system interrupts, spinning disks, page caches, DMA transfers, buffer alignment constraints. The abstraction succeeds because it hides exactly the right complexity. The moment performance demands expose this fiction (see Supplement 3), the abstraction must collapse to direct buffer management.
