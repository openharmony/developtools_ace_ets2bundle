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

const ts = require('typescript');
const path = require('path');
const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;
const {
  processUISyntax,
  transformLog
} = require('../lib/process_ui_syntax');
const {
  validateUISyntax,
  preprocessExtend,
  resetComponentCollection,
  componentCollection
} = require('../lib/validate_ui_syntax');
const {
  componentInfo,
  readFile,
  storedFileInfo
} = require('../lib/utils');
const {
  BUILD_ON,
  OHOS_PLUGIN,
  NATIVE_MODULE,
  SYSTEM_PLUGIN
} = require('../lib/pre_define');
const {
  partialUpdateConfig,
  projectConfig
} = require('../main');

projectConfig.projectPath = path.resolve(process.cwd());

function expectActual(name, filePath, checkError = false) {
  const content = require(filePath);
  const source = content.source;
  process.env.compiler = BUILD_ON;
  storedFileInfo.setCurrentArkTsFile();
  const afterProcess = sourceReplace(source);
  validateUISyntax(source, afterProcess.content, `${name}.ets`);
  const compilerOptions = ts.readConfigFile(
    path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
  Object.assign(compilerOptions, {
    'sourceMap': false
  });
  const result = ts.transpileModule(afterProcess.content, {
    compilerOptions: compilerOptions,
    fileName: `${name}.ets`,
    transformers: { before: [processUISyntax(null, true)] }
  });
  componentInfo.id = 0;
  componentCollection.customComponents.clear();
  resetComponentCollection();
  if (checkError) {
    assertError(name);
    transformLog.errors = [];
  } else {
    expect(result.outputText).eql(content.expectResult);
  }
}

mocha.describe('compiler', () => {
  let utPath = path.resolve(__dirname, './ut');
  if (process.argv.includes('--partialUpdate')) {
    partialUpdateConfig.partialUpdateMode = true;
    utPath = path.resolve(__dirname, './utForPartialUpdate');
  } else if (process.argv.includes('--assertError')) {
    partialUpdateConfig.partialUpdateMode = true;
    utPath = path.resolve(__dirname, './utForValidate');
  }
  const utFiles = [];
  readFile(utPath, utFiles);
  utFiles.forEach((item) => {
    const fileName = path.basename(item, '.ts');
    mocha.it(fileName, () => {
      if (process.argv.includes('--assertError')) {
        expectActual(fileName, item, true);
      } else {
        expectActual(fileName, item);
      }
    });
  });
});

function sourceReplace(source) {
  let content = source;
  const log = [];
  content = preprocessExtend(content);
  content = processSystemApi(content);
  return {
    content: content,
    log: log
  };
}

function processSystemApi(content) {
  const REG_SYSTEM = 
    /import\s+(.+)\s+from\s+['"]@(system|ohos)\.(\S+)['"]|import\s+(.+)\s*=\s*require\(\s*['"]@(system|ohos)\.(\S+)['"]\s*\)/g;
  const REG_LIB_SO =
    /import\s+(.+)\s+from\s+['"]lib(\S+)\.so['"]|import\s+(.+)\s*=\s*require\(\s*['"]lib(\S+)\.so['"]\s*\)/g;
  const newContent = content.replace(REG_LIB_SO, (_, item1, item2, item3, item4) => {
    const libSoValue = item1 || item3;
    const libSoKey = item2 || item4;
    return `var ${libSoValue} = globalThis.requireNapi("${libSoKey}", true);`;
  }).replace(REG_SYSTEM, (item, item1, item2, item3, item4, item5, item6, item7) => {
    let moduleType = item2 || item5;
    let systemKey = item3 || item6;
    let systemValue = item1 || item4;
    if (NATIVE_MODULE.has(`${moduleType}.${systemKey}`)) {
      item = `var ${systemValue} = globalThis.requireNativeModule('${moduleType}.${systemKey}')`;
    } else if (moduleType === SYSTEM_PLUGIN) {
      item = `var ${systemValue} = isSystemplugin('${systemKey}', '${SYSTEM_PLUGIN}') ? ` +
        `globalThis.systemplugin.${systemKey} : globalThis.requireNapi('${systemKey}')`;
    } else if (moduleType === OHOS_PLUGIN) {
      item = `var ${systemValue} = globalThis.requireNapi('${systemKey}') || ` +
        `(isSystemplugin('${systemKey}', '${OHOS_PLUGIN}') ? ` +
        `globalThis.ohosplugin.${systemKey} : isSystemplugin('${systemKey}', '${SYSTEM_PLUGIN}') ` +
        `? globalThis.systemplugin.${systemKey} : undefined)`;
    }
    return item;
  });
  return newContent;
}

function assertError(fileName) {
  switch (fileName) {
    case '@linkInitialize': {
      expect(transformLog.errors[0].message).to.be.equal(`The @Link property 'link' cannot be specified a default value.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case '@objectLinkInitialize': {
      expect(transformLog.errors[0].message).to.be.equal(`The @ObjectLink property 'objectLink' cannot be specified a default value.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    // process_component_build.ts
    case 'rootContainerCheck': {
      expect(transformLog.errors[0].message).to.be.equal(`There should have a root container component.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'arkUIComponent': {
      expect(transformLog.errors[0].message).to.be.equal(`Only UI component syntax can be written in build method.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case '@BuilderParam': {
      expect(transformLog.errors[0].message).to.be.equal(
        `In the trailing lambda case, 'CustomContainer' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'forEachParamCheck': {
      expect(transformLog.errors[0].message).to.be.equal(`There should be wrapped in curly braces in ForEach.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'ifComponent': {
      expect(transformLog.errors[0].message).to.be.equal(`Condition expression cannot be null in if statement.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      expect(transformLog.errors[1].message).to.be.equal(`Then statement cannot be null in if statement.`);
      expect(transformLog.errors[1].type).to.be.equal('ERROR');
      break;
    }
    case 'idCheck': {
      expect(transformLog.errors[0].message).to.be.equal(
        `The current component id "1" is duplicate with /home/bojiang/openharmony/developtools/ace_ets2bundle/compiler/idCheck.ets:7:21.`);
      expect(transformLog.errors[0].type).to.be.equal('WARN');
      break;
    }
    case 'arkUIStandard': {
      expect(transformLog.errors[0].message).to.be.equal(`'Text('Hello').onCilck' does not meet UI component syntax.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'stateStyles': {
      expect(transformLog.errors[0].message).to.be.equal(`.stateStyles doesn't conform standard.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'buttonCheck': {
      expect(transformLog.errors[0].message).to.be.equal(`The Button component with a label parameter can not have any child.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
    case 'attributeCheck': {
      expect(transformLog.errors[0].message).to.be.equal(`'ForEach(this.arr, () =>{}, this.arr[0]).h' does not meet UI component syntax.`);
      expect(transformLog.errors[0].type).to.be.equal('ERROR');
      break;
    }
  }
}
