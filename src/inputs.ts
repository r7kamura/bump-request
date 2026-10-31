export type Inputs = {
  command: string;
  version: string;
};

export function parseInputs(env: NodeJS.ProcessEnv): Inputs {
  const command = env.BUMP_REQUEST_INPUTS_COMMAND?.trim() ?? "";
  const version = env.BUMP_REQUEST_INPUTS_VERSION?.trim() ?? "";
  if (!command) {
    throw new Error("command input is required.");
  }
  if (!version) {
    throw new Error("version input is required.");
  }
  return { command, version };
}
