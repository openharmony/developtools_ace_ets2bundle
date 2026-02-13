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
import { dumpAnnotation, dumpGetterSetter, GetSetDumper, ignoreNewLines } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/once';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'once-with-require.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @Once Decorator with @Require', buildConfig);

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text, Button as Button } from "@ohos.arkui.component";

import { Param as Param, Once as Once, ObservedV2 as ObservedV2, Trace as Trace, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

@ObservedV2() class Info {
  @Trace() public name: string = "info";

  public constructor() {}

}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @Param() @Once() public onceParamNum: number = 0;

  @Param() @Once() @Require() public onceParamInfo!: Info;

  public build() {
    Column(){
      Text(\`Child onceParamNum: \${this.onceParamNum}\`);
      Text(\`Child onceParamInfo: \${this.onceParamInfo.name}\`);
      Button("changeOnceParamNum").onClick(((e) => {
        (this.onceParamNum++);
      }));
    };
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

  @Local() public localNum: number = 10;

  @Local() public localInfo: Info = new Info();

  public build() {
    Column(){
      Text(\`Parent localNum: \${this.localNum}\`);
      Text(\`Parent localInfo: \${this.localInfo.name}\`);
      Child({
        onceParamNum: this.localNum,
        onceParamInfo: this.localInfo,
      });
    };
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  ${ignoreNewLines(`
  onceParamNum?: number;
  @Param() @Once() __backing_onceParamNum?: number;
  __options_has_onceParamNum?: boolean;
  onceParamInfo: Info;
  @Param() @Once() @Require() __backing_onceParamInfo?: Info;
  __options_has_onceParamInfo?: boolean;
  `)}
  
}

@ComponentV2() export interface __Options_Index {
  ${ignoreNewLines(`
  localNum?: number;
  @Local() __backing_localNum?: number;
  __options_has_localNum?: boolean;
  localInfo?: Info;
  @Local() __backing_localInfo?: Info;
  __options_has_localInfo?: boolean;
  `)}
  
}
`;

const expectedCheckedScript: string = `
import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

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

import { ComponentV2 as ComponentV2, Column as Column, Text as Text, Button as Button } from "@ohos.arkui.component";

import { Param as Param, Once as Once, ObservedV2 as ObservedV2, Trace as Trace, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

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

  @JSONRename({newName:"name"}) public __backing_name: string = "info";

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_name");

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

  public constructor() {}

}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_onceParamNum = STATE_MGMT_FACTORY.makeParamOnce<number>(this, "onceParamNum", ((({let gensym___118919021 = initializers;
    (((gensym___118919021) == (null)) ? undefined : gensym___118919021.onceParamNum)})) ?? (0)));
    this.__backing_onceParamInfo = STATE_MGMT_FACTORY.makeParamOnce<Info>(this, "onceParamInfo", (initializers!.onceParamInfo as Info));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Child | undefined)): void {
    this.__backing_onceParamNum!.resetOnReuse(((({let gensym___114690967 = initializers;
    (((gensym___114690967) == (null)) ? undefined : gensym___114690967.onceParamNum)})) ?? (0)));
    this.__backing_onceParamInfo!.resetOnReuse((initializers!.onceParamInfo as Info));
  }

  private __backing_onceParamNum?: IParamOnceDecoratedVariable<number>;

  public get onceParamNum(): number {
    return this.__backing_onceParamNum!.get();
  }

  public set onceParamNum(value: number) {
    this.__backing_onceParamNum!.set(value);
  }

  private __backing_onceParamInfo?: IParamOnceDecoratedVariable<Info>;

  public get onceParamInfo(): Info {
    return this.__backing_onceParamInfo!.get();
  }

  public set onceParamInfo(value: Info) {
    this.__backing_onceParamInfo!.set(value);
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child();
    }), initializers, reuseId, content, { sClass: Class.from<Index>() });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Child onceParamNum: \${this.onceParamNum}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Child onceParamInfo: \${this.onceParamInfo.name}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("changeOnceParamNum", undefined).onClick(((e) => {
          (this.onceParamNum++);
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_localNum = STATE_MGMT_FACTORY.makeLocal<number>(this, "localNum", 10);
    this.__backing_localInfo = STATE_MGMT_FACTORY.makeLocal<Info>(this, "localInfo", new Info());
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_localNum!.resetOnReuse(10);
    this.__backing_localInfo!.resetOnReuse(new Info());
  }

  private __backing_localNum?: ILocalDecoratedVariable<number>;

  public get localNum(): number {
    return this.__backing_localNum!.get();
  }

  public set localNum(value: number) {
    this.__backing_localNum!.set(value);
  }

  private __backing_localInfo?: ILocalDecoratedVariable<Info>;

  public get localInfo(): Info {
    return this.__backing_localInfo!.get();
  }

  public set localInfo(value: Info) {
    this.__backing_localInfo!.set(value);
  }

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

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Parent localNum: \${this.localNum}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Parent localInfo: \${this.localInfo.name}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      Child._invoke(@Memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          onceParamNum: this.localNum,
          __options_has_onceParamNum: true,
          onceParamInfo: this.localInfo,
          __options_has_onceParamInfo: true,
        };
      }), undefined, undefined, undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceParamNum', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceParamNum', '(IParamOnceDecoratedVariable<number> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceParamNum', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceParamInfo', 'Info', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceParamInfo', '(IParamOnceDecoratedVariable<Info> | undefined)', [dumpAnnotation('Param'), dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceParamInfo', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'localNum', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localNum', '(ILocalDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localNum', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localInfo', '(Info | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localInfo', '(ILocalDecoratedVariable<Info> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localInfo', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Once Decorator with @Require',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
