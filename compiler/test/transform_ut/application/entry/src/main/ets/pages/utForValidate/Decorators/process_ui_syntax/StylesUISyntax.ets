/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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
@Styles
function stylesOne() {
  .width(100)
  console.log(`this is a function`);
}

@Styles
function stylesTwo() {
  .height(200)
}

@Entry
@ComponentV2
struct testStylesV2 {
  @Styles
  innerStylesOne() {
    .width(100)
    console.log(`method`);
  }

  build() {
    Column() {
    }
  }
}

@Component
struct testStyles {
  @Styles
  innerStyles(){
    if(true){
      .width(100)
    }
  }

  build() {
    Row(){

    }
  }
}