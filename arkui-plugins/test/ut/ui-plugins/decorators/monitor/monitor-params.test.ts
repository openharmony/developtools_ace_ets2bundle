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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-params.ets'),
];

const pluginTester = new PluginTester('test @Monitor decorator parameters transformation', buildConfig);

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

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2, Column as Column, Button as Button } from "@ohos.arkui.component";

import { Monitor as Monitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

class AAA {
  public aaa: BBB = new BBB();

  public constructor() {}

}

class BBB {
  public bbb: CCC = new CCC();

  public constructor() {}

}

class CCC {
  public ccc: Array<DDD> = new Array<DDD>(new DDD(10), new DDD(12), new DDD(16));

  public constructor() {}

}

class DDD {
  public dd: Array<number>;

  public constructor(dd: number) {
    this.dd = [];
    for (let i = 4;((i) < (dd));(i++)) {
      this.dd.push(i);
    }
  }

}

class EEE {
  public ee: FFF = new FFF();

  public constructor() {}

}

class FFF {
  public ff: GGG = new GGG();

  public constructor() {}

}

class GGG {
  public constructor() {}

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

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  @JSONRename({newName:"strArr"}) public __backing_strArr: Array<string> = ["North", "east"];

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_strArr: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  @JSONRename({newName:"job"}) public __backing_job: AAA = new AAA();

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_job: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public age: number = 25;

  private __monitor_onNameChange: (IMonitorDecoratedVariable | undefined);

  private __monitor_onAgeChange: (IMonitorDecoratedVariable | undefined);

  private __monitor_onJobChange: (IMonitorDecoratedVariable | undefined);

  @Monitor({value:["name"]}) 
  public onNameChange(monitor: IMonitor) {}

  @Monitor({value:["strArr.0", "age"]}) 
  public onAgeChange(monitor: IMonitor) {}

  @Monitor({value:["job.aaa.bbb.ccc.1.dd.0"]}) 
  public onJobChange(monitor: IMonitor) {}

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

  public get job(): AAA {
    this.conditionalAddRef(this.__meta_job);
    return UIUtils.makeObserved(this.__backing_job);
  }

  public set job(newValue: AAA) {
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
      path: "strArr.0",
      valueCallback: ((): Any => {
        return ({let gensym___127309370 = this.strArr;
        (((gensym___127309370) == (null)) ? undefined : gensym___127309370.$_get(0))});
      }),
    }, {
      path: "age",
      valueCallback: ((): Any => {
        return this.age;
      }),
    }], ((_m: IMonitor) => {
      this.onAgeChange(_m);
    }));
    this.__monitor_onJobChange = STATE_MGMT_FACTORY.makeMonitor([{
      path: "job.aaa.bbb.ccc.1.dd.0",
      valueCallback: ((): Any => {
        return ({let gensym___1661894 = ({let gensym___87426618 = ({let gensym___223024592 = ({let gensym___215921992 = ({let gensym___22088104 = ({let gensym___245550938 = this.job;
        (((gensym___245550938) == (null)) ? undefined : gensym___245550938.aaa)});
        (((gensym___22088104) == (null)) ? undefined : gensym___22088104.bbb)});
        (((gensym___215921992) == (null)) ? undefined : gensym___215921992.ccc)});
        (((gensym___223024592) == (null)) ? undefined : gensym___223024592.$_get(1))});
        (((gensym___87426618) == (null)) ? undefined : gensym___87426618.dd)});
        (((gensym___1661894) == (null)) ? undefined : gensym___1661894.$_get(0))});
      }),
    }], ((_m: IMonitor) => {
      this.onJobChange(_m);
    }));
  }

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_per = STATE_MGMT_FACTORY.makeLocal<EEE>(this, "per", new EEE());
    this.__backing_v1 = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "v1", true);
    this.__backing_numArr = STATE_MGMT_FACTORY.makeLocal<Array<string>>(this, "numArr", ["1", "3", "5"]);
    this.__monitor_onPerChange = STATE_MGMT_FACTORY.makeMonitor([{
      path: "per.ee.ff",
      valueCallback: ((): Any => {
        return ({let gensym___164069504 = ({let gensym___239523226 = this.per;
        (((gensym___239523226) == (null)) ? undefined : gensym___239523226.ee)});
        (((gensym___164069504) == (null)) ? undefined : gensym___164069504.ff)});
      }),
    }, {
      path: "v1",
      valueCallback: ((): Any => {
        return this.v1;
      }),
    }, {
      path: "numArr.1",
      valueCallback: ((): Any => {
        return ({let gensym___124152275 = this.numArr;
        (((gensym___124152275) == (null)) ? undefined : gensym___124152275.$_get(1))});
      }),
    }], ((_m: IMonitor) => {
      this.onPerChange(_m);
    }), this);
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_per!.resetOnReuse(new EEE());
    this.__backing_v1!.resetOnReuse(true);
    this.__backing_numArr!.resetOnReuse(["1", "3", "5"]);
    this.__monitor_onPerChange!.resetOnReuse();
  }

  private __backing_per?: ILocalDecoratedVariable<EEE>;

  public get per(): EEE {
    return this.__backing_per!.get();
  }

  public set per(value: EEE) {
    this.__backing_per!.set(value);
  }

  private __backing_v1?: ILocalDecoratedVariable<boolean>;

  public get v1(): boolean {
    return this.__backing_v1!.get();
  }

  public set v1(value: boolean) {
    this.__backing_v1!.set(value);
  }

  private __backing_numArr?: ILocalDecoratedVariable<Array<string>>;

  public get numArr(): Array<string> {
    return this.__backing_numArr!.get();
  }

  public set numArr(value: Array<string>) {
    this.__backing_numArr!.set(value);
  }

  private __monitor_onPerChange: (IMonitorDecoratedVariable | undefined);

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content, { sClass: Class.from<Index>() });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

  @Monitor({value:["per.ee.ff", "v1", "numArr.1"]}) 
  public onPerChange(monitor: IMonitor) {}

  @Memo() 
  public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'per', '(EEE | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_per', '(ILocalDecoratedVariable<EEE> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_per', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'v1', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_v1', '(ILocalDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_v1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'numArr', '(Array<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_numArr', '(ILocalDecoratedVariable<Array<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_numArr', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator parameters transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
