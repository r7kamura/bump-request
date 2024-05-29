import core from "https://esm.sh/@actions/core@1.10.1?dts";
import exec from "https://esm.sh/@actions/exec@1.1.1?dts";
import github from "https://esm.sh/@actions/github@6.0.0?dts";

import { performance } from "node:perf_hooks";
globalThis.performance = performance;

const githubToken = Deno.env.get("GITHUB_TOKEN")!;
const branch = `bump-request-${github.context.runId}`;

const response = await generateNotes({
  githubToken: githubToken,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  tagName: `v${core.getInput("version")}`,
  targetCommitish: github.context.sha,
});

await createAndPushCommit({
  userName: github.context.actor,
  userEmail: `${github.context.actor}@users.noreply.github.com`,
  branch,
  message: `Change version to ${core.getInput("version")}`,
  files: ["."],
});

await createPullRequest({
  githubToken: githubToken,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  title: response.data.name,
  body: response.data.body,
  head: branch,
  base: github.context.ref,
});

function generateNotes({
  githubToken,
  owner,
  repo,
  tagName,
  targetCommitish,
}: {
  githubToken: string;
  owner: string;
  repo: string;
  tagName: string;
  targetCommitish: string;
}) {
  return github.getOctokit(githubToken).request(
    "POST /repos/{owner}/{repo}/releases/generate-notes",
    {
      owner,
      repo,
      tag_name: tagName,
      target_commitish: targetCommitish,
    },
  );
}

async function createPullRequest({
  githubToken,
  owner,
  repo,
  title,
  body,
  head,
  base,
}: {
  githubToken: string;
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
}) {
  return await github.getOctokit(githubToken).request(
    "POST /repos/{owner}/{repo}/pulls",
    {
      owner,
      repo,
      title,
      body,
      head,
      base,
    },
  );
}

async function createAndPushCommit({
  userName,
  userEmail,
  branch,
  message,
  files,
}: {
  userName: string;
  userEmail: string;
  branch: string;
  message: string;
  files: string[];
}) {
  await exec.exec("git", ["config", "user.name", userName]);
  await exec.exec("git", ["config", "user.email", userEmail]);
  await exec.exec("git", ["switch", "--create", branch]);
  await exec.exec("git", ["add", ...files]);
  await exec.exec("git", ["commit", "--message", message]);
  await exec.exec("git", ["push", "--set-upstream", "origin", branch]);
}
