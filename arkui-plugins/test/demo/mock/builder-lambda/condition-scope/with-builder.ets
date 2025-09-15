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

import { Text, Column, Component, Builder, BuilderParam, WrappedBuilder, wrapBuilder } from "@ohos.arkui.component"

@Builder
function MyBuilder(): void {
    if (true) {
        Text('within Builder function');
    }
}

@Builder
function ParamBuilder(@Builder param: (() => void) = () => {
    if (true) {
        Text('within Builder parameter')
    }
}): void {
    param();
}

const wBuilder = wrapBuilder(ParamBuilder);

@Component
struct MyStruct {
    @Builder
    public myBuilderMethod() {
        if (true) {
            Text('within Builder method');
        }
    }

    build() {
        Column() {
            wBuilder.builder(@Builder () => {
                if (true) {
                Text('with Builder lambda');
                }
            });
            Child({
                myBuilderParam: () => {
                if (true) {
                    Text('within Builder property')
                }
                this.myBuilderMethod();
                }
            })
        }
    }
}

@Component
struct Child {
    @BuilderParam myBuilderParam: () => void = () => {
        if (true) {
            Text('within BuilderParam property');
        }
    }
    build() {
        if (true) {
            Text('within struct build');
        }
    }
}