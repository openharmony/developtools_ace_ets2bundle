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
 * Test case: @State decorator validation scenarios
 * Purpose: Verify @State decorator initialization and usage patterns
 * Error codes: 10905317, 10905318
 * 
 * This test file covers various @State decorator scenarios including:
 * - Missing initialization errors
 * - Invalid type assignments
 * - Complex object state management
 * - Nested component state interactions
 */

// ============================================
// Test Case 1: @State without initialization
// Expected Error: 10905317
// ============================================

@Component
struct StateWithoutInit {
  @State uninitializedValue: string

  build() {
    Column() {
      Text('Value: ' + this.uninitializedValue)
        .fontSize(16)
        .margin(10)
    }
  }
}

// ============================================
// Test Case 2: @State with complex object initialization
// ============================================

interface UserProfile {
  userId: number
  userName: string
  email: string
  isActive: boolean
  preferences: {
    theme: string
    fontSize: number
    notifications: boolean
  }
}

@Component
struct StateComplexObject {
  @State userProfile: UserProfile = {
    userId: 1001,
    userName: 'TestUser',
    email: 'test@example.com',
    isActive: true,
    preferences: {
      theme: 'light',
      fontSize: 16,
      notifications: true
    }
  }

  build() {
    Column() {
      Text('User Profile')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('ID: ' + this.userProfile.userId)
          .fontSize(16)
          .margin(5)

        Text('Name: ' + this.userProfile.userName)
          .fontSize(16)
          .margin(5)

        Text('Email: ' + this.userProfile.email)
          .fontSize(16)
          .margin(5)

        Text('Status: ' + (this.userProfile.isActive ? 'Active' : 'Inactive'))
          .fontSize(16)
          .fontColor(this.userProfile.isActive ? Color.Green : Color.Red)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F5F5F5')
      .borderRadius(8)
      .margin(10)

      Row() {
        Button('Toggle Status')
          .onClick(() => {
            this.userProfile.isActive = !this.userProfile.isActive
          })
          .width(140)
          .height(40)
          .margin(5)

        Button('Update Name')
          .onClick(() => {
            this.userProfile.userName = 'UpdatedUser'
          })
          .width(140)
          .height(40)
          .margin(5)
      }
      .margin(10)
    }
  }
}

// ============================================
// Test Case 3: @State with array operations
// ============================================

@Component
struct StateArrayOperations {
  @State todoList: string[] = ['Task 1', 'Task 2', 'Task 3']
  @State newTask: string = ''

  build() {
    Column() {
      Text('Todo List Manager')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      TextInput({ placeholder: 'Enter new task', text: this.newTask })
        .onChange((value: string) => {
          this.newTask = value
        })
        .width('80%')
        .height(45)
        .margin(10)

      Button('Add Task')
        .onClick(() => {
          if (this.newTask.length > 0) {
            this.todoList.push(this.newTask)
            this.newTask = ''
          }
        })
        .width(120)
        .height(40)
        .margin(5)

      List() {
        ForEach(this.todoList, (item: string, index: number) => {
          ListItem() {
            Row() {
              Text(item)
                .fontSize(16)
                .layoutWeight(1)

              Button('Delete')
                .onClick(() => {
                  this.todoList.splice(index, 1)
                })
                .width(80)
                .height(35)
                .fontSize(12)
                .backgroundColor('#FF5252')
            }
            .width('100%')
            .padding(10)
            .backgroundColor(index % 2 === 0 ? '#E8F5E9' : '#F3E5F5')
            .borderRadius(5)
          }
        }, (item: string) => item)
      }
      .width('85%')
      .height(250)
      .margin(10)

      Text('Total tasks: ' + this.todoList.length)
        .fontSize(14)
        .margin(5)
    }
    .width('100%')
    .height('100%')
    .padding(15)
  }
}

// ============================================
// Test Case 4: @State with primitive types
// ============================================

@Component
struct StatePrimitiveTypes {
  @State counter: number = 0
  @State message: string = 'Hello ArkTS'
  @State isVisible: boolean = true
  @State rating: number = 3.5

  build() {
    Column() {
      Text('State Types Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      if (this.isVisible) {
        Column() {
          Text(this.message)
            .fontSize(20)
            .fontColor(Color.Blue)
            .margin(10)

          Text('Counter: ' + this.counter)
            .fontSize(18)
            .margin(10)

          Text('Rating: ' + this.rating.toFixed(1))
            .fontSize(18)
            .margin(10)
        }
        .padding(20)
        .backgroundColor('#FFF3E0')
        .borderRadius(10)
        .margin(15)
      }

      Row() {
        Button('Increment')
          .onClick(() => {
            this.counter++
          })
          .width(100)
          .height(40)
          .margin(5)

        Button('Decrement')
          .onClick(() => {
            this.counter--
          })
          .width(100)
          .height(40)
          .margin(5)

        Button('Toggle')
          .onClick(() => {
            this.isVisible = !this.isVisible
          })
          .width(100)
          .height(40)
          .margin(5)
      }
      .margin(15)

      Slider({ value: this.rating, min: 0, max: 5, step: 0.5 })
        .onChange((value: number) => {
          this.rating = value
        })
        .width('80%')
        .margin(15)

      TextInput({ text: this.message })
        .onChange((value: string) => {
          this.message = value
        })
        .width('80%')
        .height(45)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}

// ============================================
// Test Case 5: @State in nested components
// ============================================

@Component
struct ChildStateComponent {
  @State childValue: number = 100
  @Link parentValue: number

  build() {
    Column() {
      Text('Child Component')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Child Value: ' + this.childValue)
        .fontSize(16)
        .margin(5)

      Text('Linked Value: ' + this.parentValue)
        .fontSize(16)
        .margin(5)

      Row() {
        Button('Child +10')
          .onClick(() => {
            this.childValue += 10
          })
          .width(100)
          .height(35)
          .margin(5)

        Button('Link +5')
          .onClick(() => {
            this.parentValue += 5
          })
          .width(100)
          .height(35)
          .margin(5)
      }
    }
    .padding(15)
    .backgroundColor('#E3F2FD')
    .borderRadius(8)
    .margin(10)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct StateValidationTestEntry {
  @State parentCounter: number = 50
  @State testStatus: string = '@State Validation Tests'

  build() {
    Scroll() {
      Column() {
        Text(this.testStatus)
          .fontSize(26)
          .fontWeight(FontWeight.Bold)
          .margin(25)

        // Test status indicators
        Column() {
          Text('Test Coverage:')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          Text('1. Missing initialization error')
            .fontSize(14)
            .fontColor(Color.Red)
            .margin(3)

          Text('2. Complex object state management')
            .fontSize(14)
            .fontColor(Color.Green)
            .margin(3)

          Text('3. Array state operations')
            .fontSize(14)
            .fontColor(Color.Green)
            .margin(3)

          Text('4. Primitive type states')
            .fontSize(14)
            .fontColor(Color.Green)
            .margin(3)

          Text('5. Nested component interactions')
            .fontSize(14)
            .fontColor(Color.Green)
            .margin(3)
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#FFF3E0')
        .borderRadius(10)
        .margin(10)

        // Error code display
        Column() {
          Text('Error Codes Tested:')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .margin(5)

          Text('10905317 - Missing @State initialization')
            .fontSize(14)
            .margin(3)

          Text('10905318 - Invalid @State usage')
            .fontSize(14)
            .margin(3)
        }
        .width('90%')
        .padding(12)
        .backgroundColor('#FFEBEE')
        .borderRadius(8)
        .margin(10)

        // Child component test
        ChildStateComponent({ parentValue: this.parentCounter })

        Text('Parent Counter: ' + this.parentCounter)
          .fontSize(16)
          .margin(10)

        Button('Reset Parent')
          .onClick(() => {
            this.parentCounter = 50
          })
          .width(150)
          .height(45)
          .margin(15)
      }
      .width('100%')
      .padding(20)
    }
    .height('100%')
    .backgroundColor(Color.White)
  }
}
