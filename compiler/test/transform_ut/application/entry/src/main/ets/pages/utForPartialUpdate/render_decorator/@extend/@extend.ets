/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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

// @Extend base use case
@Extend Text.fancy(color:string){
  .backgroundColor(color)
}

@Extend Text.superFancy(size:number){
  .fontSize(size)
  .fancy(Color.Red)
}

@Extend(Button) function fancybutParam(color:string|Color){
  .backgroundColor(color)
  .height(100)
  .stateStyles({
      normal: {
        .width(200)
      }
  })
}

@Extend(Button) function fancybut(){
  .backgroundColor('red')
  .height(100)
  .stateStyles({
      normal: {
        .width(200)
      }
  })
}

@Extend(Button) function fancybutParamEmpty(color:string|Color){
  
}

@Extend(Button) function fancybutEmpty(){
  
}

@Entry
@Component
struct FancyUse {
  build() {
    Column(){
      Row() {
        Text("Just Fancy").fancy(Color.Yellow)
        Text("Super Fancy Text").superFancy(24)
        Button("Fancy Button")
        .fancybutParam(Color.Green)
        .fancybut()
        .fancybutParamEmpty(Color.Green)
        .fancybutEmpty()

      }
      Row({ space: 10 }) {
        Text("Fancy")
          .fancytextParam(24)
          .fancytextParamEmpty(24)
          .fancytext()
          .fancytextEmpty()
      }
    }
  }
}

@Extend(Text) function fancytextParam(fontSize: number) {
  .fontColor(Color.Red)
  .fontSize(fontSize)
  .fontStyle(FontStyle.Italic)
}

@Extend(Text) function fancytextParamEmpty(fontSize: number) {

}

@Extend(Text) function fancytext() {
  .fontColor(Color.Red)
  .fontSize(30)
  .fontStyle(FontStyle.Italic)
}

@Extend(Text) function fancytextEmpty() {

}