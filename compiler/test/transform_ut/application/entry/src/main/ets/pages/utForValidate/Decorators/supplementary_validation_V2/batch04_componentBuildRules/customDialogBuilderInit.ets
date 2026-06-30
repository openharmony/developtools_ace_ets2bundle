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
 * Test: CustomDialogController builder initialization
 * Target error codes: 10905335
 *
 * CustomDialogController requires the builder property to be
 * initialized with a @CustomDialog component.
 */

// Test 1: CustomDialogController with undefined builder
@CustomDialog
struct MyDialog {
  build() {
    Column() {
      Text('Dialog Content')
    }
  }
}

@Component
struct DialogWithUndefinedBuilder {
  dialogController: CustomDialogController = new CustomDialogController({
    builder: undefined
  });

  build() {
    Column() {
      Text('Has undefined builder')
    }
  }
}

// Test 2: CustomDialogController with null builder
@Component
struct DialogWithNullBuilder {
  dialogController: CustomDialogController = new CustomDialogController({
    builder: null
  });

  build() {
    Column() {
      Text('Has null builder')
    }
  }
}

// Test 3: CustomDialogController with non-dialog builder
@Component
struct NotADialog {
  build() {
    Column() {
      Text('Not a dialog')
    }
  }
}

@Component
struct DialogWithWrongBuilder {
  dialogController: CustomDialogController = new CustomDialogController({
    builder: NotADialog
  });

  build() {
    Column() {
      Text('Wrong builder type')
    }
  }
}

// Test 4: CustomDialogController with correct builder (control case)
@Component
struct DialogWithCorrectBuilder {
  dialogController: CustomDialogController = new CustomDialogController({
    builder: MyDialog
  });

  build() {
    Column() {
      Text('Correct builder')
    }
  }
}

@Entry
@Component
struct TestCustomDialogBuilder {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
