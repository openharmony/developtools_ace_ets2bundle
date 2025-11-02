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
struct dollarComponent {
  build() {
    Row() {
      CheckboxExample();
      CheckboxGroupSelectAll();
      DatePickerSelected();
      TimePickerSelected();
      MenuItemSelected();
      PanelModeMode();
      RadioChecked();
      RatingRating();
      SearchValue();
      SideBarContainerShowSideBar();
      SliderValue();
      StepperIndex();
      SwiperIndex();
      TabsIndex();
      TextAreaText();
      TextInputText();
    }
  }
}


@Component
struct CheckboxExample {
  @State checkboxSelect: boolean = true;

  build() {
    Row() {
      Checkbox({ name: 'checkbox1', group: 'checkboxGroup' })
        .select($$this.checkboxSelect)
      Checkbox({ name: 'checkbox2', group: 'checkboxGroup' }) {
      }
      .select($$this.checkboxSelect)

    }
  }
}

@Component
struct CheckboxGroupSelectAll {
  @State checkboxGroupSelectAll: boolean = true;

  build() {
    Row() {
      CheckboxGroup({ group: 'checkboxGroup' })
        .selectAll($$this.checkboxGroupSelectAll)
      CheckboxGroup({ group: 'checkboxGroup' }) {
      }
      .selectAll($$this.checkboxGroupSelectAll)
    }
  }
}

@Component
struct DatePickerSelected {
  @State selectedDate: Date = new Date('2021-08-08');

  build() {
    Row() {
      DatePicker({
        start: new Date('1970-1-1'),
        end: new Date('2100-1-1'),
        selected: $$this.selectedDate
      })
    }
  }
}

@Component
struct TimePickerSelected {
  @State selectedTime: Date = new Date('2022-07-22T08:00:00');

  build() {
    Row() {
      TimePicker({
        selected: this.selectedTime
      })
    }
  }
}

@Component
struct MenuItemSelected {
  @State select: boolean = true;

  build() {
    Menu() {
      MenuItem({
        content: "菜单选项",
      }).selected($$this.select)
    }
  }
}

@Component
struct PanelModeMode {
  @State show: boolean = false;
  @State message: PanelMode = PanelMode.Mini

  build() {
    Panel(this.show) { // 展示日程
      Column() {
        Text('Today Calendar')
        Divider()
        Text('1. afternoon 4:00 The project meeting')
      }
    }
    .mode($$this.message)
  }
}

@Component
struct RadioChecked {
  @State radioChecked: boolean = true;

  build() {
    Row() {
      Radio({ value: 'Radio1', group: 'radioGroup' })
        .checked($$this.radioChecked)
    }
  }
}

@Component
struct RatingRating {
  @State rating: number = 3.5;

  build() {
    Row() {
      Rating({ rating: $$this.rating, indicator: false })
    }
  }
}

@Component
struct SearchValue {
  @State changeValue: string = '';
  @State submitValue: string = '';
  @State positionInfo: CaretOffset = { index: 0, x: 0, y: 0 };
  controller: SearchController = new SearchController();

  build() {
    Search({ value: $$this.changeValue, placeholder: 'Type to search...', controller: this.controller })
  }
}

@Component
struct SideBarContainerShowSideBar {
  @State SideBarContainerShowSideBar: boolean = true

  build() {
    Row() {
      SideBarContainer(SideBarContainerType.Embed)
        .showSideBar($$this.SideBarContainerShowSideBar)
      SideBarContainer(SideBarContainerType.Embed) {
      }
      .showSideBar($$this.SideBarContainerShowSideBar)

    }
  }
}

@Component
struct SliderValue {
  @State outSetValueOne: number = 40;

  build() {
    Row() {
      Slider({
        value: $$this.outSetValueOne,
        min: 0,
        max: 100,
        style: SliderStyle.OutSet
      })
        .showTips(true)
    }
  }
}

@Component
struct StepperIndex {
  @State currentIndex: number = 0;

  build() {
    Row() {
      Stepper({
        index: $$this.currentIndex
      })
    }
  }
}

@Component
struct SwiperIndex {
  private swiperController: SwiperController = new SwiperController();
  @State swiperIndex: number = 2

  build() {
    Row() {
      Swiper(this.swiperController) {

      }
      .cachedCount(2)
      .index($$this.swiperIndex)

      Swiper(this.swiperController)
        .cachedCount(2)
        .index($$this.swiperIndex)
    }
  }
}

@Component
struct TabsIndex {
  @State currentIndex: number = 0;
  private controller: TabsController = new TabsController();

  build() {
    Row() {
      Tabs({ barPosition: BarPosition.Start, index: $$this.currentIndex, controller: this.controller })
      Tabs({ barPosition: BarPosition.Start, index: $$this.currentIndex, controller: this.controller }) {
      }
    }
  }
}

@Component
struct TextAreaText {
  @State text: string = '';
  controller: TextAreaController = new TextAreaController();

  build() {
    Row() {
      TextArea({
        text: $$this.text,
        placeholder: 'The text area can hold an unlimited amount of text. input your word...',
        controller: this.controller
      })
        .placeholderFont({ size: 16, weight: 400 })
        .width(336)
    }
  }
}

@Component
struct TextInputText {
  @State text: string = '';
  controller: TextInputController = new TextInputController();

  build() {
    Row() {
      TextInput({ text: $$this.text, placeholder: 'input your word...', controller: this.controller })
        .placeholderColor(Color.Grey)
        .placeholderFont({ size: 14, weight: 400 })
    }
  }
}
