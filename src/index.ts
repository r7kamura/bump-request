import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";
import { parseInputs } from "./inputs.ts";

async function run() {
  const { command, version } = parseInputs(process.env);
  const { context } = github;
  const { owner, repo } = context.repo;
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN ?? "");
  const branch = `bump-request-${context.runId}`;
  const title = `Change version to ${version}`;

  await exec.exec("bash", ["-e", "-c", command], {
    env: { ...process.env, VERSION: version } as Record<string, string>,
  });

  const notes = await octokit.rest.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: `v${version}`,
    target_commitish: context.sha,
  });

  await exec.exec("git", ["config", "user.name", context.actor]);
  await exec.exec("git", [
    "config",
    "user.email",
    `${context.actor}@users.noreply.github.com`,
  ]);
  await exec.exec("git", ["switch", "--create", branch]);
  await exec.exec("git", ["add", "."]);
  await exec.exec("git", ["commit", "--message", title]);
  await exec.exec("git", ["push", "--set-upstream", "origin", branch]);

  await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    head: branch,
    base: context.ref,
    body: preventMention(notes.data.body),
  });
}

function preventMention(text: string) {
  return text.replace(/@/g, "@\u200B");
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
