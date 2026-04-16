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
import { dumpGetterSetter, GetSetDumper, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/syncmonitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'enum-syncmonitor-params.ets'),
];

const pluginTester = new PluginTester('test @SyncMonitor decorator enum parameters transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

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

import { SyncMonitor as SyncMonitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/syncmonitor/enum-syncmonitor-params",
  pageFullPath: "test/demo/mock/decorators/syncmonitor/enum-syncmonitor-params",
  integratedHsp: "false",
} as NavInterface));
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
  
  private constructor(ordinal: int, value: String, name: String) {
    super(value, name);
    this.#ordinal = ordinal;
  }
  
  public static readonly name1: MonitorNames = new MonitorNames(0, "strArr.0", "name1");
  public static readonly name2: MonitorNames = new MonitorNames(1, "name", "name2");
  public static readonly name3: MonitorNames = new MonitorNames(2, "strArr.0", "name3");
  public static readonly name4: MonitorNames = new MonitorNames(3, "varF.ff", "name4");
  private static readonly #ItemsArray: MonitorNames[] = [MonitorNames.name1, MonitorNames.name2, MonitorNames.name3, MonitorNames.name4];
  public static getValueOf(name: String): MonitorNames {
    for (let i = ((MonitorNames.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (MonitorNames.#ItemsArray[i].getName()))) {
        return MonitorNames.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant MonitorNames.") + (name)));
  }
  
  public static fromValue(value: String): MonitorNames {
    for (let i = ((MonitorNames.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((MonitorNames.#ItemsArray[i].valueOf()) == (value))) {
        return MonitorNames.#ItemsArray[i];
      }
    }
    throw new Error((("No enum MonitorNames with value ") + (value)));
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
  @JSONRename({newName:"strArr"}) public __backing_strArr: Array<string> = ["North", "east"];
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_strArr: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_strArr");
  private __SyncMonitor_changeCCC: (IMonitorDecoratedVariable | undefined);
  @SyncMonitor({value:[MonitorNames.name1, MonitorNames.name2, MonitorNames.name3]}) 
  public changeCCC(monitor: IMonitor) {}
  
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
    this.__SyncMonitor_changeCCC = STATE_MGMT_FACTORY.makeSyncMonitor([{
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
    }), {
      owner: undefined,
      functionName: "changeCCC",
    });
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_varF = STATE_MGMT_FACTORY.makeLocal<FFF>(this, "varF", new FFF());
    this.__SyncMonitor_changeEEE = STATE_MGMT_FACTORY.makeSyncMonitor([{
      path: "varF.ff",
      valueCallback: ((): Any => {
        return ({let gensym___55756901 = this.varF;
        (((gensym___55756901) == (null)) ? undefined : gensym___55756901.ff)});
      }),
    }], ((_m: IMonitor) => {
      this.changeEEE(_m);
    }), {
      owner: this,
      functionName: "changeEEE",
    });
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_varF!.resetOnReuse(new FFF());
    this.__SyncMonitor_changeEEE!.resetOnReuse();
  }
  
  private __backing_varF?: ILocalDecoratedVariable<FFF>;
  public get varF(): FFF {
    return this.__backing_varF!.get();
  }
  
  public set varF(value: FFF) {
    this.__backing_varF!.set(value);
  }
  
  private __SyncMonitor_changeEEE: (IMonitorDecoratedVariable | undefined);
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
  
  @SyncMonitor({value:[MonitorNames.name4]}) 
  public changeEEE(monitor: IMonitor) {}
  
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
  ${dumpGetterSetter(GetSetDumper.BOTH, 'varF', '(FFF | undefined)', [dumpAnnotation('Local')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_varF', '(ILocalDecoratedVariable<FFF> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_varF', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @SyncMonitor decorator enum parameters transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
