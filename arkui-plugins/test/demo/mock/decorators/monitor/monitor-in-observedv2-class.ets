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

import { ComponentV2, Column, Button } from "@ohos.arkui.component"
import { Monitor, IMonitor, ObservedV2, Trace } from "@ohos.arkui.stateManagement"

@ObservedV2
class Info {
  @Trace name: string = "Tom";
  @Trace region: string = "North";
  @Trace job: string = "Teacher";
  age: number = 25;

  @Monitor(["name"])
  onNameChange(monitor: IMonitor) {
    console.info(`name change from ${monitor.value()?.before} to ${monitor.value()?.now}`);
  }

  @Monitor(["age"])
  onAgeChange(monitor: IMonitor) {
    console.info(`age change from ${monitor.value()?.before} to ${monitor.value()?.now}`);
  }

  @Monitor(["region", "job"])
  onChange(monitor: IMonitor) {
    monitor.dirty.forEach((path: string) => {
      console.info(`${path} change from ${monitor.value(path)?.before} to ${monitor.value(path)?.now}`);
    })
  }
}

@ComponentV2
struct Index {
  info: Info = new Info();
  build() {
    Column() {
      Button("change name")
        .onClick((e) => {
          this.info.name = "Jack";
        })
      Button("change age")
        .onClick((e) => {
          this.info.age = 26;
        })
      Button("change region")
        .onClick((e) => {
          this.info.region = "South";
        })
      Button("change job")
        .onClick((e) => {
          this.info.job = "Driver";
        })
    }
  }
}