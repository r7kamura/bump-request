import { github } from "./deps.ts";
import { createAndPushCommit } from "./git.ts";
import { createPullRequest, generateNotes } from "./github.ts";

const githubToken = Deno.env.get("GITHUB_TOKEN")!;
const version = Deno.env.get("BUMP_REQUEST_VERSION")!;
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
  body: response.data.body,
  head: branch,
  base: github.context.ref,
});
