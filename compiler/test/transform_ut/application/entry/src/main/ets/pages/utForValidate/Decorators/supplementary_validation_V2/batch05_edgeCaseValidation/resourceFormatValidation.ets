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
 * Test: Resource reference format validation
 * Target: Invalid resource references with $r and $rawfile
 */

// Test 1: $r with invalid format (missing dots)
@Component
struct ResourceInvalidFormat {
  build() {
    Column() {
      Text($r('invalidformat'))
    }
  }
}

// Test 2: $r with unknown resource type
@Component
struct ResourceUnknownType {
  build() {
    Column() {
      Text($r('app.unknown.test'))
    }
  }
}

// Test 3: $r with unknown resource source
@Component
struct ResourceUnknownSource {
  build() {
    Column() {
      Text($r('unknown.string.test'))
    }
  }
}

// Test 4: $rawfile with invalid parameter format
@Component
struct RawfileInvalidFormat {
  build() {
    Column() {
      Image($rawfile('no_extension_file'))
    }
  }
}

// Test 5: $r with valid format (control case)
@Component
struct ResourceValidFormat {
  build() {
    Column() {
      Text($r('app.string.test'))
      Image($r('app.media.icon'))
    }
  }
}

// Test 6: Multiple invalid resources
@Component
struct MultipleInvalidResources {
  build() {
    Column() {
      Text($r('wrong.type.name'))
      Image($r('invalid'))
      Text($r('app.color.nonexistent'))
    }
  }
}

@Entry
@Component
struct TestResourceFormatValidation {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
