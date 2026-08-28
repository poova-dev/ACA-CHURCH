## 2026-08-26 - Added ARIA labels for Screen Readers
**Learning:** Found several icon-only links/buttons (e.g. Call Us dial link, Close Modal button) that were inaccessible to screen reader users because they lacked proper aria-labels.
**Action:** Applied `aria-label` attributes to icon-only buttons to ensure they have an accessible name, making the application much more accessible without altering visual styles.
## 2024-05-24 - Custom Toggle Accessibility
**Learning:** Custom UI toggles built with `div` wrappers miss out on native accessible naming and easy hit targets. Using a semantic `<label>` to wrap both the descriptive text and the visually hidden `<input type="checkbox">` automatically provides the accessible name to screen readers without needing extra `aria-labelledby` or `id` attributes. It also increases the click target to the entire wrapper row, vastly improving touch UX on mobile.
**Action:** When building custom checkboxes or toggles, always default to wrapping the entire control and its descriptive text in a `<label>` element. Ensure `focus-visible` states are applied to the visual representation of the toggle to preserve keyboard navigation clarity.
