/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
 * Test case: CustomDialog decorator error
 * Purpose: Verify @CustomDialog decorator usage and validation
 * Error code: 10906000
 */

// ============================================
// Test Case 1: @CustomDialog without @Component
// Expected Error: 10906000
// ============================================

@CustomDialog
class CustomDialogWithoutComponent {
  title: string = ''
}

// ============================================
// Test Case 2: @CustomDialog with @ComponentV2
// Expected Error: 10906000
// ============================================

@CustomDialog
@ComponentV2
struct CustomDialogV2Error {
  @Local message: string = ''

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// ============================================
// Test Case 3: @CustomDialog without controller
// Expected Error: 10906000
// ============================================

@CustomDialog
@Component
struct CustomDialogNoController {
  @State content: string = ''

  build() {
    Column() {
      Text(this.content)
    }
  }
}

// ============================================
// Test Case 4: Correct @CustomDialog usage
// ============================================

@CustomDialog
@Component
struct AlertDialog {
  @State title: string = 'Alert'
  @State message: string = ''
  controller: CustomDialogController

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text(this.message)
        .fontSize(16)
        .margin(15)

      Row() {
        Button('OK')
          .onClick(() => {
            this.controller.close()
          })
          .width(100)
          .margin(10)
      }
    }
    .width('80%')
    .padding(20)
    .backgroundColor('#FFFFFF')
    .borderRadius(10)
  }
}

@CustomDialog
@Component
struct ConfirmDialog {
  @State title: string = 'Confirm'
  @State message: string = ''
  @State confirmText: string = 'Yes'
  @State cancelText: string = 'No'
  controller: CustomDialogController
  onConfirm: () => void = () => {}
  onCancel: () => void = () => {}

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text(this.message)
        .fontSize(16)
        .margin(15)

      Row() {
        Button(this.cancelText)
          .onClick(() => {
            this.onCancel()
            this.controller.close()
          })
          .width(100)
          .margin(10)

        Button(this.confirmText)
          .onClick(() => {
            this.onConfirm()
            this.controller.close()
          })
          .width(100)
          .margin(10)
          .backgroundColor('#1890FF')
      }
    }
    .width('80%')
    .padding(20)
    .backgroundColor('#FFFFFF')
    .borderRadius(10)
  }
}

@Component
struct CorrectCustomDialogUsage {
  private alertController: CustomDialogController = new CustomDialogController({
    builder: AlertDialog()
  })

  private confirmController: CustomDialogController = new CustomDialogController({
    builder: ConfirmDialog()
  })

  build() {
    Column() {
      Text('Custom Dialog Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Button('Show Alert')
        .onClick(() => {
          this.alertController.open()
        })
        .width(200)
        .height(50)
        .margin(15)

      Button('Show Confirm')
        .onClick(() => {
          this.confirmController.open()
        })
        .width(200)
        .height(50)
        .margin(15)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: Complex custom dialog
// ============================================

@CustomDialog
@Component
struct FormDialog {
  @State title: string = 'Input Form'
  @State username: string = ''
  @State password: string = ''
  @State errorMessage: string = ''
  controller: CustomDialogController
  onSubmit: (data: { username: string; password: string }) => void = () => {}

  validate(): boolean {
    if (this.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters'
      return false
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters'
      return false
    }
    return true
  }

  build() {
    Column() {
      Text(this.title)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Username:')
          .fontSize(14)
          .margin(5)
          .alignSelf(ItemAlign.Start)

        TextInput({ text: this.username })
          .onChange((value: string) => {
            this.username = value
          })
          .width('100%')
          .height(40)

        Text('Password:')
          .fontSize(14)
          .margin(5)
          .alignSelf(ItemAlign.Start)

        TextInput({ text: this.password })
          .type(InputType.Password)
          .onChange((value: string) => {
            this.password = value
          })
          .width('100%')
          .height(40)
      }
      .width('100%')
      .padding(10)

      if (this.errorMessage !== '') {
        Text(this.errorMessage)
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(5)
      }

      Row() {
        Button('Cancel')
          .onClick(() => {
            this.controller.close()
          })
          .width(100)
          .margin(10)

        Button('Submit')
          .onClick(() => {
            if (this.validate()) {
              this.onSubmit({ username: this.username, password: this.password })
              this.controller.close()
            }
          })
          .width(100)
          .margin(10)
          .backgroundColor('#52C41A')
      }
      .margin(10)
    }
    .width('85%')
    .padding(25)
    .backgroundColor('#FFFFFF')
    .borderRadius(12)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestCustomDialogDecorator {
  @State testTitle: string = '@CustomDialog Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906000')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@CustomDialog without @Component')
          .fontSize(14)
          .margin(5)

        Text('@CustomDialog with @ComponentV2')
          .fontSize(14)
          .margin(5)

        Text('@CustomDialog without controller')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@CustomDialog Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must be used with @Component')
          .fontSize(14)
          .margin(2)

        Text('2. Only works with V1 components')
          .fontSize(14)
          .margin(2)

        Text('3. Must have controller property')
          .fontSize(14)
          .margin(2)

        Text('4. Used for modal dialogs')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@CustomDialog')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyDialog {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  controller: CustomDialogController')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('}')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
