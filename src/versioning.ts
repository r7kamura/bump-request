import { semver } from "./deps.ts";
import { asserts } from "./deps.ts";

export function incrementVersion({
  version,
  releaseType,
}: {
  version: string;
  releaseType: string;
}) {
  return semver.inc(
    version,
    releaseType as semver.ReleaseType,
  );
}

Deno.test("incrementVersion", () => {
  asserts.assertEquals(
    incrementVersion({
      version: "1.0.0",
      releaseType: "major",
    }),
    "2.0.0",
  );
  asserts.assertEquals(
    incrementVersion({
      version: "v1.0.0",
      releaseType: "minor",
    }),
    "1.1.0",
  );
});
