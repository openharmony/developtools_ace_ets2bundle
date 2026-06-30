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
 * @Watch decorator validation patterns
 */

@Component
struct WatchOnRegular {
  regularVar: string = "test";
  @Watch("onChange") @State stateVar: number = 0;
  onChange() { console.log("changed"); }
  build() { Column() { Text(this.stateVar.toString()) } }
}
@Component
struct WatchWithNumber {
  @State count: number = 0;
  @Watch(123) onCountChange() { console.log("x"); }
  build() { Column() { Text(this.count.toString()) } }
}
@Component
struct WatchOnNonMethod {
  @State value: number = 0;
  @Watch("nonExistent") valueState: number = 0;
  build() { Column() { Text(this.value.toString()) } }
}

@Entry
@Component
struct WatchValidationEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
