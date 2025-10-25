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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/event';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'event-initialize.ets'),
];

const pluginTester = new PluginTester('test @Event decorator transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Event as Event, Param as Param, Local as Local } from "@ohos.arkui.stateManagement";

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @Param() public index: number = 0;

  @Event() public changeIndex!: ((val: number)=> void);

  @Event() public testEvent!: ((val: number)=> number);

  @Event() public testEvent2: ((val: number)=> number) = ((val: number) => {
    return val;
  });

  public build() {
    Column(){
      Text(\`Child index: \${this.index}\`).onClick(((e) => {
        this.changeIndex(20);
        console.log(\`after changeIndex \${this.index}\`);
      }));
    };
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Local() public index: number = 0;

  public build() {
    Column(){
      Child({
        index: this.index,
        changeIndex: ((val: number) => {
          this.index = val;
          console.log(\`in changeIndex \${this.index}\`);
        }),
      });
    };
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  ${ignoreNewLines(`
  index?: number;
  @Param() __backing_index?: number;
  __options_has_index?: boolean;
  changeIndex?: ((val: number)=> void);
  __options_has_changeIndex?: boolean;
  testEvent?: ((val: number)=> number);
  __options_has_testEvent?: boolean;
  testEvent2?: ((val: number)=> number);
  __options_has_testEvent2?: boolean;
  `)}
  
}

@ComponentV2() export interface __Options_Index {
  ${ignoreNewLines(`
  index?: number;
  @Local() __backing_index?: number;
  __options_has_index?: boolean;
  `)}

}
`;

const expectedCheckedScript: string = `
import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text } from "@ohos.arkui.component";

import { Event as Event, Param as Param, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_index = STATE_MGMT_FACTORY.makeParam<number>(this, "index", ((({let gensym___23942905 = initializers;
    (((gensym___23942905) == (null)) ? undefined : gensym___23942905.index)})) ?? (0)));
    this.__backing_changeIndex = ((({let gensym___204042774 = initializers;
    (((gensym___204042774) == (null)) ? undefined : gensym___204042774.changeIndex)})) ?? (undefined));
    this.__backing_testEvent = ((({let gensym___124585092 = initializers;
    (((gensym___124585092) == (null)) ? undefined : gensym___124585092.testEvent)})) ?? (undefined));
    this.__backing_testEvent2 = ((({let gensym___189097286 = initializers;
    (((gensym___189097286) == (null)) ? undefined : gensym___189097286.testEvent2)})) ?? (((val: number) => {
      return val;
    })));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (({let gensym___90897897 = initializers;
    (((gensym___90897897) == (null)) ? undefined : gensym___90897897.__options_has_index)})) {
      this.__backing_index!.update((initializers!.index as number));
    }
  }

  private __backing_index?: IParamDecoratedVariable<number>;

  public get index(): number {
    return this.__backing_index!.get();
  }

  private __backing_changeIndex?: ((val: number)=> void);

  public get changeIndex(): ((val: number)=> void) {
    return (this.__backing_changeIndex as ((val: number)=> void));
  }

  public set changeIndex(value: ((val: number)=> void)) {
    this.__backing_changeIndex = value;
  }

  private __backing_testEvent?: ((val: number)=> number);

  public get testEvent(): ((val: number)=> number) {
    return (this.__backing_testEvent as ((val: number)=> number));
  }

  public set testEvent(value: ((val: number)=> number)) {
    this.__backing_testEvent = value;
  }

  private __backing_testEvent2?: ((val: number)=> number);

  public get testEvent2(): ((val: number)=> number) {
    return (this.__backing_testEvent2 as ((val: number)=> number));
  }

  public set testEvent2(value: ((val: number)=> number)) {
    this.__backing_testEvent2 = value;
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child();
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Child index: \${this.index}\`, undefined).onClick(((e) => {
          this.changeIndex(20);
          console.log(\`after changeIndex \${this.index}\`);
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_index = STATE_MGMT_FACTORY.makeLocal<number>(this, "index", 0);
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  private __backing_index?: ILocalDecoratedVariable<number>;

  public get index(): number {
    return this.__backing_index!.get();
  }

  public set index(value: number) {
    this.__backing_index!.set(value);
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
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          index: this.index,
          __options_has_index: true,
          changeIndex: ((val: number) => {
            this.index = val;
            console.log(\`in changeIndex \${this.index}\`);
          }),
          __options_has_changeIndex: true,
        };
      }), undefined, undefined, undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'index', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_index', '(IParamDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_index', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'changeIndex', '(((val: number)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_changeIndex', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'testEvent', '(((val: number)=> number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_testEvent', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'testEvent2', '(((val: number)=> number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_testEvent2', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'index', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_index', '(ILocalDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_index', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Event decorator transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
