import { describe, test, expect } from "bun:test"
import getJobTiming from "../get-job-timing"

describe("get-job-timing tool", () => {
  test("should have correct name and description", () => {
    expect(getJobTiming.name).toBe("get_job_timings")
    expect(getJobTiming.description).toBe(
      "Get detailed timing information for jobs in a workflow run"
    )
  })

  test("should validate input schema correctly", () => {
    const validInput = {
      owner: "test-owner",
      repo: "test-repo",
      run_id: 123456,
    }
    const result = getJobTiming.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  test("should reject invalid input schema - missing fields", () => {
    const invalidInput = { owner: "test-owner", repo: "test-repo" }
    const result = getJobTiming.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should reject invalid input schema - wrong types", () => {
    const invalidInput = {
      owner: "test-owner",
      repo: "test-repo",
      run_id: "not-a-number",
    }
    const result = getJobTiming.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should require all three fields", () => {
    const incompleteInput = { owner: "test-owner" }
    const result = getJobTiming.inputSchema.safeParse(incompleteInput)
    expect(result.success).toBe(false)

    const anotherIncompleteInput = { owner: "test-owner", repo: "test-repo" }
    const result2 = getJobTiming.inputSchema.safeParse(anotherIncompleteInput)
    expect(result2.success).toBe(false)
  })
})
