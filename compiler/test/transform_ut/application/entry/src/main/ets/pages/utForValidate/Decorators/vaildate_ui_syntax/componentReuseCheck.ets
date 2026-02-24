/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

 import { ComponentReuse } from '@ohos.arkui.StateManagement';

 @Entry
 @Component
 struct AboutToReuseV1 {
    @State message: string = 'Hello World';

    build() {
        Column() {
            reusablePage()
        }
    }

 }

 @Component
 @Reusable
 struct reusablePage {
    @State message: string = 'Hello World';
    @ComponentReuse
    meReuse0(param: Record<string, Object | null | undefined>) {
        console.info('myReuse0');
    }

    @ComponentReuse
    myReuse1(param: ESObject) {
        console.info('myReuse1');
    }

    @ComponentReuse
    myReuse2(param: object) {
        console.info('myReuse2');
    }

    @ComponentReuse
    myReuse22(param: object, params2: object) {
        console.info('myReuse22');
    }

    aboutToReuse(params: object): void {
        console.info('aboutToReuse');
    }

    @ComponentReuse
    myReuse3(param: Object) {
        console.info('myReuse3');
    }

    build() {
        Column() {
            Text('aaaa')
        }
    }
 }