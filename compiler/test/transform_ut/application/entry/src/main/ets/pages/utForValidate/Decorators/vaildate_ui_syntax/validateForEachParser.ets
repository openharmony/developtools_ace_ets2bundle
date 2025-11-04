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
 // test the parser period of ForEach
@Entry
@Component
struct ForEachDemo {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    Column() {
      List() {
        ForEach(this.arr.filter((item)=>{return true}), (item:string, index:number)=>{
          ListItem() {
            Text(item)
          }
        })
      }
    }
  }
}

@Component
struct ForEachDemo2 {
  build() {
    Column() {
      List() {
        ForEach((()=>{return ['1', '2', '3']})(), (item:string, index:number)=>{
          ListItem() {
            Text(item)
          }
        })
      }
    }
  }
}

@Component
struct ForEachDemo3 {
  build() {
    Column() {
      List() {
        ForEach([()=>{return '1'}, ()=>{return '2'}, ()=>{return '3'}], (item:()=>string, index)=>{
          ListItem() {
            Text(item())
          }
        })
      }
    }
  }
}

@Component
struct ForEachDemo4 {
  @Prop props;
  build() {
    Column() {
      List() {
        ForEach((()=>{return ['1', '2', '3']})(), (item:string, index:number)=>{
          ListItem() {
            Text(item)
          }
        })
      }
    }
  }
}