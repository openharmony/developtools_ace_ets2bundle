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

class TimePickerDialogExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.selectTime = new Date('2020-12-25T08:30:00');
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.selectTime !== undefined) {
            this.selectTime = params.selectTime;
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
            Button.createWithLabel('TimePickerDialog 12小时制');
            Button.margin(20);
            Button.onClick(() => {
                this.getUIContext().showTimePickerDialog({
                    selected: this.selectTime,
                    format: TimePickerFormat.HOUR_MINUTE,
                    useMilitaryTime: false,
                    dateTimeOptions: { hour: "numeric", minute: "2-digit" },
                    onAccept: (value) => {
                        if (value.hour != undefined && value.minute != undefined) {
                            this.selectTime.setHours(value.hour, value.minute);
                            console.info('TimePickerDialog:onAccept()' + JSON.stringify(value));
                        }
                    },
                    onCancel: () => {
                        console.info('TimePickerDialog:onCancel()');
                    },
                    onChange: (value) => {
                        console.info('TimePickerDialog:onChange()' + JSON.stringify(value));
                    },
                    onDidAppear: () => {
                        console.info('TimePickerDialog:onDidAppear()');
                    },
                    onDidDisappear: () => {
                        console.info('TimePickerDialog:onDidDisappear()');
                    },
                    onWillAppear: () => {
                        console.info('TimePickerDialog:onWillAppear()');
                    },
                    onWillDisappear: () => {
                        console.info('TimePickerDialog:onWillDisappear()');
                    }
                });
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("TimePickerDialog 24小时制");
            Button.margin(20);
            Button.onClick(() => {
                this.getUIContext().showTimePickerDialog({
                    selected: this.selectTime,
                    format: TimePickerFormat.HOUR_MINUTE_SECOND,
                    useMilitaryTime: true,
                    onAccept: (value) => {
                        if (value.hour !== undefined && value.minute !== undefined) {
                            this.selectTime.setHours(value.hour, value.minute);
                            console.info('TimePickerDialog:onAccept()' + JSON.stringify(value));
                        }
                    },
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
        return "TimePickerDialogExample";
    }
}
registerNamedRoute(() => new TimePickerDialogExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/timePickerDialog", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/timePickerDialog", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=timePickerDialog.js.map

