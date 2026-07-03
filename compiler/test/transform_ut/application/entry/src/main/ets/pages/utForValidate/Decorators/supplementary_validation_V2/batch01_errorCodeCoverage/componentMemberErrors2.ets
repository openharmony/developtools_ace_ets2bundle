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

// Test component member and state management errors - triggers 10905301, 10905308, 10905310, 10905311, 10905313, 10905314, 10905317, 10905319, 10905321

// @Watch on non-existent method - 10905301
@Component
struct WatchNonExistentMethod {
  @State @Watch('nonExistentMethod') value: number = 0;

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// @State with CustomDialogController - 10905308
@Component
struct StateWithDialogController {
  @State controller: CustomDialogController = new CustomDialogController({
    builder: this.dialogBuilder
  });

  @Builder
  dialogBuilder() {
    Column() {
      Text('Dialog')
    }
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Watch on non-state variable - 10905310
@Component
struct WatchOnNonState {
  @Watch('onChange')
  regularVar: string = 'test';

  onChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.regularVar)
    }
  }
}

// @Watch with non-string parameter - 10905311
@Component
struct WatchNonStringParam {
  @State @Watch(123) value: number = 0;

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// Static variable with built-in decorator - 10905313
@Component
struct StaticWithDecorator {
  @State
  static staticValue: string = 'static';

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Non-link variable with $ initialization - 10905314
@Component
struct NonLinkWithDollar {
  @State value: string = 'test';
  @State ref: string = $value;

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// Forbidden initialization via param - 10905317
@Component
struct ForbiddenInitViaParam {
  @StorageProp('storage_key')
  storageValue: string = 'default';

  build() {
    Column() {
      Text(this.storageValue)
    }
  }
}

// Two-way binding missing @Param and @Event - 10905319
// 父组件使用$语法进行双向绑定，但子组件只有@Param没有@Event
@ComponentV2
struct TwoWayBindingError {
  @Local localValue: number = 0;

  build() {
    Column() {
      // 错误：子组件ChildComponent只有@Param，没有@Event
      ChildComponent({ value: $localValue })
    }
  }
}

@ComponentV2
struct ChildComponent {
  // 错误：缺少@Event装饰器来支持双向绑定
  @Param value: number = 0;

  build() {
    Text(this.value.toString())
  }
}

// @Require variable not initialized - 10905321
@ComponentV2
struct RequireNotInitialized {
  @Param @Require
  requiredValue: string;

  build() {
    Column() {
      Text(this.requiredValue)
    }
  }
}