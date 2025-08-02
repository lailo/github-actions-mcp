import { z } from "zod"
import { octokit } from "../libs/octokit"

const name = "get_workflows"
const description = "List all workflows in a GitHub repository"

const inputSchema = z.object({
  owner: z.string().describe("GitHub repository owner"),
  repo: z.string().describe("GitHub repository name"),
})

async function handle(args: unknown) {
  const { owner, repo } = inputSchema.parse(args)

  try {
    const response = await octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
    })

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              total_count: response.data.total_count,
              workflows: response.data.workflows.map((workflow) => ({
                id: workflow.id,
                name: workflow.name,
                path: workflow.path,
                state: workflow.state,
                created_at: workflow.created_at,
                updated_at: workflow.updated_at,
                url: workflow.html_url,
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
          text: `Error fetching workflows: ${
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
