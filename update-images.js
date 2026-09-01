import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "YOUR_GITHUB_USERNAME";
const REPO = "YOUR_REPO_NAME";
const PATH = "src/images_data.js"; // Path to images file in repo

/**
 * Automates updating images_data.js on GitHub
 * @param {string} imageKey - e.g., "album_cover_1"
 * @param {string} base64Data - The raw base64 data URL
 */
async function appendImageToRepo(imageKey, base64Data) {
  try {
    // 1. Fetch current file content and SHA
    let currentContent = "export const images = {};\n";
    let sha;

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: PATH,
      });
      sha = data.sha;
      // Decode existing content from Base64
      currentContent = Buffer.from(data.content, "base64").toString("utf-8");
    } catch (error) {
      if (error.status !== 404) throw error;
      console.log("File does not exist yet. Creating a new one.");
    }

    // 2. Append/update your new image entry
    const newEntry = `\nimages["${imageKey}"] = "${base64Data}";\n`;
    const updatedContent = currentContent + newEntry;

    // 3. Commit update back to GitHub
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: `auto-update: add ${imageKey} to images_data.js`,
      content: Buffer.from(updatedContent).toString("base64"),
      sha: sha, // Required when updating an existing file
    });

    console.log(`Successfully updated ${PATH} on GitHub!`);
  } catch (err) {
    console.error("Failed to update GitHub repository:", err);
  }
}