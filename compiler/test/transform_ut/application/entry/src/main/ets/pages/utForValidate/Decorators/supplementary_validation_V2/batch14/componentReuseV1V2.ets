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
 * @Reusable/@ReusableV2 conflicts in V2 context.
Tests error 10905229 (V1+V2 decorator conflict) and 10905241 (@Reusable+@ReusableV2 conflict).
Components cannot use both reuse systems simultaneously.
 */

// --- Error Cases ---

// Error 10905229 + 10905241: Dual reusable decorators on V2
@Reusable
@ReusableV2
@ComponentV2
struct DualReusable {
  @Local count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}

// --- Valid Patterns ---

// Valid: V1 reusable component
@Reusable
@Component
struct V1Reusable {
  @State count: number = 0;
  build() {
    Column() {
      Text("V1 Reusable: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: V2 reusable component
@ReusableV2
@ComponentV2
struct V2Reusable {
  @Local value: number = 42;
  @ComponentReuse
  aboutToReuse() { this.value = 0; }
  build() {
    Column() {
      Text("V2 Reusable: " + this.value.toString())
    }
  }
}

// Valid: V1 component without reuse
@Component
struct SimpleV1 {
  @State label: string = "simple v1";
  build() { Text(this.label) }
}

// Valid: V2 component without reuse
@ComponentV2
struct SimpleV2 {
  @Local label: string = "simple v2";
  build() { Text(this.label) }
}

// Valid: V1 reusable with aboutToReuse
@Reusable
@Component
struct V1ReuseWithLifecycle {
  @State data: string = "initial";
  aboutToReuse(params: Record<string, Object>) {
    this.data = "reused"
  }
  build() { Text(this.data) }
}

// Valid: Using reusable components in parent
@Component
struct ParentOfReusable {
  build() {
    Column() {
      V1Reusable()
      SimpleV1()
      Text("Container for reusable components")
    }
  }
}

// Valid: V2 parent using V2 reusable
@ComponentV2
struct V2ParentReusable {
  build() {
    Column() {
      V2Reusable()
      SimpleV2()
    }
  }
}

@Entry
@Component
struct ComponentReuseV1V2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
