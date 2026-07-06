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
 * V2 state management comprehensive valid patterns summary.
 */

// --- Valid Patterns ---

// Valid: Complete V2 state component with all decorators
@ObservedV2
class TaskItem {
  @Trace id: number;
  @Trace title: string;
  @Trace done: boolean;
  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
    this.done = false;
  }
}

@ComponentV2
struct TaskManager {
  @Local tasks: TaskItem[] = [];
  @Local filter: string = "all";
  @Computed get activeCount(): number {
    return this.tasks.filter(t => !t.done).length;
  }
  @Computed get completedCount(): number {
    return this.tasks.filter(t => t.done).length;
  }
  @Monitor("filter")
  onFilterChange() { console.log("Filter changed to: " + this.filter); }
  build() {
    Column() {
      Text("Task Manager").fontSize(20).fontWeight(FontWeight.Bold)
      Text("Active: " + this.activeCount.toString() + " / Completed: " + this.completedCount.toString())
      Button("Add Task").onClick(() => {
        this.tasks.push(new TaskItem(this.tasks.length + 1, "Task " + (this.tasks.length + 1)))
      })
      Button("Toggle Filter").onClick(() => {
        this.filter = this.filter === "all" ? "active" : "all"
      })
      ForEach(this.tasks, (task: TaskItem) => {
        Text(task.title + (task.done ? " [Done]" : ""))
      }, (task: TaskItem) => task.id.toString())
    }
  }
}

// Valid: Shopping cart with V2 state
@ObservedV2
class Product {
  @Trace name: string;
  @Trace price: number;
  @Trace quantity: number;
  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
    this.quantity = 1;
  }
}

@ComponentV2
struct ShoppingCart {
  @Local products: Product[] = [];
  @Local discount: number = 0;
  @Computed get subtotal(): number {
    return this.products.reduce((sum: number, p: Product) => sum + p.price * p.quantity, 0);
  }
  @Computed get total(): number { return this.subtotal - this.discount; }
  build() {
    Column() {
      Text("Shopping Cart").fontSize(18)
      Text("Subtotal: " + this.subtotal.toString())
      Text("Discount: " + this.discount.toString())
      Text("Total: " + this.total.toString()).fontWeight(FontWeight.Bold)
      Button("Add Product").onClick(() => {
        this.products.push(new Product("Item" + this.products.length, 10))
      })
      Button("Apply Discount").onClick(() => { this.discount = 5 })
    }
  }
}

// Valid: Settings component
@ComponentV2
struct SettingsPanel {
  @Local darkMode: boolean = false;
  @Local notifications: boolean = true;
  @Local language: string = "en";
  @Computed get summary(): string {
    return "Dark: " + this.darkMode + ", Notif: " + this.notifications + ", Lang: " + this.language;
  }
  build() {
    Column() {
      Text("Settings").fontSize(18)
      Text(this.summary)
      Button("Toggle Dark Mode").onClick(() => { this.darkMode = !this.darkMode })
      Button("Toggle Notifications").onClick(() => { this.notifications = !this.notifications })
      Button("Switch Language").onClick(() => {
        this.language = this.language === "en" ? "zh" : "en"
      })
    }
  }
}

@Entry
@Component
struct V2StateSummaryEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
