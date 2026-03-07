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
 * Test case: ObjectLink decorator error
 * Purpose: Verify @ObjectLink decorator usage and validation
 * Error code: 10906300
 */

// ============================================
// Test Case 1: @ObjectLink with non-@Observed class
// Expected Error: 10906300
// ============================================

class RegularClass {
  name: string = 'test'
}

@Component
struct ObjectLinkNonObserved {
  @ObjectLink obj: RegularClass

  build() {
    Column() {
      Text(this.obj.name)
    }
  }
}

// ============================================
// Test Case 2: @ObjectLink with local initialization
// Expected Error: 10906300
// ============================================

@Observed
class ObservedClass {
  data: string = ''
}

@Component
struct ObjectLinkLocalInit {
  @ObjectLink item: ObservedClass = new ObservedClass()

  build() {
    Column() {
      Text(this.item.data)
    }
  }
}

// ============================================
// Test Case 3: @ObjectLink used outside @Component
// Expected Error: 10906300
// ============================================

class ObjectLinkOutside {
  @ObjectLink shared: ObservedClass
}

// ============================================
// Test Case 4: Correct @ObjectLink usage
// ============================================

@Observed
class TaskModel {
  id: number
  title: string
  completed: boolean

  constructor(id: number, title: string, completed: boolean = false) {
    this.id = id
    this.title = title
    this.completed = completed
  }
}

@Observed
class ProjectModel {
  name: string
  tasks: TaskModel[]
  progress: number

  constructor(name: string) {
    this.name = name
    this.tasks = []
    this.progress = 0
  }

  addTask(task: TaskModel): void {
    this.tasks.push(task)
    this.updateProgress()
  }

  private updateProgress(): void {
    const completed = this.tasks.filter(t => t.completed).length
    this.progress = this.tasks.length > 0 ? (completed / this.tasks.length) * 100 : 0
  }
}

@Component
struct TaskItemComponent {
  @ObjectLink task: TaskModel

  build() {
    Row() {
      Text(this.task.completed ? '☑' : '☐')
        .fontSize(24)
        .margin(10)
        .onClick(() => {
          this.task.completed = !this.task.completed
        })

      Text(this.task.title)
        .fontSize(16)
        .fontWeight(this.task.completed ? FontWeight.Normal : FontWeight.Bold)
        .fontColor(this.task.completed ? '#999999' : '#333333')
        .decoration({ type: this.task.completed ? TextDecorationType.LineThrough : TextDecorationType.None })
        .layoutWeight(1)
    }
    .width('100%')
    .padding(10)
    .backgroundColor(this.task.completed ? '#F5F5F5' : '#FFFFFF')
    .margin(5)
  }
}

@Component
struct ProjectViewComponent {
  @ObjectLink project: ProjectModel

  build() {
    Column() {
      Row() {
        Text(this.project.name)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Text(`${this.project.progress.toFixed(0)}%`)
          .fontSize(18)
          .fontColor(this.project.progress === 100 ? Color.Green : Color.Orange)
      }
      .width('100%')
      .padding(15)
      .backgroundColor('#E3F2FD')

      Progress({ value: this.project.progress, total: 100 })
        .width('90%')
        .margin(10)

      List() {
        ForEach(this.project.tasks, (task: TaskModel) => {
          ListItem() {
            TaskItemComponent({ task: task })
          }
        })
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .padding(10)
  }
}

@Component
struct CorrectObjectLinkUsage {
  @State project: ProjectModel = new ProjectModel('My Project')

  aboutToAppear() {
    this.project.addTask(new TaskModel(1, 'Design UI', false))
    this.project.addTask(new TaskModel(2, 'Implement Backend', false))
    this.project.addTask(new TaskModel(3, 'Write Tests', false))
  }

  build() {
    Column() {
      Text('ObjectLink Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      ProjectViewComponent({ project: this.project })

      Button('Add Task')
        .onClick(() => {
          const newId = this.project.tasks.length + 1
          this.project.addTask(new TaskModel(newId, 'New Task ' + newId))
        })
        .width(150)
        .height(45)
        .margin(15)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}

// ============================================
// Test Case 5: Multiple @ObjectLink references
// ============================================

@Observed
class SharedResource {
  content: string
  version: number
  lastModified: Date

  constructor(content: string) {
    this.content = content
    this.version = 1
    this.lastModified = new Date()
  }

  update(newContent: string): void {
    this.content = newContent
    this.version++
    this.lastModified = new Date()
  }
}

@Component
struct EditorComponent {
  @ObjectLink resource: SharedResource

  build() {
    Column() {
      Text('Editor')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Version: ' + this.resource.version)
        .fontSize(12)
        .fontColor('#999999')
        .margin(5)

      Column() {
        Text(this.resource.content)
          .fontSize(14)
          .margin(10)
      }
      .width('100%')
      .height(100)
      .backgroundColor('#F5F5F5')
      .margin(10)
    }
    .padding(15)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
  }
}

@Component
struct ViewerComponent {
  @ObjectLink resource: SharedResource

  build() {
    Column() {
      Text('Viewer')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Last Modified: ' + this.resource.lastModified.toLocaleTimeString())
        .fontSize(12)
        .fontColor('#999999')
        .margin(5)

      Text(this.resource.content.substring(0, 50) + '...')
        .fontSize(14)
        .margin(10)
        .maxLines(3)
    }
    .padding(15)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
  }
}

@Component
struct MultipleObjectLinkDemo {
  @State shared: SharedResource = new SharedResource('Initial content')

  build() {
    Column() {
      Text('Shared Resource Demo')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      EditorComponent({ resource: this.shared })
        .margin(10)

      ViewerComponent({ resource: this.shared })
        .margin(10)

      Button('Update Content')
        .onClick(() => {
          this.shared.update('Updated at ' + new Date().toLocaleTimeString())
        })
        .width(180)
        .height(45)
        .margin(15)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestObjectLinkDecorator {
  @State testTitle: string = '@ObjectLink Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906300')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@ObjectLink with non-@Observed')
          .fontSize(14)
          .margin(5)

        Text('@ObjectLink with local init')
          .fontSize(14)
          .margin(5)

        Text('@ObjectLink outside @Component')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@ObjectLink Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must use @Observed class')
          .fontSize(14)
          .margin(2)

        Text('2. Cannot initialize locally')
          .fontSize(14)
          .margin(2)

        Text('3. Must be in @Component')
          .fontSize(14)
          .margin(2)

        Text('4. Shares data with parent')
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

        Text('class Model { ... }')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct Child {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @ObjectLink data: Model')
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
