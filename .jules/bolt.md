## 2024-05-24 - [SiteHeader Scroll Event Optimization]
**Learning:** Calling React state dispatchers repeatedly on high-frequency events like scroll causes unnecessary internal execution overhead, even if React bails out due to unchanged values.
**Action:** Use a local variable inside the `useEffect` scope to track the boolean state and only call the state dispatcher when the value actually transitions.
