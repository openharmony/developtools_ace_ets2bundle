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
  regular2: Function|number = 1;
  regular22: Function|string = 'regular';
  regular3: Function = this.add;
  regular4: boolean = false;
  regular5: string = '234';
  regular6: (Function) = buildFun;
  regular7: (Function | number) = 7;
  regular8: (Function | string) = 'regular';
  regular9: (string) = '234';
  regular10: () => void = buildFun;
  regular11: (() => void | number) = this.add;
  regular12: () => void | number | string = buildFun;
  regular13: (a:number) => void | number | string = this.add;
  regular14: (()=>void | number) | number = 1;

  @State state22: (Function) = buildFun;
  @State state23: ((Function)) = this.add;
  @State state24: (Function | (string)) = '24';
  @State state25: (Function | boolean) = buildFun;
  @State state26: ((((Function) | number))) = 10;
  @State state27: ((((Function | null)))) = buildFun;
  @State state28: ((Function | undefined)) = this.add;
  @State state29: (object) = this.add;
  @State state30: ((boolean)) = false;

  @State state16: (() => void) = buildFun;
  @State state17: ((() => void | number)) = this.add;
  @State state18: (() => void | (number | string)) = buildFun;
  @State state19: ((a:number) => void | number | string )= this.add;
  @State state20: ((()=>void | number) | number) = 1;
  @State state21: (((()=>void | number) | string)) = '21';

  @Provide provide22: (Function) = buildFun;
  @Provide provide23: ((Function)) = this.add;
  @Provide provide24: (Function | (string)) = '24';
  @Provide provide25: (Function | boolean) = buildFun;
  @Provide provide26: ((((Function) | number))) = 10;
  @Provide provide27: ((((Function | null)))) = buildFun;
  @Provide provide28: ((Function | undefined)) = this.add;
  @Provide provide29: (object) = this.add;
  @Provide provide30: ((boolean)) = false;

  @Provide provide16: (() => void) = buildFun;
  @Provide provide17: ((() => void | number)) = this.add;
  @Provide provide18: (() => void | (number | string)) = buildFun;
  @Provide provide19: ((a:number) => void | number | string )= this.add;
  @Provide provide20: ((()=>void | number) | number) = 1;
  @Provide provide21: (((()=>void | number) | string)) = '21';

  @State message: number = 1;
  @State message1: Function = this.add;
  @State message11: Function | number = this.add;
  @State message1111: Object = this.add;
  @State message1112: string = '456';

  message111: Function = this.add;

  func1: Function = this.add;

  @Provide func4: Function = this.add;
  @Provide func5: Function|string = this.add;
  @Provide func6: string = '123';
  @Provide func7: object = buildFun;
  @Provide func8: Function | number = this.add;

  @Consume builder133: Function = buildFun;
  @Consume builder14: Function|number = 1;
  @Consume builder144: Function|string = 'consume';
  @Consume builder155: Function = this.add;
  @Consume builder156: string = '789';

  add() {}

  onBuildChange(){}

  build() {
    RelativeContainer() {
      Text(this.message.toString())
      Com2({func3: this.message1});
    }
    .height('100%')
    .width('100%')
  }
}

@Builder function buildFun(){}

@Component
struct Com2 {
  @State message2: number = 1;
  @State message22: string = '555';
  @Prop func: Function | number = 1;
  @Prop @Watch('onBuildChange') builder1: Function = buildFun;

  @Prop builder4: Function|boolean = buildFun;
  @Prop builder555: Function|number = 1;
  @Prop builder55: Function|string = 'prop';
  @Prop builder66: Function|undefined = this.add;
  @Prop builder67: string = '888';

  @Link func3: Function;
  @Consume func4: Function = this.add;
  @StorageProp('propA12') builder5: Function = buildFun;
  @StorageLink('propA12') builder6: Function = buildFun;
  @LocalStorageLink('propA') storageLink4: Function = this.add;
  @LocalStorageProp('propA13') storageProp33: Function = this.add;

  regular1: Function = buildFun;
  regular2: Function|number = 1;
  regular4: Function|string = 'regular';
  regular3: Function = this.add;

  @State func1: Function|undefined=this.add;
  @State func2: Function|number=3;
  @State func22: Function|string='3';

  @Prop func5: Function|number;
  @Prop func55: Function|string;
  @Prop func6: Function|undefined=buildFun;

  @Provide func10: Function|undefined=this.add;
  @Provide func11: Function|number =11;
  @Provide func111: Function|string ='11';
  @Provide func12: Function|undefined=buildFun

  @Consume func13: Function|undefined=this.add;
  @Consume func14: Function|number;
  @Consume func144: Function|string;
  @Consume func15: Function|undefined=buildFun

  @StorageProp('') storageProp1: Function|undefined = buildFun;
  @StorageProp('') storageProp2: Function|number = 1;
  @StorageProp('') storageProp22: Function|string = 'storageProp';
  @StorageProp('') storageProp3: Function|undefined = this.add;

  @State message :string='1'

  regular11: Function = buildFun;
  regular21: Function|number = 1;
  regular22: Function|string = 'regular';
  regular31: Function = this.add;

  @State func31: Function|undefined=this.add;
  @State func21: Function|number=2;
  @State func23: Function|string='state';
  @State func34: Function|undefined=buildFun;

  @Prop func44: Function|undefined=this.add;
  @Prop func56: Function|number;
  @Prop func57: Function|string;
  @Prop func67: Function|undefined

  @State message23: string = 'son:cxx';

  @State message5: string = 'Hello';

  @Prop message3: string = 'Hello';

  @Provide func100: Function|undefined=this.add;
  @Provide func110: Function|number=11;
  @Provide func112: Function|string='11';
  @Provide func123: Function|undefined=buildFun

  @Consume func134: Function|undefined=this.add;
  @Consume func145: Function|number;
  @Consume func146: Function|string;
  @Consume func156: Function|undefined

  add(){}

  onBuildChange(){}

  build() {
    RelativeContainer() {
      Text(this.message2.toString())
    }
    .height('100%')
    .width('100%')
  }
}

@CustomDialog
struct DialogSample {
  cont:CustomDialogController;

  @State a12: Function = this.add;
  @Prop @Watch('onBuildChange') builder1: Function = buildFun;

  @State message1 :string='我是CustomDialog的父组件'

  @State a1: Function = buildFun;
  @State a2: Function|boolean = this.add;
  @State a3: Function|number = buildFun;
  @State a4: Function|string = 'state';

  @Prop a11: Function = buildFun;
  @Prop a13: Function|number = buildFun;
  @Prop a14: Function|string = 'prop';
  @Prop a15: object = buildFun;
  @Prop a16: string = '123';

  @Prop @Watch('onBuildChange') watch3: Function = buildFun;
  @Require @State require3: Function = this.add;

  @StorageProp('propA12') @Watch('onBuildChange') watch4: Function = buildFun

  @State @Watch('onBuildChange') watch5: Function = this.add
  @State @Watch('onBuildChange') watch55: Function|object = this.add

  @Require @Prop require4:Function = this.add;
  @Require @Prop require44:Function|string = this.add;
  @Require @Provide require5:Function = this.add;
  @Require @Provide require6:Function|string = buildFun;

  regular1: Function = buildFun;
  regular2: Function|number = 1;
  regular22: Function|string = 'regular';
  regular3: Function = this.add;

  @Link builder7: Function ;
  @Link builder8: Function|number ;
  @Link builder88: Function|string ;
  @Link builder9: Function|boolean ;

  @Provide builder10: Function = buildFun;
  @Provide builder11: Function|number = 1;
  @Provide builder111: Function|string = 'provide';
  @Provide builder12: Function|boolean = this.add;
  @Provide builder23: string = '888';

  @Consume builder13: Function = buildFun;
  @Consume builder14: Function|number = 1;
  @Consume builder144: Function|string = 'provide';
  @Consume builder15: Function|boolean = this.add;
  @Consume builder16: string = '555';

  @StorageProp('') storageProp1: Function = buildFun;
  @StorageProp('') storageProp2: Function|number = 1;
  @StorageProp('') storageProp22: Function|string = 'storageProp';
  @StorageProp('') storageProp3: Function|boolean = this.add;

  @StorageLink('') storageLink1: Function = buildFun;
  @StorageLink('') storageLink2: Function|number = 1;
  @StorageLink('') storageLink22: Function|string = 'storageLink';
  @StorageLink('') storageLink3: Function|boolean = this.add;

  @LocalStorageProp('') localstorageProp1: Function = buildFun;
  @LocalStorageProp('') localstorageProp2: Function|number = 1;
  @LocalStorageProp('') localstorageProp22: Function|string = 'localstorageProp';
  @LocalStorageProp('') localstorageProp3: Function|boolean = this.add;

  @LocalStorageLink('') localstorageLink1: Function = buildFun;
  @LocalStorageLink('') localstorageLink2: Function|number = 1;
  @LocalStorageLink('') localstorageLink22: Function|string = 'localstorageLink';
  @LocalStorageLink('') localstorageLink3: Function|boolean = this.add;

  @State state22: (Function) = buildFun;
  @State state23: ((Function)) = this.add;
  @State state24: (Function | (string)) = '24';
  @State state25: (Function | boolean) = buildFun;
  @State state26: ((((Function) | number))) = 10;
  @State state27: ((((Function | null)))) = buildFun;
  @State state28: ((Function | undefined)) = this.add;
  @State state29: (object) = this.add;
  @State state30: ((boolean)) = false;

  @State state16: (() => void) = buildFun;
  @State state17: ((() => void | number)) = this.add;
  @State state18: ((()=>void | undefined) | number) = 18;
  @State state19: (((()=>void | null) | string)) = '236';
  @State state20: ((()=>void | number) | number) = 1;
  @State state21: (((()=>void | number) | string)) = '21';

  @Prop prop22: (Function) = buildFun;
  @Prop prop23: ((Function)) = this.add;
  @Prop prop24: (Function | (string)) = '24';
  @Prop prop25: (Function | boolean) = buildFun;
  @Prop prop26: ((((Function) | number))) = 10;
  @Prop prop27: ((((Function | null)))) = buildFun;
  @Prop prop28: ((Function | undefined)) = this.add;
  @Prop prop29: (object) = this.add;
  @Prop prop30: ((boolean)) = false;

  @Prop prop16: (() => void) = buildFun;
  @Prop prop17: ((() => void | number)) = this.add;
  @Prop prop18: ((()=>void | undefined) | number) = 18;
  @Prop prop19: (((()=>void | null) | string)) = '236';
  @Prop prop20: ((()=>void | number) | number) = 1;
  @Prop prop21: (((()=>void | number) | string)) = '21';

  @Link link22: (Function);
  @Link link23: ((Function));
  @Link link24: (Function | (string));
  @Link link25: (Function | boolean);
  @Link link26: ((((Function) | number)));
  @Link link27: ((((Function | null))));
  @Link link28: ((Function | undefined));
  @Link link29: (object);
  @Link link30: ((boolean));

  @Link link16: (() => void);
  @Link link17: ((() => void | number));
  @Link link18: ((()=>void | undefined) | number);
  @Link link19: (((()=>void | null) | string));
  @Link link20: ((()=>void | number) | number);
  @Link link21: (((()=>void | number) | string));

  @StorageProp('') storageProp31: (Function) = buildFun;
  @StorageProp('') storageProp23: ((Function)) = this.add;
  @StorageProp('') storageProp24: (Function | (string)) = '24';
  @StorageProp('') storageProp25: (Function | boolean) = buildFun;
  @StorageProp('') storageProp26: ((((Function) | number))) = 10;
  @StorageProp('') storageProp27: ((((Function | null)))) = buildFun;
  @StorageProp('') storageProp28: ((Function | undefined)) = this.add;
  @StorageProp('') storageProp29: (object) = this.add;
  @StorageProp('') storageProp30: ((boolean)) = false;

  @StorageProp('') storageProp16: (() => void) = buildFun;
  @StorageProp('') storageProp17: ((() => void | number)) = this.add;
  @StorageProp('') storageProp18: ((()=>void | undefined) | number) = 18;
  @StorageProp('') storageProp19: (((()=>void | null) | string)) = '236';
  @StorageProp('') storageProp20: ((()=>void | number) | number) = 1;
  @StorageProp('') storageProp21: (((()=>void | number) | string)) = '21';

  add(){}

  onBuildChange(){}

  build() {}
}

class Test{
  regular1: Function = buildFun;
  regular2: Function|number = 1;
  regular3: Function|string = 'regular';
  regular4: object = buildFun;

  @Track track1: Function = buildFun;
  @Track track2: Function|number = buildFun;
  @Track track3: Function|string = 'regular';
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
  regular2: Function|number = 1;
  regular22: Function|string = 'regular';
  regular3: Function = this.add;

  @Local a: Function = this.add;
  @Local a1: Function|string = this.add;
  @Local a2: Function|boolean = this.add;
  @Local a3: Function = buildFun;
  @Local a4: object = buildFun;
  @Local a5: string = '777';

  @Provider() provider1: Function = buildFun;
  @Provider() provider2: Function|number = 1;
  @Provider() provider3: Function|string = 'storageProp';
  @Provider() provider4: Function|boolean = this.add;
  @Provider() provider5: object = this.add;

  @Consumer() consumer1: Function = buildFun;
  @Consumer() consumer2: Function|number = 1;
  @Consumer() consumer3: Function|string = 'storageLink';
  @Consumer() consumer4: Function|boolean = this.add;
  @Consumer() consumer5: object = this.add;

  @Param param1: Function = buildFun;
  @Param param2: Function|number = 1;
  @Param param3: Function|string = 'storageLink';
  @Param param4: Function|boolean = this.add;
  @Param param5: object = this.add;
  @Param param6: string = '999';

  @Event event1: Function = buildFun;
  @Event event2: Function|number = 1;
  @Event event3: Function|string = 'storageLink';
  @Event event4: Function|boolean = this.add;
  @Event event5: object = this.add;

  add(){}
  build() {}
}