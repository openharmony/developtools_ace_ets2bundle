/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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


//  ArkTS1.2
import { __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import { ArkUICompatible, InteropComponent, Text, TextAttribute, Column, Component, Button, ButtonAttribute, ClickEvent, UserView, } from "@ohos.arkui.component" // TextAttribute should be insert by ui-plugins
import { State, StateDecoratedVariable, MutableState, stateOf, observableProxy, Observed, Track, Provide, Consume } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import { MyText } from 'har2/src/main/ets/components/MainPage'
import { Child1 } from 'har1'


@Component
struct MyStateSample {
    @State stateVar: new MyText();
    build() {
        Column() {
            Button(this.stateVar.text)
                .onClick((e: ClickEvent) => {
                    this.stateVar.text += '~';
                })
            Child({stateVar: this.stateVar})
        }
    }
}

@Component
struct Child {
    @Link stateVar;
    build() {
        Column() {
            Button(this.stateVar.text)
                .onClick((e: ClickEvent) => {
                    this.stateVar.text += '~';
                })
            Child1({stateVar: this.stateVar, text: this.stateVar})
        }
    }
}

class MyText {
    text: string = 'MyText';
}


//ArkT1.1
import { MyText } from 'har2/src/main/ets/components/MainPage'

@Component
export struct Child1{
    @Link stateVar: MyText;
    @Link text: MyText;
    build() {
        Column() {
            Button(this.stateVar.text)
                .onClick(() => {
                    this.stateVar.text += '~';
                })
            Button(this.text.text)
                .onClick(() => {
                    this.text.text = 'ArkTS1.1';
                })
        }
    }
}


//transform 1.1struct 'Child1' to ArkUICompatible

ArkUICompatible(__memo_context, ((__memo_id) + (252133223)), (() => {
    let global = ESValue.getGlobal();
    let param = ESValue.instantiateEmptyObject();
    let createState = global.getProperty("createStateVariable");
    let stateVar_SetSource = ((value: MyText) => {
        (this).stateVar = value;
    });
    let stateVar_ProxyState = createState.invoke(ESValue.wrap((this).stateVar), ESValue.wrap(stateVar_SetSource));
    (this).__backing_stateVar!.setProxy(stateVar_ProxyState);
    let stateVar_SetProxy = ((value: MyText) => {
        stateVar_ProxyState.invokeMethod("set", ESValue.wrap(value));
    });
    (this).__backing_stateVar!.setProxyValue = stateVar_SetProxy;
    let stateVar_NotifyCallback = ((propertyName: string) => {
        stateVar_ProxyState.invokeMethod("notifyPropertyHasChangedPU");
    });
    (this).__backing_stateVar!.setNotifyCallback(stateVar_NotifyCallback);
    param.setProperty("stateVar", stateVar_ProxyState);
    param.setProperty("text", stateVar_ProxyState);
    let extraInfo = ESValue.instantiateEmptyObject();
    extraInfo.setProperty("page", "har1/src/main/ets/components/MainPage");
    let esundefined = ESValue.wrap(undefined);
    let blank = (() => {});
    let esblank = ESValue.wrap((blank as object));
    let viewStackProcessor = global.getProperty("ViewStackProcessor");
    let createId = viewStackProcessor.getProperty("AllocateNewElmetIdForNextComponent");
    let elmtId = createId.invoke();
    let har1 = ESValue.load("@normalized:N&entry&com.example.Interop2use1&har1/src/main/ets/components/MainPage&1.0.0");
    let structObject = har1.getProperty("Child1");
    let component = structObject.instantiate(esundefined, param, esundefined, elmtId, esblank, extraInfo);
    let create = structObject.getProperty("create");
    create.invoke(component);
    return {
        component: component,
        name: "Child1",
    };
}), ((instance: ESValue) => {}));