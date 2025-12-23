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
@Entry
@ComponentV2
struct CompV2 {
  @Local localOne: string = "key1"

  @SyncMonitor('.*')  // no ok
  syncOne(){
    console.log(``)
  }
  @SyncMonitor('localOne.*') // ok
  syncTwo(){
    console.log(``)
  }
  @SyncMonitor('.*localOne') // no ok
  syncThree(){
    console.log(``)
  }
  @SyncMonitor('local.*One') // no ok
  syncFour(){
    console.log(``)
  }
  @SyncMonitor('localOne.*Two.*') // no ok
  syncFive(){
    console.log(``)
  }
  @SyncMonitor('localOne.**') // no ok
  syncSix(){
    console.log(``)
  }
  @SyncMonitor('localOne.*.*') // no ok
  syncSeven(){
    console.log(``)
  }
  @SyncMonitor('localOne.*.0.*') // no ok
  syncEight(){
    console.log(``)
  }
  @SyncMonitor('*')
  syncNine(){

  }
  @SyncMonitor('*.propA')
  syncTen() {

  }
  @SyncMonitor('*propA')
  sync11() {

  }
  @SyncMonitor('arr.*.propA')  // no ok
  sync12() {

  }
  @SyncMonitor('arr.*.propA.*')  // no ok
  sync13(){

  }
  @SyncMonitor('obsObj.1.*')  // ok
  sync14(){

  }
  @SyncMonitor('objObj**')  // no ok
  sync15(){

  }
  @SyncMonitor('objObj*')  // no ok
  sync16(){

  }
  @SyncMonitor('arr.propA.*')  // ok
  sync17(){

  }
  build() {

  }
}