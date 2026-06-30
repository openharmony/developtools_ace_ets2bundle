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
 * Member with multiple built-in decorators
 */

@Component
struct MultiDecoratorOne {
  @State @Prop dualDec: string = "test";
  build() { Column() { Text(this.dualDec) } }
}
@Component
struct MultiDecoratorTwo {
  @State @Link stateLink: number;
  build() { Column() { Text("multi") } }
}
@ComponentV2
struct MultiDecoratorV2 {
  @Param @Once onceParam: string = "test";
  build() { Column() { Text("multi v2") } }
}

@Entry
@Component
struct MultiDecoratorMemberEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
