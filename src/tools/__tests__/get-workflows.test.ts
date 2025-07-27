import { describe, test, expect, beforeEach, mock } from "bun:test"

const mockListRepoWorkflows = mock(() =>
  Promise.resolve({
    data: {
      total_count: 0,
      workflows: [] as Array<{
        id: number
        name: string
        path: string
        state: string
        created_at: string
        updated_at: string
        html_url: string
      }>,
    },
  })
)

mock.module("../../libs/octokit", () => ({
  octokit: {
    rest: {
      actions: {
        listRepoWorkflows: mockListRepoWorkflows,
      },
    },
  },
}))

import getWorkflows from "../get-workflows"

describe("get-workflows tool", () => {
  beforeEach(() => {
    mockListRepoWorkflows.mockClear()
  })

  test("should have correct name and description", () => {
    expect(getWorkflows.name).toBe("get_workflows")
    expect(getWorkflows.description).toBe(
      "List all workflows in a GitHub repository"
    )
  })

  test("should validate input schema correctly", () => {
    const validInput = { owner: "test-owner", repo: "test-repo" }
    const result = getWorkflows.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("should accept empty strings (current schema allows them)", () => {
    const input = { owner: "", repo: "" }
    const result = getWorkflows.inputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  test("should handle successful API response", async () => {
    const mockResponse = {
      data: {
        total_count: 2,
        workflows: [
          {
            id: 1,
            name: "CI",
            path: ".github/workflows/ci.yml",
            state: "active",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-02T00:00:00Z",
            html_url: "https://github.com/owner/repo/actions/workflows/1",
          },
          {
            id: 2,
            name: "Deploy",
            path: ".github/workflows/deploy.yml",
            state: "active",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-02T00:00:00Z",
            html_url: "https://github.com/owner/repo/actions/workflows/2",
          },
        ],
      },
    }

    mockListRepoWorkflows.mockResolvedValue(mockResponse)

    const result = await getWorkflows.handle({
      owner: "test-owner",
      repo: "test-repo",
    })

    expect(mockListRepoWorkflows).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
    })

    expect(result.content).toHaveLength(1)
    expect(result.content[0].type).toBe("text")

    const responseData = JSON.parse(result.content[0].text)
    expect(responseData.total_count).toBe(2)
    expect(responseData.workflows).toHaveLength(2)
    expect(responseData.workflows[0].name).toBe("CI")
  })

  test("should handle API errors gracefully", async () => {
    const mockError = new Error("API Error: Not Found")
    mockListRepoWorkflows.mockRejectedValue(mockError)

    const result = await getWorkflows.handle({
      owner: "test-owner",
      repo: "test-repo",
    })

    expect(result.content).toHaveLength(1)
    expect(result.content[0].type).toBe("text")
    expect(result.content[0].text).toContain(
      "Error fetching workflows: API Error: Not Found"
    )
    expect(result.isError).toBe(true)
  })
})
