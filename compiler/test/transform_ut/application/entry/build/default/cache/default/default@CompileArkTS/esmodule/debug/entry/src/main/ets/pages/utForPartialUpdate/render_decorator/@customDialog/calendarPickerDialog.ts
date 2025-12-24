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
class CalendarPickerDialogExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.selectedDate = new Date('2024-03-24');
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
            Button.createWithLabel('Show CalendarPicker Dialog');
            Button.margin(20);
            Button.onClick(() => {
                console.info('CalendarDialog.show');
                CalendarPickerDialog.show({
                    selected: this.selectedDate,
                    backgroundColor: Color.Gray,
                    backgroundBlurStyle: BlurStyle.NONE,
                    shadow: ShadowStyle.OUTER_FLOATING_SM,
                    onAccept: (value) => {
                        this.selectedDate = value;
                        console.info('calendar onAccept:' + JSON.stringify(value));
                    },
                    onCancel: () => {
                        console.info('calendar onCancel');
                    },
                    onChange: (value) => {
                        console.info('calendar onChange:' + JSON.stringify(value));
                    },
                    onDidAppear: () => {
                        console.info('calendar onDidAppear');
                    },
                    onDidDisappear: () => {
                        console.info('calendar onDidDisappear');
                    },
                    onWillAppear: () => {
                        console.info('calendar onWillAppear');
                    },
                    onWillDisappear: () => {
                        console.info('calendar onWillDisappear');
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
        return "CalendarPickerDialogExample";
    }
}
registerNamedRoute(() => new CalendarPickerDialogExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/calendarPickerDialog", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/calendarPickerDialog", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=calendarPickerDialog.js.map