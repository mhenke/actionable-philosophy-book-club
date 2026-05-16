# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: path-validator.spec.js >> isSafeRepoPath — valid paths >> accepts: docs/design-principles.md
- Location: tests/path-validator.spec.js:19:9

# Error details

```
Error: page.evaluate: TypeError: window.isSafeRepoPath is not a function
    at eval (eval at evaluate (:302:30), <anonymous>:1:13)
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - heading "A Philosophy of Software Design" [level=1] [ref=e5]
        - generic [ref=e6]: John Ousterhout
    - main [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Meeting 02 • Next Session
            - heading "Deep Modules & Complexity Sink" [level=2] [ref=e13]
          - generic [ref=e14]: Upcoming
        - generic [ref=e15]:
          - paragraph [ref=e16]: Key Takeaway
          - paragraph [ref=e17]:
            - text: "\"A well-designed module is a"
            - strong [ref=e18]: complexity sink
            - text: ": it takes on internal implementation suffering so the rest of the system can stay simple.\""
        - generic [ref=e19]:
          - link "View Agenda & Discussion Guide" [ref=e20] [cursor=pointer]:
            - /url: "#p=meetings/meeting-02/README.md"
            - text: View Agenda & Discussion Guide
            - img [ref=e21]
          - generic [ref=e23]:
            - paragraph [ref=e24]: Upcoming Materials
            - generic [ref=e25]:
              - generic [ref=e26]:
                - generic [ref=e27]: 📊
                - generic [ref=e28]:
                  - paragraph [ref=e29]: Slide Deck
                  - paragraph [ref=e30]: Ready before meeting
              - generic [ref=e31]:
                - generic [ref=e32]: 🎬
                - generic [ref=e33]:
                  - paragraph [ref=e34]: Video Recording
                  - paragraph [ref=e35]: Ready after meeting
      - heading "The Archive" [level=3] [ref=e37]: The Archive
      - generic [ref=e39]:
        - heading "Knowledge Base" [level=3] [ref=e40]: Knowledge Base
        - generic [ref=e42]:
          - link "Glossary" [ref=e43] [cursor=pointer]:
            - /url: "#p=docs/glossary.md"
            - generic [ref=e44]: 📚
            - generic [ref=e45]: Glossary
          - link "Principles" [ref=e46] [cursor=pointer]:
            - /url: "#p=docs/design-principles.md"
            - generic [ref=e47]: ⚖️
            - generic [ref=e48]: Principles
          - link "AI Prompts" [ref=e49] [cursor=pointer]:
            - /url: "#p=templates/prompts/README.md"
            - generic [ref=e50]: 🤖
            - generic [ref=e51]: AI Prompts
          - link "Inbox" [ref=e52] [cursor=pointer]:
            - /url: "#p=meetings/meeting-99-new/README.md"
            - generic [ref=e53]: 📂
            - generic [ref=e54]: Inbox
  - contentinfo [ref=e55]:
    - paragraph [ref=e56]: Actionable Philosophy Book Club • Spare Time Excellence • 2026
```