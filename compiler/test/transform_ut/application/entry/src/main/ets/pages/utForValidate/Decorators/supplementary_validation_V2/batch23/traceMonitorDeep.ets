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
 * @Trace and @Monitor combined validation patterns.
 */

// --- Valid Patterns ---

// Valid: ObservedV2 with Trace fields
@ObservedV2
class SensorData {
  @Trace temperature: number = 0;
  @Trace humidity: number = 0;
  @Trace label: string = "Sensor";
}

// Valid: V2 component using Monitor on Local
@ComponentV2
struct MonitorLocalComp {
  @Local count: number = 0;
  @Local name: string = "Monitor";
  @Monitor("count")
  onCountChange() {
    console.log("count changed");
  }
  build() {
    Column() {
      Text(this.name).fontSize(18)
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: V2 component monitoring multiple paths
@ComponentV2
struct MultiMonitorComp {
  @Local width: number = 100;
  @Local height: number = 50;
  @Monitor("width", "height")
  onDimensionChange() {
    console.log("dimensions changed");
  }
  @Computed get area(): number { return this.width * this.height; }
  build() {
    Column() {
      Text("Area: " + this.area.toString())
      Button("W+").onClick(() => this.width += 10)
      Button("H+").onClick(() => this.height += 5)
    }
  }
}

// Valid: Trace in nested ObservedV2
@ObservedV2
class NestedModel {
  @Trace items: string[] = ["a", "b", "c"];
  @Trace active: boolean = true;
}

@ComponentV2
struct TraceDisplay {
  @Local model: NestedModel = new NestedModel();
  build() {
    Column() {
      Text("Active: " + this.model.active.toString())
      Text("Items: " + this.model.items.length.toString())
      Button("Toggle").onClick(() => { this.model.active = !this.model.active })
      Button("Add").onClick(() => { this.model.items.push("new") })
    }
  }
}

// Valid: V1 component with State
@Component
struct V1StateComp {
  @State value: number = 42;
  @State label: string = "V1 State";
  build() {
    Column() {
      Text(this.label)
      Text("Value: " + this.value.toString())
      Button("Inc").onClick(() => this.value++)
    }
  }
}

// Valid: Reusable with V1
@Reusable
@Component
struct ReuseMonitor {
  @State title: string = "";
  aboutToReuse(params: Record<string, Object>): void {
    this.title = (params["title"] as string) || "";
  }
  build() {
    Column() {
      Text(this.title).fontWeight(FontWeight.Bold)
    }
    .padding(8)
  }
}

@Entry
@Component
struct TraceMonitorDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
