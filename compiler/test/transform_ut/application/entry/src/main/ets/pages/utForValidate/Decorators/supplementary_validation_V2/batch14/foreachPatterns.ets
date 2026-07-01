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
 * ForEach and LazyForEach usage patterns.
Tests valid data-driven rendering with ForEach.
ForEach requires item generator and key generator functions.
 */

// --- Valid Patterns ---

// Valid: Basic ForEach with numbers
@Component
struct ForEachValid {
  @State items: number[] = [1, 2, 3];
  build() {
    Column() {
      ForEach(this.items, (item: number) => {
        Text(item.toString())
      }, (item: number) => item.toString())
    }
  }
}

// Valid: ForEach with string array
@Component
struct ForEachStrings {
  @State names: string[] = ["Alice", "Bob", "Charlie"];
  build() {
    Column() {
      ForEach(this.names, (name: string) => {
        Text(name).fontSize(16)
      }, (name: string) => name)
    }
  }
}

// Valid: ForEach with index
@Component
struct ForEachWithIndex {
  @State items: string[] = ["First", "Second", "Third"];
  build() {
    Column() {
      ForEach(this.items, (item: string, index: number) => {
        Text((index + 1).toString() + ". " + item)
      }, (item: string) => item)
    }
  }
}

// Valid: ForEach with conditional rendering
@Component
struct ForEachConditional {
  @State values: number[] = [10, 25, 5, 30, 15];
  build() {
    Column() {
      ForEach(this.values, (val: number) => {
        if (val > 20) {
          Text("High: " + val.toString())
        } else {
          Text("Low: " + val.toString())
        }
      }, (val: number) => val.toString())
    }
  }
}

// Valid: ForEach with styled items
@Component
struct ForEachStyled {
  @State products: string[] = ["Apple", "Banana", "Cherry"];
  build() {
    Column() {
      ForEach(this.products, (product: string) => {
        Row() {
          Text(product).fontWeight(FontWeight.Bold)
          Text("$" + (product.length * 2).toString())
        }
      }, (product: string) => product)
    }
  }
}

// Valid: ForEach in a list layout
@Component
struct ForEachInList {
  @State tasks: string[] = ["Task A", "Task B", "Task C", "Task D"];
  build() {
    Column() {
      Text("Task List").fontSize(20)
      ForEach(this.tasks, (task: string) => {
        Row() {
          Text("•")
          Text(task)
          Text("[Done]")
        }
      }, (task: string) => task)
    }
  }
}

// Valid: ForEach with dynamic content
@Component
struct ForEachDynamic {
  @State count: number = 3;
  @State items: number[] = [1, 2, 3];
  build() {
    Column() {
      ForEach(this.items, (item: number) => {
        Text("Item " + item.toString())
      }, (item: number) => item.toString())
      Button("Add Item").onClick(() => {
        this.count++
        this.items.push(this.count)
      })
    }
  }
}

@Entry
@Component
struct ForeachPatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
