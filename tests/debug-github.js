// debug-github.js
// import dotenv from 'dotenv';
// dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TARGET_REPO = process.env.TARGET_REPO;

if (!GITHUB_TOKEN) return "no token";
if (!TARGET_REPO) return "target repo missing";

async function probeGitHub() {
    console.log(`\n🕵️‍♂️ Initiating Deep Probe on: ${TARGET_REPO}\n`);

    const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
        // --- TEST 1: DOES THE REPO EXIST? ---
        console.log("-> [TEST 1] Fetching Repository Metadata...");
        const repoRes = await fetch(`https://api.github.com/repos/${TARGET_REPO}`, { headers });

        if (!repoRes.ok) {
            console.error(`❌ FAILED: Repo returned ${repoRes.status}. Check your spelling or token permissions.`);
            return;
        }
        const repoData = await repoRes.json();
        console.log(`✅ SUCCESS: Repo exists.`);
        console.log(`   - Default Branch: ${repoData.default_branch}`);
        console.log(`   - Visibility: ${repoData.visibility}`);
        console.log(`   - Size: ${repoData.size} KB\n`);

        if (repoData.size === 0) {
            console.error("🚨 STOP: The repository size is 0. This means it is completely empty. You haven't pushed any code yet, so .github/classroom does not exist.");
            return;
        }

        // --- TEST 2: CAN WE READ THE ROOT DIRECTORY? ---
        console.log(`-> [TEST 2] Fetching Root Directory on branch '${repoData.default_branch}'...`);
        const rootRes = await fetch(`https://api.github.com/repos/${TARGET_REPO}/contents`, { headers });

        if (!rootRes.ok) {
            console.error(`❌ FAILED: Could not read root contents. Status: ${rootRes.status}`);
            return;
        }
        const rootData = await rootRes.json();
        console.log(`✅ SUCCESS: Found ${rootData.length} items in root directory.`);
        const hasGithubFolder = rootData.some(item => item.name === '.github');
        console.log(`   - Does '.github' folder exist? ${hasGithubFolder ? 'YES' : 'NO'}\n`);

        if (!hasGithubFolder) {
            console.error("🚨 STOP: There is no .github folder in the root of this repository. The instructor may not have set it up, or you overwrote it.");
            return;
        }

        // --- TEST 3: CAN WE GET AUTOGRADING.JSON? ---
        console.log("-> [TEST 3] Fetching .github/classroom/autograding.json...");
        const fileRes = await fetch(`https://api.github.com/repos/${TARGET_REPO}/contents/.github/classroom/autograding.json`, { headers });

        if (!fileRes.ok) {
            console.error(`❌ FAILED: autograding.json returned 404.`);
            console.log("   Diagnosis: The .github folder exists, but the autograding.json file is missing or named differently.");
            return;
        }

        const fileData = await fileRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        console.log(`✅ SUCCESS: autograding.json found and downloaded!`);
        console.log(`   - File Size: ${fileData.size} bytes`);
        console.log(`\n📄 Content Preview:\n${content.substring(0, 150)}...\n`);

        console.log("🎉 CONCLUSION: If this script works but your Next.js app fails, your NextAuth GitHub App token does not have the correct permissions.");

    } catch (error) {
        console.error("💥 CRITICAL ERROR:", error.message);
    }
}

probeGitHub();