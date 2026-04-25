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
const { spawn } = require('child_process');

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
const advancedUiRoot = path.join(workspace, 'foundation/arkui/ace_engine/advanced_ui_component_static');
const outputDir = path.join(__dirname, 'generated', 'advanced_ui_configs');
const logsDir = path.join(__dirname, 'generated', 'advanced_ui_logs');
const templatePath = path.join(__dirname, 'demo/localtest/build_config_template.json');

// Get command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filterArg = args.find(arg => arg.startsWith('--filter='));

// Ensure directories exist
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

console.log(`${colors.blue}=== Advanced UI Component Test Compilation ===${colors.reset}`);
console.log(`Advanced UI Root: ${advancedUiRoot}`);
console.log(`Workspace: ${workspace}`);
console.log(`Output Directory: ${outputDir}`);
console.log(`Logs Directory: ${logsDir}`);
console.log('');

// Track total time
const totalStartTime = Date.now();

// Load template config
let templateConfig;
try {
  const templateData = fs.readFileSync(templatePath, 'utf8');
  templateConfig = JSON.parse(templateData);
} catch (error) {
  console.error(`${colors.red}Failed to load template config:${colors.reset}`, error.message);
  process.exit(1);
}

// Step 1: Find all application folders and their .ets files
console.log(`${colors.blue}Step 1: Scanning application folders for .ets files...${colors.reset}`);
const step1StartTime = Date.now();

// Get all subdirectories (each is an application)
const appFolders = fs.readdirSync(advancedUiRoot, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => name !== '.' && name !== '..');

console.log(`Found ${appFolders.length} application folder(s)`);

// Find all .ets files in each application folder
const allEtsFiles = [];

for (const appFolder of appFolders) {
  const appPath = path.join(advancedUiRoot, appFolder);

  // Recursively find all .ets files in this application folder
  function findEtsFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findEtsFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ets')) {
        allEtsFiles.push({
          appFolder,
          filePath: fullPath,
          fileName: entry.name
        });
      }
    }
  }

  findEtsFiles(appPath);
}

// Sort by app folder then file name
allEtsFiles.sort((a, b) => {
  if (a.appFolder !== b.appFolder) {
    return a.appFolder.localeCompare(b.appFolder);
  }
  return a.fileName.localeCompare(b.fileName);
});

let filteredFiles = allEtsFiles;
if (filterArg) {
  const filter = filterArg.split('=')[1];
  filteredFiles = allEtsFiles.filter(f =>
    f.appFolder.includes(filter) || f.fileName.includes(filter)
  );
  console.log(`Filter: "${filter}" - found ${filteredFiles.length} matching files`);
}

console.log(`Found ${filteredFiles.length} .ets file(s) across ${appFolders.length} application(s)`);

// Generate config for each .ets file
const generatedConfigs = [];
for (const { appFolder, filePath, fileName } of filteredFiles) {
  const componentName = fileName.replace('.ets', '').replace(/[@.]/g, '_');
  const configFileName = `${appFolder}_${componentName}_build_config.json`;
  const configPath = path.join(outputDir, configFileName);

  // Create config based on template
  const config = { ...templateConfig };
  config.compileFiles = [filePath];
  config.entryFiles = [filePath];
  config.projectRootPath = path.join(advancedUiRoot, appFolder);
  config.moduleRootPath = path.dirname(filePath);
  config.codeRootPath = path.join(advancedUiRoot, appFolder);

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  generatedConfigs.push({
    name: `${appFolder}/${fileName}`,
    configPath
  });
}

const step1Duration = Date.now() - step1StartTime;
console.log(`${colors.green}✓ Config generation completed in ${formatDuration(step1Duration)}${colors.reset}`);
console.log('');

// Step 2: Compile each component
console.log(`${colors.blue}Step 2: Compiling ${generatedConfigs.length} Advanced UI components...${colors.reset}`);
console.log('');

async function compileApplications() {
  let successCount = 0;
  let failCount = 0;
  const failedApps = [];

  for (const { name, configPath } of generatedConfigs) {
    const logFile = path.join(logsDir, `${name.replace(/[\/@]/g, '_')}.log`);

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
        console.log(`${colors.dim}[${index}/${generatedConfigs.length}]${colors.reset} [DRY RUN] ${name}`);
        successCount++;
      } else {
        // Compile the app and capture output
        const libraryPath = path.join(workspace, 'out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib');
        const compileEnv = { ...process.env, LD_LIBRARY_PATH: libraryPath };

        console.log(`${colors.dim}[${index}/${generatedConfigs.length}]${colors.reset} Compiling: ${name}...`);

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
          // Only print output on error or in verbose mode
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
          failedApps.push({ name, error: `Exit code: ${exitCode}`, log: logFile });

          // Write error details to log file
          const logContent = `=== Compilation Failed: ${name} ===\n` +
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
      failedApps.push({ name, error: error.message, log: logFile });

      // Write error to log file
      const logContent = `=== Error: ${name} ===\n` +
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
  console.log(`Total: ${generatedConfigs.length}`);
  console.log(`${colors.green}Success: ${successCount}${colors.reset}`);
  console.log(`${failCount > 0 ? colors.red : ''}Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.dim}Total Duration: ${formatDuration(totalDuration)}${colors.reset}`);
  console.log(`${colors.dim}Logs Directory: ${logsDir}${colors.reset}`);

  if (failedApps.length > 0) {
    console.log('');
    console.log(`${colors.red}Failed components:${colors.reset}`);
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
