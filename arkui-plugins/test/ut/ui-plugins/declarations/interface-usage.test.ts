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

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DECL_DIR_PATH: string = 'declarations';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'interface-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in interfaces', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, Resource as Resource } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { ExportInterface as ExportInterface } from "./utils/interface";

function main() {}

@Builder() 
@Memo() 
function aBuilder(@MemoSkip() impl: ExportInterface): void {
  impl.aBuilderProp();
  impl.aBuilder();
  impl.aBuilderReturn();
}



`;

const expectDeclarationAfterUIScript: string = `

import { Memo as Memo } from "arkui.incremental.annotation";

import { Builder as Builder } from "@ohos.arkui.component";


export interface ExportInterface {
  @Builder() 
  @Memo() 
  get aBuilderProp(): (()=> void)
  @Builder() 
  @Memo() 
  set aBuilderProp(aBuilderProp: (()=> void))
  @Builder() 
  @Memo() 
  aBuilder(): void
  aBuilderReturn(): @Builder() (()=> void)
  
}

interface NonExportInterface {
  @Builder() 
  get aBuilderProp(): (()=> void)
  @Builder() 
  set aBuilderProp(aBuilderProp: (()=> void))
  @Builder() 
  aBuilder(): void
  aBuilderReturn(): @Builder() (()=> void)
  
}


`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.interface']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Text as Text, Column as Column, Component as Component, Builder as Builder, Resource as Resource } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { ExportInterface as ExportInterface } from "./utils/interface";

function main() {}

@Builder() 
@Memo() 
function aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() impl: ExportInterface): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (181621899)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  impl.aBuilderProp(__memo_context, ((__memo_id) + (47330804)));
  impl.aBuilder(__memo_context, ((__memo_id) + (175145513)));
  impl.aBuilderReturn();
  {
    __memo_scope.recache();
    return;
  }
}



`;

const expectDeclarationScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Builder as Builder } from "@ohos.arkui.component";


export interface ExportInterface {
  @Builder() 
  @Memo() 
  get aBuilderProp(): ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)
  @Builder() 
  @Memo() 
  set aBuilderProp(aBuilderProp: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void))
  @Builder() 
  @Memo() 
  aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
  aBuilderReturn(): @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)
  
}

interface NonExportInterface {
  @Builder() 
  get aBuilderProp(): (()=> void)
  @Builder() 
  set aBuilderProp(aBuilderProp: (()=> void))
  @Builder() 
  aBuilder(): void
  aBuilderReturn(): @Builder() (()=> void)
  
}


`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.interface']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in interfaces',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.interface'] }
    }
);
