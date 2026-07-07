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
 * @State initialization validation.
 */

// --- Error Cases ---

// Error 10905302: @State with no initial value
@Component
struct StateNoInit {
  @State value: number;
  build() { Column() { Text("test") } }
}

// --- Valid Patterns ---

@Component
struct StateValid {
  @State count: number = 0;
  @State name: string = "Valid";
  @State items: string[] = [];
  build() {
    Column() {
      Text("Name: " + this.name)
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => { this.count++; this.items.push("Item") })
    }
  }
}

@Component
struct StateComplex {
  @State flag: boolean = true;
  @State data: number = 42;
  @State label: string = "Complex";
  build() {
    Column() {
      Text(this.label)
      Text("Data: " + this.data.toString())
      Button("Toggle Flag").onClick(() => { this.flag = !this.flag })
    }
  }
}

@Observed
class StateModel { value: number = 0; label: string = "Model"; }

@Component
struct StateWithObject {
  @State model: StateModel = new StateModel();
  build() {
    Column() {
      Text("Label: " + this.model.label)
      Text("Value: " + this.model.value.toString())
      Button("Add").onClick(() => { this.model.value++ })
    }
  }
}

@Component
struct MultiState {
  @State active: boolean = true;
  @State current: number = 0;
  @State total: number = 100;
  build() {
    Column() {
      Text("Current/Total: " + this.current.toString() + "/" + this.total.toString())
      Button("Progress").onClick(() => { if (this.current < this.total) this.current++ })
    }
  }
}

@Entry
@Component
struct StateInitDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
