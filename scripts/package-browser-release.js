const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const rootDir = process.cwd();
const packageJson = require(path.join(rootDir, "package.json"));

const version = packageJson.version || "0.0.0";
const releaseName = `sethx-client-browser-v${version}`;
const distBrowserDir = path.join(rootDir, "dist", "sethx-client", "browser");
const releaseRoot = path.join(rootDir, "release");
const packageDir = path.join(releaseRoot, releaseName);
const appDir = path.join(packageDir, "app");
const zipPath = path.join(releaseRoot, `${releaseName}.zip`);
const checksumPath = path.join(releaseRoot, "SHA256SUMS.txt");

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function copyRecursive(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content.replace(/\n/g, "\r\n"), "utf8");
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

if (!fs.existsSync(distBrowserDir)) {
  console.error(`Missing build output: ${distBrowserDir}`);
  console.error("Run npm run build:prod before packaging.");
  process.exit(1);
}

removeIfExists(packageDir);
removeIfExists(zipPath);
fs.mkdirSync(appDir, { recursive: true });

copyRecursive(distBrowserDir, appDir);

writeFile(
  path.join(packageDir, "README.txt"),
  `SETHX Client Browser Release v${version}

This package contains a prebuilt local browser version of SETHX Client.

This is not a public hosted trading website. It is local client software that runs from your own computer.

Requirements:
- Node.js must be installed.
- A browser wallet or wallet app is required for signing transactions.
- Never enter seed phrases or private keys into the client.

How to run on Windows:
1. Unzip this package.
2. Double-click start-windows.bat.
3. Open http://localhost:4173 if the browser does not open automatically.

How to run on macOS/Linux:
1. Unzip this package.
2. Open a terminal in this folder.
3. Run: chmod +x start-mac-linux.sh
4. Run: ./start-mac-linux.sh
5. Open http://localhost:4173 if the browser does not open automatically.

Security:
- Verify checksums before use.
- Verify the network and contract addresses before signing.
- Review every transaction in your wallet before signing.
- Use testnet releases for testing only.

Third-party interfaces:
SETHX Community is not responsible for third-party websites, forks, modified builds, hosted interfaces, or unofficial deployments.
`,
);

writeFile(
  path.join(packageDir, "package.json"),
  `{
  "name": "sethx-client-browser-release",
  "version": "${version}",
  "private": true,
  "scripts": {
    "start": "serve app -l 4173"
  },
  "dependencies": {
    "serve": "^14.2.5"
  }
}
`,
);

writeFile(
  path.join(packageDir, "start-windows.bat"),
  `@echo off
setlocal

cd /d "%~dp0"

echo.
echo ==========================================
echo  SETHX Client local browser release
echo ==========================================
echo.
echo This will start the client at:
echo http://localhost:4173
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERROR: Node.js is required but was not found.
  echo.
  echo Please install Node.js from:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo ERROR: npm is required but was not found.
  echo.
  echo Please reinstall Node.js with npm enabled.
  echo.
  pause
  exit /b 1
)

if not exist "app\\\\index.html" (
  echo ERROR: app\\\\index.html was not found.
  echo.
  echo Make sure you fully unzipped the release package before running this file.
  echo Do not run this script directly from inside the zip preview.
  echo.
  pause
  exit /b 1
)

echo Installing local server dependency...
echo.
call npm install

if %errorlevel% neq 0 (
  echo.
  echo ERROR: npm install failed.
  echo.
  pause
  exit /b 1
)

echo.
echo Starting local server...
echo If the browser does not open automatically, open:
echo http://localhost:4173
echo.

start "" http://localhost:4173

call npx serve -s app -l 4173

echo.
echo Server stopped.
pause
`,
);

fs.writeFileSync(
  path.join(packageDir, "start-mac-linux.sh"),
  `#!/usr/bin/env sh
set -e

echo "Starting SETHX Client at http://localhost:4173"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found."
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

npm install
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open http://localhost:4173 >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open http://localhost:4173 >/dev/null 2>&1 || true
fi

npm start
`,
  { encoding: "utf8", mode: 0o755 },
);

fs.mkdirSync(releaseRoot, { recursive: true });

try {
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path "${packageDir}\\*" -DestinationPath "${zipPath}" -Force`,
    ],
    { stdio: "inherit" },
  );
} catch {
  try {
    execFileSync("zip", ["-r", zipPath, releaseName], {
      cwd: releaseRoot,
      stdio: "inherit",
    });
  } catch (error) {
    console.error(
      "Could not create zip archive. The release folder was still created at:",
    );
    console.error(packageDir);
    process.exit(1);
  }
}

const checksum = sha256(zipPath);
fs.writeFileSync(
  checksumPath,
  `${checksum}  ${path.basename(zipPath)}\n`,
  "utf8",
);

console.log("");
console.log("Browser release package created:");
console.log(zipPath);
console.log("");
console.log("Checksum file created:");
console.log(checksumPath);
