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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'enum-monitor-params.ets'),
];

const pluginTester = new PluginTester('test @Monitor decorator enum parameters transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Monitor as Monitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}


class FFF {
  public ff: GGG = new GGG();
  
  public constructor() {}
  
}

class GGG {
  public constructor() {}
  
}

final class MonitorNames extends BaseEnum<String> {
  private readonly #ordinal: int;
  
  private static <cctor>() {}
  
  public constructor(ordinal: int, value: String) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly name1: MonitorNames = new MonitorNames(0, "strArr.0");
  
  public static readonly name2: MonitorNames = new MonitorNames(1, "name");
  
  public static readonly name3: MonitorNames = new MonitorNames(2, "strArr.0");
  
  public static readonly name4: MonitorNames = new MonitorNames(3, "varF.ff");
  
  private static readonly #NamesArray: String[] = ["name1", "name2", "name3", "name4"];
  
  private static readonly #StringValuesArray: String[] = ["strArr.0", "name", "strArr.0", "varF.ff"];
  
  private static readonly #ItemsArray: MonitorNames[] = [MonitorNames.name1, MonitorNames.name2, MonitorNames.name3, MonitorNames.name4];
  
  public getName(): String {
    return MonitorNames.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): MonitorNames {
    for (let i = 0;((i) < (MonitorNames.#NamesArray.length));(++i)) {
      if (((name) == (MonitorNames.#NamesArray[i]))) {
        return MonitorNames.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant MonitorNames.") + (name)));
  }
  
  public static fromValue(value: String): MonitorNames {
    for (let i = 0;((i) < (MonitorNames.#StringValuesArray.length));(++i)) {
      if (((value) == (MonitorNames.#StringValuesArray[i]))) {
        return MonitorNames.#ItemsArray[i];
      }
    }
    throw new Error((("No enum MonitorNames with value ") + (value)));
  }
  
  public valueOf(): String {
    return MonitorNames.#StringValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return MonitorNames.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): MonitorNames[] {
    return MonitorNames.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: MonitorNames): String {
    return e.getName();
  }
  
}

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
  
  @JSONRename({newName:"strArr"}) private __backing_strArr: Array<string> = ["North", "east"];
  
  @JSONStringifyIgnore() private __meta_strArr: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __monitor_changeCCC: (IMonitorDecoratedVariable | undefined);
  
  @Monitor({value:[MonitorNames.name1, MonitorNames.name2, MonitorNames.name3]}) public changeCCC(monitor: IMonitor) {}
  
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
  
  public get strArr(): Array<string> {
    this.conditionalAddRef(this.__meta_strArr);
    return UIUtils.makeObserved(this.__backing_strArr);
  }
  
  public set strArr(newValue: Array<string>) {
    if (((this.__backing_strArr) !== (newValue))) {
      this.__backing_strArr = newValue;
      this.__meta_strArr.fireChange();
      this.executeOnSubscribingWatches("strArr");
    }
  }
  
  public constructor() {
    this.__monitor_changeCCC = STATE_MGMT_FACTORY.makeMonitor([{
      path: "strArr.0",
      valueCallback: ((): Any => {
        return ({let gensym___127309370 = this.strArr;
        (((gensym___127309370) == (null)) ? undefined : gensym___127309370.$_get(0))});
      }),
    }, {
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    }, {
      path: "strArr.0",
      valueCallback: ((): Any => {
        return ({let gensym___214506040 = this.strArr;
        (((gensym___214506040) == (null)) ? undefined : gensym___214506040.$_get(0))});
      }),
    }], ((_m: IMonitor) => {
      this.changeCCC(_m);
    }));
  }
  
}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_varF = STATE_MGMT_FACTORY.makeLocal<FFF>(this, "varF", new FFF());
    this.__monitor_changeEEE = STATE_MGMT_FACTORY.makeMonitor([{
      path: "varF.ff",
      valueCallback: ((): Any => {
        return ({let gensym___55756901 = this.varF;
        (((gensym___55756901) == (null)) ? undefined : gensym___55756901.ff)});
      }),
    }], ((_m: IMonitor) => {
      this.changeEEE(_m);
    }));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_varF?: ILocalDecoratedVariable<FFF>;
  
  public get varF(): FFF {
    return this.__backing_varF!.get();
  }
  
  public set varF(value: FFF) {
    this.__backing_varF!.set(value);
  }
  
  private __monitor_changeEEE: (IMonitorDecoratedVariable | undefined);
  
  @Monitor({value:[MonitorNames.name4]}) public changeEEE(monitor: IMonitor) {}
  
  @memo() public build() {}
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Index {
  set varF(varF: (FFF | undefined))
  
  get varF(): (FFF | undefined)
  set __backing_varF(__backing_varF: (ILocalDecoratedVariable<FFF> | undefined))
  
  get __backing_varF(): (ILocalDecoratedVariable<FFF> | undefined)
  set __options_has_varF(__options_has_varF: (boolean | undefined))
  
  get __options_has_varF(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator enum parameters transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
