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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, memoNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'wrap-builder-with-lambda.ets'),
];

const pluginTester = new PluginTester('test wrap builder with lambda', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Observed as Observed, Builder as Builder, Entry as Entry, Component as Component, State as State } from "@kit.ArkUI";

import { WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@kit.ArkUI";

import { Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent } from "@kit.ArkUI";

const wBuilder: WrappedBuilder<MyBuilderFuncType> = wrapBuilder(overBuilder);

function main() {}


@memo() function overBuilder(param: (()=> Tmp)) {
  Column(undefined, undefined, @memo() (() => {
    Text(undefined, \`wrapBuildervalue:\${param().paramA2}\`, undefined, undefined);
  }));
}


@Observed() class Tmp implements IObservedObject, ISubscribedWatches {
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
  
  @JSONStringifyIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  @JSONStringifyIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"paramA2"}) private __backing_paramA2: string = "hello";
  
  public constructor() {}
  
  public get paramA2(): string {
    this.conditionalAddRef(this.__meta);
    return this.__backing_paramA2;
  }
  
  public set paramA2(newValue: string) {
    if (((this.__backing_paramA2) !== (newValue))) {
      this.__backing_paramA2 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("paramA2");
    }
  }
  
}

@memo() type MyBuilderFuncType = @Builder() ((param: (()=> Tmp))=> void);

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_label = STATE_MGMT_FACTORY.makeState<Tmp>(this, "label", ((({let gensym___171896504 = initializers;
    (((gensym___171896504) == (null)) ? undefined : gensym___171896504.label)})) ?? (new Tmp())));
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_label?: IStateDecoratedVariable<Tmp>;
  
  public get label(): Tmp {
    return this.__backing_label!.get();
  }
  
  public set label(value: Tmp) {
    this.__backing_label!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      wBuilder.builder((() => {
        return {
          paramA2: this.label.paramA2,
        };
      }));
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.label.paramA2 = "ArkUI";
        }));
        return;
      }), "Click me", undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_Parent {
  set label(label: (Tmp | undefined))
  
  get label(): (Tmp | undefined)
  set __backing_label(__backing_label: (IStateDecoratedVariable<Tmp> | undefined))
  
  get __backing_label(): (IStateDecoratedVariable<Tmp> | undefined)
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Observed as Observed, Builder as Builder, Entry as Entry, Component as Component, State as State } from "@kit.ArkUI";

import { WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@kit.ArkUI";

import { Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent } from "@kit.ArkUI";

const wBuilder: WrappedBuilder<MyBuilderFuncType> = wrapBuilder(overBuilder);

function main() {}


@memo() function overBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, param: (()=> Tmp)) {
  const __memo_scope = __memo_context.scope<void>(((__memo_id) + (133793681)), 1);
  const __memo_parameter_param = __memo_scope.param(0, param);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  Column(__memo_context, ((__memo_id) + (241913892)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (175145513)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Text(__memo_context, ((__memo_id) + (47330804)), undefined, \`wrapBuildervalue:\${__memo_parameter_param.value().paramA2}\`, undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }));
  {
    __memo_scope.recache();
    return;
  }
}


@Observed() class Tmp implements IObservedObject, ISubscribedWatches {
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
  
  @JSONStringifyIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  @JSONStringifyIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"paramA2"}) private __backing_paramA2: string = "hello";
  
  public constructor() {}
  
  public get paramA2(): string {
    this.conditionalAddRef(this.__meta);
    return this.__backing_paramA2;
  }
  
  public set paramA2(newValue: string) {
    if (((this.__backing_paramA2) !== (newValue))) {
      this.__backing_paramA2 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("paramA2");
    }
  }
  
}

@memo() type MyBuilderFuncType = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, param: (()=> Tmp))=> void);

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_label = STATE_MGMT_FACTORY.makeState<Tmp>(this, "label", ((({let gensym___171896504 = initializers;
    (((gensym___171896504) == (null)) ? undefined : gensym___171896504.label)})) ?? (new Tmp())));
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_label?: IStateDecoratedVariable<Tmp>;
  
  public get label(): Tmp {
    return this.__backing_label!.get();
  }
  
  public set label(value: Tmp) {
    this.__backing_label!.set(value);
  }
  
  @memo() public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (69406103)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    Column(__memo_context, ((__memo_id) + (218979098)), undefined, undefined, @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (76711614)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      wBuilder.builder(__memo_context, ((__memo_id) + (211301233)), (() => {
        return {
          paramA2: this.label.paramA2,
        };
      }));
      Button(__memo_context, ((__memo_id) + (46726221)), @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ButtonAttribute): void => {
        const __memo_scope = __memo_context.scope<void>(((__memo_id) + (213104625)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.onClick(((e: ClickEvent) => {
          this.label.paramA2 = "ArkUI";
        }));
        {
          __memo_scope.recache();
          return;
        }
      }), "Click me", undefined, undefined);
      {
        __memo_scope.recache();
        return;
      }
    }));
    {
      __memo_scope.recache();
      return;
    }
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_Parent {
  set label(label: (Tmp | undefined))
  
  get label(): (Tmp | undefined)
  set __backing_label(__backing_label: (IStateDecoratedVariable<Tmp> | undefined))
  
  get __backing_label(): (IStateDecoratedVariable<Tmp> | undefined)
  
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder with lambda',
    [parsedTransform, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
