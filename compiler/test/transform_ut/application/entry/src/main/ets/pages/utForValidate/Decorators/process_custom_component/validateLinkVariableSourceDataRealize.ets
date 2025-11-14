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
 * the '@Link' variable is match the '@Link' variable's declared type. (Realize-situation)
 */

interface dataI{}

class Data {
  aa: Data1 = new Data1();
}

class Data1 implements dataI{
  bb: boolean = true;
}

class Data2 implements dataI{
  bb: boolean = true;
}

@Entry
@Component
struct Index {
  @State data: Data = new Data();

  build() {
    Column(){
      Text('实现场景')
      Child({link: this.data.aa}) // crash

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