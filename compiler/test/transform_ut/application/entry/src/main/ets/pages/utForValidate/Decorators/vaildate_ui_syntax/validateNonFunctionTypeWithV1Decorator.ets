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
 * This test case is used to verify the V1 decorator cannot be applied to a Function-type variable in a struct.
 */
@Entry
@Component
struct Index {
  regular1: Function = buildFun;
  regular2: Function | number = 1;
  regular3: Function | string = 'regular';
  regular4: Function = this.add;
  regular5: boolean = false;
  regular6: string = '234';
  regular7: object = this.add;
  regular8: Function | boolean = true;
  regular9: Function | undefined = undefined;

  @State message1: string = 'Hello World';
  @State state2: Function = buildFun;
  @State state3: Function = this.add;
  @State state4: Function | string = this.add;
  @State state5: Function | boolean = buildFun;
  @State state6: Function | number = 10;
  @State state7: Function | null = buildFun;
  @State state8: Function | undefined = this.add;
  @State state9: object = this.add;
  @State state10: boolean = false;

  @Provide provide1: Function = this.add;
  @Provide provide2: Function | string = this.add;
  @Provide provide3: string = '123';
  @Provide provide4: object = buildFun;
  @Provide provide5: Function | number = 10;
  @Provide provide6: Function | boolean = true;
  @Provide provide7: Function = buildFun;
  @Provide provide8: boolean = false;
  @Provide provide9: Function | null = buildFun;
  @Provide provide10: Function | undefined = this.add;

  @Consume consume1: Function = buildFun;
  @Consume consume2: Function | number = 1;
  @Consume consume3: Function | string = 'consume';
  @Consume consume4: Function = this.add;
  @Consume consume5: string = '789';
  @Consume consume6: Function | boolean = false;
  @Consume consume7: boolean = false;
  @Consume consume8: Function | null = buildFun;
  @Consume consume9: Function | undefined = this.add;

  add(){
    this.message1 += '1';
  }

  build() {
    RelativeContainer() {
      Text(this.message1)
        .id('SecondHelloWorld')
        .onClick(() => {
          this.message1 = 'Welcome';
        })
      Com2({
        state2:this.state2,
        provide1:this.provide1,
        link1:this.consume1,
        link2:this.consume2,
        link3:this.consume3,
        link4:this.consume4,
        link5:this.consume5,
        link6:this.consume6,
        link7:this.consume7,
        link8:this.consume8,
        link9:this.consume9
      });
      DialogSample({
        link1:this.consume1,
        link2:this.consume2,
        link3:this.consume3,
        link4:this.consume4,
        link5:this.consume5,
        link6:this.consume6,
        link7:this.consume7,
        link8:this.consume8,
        link9:this.consume9
      });
      ComponentV2Sample();
    }
    .height('100%')
    .width('100%')
  }
}

@Builder function buildFun(){
}

@Component
struct Com2 {
  regular1: Function = buildFun;
  regular2: Function | number = 1;
  regular3: Function | string = 'regular';
  regular4: Function = this.add;
  regular5: boolean = false;
  regular6: string = '234';
  regular7: object = this.add;
  regular8: Function | boolean = true;
  regular9: Function | undefined = undefined;

  @State message1: string = 'Hello World';
  @State state2: Function = buildFun;
  @State state3: Function = this.add;
  @State state4: Function | string = this.add;
  @State state5: Function | boolean = buildFun;
  @State state6: Function | number = 10;
  @State state7: Function | null = buildFun;
  @State state8: Function | undefined = this.add;
  @State state9: object = this.add;
  @State state10: boolean = false;

  @Provide provide1: Function = this.add;
  @Provide provide2: Function | string = this.add;
  @Provide provide3: string = '123';
  @Provide provide4: object = buildFun;
  @Provide provide5: Function | number = 10;
  @Provide provide6: Function | boolean = true;
  @Provide provide7: Function = buildFun;
  @Provide provide8: boolean = false;
  @Provide provide9: Function | null = buildFun;
  @Provide provide10: Function | undefined = this.add;

  @Consume consume1: Function = buildFun;
  @Consume consume2: Function | number = 1;
  @Consume consume3: Function | string = 'consume';
  @Consume consume4: Function = this.add;
  @Consume consume5: string = '789';
  @Consume consume6: Function | boolean = false;
  @Consume consume7: boolean = false;
  @Consume consume8: Function | null = buildFun;
  @Consume consume9: Function | undefined = this.add;

  @Prop prop1: Function = buildFun;
  @Prop prop2: Function | number = 1;
  @Prop prop3: Function | string = 'prop';
  @Prop prop4: Function = this.add;
  @Prop prop5: string = '789';
  @Prop prop6: Function | boolean = false;
  @Prop prop7: boolean = false;
  @Prop prop8: Function | null = buildFun;
  @Prop prop9: Function | undefined = this.add;

  @Link link1: Function;
  @Link link2: Function | number;
  @Link link3: Function | string;
  @Link link4: Function;
  @Link link5: string;
  @Link link6: Function | boolean;
  @Link link7: boolean;
  @Link link8: Function | null;
  @Link link9: Function | undefined;

  @StorageProp('propA12') storageProp1: Function = buildFun;
  @StorageProp('propA12') storageProp2: Function | number = 1;
  @StorageProp('propA12') storageProp3: Function | string = 'StorageProp';
  @StorageProp('propA12') storageProp4: Function = this.add;
  @StorageProp('propA12') storageProp5: string = '789';
  @StorageProp('propA12') storageProp6: Function | boolean = false;
  @StorageProp('propA12') storageProp7: boolean = false;
  @StorageProp('propA12') storageProp8: Function | null = buildFun;
  @StorageProp('propA12') storageProp9: Function | undefined = this.add;

  @StorageLink('propA12') storageLink1: Function = buildFun;
  @StorageLink('propA12') storageLink2: Function | number = 1;
  @StorageLink('propA12') storageLink3: Function | string = 'StorageLink';
  @StorageLink('propA12') storageLink4: Function = this.add;
  @StorageLink('propA12') storageLink5: string = '789';
  @StorageLink('propA12') storageLink6: Function | boolean = false;
  @StorageLink('propA12') storageLink7: boolean = false;
  @StorageLink('propA12') storageLink8: Function | null = buildFun;
  @StorageLink('propA12') storageLink9: Function | undefined = this.add;

  @LocalStorageProp('propA13') localStorageProp1: Function = buildFun;
  @LocalStorageProp('propA13') localStorageProp2: Function | number = 1;
  @LocalStorageProp('propA13') localStorageProp3: Function | string = 'LocalStorageProp';
  @LocalStorageProp('propA13') localStorageProp4: Function = this.add;
  @LocalStorageProp('propA13') localStorageProp5: string = '789';
  @LocalStorageProp('propA13') localStorageProp6: Function | boolean = false;
  @LocalStorageProp('propA13') localStorageProp7: boolean = false;
  @LocalStorageProp('propA13') localStorageProp8: Function | null = buildFun;
  @LocalStorageProp('propA13') localStorageProp9: Function | undefined = this.add;

  @LocalStorageLink('propA13') localStorageLink1: Function = buildFun;
  @LocalStorageLink('propA13') localStorageLink2: Function | number = 1;
  @LocalStorageLink('propA13') localStorageLink3: Function | string = 'LocalStorageLink';
  @LocalStorageLink('propA13') localStorageLink4: Function = this.add;
  @LocalStorageLink('propA13') localStorageLink5: string = '789';
  @LocalStorageLink('propA13') localStorageLink6: Function | boolean = false;
  @LocalStorageLink('propA13') localStorageLink7: boolean = false;
  @LocalStorageLink('propA13') localStorageLink8: Function | null = buildFun;
  @LocalStorageLink('propA13') localStorageLink9: Function | undefined = this.add;

  add(){}

  onBuildChange(){}

  build() {
    RelativeContainer() {
      Text(this.message1.toString())
    }
    .height('100%')
    .width('100%')
  }
}

@CustomDialog
struct DialogSample {
  cont:CustomDialogController;

  regular1: Function = buildFun;
  regular2: Function | number = 1;
  regular3: Function | string = 'regular';
  regular4: Function = this.add;
  regular5: boolean = false;
  regular6: string = '234';
  regular7: object = this.add;
  regular8: Function | boolean = true;
  regular9: Function | undefined = undefined;

  @State message1: string = 'Hello World';
  @State state2: Function = buildFun;
  @State state3: Function = this.add;
  @State state4: Function | string = this.add;
  @State state5: Function | boolean = buildFun;
  @State state6: Function | number = 10;
  @State state7: Function | null = buildFun;
  @State state8: Function | undefined = this.add;
  @State state9: object = this.add;
  @State state10: boolean = false;

  @Provide provide1: Function = this.add;
  @Provide provide2: Function | string = this.add;
  @Provide provide3: string = '123';
  @Provide provide4: object = buildFun;
  @Provide provide5: Function | number = 10;
  @Provide provide6: Function | boolean = true;
  @Provide provide7: Function = buildFun;
  @Provide provide8: boolean = false;
  @Provide provide9: Function | null = buildFun;
  @Provide provide10: Function | undefined = this.add;

  @Consume consume1: Function = buildFun;
  @Consume consume2: Function | number = 1;
  @Consume consume3: Function | string = 'consume';
  @Consume consume4: Function = this.add;
  @Consume consume5: string = '789';
  @Consume consume6: Function | boolean = false;
  @Consume consume7: boolean = false;
  @Consume consume8: Function | null = buildFun;
  @Consume consume9: Function | undefined = this.add;

  @Prop prop1: Function = buildFun;
  @Prop prop2: Function | number = 1;
  @Prop prop3: Function | string = 'prop';
  @Prop prop4: Function = this.add;
  @Prop prop5: string = '789';
  @Prop prop6: Function | boolean = false;
  @Prop prop7: boolean = false;
  @Prop prop8: Function | null = buildFun;
  @Prop prop9: Function | undefined = this.add;

  @Link link1: Function;
  @Link link2: Function | number;
  @Link link3: Function | string;
  @Link link4: Function;
  @Link link5: string;
  @Link link6: Function | boolean;
  @Link link7: boolean;
  @Link link8: Function | null;
  @Link link9: Function | undefined;

  @StorageProp('propA12') storageProp1: Function = buildFun;
  @StorageProp('propA12') storageProp2: Function | number = 1;
  @StorageProp('propA12') storageProp3: Function | string = 'StorageProp';
  @StorageProp('propA12') storageProp4: Function = this.add;
  @StorageProp('propA12') storageProp5: string = '789';
  @StorageProp('propA12') storageProp6: Function | boolean = false;
  @StorageProp('propA12') storageProp7: boolean = false;
  @StorageProp('propA12') storageProp8: Function | null = buildFun;
  @StorageProp('propA12') storageProp9: Function | undefined = this.add;

  @StorageLink('propA12') storageLink1: Function = buildFun;
  @StorageLink('propA12') storageLink2: Function | number = 1;
  @StorageLink('propA12') storageLink3: Function | string = 'StorageLink';
  @StorageLink('propA12') storageLink4: Function = this.add;
  @StorageLink('propA12') storageLink5: string = '789';
  @StorageLink('propA12') storageLink6: Function | boolean = false;
  @StorageLink('propA12') storageLink7: boolean = false;
  @StorageLink('propA12') storageLink8: Function | null = buildFun;
  @StorageLink('propA12') storageLink9: Function | undefined = this.add;

  @LocalStorageProp('propA13') localStorageProp1: Function = buildFun;
  @LocalStorageProp('propA13') localStorageProp2: Function | number = 1;
  @LocalStorageProp('propA13') localStorageProp3: Function | string = 'LocalStorageProp';
  @LocalStorageProp('propA13') localStorageProp4: Function = this.add;
  @LocalStorageProp('propA13') localStorageProp5: string = '789';
  @LocalStorageProp('propA13') localStorageProp6: Function | boolean = false;
  @LocalStorageProp('propA13') localStorageProp7: boolean = false;
  @LocalStorageProp('propA13') localStorageProp8: Function | null = buildFun;
  @LocalStorageProp('propA13') localStorageProp9: Function | undefined = this.add;

  @LocalStorageLink('propA13') localStorageLink1: Function = buildFun;
  @LocalStorageLink('propA13') localStorageLink2: Function | number = 1;
  @LocalStorageLink('propA13') localStorageLink3: Function | string = 'LocalStorageProp';
  @LocalStorageLink('propA13') localStorageLink4: Function = this.add;
  @LocalStorageLink('propA13') localStorageLink5: string = '789';
  @LocalStorageLink('propA13') localStorageLink6: Function | boolean = false;
  @LocalStorageLink('propA13') localStorageLink7: boolean = false;
  @LocalStorageLink('propA13') localStorageLink8: Function | null = buildFun;
  @LocalStorageLink('propA13') localStorageLink9: Function | undefined = this.add;

  add(){}
  onBuildChange(){}

  build() {}
}

class Test1{
  regular1: Function = buildFun;
  regular2: Function  |number = 10;
  regular3: Function | string = 'regular3';
  regular4: object = buildFun;

  @Track track1: Function = buildFun;
  @Track track2: Function|number = buildFun;
  @Track track3: Function|string = 'track3';
  @Track track4: object = buildFun;

  constructor(regular1:Function, regular2:Function|number, regular3:Function|string, regular4:object) {
    this.regular1 = regular1;
    this.regular2 = regular2;
    this.regular3 = regular3;
    this.regular4 = regular4;
  }
}

@ComponentV2
struct ComponentV2Sample {
  regular1: Function = buildFun;
  regular3: Function = this.add;

  @Local local1: Function = this.add;
  @Local local2: Function = buildFun;

  @Provider() provider1: Function = buildFun;
  @Provider() provider2: Function = this.add;

  @Consumer() consumer1: Function = buildFun;
  @Consumer() consumer2: Function = this.add;

  @Param param1: Function = buildFun;
  @Param param2: Function = this.add;

  @Event event1: Function = buildFun;
  @Event event2: Function = this.add;

  add(){}
  build() {}
}