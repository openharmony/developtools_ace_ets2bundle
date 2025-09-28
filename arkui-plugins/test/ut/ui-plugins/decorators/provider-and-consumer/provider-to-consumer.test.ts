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

const STATE_DIR_PATH: string = 'decorators/provider-and-consumer';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'provider-to-consumer.ets'),
];

const pluginTester = new PluginTester('test usage of @Provider and @Consumer decorator', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { IConsumerDecoratedVariable as IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";

import { DividerAttribute as DividerAttribute } from "arkui.component.divider";

import { DividerImpl as DividerImpl } from "arkui.component.divider";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ForEachImpl as ForEachImpl } from "arkui.component.forEach";

import { IProviderDecoratedVariable as IProviderDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, DragEvent as DragEvent, Button as Button, Column as Column, Text as Text, ForEach as ForEach, Divider as Divider } from "@ohos.arkui.component";

import { Provider as Provider, Consumer as Consumer, Local as Local, ObservedV2 as ObservedV2, Trace as Trace } from "@ohos.arkui.stateManagement";

const data: Array<User> = [new User("Json", 10), new User("Eric", 15)];
function main() {}


@ObservedV2() class User implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"name"}) private __backing_name?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  @JSONRename({newName:"age"}) private __backing_age?: number;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_age: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  public get name(): string {
    this.conditionalAddRef(this.__meta_name);
    return UIUtils.makeObserved((this.__backing_name as string));
  }
  
  public set name(newValue: string) {
    if (((this.__backing_name) !== (newValue))) {
      this.__backing_name = newValue;
      this.__meta_name.fireChange();
      this.executeOnSubscribingWatches("name");
    }
  }
  
  public get age(): number {
    this.conditionalAddRef(this.__meta_age);
    return UIUtils.makeObserved((this.__backing_age as number));
  }
  
  public set age(newValue: number) {
    if (((this.__backing_age) !== (newValue))) {
      this.__backing_age = newValue;
      this.__meta_age.fireChange();
      this.executeOnSubscribingWatches("age");
    }
  }
  
  public constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_users = STATE_MGMT_FACTORY.makeProvider<Array<User>>(this, "users", "data", data);
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_users?: IProviderDecoratedVariable<Array<User>>;
  public get users(): Array<User> {
    return this.__backing_users!.get();
  }
  
  public set users(value: Array<User>) {
    this.__backing_users!.set(value);
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), undefined, undefined, undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("add new user", undefined).onClick(((e) => {
          this.users.push(new User("Molly", 18));
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("age++", undefined).onClick(((e) => {
          (this.users[0].age++);
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change name", undefined).onClick(((e) => {
          this.users[0].name = "Shelly";
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_users = STATE_MGMT_FACTORY.makeConsumer<Array<User>>(this, "users", "data", []);
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {}
  
  private __backing_users?: IConsumerDecoratedVariable<Array<User>>;
  public get users(): Array<User> {
    return this.__backing_users!.get();
  }
  
  public set users(value: Array<User>) {
    this.__backing_users!.set(value);
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ForEachImpl<User>(@memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions<User>(((): Array<User> => {
          return this.users;
        }), @memo() ((item: User) => {
          ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
          }), @memo() (() => {
            TextImpl(@memo() ((instance: TextAttribute): void => {
              instance.setTextOptions(\`name: \${item.name}\`, undefined).fontSize(30).applyAttributesFinish();
              return;
            }), undefined);
            TextImpl(@memo() ((instance: TextAttribute): void => {
              instance.setTextOptions(\`age: \${item.age}\`, undefined).fontSize(30).applyAttributesFinish();
              return;
            }), undefined);
            DividerImpl(@memo() ((instance: DividerAttribute): void => {
              instance.setDividerOptions().applyAttributesFinish();
              return;
            }));
          }));
        }), undefined);
        return;
      }));
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'users', '(Array<User> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_users', '(IProviderDecoratedVariable<Array<User>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_users', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'users', '(Array<User> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_users', '(IConsumerDecoratedVariable<Array<User>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_users', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test usage of @Provider and @Consumer decorator',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
