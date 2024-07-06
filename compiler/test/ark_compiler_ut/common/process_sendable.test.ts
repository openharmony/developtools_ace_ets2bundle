/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

import { expect } from 'chai';
import mocha from 'mocha';
import * as ts from 'typescript';
import path from 'path';
import { hasDecorator } from '../../../lib/utils';
import { hasArkDecorator } from '../../../lib/fast_build/ark_compiler/utils';
import {
  processSendableClass,
  processSendableFunction,
  processSendableType
} from '../../../lib/process_sendable';
import { COMPONENT_SENDABLE_DECORATOR } from '../../../lib/pre_define';

const SENDABLE_WITHOUT_CONSTRUCTOR_CODE: string =
`
@Sendable
class sendableClass {}
`

const SENDABLE_WITHOUT_CONSTRUCTOR_CODE_EXPECT: string =
'"use strict";\n' +
'class sendableClass {\n' +
'    constructor() {\n' +
'        "use sendable";\n' +
'    }\n' +
'}\n' +
'//# sourceMappingURL=sendableTest.js.map'

const SENDABLE_WITH_CONSTRUCTOR_CODE: string =
`
@Sendable
class sendableClass {
  constructor() {}
}
`

const SENDABLE_WITH_CONSTRUCTOR_CODE_EXPECT: string =
'"use strict";\n' +
'class sendableClass {\n' +
'    constructor() {\n' +
'        "use sendable";\n' +
'    }\n' +
'}\n' +
'//# sourceMappingURL=sendableTest.js.map'

const SENDABLE_FUNCTION_WITH_BODY: string = 
`
@Sendable
function sendableFunction() {}
`

const SENDABLE_FUNCTION_WITH_BODY_EXPECT: string = 
`"use strict";
function sendableFunction() {
    "use sendable";
}
//# sourceMappingURL=sendableTest.js.map`

const SENDABLE_FUNCTION_WITHOUT_BODY: string = 
`
@Sendable
function sendableFunction()
`

const SENDABLE_FUNCTION_WITHOUT_BODY_EXPECT: string = 
`"use strict";
//# sourceMappingURL=sendableTest.js.map`

const SENDABLE_TYPE: string = 
`
@Sendable
type SendableFunctionType = () => void
`

const SENDABLE_TYPE_EXPECT: string = 
`"use strict";
//# sourceMappingURL=sendableTest.js.map`

const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;

function processSendable(): Function {
  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = node => {
      if (ts.isClassDeclaration(node) && hasDecorator(node, COMPONENT_SENDABLE_DECORATOR)) {
        return processSendableClass(node);
      }
      if (ts.isFunctionDeclaration(node) && hasArkDecorator(node, COMPONENT_SENDABLE_DECORATOR)) {
        return processSendableFunction(node);
      }
      if (ts.isTypeAliasDeclaration(node) && hasArkDecorator(node, COMPONENT_SENDABLE_DECORATOR)) {
        return processSendableType(node);
      }
      return node;
    };

    return (node: ts.SourceFile) => {
      return ts.visitEachChild(node, visitor, context);
    };
  }
}

mocha.describe('process sendable decorator', function () {
  mocha.it('1-1: process sendable class without constrcutor tests', function () {
    const result: ts.TranspileOutput = ts.transpileModule(SENDABLE_WITHOUT_CONSTRUCTOR_CODE, {
      compilerOptions: compilerOptions,
      fileName: "sendableTest.ts",
      transformers: { before: [ processSendable() ] }
    });
    expect(result.outputText == SENDABLE_WITHOUT_CONSTRUCTOR_CODE_EXPECT).to.be.true;
  });
  mocha.it('1-2: process sendable class with constrcutor tests', function () {
    const result: ts.TranspileOutput = ts.transpileModule(SENDABLE_WITH_CONSTRUCTOR_CODE, {
      compilerOptions: compilerOptions,
      fileName: "sendableTest.ts",
      transformers: { before: [ processSendable() ] }
    });
    expect(result.outputText == SENDABLE_WITH_CONSTRUCTOR_CODE_EXPECT).to.be.true;
  });
  mocha.it('2-1: process sendable function with body tests', function () {
    const result: ts.TranspileOutput = ts.transpileModule(SENDABLE_FUNCTION_WITH_BODY, {
      compilerOptions: compilerOptions,
      fileName: "sendableTest.ts",
      transformers: { before: [ processSendable() ] }
    });
    expect(result.outputText == SENDABLE_FUNCTION_WITH_BODY_EXPECT).to.be.true;
  });
  mocha.it('2-2: process sendable function without body tests', function () {
    const result: ts.TranspileOutput = ts.transpileModule(SENDABLE_FUNCTION_WITHOUT_BODY, {
      compilerOptions: compilerOptions,
      fileName: "sendableTest.ts",
      transformers: { before: [ processSendable() ] }
    });
    expect(result.outputText == SENDABLE_FUNCTION_WITHOUT_BODY_EXPECT).to.be.true;
  });
  mocha.it('3-1: process sendable type tests', function () {
    const result: ts.TranspileOutput = ts.transpileModule(SENDABLE_TYPE, {
      compilerOptions: compilerOptions,
      fileName: "sendableTest.ts",
      transformers: { before: [ processSendable() ] }
    });
    expect(result.outputText == SENDABLE_TYPE_EXPECT).to.be.true;
  });
})