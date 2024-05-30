import exec from "https://esm.sh/@actions/exec@1.1.1?dts";
import github from "https://esm.sh/@actions/github@6.0.0?dts";

// Workaround for the following error:
//
// error: Uncaught TypeError: performance.markResourceTiming is not a function
//     at Ay (https://esm.sh/v135/undici@5.27.2/denonext/undici.mjs:142:27217)
//     at lC (https://esm.sh/v135/undici@5.27.2/denonext/undici.mjs:142:27133)
//     at Object.processResponseEndOfBody (https://esm.sh/v135/undici@5.27.2/denonext/undici.mjs:142:26504)
//     at https://esm.sh/v135/undici@5.27.2/denonext/undici.mjs:142:31684
//     at ext:core/01_core.js:302:9
//     at Object.runMicrotasks (ext:core/01_core.js:642:26)
//     at processTicksAndRejections (ext:deno_node/_next_tick.ts:39:10)
//     at runNextTicks (ext:deno_node/_next_tick.ts:48:3)
//     at eventLoopTick (ext:core/01_core.js:175:21)
import { performance } from "node:perf_hooks";
globalThis.performance = performance;

const githubToken = Deno.env.get("GITHUB_TOKEN")!;
const version = Deno.env.get("BUMP_REQUEST_INPUTS_VERSION")!;
const branch = `bump-request-${github.context.runId}`;
const title = `Change version to ${version}`;

const response = await generateNotes({
  githubToken: githubToken,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  tagName: `v${version}`,
  targetCommitish: github.context.sha,
});

await createAndPushCommit({
  userName: github.context.actor,
  userEmail: `${github.context.actor}@users.noreply.github.com`,
  branch,
  message: title,
  files: ["."],
});

await createPullRequest({
  githubToken: githubToken,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  title,
  body: preventMention(response.data.body),
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

function preventMention(text: string) {
  return text.replace(/@/g, "@\u200B");
}
