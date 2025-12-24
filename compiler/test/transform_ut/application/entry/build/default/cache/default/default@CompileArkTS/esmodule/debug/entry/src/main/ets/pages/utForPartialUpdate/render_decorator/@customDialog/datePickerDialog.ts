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
class DatePickerDialogExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.selectedDate = new Date('2010-01-01');
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.selectedDate !== undefined) {
            this.selectedDate = params.selectedDate;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('DatePickerDialog');
            Button.margin(20);
            Button.onClick(() => {
                this.getUIContext().showDatePickerDialog({
                    start: new Date('2000-01-01'),
                    end: new Date('2100-12-31'),
                    selected: this.selectedDate,
                    showTime: true,
                    useMilitaryTime: false,
                    dateTimeOptions: { hour: "numeric", minute: "2-digit" },
                    onDateAccept: (value) => {
                        this.selectedDate = value;
                        console.info('DatePickerDialog:onDateAccept()' + value.toString());
                    },
                    onCancel: () => {
                        console.info('DatePickerDialog:onCancel()');
                    },
                    onDateChange: (value) => {
                        console.info('DatePickerDialog:onDateChange()' + value.toString());
                    },
                    onDidAppear: () => {
                        console.info('DatePickerDialog:onDidAppear()');
                    },
                    onDidDisappear: () => {
                        console.info('DatePickerDialog:onDidDisappear()');
                    },
                    onWillAppear: () => {
                        console.info('DatePickerDialog:onWillAppear()');
                    },
                    onWillDisappear: () => {
                        console.info('DatePickerDialog:onWillDisappear()');
                    }
                });
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "DatePickerDialogExample";
    }
}
registerNamedRoute(() => new DatePickerDialogExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/datePickerDialog", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/datePickerDialog", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=datePickerDialog.js.map