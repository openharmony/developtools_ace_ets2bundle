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
// $$ Component
@Entry
@Component
struct $$_allComponent1 {
  build() {
Row() {
  TextPickerSelected();
  ToggleIsOn();
  AlphabetIndexerSelected();
  SelectSelected();
  BindSheetIsShow();
  BindContentCoverIsShow();
  RefreshRefreshing();
  GridItemSelected();
  ListItemSelected();
}
  }
}

@Component
struct TextPickerSelected {
  private select: number = 1;
  private fruits: string[] = ['apple1', 'orange2', 'peach3', 'grape4'];

  build() {
    Row() {
      TextPicker({
        range: this.fruits,
        selected: $$this.select,
        value: $$this.fruits[this.select]
      })
    }
  }
}

@Component
struct ToggleIsOn {
  @State toggleIsOn: boolean = false

  build() {
    Row() {
      Toggle({ type: ToggleType.Switch, isOn: $$this.toggleIsOn })
        .selectedColor('#007DFF')
        .switchPointColor('#FFFFFF')
    }
  }
}

@Component
struct AlphabetIndexerSelected {
  private value: string[] = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'];
  @State alphabetIndexerSelected: number = 0

  build() {
    Row() {
      AlphabetIndexer({ arrayValue: this.value, selected: $$this.alphabetIndexerSelected })
        .autoCollapse(false)
        .enableHapticFeedback(false)
    }
  }
}

@Component
struct SelectSelected {
  @State index: number = 2;
  @State text: string = "TTTTT";

  build() {
    Row() {
      Select([{ value: 'aaa' },
        { value: 'bbb' },
        { value: 'ccc' },
        { value: 'ddd' }])
        .selected($$this.index)
        .value($$this.text)
      Select([{ value: 'aaa' },
        { value: 'bbb' },
        { value: 'ccc' },
        { value: 'ddd' }]) {
      }
      .selected($$this.index)
      .value($$this.text)
    }
  }
}

@Component
struct BindSheetIsShow {
  @State isShow: boolean = false;
  @State sheetHeight: number = 300;

  @Builder
  myBuilder() {

  }

  build() {
    Row() {
      Button("transition modal 1")
        .onClick(() => {
          this.isShow = true;
        })
        .fontSize(20)
        .margin(10)
        .bindSheet($$this.isShow, this.myBuilder(), {
          height: this.sheetHeight,
          backgroundColor: Color.Green,
          onWillAppear: () => {
            console.log("BindSheet onWillAppear.");
          },
          onAppear: () => {
            console.log("BindSheet onAppear.");
          },
          onWillDisappear: () => {
            console.log("BindSheet onWillDisappear.");
          },
          onDisappear: () => {
            console.log("BindSheet onDisappear.");
          }
        })
    }
    .justifyContent(FlexAlign.Center)
    .width('100%')
    .height('100%')
  }
}

@Component
struct BindContentCoverIsShow {
  @State isShow: boolean = false;

  @Builder
  myBuilder() {
  }

  build() {
    Row() {
      Button("transition modal 1")
        .onClick(() => {
          this.isShow = true;
        })
        .fontSize(20)
        .margin(10)
        .bindContentCover(this.isShow, this.myBuilder(), {
          modalTransition: ModalTransition.NONE,
          backgroundColor: Color.Pink,
          onWillAppear: () => {
            console.log("BindContentCover onWillAppear.");
          },
          onAppear: () => {
            console.log("BindContentCover onAppear.");
          },
          onWillDisappear: () => {
            console.log("BindContentCover onWillDisappear.");
          },
          onDisappear: () => {
            console.log("BindContentCover onDisappear.");
          }
        })
    }
    .justifyContent(FlexAlign.Center)
    .backgroundColor("#ff49c8ab")
    .width('100%')
    .height('100%')
  }
}


@Component
struct RefreshRefreshing {
  @State isRefreshing: boolean = false;

  build() {
    Row() {
      Refresh({ refreshing: $$this.isRefreshing }) {
      }

      Refresh({ refreshing: $$this.isRefreshing })
    }
  }
}

@Component
struct GridItemSelected {
  @State gridItemSelected: boolean = true

  build() {
    Column() {
      Grid() {
        GridItem() {
          Text('4')
            .fontSize(16)
            .backgroundColor(0xFAEEE0)
            .width('100%')
            .height('100%')
            .textAlign(TextAlign.Center)
        }
        .rowStart(1)
        .rowEnd(2)
        .columnStart(1)
        .columnEnd(2)
        .selected($$this.gridItemSelected)
      }
    }
  }
}

@Component
struct ListItemSelected {
  @State listItemSelected: boolean = true

  build() {
    Column() {
      List() {
        ListItem() {
          Text('4')
            .fontSize(16)
            .backgroundColor(0xFAEEE0)
            .width('100%')
            .height('100%')
            .textAlign(TextAlign.Center)
        }.selected($$this.listItemSelected)
      }
    }
  }
}
