import { core } from "./deps.ts";
import { github } from "./deps.ts";
import { fetchLatestRelease } from "./github.ts";
import { incrementVersion } from "./versioning.ts";

const forcedVersion = Deno.env.get("BUMP_REQUEST_INPUTS_VERSION");
const releaseType = Deno.env.get("BUMP_REQUEST_INPUTS_RELEASE_TYPE");
const githubToken = Deno.env.get("GITHUB_TOKEN")!;

if (!forcedVersion && !releaseType) {
  throw new Error(
    "Specify either `release_type` or `version`.",
  );
}

if (releaseType) {
  if (!["major", "minor", "patch"].includes(releaseType)) {
    throw new Error(
      "`release_type` must be one of `major`, `minor`, or `patch`.",
    );
  }
}

core.setOutput(
  "version",
  forcedVersion || await detectNextVersion({
    githubToken,
    githubOwner: github.context.repo.owner,
    githubRepo: github.context.repo.repo,
    releaseType: releaseType!,
  }),
);

async function detectNextVersion({
  githubToken,
  githubOwner,
  githubRepo,
  releaseType,
}: {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  releaseType: string;
}) {
  const response = await fetchLatestRelease({
    githubToken,
    owner: githubOwner,
    repo: githubRepo,
  });
  return incrementVersion({
    version: response.data.tag_name,
    releaseType,
  });
}
