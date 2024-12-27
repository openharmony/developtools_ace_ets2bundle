/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

/*
 * This is a test case about the use of 'MenuItem', 'AlphabetIndexer' component, and 'bindContentCover' and 'bindMenu' attribute with two-way sync binding.
 */
exports.source = `
@Entry
@Component
struct TestMenuItemAndOthers {
  @State num: number = 2
  @State isShow: boolean = false
  @State select: boolean = true
  @State select2: boolean = true
  @State select3: boolean = true
  private value: string[] = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z']

  @Builder bindContentCoverBuilder() {
    Button("transition modal 1")
      .onClick(() => {
        this.isShow = true
      })
      .bindContentCover(this.isShow!!, this.myBuilder(), {
        modalTransition: ModalTransition.NONE,
        backgroundColor: Color.Pink
      })
  }

  @Builder
  myBuilder() {
    Column() {
      Button("close modal 1")
        .onClick(() => {
          this.isShow = false;
        })
    }
  }

  @Builder
  MyMenu(){
    Menu() {
      MenuItem({ content: "菜单选项" })
      MenuItem({ content: "菜单选项" })
        .enabled(false)
      MenuItem({
        content: "菜单选项",
        builder: ():void=>this.SubMenu()
      })
        .selected(this.select!!)
      MenuItemGroup({ header: '小标题' }) {
        MenuItem({
          content: "菜单选项",
          builder: ():void=>this.SubMenu()
        })
          .selected(this.select2!!)
      }
      MenuItem({
        content: "菜单选项",
      })
    }
  }

  @Builder
  SubMenu() {
    Menu() {
      MenuItem({ content: "复制", labelInfo: "Ctrl+C" })
      MenuItem({ content: "粘贴", labelInfo: "Ctrl+V" })
        .selected(this.select3!!)
    }
  }

  build() {
    Column() {
      this.bindContentCoverBuilder()
      AlphabetIndexer({ arrayValue: this.value, selected: this.num!! })
      Column() {
        Text('click to show menu')
      }
      .bindMenu(this.MyMenu)
    }
  }
}
`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TestMenuItemAndOthers extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__num = new ObservedPropertySimplePU(2, this, "num");
        this.__isShow = new ObservedPropertySimplePU(false, this, "isShow");
        this.__select = new ObservedPropertySimplePU(true, this, "select");
        this.__select2 = new ObservedPropertySimplePU(true, this, "select2");
        this.__select3 = new ObservedPropertySimplePU(true, this, "select3");
        this.value = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N',
            'O', 'P', 'Q', 'R', 'S', 'T', 'U',
            'V', 'W', 'X', 'Y', 'Z'];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.num !== undefined) {
            this.num = params.num;
        }
        if (params.isShow !== undefined) {
            this.isShow = params.isShow;
        }
        if (params.select !== undefined) {
            this.select = params.select;
        }
        if (params.select2 !== undefined) {
            this.select2 = params.select2;
        }
        if (params.select3 !== undefined) {
            this.select3 = params.select3;
        }
        if (params.value !== undefined) {
            this.value = params.value;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__num.purgeDependencyOnElmtId(rmElmtId);
        this.__isShow.purgeDependencyOnElmtId(rmElmtId);
        this.__select.purgeDependencyOnElmtId(rmElmtId);
        this.__select2.purgeDependencyOnElmtId(rmElmtId);
        this.__select3.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__num.aboutToBeDeleted();
        this.__isShow.aboutToBeDeleted();
        this.__select.aboutToBeDeleted();
        this.__select2.aboutToBeDeleted();
        this.__select3.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get num() {
        return this.__num.get();
    }
    set num(newValue) {
        this.__num.set(newValue);
    }
    get isShow() {
        return this.__isShow.get();
    }
    set isShow(newValue) {
        this.__isShow.set(newValue);
    }
    get select() {
        return this.__select.get();
    }
    set select(newValue) {
        this.__select.set(newValue);
    }
    get select2() {
        return this.__select2.get();
    }
    set select2(newValue) {
        this.__select2.set(newValue);
    }
    get select3() {
        return this.__select3.get();
    }
    set select3(newValue) {
        this.__select3.set(newValue);
    }
    bindContentCoverBuilder(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("transition modal 1");
            Button.onClick(() => {
                this.isShow = true;
            });
            Button.bindContentCover({ value: this.isShow, $value: newValue => { this.isShow = newValue; } }, { builder: () => {
                    this.myBuilder.call(this);
                } }, {
                modalTransition: ModalTransition.NONE,
                backgroundColor: Color.Pink
            });
        }, Button);
        Button.pop();
    }
    myBuilder(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("close modal 1");
            Button.onClick(() => {
                this.isShow = false;
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    MyMenu(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Menu.create();
        }, Menu);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({ content: "菜单选项" });
        }, MenuItem);
        MenuItem.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({ content: "菜单选项" });
            MenuItem.enabled(false);
        }, MenuItem);
        MenuItem.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({
                content: "菜单选项",
                builder: () => this.SubMenu()
            });
            MenuItem.selected({ value: this.select, $value: newValue => { this.select = newValue; } });
        }, MenuItem);
        MenuItem.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItemGroup.create({ header: '小标题' });
        }, MenuItemGroup);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({
                content: "菜单选项",
                builder: () => this.SubMenu()
            });
            MenuItem.selected({ value: this.select2, $value: newValue => { this.select2 = newValue; } });
        }, MenuItem);
        MenuItem.pop();
        MenuItemGroup.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({
                content: "菜单选项"
            });
        }, MenuItem);
        MenuItem.pop();
        Menu.pop();
    }
    SubMenu(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Menu.create();
        }, Menu);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({ content: "复制", labelInfo: "Ctrl+C" });
        }, MenuItem);
        MenuItem.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            MenuItem.create({ content: "粘贴", labelInfo: "Ctrl+V" });
            MenuItem.selected({ value: this.select3, $value: newValue => { this.select3 = newValue; } });
        }, MenuItem);
        MenuItem.pop();
        Menu.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.bindContentCoverBuilder.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            AlphabetIndexer.create({ arrayValue: this.value, selected: this.num, $selected: newValue => { this.num = newValue; } });
        }, AlphabetIndexer);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.bindMenu({ builder: this.MyMenu.bind(this) });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('click to show menu');
        }, Text);
        Text.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TestMenuItemAndOthers(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
