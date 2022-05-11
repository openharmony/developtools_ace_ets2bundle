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
@CustomDialog
struct CustomDialogSample{
  @Link title: string;
  controller: CustomDialogController;
  action: () => void;

  build() {
    Row() {
      Button('click').onClick(() => {
        this.controller.close()
        this.action()
      })
    }
  }
}


@Component
@Entry
struct MyComponent {
  @State title: string = "This is a title.";

  dialogController: CustomDialogController = new CustomDialogController({
    builder: CustomDialogSample({action: this.onAccept,title: $title}),
    cancel: this.existApp,
    autoCancel: true
  })

  onAccept() {
    console.log('onAccept')
  }

  existApp() {
    console.log('existApp')
  }

  build() {
    Column() {
      Button('click').onClick(() => {
        this.dialogController.open()
      })
    }
  }
}
`

exports.expectResult =
`class CustomDialogSample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__title = new SynchedPropertySimpleTwoWay(params.title, this, "title");
        this.controller = undefined;
        this.action = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.action !== undefined) {
            this.action = params.action;
        }
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get title() {
        return this.__title.get();
    }
    set title(newValue) {
        this.__title.set(newValue);
    }
    setController(ctr) {
        this.controller = ctr;
    }
    render() {
        Row.create();
        Button.createWithLabel('click');
        Button.onClick(() => {
            this.controller.close();
            this.action();
        });
        Button.pop();
        Row.pop();
    }
}
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__title = new ObservedPropertySimple("This is a title.", this, "title");
        this.dialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new CustomDialogSample("2", this, { action: this.onAccept, title: this.__title });
                jsDialog.setController(this.dialogController);
                View.create(jsDialog);
            },
            cancel: this.existApp,
            autoCancel: true
        }, this);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.title !== undefined) {
            this.title = params.title;
        }
        if (params.dialogController !== undefined) {
            this.dialogController = params.dialogController;
        }
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get title() {
        return this.__title.get();
    }
    set title(newValue) {
        this.__title.set(newValue);
    }
    onAccept() {
        console.log('onAccept');
    }
    existApp() {
        console.log('existApp');
    }
    render() {
        Column.create();
        Button.createWithLabel('click');
        Button.onClick(() => {
            this.dialogController.open();
        });
        Button.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`