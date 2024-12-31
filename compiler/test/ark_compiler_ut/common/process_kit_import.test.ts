/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
import fs from 'fs';
import mocha from 'mocha';
import path from 'path';
import * as ts from 'typescript';

import {
  processKitImport,
  kitTransformLog,
  KitInfo
} from '../../../lib/process_kit_import';
import { 
  findImportSpecifier,
  createErrInfo
 } from '../utils/utils';
import { projectConfig } from '../../../main';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import { reExportCheckLog } from '../../../lib/ark_utils';
import { 
  ArkTSErrorDescription,
  ErrorCode
} from '../../../lib/fast_build/ark_compiler/error_code';
import {
  LogData,
  LogDataFactory
} from '../../../lib/fast_build/ark_compiler/logger';
import { etsLoaderErrorReferences } from '../../../lib/fast_build/ark_compiler/url_config.json';

const KIT_IMPORT_CODE: string =
`
import { Ability, featureAbility, ErrorCode } from "@kit.AbilityKit";
let localAbility = new Ability();
let localFeature = new featureAbility();
let noError = ErrorCode.NO_ERROR;
`

const KIT_IMPORT_CODE_EXPECT: string =
'import Ability from "@ohos.app.ability.Ability";\n' +
'import featureAbility from "@ohos.ability.featureAbility";\n'+
'import { ErrorCode } from "@ohos.ability.errorCode";\n'+
'let localAbility = new Ability();\n'+
'let localFeature = new featureAbility();\n'+
'let noError = ErrorCode.NO_ERROR;\n'+
'//# sourceMappingURL=kitTest.js.map'

const KIT_EXPORT_CODE: string =
`
export { Ability, featureAbility, ErrorCode } from "@kit.AbilityKit";
`

const KIT_EXPORT_CODE_EXPECT: string =
'export { default as Ability } from "@ohos.app.ability.Ability";\n' +
'export { default as featureAbility } from "@ohos.ability.featureAbility";\n'+
'export { ErrorCode } from "@ohos.ability.errorCode";\n'+
'//# sourceMappingURL=kitTest.js.map'

const KIT_STAR_EXPORT_CODE: string =
`
export * from "@kit.AudioKit";
`

const KIT_STAR_EXPORT_CODE_EXPECT: string =
'export * from "@ohos.multimedia.audio";\n' +
'export * from "@ohos.multimedia.audioHaptic";\n'+
'export * from "@ohos.multimedia.systemSoundManager";\n'+
'export * from "@ohos.multimedia.avVolumePanel";\n' +
'//# sourceMappingURL=kitTest.js.map'

const KIT_IMPORT_ERROR_CODE: string =
'import { Ability } from "@kit.Kit";'

const KIT_IMPORT_DEFAULT_CODE: string =
'import { Ability } from "@kit.AbilityKit";'

const KIT_UNUSED_TYPE_IMPROT_CODE: string = 
'import { BusinessError } from "@kit.BasicServicesKit";'

const KIT_UNUSED_TYPE_IMPROT_CODE_EXPECT: string =
'export {};\n' +
'//# sourceMappingURL=kitTest.js.map'

const KIT_USED_TYPE_IMPROT_CODE: string = 
'import { BusinessError } from "@kit.BasicServicesKit";\n' +
'let e: BusinessError = undefined';

const KIT_USED_TYPE_IMPROT_CODE_EXPECT: string =
'let e = undefined;\n' +
'export {};\n' +
'//# sourceMappingURL=kitTest.js.map'

const KIT_UNUSED_VALUE_IMPORT_CODE: string =
'import { appAccount } from "@kit.BasicServicesKit";'

const KIT_UNUSED_VALUE_IMPROT_CODE_EXPECT: string =
'export {};\n' +
'//# sourceMappingURL=kitTest.js.map'

const KIT_USED_VALUE_IMPORT_CODE: string =
'import { appAccount } from "@kit.BasicServicesKit";\n' +
'appAccount.createAppAccountManager();';

const KIT_USED_VALUE_IMPROT_CODE_EXPECT: string =
'import appAccount from "@ohos.account.appAccount";\n' +
'appAccount.createAppAccountManager();\n' +
'//# sourceMappingURL=kitTest.js.map'

const KIT_EMPTY_IMPORT_CODE: string =
'import { appAccount } from "@kit.BasicServicesKit";\n' +
'import "@kit.ArkUI";\n' +
'appAccount.createAppAccountManager();';

const KIT_NAMESPACE_IMPORT_CODE: string =
'import * as ArkUI "@kit.ArkUI";\n' +
'ArkUI.AlertDialog;';

const KIT_LAZY_IMPORT_CODE: string =
'import { test } from "./test";\n' +
'import lazy { appAccount } from "@kit.BasicServicesKit";\n' +
'import lazy { lang } from "@kit.ArkTS";\n' +
'import lazy { socket, VpnExtensionContext } from "@kit.NetworkKit";\n' +
'import lazy { UIAbility as x1 } from "@kit.AbilityKit";\n' +
'import lazy buffer from "@kit.ArkTest";\n' +
'test;\n' +
'appAccount.createAppAccountManager();\n' +
'type ISendable = lang.ISendable;\n' +
'socket.sppCloseServerSocket(1);\n' +
'new VpnExtensionContext();\n' +
'export { x1 };\n' +
'const buf = new buffer();';

const KIT_LAZY_IMPORT_CODE_EXPECT: string =
'import { test } from "./test";\n' +
'import lazy appAccount from "@ohos.account.appAccount";\n' +
'import lazy socket from "@ohos.net.socket";\n' +
'import lazy { VpnExtensionContext } from "@ohos.app.ability.VpnExtensionAbility";\n' +
'import lazy x1 from "@ohos.app.ability.UIAbility";\n' +
'import lazy buffer from "@ohos.buffer";\n' +
'test;\n' +
'appAccount.createAppAccountManager();\n' +
'socket.sppCloseServerSocket(1);\n' +
'new VpnExtensionContext();\n' +
'export { x1 };\n' +
'const buf = new buffer();\n' +
'//# sourceMappingURL=kitTest.js.map';

const KIT_LAZY_IMPORT_ERROR_CODE: string =
'import lazy Animator from "@kit.ArkUI";\n' +
'new Animator();'

const SINGLE_DEFAULT_BINDINGS_IMPORT_CODE: string =
'import buffer from "@kit.ArkTest";\n' +
'const buf = new buffer()';

const SINGLE_DEFAULT_BINDINGS_IMPORT_CODE_EXPECT: string =
'import buffer from "@ohos.buffer";\n' +
'const buf = new buffer();\n' +
'//# sourceMappingURL=kitTest.js.map'

const DEFAULT_BINDINGS_IMPORT_AFTER_NORMAL_KIT_CODE: string =
'import { Ability } from "@kit.AbilityKit";\n' +
'import buffer from "@kit.ArkTest";\n' +
'let localAbility = new Ability();\n' +
'const buf = new buffer()';

const DEFAULT_BINDINGS_IMPORT_AFTER_NORMAL_KIT_CODE_EXPECT: string =
'import Ability from "@ohos.app.ability.Ability";\n' +
'import buffer from "@ohos.buffer";\n' +
'let localAbility = new Ability();\n' +
'const buf = new buffer();\n' +
'//# sourceMappingURL=kitTest.js.map'

const DEFAULT_BINDINGS_IMPORT_BEFORE_NORMAL_KIT_CODE: string =
'import buffer from "@kit.ArkTest";\n' +
'import { Ability } from "@kit.AbilityKit";\n' +
'let localAbility = new Ability();\n' +
'const buf = new buffer()';

const DEFAULT_BINDINGS_IMPORT_AFTER_BEFORE_KIT_CODE_EXPECT: string =
'import buffer from "@ohos.buffer";\n' +
'import Ability from "@ohos.app.ability.Ability";\n' +
'let localAbility = new Ability();\n' +
'const buf = new buffer();\n' +
'//# sourceMappingURL=kitTest.js.map'

const DEFAULT_BINDINGS_IMPORT_WITH_NORMAL_KIT_CODE: string =
'import { Ability } from "@kit.AbilityKit";\n' +
'import buffer, {convertxml, process} from "@kit.ArkTest";\n' +
'let localAbility = new Ability();\n' +
'const localconvertxml = new convertxml();\n' +
'const localprocess = new process();\n' +
'const buf = new buffer()'

const DEFAULT_BINDINGS_IMPORT_WITH_NORMAL_KIT_CODE_EXPECT: string =
'import Ability from "@ohos.app.ability.Ability";\n' +
'import convertxml from "@ohos.convertxml";\n' +
'import process from "@ohos.process";\n' +
'import buffer from "@ohos.buffer";\n' +
'let localAbility = new Ability();\n' +
'const localconvertxml = new convertxml();\n' +
'const localprocess = new process();\n' +
'const buf = new buffer();\n' +
'//# sourceMappingURL=kitTest.js.map'

const SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE: string =
'import NoExist from "@kit.ArkTest";\n'

const SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE_EXPECT: string =
'export {};\n' +
'//# sourceMappingURL=kitTest.js.map'

const LAZY_IMPORT_RE_EXPORT_ERROR: string =
'import lazy { e1 } from "./test1";\n' +
'import lazy { e2, e3 as a3 } from "./test1";\n' +
'import lazy d1 from "./test1";\n' +
'import lazy d2, { e4 as a4, e5 } from "./test2";\n' +
'import lazy { componentUtils } from "@kit.ArkUI";\n' +
'import lazy { dragController as k1, uiObserver } from "@kit.ArkUI";\n' +
'import lazy { lazy } from "./test3"\n' +
'import lazy { e6, type type1 } from "./testType1"\n' +
'import lazy d3, { type type2 } from "./testType2"\n' +
'export { e1 };\n' +
'export { e2, a3 };\n' +
'export { d1, d2, a4, e5, componentUtils, k1, uiObserver, lazy, e6, type1, d3, type2 };'

const CLOSE_REEXPORTCHECKMODE_EXPECT: string =
'import lazy { e1 } from "./test";\n' +
'export { e1 };\n' +
'//# sourceMappingURL=kitTest.js.map'

const ARK_TEST_KIT: Object = {
  symbols: {
    "default": {
      "source": "@ohos.buffer.d.ts",
      "bindings": "default"
    },
    "convertxml": {
      "source": "@ohos.convertxml.d.ts",
      "bindings": "default"
    },
    "process": {
      "source": "@ohos.process.d.ts",
      "bindings": "default"
    }
  }
}

const ARK_TEST_NO_DEFAULT_KIT: Object = {
  symbols: {
    "convertxml": {
      "source": "@ohos.convertxml.d.ts",
      "bindings": "default"
    },
    "process": {
      "source": "@ohos.process.d.ts",
      "bindings": "default"
    }
  }
}

const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
compilerOptions['moduleResolution'] = 'nodenext';
compilerOptions['module'] = 'es2020';

// !! The Kit transform result would be changed once the kit config file has updated.
mocha.describe('process Kit Imports tests', function () {
  mocha.it('1-1: process specifier imports', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_IMPORT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-2: process specifier exports', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_EXPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_EXPORT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-3: process star export', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_STAR_EXPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_STAR_EXPORT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-4: process unused type import', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_UNUSED_TYPE_IMPROT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_UNUSED_TYPE_IMPROT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-5 process used type import', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_USED_TYPE_IMPROT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_USED_TYPE_IMPROT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-6 process unused value import', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_UNUSED_VALUE_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_UNUSED_VALUE_IMPROT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-7 process used value import', function () {
    const result: ts.TranspileOutput = ts.transpileModule(KIT_USED_VALUE_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_USED_VALUE_IMPROT_CODE_EXPECT).to.be.true;
  });

  mocha.it('1-8 process used lazy import', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(KIT_LAZY_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == KIT_LAZY_IMPORT_CODE_EXPECT).to.be.true;
  });

  mocha.it('2-1 the error message of processKitImport', function () {
    ts.transpileModule(KIT_IMPORT_ERROR_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_KIT_CONFIG_FILE_NOT_FOUND,
      ArkTSErrorDescription,
      "Kit '@kit.Kit' has no corresponding config file in ArkTS SDK.",
      '',
      [
        "Please make sure the Kit apis are consistent with SDK and there's no local modification on Kit apis.",
        `For more details on Kit apis, please refer to ${etsLoaderErrorReferences.harmonyOSReferencesAPI}.`
      ]
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
  });

  mocha.it('2-2 the error message of test specifiers in newSpecificerInfo', function () {
    const symbols = {
      'test': ''
    }
    const sourceCode = 'import { test } from "my-module";';
    const sourceFile = ts.createSourceFile(
        "tempFile.ts",
        sourceCode,
        ts.ScriptTarget.Latest,
        true
    );
    const kitNode = findImportSpecifier(sourceFile);
    const kitInfo = new KitInfo(kitNode, symbols);
    kitInfo.newSpecificerInfo('', 'test', undefined);
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_IMPORT_NAME_NOT_EXPORTED_FROM_KIT,
      ArkTSErrorDescription,
      "'test' is not exported from Kit '@kit.ArkTest'.",
      '',
      [
        "Please make sure the Kit apis are consistent with SDK and there's no local modification on Kit apis.",
        `For more details on Kit apis, please refer to ${etsLoaderErrorReferences.harmonyOSReferencesAPI}.`
      ]
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
  });

  mocha.it('2-3 the error message of EmptyImportKitInfo', function () {
    ts.transpileModule(KIT_EMPTY_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_EMPTY_IMPORT_NOT_ALLOWED_WITH_KIT,
      ArkTSErrorDescription,
      "Can not use empty import(side-effect import) statement with Kit '@kit.ArkUI'.",
      '',
      ['Please specify imported symbols explicitly. ' + 
       'For example, import "@kit.ArkUI"; -> import { lang } from "@kit.ArkUI";']
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
  });

  mocha.it('2-4 the error message of default specifiers in newSpecificerInfo', function () {
    ts.transpileModule(KIT_LAZY_IMPORT_ERROR_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_IMPORT_NAME_NOT_EXPORTED_FROM_KIT,
      ArkTSErrorDescription,
      "'default' is not exported from Kit '@kit.ArkUI'.",
      '',
      [
        "Please make sure the Kit apis are consistent with SDK and there's no local modification on Kit apis.",
        `For more details on Kit apis, please refer to ${etsLoaderErrorReferences.harmonyOSReferencesAPI}.`
      ]
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
  });

  mocha.it('2-5 the error message of NameSpaceKitInfo', function () {
    ts.transpileModule(KIT_NAMESPACE_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_KIT_NAMESPACE_IMPORT_EXPORT_NOT_SUPPORTED,
      ArkTSErrorDescription,
      'Namespace import or export of Kit is not supported currently.',
      '',
      ['Please namespace import or export of Kit replace it with named import or export instead. ' + 
       'For example, import * as ArkTS from "@kit.ArkUI"; -> import { AlertDialog } from "@kit.ArkUI";']
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
  });

  mocha.it('2-6 the error message of validateImportingETSDeclarationSymbol', function () {
    const symbols = {
      "test": {
        "source": "@ohos.test.d.ets",
        "bindings": "default"
      }
    };
    const sourceCode = 'import { test } from "my-module";';
    const sourceFile = ts.createSourceFile(
      "tempFile.ts",
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );
    const kitNode = findImportSpecifier(sourceFile);
    const kitInfo = new KitInfo(kitNode, symbols);
    compilerOptions['tsImportSendableEnable'] = false;
    kitInfo.newSpecificerInfo('', 'test', findImportSpecifier(sourceFile));
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_IDENTIFIER_IMPORT_NOT_ALLOWED_IN_TS_FILE,
      ArkTSErrorDescription,
      "Identifier 'test' comes from '@ohos.test.d.ets' " + 
      'which can not be imported in .ts file.',
      '',
      ["Please remove the import statement or change the file extension to .ets."]
    );
    const hasError = kitTransformLog.errors.some(error =>
      error.message.includes(errInfo.toString())

    );
    expect(hasError).to.be.true;
  });

  mocha.it('3-1 process single default-bindings import', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(SINGLE_DEFAULT_BINDINGS_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == SINGLE_DEFAULT_BINDINGS_IMPORT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('3-2 process default-bindings import after normal kit', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(DEFAULT_BINDINGS_IMPORT_AFTER_NORMAL_KIT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == DEFAULT_BINDINGS_IMPORT_AFTER_NORMAL_KIT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('3-3 process default-bindings import before normal kit', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(DEFAULT_BINDINGS_IMPORT_BEFORE_NORMAL_KIT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == DEFAULT_BINDINGS_IMPORT_AFTER_BEFORE_KIT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('3-4 process default-bindings import with specifiers', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(DEFAULT_BINDINGS_IMPORT_WITH_NORMAL_KIT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == DEFAULT_BINDINGS_IMPORT_WITH_NORMAL_KIT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('3-5 process single default-bindings import, but no use', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('3-6 process single default-bindings import, but kit no default export', function () {
    const ARK_TEST_KIT_JSON = '@kit.ArkTest.json';
    const KIT_CONFIGS = 'kit_configs';

    const arkTestKitConfig: string = path.resolve(__dirname, `../../../${KIT_CONFIGS}/${ARK_TEST_KIT_JSON}`);
    fs.writeFileSync(arkTestKitConfig, JSON.stringify(ARK_TEST_NO_DEFAULT_KIT));

    const result: ts.TranspileOutput = ts.transpileModule(SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: { before: [ processKitImport() ] }
    });
    expect(result.outputText == SINGLE_DEFAULT_BINDINGS_NO_DEFAULT_IMPORT_CODE_EXPECT).to.be.true;
    fs.unlinkSync(arkTestKitConfig);
  });

  mocha.it('4-1: test transformLazyImport (ts.sourceFile): perform lazy conversion', function () {
    const code: string = `
    import { test } from "./test";
    import { test1 as t } from "./test1";
    const a: string = "a" + test() + t();
    `;
    projectConfig.processTs = true;
    ts.transpileModule(code, {
      compilerOptions: compilerOptions,
      fileName: 'test.ets',
      transformers: {
        before: [
          processKitImport('test.ets', undefined, undefined, true, { autoLazyImport: true, reExportCheckMode: undefined })
        ]
      }
    });
    const sourceFile: ts.SourceFile = ModuleSourceFile.getSourceFiles().find(element => element.moduleId === 'test.ets');
    const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    // @ts-ignore
    const writer: ts.EmitTextWriter = ts.createTextWriter(
      // @ts-ignore
      ts.getNewLineCharacter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }));
    printer.writeFile(sourceFile.source, writer, undefined);
    const expectCode: string = 'import lazy { test } from "./test";\n' +
    'import lazy { test1 as t } from "./test1";\n' +
    'const a: string = "a" + test() + t();\n';
    expect(writer.getText() === expectCode).to.be.true;
  });

  mocha.it('4-2: test transformLazyImport (ts.sourceFile): no lazy conversion', function () {
    const code: string = `
    import lazy { test } from "./test";
    import lazy { test1 as t } from "./test1";
    import test2 from "./test2";
    import * as test3 from "./test3";
    import test4, { test5 } from "./test4";
    import type { testType } from "./testType";
    import "test6";
    let a: testType = test + t + test2 + test3.b + test4 + test5;
    `;
    projectConfig.processTs = true;
    ts.transpileModule(code, {
      compilerOptions: compilerOptions,
      fileName: 'no.ets',
      transformers: {
        before: [
          processKitImport('no.ets', undefined, undefined, true, { autoLazyImport: true, reExportCheckMode: undefined })
        ]
      }
    });
    const sourceFile: ts.SourceFile = ModuleSourceFile.getSourceFiles().find(element => element.moduleId === 'no.ets');
    const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    // @ts-ignore
    const writer: ts.EmitTextWriter = ts.createTextWriter(
      // @ts-ignore
      ts.getNewLineCharacter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }));
    printer.writeFile(sourceFile.source, writer, undefined);
    const expectCode: string = 'import lazy { test } from "./test";\n' +
    'import lazy { test1 as t } from "./test1";\n' +
    'import test2 from "./test2";\n' +
    'import * as test3 from "./test3";\n' +
    'import test4, { test5 } from "./test4";\n' +
    'import type { testType } from "./testType";\n' +
    'import "test6";\n' +
    'let a: testType = test + t + test2 + test3.b + test4 + test5;\n';
    expect(writer.getText() === expectCode).to.be.true;
  });

  mocha.it('5-1: the error message of lazy-import re-export', function () {
    projectConfig.processTs = true;
    ts.transpileModule(LAZY_IMPORT_RE_EXPORT_ERROR, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: {
        before: [ 
          processKitImport('kitTest.ts', undefined, undefined, true, { autoLazyImport: false, reExportCheckMode: 'error' })
        ]
      }
    });
    const errInfo1 = createErrInfo('e1');
    const errInfo2 = createErrInfo('e2');
    const errInfo3 = createErrInfo('a3');
    const errInfo4 = createErrInfo('d1');
    const errInfo5 = createErrInfo('d2');
    const errInfo6 = createErrInfo('a4');
    const errInfo7 = createErrInfo('e5');
    const errInfo8 = createErrInfo('componentUtils');
    const errInfo9 = createErrInfo('k1');
    const errInfo10 = createErrInfo('uiObserver');
    const errInfo11 = createErrInfo('lazy');
    const errInfo12 = createErrInfo('e6');
    const errInfo13 = createErrInfo('type1');
    const errInfo14 = createErrInfo('d3');
    const errInfo15 = createErrInfo('type2');

    const hasError1 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo1.toString())
    );
    const hasError2 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo2.toString())
    );
    const hasError3 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo3.toString())
    );
    const hasError4 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo4.toString())
    );
    const hasError5 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo5.toString())
    );
    const hasError6 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo6.toString())
    );
    const hasError7 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo7.toString())
    );
    const hasError8 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo8.toString())
    );
    const hasError9 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo9.toString())
    );
    const hasError10 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo10.toString())
    );
    const hasError11 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo11.toString())
    );
    const hasError12 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo12.toString())
    );
    const hasError13 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo13.toString())
    );
    const hasError14 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo14.toString())
    );
    const hasError15 = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo15.toString())
    );

    expect(hasError1).to.be.true;
    expect(hasError2).to.be.true;
    expect(hasError3).to.be.true;
    expect(hasError4).to.be.true;
    expect(hasError5).to.be.true;
    expect(hasError6).to.be.true;
    expect(hasError7).to.be.true;
    expect(hasError8).to.be.true;
    expect(hasError9).to.be.true;
    expect(hasError10).to.be.true;
    expect(hasError11).to.be.true;
    expect(hasError12).to.be.true;
    expect(hasError13).to.be.true;
    expect(hasError14).to.be.true;
    expect(hasError15).to.be.true;
    projectConfig.processTs = false;
  });

  mocha.it('5-2: the error message of lazy-import re-export with the name lazy', function () {
    projectConfig.processTs = true;
    const code: string = `
    import lazy lazy from "./test";
    export { lazy };
    `;
    ts.transpileModule(code, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: {
        before: [ 
          processKitImport('kitTest.ts', undefined, undefined, true, { autoLazyImport: false, reExportCheckMode: 'error' })
        ]
      }
    });
    const errInfo = createErrInfo('lazy');
    const hasError = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
    projectConfig.processTs = false;
  });

  mocha.it('5-3: the warn message of lazy-import re-export', function () {
    projectConfig.processTs = true;
    const code: string = `
    import lazy { y1 } from "./test";
    export { y1 };
    `;
    ts.transpileModule(code, {
      compilerOptions: compilerOptions,
      fileName: "kitTest.ts",
      transformers: {
        before: [ 
          processKitImport('kitTest.ts', undefined, undefined, true, { autoLazyImport: false, reExportCheckMode: 'warn' })
        ]
      }
    });
    const errInfo = createErrInfo('y1');
    const hasError = reExportCheckLog.errors.some(error =>
      error.message.includes(errInfo.toString())
    );
    expect(hasError).to.be.true;
    projectConfig.processTs = false;
  });
});
