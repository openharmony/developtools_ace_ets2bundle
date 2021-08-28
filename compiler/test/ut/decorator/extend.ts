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

export const source: string = `
    @Extend Text.fancy(color:string){
        .backgroundColor(color)
    }

@Extend
Text.superFancy(size:number){
    .fontSize(size)
    .fancy(Color.Red)
}

@Extend(Button)
function fancy(color:string){
    .backgroundColor(color)
    .width(200)
    .height(100)
}

@Entry
@Component
struct FancyText {
    build() {
        Row() {
            Text("Just Fancy").fancy(Color.Yellow)
            Text("Super Fancy Text").height(70).superFancy(24)
            Button("Fancy Button").fancy(Color.Green)
        }
    }
}`

export const expectResult: string =
`function __Text__fancy(color) {
    Text.backgroundColor(color);
}
function __Text__superFancy(size) {
    Text.fontSize(size);
    __Text__fancy(Color.Red);
}
function __Button__fancy(color) {
    Button.backgroundColor(color);
    Button.width(200);
    Button.height(100);
}
class FancyText extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Row.create();
        Text.create("Just Fancy");
        __Text__fancy(Color.Yellow);
        Text.pop();
        Text.create("Super Fancy Text");
        Text.height(70);
        __Text__superFancy(24);
        Text.pop();
        Button.createWithLabel("Fancy Button");
        __Button__fancy(Color.Green);
        Button.pop();
        Row.pop();
    }
}
loadDocument(new FancyText("1", undefined, {}));
`