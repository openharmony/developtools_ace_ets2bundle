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

// Category: syntax_validation
// Topic: column_row_layouts
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: syntax validation Dashboard demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsDashboardColumn_row_layoutsAGridBoard {
  @State blocks: string[] = ['syntax validation Dashboard A', 'syntax validation Dashboard B', 'syntax validation Dashboard C', 'syntax validation Dashboard D']

  build() {
    Column() {
      Text('syntax validation Dashboard board').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsSettingsColumn_row_layoutsBPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation Settings action panel'

  build() {
    Column() {
      Text('syntax validation Settings').fontSize(18)
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

// Case intent: syntax validation Security demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsSecurityColumn_row_layoutsCLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation Security left').fontSize(14)
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
struct SyntaxValidationColumnRowLayoutsPrivacyColumn_row_layoutsDCollection {
  @State items: string[] = ['syntax validation Privacy one', 'syntax validation Privacy two', 'syntax validation Privacy three']

  build() {
    Column() {
      Text('syntax validation Privacy list').fontSize(16)
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

// Case intent: syntax validation Account demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsAccountColumn_row_layoutsEForm {
  @State keyword: string = 'syntax validation account'
  @State note: string = 'syntax validation Account note'

  build() {
    Column() {
      Text('syntax validation Account form').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsTimelineColumn_row_layoutsFDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation Timeline' : 'Enable syntax validation Timeline')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation Timeline enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation Timeline disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation Timeline: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: syntax validation Schedule demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsScheduleColumn_row_layoutsGGridBoard {
  @State blocks: string[] = ['syntax validation Schedule A', 'syntax validation Schedule B', 'syntax validation Schedule C', 'syntax validation Schedule D']

  build() {
    Column() {
      Text('syntax validation Schedule board').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsHistoryColumn_row_layoutsHPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation History action panel'

  build() {
    Column() {
      Text('syntax validation History').fontSize(18)
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

// Case intent: syntax validation Favorites demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsFavoritesColumn_row_layoutsILayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation Favorites left').fontSize(14)
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
struct SyntaxValidationColumnRowLayoutsDownloadsColumn_row_layoutsJCollection {
  @State items: string[] = ['syntax validation Downloads one', 'syntax validation Downloads two', 'syntax validation Downloads three']

  build() {
    Column() {
      Text('syntax validation Downloads list').fontSize(16)
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

// Case intent: syntax validation Cloud demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsCloudColumn_row_layoutsKForm {
  @State keyword: string = 'syntax validation cloud'
  @State note: string = 'syntax validation Cloud note'

  build() {
    Column() {
      Text('syntax validation Cloud form').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsDeviceColumn_row_layoutsLDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation Device' : 'Enable syntax validation Device')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation Device enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation Device disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation Device: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: syntax validation Sensor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsSensorColumn_row_layoutsMGridBoard {
  @State blocks: string[] = ['syntax validation Sensor A', 'syntax validation Sensor B', 'syntax validation Sensor C', 'syntax validation Sensor D']

  build() {
    Column() {
      Text('syntax validation Sensor board').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsControlColumn_row_layoutsNPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation Control action panel'

  build() {
    Column() {
      Text('syntax validation Control').fontSize(18)
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

// Case intent: syntax validation Studio demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsStudioColumn_row_layoutsOLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation Studio left').fontSize(14)
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
struct SyntaxValidationColumnRowLayoutsCanvasColumn_row_layoutsPCollection {
  @State items: string[] = ['syntax validation Canvas one', 'syntax validation Canvas two', 'syntax validation Canvas three']

  build() {
    Column() {
      Text('syntax validation Canvas list').fontSize(16)
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

// Case intent: syntax validation Editor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsEditorColumn_row_layoutsQForm {
  @State keyword: string = 'syntax validation editor'
  @State note: string = 'syntax validation Editor note'

  build() {
    Column() {
      Text('syntax validation Editor form').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsPreviewColumn_row_layoutsRDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation Preview' : 'Enable syntax validation Preview')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation Preview enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation Preview disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation Preview: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: syntax validation Workspace demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsWorkspaceColumn_row_layoutsSGridBoard {
  @State blocks: string[] = ['syntax validation Workspace A', 'syntax validation Workspace B', 'syntax validation Workspace C', 'syntax validation Workspace D']

  build() {
    Column() {
      Text('syntax validation Workspace board').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsMonitorColumn_row_layoutsTPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation Monitor action panel'

  build() {
    Column() {
      Text('syntax validation Monitor').fontSize(18)
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

// Case intent: syntax validation Terminal demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsTerminalColumn_row_layoutsULayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation Terminal left').fontSize(14)
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
struct SyntaxValidationColumnRowLayoutsToolkitColumn_row_layoutsVCollection {
  @State items: string[] = ['syntax validation Toolkit one', 'syntax validation Toolkit two', 'syntax validation Toolkit three']

  build() {
    Column() {
      Text('syntax validation Toolkit list').fontSize(16)
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

// Case intent: syntax validation Navigator demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsNavigatorColumn_row_layoutsWForm {
  @State keyword: string = 'syntax validation navigator'
  @State note: string = 'syntax validation Navigator note'

  build() {
    Column() {
      Text('syntax validation Navigator form').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsDashboardColumn_row_layoutsXDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation Dashboard' : 'Enable syntax validation Dashboard')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation Dashboard enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation Dashboard disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation Dashboard: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: syntax validation Settings demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsSettingsColumn_row_layoutsYGridBoard {
  @State blocks: string[] = ['syntax validation Settings A', 'syntax validation Settings B', 'syntax validation Settings C', 'syntax validation Settings D']

  build() {
    Column() {
      Text('syntax validation Settings board').fontSize(16)
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
struct SyntaxValidationColumnRowLayoutsSecurityColumn_row_layoutsZPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation Security action panel'

  build() {
    Column() {
      Text('syntax validation Security').fontSize(18)
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

// Case intent: syntax validation Privacy demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsPrivacyColumn_row_layoutsALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation Privacy left').fontSize(14)
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
struct SyntaxValidationColumnRowLayoutsAccountColumn_row_layoutsBCollection {
  @State items: string[] = ['syntax validation Account one', 'syntax validation Account two', 'syntax validation Account three']

  build() {
    Column() {
      Text('syntax validation Account list').fontSize(16)
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

// Case intent: syntax validation Timeline demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct SyntaxValidationColumnRowLayoutsTimelineColumn_row_layoutsCForm {
  @State keyword: string = 'syntax validation timeline'
  @State note: string = 'syntax validation Timeline note'

  build() {
    Column() {
      Text('syntax validation Timeline form').fontSize(16)
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

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct SyntaxValidationColumnRowLayoutsColumn_row_layoutsHost {
  build() {
    Column() {
      Text('syntax validation column_row_layouts host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
