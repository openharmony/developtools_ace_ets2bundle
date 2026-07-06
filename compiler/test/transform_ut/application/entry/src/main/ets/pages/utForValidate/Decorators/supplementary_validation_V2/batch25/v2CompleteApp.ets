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
 * Complete V2 application.
 */

// --- Valid Patterns ---
// Valid: V1 Counter
@Component
struct V1Counter {
  @State count: number = 0;
  @State name: string = "V1 Counter";
  build() {
    Column() {
      Text(this.name).fontWeight(FontWeight.Bold)
      Text("Count: " + this.count.toString()).fontSize(24)
      Row() {
        Button("-").onClick(() => this.count--)
        Button("Reset").onClick(() => { this.count = 0 })
        Button("+").onClick(() => this.count++)
      }
    }
  }
}

// Valid: V2 Counter
@ComponentV2
struct V2Counter {
  @Local count: number = 0;
  @Local name: string = "V2 Counter";
  @Computed get doubled(): number { return this.count * 2; }
  @Monitor("count")
  onCountChange() { console.log("count changed to " + this.count); }
  build() {
    Column() {
      Text(this.name).fontWeight(FontWeight.Bold)
      Text("Count: " + this.count.toString()).fontSize(24)
      Text("Doubled: " + this.doubled.toString())
      Row() {
        Button("-").onClick(() => this.count--)
        Button("+").onClick(() => this.count++)
      }
    }
  }
}

// Valid: ObservedV2 Model
@ObservedV2
class TaskModel {
  @Trace title: string = "Task";
  @Trace done: boolean = false;
  @Trace priority: number = 0;
}

// Valid: Task Display
@ComponentV2
struct TaskDisplay {
  @Local task: TaskModel = new TaskModel();
  build() {
    Column() {
      Text(this.task.title).fontWeight(FontWeight.Bold)
      Text("Done: " + this.task.done.toString())
      Text("Priority: " + this.task.priority.toString())
      Button("Toggle Done").onClick(() => { this.task.done = !this.task.done })
    }
  }
}

// Valid: Shopping Cart
@ObservedV2
class CartItem {
  @Trace name: string = "";
  @Trace price: number = 0;
  @Trace qty: number = 1;
  constructor(name: string, price: number) { this.name = name; this.price = price; }
}

@ComponentV2
struct CartView {
  @Local items: CartItem[] = [new CartItem("Widget", 10), new CartItem("Gadget", 25)];
  @Computed get total(): number {
    return this.items.reduce((s: number, i: CartItem) => s + i.price * i.qty, 0);
  }
  build() {
    Column() {
      Text("Cart Total: $" + this.total.toString()).fontWeight(FontWeight.Bold)
      ForEach(this.items, (item: CartItem, i: number) => {
        Row() {
          Text(item.name).layoutWeight(1)
          Text("x" + item.qty.toString())
          Text("$" + (item.price * item.qty).toString())
          Button("+").onClick(() => item.qty++)
        }
      }, (item: CartItem, i: number) => i.toString())
    }
  }
}

@Entry
@Component
struct V2CompleteAppEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
