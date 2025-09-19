/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

/*
 * This test case is used to verify the compilation results of different reuseIds.
 */
function getReuseId(boo: boolean): string {
  if (boo) {
    return "reuseId One";
  }
  return "reuseId Two";
}

@Entry
@ComponentV2
struct ParentOne {
  @Local message: string = 'Hello World';

  localId(): string {
    return "local reuseId";
  }

  build() {
    Column() {
      ReuseV2Child2().reuse({ reuseId: ()=> "idOne" })
      ReuseV2Child2().reuse({ reuseId: ()=> this.message })
      ReuseV2Child2().reuse({ reuseId: ()=> getReuseId(true) })
      ReuseV2Child2().reuse({ reuseId: ()=> { return "idOne" } })
      ReuseV2Child2().reuse({ reuseId: ()=> { return this.localId() } })
    }
  }
}

@ReusableV2
@ComponentV2
struct ReuseV2Child2 {
  build() {}
}
