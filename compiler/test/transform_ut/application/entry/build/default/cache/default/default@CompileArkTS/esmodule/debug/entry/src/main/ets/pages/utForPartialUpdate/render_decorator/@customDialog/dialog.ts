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
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
// dialog test.
import { TipsDialog } from '@kit.ArkUI';
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.dialogControllerImage = new CustomDialogController({
            builder: TipsDialog({
                    imageRes: $r('sys.media.ohos_ic_public_voice'),
                    content: '想要卸载这个APP嘛?',
                    primaryButton: {
                        value: '取消',
                        action: () => {
                            console.info('Callback when the first button is clicked');
                        },
                    },
                    secondaryButton: {
                        value: '删除',
                        role: ButtonRole.ERROR,
                        action: () => {
                            console.info('Callback when the second button is clicked');
                        }
                    },
                    onCheckedChange: () => {
                        console.info('Callback when the checkbox is clicked');
                    }
                })
        }, this);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.dialogControllerImage !== undefined) {
            this.dialogControllerImage = params.dialogControllerImage;
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
            Row.create();
            Row.backgroundImageSize({ width: '100%', height: '100%' });
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.align(Alignment.Bottom);
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.margin({ bottom: 300 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("上图下文弹出框");
            Button.width(96);
            Button.height(40);
            Button.onClick(() => {
                this.dialogControllerImage.open();
            });
        }, Button);
        Button.pop();
        Column.pop();
        Stack.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@customDialog/dialog", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@customDialog/dialog", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=dialog.js.map
