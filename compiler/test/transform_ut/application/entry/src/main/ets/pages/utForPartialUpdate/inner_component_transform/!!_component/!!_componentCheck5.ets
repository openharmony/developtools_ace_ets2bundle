/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

/*
 * This is a test case about the use of "!!" two-way sync binding in the attribute 'bindSheet'.
 */

@Entry
@Component
struct SheetTransitionExample {
  @State isShow: boolean = false
  @State sheetHeight: number = 300;

  @Builder
  myBuilder() {
    Column() {
      Button("change height")
        .onClick(() => {
          this.sheetHeight = 500;
        })

      Button("Set Illegal height")
        .onClick(() => {
          this.sheetHeight = -1;
        })

      Button("close modal 1")
        .onClick(() => {
          this.isShow = false;
        })
    }
    .width('100%')
    .height('100%')
  }

  build() {
    Column() {
      Button("transition modal 1")
        .onClick(() => {
          this.isShow = true
        })
        .fontSize(20)
        .margin(10)
        .bindSheet(this.isShow!!, this.myBuilder(), {
          height: this.sheetHeight,
          backgroundColor: Color.Green,
          onWillAppear: () => {
            console.log("BindSheet onWillAppear.")
          },
          onAppear: () => {
            console.log("BindSheet onAppear.")
          },
          onWillDisappear: () => {
            console.log("BindSheet onWillDisappear.")
          },
          onDisappear: () => {
            console.log("BindSheet onDisappear.")
          }
        })
    }
  }
}