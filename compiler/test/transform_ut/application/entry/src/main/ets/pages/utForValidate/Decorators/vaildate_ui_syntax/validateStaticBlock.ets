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
/*
 * This test case is used to verify whether a static block is used in a struct.
 */
@Entry
@Component
struct ComponentSample {
  static a:string = 'str';
  static {
    this.a = 'str2';
  }

  build() {
    Column(){
      Text(ComponentSample.a)
      Text(ComponentV2Sample.a)
      Text(DialogSample.a)
      Text(classA.a)
    }
  }
}

@CustomDialog
struct DialogSample {
  cont:CustomDialogController;
  static a:string = 'str';
  static {
    this.a = 'str2';
  }

  build() {

  }
}

@ComponentV2
struct ComponentV2Sample {
  static a:string = 'str';
  static {
    this.a = 'str2';
  }

  build() {

  }
}

class classA{
  static a: string = 'str';
  static {
    classA.a = 'str2';
  }
}