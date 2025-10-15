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
  @State @Env(`system`) envOne: WindowSizeLayoutBreakpointInfo;
  @Require @Env(`system`) envTwo: a;
  @BuilderParam @Env(`aaaaa`) envThree: nextBreakPoint;
  @Env(`aaa`) @Env(`aaaaa`) envFour: nextBreakPoint;

  build() {
    Column() {
      Text('this.objOne')
      Button(``)
      testNon({
        paramOne: this.envThree,
        paramTwo: this.envThree,
      })

      testNonV2({
        paramOne: this.envThree,
        paramTwo: this.envThree
      })
    }
  }
}

@ComponentV2
struct testEnv2 {
  @Local testState: string = 'testState';

  @Builder
  childBuilder() {
    Row() {

    }
  }

  private aaStatic: string = 'aa';
  @Local @Env(`system`) envOne: WindowSizeLayoutBreakpointInfo;
  @Require @Env(`system`) envTwo: a;
  @BuilderParam @Env(`aaaaa`) envThree: nextBreakPoint;
  @Env(`aaa`) @Env(`aaaaa`) envFour: nextBreakPoint;

  build() {
    Column() {
      Text('this.objOne')
      Button(``)
      testNon({
        paramOne: this.envThree,
        paramTwo: this.envThree,
      })

      testNonV2({
        paramOne: this.envThree,
        paramTwo: this.envThree
      })
    }
  }
}

@Component
struct testNon {
  @State aa: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Prop commonOne: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
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
  @Provider(`p1`) bb: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Consumer('') testConsume: string = 'testConsume';
  @Require @Param paramOne: a;
  @Require @Param paramTwo: WindowSizeLayoutBreakpointInfo;

  build() {

  }
}
