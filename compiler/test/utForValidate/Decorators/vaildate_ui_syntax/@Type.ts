/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

exports.source = `
import { Type } from '@ohos.arkui.StateManagement';

class A {
  p: number = 1;
}

@Entry
@Component
struct AddLog {
  @Type(A) log: string = 'Hello Word!';

  build() {
    Row() {
      Column() {
        Text(this.log)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}

@Sendable
class C1 {
  @Type(A) onChange() {}
}

@Observed
class C2 {
  @Type(A) p: A = new A;
}

@ObservedV2
class C3 {
  @Type(A) onChange() {}
}
`