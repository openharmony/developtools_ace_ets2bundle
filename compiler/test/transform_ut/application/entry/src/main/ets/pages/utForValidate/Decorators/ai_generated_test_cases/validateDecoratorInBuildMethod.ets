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

/**
 * 测试场景：在 build 方法内部定义使用装饰器的局部变量
 * 预期错误：装饰器只能用于 struct 的成员变量，不能用于局部变量
 */

@Entry
@Component
struct ValidateDecoratorInBuildMethodIndex {
  @State count: number = 0
  @State message: string = 'Hello'
  @State toggleValue: boolean = false

  build() {
    Column() {
      Text('Testing Decorator Placement')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })

      // 错误示例1：在 build 方法内部使用 @State 装饰器定义局部变量
      @State localCount: number = 10
      Text(`Local Count: ${this.localCount}`)
        .fontSize(16)
        .margin({ bottom: 10 })

      // 错误示例2：在 build 方法内部嵌套的 Column 中再次使用装饰器
      Column() {
        @State nestedMessage: string = 'Nested State'
        Text(this.nestedMessage)
          .fontSize(14)
          .fontColor(Color.Blue)
      }
      .margin({ bottom: 10 })

      // 其他正常的 UI 代码
      Row() {
        Button('Increment')
          .onClick(() => {
            this.count++
          })
          .margin({ right: 10 })

        Button('Decrement')
          .onClick(() => {
            if (this.count > 0) {
              this.count--
            }
          })
      }

      Text(`Main Count: ${this.count}`)
        .fontSize(18)
        .margin({ top: 20 })

      Divider()
        .margin({ top: 20, bottom: 20 })

      Text(this.message)
        .fontSize(16)
        .onClick(() => {
          this.message = 'Clicked!'
        })

      Toggle({ type: ToggleType.Switch, isOn: this.toggleValue })
        .onChange((value: boolean) => {
          this.toggleValue = value
        })
        .margin({ top: 20 })
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}
