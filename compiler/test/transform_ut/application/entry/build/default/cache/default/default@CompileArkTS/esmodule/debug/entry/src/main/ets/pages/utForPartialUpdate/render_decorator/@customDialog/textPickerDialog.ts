/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TextPickerDialogExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.select = 0;
        this.fruits = ['apple1', 'orange2', 'peach3', 'grape4', 'banana5'];
        this.__selectedValue = new ObservedPropertySimplePU('', this, "selectedValue");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.select !== undefined) {
            this.select = params.select;
        }
        if (params.fruits !== undefined) {
            this.fruits = params.fruits;
        }
        if (params.selectedValue !== undefined) {
            this.selectedValue = params.selectedValue;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__selectedValue.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__selectedValue.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get selectedValue() {
        return this.__selectedValue.get();
    }
    set selectedValue(newValue) {
        this.__selectedValue.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("TextPickerDialog:" + this.selectedValue);
            Button.margin(20);
            Button.onClick(() => {
                this.getUIContext().showTextPickerDialog({
                    range: this.fruits,
                    selected: this.select,
                    value: this.selectedValue,
                    defaultPickerItemHeight: 40,
                    onAccept: (value) => {
                        this.select = value.index;
                        console.info(this.select + '');
                        this.selectedValue = value.value;
                        console.info("TextPickerDialog:onAccept()" + JSON.stringify(value));
                    },
                    onCancel: () => {
                        console.info("TextPickerDialog:onCancel()");
                    },
                    onChange: (value) => {
                        console.info("TextPickerDialog:onChange()" + JSON.stringify(value));
                    },
                    onScrollStop: (value) => {
                        console.info("TextPickerDialog:onScrollStop()" + JSON.stringify(value));
                    },
                    onDidAppear: () => {
                        console.info("TextPickerDialog:onDidAppear()");
                    },
                    onDidDisappear: () => {
                        console.info("TextPickerDialog:onDidDisappear()");
                    },
                    onWillAppear: () => {
                        console.info("TextPickerDialog:onWillAppear()");
                    },
                    onWillDisappear: () => {
                        console.info("TextPickerDialog:onWillDisappear()");
                    }
                });
            });
        }, Button);
        Button.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "TextPickerDialogExample";
    }
}
registerNamedRoute(() => new TextPickerDialogExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/textPickerDialog", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/textPickerDialog", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=textPickerDialog.js.map
