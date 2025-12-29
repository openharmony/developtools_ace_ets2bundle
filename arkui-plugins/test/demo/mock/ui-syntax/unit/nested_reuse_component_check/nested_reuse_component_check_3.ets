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

import { Entry, ComponentV2, Column, Row, List, ListItem, Repeat, RepeatItem, Tabs, TabContent, ForEach, ReusableV2 } 
from '@ohos.arkui.component';
import { Local } from "@ohos.arkui.stateManagement";

// Expected: The 'template' content of a 'Repeat' component must not contain any custom components decorated with 
// '@ReusableV2'; reusable-v2 components cannot appear inside 'Repeat(...).template(...)' blocks.
// Actual: The '@ReusableV2' component 'V2R' is used multiple times inside the 'Repeat(...).template(...)' templates 
// (for both 'List' and 'Tabs' content), so the Repeat-template constraint for '@ReusableV2' components is violated.

@ReusableV2
@ComponentV2
export struct EV2R {
  build() {
    Column() {
    }
  }
}
@ReusableV2
@ComponentV2
export struct V2R {
  build() {
  }
}

@Entry
@ComponentV2
struct ValidateReusableV2InRepeat {
  @Local arr:string[] = ['1','2','3'];
  build() {
    Column() {
      List() {
        Repeat<string>(this.arr)
          .each((obj: RepeatItem<string>) => {})
          .virtualScroll()
          .template('temp', (obj: RepeatItem<string>) => { ListItem() {
            Column() { Row() { V2R() } } } })
      }
      Tabs() {
        Repeat<string>(this.arr)
          .each((obj: RepeatItem<string>) => {})
          .virtualScroll()
          .template('temp', (obj: RepeatItem<string>) => {
            Repeat<string>(this.arr)
              .each((obj: RepeatItem<string>) => {})
              .virtualScroll()
              .template('temp', (obj: RepeatItem<string>) => { TabContent() {
                Row() {
                  List() { ListItem() { V2R() } }
                  ForEach(this.arr,()=>{
                    V2R()
                    List() { ListItem() { V2R() } } })
                  if (this.arr.length === 1) {
                    V2R()
                  } else if (this.arr.length ===2) {
                    V2R()
                  } else {
                    if (this.arr.length) {
                      V2R()
                    }
                    V2R()
                  }
                }
              }
            }
          )}
        )
      }
    }
  }
}