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
import { mockBuildConfig, mockProjectConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext, ProjectConfig } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-union-type-wildcard.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 26;

const pluginTester = new PluginTester('test @Monitor decorator with union types and wildcard', buildConfig, projectConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2, Column as Column } from "@ohos.arkui.component";

import { Monitor as Monitor, Local as Local, IMonitor as IMonitor, ObservedV2 as ObservedV2, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}

@ObservedV2() class Person implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  public setV1RenderId(renderId: RenderIdType): void {}
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  @JSONRename({newName:"name"}) public __backing_name: string = "Tom";
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
  @JSONRename({newName:"age"}) public __backing_age: number = 24;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_age: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_age");
  public get age(): number {
    this.conditionalAddRef(this.__meta_age);
    return UIUtils.makeObserved(this.__backing_age);
  }
  public set age(newValue: number) {
    if (((this.__backing_age) !== (newValue))) {
      this.__backing_age = newValue;
      this.__meta_age.fireChange();
      this.executeOnSubscribingWatches("age");
    }
  }
  public constructor() {}
  public addRefAnyProp(): void {
    this.__meta_name.addRef();
    this.__meta_age.addRef();
  }
  static {
  }
}
@ObservedV2() class Animal implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  public setV1RenderId(renderId: RenderIdType): void {}
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  @JSONRename({newName:"species"}) public __backing_species: string = "Cat";
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_species: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_species");
  public get species(): string {
    this.conditionalAddRef(this.__meta_species);
    return UIUtils.makeObserved(this.__backing_species);
  }
  public set species(newValue: string) {
    if (((this.__backing_species) !== (newValue))) {
      this.__backing_species = newValue;
      this.__meta_species.fireChange();
      this.executeOnSubscribingWatches("species");
    }
  }
  @JSONRename({newName:"weight"}) public __backing_weight: number = 5;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_weight: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_weight");
  public get weight(): number {
    this.conditionalAddRef(this.__meta_weight);
    return UIUtils.makeObserved(this.__backing_weight);
  }
  public set weight(newValue: number) {
    if (((this.__backing_weight) !== (newValue))) {
      this.__backing_weight = newValue;
      this.__meta_weight.fireChange();
      this.executeOnSubscribingWatches("weight");
    }
  }
  public constructor() {}
  public addRefAnyProp(): void {
    this.__meta_species.addRef();
    this.__meta_weight.addRef();
  }
  static {
  }
}
@ObservedV2() class BoxA implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  public setV1RenderId(renderId: RenderIdType): void {}
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  @JSONRename({newName:"inner"}) public __backing_inner: Person = new Person();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_inner: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_inner");
  public get inner(): Person {
    this.conditionalAddRef(this.__meta_inner);
    return UIUtils.makeObserved(this.__backing_inner);
  }
  public set inner(newValue: Person) {
    if (((this.__backing_inner) !== (newValue))) {
      this.__backing_inner = newValue;
      this.__meta_inner.fireChange();
      this.executeOnSubscribingWatches("inner");
    }
  }
  public constructor() {}
  public addRefAnyProp(): void {
    this.__meta_inner.addRef();
  }
  static {
  }
}
@ObservedV2() class BoxB implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  public setV1RenderId(renderId: RenderIdType): void {}
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  @JSONRename({newName:"inner"}) public __backing_inner: Animal = new Animal();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_inner: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_inner");
  public get inner(): Animal {
    this.conditionalAddRef(this.__meta_inner);
    return UIUtils.makeObserved(this.__backing_inner);
  }
  public set inner(newValue: Animal) {
    if (((this.__backing_inner) !== (newValue))) {
      this.__backing_inner = newValue;
      this.__meta_inner.fireChange();
      this.executeOnSubscribingWatches("inner");
    }
  }
  public constructor() {}
  public addRefAnyProp(): void {
    this.__meta_inner.addRef();
  }
  static {
  }
}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_entity = STATE_MGMT_FACTORY.makeLocal<(Person | Animal)>(this, "entity", new Person());
    this.__backing_container = STATE_MGMT_FACTORY.makeLocal<(BoxA | BoxB)>(this, "container", new BoxA());
    this.__monitor_onEntityChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "entity.*",
      enableWildcard: true,
      valueCallback: ((): Any => {
        let x: Any = this.entity;
        return x;
      }),
    } as IMonitorPathInfo), ({
      path: "entity.name",
      valueCallback: ((): Any => {
        let x: Any = this.entity;
        if (((x) instanceof (Person))) {
          x = x.name;
        } else {
          return undefined;
        }
        return x;
      }),
    } as IMonitorPathInfo), ({
      path: "container.inner.*",
      enableWildcard: true,
      valueCallback: ((): Any => {
        let x: Any = this.container;
        if (((x) instanceof (BoxB))) {
          x = x.inner;
        } else {
          if (((x) instanceof (BoxA))) {
            x = x.inner;
          } else {
            return undefined;
          }
        }
        return x;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onEntityChange(_m);
    }), ({
      owner: this,
      functionName: "onEntityChange",
    } as MakeMonitorOptions));
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_entity!.resetOnReuse(new Person());
    this.__backing_container!.resetOnReuse(new BoxA());
    this.__monitor_onEntityChange!.resetOnReuse();
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content, {
      sClass: Class.from<Index>(),
    });
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

  private __backing_entity?: ILocalDecoratedVariable<(Person | Animal)>;

  public get entity(): (Person | Animal) {
    return this.__backing_entity!.get();
  }

  public set entity(value: (Person | Animal)) {
    this.__backing_entity!.set(value);
  }

  private __backing_container?: ILocalDecoratedVariable<(BoxA | BoxB)>;

  public get container(): (BoxA | BoxB) {
    return this.__backing_container!.get();
  }

  public set container(value: (BoxA | BoxB)) {
    this.__backing_container!.set(value);
  }

  private __monitor_onEntityChange: (IMonitorDecoratedVariable | undefined);

  @Monitor({value:["entity.*", "entity.name", "container.inner.*"]}) 
  public onEntityChange(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} changed\`);
    }));
  }

  @Memo() 
  public build() {
    Column(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }

  public constructor() {}
  static {
  }
}

@ComponentV2() class __Options_Index {
  @Local() public entity?: (Person | Animal);
  public __backing_entity?: ILocalDecoratedVariable<(Person | Animal)>;
  public __options_has_entity?: boolean;
  @Local() public container?: (BoxA | BoxB);
  public __backing_container?: ILocalDecoratedVariable<(BoxA | BoxB)>;
  public __options_has_container?: boolean;
  public constructor() {}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator with union types and wildcard',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
