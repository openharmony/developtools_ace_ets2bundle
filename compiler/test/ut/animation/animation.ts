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

exports.source = `
@Entry
@Component
struct Animation {
    private bgColor: string = "#8888ff"
    private width: number
    private height: number

    build() {
        Column() {
            Text("Text explicit animation").onClick(() => {
                let dx = 50;
                let dy = 100;
                this.bgColor = (this.bgColor == "#8888ff") ? "#ff8888" : "#8888ff";
                animateTo(
                    {duration: 1000, delay: 0, curve: "ease"},
                    () => {
                        this.width += dx;
                    }
                );
                animateTo(
                    {duration: 2000, delay: 0, curve: "ease"},
                    () => {
                        this.height += dy;
                    }
                );
            })
            .width(this.width)
            .fontSize(40)
            .animation({duration: 1000, delay: 0, curve: "ease"})
            .opacity(10)
            .fontColor('#8888ff')
            .animation({duration: 100, delay: 10, curve: "ease"})
            .margin({})
            .height(this.height)
        }.width(this.width)
         .animation({duration: 2000, delay: 0, curve: "ease"})
         .opacity(10)
         .animation({duration: 200, delay: 20, curve: "ease"})
         .margin({})
         .height(this.height)
         .animation(null)
    }
}`

exports.expectResult =
`"use strict";
class Animation extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.bgColor = "#8888ff";
        this.width = undefined;
        this.height = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.bgColor !== undefined) {
            this.bgColor = params.bgColor;
        }
        if (params.width !== undefined) {
            this.width = params.width;
        }
        if (params.height !== undefined) {
            this.height = params.height;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Context.animation({ duration: 2000, delay: 0, curve: "ease" });
        Column.width(this.width);
        Context.animation({ duration: 200, delay: 20, curve: "ease" });
        Column.opacity(10);
        Context.animation(null);
        Column.margin({});
        Column.height(this.height);
        Text.create("Text explicit animation");
        Context.animation({ duration: 1000, delay: 0, curve: "ease" });
        Text.onClick(() => {
            let dx = 50;
            let dy = 100;
            this.bgColor = (this.bgColor == "#8888ff") ? "#ff8888" : "#8888ff";
            Context.animateTo({ duration: 1000, delay: 0, curve: "ease" }, () => {
                this.width += dx;
            });
            Context.animateTo({ duration: 2000, delay: 0, curve: "ease" }, () => {
                this.height += dy;
            });
        });
        Text.width(this.width);
        Text.fontSize(40);
        Context.animation({ duration: 100, delay: 10, curve: "ease" });
        Text.opacity(10);
        Text.fontColor('#8888ff');
        Context.animation(null);
        Text.margin({});
        Text.height(this.height);
        Text.pop();
        Column.pop();
    }
}
loadDocument(new Animation("1", undefined, {}));
`
