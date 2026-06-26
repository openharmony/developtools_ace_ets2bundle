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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'class-observed-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in @Observed classes', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObserved as ExportObserved, ExportObservedImpl as ExportObservedImpl, ExportObservedWithTrack as ExportObservedWithTrack, ExportTrackWithoutObserved as ExportTrackWithoutObserved, ExportObservedWithBody as ExportObservedWithBody, ExportObservedImplWithBody as ExportObservedImplWithBody, ExportObservedWithTrackWithBody as ExportObservedWithTrackWithBody, ExportTrackWithoutObservedWithBody as ExportTrackWithoutObservedWithBody } from "./test";

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();
const ExportObservedWithBodyVar = new ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new ExportTrackWithoutObservedWithBody();
function main() {}


class SomeObClass extends ExportObserved implements IO {
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

class SomeObClassImpl extends ExportObservedImpl {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

class SomeObClassWithTrack extends ExportObservedWithTrack {
  public t1: number = 1;
  public constructor(t2: number) {
    super();
    this.t2 = t2;
  }
  
}

class SomeTrClassInherit extends ExportTrackWithoutObserved {
  public constructor() {}
  
}


`;

const expectDeclarationAfterUIScript: string = `

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed } from "@ohos.arkui.stateManagement";


export interface IO {
  get t1(): number
  set t1(t1: number)
  
}

@Observed() export declare class ExportObserved implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() export declare class ExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public constructor()
  
  public get t1(): number
  public set t1(t1: number)
  
}

@Observed() export declare class ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  public t1: number;
  @JSONRename({newName:"t2"}) public __backing_t2?: number;
  public get t2(): number
  
  public set t2(newValue: number)
  
  public constructor()
  
}

export declare class ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() declare class NonExportObserved {
  public t1: number;
  public constructor()
  
}

@Observed() declare class NonExportObservedImpl implements IO {
  public t1: number;
  public constructor()
  
}

@Observed() declare class NonExportObservedWithTrack {
  public t1: number;
  @Track() public t2: number;
  public constructor()
  
}

declare class NonExportTrackWithoutObserved {
  @Track() public t1: number;
  public constructor()
  
}

@Observed() declare class ObservedWithBody {
  public t1: number = 1;
  public constructor()
  
}

@Observed() declare class ObservedImplWithBody implements IO {
  public t1: number = 1;
  public constructor()
  
}

@Observed() declare class ObservedWithTrackWithBody {
  public t1: number = 1;
  @Track() public t2: number = 2;
  public constructor()
  
}

declare class TrackWithoutObservedWithBody {
  @Track() public t1: number = 1;
  public constructor()
  
}

@Observed() export declare class ExportObservedWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() export declare class ExportObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  
  public constructor()
  public get t1(): number
  
  public set t1(t1: number)
  
}

@Observed() export declare class ExportObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  public t1: number;
  @JSONRename({newName:"t2"}) public __backing_t2?: number;
  public get t2(): number
  
  public set t2(newValue: number)
  
  public constructor()
  
}

export declare class ExportTrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}


`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.class-observed']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObserved as ExportObserved, ExportObservedImpl as ExportObservedImpl, ExportObservedWithTrack as ExportObservedWithTrack, ExportTrackWithoutObserved as ExportTrackWithoutObserved, ExportObservedWithBody as ExportObservedWithBody, ExportObservedImplWithBody as ExportObservedImplWithBody, ExportObservedWithTrackWithBody as ExportObservedWithTrackWithBody, ExportTrackWithoutObservedWithBody as ExportTrackWithoutObservedWithBody } from "./test";

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();
const ExportObservedWithBodyVar = new ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new ExportTrackWithoutObservedWithBody();
function main() {}


class SomeObClass extends ExportObserved implements IO {
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

class SomeObClassImpl extends ExportObservedImpl {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

class SomeObClassWithTrack extends ExportObservedWithTrack {
  public t1: number = 1;
  public constructor(t2: number) {
    super();
    this.t2 = t2;
  }
  
}

class SomeTrClassInherit extends ExportTrackWithoutObserved {
  public constructor() {}
  
}


`;

const expectDeclarationScript: string = `

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed } from "@ohos.arkui.stateManagement";


export interface IO {
  get t1(): number
  set t1(t1: number)
  
}

@Observed() export declare class ExportObserved implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() export declare class ExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public constructor()
  
  public get t1(): number
  public set t1(t1: number)
  
}

@Observed() export declare class ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  public t1: number;
  @JSONRename({newName:"t2"}) public __backing_t2?: number;
  public get t2(): number
  
  public set t2(newValue: number)
  
  public constructor()
  
}

export declare class ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() declare class NonExportObserved {
  public t1: number;
  public constructor()
  
}

@Observed() declare class NonExportObservedImpl implements IO {
  public t1: number;
  public constructor()
  
}

@Observed() declare class NonExportObservedWithTrack {
  public t1: number;
  @Track() public t2: number;
  public constructor()
  
}

declare class NonExportTrackWithoutObserved {
  @Track() public t1: number;
  public constructor()
  
}

@Observed() declare class ObservedWithBody {
  public t1: number = 1;
  public constructor()
  
}

@Observed() declare class ObservedImplWithBody implements IO {
  public t1: number = 1;
  public constructor()
  
}

@Observed() declare class ObservedWithTrackWithBody {
  public t1: number = 1;
  @Track() public t2: number = 2;
  public constructor()
  
}

declare class TrackWithoutObservedWithBody {
  @Track() public t1: number = 1;
  public constructor()
  
}

@Observed() export declare class ExportObservedWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}

@Observed() export declare class ExportObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  
  public constructor()
  public get t1(): number
  
  public set t1(t1: number)
  
}

@Observed() export declare class ExportObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  public t1: number;
  @JSONRename({newName:"t2"}) public __backing_t2?: number;
  public get t2(): number
  
  public set t2(newValue: number)
  
  public constructor()
  
}

export declare class ExportTrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @JSONRename({newName:"t1"}) public __backing_t1?: number;
  public get t1(): number
  
  public set t1(newValue: number)
  
  public constructor()
  
}


`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.class-observed']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in @Observed classes',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.class-observed'] }
    }
);
