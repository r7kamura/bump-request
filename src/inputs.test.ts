import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInputs } from "./inputs.ts";

test("returns inputs", () => {
  assert.deepEqual(
    parseInputs({
      BUMP_REQUEST_INPUTS_COMMAND: 'echo "$VERSION" > VERSION',
      BUMP_REQUEST_INPUTS_VERSION: "1.2.3",
    }),
    { command: 'echo "$VERSION" > VERSION', version: "1.2.3" },
  );
});

test("requires command", () => {
  assert.throws(() => parseInputs({ BUMP_REQUEST_INPUTS_VERSION: "1.2.3" }), {
    message: "command input is required.",
  });
});

test("requires version", () => {
  assert.throws(
    () =>
      parseInputs({
        BUMP_REQUEST_INPUTS_COMMAND: "true",
        BUMP_REQUEST_INPUTS_VERSION: " ",
      }),
    { message: "version input is required." },
  );
});
