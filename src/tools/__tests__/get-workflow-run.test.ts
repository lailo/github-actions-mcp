import { describe, test, expect } from "bun:test"
import getWorkflowRuns from "../get-workflow-run"

describe("get-workflow-run tool", () => {
  test("should have correct name and description", () => {
    expect(getWorkflowRuns.name).toBe("get_workflow_runs")
    expect(getWorkflowRuns.description).toBe(
      "Get workflow runs for a specific workflow, with optional filtering by status and conclusion"
    )
  })

  test("should validate input schema correctly with required fields", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
    }
    const result = getWorkflowRuns.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.owner).toBe("test-owner")
      expect(result.data.repo).toBe("test-repo")
      expect(result.data.workflow_id).toBe("ci.yml")
      expect(result.data.per_page).toBe(30) // default value
    }
  })

  test("should accept workflow_id as number", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: 123456,
    }
    const result = getWorkflowRuns.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("should validate optional status filter", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      status: "completed" as const,
    }
    const result = getWorkflowRuns.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("should reject invalid status values", () => {
    const invalidInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      status: "invalid-status",
    }
    const result = getWorkflowRuns.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should validate optional conclusion filter", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      conclusion: "success" as const,
    }
    const result = getWorkflowRuns.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("should reject invalid conclusion values", () => {
    const invalidInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      conclusion: "invalid-conclusion",
    }
    const result = getWorkflowRuns.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should validate per_page limits", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      per_page: 50,
    }
    const result = getWorkflowRuns.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)

    const tooLarge = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      per_page: 150,
    }
    const result2 = getWorkflowRuns.inputSchema.safeParse(tooLarge)
    expect(result2.success).toBe(false)

    const tooSmall = {
      owner: "test-owner",
      repo: "test-repo",
      workflow_id: "ci.yml",
      per_page: 0,
    }
    const result3 = getWorkflowRuns.inputSchema.safeParse(tooSmall)
    expect(result3.success).toBe(false)
  })

  test("should reject missing required fields", () => {
    const invalidInput = { owner: "test-owner" }
    const result = getWorkflowRuns.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})
