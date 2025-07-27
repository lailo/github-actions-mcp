import { describe, test, expect } from "bun:test"
import getRepositories from "../get-repositories"

describe("get-repositories tool", () => {
  test("should have correct name and description", () => {
    expect(getRepositories.name).toBe("get_repositories")
    expect(getRepositories.description).toBe(
      "List all repositories for a GitHub username"
    )
  })

  test("should validate input schema correctly", () => {
    const validInput = { username: "octocat" }
    const result = getRepositories.inputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  test("should accept empty username (current schema allows it)", () => {
    const input = { username: "" }
    const result = getRepositories.inputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  test("should reject missing username field", () => {
    const invalidInput = {}
    const result = getRepositories.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should reject non-string username", () => {
    const invalidInput = { username: 123 }
    const result = getRepositories.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should reject null username", () => {
    const invalidInput = { username: null }
    const result = getRepositories.inputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  test("should only require username field", () => {
    const schema = getRepositories.inputSchema
    const keys = Object.keys(schema.shape)
    expect(keys).toEqual(["username"])
  })
})
