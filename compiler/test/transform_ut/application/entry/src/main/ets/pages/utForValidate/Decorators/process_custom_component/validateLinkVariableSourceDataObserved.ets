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
 * the '@Link' variable is match the '@Link' variable's declared type. (Observed-situation)
 */

interface dataI{}

class Data {
  aa: Data1 = new Data1();
}
@Observed
class Data1 implements dataI{
  bb: boolean = true;
}
class Data2 implements dataI{
  bb: boolean = true;
}

@Observed
class Data10 {
  @Track aa: Data11 = new Data11();
}
class Data11 implements dataI{
  bb: boolean = true;
}
class Data12 implements dataI{
  bb: boolean = true;
}

@Observed
class Data20 {
  aa: Data21 = new Data21();
}
class Data21 implements dataI{
  bb: boolean = true;
}
class Data22 implements dataI{
  bb: boolean = true;
}

@Entry
@Component
struct Index {
  @State data: Data = new Data();
  @State data10: Data10 = new Data10();
  @State data20: Data20 = new Data20();

  build() {
    Column(){
      Text('@observed @Track')
      Child({link: this.data.aa}) // crash
      Child10({link: this.data10.aa}) // crash
      Child20({link: this.data20.aa}) // crash
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

@Component
struct Child10 {
  @Link link: Data12;

  build() {
    Text(`${this.link.bb} `)
  }
}

@Component
struct Child20 {
  @Link link: Data22;

  build() {
    Text(`${this.link.bb} `)
  }
}