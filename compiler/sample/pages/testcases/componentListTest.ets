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
struct ListRootView {

    dataArrayList:string[] = [
        "item0", "item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8", "item9",
        "item10", "item11", "item12", "item13", "item14", "item15", "item16", "item17", "item18", "item19",
        "item20", "item21", "item22", "item23", "item24", "item25", "item26", "item27", "item28", "item29",
    ];

    @State listidx:number = 50;

    build(){
        Column(){
            Text('--------------- List :foreach test --------------->')
            Text("index:" + this.listidx)
            List(){
                ForEach(
                    this.dataArrayList,
                    (item) => {
                        ListItem(){
                            Text(item)
                        }
                        .backgroundColor(0x6495ED).height(50)
                        .onClick(() => {
                            this.listidx ++;
                        })
                    },
                    (item) => item
                )
            }
            .height(600).width(500)
            .divider({ strokeWidth: 2, color:"#FF00ff"}).scrollBar(BarState.Off)
            .onReachStart(() => {
                console.info("list-demo reachStart ");
            })
            .onReachEnd(() => {
                console.info("list-demo reachEnd ");
            })
            .onScrollStop(() => {
                console.info("list-demo scrollStop ");
            })
            .onScroll((offset: number, state: ScrollState) => {
                console.info('list-demo scroll:offset:' + offset + ",State:" + state)
            })
        }
    }
}
