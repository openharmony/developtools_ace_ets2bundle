/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/syncmonitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'syncmonitor-in-observedv2-class.ets'),
];

const pluginTester = new PluginTester('test @SyncMonitor decorator in @ObservedV2 class transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { SyncMonitor as SyncMonitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/syncmonitor/syncmonitor-in-observedv2-class",
  pageFullPath: "test/demo/mock/decorators/syncmonitor/syncmonitor-in-observedv2-class",
  integratedHsp: "false",
} as NavInterface));
@ObservedV2() class Info implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"name"}) public __backing_name: string = "Tom";
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_name");
  @JSONRename({newName:"region"}) public __backing_region: string = "North";
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_region: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_region");
  @JSONRename({newName:"job"}) public __backing_job: string = "Teacher";
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_job: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_job");
  public age: number = 25;
  private __SyncMonitor_onNameChange: (IMonitorDecoratedVariable | undefined);
  private __SyncMonitor_onAgeChange: (IMonitorDecoratedVariable | undefined);
  private __SyncMonitor_onChange: (IMonitorDecoratedVariable | undefined);
  @SyncMonitor({value:["name"]}) 
  public onNameChange(monitor: IMonitor) {}
  
  @SyncMonitor({value:["age"]}) 
  public onAgeChange(monitor: IMonitor) {}
  
  @SyncMonitor({value:["region", "job"]}) 
  public onChange(monitor: IMonitor) {}
  
  public get name(): string {
    this.conditionalAddRef(this.__meta_name);
    return UIUtils.makeObserved(this.__backing_name);
  }
  
  public set name(newValue: string) {
    if (((this.__backing_name) !== (newValue))) {
      this.__backing_name = newValue;
      this.__meta_name.fireChange();
      this.executeOnSubscribingWatches("name");
    }
  }
  
  public get region(): string {
    this.conditionalAddRef(this.__meta_region);
    return UIUtils.makeObserved(this.__backing_region);
  }
  
  public set region(newValue: string) {
    if (((this.__backing_region) !== (newValue))) {
      this.__backing_region = newValue;
      this.__meta_region.fireChange();
      this.executeOnSubscribingWatches("region");
    }
  }
  
  public get job(): string {
    this.conditionalAddRef(this.__meta_job);
    return UIUtils.makeObserved(this.__backing_job);
  }
  
  public set job(newValue: string) {
    if (((this.__backing_job) !== (newValue))) {
      this.__backing_job = newValue;
      this.__meta_job.fireChange();
      this.executeOnSubscribingWatches("job");
    }
  }
  
  public constructor() {
    this.__SyncMonitor_onNameChange = STATE_MGMT_FACTORY.makeSyncMonitor([{
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    }], ((_m: IMonitor) => {
      this.onNameChange(_m);
    }), {
      owner: undefined,
      functionName: "onNameChange",
    });
    this.__SyncMonitor_onAgeChange = STATE_MGMT_FACTORY.makeSyncMonitor([{
      path: "age",
      valueCallback: ((): Any => {
        return this.age;
      }),
    }], ((_m: IMonitor) => {
      this.onAgeChange(_m);
    }), {
      owner: undefined,
      functionName: "onAgeChange",
    });
    this.__SyncMonitor_onChange = STATE_MGMT_FACTORY.makeSyncMonitor([{
      path: "region",
      valueCallback: ((): Any => {
        return this.region;
      }),
    }, {
      path: "job",
      valueCallback: ((): Any => {
        return this.job;
      }),
    }], ((_m: IMonitor) => {
      this.onChange(_m);
    }), {
      owner: undefined,
      functionName: "onChange",
    });
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content, {
      sClass: Class.from<Index>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {}
  
  public constructor() {}
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() export interface __Options_Index {
  
}

`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @SyncMonitor decorator in @ObservedV2 class transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
