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
 * Valid struct and component patterns.
 */

// --- Valid Patterns ---

@Component
struct SimpleComponent {
  build() { Column() { Text("Simple") } }
}

@Component
struct StateComponent {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

@ComponentV2
struct V2Component {
  @Local value: number = 42;
  build() {
    Column() {
      Text("Value: " + this.value.toString())
    }
  }
}

@Component
struct PropsComponent {
  @Prop title: string;
  @Prop count: number;
  build() {
    Column() {
      Text(this.title)
      Text(this.count.toString())
    }
  }
}

@Component
struct LinkComponent {
  @Link syncedValue: number;
  build() {
    Column() {
      Text("Linked: " + this.syncedValue.toString())
    }
  }
}

@Component
struct ComplexComponent {
  @State name: string = "Test";
  @State items: string[] = ["a", "b", "c"];
  @State active: boolean = true;
  @State selected: number = 0;
  build() {
    Column() {
      Text(this.name).fontSize(20)
      Text("Items: " + this.items.length.toString())
      Text("Active: " + this.active.toString())
      Text("Selected: " + this.selected.toString())
      Button("Toggle").onClick(() => { this.active = !this.active })
    }
  }
}

@Component
struct InteractiveComponent {
  @State pressed: boolean = false;
  @State clicks: number = 0;
  build() {
    Column() {
      Text("Clicks: " + this.clicks.toString())
      Text(this.pressed ? "Pressed" : "Released")
      Button("Press Me").onClick(() => {
        this.pressed = !this.pressed
        this.clicks++
      })
    }
  }
}

@Component
struct ListComponent {
  @State data: string[] = ["Item 1", "Item 2", "Item 3"];
  build() {
    Column() {
      Text("List (" + this.data.length.toString() + ")")
      ForEach(this.data, (item: string, i: number) => {
        Text((i + 1).toString() + ": " + item)
      }, (item: string) => item)
    }
  }
}

@Entry
@Component
struct StructValidPatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
