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

import { Entry, Component, Column, Row, Text, Tabs, TabContent, List, ListItem, Repeat, RepeatItem, ForEach,
 ComponentV2, ReusableV2 } from '@ohos.arkui.component';
import { Local, State } from "@ohos.arkui.stateManagement";

// Expected: A custom component decorated with '@ReusableV2' must not be used as a child inside the 'template' content 
// of a 'Repeat' component, and components decorated with '@Component' cannot contain any child components decorated
// with '@ReusableV2'.
// Actual: The 'V2R' struct is decorated with '@ReusableV2' and is used multiple times inside 
// 'Repeat(...).template(...)' blocks and also as a child of the '@Component' struct 'V1', so both the Repeat-template 
// and parent component nesting constraints are violated.

@Entry
@ComponentV2
struct SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0290 {
  @Local arr: string[] = ['1', '2', '3'];

  build() {
    Column() {
      Text("@Reusable和@componentV2连用")

      V1()

      List() {
        Repeat<string>(this.arr)
          .each((obj: RepeatItem<string>) => {
          })
          .virtualScroll()
          .template('temp', (obj: RepeatItem<string>) => {
            ListItem() {
              Column() {
                Row() {
                  V2R()
                }
              }
            }
          })
      }

      Tabs() {
        Repeat<string>(this.arr)
          .each((obj: RepeatItem<string>) => {
          })
          .virtualScroll()
          .template('temp', (obj: RepeatItem<string>) => {
            Repeat<string>(this.arr)
              .each((obj: RepeatItem<string>) => {
              })
              .virtualScroll()
               .template('temp', (obj: RepeatItem<string>) => {
                 TabContent() {
                   Row() {
                     List() {
                       ListItem() {
                         V2R()
                       }
                     }

                     ForEach(this.arr, () => {
                       V2R()
                       List() {
                         ListItem() {
                           V2R()
                         }
                       }
                     })
                     if (this.arr.length === 1) {
                       V2R()
                     } else if (this.arr.length === 2) {
                       V2R()
                     } else {
                       if (this.arr.length) {
                         V2R()
                       }
                       V2R()
                     }
                   }
                 }
               })
           })
       }
     }
   }
 }

 @Component
 struct V1 {
   @State arr:string[] = []
   build() {
     Column() {
       Row() {
         Repeat(this.arr)
           .each((repeatItem)=>{})
           .templateId((repeatItem: string)=> 'a')
           .template('a', (repeatItem)=>{
             V2R()
           })
       }
     }
   }
 }

 @ReusableV2
 @ComponentV2
 export struct V2R {
   build() {
   }
 }