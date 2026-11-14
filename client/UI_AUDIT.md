# VayuSetu (वायुसेतु) UI/UX Comprehensive Audit

**Date:** November 2026  
**Subject:** Frontend Architecture, Visual Design, Accessibility, and Responsiveness Review  
**Target:** Transformation into an award-winning, editorial "Civic-Tech" platform.

---

## 1. Component Inventory & Existing Architecture

The existing client is built with React 18, Vite, Lucide icons, and Leaflet. Below is the full audit of current components:

| Component | Current Role | Visual Style | State Handling |
| :--- | :--- | :--- | :--- |
| **`Header.jsx`** | Top navigation bar, report picker, status badge, action triggers | Ad-hoc flexbox, hardcoded inline CSS | Relies on parent props, no sticky mobile menu |
| **`DataQualityCard.jsx`** | Data health gauge, usability counters, priority hotspots | CSS variables + inline colors | Basic props, no animated count-up |
| **`AirQualityMap.jsx`** | Leaflet station map with CPCB band markers | Standard OSM tiles | Basic click-to-cite, no cluster or time scrubber |
| **`FindingsList.jsx`** | Observed hotspots, data gaps, hypotheses | Custom tab pill buttons | Inline tab state, lacks skeleton loaders |
| **`ActionTracker.jsx`** | 3-column Kanban board for civic playbooks | Fixed grid, inline styles | In-place status updates, lacks drag-and-drop |
| **`DocumentStudio.jsx`** | Briefing note and citizen advisory generation | Split controls + preview | Ad-hoc text display, no live streaming A4 paper layout |
| **`ComparisonView.jsx`** | Multi-report temporal deltas | Table + text diff | Basic delta arrows, lacks sparkline chart |
| **`ReadingsTable.jsx`** | Raw & normalized readings ledger | Standard HTML table | Client-side search & filter, lacks virtualization |
| **`EvidenceDrawer.jsx`** | Slide-over drawer showing raw row evidence | Fixed overlay, inline styles | Esc key closes, lacks focus trap & tabbed lineage |
| **`UploadModal.jsx`** | File upload, text paste, sample selector | Standard modal popup | Drag-and-drop file handler, basic progress |
| **`TableInterpretationPanel.jsx`**| Two-pass column mapping & manual overrides | White card with table dropdowns | Local override state, Save button |
| **`AIWorkbenchDrawer.jsx`** | 7-agent pipeline execution & telemetry trace | Dark slide-over drawer | Expandable JSON inspector |
| **`GroundedChat.jsx`** | RAG assistant grounded in readings | Chat bubble list | Standard text input, lacks voice & streaming |

---

## 2. Page States Audit (Loading, Empty, Error, Success)

1. **Loading States**:
   - Currently uses button text swaps (`'Analyzing with Grounding...'`, `'Generating Playbook Actions...'`) or small CSS spinners (`.spin`).
   - Missing unified **Skeleton Shimmer Screens** for cards, tables, maps, and document previews.
2. **Empty States**:
   - Empty lists render plain muted text (`'No active tasks'`, `'No completed tasks yet'`).
   - Lacks engaging illustration-style empty states with 1-click calls-to-action (e.g., "Load Bhopal Sample Data").
3. **Error Handling**:
   - Relies heavily on native browser `alert(...)` popups (`alert('Analysis failed: ' + err.message)`), which jar the user experience and break mobile interfaces.
   - Missing dedicated **ErrorState cards** with retry buttons and recovery paths.
4. **Success Feedback**:
   - Action status changes and column remaps update silently without reassuring **Toast notifications**.

---

## 3. Visual Design, Color, Spacing & Typography Deficits

- **Design Language**:
  - Currently feels like an engineer's internal dashboard rather than a calm, trustworthy, award-winning editorial civic product.
  - Lacks the serene **warm off-white (`#F7F5F0`)** background and **deep ink (`#10201C`)** typography, paired with **teal-green primary (`#0F766E`)**.
  - Lacks a full **Dark Mode** toggle and theme token system.
- **Typography**:
  - Headings use generic sans-serif fallbacks (`Inter`, system fonts) instead of distinguished editorial display typography (**Space Grotesk** / **Fraunces**).
  - Indian scripts (Hindi, Marathi, Tamil) lack dedicated font stacks (**Noto Sans Devanagari**).
- **Cards & Depth**:
  - Border radii vary inconsistently (`0.25rem`, `0.375rem`, `0.5rem`, `1rem`, `2xl`).
  - Lacks consistent **16px border-radius**, **1px hairline borders**, soft layered shadows, subtle civic grain texture, and an atmospheric haze effect responding to the current AQI band.
- **AQI Color-Blind Safety**:
  - Color bands are sometimes presented as raw color pills without persistent accompanying icons and textual labels.

---

## 4. Accessibility (a11y) & WCAG AA Deficits

- **Keyboard Navigation**:
  - Custom buttons and selects lack clear `focus-visible:ring-2` focus rings.
  - Modals and drawers do not trap keyboard focus or return focus on dismissal.
- **ARIA Semantics**:
  - Custom tabs in `FindingsList` and `ActionTracker` use raw `<button>` elements without `role="tab"`, `aria-selected`, or `aria-controls`.
  - Drawers lack `role="dialog"` and `aria-modal="true"`.
- **Screen Reader Announcements**:
  - Dynamic async updates (like analysis generation or column remapping) lack `aria-live="polite"` regions.

---

## 5. Mobile & Responsive Breakages

- **Header**: At widths `< 768px`, the report selector, status pill, and action buttons wrap into three cluttered rows.
- **Kanban Action Board**: Three columns squish together on mobile screens (`< 640px`) making text unreadable; needs a horizontal snap carousel or list toggle.
- **Data Table**: Wide columns cause horizontal scrolling without freeze-pane for Row ID and Station Name.
- **Navigation Tabs**: Horizontal scrolling bar lacks touch-friendly momentum or a dedicated mobile bottom bar.

---

## 6. Action Plan & Foundation Upgrade

1. **Design Tokens & Tailwind Configuration**:
   - Install and configure Tailwind CSS, PostCSS, Autoprefixer.
   - Define CSS variables for palette (`#F7F5F0`, `#10201C`, `#0F766E`), CPCB AQI bands, type scale, hairline borders, and elevation shadows.
2. **Unified UI Component Library (`client/src/components/ui/`)**:
   - `Button`, `Card`, `Badge`, `AQIBadge`, `ConfidenceBadge`, `Tabs`, `Drawer`, `Modal`, `Tooltip`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `DataTable`, `Stepper`, `ProgressRing`, `LanguageSwitcher`.
3. **App Shell & Routing**:
   - Implement collapsible sidebar, top bar with search, command palette (Ctrl+K), and mobile bottom tab bar.
4. **Preserve Invariants**:
   - Maintain 100% compatibility with existing backend API endpoints (`/api/reports`, `/api/pipeline`, `/api/remap`, `/api/compare`, etc.).
