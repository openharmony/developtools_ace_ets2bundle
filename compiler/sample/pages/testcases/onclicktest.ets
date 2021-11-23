/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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
@Component
struct TestView1 {

  @State
  clicked:number = 0;

  onClicked() {
    this.clicked = this.clicked + 1;
  }

    build() {
    Column(){
      Text("Clicked: " + this.onClicked)
      Image("pages/pictures/0.jpeg")
      .width(800).height(400).margin(50)
      .onClick(this.onClicked.bind(this))
      Text("Test text\ntest text")
      .onClick(this.onClicked.bind(this))
      Row(){
        Text("test")
        Text("test")
        Text("test")
      }
      .onClick(this.onClicked.bind(this))
      Stack(){
        Image("pages/pictures/0.jpeg")
        Text("Test text")
      }
      .onClick(this.onClicked.bind(this))
      Column(){
        Text("test")
        Text("test")
        Text("test")
      }
      .onClick(this.onClicked.bind(this))
    }
    .alignItems(HorizontalAlign.Center)
    } // render
}
