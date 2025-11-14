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

import { Entry, Component, Row, RowSplit, Column, TextAlign, Button, Text, Stack, Scroll, Scroller, Blank,
 ListItem, Alignment, Color, ScrollDirection, EdgeEffect, Edge, BarState, Grid, GridLayoutOptions, GridItem,
 Reusable, ReusableV2, ComponentV2, TabContent, Repeat, RepeatItem, ForEach, Tabs, Builder, BuilderParam,
 ClickEvent, Flex } from '@ohos.arkui.component'

import { Prop, State, Local, Event, Provide, Provider, Consumer, Param, LocalStorageProp, LocalStorageLink,
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef, ObjectLink, Observed, ObservedV2,
 Trace } from "@ohos.arkui.stateManagement";

// demo-1
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

 // demo-2
  @Entry
  @Component
  struct V11 {
    build() {
      Column() {
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0160
        EV1R()
        EV1()
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0130
        EV2R()
        V11()
        V22()
        V11R()
        V22R()
      }
    }
  }

  @ComponentV2
  struct V22 {
    build() {
      Column() {
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0140
        EV2R()
        EV1()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0450
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0310
        EV2R()
        V11()
        V22()
        V11R()
        V22R()
      }
    }
  }

  @ReusableV2
  @ComponentV2
  struct V22R {
    build() {
      Column() {
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0170
        EV1R()
        EV1()
        EV2()
        EV2R()
        V11()
        V22()
        V11R()
        V22R()
      }
    }
  }


  @Reusable
  @Component
  struct V11R {
    build() {
      Column() {
        EV1R()
        EV1()
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0270
        EV2R()
        V11()
        V22()
        V11R()
        V22R()
      }
    }
  }

  @Component
  export struct EV1 {
    build() {
      Column() {
      }
    }
  }

  @Reusable
  @Component
  export struct EV1R {
    build() {
      Column() {
      }
    }
  }

  @ComponentV2
  export struct EV2 {
    build() {
      Column() {
      }
    }
  }

  @ReusableV2
  @ComponentV2
  export struct EV2R {
    build() {
      Column() {
      }
    }
  }