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
 * the '@Link' variable is match the '@Link' variable's declared type.
 */
@Observed
class Data1 {
  bb: boolean = true;
}

@Observed
class Data {
  aa: boolean = true;
  aa1: Data1 = new Data1();
}

let data111: Data1 = new Data1();
let bool111: boolean = true;

@Entry
@Component
struct Index {
  @State state_data: Data = new Data();
  @State state_data1: Data1 = new Data1();
  @State state_dataArr: Data[] = [new Data()];
  @State state_data1Arr: Data1[] = [new Data1()];
  @State state_bool: boolean = true;
  @State state_boolArr: boolean[] = [true];
  data1: Data1 = new Data1();
  bool: boolean = true;

  build() {
    Column(){
      Text('State -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.state_data1, link1: this.state_bool}) // 正例
      Child({link: new Data1(), link1: true})  // 正例
      Child({link: $state_data1, link1: $state_bool}) // 正例
      Child({link: data111, link1: bool111})  // 其他语法规则已校验
      Child({link: this.data1, link1: this.bool})  // 其他语法规则已校验
      // 类型一致，源数据类型不一致
      Child({link: this.state_data.aa1, link1: this.state_data.aa})  // 源数据类型不一致，需报错
      Child({link: this.state_dataArr[0].aa1, link1: this.state_dataArr[0].aa})  // 源数据类型不一致，需报错
      Child({link: this.state_data1Arr[0], link1: this.state_boolArr[0]})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.state_bool, link1: this.state_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.state_data.aa, link1: this.state_data.aa1}) // 同时报错
    }
  }
}

@Component
struct Child {
  @Link link: Data1;
  @Link link1: boolean;

  build() {
    Text(`${this.link.bb} | ${this.link1}`)
  }
}
