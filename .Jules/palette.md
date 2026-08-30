## 2026-08-26 - Added ARIA labels for Screen Readers
**Learning:** Found several icon-only links/buttons (e.g. Call Us dial link, Close Modal button) that were inaccessible to screen reader users because they lacked proper aria-labels.
**Action:** Applied `aria-label` attributes to icon-only buttons to ensure they have an accessible name, making the application much more accessible without altering visual styles.

## 2026-08-30 - Added ARIA Pressed state to Custom Toggle Chips
**Learning:** Discovered that custom UI components (like the prayer category chips) acting as toggle buttons or mutually exclusive selectors need dynamic `aria-pressed` attributes to communicate their selected/unselected state to screen readers.
**Action:** Applied static `aria-pressed` attributes in HTML and dynamically updated them via JavaScript when the state changes.
