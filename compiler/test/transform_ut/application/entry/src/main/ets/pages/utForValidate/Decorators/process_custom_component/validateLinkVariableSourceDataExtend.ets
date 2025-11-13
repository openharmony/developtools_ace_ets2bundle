/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
 * This test case is used to verify whether the type of the parent component's state variable initializing 
 * the '@Link' variable is match the '@Link' variable's declared type. (Extend-situation)
 */

 class Data {
  aa: Data1 = new Data1();
  bb: boolean = true;
}

class Data1 {
  bb: boolean = true;
}

class Data2 extends Data1 {
}

@Entry
@Component
struct Index {
  @State data1: Data1 = new Data1();
  @State data12: Data1 = new Data2();
  @State data: Data = { aa: this.data1, bb: true };

  build() {
    Column() {
      Text('继承场景')
      Child({ link: this.data.aa }) // crash
      Child({ link: this.data1 }) // 正常运行，无需拦截
      Child({ link: this.data12 }) // 正常运行，无需拦截
    }
  }
}

@Component
struct Child {
  @Link link: Data2;

  build() {
    Text(`${this.link.bb} `)
  }
}