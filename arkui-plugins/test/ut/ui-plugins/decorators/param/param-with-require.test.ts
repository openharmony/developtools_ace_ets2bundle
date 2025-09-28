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

const OBSERVED_DIR_PATH: string = 'decorators/param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'param-with-require.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @Param Decorator with @Require', buildConfig);

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2, Column as Column, ForEach as ForEach, Button as Button, Text as Text } from "@ohos.arkui.component";

import { Param as Param, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

class Region {
  public x: number;

  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

}

class Info {
  public name: string;

  public age: number;

  public region: Region;

  public constructor(name: string, age: number, x: number, y: number) {
    this.name = name;
    this.age = age;
    this.region = new Region(x, y);
  }

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Local() public infoList: Info[] = [new Info("Alice", 8, 0, 0), new Info("Barry", 10, 1, 20), new Info("Cindy", 18, 24, 40)];

  public build() {
    Column(){
      ForEach<Info>(this.infoList, ((info: Info) => {
        MiddleComponent({
          info: info,
        });
      }));
      Button("change").onClick(((e) => {
        this.infoList[0] = new Info("Atom", 40, 27, 90);
        this.infoList[1].name = "Bob";
        this.infoList[2].region = new Region(7, 9);
      }));
    };
  }

  public constructor() {}

}

@ComponentV2() final struct MiddleComponent extends CustomComponentV2<MiddleComponent, __Options_MiddleComponent> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MiddleComponent, storage?: LocalStorage, @Builder() content?: (()=> void)): MiddleComponent {
    throw new Error("Declare interface");
  }

  @Require() @Param() public info!: Info;

  public build() {
    Column(){
      Text(\`name: \${this.info.name}\`);
      Text(\`age: \${this.info.age}\`);
      SubComponent({
        region: this.info.region,
      });
    };
  }

  public constructor() {}

}

@ComponentV2() final struct SubComponent extends CustomComponentV2<SubComponent, __Options_SubComponent> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_SubComponent, storage?: LocalStorage, @Builder() content?: (()=> void)): SubComponent {
    throw new Error("Declare interface");
  }

  @Require() @Param() public region!: Region;

  public build() {
    Column(){
      Text(\`region: \${this.region.x}-\${this.region.y}\`);
    };
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Index {
  infoList?: Info[];
  @Local() __backing_infoList?: Info[];
  __options_has_infoList?: boolean;
  
}

@ComponentV2() export interface __Options_MiddleComponent {
  info?: Info;
  @Require() @Param() __backing_info?: Info;
  __options_has_info?: boolean;
  
}

@ComponentV2() export interface __Options_SubComponent {
  region?: Region;
  @Require() @Param() __backing_region?: Region;
  __options_has_region?: boolean;
  
}
`;

const expectedCheckedScript: string = `
import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";

import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2, Column as Column, ForEach as ForEach, Button as Button, Text as Text } from "@ohos.arkui.component";

import { Param as Param, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}


class Region {
  public x: number;

  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

}

class Info {
  public name: string;

  public age: number;

  public region: Region;

  public constructor(name: string, age: number, x: number, y: number) {
    this.name = name;
    this.age = age;
    this.region = new Region(x, y);
  }

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_infoList = STATE_MGMT_FACTORY.makeLocal<Array<Info>>(this, "infoList", [new Info("Alice", 8, 0, 0), new Info("Barry", 10, 1, 20), new Info("Cindy", 18, 24, 40)]);
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  private __backing_infoList?: ILocalDecoratedVariable<Array<Info>>;

  public get infoList(): Array<Info> {
    return this.__backing_infoList!.get();
  }

  public set infoList(value: Array<Info>) {
    this.__backing_infoList!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ForEachImpl<Info>(@memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions<Info>(((): Array<Info> => {
          return this.infoList;
        }), @memo() ((info: Info) => {
          MiddleComponent._invoke(@memo() ((instance: MiddleComponent): void => {
            instance.applyAttributesFinish();
            return;
          }), (() => {
            return {
              info: info,
              __options_has_info: true,
            };
          }), undefined, undefined, undefined);
        }), undefined);
        return;
      }));
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change", undefined).onClick(((e) => {
          this.infoList[0] = new Info("Atom", 40, 27, 90);
          this.infoList[1].name = "Bob";
          this.infoList[2].region = new Region(7, 9);
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() final struct MiddleComponent extends CustomComponentV2<MiddleComponent, __Options_MiddleComponent> {
  public __initializeStruct(initializers: (__Options_MiddleComponent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_info = STATE_MGMT_FACTORY.makeParam<Info>(this, "info", (initializers!.info as Info));
  }

  public __updateStruct(initializers: (__Options_MiddleComponent | undefined)): void {
    if (({let gensym___20494961 = initializers;
    (((gensym___20494961) == (null)) ? undefined : gensym___20494961.__options_has_info)})) {
      this.__backing_info!.update((initializers!.info as Info));
    }
  }

  private __backing_info?: IParamDecoratedVariable<Info>;

  public get info(): Info {
    return this.__backing_info!.get();
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MiddleComponent)=> void), initializers: ((()=> __Options_MiddleComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<MiddleComponent, __Options_MiddleComponent>(style, ((): MiddleComponent => {
      return new MiddleComponent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MiddleComponent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MiddleComponent {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`name: \${this.info.name}\`, undefined).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`age: \${this.info.age}\`, undefined).applyAttributesFinish();
        return;
      }), undefined);
      SubComponent._invoke(@memo() ((instance: SubComponent): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          region: this.info.region,
          __options_has_region: true,
        };
      }), undefined, undefined, undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() final struct SubComponent extends CustomComponentV2<SubComponent, __Options_SubComponent> {
  public __initializeStruct(initializers: (__Options_SubComponent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_region = STATE_MGMT_FACTORY.makeParam<Region>(this, "region", (initializers!.region as Region));
  }

  public __updateStruct(initializers: (__Options_SubComponent | undefined)): void {
    if (({let gensym___4614499 = initializers;
    (((gensym___4614499) == (null)) ? undefined : gensym___4614499.__options_has_region)})) {
      this.__backing_region!.update((initializers!.region as Region));
    }
  }

  private __backing_region?: IParamDecoratedVariable<Region>;

  public get region(): Region {
    return this.__backing_region!.get();
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: SubComponent)=> void), initializers: ((()=> __Options_SubComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<SubComponent, __Options_SubComponent>(style, ((): SubComponent => {
      return new SubComponent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_SubComponent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): SubComponent {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`region: \${this.region.x}-\${this.region.y}\`, undefined).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Index {
  set infoList(infoList: (Array<Info> | undefined))
  
  get infoList(): (Array<Info> | undefined)
  set __backing_infoList(__backing_infoList: (ILocalDecoratedVariable<Array<Info>> | undefined))
  
  get __backing_infoList(): (ILocalDecoratedVariable<Array<Info>> | undefined)
  set __options_has_infoList(__options_has_infoList: (boolean | undefined))
  
  get __options_has_infoList(): (boolean | undefined)
  
}

@ComponentV2() export interface __Options_MiddleComponent {
  set info(info: (Info | undefined))
  
  get info(): (Info | undefined)
  @Require() set __backing_info(__backing_info: (IParamDecoratedVariable<Info> | undefined))
  
  @Require() get __backing_info(): (IParamDecoratedVariable<Info> | undefined)
  set __options_has_info(__options_has_info: (boolean | undefined))
  
  get __options_has_info(): (boolean | undefined)
  
}

@ComponentV2() export interface __Options_SubComponent {
  set region(region: (Region | undefined))
  
  get region(): (Region | undefined)
  @Require() set __backing_region(__backing_region: (IParamDecoratedVariable<Region> | undefined))
  
  @Require() get __backing_region(): (IParamDecoratedVariable<Region> | undefined)
  set __options_has_region(__options_has_region: (boolean | undefined))
  
  get __options_has_region(): (boolean | undefined)
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Param Decorator with @Require',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
