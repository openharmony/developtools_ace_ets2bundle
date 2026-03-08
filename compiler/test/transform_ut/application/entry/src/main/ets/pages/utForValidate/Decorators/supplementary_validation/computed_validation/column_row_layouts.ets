/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

// Category: computed_validation
// Topic: column_row_layouts
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: computed validation Dashboard demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsDashboardColumn_row_layoutsALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation Dashboard left').fontSize(14)
        Blank()
        Text(this.selected ? 'Selected' : 'Idle')
      }
      .width('100%')
      .padding(8)
      Row() {
        Button('Toggle').onClick(() => { this.selected = !this.selected })
      }
    }
    .padding(10)
    .space(6)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsSettingsColumn_row_layoutsBCollection {
  @State items: string[] = ['computed validation Settings one', 'computed validation Settings two', 'computed validation Settings three']

  build() {
    Column() {
      Text('computed validation Settings list').fontSize(16)
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Row() {
              Text(item)
              Blank()
              Text('detail').fontColor('#999999')
            }.width('100%')
          }
        })
      }
    }
    .padding(12)
  }
}

// Case intent: computed validation Security demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsSecurityColumn_row_layoutsCForm {
  @State keyword: string = 'computed validation security'
  @State note: string = 'computed validation Security note'

  build() {
    Column() {
      Text('computed validation Security form').fontSize(16)
      TextInput({ text: this.keyword, placeholder: 'keyword' })
        .onChange((value: string) => { this.keyword = value })
      TextInput({ text: this.note, placeholder: 'note' })
        .onChange((value: string) => { this.note = value })
      Text('Preview: ' + this.keyword + ' / ' + this.note)
    }
    .padding(12)
    .space(8)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsPrivacyColumn_row_layoutsDDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation Privacy' : 'Enable computed validation Privacy')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation Privacy enabled branch').fontColor('#117733')
      } else {
        Text('computed validation Privacy disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation Privacy: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: computed validation Account demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsAccountColumn_row_layoutsEGridBoard {
  @State blocks: string[] = ['computed validation Account A', 'computed validation Account B', 'computed validation Account C', 'computed validation Account D']

  build() {
    Column() {
      Text('computed validation Account board').fontSize(16)
      Grid() {
        ForEach(this.blocks, (block: string) => {
          GridItem() {
            Text(block)
          }
        })
      }
    }
    .padding(10)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsTimelineColumn_row_layoutsFPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation Timeline action panel'

  build() {
    Column() {
      Text('computed validation Timeline').fontSize(18)
      Text(this.subtitle).fontSize(13).fontColor('#666666')
      Row() {
        Button('Primary').onClick(() => { this.clicks += 1 })
        Button('Secondary').onClick(() => { this.clicks = this.clicks > 0 ? this.clicks - 1 : 0 })
      }.space(8)
      Text('Clicks: ' + this.clicks)
    }
    .padding(12)
    .space(8)
  }
}

// Case intent: computed validation Schedule demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsScheduleColumn_row_layoutsGLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation Schedule left').fontSize(14)
        Blank()
        Text(this.selected ? 'Selected' : 'Idle')
      }
      .width('100%')
      .padding(8)
      Row() {
        Button('Toggle').onClick(() => { this.selected = !this.selected })
      }
    }
    .padding(10)
    .space(6)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsHistoryColumn_row_layoutsHCollection {
  @State items: string[] = ['computed validation History one', 'computed validation History two', 'computed validation History three']

  build() {
    Column() {
      Text('computed validation History list').fontSize(16)
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Row() {
              Text(item)
              Blank()
              Text('detail').fontColor('#999999')
            }.width('100%')
          }
        })
      }
    }
    .padding(12)
  }
}

// Case intent: computed validation Favorites demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsFavoritesColumn_row_layoutsIForm {
  @State keyword: string = 'computed validation favorites'
  @State note: string = 'computed validation Favorites note'

  build() {
    Column() {
      Text('computed validation Favorites form').fontSize(16)
      TextInput({ text: this.keyword, placeholder: 'keyword' })
        .onChange((value: string) => { this.keyword = value })
      TextInput({ text: this.note, placeholder: 'note' })
        .onChange((value: string) => { this.note = value })
      Text('Preview: ' + this.keyword + ' / ' + this.note)
    }
    .padding(12)
    .space(8)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsDownloadsColumn_row_layoutsJDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation Downloads' : 'Enable computed validation Downloads')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation Downloads enabled branch').fontColor('#117733')
      } else {
        Text('computed validation Downloads disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation Downloads: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: computed validation Cloud demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsCloudColumn_row_layoutsKGridBoard {
  @State blocks: string[] = ['computed validation Cloud A', 'computed validation Cloud B', 'computed validation Cloud C', 'computed validation Cloud D']

  build() {
    Column() {
      Text('computed validation Cloud board').fontSize(16)
      Grid() {
        ForEach(this.blocks, (block: string) => {
          GridItem() {
            Text(block)
          }
        })
      }
    }
    .padding(10)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsDeviceColumn_row_layoutsLPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation Device action panel'

  build() {
    Column() {
      Text('computed validation Device').fontSize(18)
      Text(this.subtitle).fontSize(13).fontColor('#666666')
      Row() {
        Button('Primary').onClick(() => { this.clicks += 1 })
        Button('Secondary').onClick(() => { this.clicks = this.clicks > 0 ? this.clicks - 1 : 0 })
      }.space(8)
      Text('Clicks: ' + this.clicks)
    }
    .padding(12)
    .space(8)
  }
}

// Case intent: computed validation Sensor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsSensorColumn_row_layoutsMLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation Sensor left').fontSize(14)
        Blank()
        Text(this.selected ? 'Selected' : 'Idle')
      }
      .width('100%')
      .padding(8)
      Row() {
        Button('Toggle').onClick(() => { this.selected = !this.selected })
      }
    }
    .padding(10)
    .space(6)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsControlColumn_row_layoutsNCollection {
  @State items: string[] = ['computed validation Control one', 'computed validation Control two', 'computed validation Control three']

  build() {
    Column() {
      Text('computed validation Control list').fontSize(16)
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Row() {
              Text(item)
              Blank()
              Text('detail').fontColor('#999999')
            }.width('100%')
          }
        })
      }
    }
    .padding(12)
  }
}

// Case intent: computed validation Studio demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsStudioColumn_row_layoutsOForm {
  @State keyword: string = 'computed validation studio'
  @State note: string = 'computed validation Studio note'

  build() {
    Column() {
      Text('computed validation Studio form').fontSize(16)
      TextInput({ text: this.keyword, placeholder: 'keyword' })
        .onChange((value: string) => { this.keyword = value })
      TextInput({ text: this.note, placeholder: 'note' })
        .onChange((value: string) => { this.note = value })
      Text('Preview: ' + this.keyword + ' / ' + this.note)
    }
    .padding(12)
    .space(8)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsCanvasColumn_row_layoutsPDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation Canvas' : 'Enable computed validation Canvas')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation Canvas enabled branch').fontColor('#117733')
      } else {
        Text('computed validation Canvas disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation Canvas: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: computed validation Editor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsEditorColumn_row_layoutsQGridBoard {
  @State blocks: string[] = ['computed validation Editor A', 'computed validation Editor B', 'computed validation Editor C', 'computed validation Editor D']

  build() {
    Column() {
      Text('computed validation Editor board').fontSize(16)
      Grid() {
        ForEach(this.blocks, (block: string) => {
          GridItem() {
            Text(block)
          }
        })
      }
    }
    .padding(10)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsPreviewColumn_row_layoutsRPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation Preview action panel'

  build() {
    Column() {
      Text('computed validation Preview').fontSize(18)
      Text(this.subtitle).fontSize(13).fontColor('#666666')
      Row() {
        Button('Primary').onClick(() => { this.clicks += 1 })
        Button('Secondary').onClick(() => { this.clicks = this.clicks > 0 ? this.clicks - 1 : 0 })
      }.space(8)
      Text('Clicks: ' + this.clicks)
    }
    .padding(12)
    .space(8)
  }
}

// Case intent: computed validation Workspace demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsWorkspaceColumn_row_layoutsSLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation Workspace left').fontSize(14)
        Blank()
        Text(this.selected ? 'Selected' : 'Idle')
      }
      .width('100%')
      .padding(8)
      Row() {
        Button('Toggle').onClick(() => { this.selected = !this.selected })
      }
    }
    .padding(10)
    .space(6)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsMonitorColumn_row_layoutsTCollection {
  @State items: string[] = ['computed validation Monitor one', 'computed validation Monitor two', 'computed validation Monitor three']

  build() {
    Column() {
      Text('computed validation Monitor list').fontSize(16)
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Row() {
              Text(item)
              Blank()
              Text('detail').fontColor('#999999')
            }.width('100%')
          }
        })
      }
    }
    .padding(12)
  }
}

// Case intent: computed validation Terminal demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsTerminalColumn_row_layoutsUForm {
  @State keyword: string = 'computed validation terminal'
  @State note: string = 'computed validation Terminal note'

  build() {
    Column() {
      Text('computed validation Terminal form').fontSize(16)
      TextInput({ text: this.keyword, placeholder: 'keyword' })
        .onChange((value: string) => { this.keyword = value })
      TextInput({ text: this.note, placeholder: 'note' })
        .onChange((value: string) => { this.note = value })
      Text('Preview: ' + this.keyword + ' / ' + this.note)
    }
    .padding(12)
    .space(8)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsToolkitColumn_row_layoutsVDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation Toolkit' : 'Enable computed validation Toolkit')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation Toolkit enabled branch').fontColor('#117733')
      } else {
        Text('computed validation Toolkit disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation Toolkit: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: computed validation Navigator demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsNavigatorColumn_row_layoutsWGridBoard {
  @State blocks: string[] = ['computed validation Navigator A', 'computed validation Navigator B', 'computed validation Navigator C', 'computed validation Navigator D']

  build() {
    Column() {
      Text('computed validation Navigator board').fontSize(16)
      Grid() {
        ForEach(this.blocks, (block: string) => {
          GridItem() {
            Text(block)
          }
        })
      }
    }
    .padding(10)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsDashboardColumn_row_layoutsXPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation Dashboard action panel'

  build() {
    Column() {
      Text('computed validation Dashboard').fontSize(18)
      Text(this.subtitle).fontSize(13).fontColor('#666666')
      Row() {
        Button('Primary').onClick(() => { this.clicks += 1 })
        Button('Secondary').onClick(() => { this.clicks = this.clicks > 0 ? this.clicks - 1 : 0 })
      }.space(8)
      Text('Clicks: ' + this.clicks)
    }
    .padding(12)
    .space(8)
  }
}

// Case intent: computed validation Settings demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsSettingsColumn_row_layoutsYLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation Settings left').fontSize(14)
        Blank()
        Text(this.selected ? 'Selected' : 'Idle')
      }
      .width('100%')
      .padding(8)
      Row() {
        Button('Toggle').onClick(() => { this.selected = !this.selected })
      }
    }
    .padding(10)
    .space(6)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsSecurityColumn_row_layoutsZCollection {
  @State items: string[] = ['computed validation Security one', 'computed validation Security two', 'computed validation Security three']

  build() {
    Column() {
      Text('computed validation Security list').fontSize(16)
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Row() {
              Text(item)
              Blank()
              Text('detail').fontColor('#999999')
            }.width('100%')
          }
        })
      }
    }
    .padding(12)
  }
}

// Case intent: computed validation Privacy demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsPrivacyColumn_row_layoutsAForm {
  @State keyword: string = 'computed validation privacy'
  @State note: string = 'computed validation Privacy note'

  build() {
    Column() {
      Text('computed validation Privacy form').fontSize(16)
      TextInput({ text: this.keyword, placeholder: 'keyword' })
        .onChange((value: string) => { this.keyword = value })
      TextInput({ text: this.note, placeholder: 'note' })
        .onChange((value: string) => { this.note = value })
      Text('Preview: ' + this.keyword + ' / ' + this.note)
    }
    .padding(12)
    .space(8)
  }
}

@Component
struct ComputedValidationColumnRowLayoutsAccountColumn_row_layoutsBDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation Account' : 'Enable computed validation Account')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation Account enabled branch').fontColor('#117733')
      } else {
        Text('computed validation Account disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation Account: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: computed validation Timeline demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct ComputedValidationColumnRowLayoutsTimelineColumn_row_layoutsCGridBoard {
  @State blocks: string[] = ['computed validation Timeline A', 'computed validation Timeline B', 'computed validation Timeline C', 'computed validation Timeline D']

  build() {
    Column() {
      Text('computed validation Timeline board').fontSize(16)
      Grid() {
        ForEach(this.blocks, (block: string) => {
          GridItem() {
            Text(block)
          }
        })
      }
    }
    .padding(10)
  }
}

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct ComputedValidationColumnRowLayoutsColumn_row_layoutsHost {
  build() {
    Column() {
      Text('computed validation column_row_layouts host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
