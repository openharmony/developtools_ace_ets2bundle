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
struct Banner {
@Builder textBuilder() {
  Text("文本")
  .fontSize(30)
}
@Builder NavigationTitle(label:string) {
  Column() {
    Text(label)
      .width(10)
      .bindMenu(this.textBuilder)
  }
}
  build() {
    Column() {
      Text("111")
        .bindMenu(this.NavigationTitle("111"))
    }
  }
}
`
exports.expectResult =
`class Banner extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    textBuilder() {
        Text.create("文本");
        Text.fontSize(30);
        Text.pop();
    }
    NavigationTitle(label) {
        Column.create();
        Text.create(label);
        Text.width(10);
        Text.bindMenu({ builder: this.textBuilder.bind(this) });
        Text.pop();
        Column.pop();
    }
    render() {
        Column.create();
        Text.create("111");
        Text.bindMenu({ builder: () => {
                this.NavigationTitle("111");
            } });
        Text.pop();
        Column.pop();
    }
}
loadDocument(new Banner("1", undefined, {}));
`
