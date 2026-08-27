## 2026-08-26 - Added ARIA labels for Screen Readers
**Learning:** Found several icon-only links/buttons (e.g. Call Us dial link, Close Modal button) that were inaccessible to screen reader users because they lacked proper aria-labels.
**Action:** Applied `aria-label` attributes to icon-only buttons to ensure they have an accessible name, making the application much more accessible without altering visual styles.
