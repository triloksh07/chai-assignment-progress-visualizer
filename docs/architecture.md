# Engine Architecture

This application operates as a read-only integration layer over the GitHub Classroom ecosystem. Because GitHub Classroom limits score visibility, this app bypasses the UI and scrapes the raw CI/CD state.

## The Data Flow

1. **Authentication (OAuth):** NextAuth establishes a secure JWT containing a GitHub Fine-Grained Access Token. The token never touches the client browser; it is strictly extracted server-side via `getToken`.
2. **Organization Scraping (`/api/repos`):** The server asks GitHub for all repositories the user is a collaborator on, filtering strictly for the `chaicodehq` prefix.
3. **Log Extraction Pipeline (`/api/progress`):**
   - **Step A:** Fetch `autograding.json` from the repository to establish the "Rules" (Points, Test Names).
   - **Step B:** Fetch the latest Commit SHA.
   - **Step C:** Query GitHub Actions to find the `workflow_run` tied to that SHA.
   - **Step D:** Fetch the jobs inside that run and isolate the `Autograding` job ID.
   - **Step E:** Follow the 302 Redirect to AWS S3 to download the raw terminal output of the test runner.
4. **Parsing:** The server cross-references the `autograding.json` rules against the raw S3 logs, using exact string matching for `✅` and `❌` flags to calculate the final score.
5. **Persistence:** The frontend receives the calculated JSON and writes it to IndexedDB (`idb-keyval`), ensuring instantaneous loads on subsequent visits without draining GitHub API quotas.