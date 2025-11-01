/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import sinon from 'sinon';
import ts from 'typescript';
import path from 'path';
import {
  addDeclFilesConfig,
  arkTSEvolutionModuleMap,
  arkTSModuleMap,
  cleanUpProcessArkTSEvolutionObj,
  collectArkTSEvolutionModuleInfo,
  interopTransform,
  interopTransformLog,
  pkgDeclFilesConfig
} from '../../../lib/fast_build/ark_compiler/interop/process_arkts_evolution';
import {
  BUNDLE_NAME_DEFAULT,
  HAR_DECLGENV2OUTPATH
} from '../mock/rollup_mock/common';
import {
  LogData,
  LogDataFactory
} from '../../../lib/fast_build/ark_compiler/logger';
import {
  ArkTSErrorDescription,
  ErrorCode
} from '../../../lib/fast_build/ark_compiler/error_code';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { CommonLogger } from '../../../lib/fast_build/ark_compiler/logger';

const testFileName: string = '/TestProject/entry/test.ets';

function createDualSourceProgram(testContent: string): { program: ts.Program, testSourceFile: ts.SourceFile } {
  const declgenV1OutPath: string = '/TestProject/arkTSEvo/build/default/intermediates/declgen/default/declgenV1';
  arkTSEvolutionModuleMap.set('arkTSEvo', {
    language: '1.2',
    packageName: 'arkTSEvo',
    moduleName: 'arkTSEvo',
    modulePath: '/TestProject/arkTSEvo/',
    declgenV1OutPath
  });

  const declFileName: string = path.join(declgenV1OutPath, 'arkTSEvo/src/main/ets/decl.d.ets');
  const declSourceFile = ts.createSourceFile(declFileName, DECLFILE_CODE, ts.ScriptTarget.ESNext, true);
  const testSourceFile = ts.createSourceFile(testFileName, testContent, ts.ScriptTarget.ESNext, true);
  Object.defineProperty(declSourceFile, 'fileName', { value: declFileName });
  Object.defineProperty(testSourceFile, 'fileName', { value: testFileName });

  const compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ESNext });
  const sourceFiles = new Map<string, ts.SourceFile>([
    [declFileName, declSourceFile],
    [testFileName, testSourceFile]
  ]);
  compilerHost.getSourceFile = (fileName, languageVersion) => sourceFiles.get(fileName);
  compilerHost.resolveModuleNames = (moduleNames, containingFile) => {
    return moduleNames.map(name => {
      if (name === 'arkTSEvo') {
        return {
          resolvedFileName: declFileName,
          isExternalLibraryImport: false
        };
      }
      return undefined;
    });
  };

  return {
    program: ts.createProgram({ rootNames: [testFileName, declFileName], options: {}, host: compilerHost }),
    testSourceFile: testSourceFile
  };
}

const DECLFILE_CODE: string = `export declare class ArkTSClass {
  public get a(): number;
  public set a(value: number);
  constructor(); 
}
export declare interface ArkTSInterface {
  public get a(): number;
  public set a(value: number);
}
export declare interface I1{};
export declare interface I2{};
export declare class ArkTSClassNoCtor {
  public get a(): number;
  public set a(value: number);
  constructor(x: number); 
}
export declare function ArkTSFuncClass(a: ArkTSClass): void;
export declare function ArkTSFuncInterface(a: ArkTSInterface): void;
export declare function ArkTSRecordFunc(rec: Record<string, number>): void;
export type ArkTSRecordType = Record<string, number>;
export type ArkTSObject = {
  a: number
};
`;

const CLASS_NO_HAS_NO_ARG_CONSTRUCTOR_CODE: string = `import { ArkTSClassNoCtor } from "arkTSEvo";
let noCtor: ArkTSClassNoCtor = { a: 1 };
`;

const IMPORT_ARKTS_EVO_RECORD_CODE: string = `import { ArkTSRecordFunc } from "arkTSEvo";
ArkTSRecordFunc({a: 1});
`;

const IMPORT_ARKTS_EVO_RECORD_CODE_EXPECT: string = `import { ArkTSRecordFunc } from "arkTSEvo";
let tmpRecord = globalThis.Panda.getInstance("Lstd.core.Record;");
ArkTSRecordFunc((tmpRecord["a"] = 1, tmpRecord));
`;

const IMPORT_ARKTS_EVO_RECORD_ALIAS_NAME_CODE: string = `import { ArkTSRecordType } from "arkTSEvo";
const a: ArkTSRecordType = {a: 1};
`;

const IMPORT_ARKTS_EVO_RECORD_ALIAS_NAME_CODE_EXPECT: string = `import { ArkTSRecordType } from "arkTSEvo";
let tmpRecord = globalThis.Panda.getInstance("Lstd.core.Record;");
const a: ArkTSRecordType = (tmpRecord["a"] = 1, tmpRecord);
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_1: string = `import { ArkTSClass } from "arkTSEvo";
let a: ArkTSClass = {a: 1};
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_1_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let a: ArkTSClass = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_2: string = `import { ArkTSClass } from "arkTSEvo";
let an = new ArkTSClass();
an = {a: 1};
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_2_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let an = new ArkTSClass();
an = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_3: string = `import { ArkTSClass } from "arkTSEvo";
let aas = {a: 1} as ArkTSClass;
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_3_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let aas = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj) as ArkTSClass;
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_4: string = `import { ArkTSClass } from "arkTSEvo";
class A {
  a: ArkTSClass = {a: 1}
}
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_4_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
class A {
    a: ArkTSClass = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
}
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_5: string = `import { ArkTSClass } from "arkTSEvo";
class AA {
  a: ArkTSClass;
  constructor(a: ArkTSClass) {
    this.a = a;
  }
}
let aa = new AA({a: 1})
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_5_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
class AA {
    a: ArkTSClass;
    constructor(a: ArkTSClass) {
        this.a = a;
    }
}
let aa = new AA((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_6: string = `import { ArkTSClass } from "arkTSEvo";
class AAA {
  a: ArkTSClass = new ArkTSClass();
}
let aaa: AAA = {a: {a: 1}}
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_6_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
class AAA {
    a: ArkTSClass = new ArkTSClass();
}
let aaa: AAA = { a: (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj) };
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_7: string = `import { ArkTSClass } from "arkTSEvo";
function foo(a: ArkTSClass = {a:1}) {}
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_7_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
function foo(a: ArkTSClass = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj)) { }
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_8: string = `import { ArkTSClass } from "arkTSEvo";
function bar(a: ArkTSClass){}
bar({a: 1})
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_8_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
function bar(a: ArkTSClass) { }
bar((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_9: string = `import { ArkTSClass } from "arkTSEvo";
let aaa: () => ArkTSClass = () => ({a: 1})
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_9_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let aaa: () => ArkTSClass = () => ((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_10: string = `import { ArkTSClass } from "arkTSEvo";
function fooa(): ArkTSClass {
  return {a: 1}
}
`;

const IMPORT_ARKTS_EVO_CLASS_CODE_10_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
function fooa(): ArkTSClass {
    return (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
}
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_1: string = `import { ArkTSInterface } from "arkTSEvo";
let a: ArkTSInterface = {a: 1};
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_1_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
let a: ArkTSInterface = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_2: string = `import { ArkTSInterface } from "arkTSEvo";
let aas = {a: 1} as ArkTSInterface;
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_2_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
let aas = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj) as ArkTSInterface;
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_3: string = `import { ArkTSInterface } from "arkTSEvo";
class A {
  a: ArkTSInterface = {a: 1}
}
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_3_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
class A {
    a: ArkTSInterface = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
}
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_4: string = `import { ArkTSInterface } from "arkTSEvo";
class AA {
  a: ArkTSInterface;
  constructor(a: ArkTSInterface) {
    this.a = a;
  }
}
let aa = new AA({a: 1})
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_4_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
class AA {
    a: ArkTSInterface;
    constructor(a: ArkTSInterface) {
        this.a = a;
    }
}
let aa = new AA((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_5: string = `import { ArkTSInterface } from "arkTSEvo";
function foo(a: ArkTSInterface = {a:1}) {}
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_5_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
function foo(a: ArkTSInterface = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj)) { }
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_6: string = `import { ArkTSInterface } from "arkTSEvo";
function bar(a: ArkTSInterface){}
bar({a: 1})
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_6_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
function bar(a: ArkTSInterface) { }
bar((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_7: string = `import { ArkTSInterface } from "arkTSEvo";
let aaa: () => ArkTSInterface = () => ({a: 1})
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_7_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
let aaa: () => ArkTSInterface = () => ((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_8: string = `import { ArkTSInterface } from "arkTSEvo";
function fooa(): ArkTSInterface {
  return {a: 1}
}
`;

const IMPORT_ARKTS_EVO_INTERFACE_CODE_8_EXPECT: string = `import { ArkTSInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
function fooa(): ArkTSInterface {
    return (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
}
`;

const IMPORT_ARKTS_EVO_FUNCTION_CODE: string = `import {
  ArkTSFuncClass,
  ArkTSFuncInterface
} from "arkTSEvo";
ArkTSFuncClass({a: 1});
ArkTSFuncInterface({a: 1});
`;

const IMPORT_ARKTS_EVO_FUNCTION_CODE_EXPECT: string = `import { ArkTSFuncClass, ArkTSFuncInterface } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let tmpObj_1;
let tmpClass_1 = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/arkTSEvo$src$main$ets$decl$ArkTSInterface$ObjectLiteral;");
ArkTSFuncClass((tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj));
ArkTSFuncInterface((tmpObj_1 = new tmpClass_1(), tmpObj_1.a = 1, tmpObj_1));
`;

const UNION_NO_AMBIGUITY_CODE: string = `import { ArkTSClass } from "arkTSEvo";
let a: ArkTSClass | undefined = {a: 1};
`;

const UNION_NO_AMBIGUITY_CODE_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let a: ArkTSClass | undefined = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
`;

const UNION_AMBIGUITY_CODE: string = `import {
ArkTSClass,
ArkTSInterface
} from "arkTSEvo";
class A {
  a: number;
}
class B {
 a: number;
}
let a1: A | B = {a: 1};
let a2: ArkTSClass | ArkTSInterface = {a: 1};
let a2: A | B | ArkTSClass | ArkTSInterface = {a: 1};
`;

const UNION_AMBIGUITY_CODE_EXPECT: string = `import { ArkTSClass, ArkTSInterface } from "arkTSEvo";
class A {
    a: number;
}
class B {
    a: number;
}
let a1: A | B = { a: 1 };
let a2: ArkTSClass | ArkTSInterface = { a: 1 };
let a2: A | B | ArkTSClass | ArkTSInterface = { a: 1 };
`;

const PARENTHESIZED_CODE: string = `import { ArkTSClass } from "arkTSEvo";
let a: (ArkTSClass) = {a: 1};
`;

const PARENTHESIZED_CODE_EXPECT: string = `import { ArkTSClass } from "arkTSEvo";
let tmpObj;
let tmpClass = globalThis.Panda.getClass("LarkTSEvo/src/main/ets/decl/ArkTSClass;");
let a: (ArkTSClass) = (tmpObj = new tmpClass(), tmpObj.a = 1, tmpObj);
`;

const IMPORT_ARKTS_EVO_OBJECT_CODE: string = `import { ArkTSObject } from "arkTSEvo";
let testObject: ArkTSObject = {a: 1};
`;

const IMPORT_ARKTS_EVO_OBJECT_CODE_EXPECT: string = `import { ArkTSObject } from "arkTSEvo";
let testObject: ArkTSObject = { a: 1 };
`;

const CLASS_IMPLEMENTS_ARKTS_EVO_CLASS_OR_INTERFACE_CODE: string = `import { I1, I2 } from "arkTSEvo";
interface I3 {};
class A implements I1 {}
class B extends A {}
interface I4 extends I2 {}
class C implements I3, I4 {}
class D extends B implements I4 {}
class E implements I2 {
  a: number;
  constructor(a: number) {
    this.a = a;
  }
}
class F extends D {
  constructor() {
    super();
  }
}
interface I5 extends I1, I4 {}
class G extends A implements I5, I3 {}
`;

const CLASS_IMPLEMENTS_ARKTS_EVO_CLASS_OR_INTERFACE_CODE_EXPECT: string = `import { I1, I2 } from "arkTSEvo";
interface I3 {
}
;
class A implements I1 {
    constructor() {
        "implements static:LarkTSEvo/src/main/ets/decl/I1;";
    }
}
class B extends A {
    constructor(...args) {
        "implements static:LarkTSEvo/src/main/ets/decl/I1;";
        super(...args);
    }
}
interface I4 extends I2 {
}
class C implements I3, I4 {
    constructor() {
        "implements static:LarkTSEvo/src/main/ets/decl/I2;";
    }
}
class D extends B implements I4 {
    constructor(...args) {
        "implements static:LarkTSEvo/src/main/ets/decl/I1;,LarkTSEvo/src/main/ets/decl/I2;";
        super(...args);
    }
}
class E implements I2 {
    a: number;
    constructor(a: number) {
        "implements static:LarkTSEvo/src/main/ets/decl/I2;";
        this.a = a;
    }
}
class F extends D {
    constructor() {
        "implements static:LarkTSEvo/src/main/ets/decl/I1;,LarkTSEvo/src/main/ets/decl/I2;";
        super();
    }
}
interface I5 extends I1, I4 {
}
class G extends A implements I5, I3 {
    constructor(...args) {
        "implements static:LarkTSEvo/src/main/ets/decl/I1;,LarkTSEvo/src/main/ets/decl/I2;";
        super(...args);
    }
}
`;

mocha.describe('process arkts evolution tests', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test error message of collectArkTSEvolutionModuleInfo (useNormalizedOHMUrl is false)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = false;
    this.rollup.share.projectConfig.dependentModuleMap.set('evohar', { language: '1.2' });
    const throwArkTsCompilerErrorStub = sinon.stub(CommonLogger.getInstance(this.rollup), 'printErrorAndExit');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch (e) {
    }
    expect(throwArkTsCompilerErrorStub.getCall(0).args[0].code === ErrorCode.ETS2BUNDLE_EXTERNAL_COLLECT_INTEROP_INFO_FAILED).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('1-2: test error message of collectArkTSEvolutionModuleInfo (1.2 module information is incorrect)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.dependentModuleMap.set('evohar', { language: '1.2' });
    const throwArkTsCompilerErrorStub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch (e) {
    }
    const errMsg: string = 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
      `Error Message: Failed to collect arkTs evolution module "evohar" info from rollup.`;
    expect(throwArkTsCompilerErrorStub.getCall(0).args[1] === errMsg).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('1-3: test error message of collectArkTSEvolutionModuleInfo (1.1 module information is incorrect)', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.dependentModuleMap.set('har', { language: '1.1' });
    const throwArkTsCompilerErrorStub = sinon.stub(this.rollup.share, 'throwArkTsCompilerError');
    try {
      collectArkTSEvolutionModuleInfo(this.rollup.share);
    } catch (e) {
    }
    const errMsg: string = 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
      `Error Message: Failed to collect arkTs evolution module "har" info from rollup.`;
    expect(throwArkTsCompilerErrorStub.getCall(0).args[1] === errMsg).to.be.true;
    throwArkTsCompilerErrorStub.restore();
  });

  mocha.it('2-1: test generate declFilesInfo in mixed compilation', function () {
    pkgDeclFilesConfig['har'] = {
      packageName: 'har',
      files: {}
    };
    const filePath = '/har/Index.ets'
    const projectConfig = {
      mainModuleName: 'entry',
      bundleName: BUNDLE_NAME_DEFAULT,
      pkgContextInfo: {
        'har': {
          packageName: 'har',
          version: '1.0.0',
          isSO: false
        }
      }
    }
    arkTSModuleMap.set('har', {
      language: '1.1',
      pkgName: 'har',
      declgenV2OutPath: HAR_DECLGENV2OUTPATH
    })
    addDeclFilesConfig(filePath, projectConfig, undefined, '/har', 'har');
    const expectDeclPath: string = `${HAR_DECLGENV2OUTPATH}/Index.d.ets`;
    const expectOhmUrl: string = `@normalized:N&entry&${BUNDLE_NAME_DEFAULT}&har/Index&1.0.0`;
    expect(pkgDeclFilesConfig['har'].files.length !== 0).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].length !== 0).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].declPath === expectDeclPath).to.be.true;
    expect(pkgDeclFilesConfig['har'].files['Index'].ohmUrl === expectOhmUrl).to.be.true;
    arkTSModuleMap.clear();
  });

  mocha.describe('3: process arkts evolution tests: interop transform', function () {
    mocha.it('3-1-1: test mixCompile is false', function () {
      const sourceFile: ts.SourceFile = ts.createSourceFile('a.ts', 'let x = 1;', ts.ScriptTarget.ESNext);
      const program: ts.Program = ts.createProgram({ rootNames: ['a.ts'], options: {}, host: ts.createCompilerHost({}) });
      const result: ts.SourceFile = interopTransform(program, testFileName, false)()(sourceFile);
      expect(result === sourceFile).to.be.true;
    });

    mocha.it('3-1-2: test error message of ArkTS evoluion class does not has a no-argument constructor', function () {
      const { program, testSourceFile } = createDualSourceProgram(CLASS_NO_HAS_NO_ARG_CONSTRUCTOR_CODE);
      const errInfo: LogData = LogDataFactory.newInstance(
        ErrorCode.ETS2BUNDLE_EXTERNAL_CLASS_HAS_NO_CONSTRUCTOR_WITHOUT_ARGS,
        ArkTSErrorDescription,
        'The class "ArkTSClassNoCtor" does not has no no-argument constructor.',
        '',
        [
          'Please confirm whether there is a no-argument constructor ' +
          'in the ArkTS Evolution class "ArkTSClassNoCtor" type in the object literal.'
        ]
      );
      ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]);
      const hasError = interopTransformLog.errors.some(error =>
        error.message.includes(errInfo.toString())
      );
      expect(hasError).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-3-1: test import ArkTS evoluion Record in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_RECORD_CODE);
      const originalChecker = program.getTypeChecker();
      const mockedTypeChecker = Object.create(originalChecker);
      mockedTypeChecker.isStaticRecord = () => true;
      const mockedProgram = Object.create(program);
      mockedProgram.getTypeChecker =  () => mockedTypeChecker;
      const result = ts.transform(testSourceFile, [interopTransform(mockedProgram, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_RECORD_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-3-2: test import ArkTS evoluion Record alias name in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_RECORD_ALIAS_NAME_CODE);
      const originalChecker = program.getTypeChecker();
      const mockedTypeChecker = Object.create(originalChecker);
      mockedTypeChecker.isStaticRecord = () => true;
      const mockedProgram = Object.create(program);
      mockedProgram.getTypeChecker =  () => mockedTypeChecker;
      const result = ts.transform(testSourceFile, [interopTransform(mockedProgram, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_RECORD_ALIAS_NAME_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-1: test import ArkTS evoluion class (variable init) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_1);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_1_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-2: test import ArkTS evoluion class (object assignment) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_2);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_2_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-3: test import ArkTS evoluion class (type assertions) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_3);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_3_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-4: test import ArkTS evoluion class (property init) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_4);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_4_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-5: test import ArkTS evoluion class (contr function call) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_5);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_5_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-6: test import ArkTS evoluion class (multi-layer object assignment) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_6);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_6_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-7: test import ArkTS evoluion class (parameter initp) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_7);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_7_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-8: test import ArkTS evoluion class (function call) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_8);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_8_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-9: test import ArkTS evoluion class (arrow function return value) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_9);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_9_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-4-10: test import ArkTS evoluion class (function return value) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_CLASS_CODE_10);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_CLASS_CODE_10_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-1: test import ArkTS evoluion interface (variable init) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_1);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_1_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-2: test import ArkTS evoluion interface (type assertions) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_2);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_2_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-3: test import ArkTS evoluion interface (property init) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_3);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_3_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-4: test import ArkTS evoluion interface (contr function call) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_4);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_4_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-5: test import ArkTS evoluion interface (parameter initp) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_5);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_5_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-6: test import ArkTS evoluion interface (function call) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_6);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_6_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-7: test import ArkTS evoluion interface (arrow function return value) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_7);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_7_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-5-8: test import ArkTS evoluion interface (function return value) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_INTERFACE_CODE_8);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_INTERFACE_CODE_8_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-6: test import ArkTS evoluion function in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_FUNCTION_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_FUNCTION_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-7: test union type (no ambiguity) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(UNION_NO_AMBIGUITY_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === UNION_NO_AMBIGUITY_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-8: test union type (ambiguity) in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(UNION_AMBIGUITY_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      const errInfo: LogData = LogDataFactory.newInstance(
        ErrorCode.ETS2BUNDLE_EXTERNAL_UNION_TYPE_AMBIGUITY,
        ArkTSErrorDescription,
        `Ambiguous union type: multiple valid ArkTSEvolution types found: [ArkTSClass, ArkTSInterface].`,
        '',
        ['Please use type assertion as to disambiguate.']
      );
      const hasError = interopTransformLog.errors.some(error =>
        error.message.includes(errInfo.toString())
      );
      expect(hasError).to.be.true;
      expect(resultCode === UNION_AMBIGUITY_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-9: test parenthesized type in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(PARENTHESIZED_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === PARENTHESIZED_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-1-10: test import ArkTS evoluion Obejct in object literal', function () {
      const { program, testSourceFile } = createDualSourceProgram(IMPORT_ARKTS_EVO_OBJECT_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === IMPORT_ARKTS_EVO_OBJECT_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('3-2-1: test class extends arkTS evolution class or implement arkTS evolution interface', function () {
      const { program, testSourceFile } = createDualSourceProgram(CLASS_IMPLEMENTS_ARKTS_EVO_CLASS_OR_INTERFACE_CODE);
      const result = ts.transform(testSourceFile, [interopTransform(program, testFileName, true)]).transformed[0];
      const resultCode = ts.createPrinter().printFile(result);
      expect(resultCode === CLASS_IMPLEMENTS_ARKTS_EVO_CLASS_OR_INTERFACE_CODE_EXPECT).to.be.true;
      cleanUpProcessArkTSEvolutionObj();
    });
  });
});