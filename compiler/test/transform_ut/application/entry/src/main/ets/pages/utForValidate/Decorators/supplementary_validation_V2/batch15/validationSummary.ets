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
 * Summary of various validation patterns combining multiple concepts.
Tests valid patterns as a control group with no errors expected.
Demonstrates correct ArkTS UI development practices.
 */

// --- Valid Patterns ---

// Valid: Well-structured component with state
@Component
struct SummaryValid {
  @State count: number = 0;
  @State message: string = "hello";
  @State items: string[] = ["a", "b", "c"];
  build() {
    Column() {
      Text(this.message).fontSize(20)
      Text("Count: " + this.count.toString())
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
      Button("Reset").onClick(() => { this.count = 0 })
    }
  }
}

// Valid: V2 component with full features
@ComponentV2
struct V2SummaryValid {
  @Local base: number = 10;
  @Param multiplier: number = 2;
  @Computed get result(): number { return this.base * this.multiplier; }
  @Computed get label(): string { return "Result: " + this.result.toString(); }
  build() {
    Column() {
      Text(this.label)
      Button("Increase Base").onClick(() => this.base += 5)
    }
  }
}

// Valid: Component with conditional and list
@Component
struct ConditionalList {
  @State showList: boolean = true;
  @State data: number[] = [10, 20, 30];
  build() {
    Column() {
      Button("Toggle List").onClick(() => {
        this.showList = !this.showList
      })
      if (this.showList) {
        ForEach(this.data, (val: number) => {
          Text("Value: " + val.toString())
        }, (val: number) => val.toString())
      } else {
        Text("List is hidden")
      }
    }
  }
}

// Valid: Interactive counter with history
@Component
struct CounterWithHistory {
  @State current: number = 0;
  @State history: number[] = [];
  build() {
    Column() {
      Text("Current: " + this.current.toString())
      Text("History: " + this.history.length.toString() + " entries")
      Row() {
        Button("Add").onClick(() => {
          this.current++
          this.history.push(this.current)
        })
        Button("Reset").onClick(() => {
          this.current = 0
          this.history = []
        })
      }
    }
  }
}

// Valid: Styled component layout
@Component
struct StyledLayout {
  @State title: string = "Dashboard";
  @State userCount: number = 42;
  build() {
    Column() {
      Text(this.title).fontSize(24).fontWeight(FontWeight.Bold)
      Divider().margin(10)
      Row() {
        Text("Active Users: ").fontSize(14)
        Text(this.userCount.toString()).fontSize(14).fontWeight(FontWeight.Bold)
      }
      Button("Refresh").onClick(() => this.userCount++)
    }
  }
}

// Valid: Component using ForEach with objects
@Observed
class TaskItem {
  title: string = "";
  done: boolean = false;
}

@Component
struct TaskBoard {
  @State tasks: TaskItem[] = [
    { title: "Design", done: true } as TaskItem,
    { title: "Develop", done: false } as TaskItem
  ];
  build() {
    Column() {
      Text("Task Board")
      ForEach(this.tasks, (task: TaskItem) => {
        Row() {
          Text(task.done ? "[x] " : "[ ] ")
          Text(task.title)
        }
      }, (task: TaskItem, i: number) => i.toString())
    }
  }
}

// Valid: Complete page summary
@Component
struct CompletePage {
  build() {
    Column() {
      StyledLayout()
      ConditionalList()
      CounterWithHistory()
    }
  }
}

@Entry
@Component
struct ValidationSummaryEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
