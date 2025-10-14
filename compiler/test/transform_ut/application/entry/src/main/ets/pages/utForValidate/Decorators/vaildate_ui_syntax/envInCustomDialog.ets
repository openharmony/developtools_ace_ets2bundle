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
export class WindowSizeLayoutBreakpointInfo {
  widthBreakpoint: WidthBreakpoint = WidthBreakpoint.WIDTH_XS;
  heightBreakpoint: HeightBreakpoint = HeightBreakpoint.HEIGHT_SM;
}

type a = WindowSizeLayoutBreakpointInfo;

class nextBreakPoint extends WindowSizeLayoutBreakpointInfo {
  name: string = '';
}

@Entry
@Component
struct testEnv {
  @State testState: string = 'testState';

  @Builder
  childBuilder() {
    Row() {

    }
  }

  private aaStatic: string = 'aa';
  @Env(`system`) envOne: WindowSizeLayoutBreakpointInfo;
  @Env(`system`) envTwo: a;
  @Env(`aaaaa`) envThree: nextBreakPoint;

  build() {
    Column() {
      Text('this.objOne')
      Button(``)
      testNon({
        // aa: this.envOne,
        paramOne: this.envThree,
        paramTwo: this.envThree,
      })

      testNonV2({
        // aa: this.envOne,
        paramOne: this.envThree,
        paramTwo: this.envThree
      })
    }
  }
}

@Component
struct testNon {
  private aa: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Consume('') testConsume: string = 'testConsume';
  @Require paramOne: WindowSizeLayoutBreakpointInfo;
  @Require paramTwo: WindowSizeLayoutBreakpointInfo;
  @BuilderParam testBuilderParam: () => void;

  build() {

  }
}

@ComponentV2
struct testNonV2 {
  @Local aa: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Consumer('') testConsume: string = 'testConsume';
  @Require @Param paramOne: a;
  @Require @Param paramTwo: WindowSizeLayoutBreakpointInfo;

  build() {

  }
}

@CustomDialog
struct testCustomDialog {
  private controller: CustomDialogController = new CustomDialogController({
    builder: testNonV2
  })
  @Env(`system`) envOne: WindowSizeLayoutBreakpointInfo;

  build() {
    Text('this is a text')
  }
}
