import { z } from "zod"
import { octokit } from "../libs/octokit"

const name = "get_job_timings"
const description = "Get detailed timing information for jobs in a workflow run"

const inputSchema = z.object({
  owner: z.string().describe("GitHub repository owner"),
  repo: z.string().describe("GitHub repository name"),
  run_id: z.number().describe("Workflow run ID"),
})

type InputSchema = z.infer<typeof inputSchema>

async function handle(args: InputSchema) {
  const { owner, repo, run_id } = inputSchema.parse(args)

  try {
    const jobsResponse = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id,
    })

    const detailedJobs = await Promise.all(
      jobsResponse.data.jobs.map(async (job) => {
        try {
          const jobDetails = await octokit.rest.actions.getJobForWorkflowRun({
            owner,
            repo,
            job_id: job.id,
          })

          const steps =
            jobDetails.data.steps?.map((step) => ({
              name: step.name,
              status: step.status,
              conclusion: step.conclusion,
              number: step.number,
              started_at: step.started_at,
              completed_at: step.completed_at,
              duration_ms:
                step.started_at && step.completed_at
                  ? new Date(step.completed_at).getTime() -
                    new Date(step.started_at).getTime()
                  : null,
            })) || []

          return {
            job_id: job.id,
            job_name: job.name,
            status: job.status,
            conclusion: job.conclusion,
            started_at: job.started_at,
            completed_at: job.completed_at,
            duration_ms:
              job.started_at && job.completed_at
                ? new Date(job.completed_at).getTime() -
                  new Date(job.started_at).getTime()
                : null,
            runner_name: job.runner_name,
            steps,
            slowest_step: steps.reduce((slowest, step) => {
              return (step.duration_ms || 0) > (slowest.duration_ms || 0)
                ? step
                : slowest
            }, steps[0] || null),
          }
        } catch (error) {
          return {
            job_id: job.id,
            job_name: job.name,
            error: `Failed to fetch job details: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }
        }
      })
    )

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              run_id,
              jobs: detailedJobs,
              summary: {
                total_jobs: detailedJobs.length,
                total_steps: detailedJobs.reduce(
                  (sum, job) => sum + (job.steps?.length || 0),
                  0
                ),
                slowest_job:
                  detailedJobs.reduce((slowest, job) => {
                    return (job.duration_ms || 0) > (slowest.duration_ms || 0)
                      ? job
                      : slowest
                  }, detailedJobs[0] || null)?.job_name || null,
              },
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
          text: `Error fetching job timings: ${
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
