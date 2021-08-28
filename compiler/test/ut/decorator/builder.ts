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
@Builder
function SquareText(label: string, size: number) {
  Text(label)
    .width(1 * size).height(1 * size)
}

@Builder
function bb() {
  Text("label")
}

@Entry
@Component
struct HomeComponent {
  size = 1

  @Builder aa(label: string) {
   Text(label)
  }

  build() {
    Column() {
      bb()
      SquareText("A", this.size)
      this.aa("A")
    }
    .height(500)
  }
}`

export const expectResult: string =
`function SquareText(label, size) {
    Text.create(label);
    Text.width(1 * size);
    Text.height(1 * size);
    Text.pop();
}
function bb() {
    Text.create("label");
    Text.pop();
}
class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.size = 1;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.size !== undefined) {
            this.size = params.size;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    aa(label) {
        Text.create(label);
        Text.pop();
    }
    render() {
        Column.create();
        Column.height(500);
        bb();
        SquareText("A", this.size);
        this.aa("A");
        Column.pop();
    }
}
loadDocument(new HomeComponent("1", undefined, {}));
`
