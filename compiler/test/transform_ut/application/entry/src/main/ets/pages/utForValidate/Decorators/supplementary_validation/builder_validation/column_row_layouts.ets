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

// Category: builder_validation
// Topic: column_row_layouts
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: builder validation Dashboard demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsDashboardColumn_row_layoutsAPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation Dashboard action panel'

  build() {
    Column() {
      Text('builder validation Dashboard').fontSize(18)
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

@Component
struct BuilderValidationColumnRowLayoutsSettingsColumn_row_layoutsBLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation Settings left').fontSize(14)
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

// Case intent: builder validation Security demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsSecurityColumn_row_layoutsCCollection {
  @State items: string[] = ['builder validation Security one', 'builder validation Security two', 'builder validation Security three']

  build() {
    Column() {
      Text('builder validation Security list').fontSize(16)
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

@Component
struct BuilderValidationColumnRowLayoutsPrivacyColumn_row_layoutsDForm {
  @State keyword: string = 'builder validation privacy'
  @State note: string = 'builder validation Privacy note'

  build() {
    Column() {
      Text('builder validation Privacy form').fontSize(16)
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

// Case intent: builder validation Account demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsAccountColumn_row_layoutsEDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation Account' : 'Enable builder validation Account')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation Account enabled branch').fontColor('#117733')
      } else {
        Text('builder validation Account disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation Account: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct BuilderValidationColumnRowLayoutsTimelineColumn_row_layoutsFGridBoard {
  @State blocks: string[] = ['builder validation Timeline A', 'builder validation Timeline B', 'builder validation Timeline C', 'builder validation Timeline D']

  build() {
    Column() {
      Text('builder validation Timeline board').fontSize(16)
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

// Case intent: builder validation Schedule demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsScheduleColumn_row_layoutsGPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation Schedule action panel'

  build() {
    Column() {
      Text('builder validation Schedule').fontSize(18)
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

@Component
struct BuilderValidationColumnRowLayoutsHistoryColumn_row_layoutsHLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation History left').fontSize(14)
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

// Case intent: builder validation Favorites demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsFavoritesColumn_row_layoutsICollection {
  @State items: string[] = ['builder validation Favorites one', 'builder validation Favorites two', 'builder validation Favorites three']

  build() {
    Column() {
      Text('builder validation Favorites list').fontSize(16)
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

@Component
struct BuilderValidationColumnRowLayoutsDownloadsColumn_row_layoutsJForm {
  @State keyword: string = 'builder validation downloads'
  @State note: string = 'builder validation Downloads note'

  build() {
    Column() {
      Text('builder validation Downloads form').fontSize(16)
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

// Case intent: builder validation Cloud demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsCloudColumn_row_layoutsKDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation Cloud' : 'Enable builder validation Cloud')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation Cloud enabled branch').fontColor('#117733')
      } else {
        Text('builder validation Cloud disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation Cloud: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct BuilderValidationColumnRowLayoutsDeviceColumn_row_layoutsLGridBoard {
  @State blocks: string[] = ['builder validation Device A', 'builder validation Device B', 'builder validation Device C', 'builder validation Device D']

  build() {
    Column() {
      Text('builder validation Device board').fontSize(16)
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

// Case intent: builder validation Sensor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsSensorColumn_row_layoutsMPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation Sensor action panel'

  build() {
    Column() {
      Text('builder validation Sensor').fontSize(18)
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

@Component
struct BuilderValidationColumnRowLayoutsControlColumn_row_layoutsNLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation Control left').fontSize(14)
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

// Case intent: builder validation Studio demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsStudioColumn_row_layoutsOCollection {
  @State items: string[] = ['builder validation Studio one', 'builder validation Studio two', 'builder validation Studio three']

  build() {
    Column() {
      Text('builder validation Studio list').fontSize(16)
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

@Component
struct BuilderValidationColumnRowLayoutsCanvasColumn_row_layoutsPForm {
  @State keyword: string = 'builder validation canvas'
  @State note: string = 'builder validation Canvas note'

  build() {
    Column() {
      Text('builder validation Canvas form').fontSize(16)
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

// Case intent: builder validation Editor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsEditorColumn_row_layoutsQDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation Editor' : 'Enable builder validation Editor')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation Editor enabled branch').fontColor('#117733')
      } else {
        Text('builder validation Editor disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation Editor: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct BuilderValidationColumnRowLayoutsPreviewColumn_row_layoutsRGridBoard {
  @State blocks: string[] = ['builder validation Preview A', 'builder validation Preview B', 'builder validation Preview C', 'builder validation Preview D']

  build() {
    Column() {
      Text('builder validation Preview board').fontSize(16)
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

// Case intent: builder validation Workspace demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsWorkspaceColumn_row_layoutsSPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation Workspace action panel'

  build() {
    Column() {
      Text('builder validation Workspace').fontSize(18)
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

@Component
struct BuilderValidationColumnRowLayoutsMonitorColumn_row_layoutsTLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation Monitor left').fontSize(14)
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

// Case intent: builder validation Terminal demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsTerminalColumn_row_layoutsUCollection {
  @State items: string[] = ['builder validation Terminal one', 'builder validation Terminal two', 'builder validation Terminal three']

  build() {
    Column() {
      Text('builder validation Terminal list').fontSize(16)
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

@Component
struct BuilderValidationColumnRowLayoutsToolkitColumn_row_layoutsVForm {
  @State keyword: string = 'builder validation toolkit'
  @State note: string = 'builder validation Toolkit note'

  build() {
    Column() {
      Text('builder validation Toolkit form').fontSize(16)
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

// Case intent: builder validation Navigator demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsNavigatorColumn_row_layoutsWDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation Navigator' : 'Enable builder validation Navigator')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation Navigator enabled branch').fontColor('#117733')
      } else {
        Text('builder validation Navigator disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation Navigator: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct BuilderValidationColumnRowLayoutsDashboardColumn_row_layoutsXGridBoard {
  @State blocks: string[] = ['builder validation Dashboard A', 'builder validation Dashboard B', 'builder validation Dashboard C', 'builder validation Dashboard D']

  build() {
    Column() {
      Text('builder validation Dashboard board').fontSize(16)
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

// Case intent: builder validation Settings demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsSettingsColumn_row_layoutsYPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation Settings action panel'

  build() {
    Column() {
      Text('builder validation Settings').fontSize(18)
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

@Component
struct BuilderValidationColumnRowLayoutsSecurityColumn_row_layoutsZLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation Security left').fontSize(14)
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

// Case intent: builder validation Privacy demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsPrivacyColumn_row_layoutsACollection {
  @State items: string[] = ['builder validation Privacy one', 'builder validation Privacy two', 'builder validation Privacy three']

  build() {
    Column() {
      Text('builder validation Privacy list').fontSize(16)
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

@Component
struct BuilderValidationColumnRowLayoutsAccountColumn_row_layoutsBForm {
  @State keyword: string = 'builder validation account'
  @State note: string = 'builder validation Account note'

  build() {
    Column() {
      Text('builder validation Account form').fontSize(16)
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

// Case intent: builder validation Timeline demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct BuilderValidationColumnRowLayoutsTimelineColumn_row_layoutsCDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation Timeline' : 'Enable builder validation Timeline')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation Timeline enabled branch').fontColor('#117733')
      } else {
        Text('builder validation Timeline disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation Timeline: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct BuilderValidationColumnRowLayoutsColumn_row_layoutsHost {
  build() {
    Column() {
      Text('builder validation column_row_layouts host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
