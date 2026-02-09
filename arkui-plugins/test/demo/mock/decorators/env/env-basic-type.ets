/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { Entry, Text, Column, ComponentV2 } from "@ohos.arkui.component";
import { Env } from "@ohos.arkui.stateManagement";
import uiObserver from '@ohos.arkui.observer';
import { SystemProperties } from '@kit.ArkUI';
import window from '@ohos.window';

@Entry
@ComponentV2
struct Index {
  @Env(SystemProperties.BREAK_POINT) breakpoint: uiObserver.WindowSizeLayoutBreakpointInfo;
  @Env(SystemProperties.WINDOW_SIZE) sizeInVP: window.SizeInVP;
  @Env(SystemProperties.WINDOW_SIZE_PX) sizeInPX: window.Size;
  @Env(SystemProperties.WINDOW_AVOID_AREA) windowAvoidAreaVP: window.UIEnvWindowAvoidAreaInfoVP;
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) windowAvoidAreaPX: window.UIEnvWindowAvoidAreaInfoPX;

  build() {
    Column() {
      Text(`Index breakpoint width: ${this.breakpoint.widthBreakpoint}`)
      Text(`Index breakpoint height: ${this.breakpoint.heightBreakpoint}`)
      Text(`Index SizeInVP width: ${this.sizeInVP.width}`)
      Text(`Index SizeInVP height: ${this.sizeInVP.height}`)
      Text(`Index SizeInPX width: ${this.sizeInPX.width}`)
      Text(`Index SizeInPX height: ${this.sizeInPX.height}`)
      Text(`Index windowAvoidAreaVP statusBar visible: ${this.windowAvoidAreaVP.statusBar.visible}`)
      Text(`Index windowAvoidAreaVP statusBar leftRect left: ${this.windowAvoidAreaVP.statusBar.leftRect.left}`)
      Text(`Index windowAvoidAreaVP statusBar leftRect width: ${this.windowAvoidAreaVP.statusBar.leftRect.width}`)
      Text(`Index windowAvoidAreaVP statusBar topRect left: ${this.windowAvoidAreaVP.statusBar.topRect.left}`)
      Text(`Index windowAvoidAreaVP statusBar topRect width: ${this.windowAvoidAreaVP.statusBar.topRect.width}`)
      Text(`Index windowAvoidAreaVP statusBar rightRect left: ${this.windowAvoidAreaVP.statusBar.rightRect.left}`)
      Text(`Index windowAvoidAreaVP statusBar rightRect width: ${this.windowAvoidAreaVP.statusBar.rightRect.width}`)
      Text(`Index windowAvoidAreaVP statusBar bottomRect left: ${this.windowAvoidAreaVP.statusBar.bottomRect.left}`)
      Text(`Index windowAvoidAreaVP statusBar bottomRect width: ${this.windowAvoidAreaVP.statusBar.bottomRect.width}`)
      Text(`Index windowAvoidAreaPX statusBar visible: ${this.windowAvoidAreaPX.statusBar.visible}`)
      Text(`Index windowAvoidAreaPX statusBar leftRect left: ${this.windowAvoidAreaPX.statusBar.leftRect.left}`)
      Text(`Index windowAvoidAreaPX statusBar leftRect width: ${this.windowAvoidAreaPX.statusBar.leftRect.width}`)
      Text(`Index windowAvoidAreaPX statusBar topRect left: ${this.windowAvoidAreaPX.statusBar.topRect.left}`)
      Text(`Index windowAvoidAreaPX statusBar topRect width: ${this.windowAvoidAreaPX.statusBar.topRect.width}`)
      Text(`Index windowAvoidAreaPX statusBar rightRect left: ${this.windowAvoidAreaPX.statusBar.rightRect.left}`)
      Text(`Index windowAvoidAreaPX statusBar rightRect width: ${this.windowAvoidAreaPX.statusBar.rightRect.width}`)
      Text(`Index windowAvoidAreaPX statusBar bottomRect left: ${this.windowAvoidAreaPX.statusBar.bottomRect.left}`)
      Text(`Index windowAvoidAreaPX statusBar bottomRect width: ${this.windowAvoidAreaPX.statusBar.bottomRect.width}`)
    }
  }
}
