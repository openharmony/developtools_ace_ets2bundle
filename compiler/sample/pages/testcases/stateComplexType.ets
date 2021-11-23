/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

// Customize the status data class.
class Model {
    value: string = '';
    constructor(value: string) {
        this.value = value;
    }
}

@Entry
@Component
struct EntryComponent {
    build() {
        Column(){
            MyComponentState() //MyComponent1 in this document
            MyComponentState() //MyComponent2 in this document
        }
    }
}

@Component
struct MyComponentState {

    @State title: Model = new Model('Hello World')
    @State count: number = 0
    private toggle: boolean = true

    build() {

        Column(){
            Text(`${this.title.value}`)
            Button()
                .onClick(() => {
                    this.toggle != this.toggle;
                    this.title.value = this.toggle ? 'Hello World' : 'Hello Ace';
                }) // Modify the internal status data of MyComponent using the anonymous method.

            Button() {
                Text(`click times: ${this.count}`)
                    .fontSize(10)
            }.onClick(() => {
                this.count += 1
            })
        }

    }
}
