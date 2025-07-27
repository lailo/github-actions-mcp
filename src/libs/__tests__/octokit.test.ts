import { describe, test, expect } from "bun:test"
import { octokit } from "../octokit"

describe("octokit client", () => {
  test("should be defined", () => {
    expect(octokit).toBeDefined()
  })

  test("should have rest API structure", () => {
    expect(octokit.rest).toBeDefined()
    expect(octokit.rest.actions).toBeDefined()
  })

  test("should be an object with properties", () => {
    expect(typeof octokit).toBe("object")
    expect(octokit).not.toBeNull()
  })
})
