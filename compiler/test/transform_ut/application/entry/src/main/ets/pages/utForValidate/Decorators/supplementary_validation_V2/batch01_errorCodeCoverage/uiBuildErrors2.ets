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

// Test UI build errors - triggers 10905201, 10905202, 10905203, 10905206, 10905207, 10905208, 10905209, 10905210, 10905211, 10905212, 10905220, 10905222

// Component in wrong parent - 10905201
@Entry
@Component
struct WrongParentComponent {
  build() {
    Stack() {
      // Blank can only be in Row, Column, or Flex
      Blank()
    }
  }
}

// Button with label and children - 10905202
@Entry
@Component
struct ButtonWithLabelAndChildren {
  build() {
    Column() {
      Button('Click me') {
        Text('Child text')
      }
    }
  }
}

// Invalid stateStyles - 10905203
@Entry
@Component
struct InvalidStateStyles {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
        .stateStyles({
          normal: {
            // Invalid style configuration
            .invalidProperty(10)
          }
        })
    }
  }
}

// Invalid UI syntax - 10905204, 10905206, 10905209
@Entry
@Component
struct InvalidUISyntax {
  build() {
    Column() {
      // Invalid syntax in component
      Text('Hello').invalidMethod()
      
      // Non-UI code in build
      let x = 10;
      console.log(x);
    }
  }
}

// Empty if statement body - 10905208
@Entry
@Component
struct EmptyIfBody {
  @State condition: boolean = true;

  build() {
    Column() {
      // 空if块，触发10905208
      if (this.condition) {
      }
    }
  }
}

// Multiple root nodes - 10905210
@Entry
@Component
struct MultipleRootNodes {
  build() {
    Text('Node 1')
    Text('Node 2')
  }
}

// CustomDialog without controller - 10905211
@CustomDialog
struct DialogWithoutController {
  @State message: string = 'Dialog';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Struct inherits from class - 10905212
@Entry
@Component
struct StructInherits extends RegularClass {
  build() {
    Column() {
      Text('Test')
    }
  }
}

class RegularClass {
  name: string = 'class';
}

// Component with wrong child type - 10905220, 10905222
@Entry
@Component
struct WrongChildType {
  build() {
    Column() {
      // Image cannot have children - 10905222
      Image($r('app.media.icon')) {
        Text('Child of Image')
      }
      
      // Button with multiple children - 10905220
      Button() {
        Text('Child 1')
        Text('Child 2')
      }
    }
  }
}