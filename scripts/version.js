const { execFileSync } = require("child_process");

function gitDescription() {
  return execFileSync("git", ["describe", "--tags", "--always", "--dirty"], {
    encoding: "utf8",
  }).trim();
}

function resolveVersion({ suppliedVersion, describe = gitDescription } = {}) {
  if (suppliedVersion) return suppliedVersion;

  try {
    return describe() || "development";
  } catch (error) {
    return "development";
  }
}

module.exports = { resolveVersion };
