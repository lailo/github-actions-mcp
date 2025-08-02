import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import workflows from "./tools/get-workflows"
import workflowRuns from "./tools/get-workflow-run"
import jobTiming from "./tools/get-job-timing"
import analyzeWorkflowRun from "./tools/analyze-workflow-run"
import getRepositories from "./tools/get-repositories"

const server = new McpServer({
  name: "github-actions-mcp",
  version: "1.0.0",
})

server.tool(
  workflows.name,
  workflows.description,
  workflows.inputSchema.shape,
  workflows.handle
)

server.tool(
  workflowRuns.name,
  workflowRuns.description,
  workflowRuns.inputSchema.shape,
  workflowRuns.handle
)

server.tool(
  jobTiming.name,
  jobTiming.description,
  jobTiming.inputSchema.shape,
  jobTiming.handle
)

server.tool(
  analyzeWorkflowRun.name,
  analyzeWorkflowRun.description,
  analyzeWorkflowRun.inputSchema.shape,
  analyzeWorkflowRun.handle
)

server.tool(
  getRepositories.name,
  getRepositories.description,
  getRepositories.inputSchema.shape,
  getRepositories.handle
)

try {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("GitHub Actions MCP Server running on stdio")
} catch (error) {
  console.error("Fatal error in main():", error)
  process.exit(1)
}
