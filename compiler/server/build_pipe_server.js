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

const { processComponentChild } = require('../lib/process_component_build');

const WebSocketServer = WebSocket.Server;

let pluginSocket = '';

let supplement = {
  isAcceleratePreview: false,
  line: 0,
  column: 0
}

const pluginCommandChannelMessageHandlers = {
  'compileComponent': handlePluginCompileComponent,
  'default': () => {}
};

function init(port) {
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
  const receivedMsg = jsonData;
  const sourceNode = ts.createSourceFile('preview.ts', receivedMsg.data.script,
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const previewStatements = [];
  const log = [];
  supplement = {
    isAcceleratePreview: true,
    line: parseInt(JSON.parse(receivedMsg.data.offset).line),
    column: parseInt(JSON.parse(receivedMsg.data.offset).column)
  }
  processComponentChild(sourceNode, previewStatements, log, supplement);
  supplement.isAcceleratePreview = false;
  const newSource = ts.factory.updateSourceFile(sourceNode, previewStatements);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, newSource, newSource);
  receivedMsg.data.script = ts.transpileModule(result, {}).outputText;
  if (receivedMsg.data.offset) {
    for (let i = 0; i < log.length; i++) {
      let line = parseInt(newSource.getLineAndCharacterOfPosition(log[i].pos).line);
      let column = parseInt(newSource.getLineAndCharacterOfPosition(log[i].pos).character);
      if (line === 0) {
        log[i].line = parseInt(JSON.parse(receivedMsg.data.offset).line);
        log[i].column = parseInt(JSON.parse(receivedMsg.data.offset).column) + column;
      } else {
        log[i].line = parseInt(JSON.parse(receivedMsg.data.offset).line) + line;
        log[i].column = column;
      }
    }
  }
  receivedMsg.data.log = log;
  if (pluginSocket.readyState === WebSocket.OPEN){
    responseToPlugin(receivedMsg);
  }
}

function responseToPlugin(jsonData) {
  pluginSocket.send(JSON.stringify(jsonData), (err) => {});
}

module.exports = {
  init
};
