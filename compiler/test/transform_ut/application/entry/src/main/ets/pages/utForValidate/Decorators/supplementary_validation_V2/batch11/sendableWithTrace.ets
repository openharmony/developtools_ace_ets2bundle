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
 * @Trace decorator inside @Sendable class.
Tests error 10905343: @Trace requires @ObservedV2, not @Sendable.
@Sendable classes use a different concurrency model.
 */

// --- Error Cases ---

// Error 10905343: @Trace in @Sendable class
@Sendable
class SendableTrace {
  @Trace value: number = 0;
}

// --- Valid Patterns ---

// Valid: @Sendable without @Trace
@Sendable
class ValidSendable {
  value: number = 0;
  name: string = "sendable";
}

// Valid: @ObservedV2 with @Trace (correct combination)
@ObservedV2
class ValidTraceModel {
  @Trace value: number = 0;
  @Trace name: string = "traced";
}

// Valid: @Sendable with simple data
@Sendable
class SendableData {
  id: number = 0;
  payload: string = "";
  timestamp: number = 0;
}

// Valid: @ObservedV2 with complex @Trace members
@ObservedV2
class ComplexTraceModel {
  @Trace count: number = 0;
  @Trace label: string = "";
  @Trace items: number[] = [];
  @Trace metadata: Record<string, string> = {};
  addItem(n: number): void { this.items.push(n); }
  get total(): number {
    return this.items.reduce((sum: number, v: number) => sum + v, 0);
  }
}

// Valid: Using models in components
@ComponentV2
struct MixedModelDisplay {
  @Local model: ComplexTraceModel = new ComplexTraceModel();
  build() {
    Column() {
      Text(this.model.label)
      Text("Count: " + this.model.count.toString())
      Text("Items: " + this.model.items.length.toString())
    }
  }
}

// Valid: @ObservedV2 hierarchy
@ObservedV2
class ViewModel {
  @Trace title: string = "view";
  @Trace isLoading: boolean = false;
}
@ObservedV2
class DetailViewModel extends ViewModel {
  @Trace content: string = "";
  @Trace author: string = "";
}

@Entry
@Component
struct SendableWithTraceEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
