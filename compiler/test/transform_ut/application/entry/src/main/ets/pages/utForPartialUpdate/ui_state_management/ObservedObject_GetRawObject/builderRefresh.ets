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
 // builderRefresh test
 import {UIUtils, Binding, MutableBinding } from '@ohos.arkui.StateManagement';

 @Builder 
 function CustomButton( num1: Binding<number>, num2: MutableBinding<number>): void {
    Column() {
        Button(`Custom btn: ${num1.value} -- ${num2.value}`)
          .onClick(() => {
              num2.value +=1;
          });
    }
 }

 @Entry
 @ComponentV2
 struct MyApp {
    @Local num1: number = 1;
    @Local num2: number = 10;

    build() {
        Column() {
            Button(`Entry btn ${this.num1} -- ${this.num2}`)
              .onClick(() => {
                this.num1 += 1;
                this.num2 += 1;
              })
            
            CustomButton(
                UIUtils.makeBinding<number>(()=>this.num1),
                UIUtils.makeBinding<number>(()=>this.num2, val => this.num2 = val));
        }
    }
 }