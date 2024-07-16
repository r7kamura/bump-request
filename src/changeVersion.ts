import { exec } from "./deps.ts";
import { fs } from "./deps.ts";

const version = Deno.env.get("BUMP_REQUEST_VERSION")!;

if (checkCratePackage()) {
  changeCrateVersion(version);
} else if (checkGemPackage()) {
  changeGemVersion(version);
} else if (checkNpmPackage()) {
  changeNpmVersion(version);
} else if (checkPlainPackage()) {
  changePlainVersion(version);
} else {
  throw new Error("Unsupported package type.");
}

function checkCratePackage() {
  return fs.existsSync("Cargo.toml");
}

function checkGemPackage() {
  return fs.expandGlobSync("lib/**/version.rb").next().value !== undefined;
}

function checkNpmPackage() {
  return fs.existsSync("package.json");
}

function checkPlainPackage() {
  return fs.existsSync("VERSION");
}

function changeCrateVersion(version: string) {
  replaceContent(
    "Cargo.toml",
    /version = "[^"]+"/,
    `version = "${version}"`,
  );
}

function changeGemVersion(version: string) {
  replaceContent(
    fs.expandGlobSync("lib/**/version.rb").next().value.path,
    /VERSION = (['"]).*?\1/,
    `VERSION = '${version}'`,
  );
  exec.exec("bundle", ["install"]);
}

function changeNpmVersion(version: string) {
  exec.exec("npm", [
    "version",
    "--no-git-commit-hooks",
    "--no-git-tag-version",
    version,
  ]);
}

function changePlainVersion(version: string) {
  replaceContent(
    "VERSION",
    /.+/,
    version,
  );
}

function replaceContent(
  filePath: string,
  pattern: RegExp,
  replacement: string,
) {
  const content = Deno.readTextFileSync(filePath);
  const updatedContent = content.replace(pattern, replacement);
  Deno.writeTextFileSync(filePath, updatedContent);
}
