import { z } from "zod"
import { octokit } from "../libs/octokit"

const name = "analyze_workflow_run"
const description =
  "Analyze a specific workflow run to identify performance issues and failures"

const inputSchema = z.object({
  owner: z.string().describe("GitHub repository owner"),
  repo: z.string().describe("GitHub repository name"),
  run_id: z.number().describe("Workflow run ID"),
})

async function handle(args: unknown) {
  const { owner, repo, run_id } = inputSchema.parse(args)

  try {
    const [runResponse, jobsResponse] = await Promise.all([
      octokit.rest.actions.getWorkflowRun({ owner, repo, run_id }),
      octokit.rest.actions.listJobsForWorkflowRun({ owner, repo, run_id }),
    ])

    const run = runResponse.data
    const jobs = jobsResponse.data.jobs

    const analysis = {
      run_info: {
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
        updated_at: run.updated_at,
        run_started_at: run.run_started_at,
        total_duration_ms:
          run.updated_at && run.run_started_at
            ? new Date(run.updated_at).getTime() -
              new Date(run.run_started_at).getTime()
            : null,
        event: run.event,
        head_branch: run.head_branch,
        head_sha: run.head_sha,
      },
      jobs_analysis: jobs.map((job) => {
        const duration_ms =
          job.started_at && job.completed_at
            ? new Date(job.completed_at).getTime() -
              new Date(job.started_at).getTime()
            : null

        return {
          id: job.id,
          name: job.name,
          status: job.status,
          conclusion: job.conclusion,
          started_at: job.started_at,
          completed_at: job.completed_at,
          duration_ms,
          duration_human: duration_ms
            ? `${Math.round(duration_ms / 1000)}s`
            : null,
          runner_name: job.runner_name,
          runner_group_name: job.runner_group_name,
          labels: job.labels,
          steps_count: job.steps?.length || 0,
          failed_steps:
            job.steps?.filter((step) => step.conclusion === "failure").length ||
            0,
        }
      }),
      performance_insights: {
        total_jobs: jobs.length,
        failed_jobs: jobs.filter((job) => job.conclusion === "failure").length,
        cancelled_jobs: jobs.filter((job) => job.conclusion === "cancelled")
          .length,
        longest_job:
          jobs.reduce((longest, job) => {
            const duration =
              job.started_at && job.completed_at
                ? new Date(job.completed_at).getTime() -
                  new Date(job.started_at).getTime()
                : 0
            const longestDuration =
              longest.started_at && longest.completed_at
                ? new Date(longest.completed_at).getTime() -
                  new Date(longest.started_at).getTime()
                : 0
            return duration > longestDuration ? job : longest
          }, jobs[0])?.name || null,
        average_job_duration_ms:
          jobs.length > 0
            ? jobs.reduce((sum, job) => {
                const duration =
                  job.started_at && job.completed_at
                    ? new Date(job.completed_at).getTime() -
                      new Date(job.started_at).getTime()
                    : 0
                return sum + duration
              }, 0) / jobs.length
            : 0,
      },
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error analyzing workflow run: ${
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
