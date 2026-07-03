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
 * Valid complex struct patterns with multiple features.
 */

// --- Valid Patterns ---

@Observed
class TodoItem {
  title: string;
  done: boolean;
  constructor(title: string) {
    this.title = title;
    this.done = false;
  }
}

@Component
struct TodoApp {
  @State todos: TodoItem[] = [];
  @State newTodoTitle: string = "";
  build() {
    Column() {
      Text("Todo App").fontSize(20).fontWeight(FontWeight.Bold)
      Text("Total: " + this.todos.length.toString())
      Text("Done: " + this.todos.filter(t => t.done).length.toString())
      Button("Add Todo").onClick(() => {
        this.todos.push(new TodoItem("Task " + (this.todos.length + 1)))
      })
      ForEach(this.todos, (todo: TodoItem, index: number) => {
        Row() {
          Text((index + 1).toString() + ". " + todo.title)
          Text(todo.done ? " [Done]" : " [Pending]")
        }
      }, (todo: TodoItem, index: number) => index.toString())
      Button("Complete First").onClick(() => {
        if (this.todos.length > 0) { this.todos[0].done = true }
      })
    }
  }
}

@Component
struct WeatherCard {
  @State city: string = "Beijing";
  @State temp: number = 22;
  @State condition: string = "Sunny";
  build() {
    Column() {
      Text(this.city).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.temp.toString() + "C").fontSize(36)
      Text(this.condition)
    }
    .padding(16)
  }
}

@Component
struct Calculator {
  @State display: string = "0";
  @State previous: number = 0;
  @State operation: string = "";
  build() {
    Column() {
      Text("Calculator").fontSize(16)
      Text("Display: " + this.display).fontSize(24)
      Text("Previous: " + this.previous.toString())
      Text("Operation: " + this.operation)
      Row() {
        Button("1").onClick(() => { this.display = this.display === "0" ? "1" : this.display + "1" })
        Button("2").onClick(() => { this.display = this.display === "0" ? "2" : this.display + "2" })
        Button("+").onClick(() => { this.previous = parseFloat(this.display); this.operation = "+"; this.display = "0" })
        Button("=").onClick(() => {
          if (this.operation === "+") {
            this.display = (this.previous + parseFloat(this.display)).toString()
          }
        })
      }
      Button("Clear").onClick(() => { this.display = "0"; this.previous = 0; this.operation = "" })
    }
  }
}

@Entry
@Component
struct StructComplexValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
