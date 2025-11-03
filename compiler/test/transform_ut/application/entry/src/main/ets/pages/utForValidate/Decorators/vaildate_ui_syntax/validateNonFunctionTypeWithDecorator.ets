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
  @State message: number = 1;
  @State message1: Function = this.add;
  @State message11: Function | number = this.add;
  @State message1111: Object = this.add;
  message111: Function = this.add;
  func1: Function = this.add;
  @Provide func4: Function = this.add;

  add() {}
  onBuildChange(){}
  build() {
    RelativeContainer() {
      Text(this.message.toString())
      Com2({func3: this.message1});
      DialogSample()
    }
    .height('100%')
    .width('100%')
  }
}

@Builder function buildFun(){}

@Component
struct Com2 {
  @State message2: number = 1;
  @Prop func: Function | number = 1;
  @Prop @Watch('onBuildChange') builder1: Function = buildFun;
  @Link func3: Function;
  @Consume func4: Function = this.add;
  @StorageProp('propA12') builder5: Function = buildFun;
  @StorageLink('propA12') builder6: Function = buildFun;
  @LocalStorageLink('propA') storageLink4: Function = this.add;
  @LocalStorageProp('propA13') storageProp33: Function = this.add;

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
  add(){}
  onBuildChange(){}
  build() {}
}

@ComponentV2
struct ComponentV2Sample {
  @Local a: Function = this.add;
  add(){}
  build() {}
}