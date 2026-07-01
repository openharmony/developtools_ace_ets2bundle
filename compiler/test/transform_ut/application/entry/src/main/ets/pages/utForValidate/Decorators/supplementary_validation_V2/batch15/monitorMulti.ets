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
 * @Monitor with multiple state variable paths.
Tests valid @Monitor observing multiple variables simultaneously.
@Monitor triggers when any of its observed variables change.
 */

// --- Valid Patterns ---

// Valid: @Monitor with three paths
@ComponentV2
struct MultiMonitor {
  @Local a: number = 1;
  @Local b: number = 2;
  @Local c: number = 3;
  @Monitor("a", "b", "c")
  onAnyChange() { console.log("something changed"); }
  build() { Column() { Text("multi monitor") } }
}

// Valid: @Monitor with two paths and computed result
@ComponentV2
struct TwoPathMonitor {
  @Local width: number = 100;
  @Local height: number = 200;
  @Monitor("width", "height")
  onDimensionChange() { console.log("dimension changed"); }
  @Computed get area(): number { return this.width * this.height; }
  build() {
    Column() {
      Text("Area: " + this.area.toString())
      Button("Resize").onClick(() => {
        this.width += 10
        this.height += 5
      })
    }
  }
}

// Valid: Multiple @Monitor decorators on different methods
@ComponentV2
struct MultipleMonitors {
  @Local count: number = 0;
  @Local name: string = "test";
  @Local flag: boolean = true;
  @Monitor("count")
  onCountChange() { console.log("count: " + this.count.toString()); }
  @Monitor("name")
  onNameChange() { console.log("name: " + this.name); }
  @Monitor("flag")
  onFlagChange() { console.log("flag: " + this.flag.toString()); }
  build() {
    Column() {
      Text(this.name + " - " + this.count.toString())
      Button("Change All").onClick(() => {
        this.count++
        this.name = "updated"
        this.flag = !this.flag
      })
    }
  }
}

// Valid: @Monitor with logging side effect
@ComponentV2
struct MonitorWithLog {
  @Local value: number = 42;
  @Local changeLog: string = "";
  @Monitor("value")
  onValueChange() {
    this.changeLog = "Value changed at: " + Date.now().toString();
  }
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Text(this.changeLog)
      Button("Random").onClick(() => {
        this.value = Math.floor(Math.random() * 100)
      })
    }
  }
}

// Valid: @Monitor with wildcard pattern
@ComponentV2
struct WildcardMonitor {
  @Local dataX: number = 10;
  @Local dataY: number = 20;
  @Local dataZ: number = 30;
  @Monitor("dataX", "dataY", "dataZ")
  onDataFieldChange() { console.log("data field changed"); }
  @Computed get total(): number { return this.dataX + this.dataY + this.dataZ; }
  build() {
    Column() {
      Text("Total: " + this.total.toString())
      Button("Update X").onClick(() => this.dataX++)
      Button("Update Y").onClick(() => this.dataY++)
    }
  }
}

// Valid: @Monitor combined with @Computed
@ComponentV2
struct MonitorComputed {
  @Local base: number = 5;
  @Local multiplier: number = 3;
  @Computed get result(): number { return this.base * this.multiplier; }
  @Monitor("base", "multiplier")
  onInputsChange() { console.log("Result is now: " + this.result.toString()); }
  build() {
    Column() {
      Text("Result: " + this.result.toString())
      Button("Random Base").onClick(() => {
        this.base = Math.floor(Math.random() * 10)
      })
    }
  }
}

@Entry
@Component
struct MonitorMultiEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
