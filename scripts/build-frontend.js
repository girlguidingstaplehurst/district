const path = require("path");
const { spawnSync } = require("child_process");
const { resolveVersion } = require("./version");

const version = resolveVersion({ suppliedVersion: process.env.REACT_APP_VERSION });
const reactScripts = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "react-scripts.cmd" : "react-scripts",
);
const result = spawnSync(reactScripts, ["build"], {
  env: { ...process.env, REACT_APP_VERSION: version },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
