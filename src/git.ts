import { exec } from "./deps.ts";

export async function createAndPushCommit({
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
  await exec.exec("git", ["reset", "bump-request"]);
  await exec.exec("git", ["commit", "--message", message]);
  await exec.exec("git", ["push", "--set-upstream", "origin", branch]);
}
