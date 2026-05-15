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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';
import { dumpConstructor, dumpGetterSetter, GetSetDumper, dumpAnnotation } from '../../../utils/simplify-dump';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'mix-navigation-nav-destination.ets'),
];

const pluginTester = new PluginTester('test mix usage of navigation and navDestination transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { NavDestinationAttribute as NavDestinationAttribute } from "arkui.component.navDestination";

import { NavigationAttribute as NavigationAttribute } from "arkui.component.navigation";

import { NavigationImpl as NavigationImpl } from "arkui.component.navigation";

import { NavDestinationImpl as NavDestinationImpl } from "arkui.component.navDestination";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, BuilderParam as BuilderParam, Builder as Builder, Component as Component, NavPathStack as NavPathStack, Navigation as Navigation, NavPathInfo as NavPathInfo, NavDestination as NavDestination, NavigationMode as NavigationMode } from "@ohos.arkui.component";

import { State as State, Observed as Observed, ObjectLink as ObjectLink, Link as Link } from "@ohos.arkui.stateManagement";

function main() {}


@Component() export final struct SubNavigation extends CustomComponent<SubNavigation, __Options_SubNavigation> {
  public __initializeStruct(initializers: (__Options_SubNavigation | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___214357609 = initializers;
    (((gensym___214357609) == (null)) ? undefined : gensym___214357609.__options_has_isPortrait)})) {
      this.__backing_isPortrait = STATE_MGMT_FACTORY.makeLink<boolean>(this, "isPortrait", initializers!.__backing_isPortrait!);
    }
    this.__backing_displayMode = STATE_MGMT_FACTORY.makeState<number>(this, "displayMode", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_displayMode)}) ? (initializers!.displayMode as number) : (0 as number)));
    this.__backing_navDestination = ((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.navDestination)})) ?? (content))) ?? (((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.navDestination)})) ?? (undefined))));
    this.__backing_primaryWidth = STATE_MGMT_FACTORY.makeState<(number | string)>(this, "primaryWidth", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_primaryWidth)}) ? (initializers!.primaryWidth as (number | string)) : ("50%" as (number | string))));
    this.__backing_onNavigationModeChange = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onNavigationModeChange)}) ? (initializers!.onNavigationModeChange as (OnNavigationModeChangeCallback | undefined)) : (((mode: NavigationMode) => {}) as (OnNavigationModeChangeCallback | undefined)));
    this.__backing_primaryStack = STATE_MGMT_FACTORY.makeState<MyNavPathStack>(this, "primaryStack", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_primaryStack)}) ? (initializers!.primaryStack as MyNavPathStack) : (new MyNavPathStack() as MyNavPathStack)));
    this.__backing_secondaryStack = STATE_MGMT_FACTORY.makeState<MyNavPathStack>(this, "secondaryStack", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_secondaryStack)}) ? (initializers!.secondaryStack as MyNavPathStack) : (new MyNavPathStack() as MyNavPathStack)));
  }
  
  public __updateStruct(initializers: (__Options_SubNavigation | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_SubNavigation | undefined)): void {
    this.__backing_isPortrait!.resetOnReuse(initializers!.__backing_isPortrait!);
    this.__backing_displayMode!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.displayMode)})) ?? (0)) as number));
    this.__backing_primaryWidth!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.primaryWidth)})) ?? ("50%")) as (number | string)));
    this.__backing_primaryStack!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.primaryStack)})) ?? (new MyNavPathStack())) as MyNavPathStack));
    this.__backing_secondaryStack!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.secondaryStack)})) ?? (new MyNavPathStack())) as MyNavPathStack));
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: SubNavigation)=> void) | undefined), initializers: ((()=> __Options_SubNavigation) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<SubNavigation, __Options_SubNavigation>(style, ((): SubNavigation => {
      return new SubNavigation(false, ({let gensym___92334354 = storage;
      (((gensym___92334354) == (null)) ? undefined : gensym___92334354())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_SubNavigation, storage?: LocalStorage, @Builder() content?: (()=> void)): SubNavigation {
    throw new Error("Declare interface");
  }

  private __backing_isPortrait?: ILinkDecoratedVariable<boolean>;

  public get isPortrait(): boolean {
    return this.__backing_isPortrait!.get();
  }

  public set isPortrait(value: boolean) {
    this.__backing_isPortrait!.set(value);
  }

  private __backing_displayMode?: IStateDecoratedVariable<number>;

  public get displayMode(): number {
    return this.__backing_displayMode!.get();
  }

  public set displayMode(value: number) {
    this.__backing_displayMode!.set(value);
  }

  private __backing_navDestination?: (((name: String, param: (Object | undefined))=> void) | undefined | undefined);

  public get navDestination(): (@Memo() ((name: String, param: (Object | undefined))=> void) | undefined) {
    return this.__backing_navDestination;
  }

  public set navDestination(value: (@Memo() ((name: String, param: (Object | undefined))=> void) | undefined)) {
    this.__backing_navDestination = value;
  }

  private __backing_primaryWidth?: IStateDecoratedVariable<(number | string)>;

  public get primaryWidth(): (number | string) {
    return this.__backing_primaryWidth!.get();
  }

  public set primaryWidth(value: (number | string)) {
    this.__backing_primaryWidth!.set(value);
  }

  private __backing_onNavigationModeChange?: (OnNavigationModeChangeCallback | undefined);

  public get onNavigationModeChange(): (OnNavigationModeChangeCallback | undefined) {
    return (this.__backing_onNavigationModeChange as (OnNavigationModeChangeCallback | undefined));
  }

  public set onNavigationModeChange(value: (OnNavigationModeChangeCallback | undefined)) {
    this.__backing_onNavigationModeChange = value;
  }

  private __backing_primaryStack?: IStateDecoratedVariable<MyNavPathStack>;

  public get primaryStack(): MyNavPathStack {
    return this.__backing_primaryStack!.get();
  }

  public set primaryStack(value: MyNavPathStack) {
    this.__backing_primaryStack!.set(value);
  }

  private __backing_secondaryStack?: IStateDecoratedVariable<MyNavPathStack>;

  public get secondaryStack(): MyNavPathStack {
    return this.__backing_secondaryStack!.get();
  }

  public set secondaryStack(value: MyNavPathStack) {
    this.__backing_secondaryStack!.set(value);
  }

  @Memo() 
  public SubNavDestination(@MemoSkip() name: string, @MemoSkip() param?: object): void {
    this.navDestination!(name, (param as Object));
  }
  
  @Memo() 
  public build(): void {
    NavDestinationImpl(@Memo() ((instance: NavDestinationAttribute): void => {
      instance.setNavDestinationOptions({
        moduleName: "entry",
        pagePath: "mock/component/mix-navigation-nav-destination",
      });
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      NavigationImpl(@Memo() ((instance: NavigationAttribute): void => {
        instance.setNavigationOptions(this.secondaryStack, {
          moduleName: "entry",
          pagePath: "mock/component/mix-navigation-nav-destination",
          isUserCreateStack: true,
        }).hideBackButton(true).hideTitleBar(true, true).navDestination(this.SubNavDestination).navBarWidth(this.primaryWidth);
        instance.applyAttributesFinish();
        return;
      }), @Memo() (() => {
        NavigationImpl(@Memo() ((instance: NavigationAttribute): void => {
          instance.setNavigationOptions(this.primaryStack, {
            moduleName: "entry",
            pagePath: "mock/component/mix-navigation-nav-destination",
            isUserCreateStack: true,
          }).hideNavBar(true).mode(NavigationMode.Stack).navDestination(this.SubNavDestination).hideTitleBar(true, true).hideToolBar(true, true).hideBackButton(true);
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {}));
      }));
    }));
  }
  
  ${dumpConstructor()}

  public static _buildCompatibleNode(options: __Options_SubNavigation): void {
    return;
  }

  static {
  }

}

export final class SplitPolicy extends BaseEnum<int> {
  private readonly #ordinal: int;

  private static <cctor>() {}
  
  private constructor(ordinal: int, value: int, name: String) {
    super(value, name);
    this.#ordinal = ordinal;
  }
  
  public static readonly HOME_PAGE: SplitPolicy = new SplitPolicy(0, 0, "HOME_PAGE");
  
  public static readonly DETAIL_PAGE: SplitPolicy = new SplitPolicy(1, 1, "DETAIL_PAGE");
  
  public static readonly FULL_PAGE: SplitPolicy = new SplitPolicy(2, 2, "FULL_PAGE");
  
  public static readonly PlACE_HOLDER_PAGE: SplitPolicy = new SplitPolicy(3, 3, "PlACE_HOLDER_PAGE");
  
  private static readonly #ItemsArray: SplitPolicy[] = [SplitPolicy.HOME_PAGE, SplitPolicy.DETAIL_PAGE, SplitPolicy.FULL_PAGE, SplitPolicy.PlACE_HOLDER_PAGE];
  
  public static getValueOf(name: String): SplitPolicy {
    for (let i = ((SplitPolicy.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (SplitPolicy.#ItemsArray[i].getName()))) {
        return SplitPolicy.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant SplitPolicy.") + (name)));
  }

  public static fromValue(value: int): SplitPolicy {
    for (let i = ((SplitPolicy.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((SplitPolicy.#ItemsArray[i].valueOf()) == (value))) {
        return SplitPolicy.#ItemsArray[i];
      }
    }
    throw new Error((("No enum SplitPolicy with value ") + (value)));
  }
  
  public static values(): SplitPolicy[] {
    return SplitPolicy.#ItemsArray;
  }

  public getOrdinal(): int {
    return this.#ordinal;
  }

  public static $_get(e: SplitPolicy): String {
    return e.getName();
  }

}

export class MultiNavPolicyInfo {
  public policy: SplitPolicy = SplitPolicy.DETAIL_PAGE;
  
  public navInfo: (NavPathInfo | undefined) = undefined;
  
  public isFullScreen: (boolean | undefined) = undefined;
  
  public constructor(policy: SplitPolicy, navInfo: NavPathInfo) {
    this.policy = policy;
    this.navInfo = navInfo;
  }
  
}

export class MyNavPathStack extends NavPathStack {
  public operates: Array<NavPathStackOperate> = [];
  
  public type: string = "NavPathStack";
  
  public policyInfoList: Array<MultiNavPolicyInfo> = [];
  
  public registerStackOperateCallback(operate: NavPathStackOperate): void {
    let index = this.operates.findIndex(((item) => {
      return ((item) === (operate));
    }));
    if (((index) === (-1))) {
      this.operates.push(operate);
    }
  }
  
  public unregisterStackOperateCallback(operate: NavPathStackOperate): void {
    let index = this.operates.findIndex(((item) => {
      return ((item) === (operate));
    }));
    if (((index) !== (-1))) {
      this.operates.splice(index, 1);
    }
  }
  
  public popInner(animated?: boolean): (NavPathInfo | undefined) {
    console.log("MyNavPathStack pop from inner:");
    return super.pop({}, animated);
  }
  
  public pop(animated?: boolean): (NavPathInfo | undefined) {
    console.log("MyNavPathStack pop from system:");
    animated = ((((typeof animated)) === ("undefined")) ? true : animated);
    let ret: (NavPathInfo | undefined) = undefined;
    ret = super.pop({}, animated);
    this.policyInfoList.pop();
    this.operates.forEach(((item) => {
      item.onSystemPop();
    }));
    return ret;
  }
  
  public constructor() {}
  
}

export interface NavPathStackOperate {
  get onSystemPop(): (()=> void)

  set onSystemPop(onSystemPop: (()=> void))
  
}

export interface MultiNavPathStackOperate {
  get onPrimaryPop(): (()=> void)

  set onPrimaryPop(onPrimaryPop: (()=> void))
  
  get onSecondaryPop(): (()=> void)

  set onSecondaryPop(onSecondaryPop: (()=> void))
  
}

type OnNavigationModeChangeCallback = ((mode: NavigationMode)=> void);

type OnHomeShowOnTopCallback = ((name: string)=> void);

@Component() export class __Options_SubNavigation {
  @Link() public isPortrait: boolean;
  public __backing_isPortrait?: LinkSourceType<boolean>;
  public __options_has_isPortrait?: boolean;
  @State() public displayMode?: number;
  public __backing_displayMode?: IStateDecoratedVariable<number>;
  public __options_has_displayMode?: boolean;
  public navDestination?: (((name: String, param: (Object | undefined))=> void) | undefined);
  public __options_has_navDestination?: boolean;
  @State() public primaryWidth?: (number | string);
  public __backing_primaryWidth?: IStateDecoratedVariable<(number | string)>;
  public __options_has_primaryWidth?: boolean;
  public onNavigationModeChange?: (OnNavigationModeChangeCallback | undefined);
  public __options_has_onNavigationModeChange?: boolean;
  @State() public primaryStack?: MyNavPathStack;
  public __backing_primaryStack?: IStateDecoratedVariable<MyNavPathStack>;
  public __options_has_primaryStack?: boolean;
  @State() public secondaryStack?: MyNavPathStack;
  public __backing_secondaryStack?: IStateDecoratedVariable<MyNavPathStack>;
  public __options_has_secondaryStack?: boolean;
  public constructor() {}
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test mix usage of navigation and navDestination transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);