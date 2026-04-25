/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

function changePathToAbsPath(p) {
  return path.resolve(p);
}

function replaceWorkspace(p, workspace) {
  return p.replace(/workspace/g, workspace);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

// Get workspace directory
const currentDirectory = process.cwd();
let workspace = currentDirectory;
for (let i = 0; i < 4; i++) {
  workspace = path.dirname(workspace);
}

// Entry point for compilation
const entryJsPath = path.join(workspace, 'out/sdk/ohos-sdk/linux/ets/static/build-tools/driver/build-system/dist/entry.js');

// Paths
const pythonScript = path.join(__dirname, 'test_xts.py');
const outputDir = path.join(__dirname, 'generated', 'xts_configs');
const logsDir = path.join(__dirname, 'generated', 'xts_logs');

// Get command line arguments
const args = process.argv.slice(2);
const xtsRootArg = args.find(arg => arg.startsWith('--xts-root='));
const dryRun = args.includes('--dry-run');

if (!xtsRootArg) {
  console.error(`${colors.red}Error: --xts-root argument is required${colors.reset}`);
  console.error('Usage: node test_xts.js --xts-root=/path/to/xts [--dry-run]');
  process.exit(1);
}

const xtsRoot = xtsRootArg.split('=')[1];

// Ensure directories exist
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

console.log(`${colors.blue}=== XTS Test Compilation ===${colors.reset}`);
console.log(`XTS Root: ${xtsRoot}`);
console.log(`Workspace: ${workspace}`);
console.log(`Output Directory: ${outputDir}`);
console.log(`Logs Directory: ${logsDir}`);
console.log('');

// Track total time
const totalStartTime = Date.now();

// Step 1: Generate build configs using Python script
console.log(`${colors.blue}Step 1: Generating build configs...${colors.reset}`);
const step1StartTime = Date.now();
try {
  const pythonCmd = `python3 "${pythonScript}" --xts-root "${xtsRoot}" --output-dir "${outputDir}" --template "${path.join(__dirname, 'demo/localtest/build_config_template.json')}"`;
  execSync(pythonCmd, { stdio: 'inherit' });
  const step1Duration = Date.now() - step1StartTime;
  console.log(`${colors.green}✓ Config generation completed in ${formatDuration(step1Duration)}${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to generate build configs:${colors.reset}`, error.message);
  process.exit(1);
}

// Step 2: Read all generated configs and compile
const configFiles = fs.readdirSync(outputDir)
  .filter(f => f.endsWith('_build_config.json'))
  .sort();

console.log(`\n${colors.blue}Step 2: Compiling ${configFiles.length} XTS applications...${colors.reset}`);
console.log('');

// Async function to handle compilation
async function compileApplications() {
  let successCount = 0;
  let failCount = 0;
  const failedApps = [];

for (const configFile of configFiles) {
  const configPath = path.join(outputDir, configFile);
  const appName = configFile.replace('_build_config.json', '');
  const logFile = path.join(logsDir, `${appName}.log`);

  const startTime = Date.now();
  const index = successCount + failCount + 1;

  try {
    // Read and process the config
    const data = fs.readFileSync(configPath, 'utf8');
    let jsonData = JSON.parse(data);

    // Apply workspace replacement and absolute path transformations
    if (jsonData.buildSdkPath) {
      jsonData.buildSdkPath = replaceWorkspace(jsonData.buildSdkPath, workspace);
    }
    if (jsonData.plugins?.ui_syntax_plugin) {
      jsonData.plugins.ui_syntax_plugin = replaceWorkspace(jsonData.plugins.ui_syntax_plugin, workspace);
    }
    if (jsonData.plugins?.ui_plugin) {
      jsonData.plugins.ui_plugin = replaceWorkspace(jsonData.plugins.ui_plugin, workspace);
    }
    if (jsonData.plugins?.memo_plugin) {
      jsonData.plugins.memo_plugin = replaceWorkspace(jsonData.plugins.memo_plugin, workspace);
    }
    if (jsonData.pandaSdkPath) {
      jsonData.pandaSdkPath = replaceWorkspace(jsonData.pandaSdkPath, workspace);
    }
    if (jsonData.abcLinkerPath) {
      jsonData.abcLinkerPath = replaceWorkspace(jsonData.abcLinkerPath, workspace);
    }
    if (jsonData.dependencyAnalyzerPath) {
      jsonData.dependencyAnalyzerPath = replaceWorkspace(jsonData.dependencyAnalyzerPath, workspace);
    }
    if (jsonData.externalApiPaths) {
      jsonData.externalApiPaths = jsonData.externalApiPaths.map((p) => replaceWorkspace(p, workspace));
    }

    // Write processed config
    const processedConfigPath = configPath.replace('.json', '_processed.json');
    fs.writeFileSync(processedConfigPath, JSON.stringify(jsonData, null, 2), 'utf8');

    if (dryRun) {
      console.log(`${colors.dim}[${index}/${configFiles.length}]${colors.reset} [DRY RUN] ${appName}`);
      successCount++;
    } else {
      // Compile the app and capture output
      const libraryPath = path.join(workspace, 'out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib');
      const compileEnv = { ...process.env, LD_LIBRARY_PATH: libraryPath };

      console.log(`${colors.dim}[${index}/${configFiles.length}]${colors.reset} Compiling: ${appName}...`);

      // Use spawn to capture output while showing it in real-time
      const child = spawn('node', [entryJsPath, processedConfigPath], {
        env: compileEnv,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      const exitCode = await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const duration = Date.now() - startTime;

      if (exitCode === 0) {
        successCount++;
        console.log(`  ${colors.green}✓ Success${colors.reset} ${colors.dim}(${formatDuration(duration)})${colors.reset}`);
      } else {
        failCount++;
        failedApps.push({ name: appName, error: `Exit code: ${exitCode}`, log: logFile });

        // Write error details to log file
        const logContent = `=== Compilation Failed: ${appName} ===\n` +
          `Time: ${new Date().toISOString()}\n` +
          `Duration: ${formatDuration(duration)}\n` +
          `Config: ${processedConfigPath}\n` +
          `Exit Code: ${exitCode}\n\n` +
          `STDOUT:\n${stdout || '(empty)'}\n\n` +
          `STDERR:\n${stderr || '(empty)'}\n`;

        fs.writeFileSync(logFile, logContent, 'utf8');

        console.log(`  ${colors.red}✗ Failed${colors.reset} ${colors.dim}(${formatDuration(duration)})${colors.reset}`);
        console.log(`  ${colors.dim}Log saved to: ${logFile}${colors.reset}`);
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    failCount++;
    failedApps.push({ name: appName, error: error.message, log: logFile });

    // Write error to log file
    const logContent = `=== Error: ${appName} ===\n` +
      `Time: ${new Date().toISOString()}\n` +
      `Duration: ${formatDuration(duration)}\n` +
      `Error: ${error.message}\n`;
    fs.writeFileSync(logFile, logContent, 'utf8');

    console.log(`  ${colors.red}✗ Failed${colors.reset} ${colors.dim}(${formatDuration(duration)})${colors.reset}`);
    console.log(`  ${colors.dim}Log saved to: ${logFile}${colors.reset}`);
  }
  }

  // Summary
  const totalDuration = Date.now() - totalStartTime;
  console.log('');
  console.log(`${colors.blue}=== Summary ===${colors.reset}`);
  console.log(`Total: ${configFiles.length}`);
  console.log(`${colors.green}Success: ${successCount}${colors.reset}`);
  console.log(`${failCount > 0 ? colors.red : ''}Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.dim}Total Duration: ${formatDuration(totalDuration)}${colors.reset}`);
  console.log(`${colors.dim}Logs Directory: ${logsDir}${colors.reset}`);

  if (failedApps.length > 0) {
    console.log('');
    console.log(`${colors.red}Failed applications:${colors.reset}`);
    failedApps.forEach(({ name, log }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${name}`);
      console.log(`    ${colors.dim}Log: ${log}${colors.reset}`);
    });
    process.exit(1);
  }
}

// Start compilation
compileApplications().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
