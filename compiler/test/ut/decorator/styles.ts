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
@Styles function globalStyle() {
  .width(100)
  .height(100)
  .backgroundColor("red")
}

@Entry
@Component
struct HomeComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"
  @Styles innerStyle() {
    .width(50)
    .height(50)
    .backgroundColor("blue")
  }

  build() {
    Column() {
      Row() {
        Text(this.value1)
        .globalStyle()
        Text(this.value2)
        .innerStyle()
        Text(this.value3)
      }
      Row() {
        Button() {
          Text(this.value1)
            .fontSize(20)
        }
        .stateStyles({
          normal: {
            .width(80)
            .height(80)
            .backgroundColor("green")
          },
          clicked: globalStyle,
          disabled: this.innerStyle
        })
        .width(100)
        .height(20)
        Text(this.value2)
          .fontSize(100)
        Text(this.value3)
      }
      .width(20)
    }
    .height(500)
  }
}`

exports.expectResult =
`"use strict";
class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.value1 = "hello world 1";
        this.value2 = "hello world 2";
        this.value3 = "hello world 3";
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.value1 !== undefined) {
            this.value1 = params.value1;
        }
        if (params.value2 !== undefined) {
            this.value2 = params.value2;
        }
        if (params.value3 !== undefined) {
            this.value3 = params.value3;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Column.height(500);
        Row.create();
        Text.create(this.value1);
        Text.width(100);
        Text.height(100);
        Text.backgroundColor("red");
        Text.pop();
        Text.create(this.value2);
        Text.width(50);
        Text.height(50);
        Text.backgroundColor("blue");
        Text.pop();
        Text.create(this.value3);
        Text.pop();
        Row.pop();
        Row.create();
        Row.width(20);
        Button.createWithChild();
        ViewStackProcessor.visualState("normal");
        Button.width(80);
        Button.height(80);
        Button.backgroundColor("green");
        ViewStackProcessor.visualState("clicked");
        Button.width(100);
        Button.height(100);
        Button.backgroundColor("red");
        ViewStackProcessor.visualState("disabled");
        Button.width(50);
        Button.height(50);
        Button.backgroundColor("blue");
        ViewStackProcessor.visualState();
        Button.width(100);
        Button.height(20);
        Text.create(this.value1);
        Text.fontSize(20);
        Text.pop();
        Button.pop();
        Text.create(this.value2);
        Text.fontSize(100);
        Text.pop();
        Text.create(this.value3);
        Text.pop();
        Row.pop();
        Column.pop();
    }
}
loadDocument(new HomeComponent("1", undefined, {}));
`
