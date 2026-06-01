# API Friction Checklist

Piccioni's usability tokens mapped to structural root causes and prescriptive fixes:

| Usability Token | Structural Friction | Remediation |
|---|---|---|
| **Miss Token** | Undocumented REST endpoints leading to discovery failure | Enforce OpenAPI autogeneration. Every endpoint surfaces in the developer's IDE from a central spec. No discovery blind spots. |
| **Surprise Token** | Type-unsafe parameters or implicit state transition assumptions | Strict compile-time contracts. Replace raw JSON with encapsulated schema validation before compilation. |
| **Choice Token** | Redundant entry points or poorly structured service paths | Prune to exactly one public gateway interface per bounded context. Hide alternatives behind module boundaries. |
