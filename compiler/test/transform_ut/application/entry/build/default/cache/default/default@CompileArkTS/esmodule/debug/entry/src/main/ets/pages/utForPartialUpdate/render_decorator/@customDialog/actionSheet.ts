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
class ActionSheetExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
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
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center });
            Flex.width('100%');
            Flex.height('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Click to Show ActionSheet');
            Button.onClick(() => {
                this.getUIContext().showActionSheet({
                    title: 'ActionSheet title',
                    subtitle: 'ActionSheet subtitle',
                    message: 'message',
                    autoCancel: true,
                    confirm: {
                        defaultFocus: true,
                        value: 'Confirm button',
                        action: () => {
                            console.info('Get ActionSheet handled');
                        }
                    },
                    cancel: () => {
                        console.info('ActionSheet canceled');
                    },
                    onWillDismiss: (dismissDialogAction) => {
                        console.info(`reason= ${dismissDialogAction.reason}`);
                        console.info('ActionSheet onWillDismiss');
                        if (dismissDialogAction.reason === DismissReason.PRESS_BACK) {
                            dismissDialogAction.dismiss();
                        }
                        if (dismissDialogAction.reason === DismissReason.TOUCH_OUTSIDE) {
                            dismissDialogAction.dismiss();
                        }
                    },
                    alignment: DialogAlignment.Bottom,
                    offset: { dx: 0, dy: -10 },
                    sheets: [
                        {
                            title: 'apples',
                            action: () => {
                                console.info('apples');
                            }
                        },
                        {
                            title: 'bananas',
                            action: () => {
                                console.info('bananas');
                            }
                        },
                        {
                            title: 'pears',
                            action: () => {
                                console.info('pears');
                            }
                        }
                    ]
                });
            });
        }, Button);
        Button.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "ActionSheetExample";
    }
}
registerNamedRoute(() => new ActionSheetExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/actionSheet", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/actionSheet", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=actionSheet.js.map
