import { z } from "zod"
import { octokit } from "../libs/octokit"

const name = "get_repositories"
const description = "List all repositories for a GitHub username"

const inputSchema = z.object({
  username: z.string().describe("GitHub username"),
})

async function handle(args: unknown) {
  const { username } = inputSchema.parse(args)

  try {
    const response = await octokit.rest.repos.listForUser({ username })

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              repositories: response.data.map((repository) => ({
                id: repository.id,
                name: repository.name,
                full_name: repository.full_name,
                created_at: repository.created_at,
                updated_at: repository.updated_at,
                private: repository.private,
                html_url: repository.html_url,
                description: repository.description,
                homepage: repository.homepage,
                topics: repository.topics,
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
