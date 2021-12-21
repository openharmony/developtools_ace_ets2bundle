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
struct HomePreviewComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"

  build() {
    Column() {
      Row() {
        Text(this.value1)
        Text(this.value2)
        Text(this.value3)
      }
      Row() {
        Button() {
          Text(this.value1)
            .fontSize(20)
        }
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
}

@Preview
@Component
struct HomePreviewComponent_Preview {
  build() {
    Column() {
      HomePreviewComponent();
    }
  }
}
`

exports.expectResult =
`class HomePreviewComponent extends View {
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
        Text.pop();
        Text.create(this.value2);
        Text.pop();
        Text.create(this.value3);
        Text.pop();
        Row.pop();
        Row.create();
        Row.width(20);
        Button.createWithChild();
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
class HomePreviewComponent_Preview extends View {
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
        Column.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new HomePreviewComponent("2", this, {}));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({});
            if (!earlierCreatedChild_2.needsUpdate()) {
                earlierCreatedChild_2.markStatic();
            }
            View.create(earlierCreatedChild_2);
        }
        Column.pop();
    }
}
loadDocument(new HomePreviewComponent("1", undefined, {}));
`
