# PRP Template: Demo App Integrating MCP and LangGraph Plugins in DataPrism

This Product Requirements Prompt (PRP) defines a demonstration scenario and requirements for a DataPrism demo app that showcases the orchestration of agentic analytics workflows using both Model Context Protocol (MCP) and LangGraph plugins. The demo app illustrates how DataPrism can leverage the MCP ecosystem for tool interoperability and use LangGraph for defining, composing, and tracing multi-agent LLM-driven workflows.

---

## 1. Objective

- Create an interactive demo app that leverages DataPrism's MCP and LangGraph plugins to deliver an intelligent, agentic analytics experience.
- Demonstrate how external MCP tools/services can be orchestrated with DataPrism-native plugins using graph-based agent workflows.
- Provide a canonical, extensible example for plugin orchestration, context traceability, and agentic analytics in the DataPrism platform.

---

## 2. Demo Scenario Overview

**Workflow Title:** Automated Sales Data Quality and Insight Agent

- **User Story:**  
  A business analyst uploads monthly sales data. The demo app (through orchestrated agents) validates the data, enriches it using an external MCP tool (e.g., entity/enrichment API), runs spreadsheet calculations via the IronCalc plugin, and finally generates a visual summary and actionable insights for the analyst.

- **Key Steps:**
  1. Data upload & schema validation (CSVUploader + validation plugin)
  2. External enrichment using MCP tool (e.g., product categorization)
  3. Spreadsheet logic / calculations (IronCalc plugin)
  4. Chart generation (visualization plugin)
  5. Business insight/summary generation (LLM node)
  6. Interactive audit log, with full workflow display and agent step traces

---

## 3. Functional Requirements

### A. MCP Plugin Integration
- Register the demo app as an MCP client to securely connect to a remote MCP server.
- Discover and invoke remote MCP tools (e.g., enrichment, validation, summarization) from within the agent workflow.
- Surface available external tools dynamically in the demo UI.

### B. LangGraph Plugin Orchestration
- Build agentic workflows as directed graphs using LangGraph, with nodes defined for:
  - DataPrism plugin actions (CSVUploader, IronCalc, visualization, etc.)
  - MCP remote tool invocation
  - LLM prompt/response steps (with model configuration)
  - Human-in-the-loop review or correction
- Allow users to trace, replay, and debug workflow execution (showing node states/paths and results in the UI)[12][6][15].

### C. Demo App UX
- Step-by-step guided flow ("wizard" interface) for: upload → enrich → calculate → visualize → summarize.
- Visual graph and log of the agent workflow showing branch choices, tool calls, and outcomes.
- Error handling: UI highlights issues at the step/node level and suggests remediation.

### D. Extensibility
- All major functionality (data ingest, validation, enrichment, formulas, visualization) must be implemented via official plugins.
- External MCP tools and LangGraph workflow definitions can be dynamically updated/configured (demo extension points).

---

## 4. Non-Functional Requirements

- **Performance:** Complete run (100k-row CSV) must remain interactive; each step should complete in <10 seconds.
- **Security:** External MCP interaction is authenticated and sandboxed. No data or code leakage; permissions managed per DataPrism/user context.
- **Observability:** Full workflow audit trail and node state traceability.
- **Cross-Browser:** Chrome, Firefox, Safari, and Edge supported.
- **Plugin Standards:** All extensions comply with DataPrism plugin API, context engineering standards, and lifecycle events.

---

## 5. Quality Assurance

- Automated tests for: agent graph creation, step execution, MCP calls, error handling, human-in-the-loop UI.
- Manual walkthrough covering success, edge (invalid data, network loss), and recoverable error cases.
- Integration/interop tests with at least one real MCP server exposing public tools.

---

## 6. Deliverables

- Source code for the demo app, featuring orchestrated MCP and LangGraph plugins in workflows.
- Example configuration files and templates (for workflow/graph and MCP server/tool endpoints).
- Sample data sets (CSV) and scenario walk-through guides.
- Documentation with usage instructions, screenshots, and troubleshooting.
- CI pipeline covering tests, linting, and plugin lifecycle checks.

---

## 7. Success Criteria

- App demonstrates a seamless, multi-step analytics workflow involving both DataPrism and external MCP tools.
- Agent/graph workflow is visible, inspectable, and interactive, with stepwise traceability.
- Users can adapt or extend the demo by adding MCP servers/tools and customizing graph logic—without changes to core app logic.
- All features implemented via modular plugins and adhering to DataPrism architecture and context engineering methods.
- The demo app should be showcased in the github pages as a new app like the other apps.`

---

## 8. Example User Flow (Pseudo-code)

// Step 1: Upload data
await window.DataPrism.plugins.csvUploader.upload('sales.csv');

// Step 2: Validate schema with plugin
await window.DataPrism.plugins.validator.validateSchema('sales.csv');

// Step 3: Enrich with MCP tool via LangGraph node
await window.DataPrism.plugins.langgraph.runNode('enrich', {
tool: {type: 'mcp', server: 'https://remote.mcpserver.com', tool: 'entity-enrich'},
data: 'sales.csv'
});

// Step 4: Calculate new fields via IronCalc
await window.DataPrism.plugins.ironcalc.setFormula('RevenueUSD', 'Amount * Rate');
const results = await window.DataPrism.plugins.ironcalc.evaluate();

// Step 5: Visualize with plugin
window.DataPrism.plugins.visualization.renderChart('bar', results, { x: 'Region', y: 'RevenueUSD' });

// Step 6: Summarize insights via LLM node
const summary = await window.DataPrism.plugins.langgraph.runNode('summarize', {
model: 'openai/gpt-4o',
input: results
});


---

## 9. How to Use This PRP

1. Copy this template to your `/PRPs` directory in the codebase.
2. Tailor plugin and workflow steps for your use case and available DataPrism plugins/tools.
3. Use context engineering and versioning to track requirements and implementation.

