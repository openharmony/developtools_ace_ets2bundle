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

// class without @Component convert tool will not process.
class Month {
    year: number = 2010; // why add assignment here, TS grammar required, if not it will omit by TSC.
    month: number = 2;
    days: number[] = [1, 2];

    constructor(year:number, month:number, days:number[]){
        this.year = year;
        this.month = month;
        this.days = days;
    }
}

@Component
@Entry
struct CalendarDemo {

// simulate with 6 months
@State calendar : Month[] = [
    new Month(2020, 1, [...Array(31).keys()]),
    new Month(2020, 2, [...Array(28).keys()]),
    new Month(2020, 3, [...Array(31).keys()])
]

    build() {
        Column() {
            Button() {
                Text('next month')
            }.onClick(() => {
                this.calendar.shift()
                this.calendar.push(new Month(2020, 4, [...Array(30).keys()]))
            })

            ForEach(this.calendar,
                (item: Month) => {
                    Row() {
                        ForEach(item.days,
                            (day : number) => {
                                Text(`${day}`)
                            },
                            (day : number) => day.toString()) // inner ForEach
                    }
                },
                (item: Month) => (item.year * 12 + item.month).toString()) // outer ForEach
        }
    }
}
