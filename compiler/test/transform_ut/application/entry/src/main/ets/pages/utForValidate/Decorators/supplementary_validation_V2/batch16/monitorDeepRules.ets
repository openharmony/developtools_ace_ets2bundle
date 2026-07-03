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
 * V2 @Monitor decorator deep usage patterns.
 */

// --- Warn Cases ---

// WARN: @Monitor on non-existent variable
@ComponentV2
struct MonitorNonExistent {
  @Local count: number = 0;
  @Monitor("missingVar")
  onMissingChange() { console.log("missing"); }
  build() { Column() { Text(this.count.toString()) } }
}

// --- Valid Patterns ---

// Valid: @Monitor on @Local variable
@ComponentV2
struct MonitorLocal {
  @Local value: number = 0;
  @Monitor("value")
  onValueChange() { console.log("value changed to " + this.value); }
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Button("Inc").onClick(() => this.value++)
    }
  }
}

// Valid: @Monitor on multiple variables
@ComponentV2
struct MonitorMulti {
  @Local width: number = 100;
  @Local height: number = 200;
  @Monitor("width", "height")
  onDimensionChange() { console.log("dimension changed"); }
  @Computed get area(): number { return this.width * this.height; }
  build() {
    Column() {
      Text("Area: " + this.area.toString())
      Button("Resize").onClick(() => { this.width += 10; this.height += 5 })
    }
  }
}

// Valid: @Monitor triggering side effects
@ComponentV2
struct MonitorSideEffect {
  @Local counter: number = 0;
  @Local history: string = "";
  @Monitor("counter")
  onCounterChange() { this.history = this.history + this.counter.toString() + ", "; }
  build() {
    Column() {
      Text("Counter: " + this.counter.toString())
      Text("History: " + this.history)
      Button("Add").onClick(() => this.counter++)
    }
  }
}

// Valid: Multiple @Monitor on different variables
@ComponentV2
struct MultiMonitor {
  @Local name: string = "test";
  @Local count: number = 0;
  @Local active: boolean = true;
  @Monitor("name")
  onNameChange() { console.log("name: " + this.name); }
  @Monitor("count")
  onCountChange() { console.log("count: " + this.count); }
  @Monitor("active")
  onActiveChange() { console.log("active: " + this.active); }
  build() {
    Column() {
      Text(this.name + " - " + this.count.toString())
      Button("Change All").onClick(() => {
        this.name = "updated"
        this.count++
        this.active = !this.active
      })
    }
  }
}

// Valid: @Monitor with @Computed
@ComponentV2
struct MonitorComputed {
  @Local x: number = 10;
  @Local y: number = 20;
  @Computed get distance(): number { return Math.abs(this.x - this.y); }
  @Monitor("x", "y")
  onPositionChange() { console.log("distance: " + this.distance); }
  build() {
    Column() {
      Text("Distance: " + this.distance.toString())
      Button("Move X").onClick(() => this.x += 5)
      Button("Move Y").onClick(() => this.y += 5)
    }
  }
}

@Entry
@Component
struct MonitorDeepRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
