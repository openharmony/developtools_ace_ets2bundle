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
 * Test case: Observed decorator error
 * Purpose: Verify @Observed decorator class requirements
 * Error code: 10905313
 */

// ============================================
// Test Case 1: @Observed on non-class
// Expected Error: 10905313
// ============================================

@Observed
class ObservedClass {
  name: string = 'test'
  value: number = 0
}

@Component
struct ObservedNonClassError {
  @ObjectLink data: ObservedClass

  build() {
    Column() {
      Text(this.data.name)
    }
  }
}

// ============================================
// Test Case 2: @Observed with interface
// Expected Error: 10905313
// ============================================

@Observed
interface ObservedInterface {
  id: number
  name: string
}

// ============================================
// Test Case 3: Correct @Observed usage
// ============================================

@Observed
class ObservedDataModel {
  id: number
  title: string
  completed: boolean
  items: string[]

  constructor(id: number, title: string) {
    this.id = id
    this.title = title
    this.completed = false
    this.items = []
  }

  addItem(item: string) {
    this.items.push(item)
  }

  toggleCompleted() {
    this.completed = !this.completed
  }
}

@Component
struct TodoItem {
  @ObjectLink todo: ObservedDataModel

  build() {
    Row() {
      Checkbox()
        .select(this.todo.completed)
        .onChange((value: boolean) => {
          this.todo.toggleCompleted()
        })

      Text(this.todo.title)
        .fontSize(16)
        .decoration({ type: this.todo.completed ? TextDecorationType.LineThrough : TextDecorationType.None })
        .opacity(this.todo.completed ? 0.5 : 1)
        .layoutWeight(1)

      Text('Items: ' + this.todo.items.length)
        .fontSize(12)
        .fontColor(Color.Gray)
    }
    .width('100%')
    .padding(10)
    .backgroundColor(this.todo.completed ? '#F5F5F5' : '#FFFFFF')
    .margin(5)
  }
}

@Component
struct CorrectObservedUsage {
  @State todos: ObservedDataModel[] = [
    new ObservedDataModel(1, 'Learn ArkTS'),
    new ObservedDataModel(2, 'Build UI'),
    new ObservedDataModel(3, 'Test Application')
  ]

  build() {
    Column() {
      Text('Todo List with @Observed')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      List() {
        ForEach(this.todos, (todo: ObservedDataModel) => {
          ListItem() {
            TodoItem({ todo: todo })
          }
        })
      }
      .width('100%')
      .layoutWeight(1)

      Button('Add New Todo')
        .onClick(() => {
          const newId = this.todos.length + 1
          this.todos.push(new ObservedDataModel(newId, 'New Task ' + newId))
        })
        .margin(10)

      Button('Add Item to First')
        .onClick(() => {
          if (this.todos.length > 0) {
            this.todos[0].addItem('Subtask')
          }
        })
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 4: Nested @Observed objects
// ============================================

@Observed
class Address {
  street: string
  city: string
  zipCode: string

  constructor(street: string, city: string, zipCode: string) {
    this.street = street
    this.city = city
    this.zipCode = zipCode
  }
}

@Observed
class Person {
  name: string
  age: number
  address: Address

  constructor(name: string, age: number, address: Address) {
    this.name = name
    this.age = age
    this.address = address
  }
}

@Component
struct PersonCard {
  @ObjectLink person: Person

  build() {
    Column() {
      Text(this.person.name)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(5)

      Text('Age: ' + this.person.age)
        .fontSize(16)
        .margin(3)

      Text('Address:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(5)

      Text(this.person.address.street)
        .fontSize(14)
        .margin(2)

      Text(this.person.address.city + ', ' + this.person.address.zipCode)
        .fontSize(14)
        .margin(2)

      Row() {
        Button('Age++')
          .onClick(() => this.person.age++)
          .margin(5)

        Button('Change City')
          .onClick(() => {
            this.person.address.city = this.person.address.city === 'Beijing' ? 'Shanghai' : 'Beijing'
          })
          .margin(5)
      }
      .margin(10)
    }
    .width('90%')
    .padding(15)
    .backgroundColor('#E3F2FD')
    .borderRadius(10)
    .margin(10)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestObservedDecorator {
  @State testTitle: string = '@Observed Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905313')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Observed on non-class types')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Observed Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Can only be used on classes')
          .fontSize(14)
          .margin(2)

        Text('2. Cannot be used on interfaces')
          .fontSize(14)
          .margin(2)

        Text('3. Class properties are observable')
          .fontSize(14)
          .margin(2)

        Text('4. Works with @ObjectLink')
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

        Text('@Observed')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('class DataModel {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  prop: type')
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
