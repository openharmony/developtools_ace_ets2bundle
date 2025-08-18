/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-in-observedv2-class.ets'),
];

const pluginTester = new PluginTester('test @Monitor decorator in @ObservedV2 class transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Button as Button } from "@ohos.arkui.component";

import { Monitor as Monitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace } from "@ohos.arkui.stateManagement";

function main() {}



@ObservedV2() class Info implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  
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
  
  @JSONRename({newName:"name"}) private __backing_name: string = "Tom";
  
  @JSONStringifyIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"region"}) private __backing_region: string = "North";
  
  @JSONStringifyIgnore() private __meta_region: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"job"}) private __backing_job: string = "Teacher";
  
  @JSONStringifyIgnore() private __meta_job: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public age: number = 25;
  
  private __monitor_onNameChange: (IMonitorDecoratedVariable | undefined);
  
  private __monitor_onAgeChange: (IMonitorDecoratedVariable | undefined);
  
  private __monitor_onChange: (IMonitorDecoratedVariable | undefined);
  
  @Monitor({value:["name"]}) public onNameChange(monitor: IMonitor) {
    console.info(\`name change from \${({let gensym%%_43 = monitor.value();
    (((gensym%%_43) == (null)) ? undefined : gensym%%_43.before)})} to \${({let gensym%%_44 = monitor.value();
    (((gensym%%_44) == (null)) ? undefined : gensym%%_44.now)})}\`);
  }
  
  @Monitor({value:["age"]}) public onAgeChange(monitor: IMonitor) {
    console.info(\`age change from \${({let gensym%%_45 = monitor.value();
    (((gensym%%_45) == (null)) ? undefined : gensym%%_45.before)})} to \${({let gensym%%_46 = monitor.value();
    (((gensym%%_46) == (null)) ? undefined : gensym%%_46.now)})}\`);
  }
  
  @Monitor({value:["region", "job"]}) public onChange(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} change from \${({let gensym%%_47 = monitor.value(path);
      (((gensym%%_47) == (null)) ? undefined : gensym%%_47.before)})} to \${({let gensym%%_48 = monitor.value(path);
      (((gensym%%_48) == (null)) ? undefined : gensym%%_48.now)})}\`);
    }));
  }
  
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
    this.__monitor_onNameChange = STATE_MGMT_FACTORY.makeMonitor([{
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    }], ((_m: IMonitor) => {
      this.onNameChange(_m);
    }));
    this.__monitor_onAgeChange = STATE_MGMT_FACTORY.makeMonitor([{
      path: "age",
      valueCallback: ((): Any => {
        return this.age;
      }),
    }], ((_m: IMonitor) => {
      this.onAgeChange(_m);
    }));
    this.__monitor_onChange = STATE_MGMT_FACTORY.makeMonitor([{
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
    }));
  }
  
}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_info = ((({let gensym___130514200 = initializers;
    (((gensym___130514200) == (null)) ? undefined : gensym___130514200.info)})) ?? (new Info()));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_info?: Info;
  
  public get info(): Info {
    return (this.__backing_info as Info);
  }
  
  public set info(value: Info) {
    this.__backing_info = value;
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change name", undefined).onClick(((e) => {
          this.info.name = "Jack";
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change age", undefined).onClick(((e) => {
          this.info.age = 26;
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change region", undefined).onClick(((e) => {
          this.info.region = "South";
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change job", undefined).onClick(((e) => {
          this.info.job = "Driver";
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Index {
  set info(info: (Info | undefined))
  
  get info(): (Info | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator in @ObservedV2 class transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
