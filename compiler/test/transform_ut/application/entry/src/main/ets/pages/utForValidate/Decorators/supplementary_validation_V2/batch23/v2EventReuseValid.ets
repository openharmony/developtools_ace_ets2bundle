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
 * Valid V2 @Event and @ComponentReuse.
 */

// --- Valid Patterns ---
// Valid: V1 Counter
@Component
struct V1Counter {
  @State count: number = 0;
  build() {
    Column() {
      Text("V1 Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: V2 Counter
@ComponentV2
struct V2Counter {
  @Local count: number = 0;
  @Computed get doubled(): number { return this.count * 2; }
  build() {
    Column() {
      Text("V2 Count: " + this.count.toString())
      Text("Doubled: " + this.doubled.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: Reusable
@Reusable
@Component
struct ReusableCard {
  @State title: string = "";
  aboutToReuse(params: Record<string, Object>): void { this.title = (params["title"] as string) || ""; }
  build() {
    Column() {
      Text(this.title).fontWeight(FontWeight.Bold)
    }
    .padding(12).borderRadius(8)
  }
}

// Valid: V2 Event
@ComponentV2
struct EventComp {
  @Param value: number = 0;
  @Event onChange: (n: number) => void = (n: number) => {};
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Button("+1").onClick(() => this.onChange(this.value + 1))
    }
  }
}

// Valid: Extend
@Extend(Text)
function styledText(size: number) {
  .fontSize(size)
  .fontColor(Color.Blue)
}

// Valid: Styles
@Styles
function cardStyle() {
  .padding(16)
  .borderRadius(12)
}

// Valid: ObservedV2
@ObservedV2
class DataModel {
  @Trace value: number = 0;
  @Trace label: string = "Data";
}

// Valid: Showcase
@Component
struct Showcase {
  @State clicks: number = 0;
  build() {
    Column() {
      Text("Clicks: " + this.clicks.toString())
      Button("Click").onClick(() => this.clicks++)
    }
  }
}

@Entry
@Component
struct V2EventReuseValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
