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
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: syntax validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingOnlineStateConditional_renderingACollection {
  @State items: string[] = ['syntax validation OnlineState one', 'syntax validation OnlineState two', 'syntax validation OnlineState three']

  build() {
    Column() {
      Text('syntax validation OnlineState list').fontSize(16)
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
struct SyntaxValidationConditionalRenderingSyncStateConditional_renderingBForm {
  @State keyword: string = 'syntax validation syncstate'
  @State note: string = 'syntax validation SyncState note'

  build() {
    Column() {
      Text('syntax validation SyncState form').fontSize(16)
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

// Case intent: syntax validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingLoadingStateConditional_renderingCDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation LoadingState' : 'Enable syntax validation LoadingState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation LoadingState enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation LoadingState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation LoadingState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct SyntaxValidationConditionalRenderingWarningStateConditional_renderingDGridBoard {
  @State blocks: string[] = ['syntax validation WarningState A', 'syntax validation WarningState B', 'syntax validation WarningState C', 'syntax validation WarningState D']

  build() {
    Column() {
      Text('syntax validation WarningState board').fontSize(16)
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

// Case intent: syntax validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingEmptyStateConditional_renderingEPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation EmptyState action panel'

  build() {
    Column() {
      Text('syntax validation EmptyState').fontSize(18)
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
struct SyntaxValidationConditionalRenderingErrorStateConditional_renderingFLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation ErrorState left').fontSize(14)
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

// Case intent: syntax validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingFilterStateConditional_renderingGCollection {
  @State items: string[] = ['syntax validation FilterState one', 'syntax validation FilterState two', 'syntax validation FilterState three']

  build() {
    Column() {
      Text('syntax validation FilterState list').fontSize(16)
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
struct SyntaxValidationConditionalRenderingSortStateConditional_renderingHForm {
  @State keyword: string = 'syntax validation sortstate'
  @State note: string = 'syntax validation SortState note'

  build() {
    Column() {
      Text('syntax validation SortState form').fontSize(16)
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

// Case intent: syntax validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingEditStateConditional_renderingIDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation EditState' : 'Enable syntax validation EditState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation EditState enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation EditState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation EditState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct SyntaxValidationConditionalRenderingReadonlyStateConditional_renderingJGridBoard {
  @State blocks: string[] = ['syntax validation ReadonlyState A', 'syntax validation ReadonlyState B', 'syntax validation ReadonlyState C', 'syntax validation ReadonlyState D']

  build() {
    Column() {
      Text('syntax validation ReadonlyState board').fontSize(16)
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

// Case intent: syntax validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingDraftStateConditional_renderingKPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation DraftState action panel'

  build() {
    Column() {
      Text('syntax validation DraftState').fontSize(18)
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
struct SyntaxValidationConditionalRenderingPublishStateConditional_renderingLLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation PublishState left').fontSize(14)
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

// Case intent: syntax validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingNightStateConditional_renderingMCollection {
  @State items: string[] = ['syntax validation NightState one', 'syntax validation NightState two', 'syntax validation NightState three']

  build() {
    Column() {
      Text('syntax validation NightState list').fontSize(16)
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
struct SyntaxValidationConditionalRenderingFocusStateConditional_renderingNForm {
  @State keyword: string = 'syntax validation focusstate'
  @State note: string = 'syntax validation FocusState note'

  build() {
    Column() {
      Text('syntax validation FocusState form').fontSize(16)
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

// Case intent: syntax validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingSelectionStateConditional_renderingODecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation SelectionState' : 'Enable syntax validation SelectionState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation SelectionState enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation SelectionState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation SelectionState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct SyntaxValidationConditionalRenderingExpandedStateConditional_renderingPGridBoard {
  @State blocks: string[] = ['syntax validation ExpandedState A', 'syntax validation ExpandedState B', 'syntax validation ExpandedState C', 'syntax validation ExpandedState D']

  build() {
    Column() {
      Text('syntax validation ExpandedState board').fontSize(16)
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

// Case intent: syntax validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingCollapsedStateConditional_renderingQPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation CollapsedState action panel'

  build() {
    Column() {
      Text('syntax validation CollapsedState').fontSize(18)
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
struct SyntaxValidationConditionalRenderingSearchStateConditional_renderingRLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation SearchState left').fontSize(14)
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

// Case intent: syntax validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingPinnedStateConditional_renderingSCollection {
  @State items: string[] = ['syntax validation PinnedState one', 'syntax validation PinnedState two', 'syntax validation PinnedState three']

  build() {
    Column() {
      Text('syntax validation PinnedState list').fontSize(16)
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
struct SyntaxValidationConditionalRenderingMutedStateConditional_renderingTForm {
  @State keyword: string = 'syntax validation mutedstate'
  @State note: string = 'syntax validation MutedState note'

  build() {
    Column() {
      Text('syntax validation MutedState form').fontSize(16)
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

// Case intent: syntax validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingSharedStateConditional_renderingUDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation SharedState' : 'Enable syntax validation SharedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation SharedState enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation SharedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation SharedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct SyntaxValidationConditionalRenderingArchivedStateConditional_renderingVGridBoard {
  @State blocks: string[] = ['syntax validation ArchivedState A', 'syntax validation ArchivedState B', 'syntax validation ArchivedState C', 'syntax validation ArchivedState D']

  build() {
    Column() {
      Text('syntax validation ArchivedState board').fontSize(16)
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

// Case intent: syntax validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingCompactStateConditional_renderingWPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation CompactState action panel'

  build() {
    Column() {
      Text('syntax validation CompactState').fontSize(18)
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
struct SyntaxValidationConditionalRenderingOnlineStateConditional_renderingXLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('syntax validation OnlineState left').fontSize(14)
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

// Case intent: syntax validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingSyncStateConditional_renderingYCollection {
  @State items: string[] = ['syntax validation SyncState one', 'syntax validation SyncState two', 'syntax validation SyncState three']

  build() {
    Column() {
      Text('syntax validation SyncState list').fontSize(16)
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
struct SyntaxValidationConditionalRenderingLoadingStateConditional_renderingZForm {
  @State keyword: string = 'syntax validation loadingstate'
  @State note: string = 'syntax validation LoadingState note'

  build() {
    Column() {
      Text('syntax validation LoadingState form').fontSize(16)
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

// Case intent: syntax validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingWarningStateConditional_renderingADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable syntax validation WarningState' : 'Enable syntax validation WarningState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('syntax validation WarningState enabled branch').fontColor('#117733')
      } else {
        Text('syntax validation WarningState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('syntax validation WarningState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct SyntaxValidationConditionalRenderingEmptyStateConditional_renderingBGridBoard {
  @State blocks: string[] = ['syntax validation EmptyState A', 'syntax validation EmptyState B', 'syntax validation EmptyState C', 'syntax validation EmptyState D']

  build() {
    Column() {
      Text('syntax validation EmptyState board').fontSize(16)
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

// Case intent: syntax validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct SyntaxValidationConditionalRenderingErrorStateConditional_renderingCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'syntax validation ErrorState action panel'

  build() {
    Column() {
      Text('syntax validation ErrorState').fontSize(18)
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
struct SyntaxValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('syntax validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
