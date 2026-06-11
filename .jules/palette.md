## 2025-03-01 - Explicit Labels for Payment Wizard Accessibility
**Learning:** In the payment wizard (`payment-step.tsx`), input fields used placeholders but lacked explicit `label` elements (`htmlFor`/`id` mapping). Screen readers heavily rely on `label`s rather than `placeholder` attributes to convey form context.
**Action:** When creating new form inputs or reviewing existing ones, always ensure a `<label htmlFor="fieldId">` is explicitly linked to `<input id="fieldId">`. Don't rely solely on visual placeholders.
