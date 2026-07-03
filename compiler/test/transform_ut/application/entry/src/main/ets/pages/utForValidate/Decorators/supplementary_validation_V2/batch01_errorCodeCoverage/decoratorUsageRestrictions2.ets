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

// Test decorator usage restrictions - triggers multiple error codes

// @BuilderParam initialization error - 10905101
@Entry
@Component
struct BuilderParamInitError {
  @BuilderParam childBuilder: () => void = this.myBuilder;
  
  @Builder
  myBuilder() {
    Text('Builder')
  }

  build() {
    Column() {
      this.childBuilder()
    }
  }
}

// @BuilderParam trailing lambda error - 10905102
@Component
struct CustomContainer {
  @BuilderParam noParamBuilder: () => void;
  @BuilderParam hasParamBuilder: (param: string) => void;

  build() {
    Column() {
      this.noParamBuilder()
    }
  }
}

// Multiple build methods - 10905103
@Component
struct MultipleBuildMethods {
  build() {
    Column() {
      Text('Build 1')
    }
  }
  
  build() {
    Row() {
      Text('Build 2')
    }
  }
}

// Static method with @LocalBuilder - 10905104
@Component
struct StaticBuilderError {
  @LocalBuilder
  static myStaticBuilder() {
    Text('Static Builder')
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Styles with parameters - 10905105
@Component
struct StylesParamError {
  @Styles
  myStyle(param: number) {
    .width(param)
  }

  build() {
    Column() {
      Text('Test')
        .myStyle(100)
    }
  }
}

// build method with arguments - 10905106
@Component
struct BuildWithArgs {
  build(arg: string) {
    Column() {
      Text(arg)
    }
  }
}

// @Extend with wrong parameters - 10905108
@Extend(Button)
function extendButtonWithParams(param1: string, param2: number) {
  .width(param2)
  .text(param1)
}

// @State on method - 10905112
@Component
struct StateOnMethod {
  @State
  myMethod() {
    return 'test';
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Extend in wrong scope - 10905113
@Component
struct ExtendInWrongScope {
  @Extend(Button)
  function innerExtend() {
    .width(100)
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Builder outside struct/global - 10905114
class RegularClass {
  @Builder
  classBuilder() {
    Text('In Class')
  }
}

// Duplicate @Monitor - 10905119
@ComponentV2
struct DuplicateMonitorError {
  @Local count: number = 0;

  @Monitor
  @Monitor
  onCountChange() {
    console.log('count changed');
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Multiple decorators on member - 10905121
@Component
struct MultiDecoratorConflict {
  @State
  @Prop
  message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// @Concurrent on generator - 10905122
@Component
struct ConcurrentGeneratorError {
  @Concurrent
  *generatorFunc() {
    yield 1;
    yield 2;
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Concurrent on method - 10905123
@Component
struct ConcurrentMethodError {
  @Concurrent
  concurrentMethod() {
    console.log('concurrent');
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @LocalBuilder on property - 10905125
@Component
struct LocalBuilderOnProperty {
  @LocalBuilder
  builderProp: () => void = () => {
    Text('Builder')
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}
