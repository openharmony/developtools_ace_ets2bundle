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
struct UserView {

    @State
    button_name:string = "Before Click";

    @State
    currentView:string = "opacity";

    build(){
        Column() {
            if(this.currentView === "opacity") {
                Column(){
                    Row(){
                        Text("Row Text1")
                    }
                    .width(100).height(100).opacity(0.5).backgroundColor("#c4b0dd")
                    Row(){
                        Text("Row Text2")
                    }
                    .width(100).height(100).opacity(1).backgroundColor("#c4b0dd")
                    Text("Column Text1").height(100).backgroundColor("#c4b0de")
                    Text("Column Text2").height(100).backgroundColor("#c4deb0").opacity(0.5)
                    Image("pages/pictures/0.jpeg").width(600).height(300)
                    Image("pages/pictures/0.jpeg").width(600).height(300).opacity(0.5)
                    Button("Button1").height(100).backgroundColor("#c4deb0")
                    Button("Button2").height(100).backgroundColor("#c4deb0").opacity(0.5)
                    Divider().height(10).color("red")
                    Divider().height(10).color("red").opacity(0.5)
                }
                .width(700).backgroundColor("#b0c4de").margin(20)
            } else if(this.currentView === "button") {
                Button("V8 Button test:" + this.button_name)
                .width(600).height(100).backgroundColor("#b0c4de").margin(50)
                .onClick(() => {
                    console.log("V8 Button test click start");
                    this.button_name = "After click";
                    console.log("V8 Button test click end");
                })
            } else if(this.currentView === "text") {
                Text("V8 Text test")
                .width(600).height(100).backgroundColor("#b0c4de")
                .margin(50).fontColor("#ff33aa").fontSize(50).fontWeight("bold")
            } else if(this.currentView === "image") {
                Image("pages/pictures/0.jpeg").width(800).height(400).margin(50)
            } else if(this.currentView === "column") {
                Column(){
                    Text("Column Text1").height(100).backgroundColor("#c4b0de")
                    Text("Column Text2").height(100).backgroundColor("#c4deb0")
                    Image("pages/pictures/0.jpeg").width(600).height(300)
                    Text("Column Text3").height(100).backgroundColor("#c4b0de")
                    Text("Column Text4").height(100).backgroundColor("#c4deb0")
                }
                .width(700).height(1000).backgroundColor("#b0c4de").margin(20)
            } else if(this.currentView === "row") {
                Row(){
                    Text("Text1").height(100).backgroundColor("#c4b0de")
                    Text("Text2").height(100).backgroundColor("#c4deb0")
                    Image("pages/pictures/0.jpeg").width(300).height(150)
                    Text("Text3").height(100).backgroundColor("#c4b0de")
                    Text("Text4").height(100).backgroundColor("#c4deb0")
                }
                .width(700).height(200).backgroundColor("#b0c4de").margin(20)
            }
        }
    }
}
