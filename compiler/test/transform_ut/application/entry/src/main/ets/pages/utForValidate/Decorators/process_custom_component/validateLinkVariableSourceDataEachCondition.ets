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
 * This test case is used to verify whether the type of the parent component's state variable initializing 
 * the '@Link' variable is match the '@Link' variable's declared type.
 */

/**
 * 嵌套场景
 */
class Data1 {
  bb: boolean = true;
}

class Data {
  aa: boolean = true;
  aa1: Data1 = new Data1();
}

class Data2 {
  aaArr: boolean[] = [true];
  aa1Arr: Data1[] = [new Data1()];
}

class Data3 {
  aa: Data = new Data();
}

/**
 * 超多层嵌套（10层以上）
 */
class Data10 {
  bb: boolean = true;
}

class Data11 {
  aa: Data10 = new Data10();
}

class Data12 {
  aa1: Data11 = new Data11();
}

class Data13 {
  aa2: Data12 = new Data12();
}

class Data14 {
  aa3: Data13 = new Data13();
}

class Data15 {
  aa4: Data14 = new Data14();
}

class Data16 {
  aa5: Data15 = new Data15();
}

class Data17 {
  aa6: Data16 = new Data16();
}

class Data18 {
  aa7: Data17 = new Data17();
}

class Data19 {
  aa8: Data18 = new Data18();
}

class Data20 {
  aa9: Data19 = new Data19();
}

class Data21 {
  aa10: Data20 = new Data20();
}

class Data22 {
  aa11: Data21 = new Data21();
}

/**
 * Observed、Track场景
 */
interface dataI{}

class Data30 {
  aa: Data31 = new Data31();
}

@Observed
class Data31 implements dataI{
  bb: boolean = true;
}

class Data32 implements dataI{
  bb: boolean = true;
}

@Observed
class Data40 {
  @Track aa: Data41 = new Data41();
}

class Data41 implements dataI{
  bb: boolean = true;
}

class Data42 implements dataI{
  bb: boolean = true;
}

@Observed
class Data50 {
  aa: Data51 = new Data51();
}

class Data51 implements dataI{
  bb: boolean = true;
}

class Data52 implements dataI{
  bb: boolean = true;
}

/**
 * 继承场景
 */
class Data60 {
  aa: Data61 = new Data61();
  bb: boolean = true;
}

class Data61 {
  bb: boolean = true;
}

class Data62 extends Data61{

}

/**
 * 实现场景
 */
interface dataI1{}

class Data70 {
  aa: Data71 = new Data71();
}

class Data71 implements dataI1{
  bb: boolean = true;
}

class Data72 implements dataI1{
  bb: boolean = true;
}

/**
 * global场景
 */
let data_global: Data = new Data();
let data1_global: Data1 = new Data1();
let data3_global: Data3 = new Data3();
let bool_global: boolean = true;

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
  @State state_data_initFormState: Data = {aa1: this.state_data1, aa: this.state_bool};
  @State state_data1Arr_initFormState: Data1[] = [this.state_data1];
  @State state_boolArr_initFormState: boolean[] = [this.state_bool];
  @State state_data2: Data2 = new Data2();
  @State state_data2Arr: Data2[] = [this.state_data2];
  @State flag: boolean = false;
  @State state_data1_copy: Data1 = new Data1();
  @State state_data22: Data22 = new Data22();

  @State data30: Data30 = new Data30();
  @State data40: Data40 = new Data40();
  @State data50: Data50 = new Data50();

  @State data61: Data61 = new Data61();
  @State data62: Data61 = new Data62();
  @State data60: Data60 = { aa:this.data61,bb:true };

  @State data70: Data70 = new Data70();

  build() {
    Column(){
      Text('State -> Link')
      // 类型一致，源数据类型一致，符合语法规则
      Child({link: this.state_data1, link1: this.state_bool}) // 正例
      Child({link: $state_data1, link1: $state_bool}) // 正例
      // 类型一致，源数据类型一致，但是不符合其他语法规则
      Child({link: this.data1, link1: this.bool})  // 其他语法规则已校验
      // 类型一致，源数据类型不一致
      Child({link: this.state_data.aa1, link1: this.state_bool})  // crash，需报错
      Child({link: this.state_dataArr[0].aa1, link1: this.state_bool})  // crash，需报错
      Child({link: this.state_data1Arr[0], link1: this.state_bool})  // crash，需报错
      Child({link: this.state_data_initFormState.aa1, link1: this.state_bool})  // crash，需报错
      Child({link: this.state_data1Arr_initFormState[0], link1: this.state_bool})  // crash，需报错
      Child({link: this.state_data2.aa1Arr[0], link1: this.state_bool})  // crash，需报错
      Child({link: this.state_data2Arr[0].aa1Arr[0], link1: this.state_bool})  // crash，需报错
      // 类型不一致
      Child({link: this.state_bool, link1: this.state_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.state_data.aa, link1: this.state_data.aa1}) // 同时报错

      // 超多层嵌套
      Child({link: this.state_data22.aa21.aa20.aa19.aa18.aa17.aa16.aa15.aa14.aa13.aa12.aa11.aa10, link1: this.state_bool})

      // @Observed @Track
      Child30({link: this.data30.aa})  // crash，已拦截
      Child40({link: this.data40.aa})  // crash，已拦截
      Child50({link: this.data50.aa})  // crash，已拦截

      // 继承场景
      Child60({link: this.data60.aa})  // crash，已拦截
      Child60({link: this.data61})  // 正常运行，无需拦截
      Child60({link: this.data62})  // 正常运行，无需拦截

      // 实现场景
      Child70({link: this.data70.aa})  // crash，已拦截

      // Global
      Child({link: data1_global, link1: bool_global})  // 非this.开头的父子组件传参。不进行校验
      Child({link: new Data1(), link1: true}) // 非this.开头的父子组件传参。不进行校验
      Child({link: data_global.aa1, link1: this.state_bool})  // 非this.开头的父子组件传参。不进行校验
      Child({link: data3_global.aa.aa1, link1: this.state_bool})  // 非this.开头的父子组件传参。不进行校验

      // !?场景
      Child({link: this.state_data!.aa1!, link1: this.state_bool})  // crash，已拦截
      Child({link: this.state_data?.aa1, link1: this.state_bool})  // crash，已拦截
      Child({link: this.state_data?.aa1!, link1: this.state_bool})  // crash，已拦截
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

@Component
struct Child30 {
  @Link link: Data32;

  build() {
    Text(`${this.link.bb} `)
  }
}

@Component
struct Child40 {
  @Link link: Data42;

  build() {
    Text(`${this.link.bb} `)
  }
}

@Component
struct Child50 {
  @Link link: Data52;

  build() {
    Text(`${this.link.bb} `)
  }
}

@Component
struct Child60 {
  @Link link: Data62;

  build() {
    Text(`${this.link.bb} `)
  }
}

@Component
struct Child70 {
  @Link link: Data72;

  build() {
    Text(`${this.link.bb} `)
  }
}