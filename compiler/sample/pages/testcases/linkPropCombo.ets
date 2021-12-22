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

@Component
@Entry
struct ParentView {
    @State counter:number = 0;
    build() {
        Column() {
            ChildA({counterVal: this.counter})
            ChildB({counterRef: $counter})
        }
    }
}

@Component
struct ChildA {
    @Prop counterVal: number;
    build() {
        Button() {
            Text(`ChildA: (${this.counterVal}) +1`)
        }
        .onClick(() => this.counterVal += 1)
    }
}

@Component
struct ChildB {
    @Link counterRef: number;
    build() {
        Button() {
            Text(`ChildB: (${this.counterRef}) +1`)
        }
        .onClick(() => this.counterRef += 1)
    }
}
