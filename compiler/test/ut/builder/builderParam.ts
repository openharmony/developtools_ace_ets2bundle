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

@Component
struct CustomContainer {
    header: string = "";
    menuInfo: () => any;
    footer: string = "";
    @BuilderParam child: () => any;
    
    build() {
        Column() {
            this.child()
            Text(this.header)
            Text(this.footer)
        }
    }
}

@Entry
@Component
struct CustomContainerUser {
    @Builder specificChild(label:string) {
        Column() {
            Text("My content1")
            Text(label)
        }
    }

    build() {
        Column() {
            CustomContainer({
                header: "Header",
                footer: "Footer",
                menuInfo: this.specificChild("menuInfo")
                child: this.specificChild("child")
            })
        }  
    }
}
`
exports.expectResult =
`class CustomContainer extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.header = "";
        this.menuInfo = undefined;
        this.footer = "";
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.header !== undefined) {
            this.header = params.header;
        }
        if (params.menuInfo !== undefined) {
            this.menuInfo = params.menuInfo;
        }
        if (params.footer !== undefined) {
            this.footer = params.footer;
        }
        this.child = params.child;
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        this.child();
        Text.create(this.header);
        Text.pop();
        Text.create(this.footer);
        Text.pop();
        Column.pop();
    }
}
class CustomContainerUser extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    specificChild(label) {
        Column.create();
        Text.create("My content1");
        Text.pop();
        Text.create(label);
        Text.pop();
        Column.pop();
    }
    render() {
        Column.create();
        let earlierCreatedChild_3 = this.findChildById("3");
        if (earlierCreatedChild_3 == undefined) {
            View.create(new CustomContainer("3", this, {
                header: "Header",
                footer: "Footer",
                menuInfo: this.specificChild("menuInfo"),
                child: () => {
                    this.specificChild("child");
                }
            }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({
                header: "Header",
                footer: "Footer",
                menuInfo: this.specificChild("menuInfo"),
                child: () => {
                    this.specificChild("child");
                }
            });
            View.create(earlierCreatedChild_3);
        }
        Column.pop();
    }
}
loadDocument(new CustomContainerUser("1", undefined, {}));
`
