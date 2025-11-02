/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
 // test the parser period of Repeat
@Entry
@ComponentV2
struct Demo {
  @Require @Param props;
  @Local arr:string[] = [];
  aboutToAppear(): void {
    for(let i = 0; i < 100; i++) {
      this.arr.push(i.toString())
    }
  }
  build() {
    Column() {
      Button("test")
        .onClick(()=>{
          this.arr[20] = this.arr[20] + 'a';
          this.arr[21] = this.arr[21] + 'a';
        })
      List() {
        Repeat(this.arr)
          .each((item)=>{
            ListItem() {
              Text(item.item)
            }
          })
          .virtualScroll()
      }
      .cachedCount(1)
      .height('30%')
    }
  }
}

@ComponentV2
struct RepeatDemo {
  @Local arr: string[] = ['1', '2', '3'];
  build() {
    Column() {
      List() {
        Repeat(this.arr)
          .each((item)=>{})
          .templateId(()=>{return 'temp'})
          .template((()=>{return 'temp'})(), (item)=>{
            ListItem() {
              Text(item.item)
            }
          })
      }
    }
  }
}