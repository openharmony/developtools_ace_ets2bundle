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

import { Component, Text, WrappedBuilder, Column, ForEach } from "@kit.ArkUI"

interface Person {
    name: string;
    age: number
}

class AB {
    per: string = 'hello';
    bar: Array<string> = new Array<string>('xx', 'yy', 'zz')
}

@Component
struct ImportStruct {
    arr: string[] = ['a', 'b', 'c']
    getArray() {
        return new Array<Person>({ name: 'LiHua', age:25 } as Person, { name: 'Amy', age:18 } as Person)
    }

    build() {
        Column() {
            ForEach(this.arr, (item: string) => {
                Text(item)
            })
            ForEach(this.getArray(), (item: Person) => {
                Text(item.name)
            })
            ForEach((new AB()).bar, (item: string) => {
                Text(item)
            })
            ForEach((new AB()).bar, () => {})
            ForEach<Person>(this.getArray(), () => {})
            ForEach(new Array<string>('1', '2'), () => {
                ForEach(new Array<string>('1', '2'), (item: string) => {
                    Text(item)
                })
            })
        }
    }
}