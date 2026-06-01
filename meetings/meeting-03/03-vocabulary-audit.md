# Vocabulary Audit

Run this on two supposedly decoupled services in your own codebase to find hidden semantic coupling.

## Steps

1. **Extract the nouns.** Scrape public interfaces, variable names, and comments from both services. Strip programming keywords and stop words.
2. **Calculate overlap.** Treat each collection as a set. Compute their intersection.
3. **Identify silent coupling.** A high density of shared domain terms (e.g., `OrderState`, `PaymentIntent`, `FulfillmentStatus`) without any `import` dependency between services means you have discovered a hidden ley line.
4. **Formalize the contract.** Force both teams to encode the shared vocabulary into an explicit schema. A shared protobuf definition, a JSON Schema contract, or a published type package. The format matters less than the act of making it visible and versioned.
