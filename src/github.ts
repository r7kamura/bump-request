import { github } from "./deps.ts";
import { performance } from "node:perf_hooks";

// Workaround for deno compatibility issue on undici:
// deno-lint-ignore no-explicit-any
(globalThis as any).performance = performance;

export function generateNotes({
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

export async function createPullRequest({
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
      head,
      base,
      body: preventMention(body),
    },
  );
}

function preventMention(text: string) {
  return text.replace(/@/g, "@\u200B");
}
