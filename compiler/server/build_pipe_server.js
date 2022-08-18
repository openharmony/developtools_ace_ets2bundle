/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

const WebSocket = require('ws');
const ts = require('typescript');
const path = require('path');
const fs = require('fs');
const process = require('child_process');

const { processComponentChild } = require('../lib/process_component_build');
const { createWatchCompilerHost } = require('../lib/ets_checker');
const { writeFileSync } = require('../lib/utils');
const { projectConfig } = require('../main');
const { props } = require('../lib/compile_info');

const WebSocketServer = WebSocket.Server;

let pluginSocket = '';

let supplement = {
  isAcceleratePreview: false,
  line: 0,
  column: 0,
  fileName: ''
}

const pluginCommandChannelMessageHandlers = {
  'compileComponent': handlePluginCompileComponent,
  'default': () => {}
};
const es2abcFilePath = path.join(__dirname, '../bin/ark/build-win/bin/es2abc');

let previewCacheFilePath;
const messages = [];
let start = false;
let checkStatus = false;
let compileStatus = false;
let receivedMsg_;
let errorInfo;
let compileWithCheck;

function init(port) {
  previewCacheFilePath =
    path.join(projectConfig.cachePath || projectConfig.buildPath, 'preview.ets');
  const rootFileNames = [];
  if (!fs.existsSync(previewCacheFilePath)) {
    writeFileSync(previewCacheFilePath, '');
  }
  rootFileNames.push(previewCacheFilePath);
  ts.createWatchProgram(
    createWatchCompilerHost(rootFileNames, resolveDiagnostic, delayPrintLogCount, true));
  const wss = new WebSocketServer({port: port});
  wss.on('connection', function(ws) {
    pluginSocket = ws;
    handlePluginConnect(ws);
  });
}

function handlePluginConnect(ws) {
  ws.on('message', function(message) {
    const jsonData = JSON.parse(message);
    handlePluginCommand(jsonData);
  });
}

function handlePluginCommand(jsonData) {
  pluginCommandChannelMessageHandlers[jsonData.command]
    ? pluginCommandChannelMessageHandlers[jsonData.command](jsonData)
    : pluginCommandChannelMessageHandlers['default'](jsonData);
}

function handlePluginCompileComponent(jsonData) {
  if (jsonData) {
    messages.push(jsonData);
    if (receivedMsg_) {
      return;
    }
  } else if (messages.length > 0){
    jsonData = messages[0];
  } else {
    return
  }
  start = true;
  const receivedMsg = jsonData;
  const compilerOptions = ts.readConfigFile(
    path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
    Object.assign(compilerOptions, {
      "sourceMap": false,
    });
  const sourceNode = ts.createSourceFile('preview.ets',
    'struct preview{build(){' + receivedMsg.data.script + '}}',
    ts.ScriptTarget.Latest, true, ts.ScriptKind.ETS, compilerOptions);
  compileWithCheck = jsonData.data.compileWithCheck || 'true';
  if (previewCacheFilePath && fs.existsSync(previewCacheFilePath)
    && compileWithCheck === 'true') {
      writeFileSync(previewCacheFilePath, 'struct preview{build(){' + receivedMsg.data.script + '}}');
  }
  const previewStatements = [];
  const log = [];
  supplement = {
    isAcceleratePreview: true,
    line: parseInt(JSON.parse(receivedMsg.data.offset).line),
    column: parseInt(JSON.parse(receivedMsg.data.offset).column),
    fileName: receivedMsg.data.filePath || ''
  }
  processComponentChild(sourceNode.statements[0].members[1].body, previewStatements, log, supplement);
  supplement.isAcceleratePreview = false;
  const newSource = ts.factory.updateSourceFile(sourceNode, previewStatements);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, newSource, newSource);
  receivedMsg.data.script = ts.transpileModule(result, {}).outputText;
  if (receivedMsg.data.offset) {
    for (let i = 0; i < log.length; i++) {
      let line = parseInt(sourceNode.getLineAndCharacterOfPosition(log[i].pos).line);
      let column = parseInt(sourceNode.getLineAndCharacterOfPosition(log[i].pos).character);
      if (line === 0) {
        log[i].line = parseInt(JSON.parse(receivedMsg.data.offset).line);
        log[i].column = parseInt(JSON.parse(receivedMsg.data.offset).column) + column - 15;
      } else {
        log[i].line = parseInt(JSON.parse(receivedMsg.data.offset).line) + line;
        log[i].column = column;
      }
    }
  }
  receivedMsg.data.log = log;
  if (fs.existsSync(es2abcFilePath + '.exe') || fs.existsSync(es2abcFilePath)){
    es2abc(receivedMsg);
  }
}


function es2abc(receivedMsg) {
  const cmd = es2abcFilePath + ' --base64Input ' +
    Buffer.from(receivedMsg.data.script).toString('base64') + ' --base64Output';
  try {
    process.exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        receivedMsg.data.script = stdout;
      } else {
        receivedMsg.data.script = "";
      }
      compileStatus = true;
      receivedMsg_ = receivedMsg;
      responseToPlugin();
    })
  } catch (e) {
  }
}

function resolveDiagnostic(diagnostic) {
  errorInfo = [];
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (validateError(message)) {
    if (diagnostic.file) {
      const { line, character } =
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        errorInfo.push(
          `ETS:ERROR File: ${diagnostic.file.fileName}:${line + 1}:${character + 1}\n ${message}\n`);
    } else {
      errorInfo.push(`ETS:ERROR: ${message}`);
    }
  }
}

function delayPrintLogCount() {
  if (start == true) {
    checkStatus = true;
    responseToPlugin();
  }
}

function responseToPlugin() {
  if ((compileWithCheck !== "true" && compileStatus == true) ||
    (compileWithCheck === "true" && compileStatus == true && checkStatus == true) ) {
    if (receivedMsg_) {
      if (errorInfo) {
        receivedMsg_.data.log =  receivedMsg_.data.log || [];
        receivedMsg_.data.log.push(...errorInfo);
      }
      pluginSocket.send(JSON.stringify(receivedMsg_), (err) => {
        start = false;
        checkStatus = false;
        compileStatus = false;
        errorInfo = undefined;
        receivedMsg_ = undefined;
        messages.shift();
        if (messages.length > 0) {
          handlePluginCompileComponent();
        }
      });
    }
  }
}

function validateError(message) {
  const propInfoReg = /Cannot find name\s*'(\$?\$?[_a-zA-Z0-9]+)'/;
  const stateInfoReg = /Property\s*'(\$?[_a-zA-Z0-9]+)' does not exist on type/;
  if (matchMessage(message, props, propInfoReg) ||
    matchMessage(message, props, stateInfoReg)) {
    return false;
  }
  return true;
}

function matchMessage(message, nameArr, reg) {
  if (reg.test(message)) {
    const match = message.match(reg);
    if (match[1] && nameArr.includes(match[1])) {
      return true;
    }
  }
  return false;
}

module.exports = {
  init
};