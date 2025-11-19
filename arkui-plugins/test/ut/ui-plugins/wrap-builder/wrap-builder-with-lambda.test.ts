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
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../utils/simplify-dump';
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

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Observed as Observed, Builder as Builder, Entry as Entry, Component as Component, State as State } from "@kit.ArkUI";

import { WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@kit.ArkUI";

import { Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent } from "@kit.ArkUI";

const wBuilder: WrappedBuilder<MyBuilderFuncType> = wrapBuilder(overBuilder);

function main() {}


@Builder() 
@Memo() 
function overBuilder(@MemoSkip() param: (()=> Tmp)) {
  ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
    instance.setColumnOptions(undefined).applyAttributesFinish();
    return;
  }), @Memo() (() => {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
      instance.setTextOptions(\`wrapBuildervalue:\${param().paramA2}\`, undefined).applyAttributesFinish();
      return;
    }), undefined);
  }));
}

@Observed() class Tmp implements IObservedObject, ISubscribedWatches {
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
  
  @JSONStringifyIgnore() @JSONParseIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"paramA2"}) private __backing_paramA2: string = "hello";
  
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
  
  public constructor() {}

  static {
  
  }
}

@Memo() type MyBuilderFuncType = @Builder() ((param: (()=> Tmp))=> void);

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
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
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      wBuilder.builder((() => {
        return {
          paramA2: this.label.paramA2,
        };
      }));
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("Click me", undefined).onClick(((e: ClickEvent) => {
          this.label.paramA2 = "ArkUI";
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}

  static {
  
  }
}

@Component() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'label', '(Tmp | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_label', '(IStateDecoratedVariable<Tmp> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_label', '(boolean | undefined)')}
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Observed as Observed, Builder as Builder, Entry as Entry, Component as Component, State as State } from "@kit.ArkUI";

import { WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from "@kit.ArkUI";

import { Column as Column, Text as Text, Button as Button, ClickEvent as ClickEvent } from "@kit.ArkUI";

const wBuilder: WrappedBuilder<MyBuilderFuncType> = wrapBuilder(overBuilder);

function main() {}


@Builder() 
@Memo() 
function overBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() param: (()=> Tmp)) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (133793681)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  ColumnImpl(__memo_context, ((__memo_id) + (241913892)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
    const __memo_parameter_instance = __memo_scope.param(0, instance);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    __memo_parameter_instance.value.setColumnOptions(undefined).applyAttributesFinish();
    {
      __memo_scope.recache();
      return;
    }
  }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (175145513)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    TextImpl(__memo_context, ((__memo_id) + (47330804)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setTextOptions(\`wrapBuildervalue:\${param().paramA2}\`, undefined).applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), undefined);
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
  
  @JSONStringifyIgnore() @JSONParseIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"paramA2"}) private __backing_paramA2: string = "hello";
  
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
  
  public constructor() {}

  static {
  
  }
}

@Memo() type MyBuilderFuncType = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, param: (()=> Tmp))=> void);

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
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
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (69406103)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (218979098)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setColumnOptions(undefined).applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (76711614)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      wBuilder.builder(__memo_context, ((__memo_id) + (211301233)), (() => {
        return {
          paramA2: this.label.paramA2,
        };
      }));
      ButtonImpl(__memo_context, ((__memo_id) + (46726221)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ButtonAttribute): void => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (213104625)), 1);
        const __memo_parameter_instance = __memo_scope.param(0, instance);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        __memo_parameter_instance.value.setButtonOptions("Click me", undefined).onClick(((e: ClickEvent) => {
          this.label.paramA2 = "ArkUI";
        })).applyAttributesFinish();
        {
          __memo_scope.recache();
          return;
        }
      }), undefined);
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
  
  public constructor() {}

  static {
  
  }
}

@Component() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'label', '(Tmp | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_label', '(IStateDecoratedVariable<Tmp> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_label', '(boolean | undefined)')}

}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test wrap builder with lambda',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
