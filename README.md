# GitHub Actions MCP Server

An MCP (Model Context Protocol) server for analyzing GitHub Actions workflows and performance. This tool helps identify bottlenecks, failures, and optimization opportunities in your CI/CD pipelines.

## Features

- **Workflow Discovery**: List all workflows in a repository
- **Run Analysis**: Get detailed information about workflow runs with filtering
- **Performance Analysis**: Analyze workflow runs to identify slow jobs and failures
- **Timing Details**: Get detailed timing information for jobs and steps

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up your GitHub token:
   ```bash
   cp .env.example .env
   # Edit .env and add your GitHub token
   ```
4. Build the project:
   ```bash
   bun run build
   ```

## Usage

### Running the MCP Server

```bash
bun run start
```

The server communicates via stdio and can be integrated with MCP-compatible clients.

### Development

The MCP Inspector provides a web-based interface to test your server:

```bash
# First, install dependencies
bun install

bun run dev
```

This will open a web interface where you can:

- View available tools
- Test tool calls interactively
- See request/response data
- Debug tool schemas

### Using with Claude Desktop

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "github-actions": {
      "command": "bun",
      "args": ["run", "start"],
      "cwd": "/path/to/your/github-actions-mcp",
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

**Important Notes:**

- Replace `/path/to/your/github-actions-mcp` with the actual path to your project directory
- Replace `your_github_token_here` with your actual GitHub personal access token
- Make sure Bun is installed and available in your system PATH
- Restart Claude Desktop after making configuration changes

After configuration, Claude Desktop will automatically connect to your MCP server and you'll be able to use commands like:

- "List workflows in my repository owner/repo-name"
- "Analyze the latest failed workflow run for owner/repo-name"
- "Show me timing details for workflow run 123456"

## GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with the following permissions:
   - `repo` (Full control of private repositories)
   - `actions:read` (Read access to actions and workflows)
3. Add the token to your `.env` file
