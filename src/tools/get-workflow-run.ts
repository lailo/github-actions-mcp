import { z } from "zod"
import { octokit } from "../libs/octokit"

const name = "get_workflow_runs"
const description =
  "Get workflow runs for a specific workflow, with optional filtering by status and conclusion"

const inputSchema = z.object({
  owner: z.string().describe("GitHub repository owner"),
  repo: z.string().describe("GitHub repository name"),
  workflow_id: z
    .union([z.string(), z.number()])
    .describe("Workflow ID or filename"),
  status: z
    .enum(["queued", "in_progress", "completed"])
    .optional()
    .describe("Filter by status"),
  conclusion: z
    .enum([
      "success",
      "failure",
      "neutral",
      "cancelled",
      "skipped",
      "timed_out",
      "action_required",
    ])
    .optional()
    .describe("Filter by conclusion"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .default(30)
    .describe("Number of results per page"),
})

async function handle(args: unknown) {
  const { owner, repo, workflow_id, status, conclusion, per_page } =
    inputSchema.parse(args)

  try {
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id,
      status,
      conclusion,
      per_page,
    })

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              total_count: response.data.total_count,
              workflow_runs: response.data.workflow_runs.map((run) => ({
                id: run.id,
                name: run.name,
                status: run.status,
                conclusion: run.conclusion,
                created_at: run.created_at,
                updated_at: run.updated_at,
                run_started_at: run.run_started_at,
                run_attempt: run.run_attempt,
                url: run.html_url,
                jobs_url: run.jobs_url,
                logs_url: run.logs_url,
                head_branch: run.head_branch,
                head_sha: run.head_sha,
                event: run.event,
              })),
            },
            null,
            2
          ),
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error fetching workflow runs: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    }
  }
}

export default {
  name,
  description,
  inputSchema,
  handle,
}
