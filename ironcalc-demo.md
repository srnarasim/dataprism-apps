# PRP Template: Enhancing DataPrism-Apps Demo App with CSVUploader and IronCalc Plugin

This Product Requirements Prompt (PRP) defines requirements for upgrading the `dataprism-apps` suite to demonstrate a flagship demo application featuring the CSVUploader and IronCalc plugins from the official `dataprism-plugins` collection. The solution must strictly use available plugins, follow DataPrism’s modular architecture, and provide technical clarity and maintainability.

---

## 1. Objective

- Highlight DataPrism’s seamless integration of data ingestion, formula calculation (IronCalc), and browser-based visualization using only plugins from the `dataprism-plugins` suite.
- Empower users to upload large CSV datasets, perform Excel-like formula operations in-browser, and visualize results—all via plugin APIs.
- Serve as a canonical example of plugin orchestration and DataPrism architectural principles.

---

## 2. Scope

- Applies to the demo app in `dataprism-apps`.
- Requires use of `dataprism-plugin-csvuploader`, `dataprism-plugin-ironcalc`, and any other relevant plugins for the end-to-end workflow.
- Enhances documentation, onboarding, and code samples for proper plugin-based implementations.

---

## 3. Functional Requirements

### A. CSVUploader Integration

- Use `dataprism-plugin-csvuploader` for all file ingest flows.
- Must support at least 100,000-row uploads, detect headers, and allow custom column mapping.
- Plugin must handle validation: filetype, encoding, missing/duplicate columns, and basic data quality.
- All feedback, errors, and status updates must be surfaced in the demo UI via plugin events or callbacks.

### B. IronCalc Plugin Showcase

- All formula logic must exclusively route through `dataprism-plugin-ironcalc`.
- Support user creation and editing of formulas that reference CSV-imported columns.
- Demonstrate at least 180 Excel-compatible functions (SUM, IF, VLOOKUP, etc.).
- All formula evaluation is in-browser (WASM), with support for live data updates, error auditing, and derived columns.
- Any additional calculations must be implemented as IronCalc-compatible plugin extensions (if not already included).

### C. Plugin-Orchestrated Demo Flow

- Workflow steps:
  1. **Upload CSV** — via CSVUploader plugin.
  2. **Map & Validate Columns** — using CSVUploader’s API.
  3. **Preview/Edit Data** — leverage available DataPrism UI/plugin tools for data inspection.
  4. **Add Formulas** — invoke IronCalc’s formula API for cell/range/column calculations.
  5. **Visualize Results** — use DataPrism visualization plugins (if present), always referencing plugin APIs.
- All business logic, UI interactions, and computation must flow through official plugin APIs; no bespoke integrations.

### D. Extensibility and Compliance

- Only add new logic via the creation or extension of plugins, not by modifying core code.
- Ensure plugin manifest files, lifecycle management, and configuration match DataPrism architectural contracts.
- Any additional features (e.g., LLM-based helpers, error reporting) must integrate as plugins if such functionality is required.

### E. Documentation

- README and onboarding docs must:
  - Clearly specify which `dataprism-plugins` are used and why.
  - Describe the plugin integration points, configuration, and typical error scenarios.
  - Provide a sample dataset and tested formula configurations.
  - Include screenshots, UX walkthroughs, and troubleshooting guidance.

---

## 4. Non-Functional Requirements

- **Performance:** End-to-end upload to chart update under 5 seconds for 100k-row CSVs.
- **Security:** All operations (import, calculation, visualization) are local/browser-only—no backend data processing.
- **Extensibility:** New features only implemented as plugins or plugin extensions.
- **Cross-Browser:** Supported on Chrome, Firefox, Safari, and Edge (current and previous major versions).

---

## 5. Quality Assurance

- Automated tests verifying:
  - Plugin loading and API compliance.
  - CSV ingest, mapping, and validation.
  - IronCalc formula evaluation (accuracy, performance, error cases).
  - Visualization output correctness.
- Manual QA checklist for:
  - UI/UX (including mobile/responsive).
  - Onboarding documentation accuracy.
  - Integration with future plugin releases.

---

## 6. Deliverables

- Updated demo-app codebase in `dataprism-apps` using only official DataPrism plugins for core logic.
- Reference example CSVs and formulas.
- Enhanced documentation, including integration details for `dataprism-plugin-csvuploader` and `dataprism-plugin-ironcalc`.
- CI/CD pipeline coverage for all added or refactored functionality.

---

## 7. Success Criteria

- The demo delivers an upload → sculpt → calculate → visualize experience, strictly using plugin interfaces.
- Core features are implemented and extensible only through plugins.
- All documentation and code samples reference plugin usage, not hardcoded integrations.
- The app remains performant, robust, and maintainable as plugins are upgraded or new DataPrism plugins are released.

---

## 8. Example User Flow (Pseudo-code)

// Import CSV via plugin
await window.DataPrism.plugins.csvUploader.upload('large-file.csv');

// Map columns (plugin API)
await window.DataPrism.plugins.csvUploader.mapColumns({ Name: 'Customer', Amount: 'Total' });

// Add/modify formula using IronCalc plugin
await window.DataPrism.plugins.ironcalc.setFormula('TotalWithTax', 'Total * 1.08');
const results = await window.DataPrism.plugins.ironcalc.evaluate();

// Visualize results via visualization plugin
window.DataPrism.plugins.visualization.renderChart('bar', results, { x: 'Customer', y: 'TotalWithTax' });


---

## 9. How to Use This PRP

1. Copy this template into your `/PRPs` directory.
2. Tailor for UI and plugin integration based on current DataPrism plugin APIs.
3. Use with the DataPrism context engineering workflow to create actionable implementation and testing plans.
4. Document all plugin usage, decisions, and adherence to DataPrism architectural concepts.

