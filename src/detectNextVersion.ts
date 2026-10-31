import { core } from "./deps.ts";

const version = Deno.env.get("BUMP_REQUEST_INPUTS_VERSION");

if (!version) {
  throw new Error("Specify `version`.");
}

core.setOutput("version", version);
