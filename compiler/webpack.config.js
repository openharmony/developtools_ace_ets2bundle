/*
 * Copyright (c) 2020 Huawei Device Co., Ltd.
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

const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const  { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { GenAbcPlugin } = require('./lib/gen_abc_plugin');
const { OHMResolverPlugin } = require('./lib/resolve_ohm_url');
const buildPipeServer = require('./server/build_pipe_server');

const {
  projectConfig,
  loadEntryObj,
  loadWorker,
  abilityConfig,
  readWorkerFile,
  loadModuleInfo,
  checkAppResourcePath,
  addSDKBuildDependencies
} = require('./main');
const { ResultStates } = require('./lib/compile_info');
const { processUISyntax } = require('./lib/process_ui_syntax');
const { IGNORE_ERROR_CODE } = require('./lib/utils');
const { BUILD_SHARE_PATH } = require('./lib/pre_define');
const { processJs } = require('./lib/process_js_ast');
process.env.watchMode = (process.env.watchMode && process.env.watchMode === 'true') || 'false';

function initConfig(config) {
  const projectPath = path.resolve(projectConfig.projectPath);
  Object.assign(config, {
    entry: projectConfig.entryObj,
    watch: process.env.watchMode === 'true',
    watchOptions: {
      aggregateTimeout: 10,
      poll: false,
      ignored: /node_modules/
    },
    output: {
      path: path.resolve(__dirname, projectConfig.buildPath),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
      globalObject: 'globalThis'
    },
    devtool: 'nosources-source-map',
    mode: 'development',
    module: {
      rules: [
        {
          test:/\.(jpg|png|gif|jpeg|mp3|mp4|svg)$/,
          use:{
            loader:'url-loader'
          }
        },
        {
          test: /\.d\.ts/,
          loader: 'ignore-loader'
        },
        {
          test: /(?<!\.d)\.(ets|ts)$/,
          use: [
            { loader: path.resolve(__dirname, 'lib/result_process.js') },
            {
              loader: 'ts-loader',
              options: {
                onlyCompileBundledFiles: true,
                transpileOnly: true,
                configFile: path.resolve(__dirname, 'tsconfig.json'),
                getCustomTransformers(program) {
                  let transformerOperation = {
                    before: [processUISyntax(program)],
                    after: []
                  };
                  if (projectConfig.compileMode === 'esmodule' && projectConfig.processTs === false
                  && process.env.compilerType && process.env.compilerType === 'ark') {
                    transformerOperation.after.push(processJs(program));
                  }

                  return transformerOperation;
                },
                ignoreDiagnostics: IGNORE_ERROR_CODE
              }
            },
            { loader: path.resolve(__dirname, 'lib/pre_process.js') }
          ]
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: [
                  '@babel/plugin-transform-modules-commonjs',
                  '@babel/plugin-proposal-class-properties'
                ],
                compact: false
              },
            },
            { loader: path.resolve(__dirname, 'lib/process_js_file.js')},
            { loader: path.resolve(__dirname, 'lib/process_system_module.js') }
          ]
        }
      ]
    },
    node: {
      global: false
    },
    resolve: {
      plugins: [new OHMResolverPlugin()],
      extensions: ['.js', '.ets', '.ts', '.d.ts'],
      modules: [
        projectPath,
        './node_modules',
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, '../../api')
      ]
    },
    stats: { preset: 'none' },
    plugins: [
      new Webpack.WatchIgnorePlugin({
        paths: [
          /\.d\.ts$/
        ]
      }),
      new ResultStates()
    ]
  });
  if (!projectConfig.xtsMode) {
    config.cache = {
      type: "filesystem",
      cacheDirectory: path.resolve(projectConfig.cachePath, '.ets_cache')
    };
  }
  if (!projectConfig.aceModuleJsonPath) {
    config.resolve.modules.push(path.join(projectPath, '../../../../../'));
    config.resolve.modules.push(path.resolve(projectPath, '../../../../node_modules'));
    config.resolve.modules.push(path.resolve(projectPath, '../../../../../node_modules'));
    config.resolve.modules.push(path.resolve(projectPath, '../../'));
    existsPackageJson(config, path.resolve(projectPath, '../../../../../package.json'),
      path.resolve(projectPath, '../../../../package.json'));
  } else {
    config.resolve.modules.push(path.join(projectPath, '../../../../'));
    config.resolve.modules.push(path.resolve(projectPath, '../../../node_modules'));
    config.resolve.modules.push(path.resolve(projectPath, '../../../../node_modules'));
    config.resolve.modules.push(path.resolve(projectPath, '../'));
    existsPackageJson(config, path.resolve(projectPath, '../../../../package.json'),
      path.resolve(projectPath, '../../../package.json'));
  }
}

function existsPackageJson(config, rootPackageJsonPath, modulePackageJsonPath) {
  if (config.cache) {
    config.cache.buildDependencies = {
      config: []
    };
    if (fs.existsSync(rootPackageJsonPath)) {
      config.cache.buildDependencies.config.push(rootPackageJsonPath);
    }
    if (fs.existsSync(modulePackageJsonPath)) {
      config.cache.buildDependencies.config.push(modulePackageJsonPath);
    }
  }
}

function setProjectConfig(envArgs) {
  const args = Object.keys(envArgs);
  if (args.indexOf('projectName') === args.length - 2) {
    projectConfig.projectPath = path.join(process.cwd(), args[args.length - 1]);
  }
  if (envArgs.aceModuleRoot) {
    projectConfig.projectPath = envArgs.aceModuleRoot;
  }
  if (envArgs.aceModuleBuild) {
    projectConfig.buildPath = envArgs.aceModuleBuild;
  }
  if (envArgs.aceManifestPath) {
    projectConfig.manifestFilePath = envArgs.aceManifestPath;
  }
  if (envArgs.aceProfilePath) {
    projectConfig.aceProfilePath = envArgs.aceProfilePath;
  }
  if (envArgs.aceModuleJsonPath) {
    projectConfig.aceModuleJsonPath = envArgs.aceModuleJsonPath;
  }
  if (envArgs.cachePath) {
    projectConfig.cachePath = envArgs.cachePath;
  }
  if (envArgs.watchMode) {
    projectConfig.hotReloadWatch = envArgs.watchMode;
  }
}

function setReleaseConfig(config) {
  const TerserPlugin = require('terser-webpack-plugin');
  config.mode = 'production';
  if (process.env.compileMode !== 'moduleJson' && abilityConfig.abilityType === 'page') {
    config.optimization = config.optimization;
  } else {
    config.optimization = {};
  }
  Object.assign(config.optimization, {
    emitOnErrors: true,
    usedExports: false,
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          join_vars: false,
          sequences: 0
        },
        format: {
          semicolons: false,
          beautify: true,
          indent_level: 2
        }
      }
    })]
  });
  config.output.sourceMapFilename = '_releaseMap/[name].js.map';
  config.performance = {
    hints: false
  };
}

function setCopyPluginConfig(config, appResource, isPreview) {
  const copyPluginPattrens = [];
  copyPluginPattrens.push({
    from: '**/*',
    context: path.resolve(__dirname, projectConfig.projectPath),
    globOptions: {
      ignore: [
        '**/*.ets',
        '**/*.ts',
        '**/*.js',
        path.resolve(__dirname, projectConfig.buildPath, '**').replace(/\\/g, '/')
      ]
    },
    to: path.resolve(__dirname, projectConfig.buildPath),
    noErrorOnMissing: true
  });
  const sharePath = path.resolve(__dirname, projectConfig.projectPath, BUILD_SHARE_PATH);
  if (fs.existsSync(sharePath)) {
    copyPluginPattrens.push({
      from: '**/*',
      context: path.resolve(__dirname, projectConfig.projectPath, BUILD_SHARE_PATH),
      to: path.resolve(__dirname, projectConfig.buildPath, BUILD_SHARE_PATH),
      globOptions: {
        ignore: [
          '**/*.ets',
          '**/*.ts',
          '**/*.js',
        ]
      },
      noErrorOnMissing: true
    });
  }
  if (abilityConfig.abilityType === 'page') {
    if (fs.existsSync(projectConfig.manifestFilePath)) {
      copyPluginPattrens.push({
        from: projectConfig.manifestFilePath,
        to: path.resolve(__dirname, projectConfig.buildPath)
      });
    } else if (fs.existsSync(projectConfig.aceConfigPath)) {
      copyPluginPattrens.push({
        from: projectConfig.aceConfigPath,
        to: path.resolve(__dirname, projectConfig.buildPath)
      });
    }
  }
  if (appResource && fs.existsSync(appResource) && !projectConfig.xtsMode &&
    isPreview === 'true') {
    copyPluginPattrens.push({
      from: path.resolve(__dirname, appResource),
      to: path.resolve(__dirname, projectConfig.cachePath)
    });
  }
  config.plugins.push(new CopyPlugin({ patterns: copyPluginPattrens }));
}

function excludeWorker(workerFile, name) {
  if (workerFile) {
    return Object.keys(workerFile).includes(name);
  }
  return /^\.\/workers\//.test(name);
}

function setOptimizationConfig(config, workerFile) {
  if (process.env.compileMode !== 'moduleJson' && abilityConfig.abilityType === 'page') {
    config.optimization = {
      splitChunks: {
        chunks(chunk) {
          return !excludeWorker(workerFile, chunk.name) && !/^\.\/TestAbility/.test(chunk.name);
        },
        minSize: 0,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: "vendors",
          },
          commons: {
            name: 'commons',
            priority: -20,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      }
    }
  }
}

function setTsConfigFile() {
  let tsconfigTemplate =
    path.resolve(__dirname, projectConfig.compileMode === 'esmodule' ? 'tsconfig.esm.json' : 'tsconfig.cjs.json');
  if (fs.existsSync(tsconfigTemplate) && fs.statSync(tsconfigTemplate).isFile()) {
    let currentTsconfigFile = path.resolve(__dirname, 'tsconfig.json');
    let tsconfigTemplateNew =
      currentTsconfigFile.replace(/.json$/, projectConfig.compileMode === 'esmodule' ? '.cjs.json' : '.esm.json');
    fs.renameSync(currentTsconfigFile, tsconfigTemplateNew);

    let tsconfigFileNew =
      tsconfigTemplate.replace(projectConfig.compileMode === 'esmodule' ? /.esm.json$/ : /.cjs.json$/, '.json');
    fs.renameSync(tsconfigTemplate, tsconfigFileNew);
  }
}

function setGenAbcPlugin(env, config) {
  process.env.compilerType = 'ark';
  process.env.panda = projectConfig.pandaMode;
  let arkDir = path.join(__dirname, 'bin', 'ark');
  if (env.arkFrontendDir) {
    arkDir = env.arkFrontendDir;
  }
  let nodeJs = 'node';
  if (env.nodeJs) {
    nodeJs = env.nodeJs;
  }
  config.plugins.push(new GenAbcPlugin(projectConfig.buildPath, arkDir, nodeJs,
    env.buildMode === 'debug'));
  if (env.buildMode === 'release') {
    config.output.path = path.join(projectConfig.cachePath, 'releaseAssets',
      path.basename(projectConfig.buildPath))
  }
}

function setCleanWebpackPlugin(workerFile, config) {
  if (projectConfig.compileMode === 'esmodule') {
    return;
  }
  let cleanPath = [];
  cleanPath.push(projectConfig.buildPath);
  if (workerFile) {
    let workerFilesPath = Object.keys(workerFile);
    for (let workerFilePath of workerFilesPath) {
      cleanPath.push(path.join(projectConfig.buildPath, workerFilePath, '..'));
    }
  }

  config.plugins.push(
    new CleanWebpackPlugin({
      dry: false,
      dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: cleanPath
    })
  );
}

module.exports = (env, argv) => {
  const config = {};
  setProjectConfig(env, appResourcePath);
  loadEntryObj(projectConfig);
  loadModuleInfo(projectConfig, env);
  setTsConfigFile();
  initConfig(config);
  const workerFile = readWorkerFile();
  setOptimizationConfig(config, workerFile);
  setCleanWebpackPlugin(workerFile, config);

  if (env.isPreview !== "true") {
    loadWorker(projectConfig, workerFile);
    if (env.compilerType && env.compilerType === 'ark') {
      setGenAbcPlugin(env, config);
    }
  } else {
    projectConfig.isPreview = true;
    projectConfig.checkEntry = env.checkEntry;
    setGenAbcPlugin(env, config);
    let port;
    process.argv.forEach((val, index) => {
      if(val.startsWith('port=')){
        port = val.split('=')[1];
      }
    });
    if (port) {
      buildPipeServer.init(port);
    }
  }

  if (env.sourceMap === 'none') {
    config.devtool = false;
  }

  if (env.buildMode === 'release') {
    setReleaseConfig(config);
  }

  const appResourcePath = env.appResource || process.env.appResource;
  checkAppResourcePath(appResourcePath, config);
  addSDKBuildDependencies(config);
  setCopyPluginConfig(config, appResourcePath, env.isPreview);
  config.output.library = projectConfig.hashProjectPath;
  return config;
}
