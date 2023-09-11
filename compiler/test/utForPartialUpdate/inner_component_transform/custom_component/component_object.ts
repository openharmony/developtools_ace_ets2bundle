/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
interface optionsType {
    message: string;
}
let options: optionsType = {message: 'Hi'}
@Entry
@Component
struct Index {
  @State message1: string = 'hello'
  message2: string = 'Hi'
  build() {
    Row() {
      Child({options, message1:this.message1, message2: this.message2})
      Child2(options)
    }
  }
}

@Component
struct Child {
  private options: optionsType;
  @Link message1: string;
  @Prop message2: string;
  build() {
    Column() {
        Text(this.message1)
    }
  }
}

@Component
struct Child2 {
  private message: string;
  build() {
    Column() {
        Text(this.message)
    }
  }
}
`;

exports.expectResult =
`"use strict";
let options = { message: 'Hi' };
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined) {
        super(parent, __localStorage, elmtId);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message1 = new ObservedPropertySimplePU('hello', this, "message1");
        this.message2 = 'Hi';
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.message1 !== undefined) {
            this.message1 = params.message1;
        }
        if (params.message2 !== undefined) {
            this.message2 = params.message2;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message1.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message1.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get message1() {
        return this.__message1.get();
    }
    set message1(newValue) {
        this.__message1.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let paramsLambda = () => {
                        return {
                            options,
                            message1: this.message1,
                            message2: this.message2
                        };
                    };
                    ViewPU.create(new Child(this, { options, message1: this.__message1, message2: this.message2 }, undefined, elmtId, paramsLambda));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        message2: this.message2
                    });
                }
            }, null);
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let paramsLambda = () => {
                        return options;
                    };
                    ViewPU.create(new Child2(this, options, undefined, elmtId, paramsLambda));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, null);
        }
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class Child extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined) {
        super(parent, __localStorage, elmtId);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.options = undefined;
        this.__message1 = new SynchedPropertySimpleTwoWayPU(params.message1, this, "message1");
        this.__message2 = new SynchedPropertySimpleOneWayPU(params.message2, this, "message2");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.options !== undefined) {
            this.options = params.options;
        }
    }
    updateStateVars(params) {
        this.__message2.reset(params.message2);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message1.purgeDependencyOnElmtId(rmElmtId);
        this.__message2.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message1.aboutToBeDeleted();
        this.__message2.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get message1() {
        return this.__message1.get();
    }
    set message1(newValue) {
        this.__message1.set(newValue);
    }
    get message2() {
        return this.__message2.get();
    }
    set message2(newValue) {
        this.__message2.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.message1);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class Child2 extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined) {
        super(parent, __localStorage, elmtId);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.message = undefined;
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.message !== undefined) {
            this.message = params.message;
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
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.message);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
