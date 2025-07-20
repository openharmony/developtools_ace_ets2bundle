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
import { Monitor, IMonitor, ObservedV2, Trace, Local } from "@ohos.arkui.stateManagement"

class AAA {
    aaa: BBB = new BBB()
}

class BBB {
    bbb: CCC = new CCC()
}

class CCC {
    ccc: Array<DDD> = new Array<DDD>(new DDD(10), new DDD(12), new DDD(16))
}

class DDD {
    dd: number[]
    constructor(dd: number) {
        this.dd = [];
        for(let i = 4; i < dd; i++) {
            this.dd.push(i);
        }
    }
}

class EEE {
    ee: FFF = new FFF()
}

class FFF {
    ff: GGG = new GGG()
}

class GGG {}

@ObservedV2
class Info {
  @Trace name: string = "Tom";
  @Trace strArr: string[] = ["North", "east"];
  @Trace job: AAA = new AAA();
  age: number = 25;

  @Monitor(["name"])
  onNameChange(monitor: IMonitor) {}

  @Monitor(["strArr.0", "age"])
  onAgeChange(monitor: IMonitor) {}

  @Monitor(["job.aaa.bbb.ccc.1.dd.0"])
  onJobChange(monitor: IMonitor) {}
}

@ComponentV2
struct Index {
  @Local per: EEE = new EEE()
  @Local v1: boolean = true
  @Local numArr: string[] = ['1','3','5']

  @Monitor(["per.ee.ff", "v1", "numArr.1"])
  onPerChange(monitor: IMonitor) {}

  build() {}
}