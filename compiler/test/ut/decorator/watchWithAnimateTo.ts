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
struct ListComponent {
    @State dialogVis : boolean = false
    build() {
        Stack() {
          MyAlertDialog({dialogVis: $dialogVis})
        }
    }
}

@Component
struct MyAlertDialog {
  @Link @Watch("onDialogVisUpdated") dialogVis : boolean;
  onDialogVisUpdated(propName: string) : void {
    animateTo({}, () => {})
  }
  build() {
    Stack() {
      DialogView({dialogShow: $dialogVis})
    }
  }
}

@Component
struct DialogView {
  @Link dialogShow: boolean
  build() {
    Column() {}
  }
}
`

exports.expectResult =
`"use strict";
class ListComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__dialogVis = new ObservedPropertySimple(false, this, "dialogVis");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.dialogVis !== undefined) {
            this.dialogVis = params.dialogVis;
        }
    }
    aboutToBeDeleted() {
        this.__dialogVis.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get dialogVis() {
        return this.__dialogVis.get();
    }
    set dialogVis(newValue) {
        this.__dialogVis.set(newValue);
    }
    render() {
        Stack.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new MyAlertDialog("2", this, { dialogVis: this.__dialogVis }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({});
            View.create(earlierCreatedChild_2);
        }
        Stack.pop();
    }
}
class MyAlertDialog extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__dialogVis = new SynchedPropertySimpleTwoWay(params.dialogVis, this, "dialogVis");
        this.updateWithValueParams(params);
        this.declareWatch("dialogVis", this.onDialogVisUpdated);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        this.__dialogVis.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get dialogVis() {
        return this.__dialogVis.get();
    }
    set dialogVis(newValue) {
        this.__dialogVis.set(newValue);
    }
    onDialogVisUpdated(propName) {
        Context.animateTo({}, () => { });
    }
    render() {
        Stack.create();
        let earlierCreatedChild_3 = this.findChildById("3");
        if (earlierCreatedChild_3 == undefined) {
            View.create(new DialogView("3", this, { dialogShow: this.__dialogVis }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({});
            View.create(earlierCreatedChild_3);
        }
        Stack.pop();
    }
}
class DialogView extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__dialogShow = new SynchedPropertySimpleTwoWay(params.dialogShow, this, "dialogShow");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        this.__dialogShow.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get dialogShow() {
        return this.__dialogShow.get();
    }
    set dialogShow(newValue) {
        this.__dialogShow.set(newValue);
    }
    render() {
        Column.create();
        Column.pop();
    }
}
loadDocument(new ListComponent("1", undefined, {}));
`