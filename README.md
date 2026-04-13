# ChaiAssignment - Progress Visualizer

A robust, full-stack visualizer designed to track GitHub Classroom autograding assignments for the Chai Aur Code cohort. It securely fetches and parses raw GitHub Actions workflow logs from AWS S3, providing a distributed, macro-view dashboard of all active assignments. Built with IndexedDB for instant, offline-surviving caching and NextAuth for seamless, zero-friction GitHub OAuth integration.

## 🚀 Architecture

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Authentication:** NextAuth.js (Secure HTTP-Only Cookies via GitHub OAuth)
- **Data Persistence:** IndexedDB (`idb-keyval`) for rapid local caching
- **API Engine:** Serverless routes fetching directly from the GitHub REST API (Actions, Commits, Contents)

## 🔐 Security & Permissions

This application utilizes the modern **GitHub App** architecture (Fine-Grained Permissions) rather than legacy OAuth tokens.
It strictly requests **Read-Only** access to:

- `Actions` (To read workflow statuses and download test logs)
- `Contents` (To read the local `autograding.json` rule set)
Zero write access is requested or required.

## 🛠️ Local Development Setup

### 1. Register the GitHub App

To run this locally, you must create a development GitHub App to handle the OAuth handshake.

1. Go to GitHub -> Settings -> Developer Settings -> GitHub Apps -> New GitHub App.
2. **Homepage URL:** `http://localhost:3000`
3. **Callback URL:** `http://localhost:3000/api/auth/callback/github`
4. **Permissions:** `Actions` (Read-only), `Contents` (Read-only).
5. Ensure "Where can this GitHub App be installed?" is set to **Any account**.

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
GITHUB_CLIENT_ID="your_dev_app_client_id"
GITHUB_CLIENT_SECRET="your_dev_app_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_via_openssl_rand_base64_32"
```

### 3. Run the Engine

```bash
npm install
npm run dev
```
