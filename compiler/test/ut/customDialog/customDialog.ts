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
@CustomDialog
struct DialogExample {
  controller: CustomDialogController;
  termsToAccept: string = ""
  action1: () => void;
  action2: (x: number, s: string) => void;

build() {
  Row() {
    Button ("Option A")
      .onClick(() => {
        this.controller.close();
        this.action1();
      })
    Button ("Option B")
      .onClick(() => {
        this.controller.close();
        this.action2(47, "Option B is great choice");
      })
    }
  }
}

@Entry
@Component
struct CustomDialogUser {
    dialogController : CustomDialogController = new CustomDialogController({
      builder: DialogExample({termsToAccept: "Please accept the terms.", action1: this.onAccept, action2: this.existApp}),
      cancel: this.existApp,
      autoCancel: false
    });

    onAccept() {
      console.log("onAccept");
    }
    existApp() {
      console.log("Cancel dialog!");
    }

    build() {
        Column() {
          Button("Click to open Dialog")
            .onClick(() => {
                this.dialogController.open()
            })
          Button("Click to close Dialog")
            onClick(() => {
              this.dialogController.close()
            })
        }
    }
}
`

export const expectResult: string =
`class DialogExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.controller = undefined;
        this.termsToAccept = "";
        this.action1 = undefined;
        this.action2 = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.termsToAccept !== undefined) {
            this.termsToAccept = params.termsToAccept;
        }
        if (params.action1 !== undefined) {
            this.action1 = params.action1;
        }
        if (params.action2 !== undefined) {
            this.action2 = params.action2;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    setController(ctr) {
        this.controller = ctr;
    }
    render() {
        Row.create();
        Button.createWithLabel("Option A");
        Button.onClick(() => {
            this.controller.close();
            this.action1();
        });
        Button.pop();
        Button.createWithLabel("Option B");
        Button.onClick(() => {
            this.controller.close();
            this.action2(47, "Option B is great choice");
        });
        Button.pop();
        Row.pop();
    }
}
class CustomDialogUser extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.dialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new DialogExample("2", this, { termsToAccept: "Please accept the terms.", action1: this.onAccept, action2: this.existApp });
                jsDialog.setController(this.dialogController);
                View.create(jsDialog);
            },
            cancel: this.existApp,
            autoCancel: false
        }, this);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.dialogController !== undefined) {
            this.dialogController = params.dialogController;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    onAccept() {
        console.log("onAccept");
    }
    existApp() {
        console.log("Cancel dialog!");
    }
    render() {
        Column.create();
        Button.createWithLabel("Click to open Dialog");
        Button.onClick(() => {
            this.dialogController.open();
        });
        Button.pop();
        Button.createWithLabel("Click to close Dialog");
        Button.pop();
        Column.pop();
    }
}
loadDocument(new CustomDialogUser("1", undefined, {}));
`
