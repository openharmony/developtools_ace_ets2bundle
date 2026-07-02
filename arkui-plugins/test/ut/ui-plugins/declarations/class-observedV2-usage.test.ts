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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'class-observedV2-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in @ObservedV2 classes', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObservedV2 as ExportObservedV2, ExportObservedV2Inherit as ExportObservedV2Inherit, ExportObservedV2WithBody as ExportObservedV2WithBody, ExportObservedV2InheritWithBody as ExportObservedV2InheritWithBody } from "./test";

const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);
const ExportObservedV2WithBodyVar = new ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new ExportObservedV2InheritWithBody(2);
function main() {}


class SomeObV2Class extends ExportObservedV2 implements IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObV2ClassImpl extends ExportObservedV2Inherit {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}


`;

const expectDeclarationAfterUIScript: string = `

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { Observed, ObservedV2, Track, Trace, Monitor, Computed } from "@ohos.arkui.stateManagement";


export interface IO {
  get t1(): number
  set t1(t1: number)
  
}

@ObservedV2() export declare class ExportObservedV2 implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  @Computed() 
  public get computed(): number
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void
  
  public constructor()
  
}

@ObservedV2() export declare class ExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public constructor()
  
  public get t1(): number
  public set t1(t1: number)
  
}

@ObservedV2() declare class NonExportObservedV2 {
  @Trace() public t1: number;
  @Computed() 
  public get computed(): number
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void
  
  public constructor()
  
}

@ObservedV2() declare class NonExportObservedV2Inherit implements IO {
  @Trace() public t1: number;
  public constructor()
  
}

@ObservedV2() declare class ObservedV2WithBody {
  @Trace() public t1: number = 1;
  @Computed() 
  public get computed(): number {
    return this.t1;
  }
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void {}
  
  public constructor(t1: number) {
    this.t1 = t1;
  }
  
}

@ObservedV2() declare class ObservedV2InheritWithBody implements IO {
  @Trace() public t1: number = 1;
  public t2: number = 2;
  public constructor(t2: number) {
    this.t2 = t2;
  }
  
}

@ObservedV2() export declare class ExportObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public t2: number;
  public constructor(t2: number) {
    this.t2 = t2;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

@ObservedV2() export declare class ExportObservedV2WithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  @Computed() 
  public get computed(): number {
    return this.t1;
  }
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void {}
  
  public constructor(t1: number) {
    this.t1 = t1;
  }
  
}

`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.class-observedV2']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObservedV2 as ExportObservedV2, ExportObservedV2Inherit as ExportObservedV2Inherit, ExportObservedV2WithBody as ExportObservedV2WithBody, ExportObservedV2InheritWithBody as ExportObservedV2InheritWithBody } from "./test";

const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);
const ExportObservedV2WithBodyVar = new ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new ExportObservedV2InheritWithBody(2);
function main() {}


class SomeObV2Class extends ExportObservedV2 implements IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObV2ClassImpl extends ExportObservedV2Inherit {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}


`;

const expectDeclarationScript: string = `

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { Observed, ObservedV2, Track, Trace, Monitor, Computed } from "@ohos.arkui.stateManagement";


export interface IO {
  get t1(): number
  set t1(t1: number)
  
}

@ObservedV2() export declare class ExportObservedV2 implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  @Computed() 
  public get computed(): number
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void
  
  public constructor()
  
}

@ObservedV2() export declare class ExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public constructor()
  
  public get t1(): number
  public set t1(t1: number)
  
}

@ObservedV2() declare class NonExportObservedV2 {
  @Trace() public t1: number;
  @Computed() 
  public get computed(): number
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void
  
  public constructor()
  
}

@ObservedV2() declare class NonExportObservedV2Inherit implements IO {
  @Trace() public t1: number;
  public constructor()
  
}

@ObservedV2() declare class ObservedV2WithBody {
  @Trace() public t1: number = 1;
  @Computed() 
  public get computed(): number {
    return this.t1;
  }
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void {}
  
  public constructor(t1: number) {
    this.t1 = t1;
  }
  
}

@ObservedV2() declare class ObservedV2InheritWithBody implements IO {
  @Trace() public t1: number = 1;
  public t2: number = 2;
  public constructor(t2: number) {
    this.t2 = t2;
  }
  
}

@ObservedV2() export declare class ExportObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public t2: number;
  public constructor(t2: number) {
    this.t2 = t2;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

@ObservedV2() export declare class ExportObservedV2WithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  @Computed() 
  public get computed(): number {
    return this.t1;
  }
  
  @Monitor({value:["t1"]}) 
  public onT1Changed(): void {}
  
  public constructor(t1: number) {
    this.t1 = t1;
  }
  
}

`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.class-observedV2']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in @ObservedV2 classes',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.class-observedV2'] }
    }
);
