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

// Category: decorator_validation
// Topic: column_row_layouts
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: decorator validation Dashboard demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsDashboardColumn_row_layoutsACollection {
  @State items: string[] = ['decorator validation Dashboard one', 'decorator validation Dashboard two', 'decorator validation Dashboard three']

  build() {
    Column() {
      Text('decorator validation Dashboard list').fontSize(16)
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
struct DecoratorValidationColumnRowLayoutsSettingsColumn_row_layoutsBForm {
  @State keyword: string = 'decorator validation settings'
  @State note: string = 'decorator validation Settings note'

  build() {
    Column() {
      Text('decorator validation Settings form').fontSize(16)
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

// Case intent: decorator validation Security demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsSecurityColumn_row_layoutsCDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation Security' : 'Enable decorator validation Security')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation Security enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation Security disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation Security: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DecoratorValidationColumnRowLayoutsPrivacyColumn_row_layoutsDGridBoard {
  @State blocks: string[] = ['decorator validation Privacy A', 'decorator validation Privacy B', 'decorator validation Privacy C', 'decorator validation Privacy D']

  build() {
    Column() {
      Text('decorator validation Privacy board').fontSize(16)
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

// Case intent: decorator validation Account demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsAccountColumn_row_layoutsEPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation Account action panel'

  build() {
    Column() {
      Text('decorator validation Account').fontSize(18)
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
struct DecoratorValidationColumnRowLayoutsTimelineColumn_row_layoutsFLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation Timeline left').fontSize(14)
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

// Case intent: decorator validation Schedule demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsScheduleColumn_row_layoutsGCollection {
  @State items: string[] = ['decorator validation Schedule one', 'decorator validation Schedule two', 'decorator validation Schedule three']

  build() {
    Column() {
      Text('decorator validation Schedule list').fontSize(16)
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
struct DecoratorValidationColumnRowLayoutsHistoryColumn_row_layoutsHForm {
  @State keyword: string = 'decorator validation history'
  @State note: string = 'decorator validation History note'

  build() {
    Column() {
      Text('decorator validation History form').fontSize(16)
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

// Case intent: decorator validation Favorites demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsFavoritesColumn_row_layoutsIDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation Favorites' : 'Enable decorator validation Favorites')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation Favorites enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation Favorites disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation Favorites: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DecoratorValidationColumnRowLayoutsDownloadsColumn_row_layoutsJGridBoard {
  @State blocks: string[] = ['decorator validation Downloads A', 'decorator validation Downloads B', 'decorator validation Downloads C', 'decorator validation Downloads D']

  build() {
    Column() {
      Text('decorator validation Downloads board').fontSize(16)
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

// Case intent: decorator validation Cloud demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsCloudColumn_row_layoutsKPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation Cloud action panel'

  build() {
    Column() {
      Text('decorator validation Cloud').fontSize(18)
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
struct DecoratorValidationColumnRowLayoutsDeviceColumn_row_layoutsLLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation Device left').fontSize(14)
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

// Case intent: decorator validation Sensor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsSensorColumn_row_layoutsMCollection {
  @State items: string[] = ['decorator validation Sensor one', 'decorator validation Sensor two', 'decorator validation Sensor three']

  build() {
    Column() {
      Text('decorator validation Sensor list').fontSize(16)
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
struct DecoratorValidationColumnRowLayoutsControlColumn_row_layoutsNForm {
  @State keyword: string = 'decorator validation control'
  @State note: string = 'decorator validation Control note'

  build() {
    Column() {
      Text('decorator validation Control form').fontSize(16)
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

// Case intent: decorator validation Studio demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsStudioColumn_row_layoutsODecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation Studio' : 'Enable decorator validation Studio')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation Studio enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation Studio disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation Studio: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DecoratorValidationColumnRowLayoutsCanvasColumn_row_layoutsPGridBoard {
  @State blocks: string[] = ['decorator validation Canvas A', 'decorator validation Canvas B', 'decorator validation Canvas C', 'decorator validation Canvas D']

  build() {
    Column() {
      Text('decorator validation Canvas board').fontSize(16)
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

// Case intent: decorator validation Editor demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsEditorColumn_row_layoutsQPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation Editor action panel'

  build() {
    Column() {
      Text('decorator validation Editor').fontSize(18)
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
struct DecoratorValidationColumnRowLayoutsPreviewColumn_row_layoutsRLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation Preview left').fontSize(14)
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

// Case intent: decorator validation Workspace demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsWorkspaceColumn_row_layoutsSCollection {
  @State items: string[] = ['decorator validation Workspace one', 'decorator validation Workspace two', 'decorator validation Workspace three']

  build() {
    Column() {
      Text('decorator validation Workspace list').fontSize(16)
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
struct DecoratorValidationColumnRowLayoutsMonitorColumn_row_layoutsTForm {
  @State keyword: string = 'decorator validation monitor'
  @State note: string = 'decorator validation Monitor note'

  build() {
    Column() {
      Text('decorator validation Monitor form').fontSize(16)
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

// Case intent: decorator validation Terminal demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsTerminalColumn_row_layoutsUDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation Terminal' : 'Enable decorator validation Terminal')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation Terminal enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation Terminal disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation Terminal: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DecoratorValidationColumnRowLayoutsToolkitColumn_row_layoutsVGridBoard {
  @State blocks: string[] = ['decorator validation Toolkit A', 'decorator validation Toolkit B', 'decorator validation Toolkit C', 'decorator validation Toolkit D']

  build() {
    Column() {
      Text('decorator validation Toolkit board').fontSize(16)
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

// Case intent: decorator validation Navigator demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsNavigatorColumn_row_layoutsWPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation Navigator action panel'

  build() {
    Column() {
      Text('decorator validation Navigator').fontSize(18)
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
struct DecoratorValidationColumnRowLayoutsDashboardColumn_row_layoutsXLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation Dashboard left').fontSize(14)
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

// Case intent: decorator validation Settings demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsSettingsColumn_row_layoutsYCollection {
  @State items: string[] = ['decorator validation Settings one', 'decorator validation Settings two', 'decorator validation Settings three']

  build() {
    Column() {
      Text('decorator validation Settings list').fontSize(16)
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
struct DecoratorValidationColumnRowLayoutsSecurityColumn_row_layoutsZForm {
  @State keyword: string = 'decorator validation security'
  @State note: string = 'decorator validation Security note'

  build() {
    Column() {
      Text('decorator validation Security form').fontSize(16)
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

// Case intent: decorator validation Privacy demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsPrivacyColumn_row_layoutsADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation Privacy' : 'Enable decorator validation Privacy')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation Privacy enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation Privacy disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation Privacy: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DecoratorValidationColumnRowLayoutsAccountColumn_row_layoutsBGridBoard {
  @State blocks: string[] = ['decorator validation Account A', 'decorator validation Account B', 'decorator validation Account C', 'decorator validation Account D']

  build() {
    Column() {
      Text('decorator validation Account board').fontSize(16)
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

// Case intent: decorator validation Timeline demonstrates column row layouts with explicit state and interaction transitions.
@Component
struct DecoratorValidationColumnRowLayoutsTimelineColumn_row_layoutsCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation Timeline action panel'

  build() {
    Column() {
      Text('decorator validation Timeline').fontSize(18)
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

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct DecoratorValidationColumnRowLayoutsColumn_row_layoutsHost {
  build() {
    Column() {
      Text('decorator validation column_row_layouts host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
