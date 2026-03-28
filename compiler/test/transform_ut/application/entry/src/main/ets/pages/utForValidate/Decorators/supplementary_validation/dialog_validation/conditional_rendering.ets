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

// Category: dialog_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: dialog validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingOnlineStateConditional_renderingACollection {
  @State items: string[] = ['dialog validation OnlineState one', 'dialog validation OnlineState two', 'dialog validation OnlineState three']

  build() {
    Column() {
      Text('dialog validation OnlineState list').fontSize(16)
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
struct DialogValidationConditionalRenderingSyncStateConditional_renderingBForm {
  @State keyword: string = 'dialog validation syncstate'
  @State note: string = 'dialog validation SyncState note'

  build() {
    Column() {
      Text('dialog validation SyncState form').fontSize(16)
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

// Case intent: dialog validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingLoadingStateConditional_renderingCDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable dialog validation LoadingState' : 'Enable dialog validation LoadingState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('dialog validation LoadingState enabled branch').fontColor('#117733')
      } else {
        Text('dialog validation LoadingState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('dialog validation LoadingState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DialogValidationConditionalRenderingWarningStateConditional_renderingDGridBoard {
  @State blocks: string[] = ['dialog validation WarningState A', 'dialog validation WarningState B', 'dialog validation WarningState C', 'dialog validation WarningState D']

  build() {
    Column() {
      Text('dialog validation WarningState board').fontSize(16)
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

// Case intent: dialog validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingEmptyStateConditional_renderingEPanel {
  @State clicks: number = 0
  @State subtitle: string = 'dialog validation EmptyState action panel'

  build() {
    Column() {
      Text('dialog validation EmptyState').fontSize(18)
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
struct DialogValidationConditionalRenderingErrorStateConditional_renderingFLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('dialog validation ErrorState left').fontSize(14)
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

// Case intent: dialog validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingFilterStateConditional_renderingGCollection {
  @State items: string[] = ['dialog validation FilterState one', 'dialog validation FilterState two', 'dialog validation FilterState three']

  build() {
    Column() {
      Text('dialog validation FilterState list').fontSize(16)
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
struct DialogValidationConditionalRenderingSortStateConditional_renderingHForm {
  @State keyword: string = 'dialog validation sortstate'
  @State note: string = 'dialog validation SortState note'

  build() {
    Column() {
      Text('dialog validation SortState form').fontSize(16)
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

// Case intent: dialog validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingEditStateConditional_renderingIDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable dialog validation EditState' : 'Enable dialog validation EditState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('dialog validation EditState enabled branch').fontColor('#117733')
      } else {
        Text('dialog validation EditState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('dialog validation EditState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DialogValidationConditionalRenderingReadonlyStateConditional_renderingJGridBoard {
  @State blocks: string[] = ['dialog validation ReadonlyState A', 'dialog validation ReadonlyState B', 'dialog validation ReadonlyState C', 'dialog validation ReadonlyState D']

  build() {
    Column() {
      Text('dialog validation ReadonlyState board').fontSize(16)
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

// Case intent: dialog validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingDraftStateConditional_renderingKPanel {
  @State clicks: number = 0
  @State subtitle: string = 'dialog validation DraftState action panel'

  build() {
    Column() {
      Text('dialog validation DraftState').fontSize(18)
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
struct DialogValidationConditionalRenderingPublishStateConditional_renderingLLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('dialog validation PublishState left').fontSize(14)
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

// Case intent: dialog validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingNightStateConditional_renderingMCollection {
  @State items: string[] = ['dialog validation NightState one', 'dialog validation NightState two', 'dialog validation NightState three']

  build() {
    Column() {
      Text('dialog validation NightState list').fontSize(16)
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
struct DialogValidationConditionalRenderingFocusStateConditional_renderingNForm {
  @State keyword: string = 'dialog validation focusstate'
  @State note: string = 'dialog validation FocusState note'

  build() {
    Column() {
      Text('dialog validation FocusState form').fontSize(16)
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

// Case intent: dialog validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingSelectionStateConditional_renderingODecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable dialog validation SelectionState' : 'Enable dialog validation SelectionState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('dialog validation SelectionState enabled branch').fontColor('#117733')
      } else {
        Text('dialog validation SelectionState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('dialog validation SelectionState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DialogValidationConditionalRenderingExpandedStateConditional_renderingPGridBoard {
  @State blocks: string[] = ['dialog validation ExpandedState A', 'dialog validation ExpandedState B', 'dialog validation ExpandedState C', 'dialog validation ExpandedState D']

  build() {
    Column() {
      Text('dialog validation ExpandedState board').fontSize(16)
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

// Case intent: dialog validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingCollapsedStateConditional_renderingQPanel {
  @State clicks: number = 0
  @State subtitle: string = 'dialog validation CollapsedState action panel'

  build() {
    Column() {
      Text('dialog validation CollapsedState').fontSize(18)
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
struct DialogValidationConditionalRenderingSearchStateConditional_renderingRLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('dialog validation SearchState left').fontSize(14)
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

// Case intent: dialog validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingPinnedStateConditional_renderingSCollection {
  @State items: string[] = ['dialog validation PinnedState one', 'dialog validation PinnedState two', 'dialog validation PinnedState three']

  build() {
    Column() {
      Text('dialog validation PinnedState list').fontSize(16)
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
struct DialogValidationConditionalRenderingMutedStateConditional_renderingTForm {
  @State keyword: string = 'dialog validation mutedstate'
  @State note: string = 'dialog validation MutedState note'

  build() {
    Column() {
      Text('dialog validation MutedState form').fontSize(16)
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

// Case intent: dialog validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingSharedStateConditional_renderingUDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable dialog validation SharedState' : 'Enable dialog validation SharedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('dialog validation SharedState enabled branch').fontColor('#117733')
      } else {
        Text('dialog validation SharedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('dialog validation SharedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DialogValidationConditionalRenderingArchivedStateConditional_renderingVGridBoard {
  @State blocks: string[] = ['dialog validation ArchivedState A', 'dialog validation ArchivedState B', 'dialog validation ArchivedState C', 'dialog validation ArchivedState D']

  build() {
    Column() {
      Text('dialog validation ArchivedState board').fontSize(16)
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

// Case intent: dialog validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingCompactStateConditional_renderingWPanel {
  @State clicks: number = 0
  @State subtitle: string = 'dialog validation CompactState action panel'

  build() {
    Column() {
      Text('dialog validation CompactState').fontSize(18)
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
struct DialogValidationConditionalRenderingOnlineStateConditional_renderingXLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('dialog validation OnlineState left').fontSize(14)
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

// Case intent: dialog validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingSyncStateConditional_renderingYCollection {
  @State items: string[] = ['dialog validation SyncState one', 'dialog validation SyncState two', 'dialog validation SyncState three']

  build() {
    Column() {
      Text('dialog validation SyncState list').fontSize(16)
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
struct DialogValidationConditionalRenderingLoadingStateConditional_renderingZForm {
  @State keyword: string = 'dialog validation loadingstate'
  @State note: string = 'dialog validation LoadingState note'

  build() {
    Column() {
      Text('dialog validation LoadingState form').fontSize(16)
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

// Case intent: dialog validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingWarningStateConditional_renderingADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable dialog validation WarningState' : 'Enable dialog validation WarningState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('dialog validation WarningState enabled branch').fontColor('#117733')
      } else {
        Text('dialog validation WarningState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('dialog validation WarningState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct DialogValidationConditionalRenderingEmptyStateConditional_renderingBGridBoard {
  @State blocks: string[] = ['dialog validation EmptyState A', 'dialog validation EmptyState B', 'dialog validation EmptyState C', 'dialog validation EmptyState D']

  build() {
    Column() {
      Text('dialog validation EmptyState board').fontSize(16)
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

// Case intent: dialog validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DialogValidationConditionalRenderingErrorStateConditional_renderingCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'dialog validation ErrorState action panel'

  build() {
    Column() {
      Text('dialog validation ErrorState').fontSize(18)
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
struct DialogValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('dialog validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
