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
 * @Param decorator inside @ObservedV2 class.
Tests error 10905337: @Param can only be used with struct.
@Param is a component decorator, not a class decorator.
 */

// --- Error Cases ---

// Error 10905337: @Param in @ObservedV2 class
@ObservedV2
class ObservedV2Param {
  @Param value: number = 0;
}

// --- Valid Patterns ---

// Valid: @Param in @ComponentV2 struct (not class)
@ComponentV2
struct ValidParamStruct {
  @Param value: number = 0;
  @Param name: string = "default";
  build() { Column() { Text(this.name) } }
}

// Valid: @ObservedV2 class without @Param
@ObservedV2
class PureObservedV2 {
  @Trace data: number = 42;
  @Trace label: string = "model";
  @Trace active: boolean = true;
}

// Valid: Using @ObservedV2 model with @Param in struct
@ComponentV2
struct ModelWithParam {
  @Param modelId: number = 0;
  @Local model: PureObservedV2 = new PureObservedV2();
  build() {
    Column() {
      Text("ID: " + this.modelId.toString())
      Text(this.model.label)
    }
  }
}

// Valid: Multiple @Param in struct
@ComponentV2
struct MultiParamStruct {
  @Param title: string = "";
  @Param count: number = 0;
  @Param enabled: boolean = true;
  build() {
    Column() {
      Text(this.title)
      Text("Count: " + this.count.toString())
      if (this.enabled) {
        Text("Enabled")
      }
    }
  }
}

// Valid: @Param with @Require
@ComponentV2
struct RequiredParam {
  @Require @Param mandatory: string;
  @Param optional: number = 100;
  build() {
    Column() {
      Text(this.mandatory)
      Text(this.optional.toString())
    }
  }
}

// Valid: @ObservedV2 used as @Param type
@ObservedV2
class UserConfig {
  @Trace theme: string = "dark";
  @Trace fontSize: number = 14;
}
@ComponentV2
struct ConfigurableComponent {
  @Param config: UserConfig = new UserConfig();
  build() {
    Column() {
      Text("Theme: " + this.config.theme)
      Text("Font: " + this.config.fontSize.toString())
    }
  }
}

@Entry
@Component
struct ParamInObservedV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
