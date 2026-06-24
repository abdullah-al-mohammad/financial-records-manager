# Implementation Plan - Merchant Billing, Themes, and Outstanding Dues

This plan outlines the changes to add a date-range statement generator and printer for merchants, a premium Dark/Light/Auto theme switcher, and displays for previous month outstanding due bills.

## User Review Required

We will make the following major changes:
1. **Dynamic Theme Custom Properties**: Overwrite standard Tailwind CSS slate colors dynamically in `index.css` based on the active theme (`light` or `dark`). This gives us a perfect Light Mode, Dark Mode, and Auto Mode without manual layout rewrites in React.
2. **Conditional Print Styling**: Introduce a `body.print-report-only` CSS class that hides the application shell and statement side drawer when printing a merchant statement, displaying only the professional print layout.
3. **Previous Month Outstanding Dues**:
   - Add a list on the **Dashboard** displaying each merchant and their outstanding dues from the previous month.
   - Add a list in the **Merchant Billing Manager** cycles displaying outstanding dues prior to the selected billing month.

---

## Proposed Changes

### Styling & Theme Configuration

#### [MODIFY] [index.css](file:///d:/ab/financial%20record/src/index.css)
- Define custom properties for theme colors (`--bg-app-color`, `--bg-sidebar-color`, glassmorphism, radial gradients).
- Define dynamic Tailwind CSS color overrides under `:root[data-theme='light']` to automatically adapt hardcoded tailwind classes (e.g. `bg-slate-950`, `text-slate-400`, `border-slate-800`).
- Ensure primary buttons and indicators remain high-contrast by resetting `--color-white` to `#ffffff` inside elements like `.bg-indigo-600` or `.bg-gradient-to-tr`.
- Add printing styles to format the merchant statement cleanly for paper or PDF export.

---

### Core Shell & Navigation

#### [MODIFY] [App.jsx](file:///d:/ab/financial%20record/src/App.jsx)
- Implement stateful theme toggle support: load active theme (`dark`, `light`, or `auto`) on mount from `localStorage`.
- Observe system preferences for the `auto` option using `window.matchMedia`.
- Set `data-theme` attribute on the root HTML element.
- Pass theme state down to `Sidebar.jsx`.

#### [MODIFY] [Sidebar.jsx](file:///d:/ab/financial%20record/src/components/Sidebar.jsx)
- Import `Sun`, `Moon`, and `Monitor` icons from `lucide-react`.
- Add a premium Theme Selector UI block at the bottom of the sidebar.

---

### Dashboards & Billing Management

#### [MODIFY] [Dashboard.jsx](file:///d:/ab/financial%20record/src/components/Dashboard.jsx)
- Calculate the previous month's outstanding dues for each merchant (based on date bounds and cycle month).
- Update the layout grid to a 3-column configuration on desktop.
- Add a beautiful card listing all merchants with active outstanding dues from the previous month.

#### [MODIFY] [BillingManager.jsx](file:///d:/ab/financial%20record/src/components/BillingManager.jsx)
- Add a "Previous Month's Outstanding Dues" side summary card listing all merchants.
- In the "Focused Merchant" statement drawer:
  - Add start and end date range selector inputs.
  - Filter invoices and payments lists dynamically based on the date range.
  - Calculate period-specific totals (Billed, Paid, and Period Balance).
  - Add a "Print Report" action button.
- Add a hidden `.printable-report-area` block at the bottom of the layout, structured for high-quality printing.

---

## Verification Plan

### Automated Tests
- Run `npm run build` or Vite build validation commands (if available) to ensure there are no compilation or JSX errors.

### Manual Verification
- **Theme switching**:
  1. Toggle Light, Dark, and Auto themes from the sidebar.
  2. Verify sidebar, main dashboard, tables, and inputs change colors beautifully.
  3. Change system preferences and verify Auto Mode updates accordingly.
- **Outstanding Dues**:
  1. Select a month in Billing Manager and check the "Previous Month Outstanding Dues" list.
  2. Go to the Dashboard and verify the list matches the calculated prior balances.
- **Merchant Billing Dates & Printing**:
  1. Open a merchant statement drawer.
  2. Select a date range (e.g. `2026-01-26` to `2026-07-06`).
  3. Verify that the table updates to display only orders within that range.
  4. Click "Print Report" and verify the browser print preview shows only the clean invoice layout.
