/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Text, BuilderParam, Builder, Component, NavPathStack, Navigation, NavPathInfo, NavDestination, NavigationMode } from '@ohos.arkui.component';
import { State, Observed, ObjectLink, Link } from '@ohos.arkui.stateManagement';

@Component
export struct SubNavigation {
  @Link isPortrait: boolean;
  @State displayMode: number = 0;
  @BuilderParam navDestination: ((name: String, param: Object|undefined) => void) | undefined;
  @State primaryWidth: number | string = '50%';
  onNavigationModeChange?: OnNavigationModeChangeCallback = (mode: NavigationMode) => {};
  @State primaryStack: MyNavPathStack = new MyNavPathStack();
  @State secondaryStack: MyNavPathStack = new MyNavPathStack();

  @Builder
  SubNavDestination(name: string, param?: object) {
    this.navDestination!(name, param as Object);
  }

  build() {
    NavDestination() {
      Navigation(this.secondaryStack) {
        Navigation(this.primaryStack) {
        }
        .hideNavBar(true)
        .mode(NavigationMode.Stack)
        .navDestination(this.SubNavDestination)
        .hideTitleBar(true, true)
        .hideToolBar(true, true)
        .hideBackButton(true)
      }
      .hideBackButton(true)
      .hideTitleBar(true, true)
      .navDestination(this.SubNavDestination)
      .navBarWidth(this.primaryWidth)
    }
  }
}

export enum SplitPolicy {
  HOME_PAGE = 0,
  DETAIL_PAGE = 1,
  FULL_PAGE = 2,
  PlACE_HOLDER_PAGE = 3,
}

class MultiNavPolicyInfo {
  public policy: SplitPolicy = SplitPolicy.DETAIL_PAGE;
  public navInfo: NavPathInfo | undefined = undefined;
  public isFullScreen: boolean | undefined = undefined;

  constructor(policy: SplitPolicy, navInfo: NavPathInfo) {
    this.policy = policy;
    this.navInfo = navInfo;
  }
}

export class MyNavPathStack extends NavPathStack {
  public operates:NavPathStackOperate[] = [];
  public type:string = 'NavPathStack';
  public policyInfoList: MultiNavPolicyInfo[] = [];

  public registerStackOperateCallback(operate: NavPathStackOperate) {
    let index = this.operates.findIndex((item) => { return item === operate});
    if (index === -1) {
      this.operates.push(operate);
    }
  }

  public unregisterStackOperateCallback(operate: NavPathStackOperate) {
    let index = this.operates.findIndex((item) => { return item === operate});
    if (index !== -1) {
      this.operates.splice(index, 1);
    }
  }

  public popInner(animated?: boolean): NavPathInfo | undefined {
    console.log('MyNavPathStack pop from inner:');
    return super.pop({}, animated);
  }

  public pop(animated?: boolean): NavPathInfo | undefined {
    console.log('MyNavPathStack pop from system:');
    animated = typeof animated === 'undefined' ? true : animated
    let ret: NavPathInfo | undefined = undefined;
    ret = super.pop({}, animated);
    this.policyInfoList.pop();
    this.operates.forEach((item) => {
      item.onSystemPop();
    })
    return ret;
  }
}

interface NavPathStackOperate {
  onSystemPop: ()=>void;
}

interface MultiNavPathStackOperate {
  onPrimaryPop: ()=>void;
  onSecondaryPop: ()=>void;
}

declare type OnNavigationModeChangeCallback = (mode: NavigationMode) => void;

declare type OnHomeShowOnTopCallback = (name: string) => void;