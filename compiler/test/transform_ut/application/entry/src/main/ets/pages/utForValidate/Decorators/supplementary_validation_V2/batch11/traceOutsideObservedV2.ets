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
 * @Trace decorator used outside @ObservedV2 class.
Tests error 10905343: @Trace can only decorate member variables within
a class decorated with @ObservedV2. Includes valid @Trace usage.
 */

// --- Error Cases ---

// Error 10905343: @Trace in a plain class (not @ObservedV2)
class PlainClass {
  @Trace value: number = 0;
}

// --- Valid Patterns ---

// Valid: @Trace inside @ObservedV2 class
@ObservedV2
class ValidObserved {
  @Trace correct: number = 0;
  @Trace name: string = "valid";
}

// Valid: Multiple @Trace members in @ObservedV2
@ObservedV2
class FullTraceModel {
  @Trace id: number = 0;
  @Trace title: string = "";
  @Trace completed: boolean = false;
  @Trace priority: number = 0;
}

// Valid: @ObservedV2 with mixed @Trace and non-@Trace members
@ObservedV2
class MixedTraceModel {
  @Trace observed_count: number = 0;
  @Trace observed_name: string = "name";
  nonObserved_cache: string = "";
  nonObserved_internal: number = 0;
}

// Valid: @ObservedV2 with methods
@ObservedV2
class TraceWithMethods {
  @Trace value: number = 0;
  increment(): void { this.value++; }
  reset(): void { this.value = 0; }
  getValue(): number { return this.value; }
}

// Valid: Using traced model in V2 component
@ComponentV2
struct TraceComponent {
  @Local model: TraceWithMethods = new TraceWithMethods();
  build() {
    Column() {
      Text("Value: " + this.model.value.toString())
      Button("Increment").onClick(() => this.model.increment())
      Button("Reset").onClick(() => this.model.reset())
    }
  }
}

// Valid: @ObservedV2 hierarchy with consistent @Trace
@ObservedV2
class ConfigBase {
  @Trace enabled: boolean = true;
}
@ObservedV2
class AppConfig extends ConfigBase {
  @Trace version: string = "1.0.0";
  @Trace debug: boolean = false;
}

@Entry
@Component
struct TraceOutsideObservedV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
