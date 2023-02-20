/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import { CustomContainerExport } from './test/pages/TestComponent';
@Component
struct CustomContainer {
  header: string = "";
  @BuilderParam content: () => void;
  @BuilderParam callContent: any;
  footer: string = "";
  build() {
    Column() {
      Text(this.header)
      this.content()
      this.callContent()
      Text(this.footer)
    }
  }
}

@Component
struct CustomContainer2 {
  header: string = "";
  @BuilderParam content: () => void;
  build() {
    Column() {
      Text(this.header)
      this.content()
    }
  }
}

@Builder function specificWithParam(label1: string, label2: string) {
  Column() {
    Text(label1).fontSize(50)
    Text(label2).fontSize(50)
  }
}

@Entry
@Component
struct CustomContainerUser {
  @State text: string = 'header'
  @Builder specificParam() {
    Column() {
      Text("content").fontSize(50)
    }
  }
  @Builder callSpecificParam(label1: string, label2: string) {
    Column() {
      Text(label1).fontSize(50)
      Text(label2).fontSize(50)
    }
  }

  build() {
    Column() {
      CustomContainerExport({
        header: this.text,
      }){
        Column(){
          specificWithParam("111", "22")
        }.onClick(()=>{
          this.text = "changeHeader"
        })
      }
      Row(){
        CustomContainer({
          header: this.text,
          content: this.specificParam,
          callContent: this.callSpecificParam("callContent1", 'callContent2'),
          footer: "Footer",
        })
      }
      Row(){
        CustomContainer2({
          header: this.text,
        }){
          Column(){
            this.callSpecificParam("111", '222')
          }.onClick(()=>{
            this.text = "changeHeader"
          })
        }
      }
    }
  }
}
`
exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let __generate__Id = 0;
function generateId() {
    return "@builderParam_" + ++__generate__Id;
}
const TestComponent_1 = require("./test/pages/TestComponent");
class CustomContainer extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.header = "";
        this.content = undefined;
        this.callContent = undefined;
        this.footer = "";
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.header !== undefined) {
            this.header = params.header;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
        if (params.callContent !== undefined) {
            this.callContent = params.callContent;
        }
        if (params.footer !== undefined) {
            this.footer = params.footer;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Text.create(this.header);
        Text.pop();
        this.content(this);
        this.callContent(this);
        Text.create(this.footer);
        Text.pop();
        Column.pop();
    }
}
class CustomContainer2 extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.header = "";
        this.content = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.header !== undefined) {
            this.header = params.header;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Text.create(this.header);
        Text.pop();
        this.content(this);
        Column.pop();
    }
}
function specificWithParam(label1, label2, parent = null) {
    Column.create();
    Text.create(label1);
    Text.fontSize(50);
    Text.pop();
    Text.create(label2);
    Text.fontSize(50);
    Text.pop();
    Column.pop();
}
class CustomContainerUser extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__text = new ObservedPropertySimple('header', this, "text");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.text !== undefined) {
            this.text = params.text;
        }
    }
    aboutToBeDeleted() {
        this.__text.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get text() {
        return this.__text.get();
    }
    set text(newValue) {
        this.__text.set(newValue);
    }
    specificParam(parent = null) {
        Column.create();
        Text.create("content");
        Text.fontSize(50);
        Text.pop();
        Column.pop();
    }
    callSpecificParam(label1, label2, parent = null) {
        Column.create();
        Text.create(label1);
        Text.fontSize(50);
        Text.pop();
        Text.create(label2);
        Text.fontSize(50);
        Text.pop();
        Column.pop();
    }
    render() {
        Column.create();
        let earlierCreatedChild_2 = (this && this.findChildById) ? this.findChildById("2") : undefined;
        if (earlierCreatedChild_2 == undefined) {
            View.create(new TestComponent_1.CustomContainerExport("2", this, {
                header: this.text,
                closer: () => {
                    Column.create();
                    Column.onClick(() => {
                        this.text = "changeHeader";
                    });
                    specificWithParam("111", "22", this);
                    Column.pop();
                }
            }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({
                header: this.text,
                closer: () => {
                    Column.create();
                    Column.onClick(() => {
                        this.text = "changeHeader";
                    });
                    specificWithParam("111", "22", this);
                    Column.pop();
                }
            });
            View.create(earlierCreatedChild_2);
        }
        Row.create();
        let earlierCreatedChild_3 = (this && this.findChildById) ? this.findChildById("3") : undefined;
        if (earlierCreatedChild_3 == undefined) {
            View.create(new CustomContainer("3", this, {
                header: this.text,
                content: this.specificParam,
                callContent: this.callSpecificParam("callContent1", 'callContent2'),
                footer: "Footer",
            }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({
                header: this.text,
                content: this.specificParam,
                callContent: this.callSpecificParam("callContent1", 'callContent2'),
                footer: "Footer"
            });
            View.create(earlierCreatedChild_3);
        }
        Row.pop();
        Row.create();
        let earlierCreatedChild_4 = (this && this.findChildById) ? this.findChildById("4") : undefined;
        if (earlierCreatedChild_4 == undefined) {
            View.create(new CustomContainer2("4", this, {
                header: this.text,
                content: () => {
                    Column.create();
                    Column.onClick(() => {
                        this.text = "changeHeader";
                    });
                    this.callSpecificParam("111", '222', this);
                    Column.pop();
                }
            }));
        }
        else {
            earlierCreatedChild_4.updateWithValueParams({
                header: this.text,
                content: () => {
                    Column.create();
                    Column.onClick(() => {
                        this.text = "changeHeader";
                    });
                    this.callSpecificParam("111", '222', this);
                    Column.pop();
                }
            });
            View.create(earlierCreatedChild_4);
        }
        Row.pop();
        Column.pop();
    }
}
loadDocument(new CustomContainerUser("1", undefined, {}));
`
