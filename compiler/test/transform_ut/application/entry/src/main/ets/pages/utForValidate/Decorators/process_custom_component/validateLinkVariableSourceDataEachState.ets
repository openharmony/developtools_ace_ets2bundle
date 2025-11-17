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

@Observed
class Data1 {
  bb: boolean = true;
}

@Observed
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

@Entry
@Component
struct Index {
  @State state_data: Data = new Data();
  @State state_data1: Data1 = new Data1();
  @State state_dataArr: Data[] = new Array(new Data());
  @State state_data1Arr: Data1[] = new Array(new Data1());
  @State state_bool: boolean = true;
  @State state_boolArr: boolean[] = new Array(true);

  @Provide consume_data: Data = new Data();
  @Provide consume_data1: Data1 = new Data1();
  @Provide consume_dataArr: Data[] = new Array(new Data());
  @Provide consume_data1Arr: Data1[] = new Array(new Data1());
  @Provide consume_bool: boolean = true;
  @Provide consume_boolArr: boolean[] = new Array(true);

  build() {
    Column(){
      Parent({
        link_data: this.state_data,
        link_data1: this.state_data1,
        link_dataArr: this.state_dataArr,
        link_data1Arr: this.state_data1Arr,
        link_bool: this.state_bool,
        link_boolArr: this.state_boolArr,
        objectLink_data: this.state_data,
        objectLink_data1: this.state_data1,
        objectLink_dataArr: this.state_dataArr,
        objectLink_data1Arr: this.state_data1Arr,
        objectLink_boolArr: this.state_boolArr,
      })
    }
  }
}

@Component
struct Parent {
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

  @Link link_data: Data;
  @Link link_data1: Data1;
  @Link link_dataArr: Data[];
  @Link link_data1Arr: Data1[];
  @Link link_bool: boolean;
  @Link link_boolArr: boolean[];

  @ObjectLink objectLink_data: Data;
  @ObjectLink objectLink_data1: Data1;
  @ObjectLink objectLink_dataArr: Data[];
  @ObjectLink objectLink_data1Arr: Data1[];
  @ObjectLink objectLink_boolArr: boolean[];

  @Consume consume_data: Data;
  @Consume consume_data1: Data1;
  @Consume consume_dataArr: Data[];
  @Consume consume_data1Arr: Data1[];
  @Consume consume_bool: boolean;
  @Consume consume_boolArr: boolean[];

  @Prop prop_data: Data = new Data();
  @Prop prop_data1: Data1 = new Data1();
  @Prop prop_dataArr: Data[] = [new Data()];
  @Prop prop_data1Arr: Data1[] = [new Data1()];
  @Prop prop_bool: boolean = true;
  @Prop prop_boolArr: boolean[] = [true];

  @Provide provide_data: Data = new Data();
  @Provide provide_data1: Data1 = new Data1();
  @Provide provide_dataArr: Data[] = new Array(new Data());
  @Provide provide_data1Arr: Data1[] = new Array(new Data1());
  @Provide provide_bool: boolean = true;
  @Provide provide_boolArr: boolean[] = new Array(true);

  @LocalStorageLink('localStorageLink_data') localStorageLink_data: Data = new Data();
  @LocalStorageLink('localStorageLink_data1') localStorageLink_data1: Data1 = new Data1();
  @LocalStorageLink('localStorageLink_dataArr') localStorageLink_dataArr: Data[] = new Array(new Data());
  @LocalStorageLink('localStorageLink_data1Arr') localStorageLink_data1Arr: Data1[] = new Array(new Data1());
  @LocalStorageLink('localStorageLink_bool') localStorageLink_bool: boolean = true;
  @LocalStorageLink('localStorageLink_boolArr') localStorageLink_boolArr: boolean[] = new Array(true);

  @LocalStorageProp('localStorageProp_data') localStorageProp_data: Data = new Data();
  @LocalStorageProp('localStorageProp_data1') localStorageProp_data1: Data1 = new Data1();
  @LocalStorageProp('localStorageProp_dataArr') localStorageProp_dataArr: Data[] = new Array(new Data());
  @LocalStorageProp('localStorageProp_data1Arr') localStorageProp_data1Arr: Data1[] = new Array(new Data1());
  @LocalStorageProp('localStorageProp_bool') localStorageProp_bool: boolean = true;
  @LocalStorageProp('localStorageProp_boolArr') localStorageProp_boolArr: boolean[] = new Array(true);

  @StorageLink('storageLink_data') storageLink_data: Data = new Data();
  @StorageLink('storageLink_data1') storageLink_data1: Data1 = new Data1();
  @StorageLink('storageLink_dataArr') storageLink_dataArr: Data[] = new Array(new Data());
  @StorageLink('storageLink_data1Arr') storageLink_data1Arr: Data1[] = new Array(new Data1());
  @StorageLink('storageLink_bool') storageLink_bool: boolean = true;
  @StorageLink('storageLink_boolArr') storageLink_boolArr: boolean[] = new Array(true);

  @StorageProp('data') storageProp_data: Data = new Data();
  @StorageProp('data1') storageProp_data1: Data1 = new Data1();
  @StorageProp('dataArr') storageProp_dataArr: Data[] = new Array(new Data());
  @StorageProp('data1Arr') storageProp_data1Arr: Data1[] = new Array(new Data1());
  @StorageProp('bool') storageProp_bool: boolean = true;
  @StorageProp('boolArr') storageProp_boolArr: boolean[] = new Array(true);

  build() {
    Column(){
      Text('State -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.state_data1, link1: this.state_bool}) // 正例
      Child({link: $state_data1, link1: $state_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.state_data.aa1, link1: this.state_data.aa})  // 源数据类型不一致，需报错
      Child({link: this.state_dataArr[0].aa1, link1: this.state_dataArr[0].aa})  // 源数据类型不一致，需报错
      Child({link: this.state_data1Arr[0], link1: this.state_boolArr[0]})  // 源数据类型不一致，需报错
      Child({link: this.state_data_initFormState.aa1, link1: this.state_data_initFormState.aa})  // crash，需报错
      Child({link: this.state_data1Arr_initFormState[0], link1: this.state_boolArr_initFormState[0]})  // crash，需报错
      Child({link: this.state_data2.aa1Arr[0], link1: this.state_data2.aaArr[0]})  // crash，需报错
      Child({link: this.state_data2Arr[0].aa1Arr[0], link1: this.state_data2Arr[0].aaArr[0]})  // crash，需报错
      // 类型不一致
      Child({link: this.state_bool, link1: this.state_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.state_data.aa, link1: this.state_data.aa1}) // 同时报错

      Text('Link -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.link_data1, link1: this.link_bool}) // 正例
      Child({link: $link_data1, link1: $link_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({ link: this.link_data.aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.link_dataArr[0].aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.link_data1Arr[0], link1: this.state_bool }) // 源数据类型不一致，需报错
      // 类型不一致
      Child({ link: this.link_bool, link1: this.link_data1 }) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({ link: this.link_data.aa, link1: this.state_bool }) // 同时报错

      Text('ObjectLink -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.objectLink_data1, link1: this.link_bool}) // 正例
      Child({link: $objectLink_data1, link1: $link_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({ link: this.objectLink_data.aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.objectLink_dataArr[0].aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.objectLink_data1Arr[0], link1: this.state_bool }) // 源数据类型不一致，需报错
      // 类型不一致
      Child({ link: this.link_bool, link1: this.objectLink_data1 }) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({ link: this.objectLink_data.aa, link1: this.state_bool }) // 同时报错

      Text('Consume -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.consume_data1, link1: this.consume_bool}) // 正例
      Child({link: $consume_data1, link1: $consume_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({ link: this.consume_data.aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.consume_dataArr[0].aa1, link1: this.state_bool }) // 源数据类型不一致，需报错
      Child({ link: this.consume_data1Arr[0], link1: this.state_bool }) // 源数据类型不一致，需报错
      // 类型不一致
      Child({ link: this.consume_bool, link1: this.consume_data1 }) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({ link: this.consume_data.aa, link1: this.state_bool }) // 同时报错

      Text('Prop -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.prop_data1, link1: this.prop_bool}) // 正例
      Child({link: $prop_data1, link1: $prop_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.prop_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.prop_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.prop_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.prop_bool, link1: this.prop_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.prop_data.aa, link1: this.state_bool}) // 同时报错

      Text('Provide -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.provide_data1, link1: this.provide_bool}) // 正例
      Child({link: $provide_data1, link1: $provide_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.provide_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.provide_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.provide_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.provide_bool, link1: this.provide_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.provide_data.aa, link1: this.state_bool}) // 同时报错

      Text('LocalStorageLink -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.localStorageLink_data1, link1: this.localStorageLink_bool}) // 正例
      Child({link: $localStorageLink_data1, link1: $localStorageLink_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.localStorageLink_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.localStorageLink_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.localStorageLink_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.localStorageLink_bool, link1: this.localStorageLink_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.localStorageLink_data.aa, link1: this.state_bool}) // 同时报错

      Text('LocalStorageProp -> Link')
      //类型一致，源数据类型一致
      Child({link: this.localStorageProp_data1, link1: this.localStorageProp_bool}) // 正例
      Child({link: $localStorageProp_data1, link1: $localStorageProp_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.localStorageProp_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.localStorageProp_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.localStorageProp_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.localStorageProp_bool, link1: this.localStorageProp_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.localStorageProp_data.aa, link1: this.state_bool}) // 同时报错

      Text('StorageLink -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.storageLink_data1, link1: this.storageLink_bool}) // 正例
      Child({link: $storageLink_data1, link1: $storageLink_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.storageLink_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.storageLink_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.storageLink_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.storageLink_bool, link1: this.storageLink_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.storageLink_data.aa, link1: this.state_bool}) // 同时报错

      Text('StorageProp -> Link')
      // 类型一致，源数据类型一致
      Child({link: this.storageProp_data1, link1: this.storageProp_bool}) // 正例
      Child({link: $storageProp_data1, link1: $storageProp_bool}) // 正例
      // 类型一致，源数据类型不一致
      Child({link: this.storageProp_data.aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.storageProp_dataArr[0].aa1, link1: this.state_bool})  // 源数据类型不一致，需报错
      Child({link: this.storageProp_data1Arr[0], link1: this.state_bool})  // 源数据类型不一致，需报错
      // 类型不一致
      Child({link: this.storageProp_bool, link1: this.storageProp_data1}) // 不做额外处理
      // 类型不一致，且源数据类型不一致
      Child({link: this.storageProp_data.aa, link1: this.state_bool}) // 同时报错
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