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
 * @Trace decorator placement validation.
 */

// --- Error Cases ---

// Error 10905343: @Trace in non-@ObservedV2 class
class PlainClass { @Trace value: number = 0; }

// Error 10905343: @Trace on method
@ObservedV2
class TraceOnMethod {
  count: number = 0;
  @Trace increment() { this.count++; }
}

// --- Valid Patterns ---

@ObservedV2
class Settings {
  @Trace theme: string = "light";
  @Trace fontSize: number = 14;
  @Trace language: string = "en";
}

@ComponentV2
struct SettingsView {
  @Local settings: Settings = new Settings();
  build() {
    Column() {
      Text("Theme: " + this.settings.theme)
      Text("Font: " + this.settings.fontSize.toString())
      Button("Toggle Theme").onClick(() => {
        this.settings.theme = this.settings.theme === "light" ? "dark" : "light"
      })
    }
  }
}

@ObservedV2
class MultiType {
  @Trace textVal: string = "hello";
  @Trace numVal: number = 42;
  @Trace boolVal: boolean = false;
}

@ComponentV2
struct MultiTypeView {
  @Local data: MultiType = new MultiType();
  build() {
    Column() {
      Text("Text: " + this.data.textVal)
      Text("Number: " + this.data.numVal.toString())
      Text("Bool: " + this.data.boolVal.toString())
      Button("Toggle Bool").onClick(() => { this.data.boolVal = !this.data.boolVal })
    }
  }
}

@ObservedV2
class ScoreModel {
  @Trace score: number = 0;
  @Trace total: number = 100;
}

@ComponentV2
struct ScoreView {
  @Local model: ScoreModel = new ScoreModel();
  @Computed get percentage(): number {
    return Math.floor((this.model.score / this.model.total) * 100);
  }
  build() {
    Column() {
      Text("Score: " + this.model.score.toString() + "/" + this.model.total.toString())
      Text("Percentage: " + this.percentage.toString() + "%")
      Button("Add 10").onClick(() => { this.model.score += 10 })
    }
  }
}

@Entry
@Component
struct TraceValidationDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
