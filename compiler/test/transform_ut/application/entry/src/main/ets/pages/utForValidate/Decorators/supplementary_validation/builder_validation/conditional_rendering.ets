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
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: builder validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingOnlineStateConditional_renderingAForm {
  @State keyword: string = 'builder validation onlinestate'
  @State note: string = 'builder validation OnlineState note'

  build() {
    Column() {
      Text('builder validation OnlineState form').fontSize(16)
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
struct BuilderValidationConditionalRenderingSyncStateConditional_renderingBDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation SyncState' : 'Enable builder validation SyncState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation SyncState enabled branch').fontColor('#117733')
      } else {
        Text('builder validation SyncState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation SyncState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: builder validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingLoadingStateConditional_renderingCGridBoard {
  @State blocks: string[] = ['builder validation LoadingState A', 'builder validation LoadingState B', 'builder validation LoadingState C', 'builder validation LoadingState D']

  build() {
    Column() {
      Text('builder validation LoadingState board').fontSize(16)
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
struct BuilderValidationConditionalRenderingWarningStateConditional_renderingDPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation WarningState action panel'

  build() {
    Column() {
      Text('builder validation WarningState').fontSize(18)
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

// Case intent: builder validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingEmptyStateConditional_renderingELayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation EmptyState left').fontSize(14)
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
struct BuilderValidationConditionalRenderingErrorStateConditional_renderingFCollection {
  @State items: string[] = ['builder validation ErrorState one', 'builder validation ErrorState two', 'builder validation ErrorState three']

  build() {
    Column() {
      Text('builder validation ErrorState list').fontSize(16)
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

// Case intent: builder validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingFilterStateConditional_renderingGForm {
  @State keyword: string = 'builder validation filterstate'
  @State note: string = 'builder validation FilterState note'

  build() {
    Column() {
      Text('builder validation FilterState form').fontSize(16)
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
struct BuilderValidationConditionalRenderingSortStateConditional_renderingHDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation SortState' : 'Enable builder validation SortState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation SortState enabled branch').fontColor('#117733')
      } else {
        Text('builder validation SortState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation SortState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: builder validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingEditStateConditional_renderingIGridBoard {
  @State blocks: string[] = ['builder validation EditState A', 'builder validation EditState B', 'builder validation EditState C', 'builder validation EditState D']

  build() {
    Column() {
      Text('builder validation EditState board').fontSize(16)
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
struct BuilderValidationConditionalRenderingReadonlyStateConditional_renderingJPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation ReadonlyState action panel'

  build() {
    Column() {
      Text('builder validation ReadonlyState').fontSize(18)
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

// Case intent: builder validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingDraftStateConditional_renderingKLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation DraftState left').fontSize(14)
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
struct BuilderValidationConditionalRenderingPublishStateConditional_renderingLCollection {
  @State items: string[] = ['builder validation PublishState one', 'builder validation PublishState two', 'builder validation PublishState three']

  build() {
    Column() {
      Text('builder validation PublishState list').fontSize(16)
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

// Case intent: builder validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingNightStateConditional_renderingMForm {
  @State keyword: string = 'builder validation nightstate'
  @State note: string = 'builder validation NightState note'

  build() {
    Column() {
      Text('builder validation NightState form').fontSize(16)
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
struct BuilderValidationConditionalRenderingFocusStateConditional_renderingNDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation FocusState' : 'Enable builder validation FocusState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation FocusState enabled branch').fontColor('#117733')
      } else {
        Text('builder validation FocusState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation FocusState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: builder validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingSelectionStateConditional_renderingOGridBoard {
  @State blocks: string[] = ['builder validation SelectionState A', 'builder validation SelectionState B', 'builder validation SelectionState C', 'builder validation SelectionState D']

  build() {
    Column() {
      Text('builder validation SelectionState board').fontSize(16)
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
struct BuilderValidationConditionalRenderingExpandedStateConditional_renderingPPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation ExpandedState action panel'

  build() {
    Column() {
      Text('builder validation ExpandedState').fontSize(18)
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

// Case intent: builder validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingCollapsedStateConditional_renderingQLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation CollapsedState left').fontSize(14)
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
struct BuilderValidationConditionalRenderingSearchStateConditional_renderingRCollection {
  @State items: string[] = ['builder validation SearchState one', 'builder validation SearchState two', 'builder validation SearchState three']

  build() {
    Column() {
      Text('builder validation SearchState list').fontSize(16)
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

// Case intent: builder validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingPinnedStateConditional_renderingSForm {
  @State keyword: string = 'builder validation pinnedstate'
  @State note: string = 'builder validation PinnedState note'

  build() {
    Column() {
      Text('builder validation PinnedState form').fontSize(16)
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
struct BuilderValidationConditionalRenderingMutedStateConditional_renderingTDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation MutedState' : 'Enable builder validation MutedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation MutedState enabled branch').fontColor('#117733')
      } else {
        Text('builder validation MutedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation MutedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: builder validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingSharedStateConditional_renderingUGridBoard {
  @State blocks: string[] = ['builder validation SharedState A', 'builder validation SharedState B', 'builder validation SharedState C', 'builder validation SharedState D']

  build() {
    Column() {
      Text('builder validation SharedState board').fontSize(16)
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
struct BuilderValidationConditionalRenderingArchivedStateConditional_renderingVPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation ArchivedState action panel'

  build() {
    Column() {
      Text('builder validation ArchivedState').fontSize(18)
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

// Case intent: builder validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingCompactStateConditional_renderingWLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation CompactState left').fontSize(14)
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
struct BuilderValidationConditionalRenderingOnlineStateConditional_renderingXCollection {
  @State items: string[] = ['builder validation OnlineState one', 'builder validation OnlineState two', 'builder validation OnlineState three']

  build() {
    Column() {
      Text('builder validation OnlineState list').fontSize(16)
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

// Case intent: builder validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingSyncStateConditional_renderingYForm {
  @State keyword: string = 'builder validation syncstate'
  @State note: string = 'builder validation SyncState note'

  build() {
    Column() {
      Text('builder validation SyncState form').fontSize(16)
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
struct BuilderValidationConditionalRenderingLoadingStateConditional_renderingZDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable builder validation LoadingState' : 'Enable builder validation LoadingState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('builder validation LoadingState enabled branch').fontColor('#117733')
      } else {
        Text('builder validation LoadingState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('builder validation LoadingState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: builder validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingWarningStateConditional_renderingAGridBoard {
  @State blocks: string[] = ['builder validation WarningState A', 'builder validation WarningState B', 'builder validation WarningState C', 'builder validation WarningState D']

  build() {
    Column() {
      Text('builder validation WarningState board').fontSize(16)
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
struct BuilderValidationConditionalRenderingEmptyStateConditional_renderingBPanel {
  @State clicks: number = 0
  @State subtitle: string = 'builder validation EmptyState action panel'

  build() {
    Column() {
      Text('builder validation EmptyState').fontSize(18)
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

// Case intent: builder validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct BuilderValidationConditionalRenderingErrorStateConditional_renderingCLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('builder validation ErrorState left').fontSize(14)
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

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct BuilderValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('builder validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
