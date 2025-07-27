import { describe, test, expect } from "bun:test"
import analyzeWorkflowRun from "../analyze-workflow-run"

describe("analyze-workflow-run tool", () => {
  test("should have correct name and description", () => {
    expect(analyzeWorkflowRun.name).toBe("analyze_workflow_run")
    expect(analyzeWorkflowRun.description).toBe(
      "Analyze a specific workflow run to identify performance issues and failures"
    )
  })

  test("should validate input schema correctly", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      run_id: 123456,
    }
    const result = analyzeWorkflowRun.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  test("should reject invalid input schema - missing fields", () => {
    const invalidInput = { owner: "test-owner" }
    const result = analyzeWorkflowRun.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should reject invalid input schema - wrong types", () => {
    const invalidInput = {
      owner: "test-owner",
      repo: "test-repo",
      run_id: "not-a-number",
    }
    const result = analyzeWorkflowRun.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should accept empty strings (current schema allows them)", () => {
    const input = { owner: "", repo: "", run_id: 123 }
    const result = analyzeWorkflowRun.inputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })
})
