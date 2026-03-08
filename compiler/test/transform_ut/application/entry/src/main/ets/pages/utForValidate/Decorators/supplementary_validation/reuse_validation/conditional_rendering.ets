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

// Category: reuse_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: reuse validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingOnlineStateConditional_renderingALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('reuse validation OnlineState left').fontSize(14)
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
struct ReuseValidationConditionalRenderingSyncStateConditional_renderingBCollection {
  @State items: string[] = ['reuse validation SyncState one', 'reuse validation SyncState two', 'reuse validation SyncState three']

  build() {
    Column() {
      Text('reuse validation SyncState list').fontSize(16)
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

// Case intent: reuse validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingLoadingStateConditional_renderingCForm {
  @State keyword: string = 'reuse validation loadingstate'
  @State note: string = 'reuse validation LoadingState note'

  build() {
    Column() {
      Text('reuse validation LoadingState form').fontSize(16)
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
struct ReuseValidationConditionalRenderingWarningStateConditional_renderingDDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable reuse validation WarningState' : 'Enable reuse validation WarningState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('reuse validation WarningState enabled branch').fontColor('#117733')
      } else {
        Text('reuse validation WarningState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('reuse validation WarningState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: reuse validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingEmptyStateConditional_renderingEGridBoard {
  @State blocks: string[] = ['reuse validation EmptyState A', 'reuse validation EmptyState B', 'reuse validation EmptyState C', 'reuse validation EmptyState D']

  build() {
    Column() {
      Text('reuse validation EmptyState board').fontSize(16)
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
struct ReuseValidationConditionalRenderingErrorStateConditional_renderingFPanel {
  @State clicks: number = 0
  @State subtitle: string = 'reuse validation ErrorState action panel'

  build() {
    Column() {
      Text('reuse validation ErrorState').fontSize(18)
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

// Case intent: reuse validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingFilterStateConditional_renderingGLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('reuse validation FilterState left').fontSize(14)
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
struct ReuseValidationConditionalRenderingSortStateConditional_renderingHCollection {
  @State items: string[] = ['reuse validation SortState one', 'reuse validation SortState two', 'reuse validation SortState three']

  build() {
    Column() {
      Text('reuse validation SortState list').fontSize(16)
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

// Case intent: reuse validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingEditStateConditional_renderingIForm {
  @State keyword: string = 'reuse validation editstate'
  @State note: string = 'reuse validation EditState note'

  build() {
    Column() {
      Text('reuse validation EditState form').fontSize(16)
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
struct ReuseValidationConditionalRenderingReadonlyStateConditional_renderingJDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable reuse validation ReadonlyState' : 'Enable reuse validation ReadonlyState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('reuse validation ReadonlyState enabled branch').fontColor('#117733')
      } else {
        Text('reuse validation ReadonlyState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('reuse validation ReadonlyState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: reuse validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingDraftStateConditional_renderingKGridBoard {
  @State blocks: string[] = ['reuse validation DraftState A', 'reuse validation DraftState B', 'reuse validation DraftState C', 'reuse validation DraftState D']

  build() {
    Column() {
      Text('reuse validation DraftState board').fontSize(16)
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
struct ReuseValidationConditionalRenderingPublishStateConditional_renderingLPanel {
  @State clicks: number = 0
  @State subtitle: string = 'reuse validation PublishState action panel'

  build() {
    Column() {
      Text('reuse validation PublishState').fontSize(18)
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

// Case intent: reuse validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingNightStateConditional_renderingMLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('reuse validation NightState left').fontSize(14)
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
struct ReuseValidationConditionalRenderingFocusStateConditional_renderingNCollection {
  @State items: string[] = ['reuse validation FocusState one', 'reuse validation FocusState two', 'reuse validation FocusState three']

  build() {
    Column() {
      Text('reuse validation FocusState list').fontSize(16)
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

// Case intent: reuse validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingSelectionStateConditional_renderingOForm {
  @State keyword: string = 'reuse validation selectionstate'
  @State note: string = 'reuse validation SelectionState note'

  build() {
    Column() {
      Text('reuse validation SelectionState form').fontSize(16)
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
struct ReuseValidationConditionalRenderingExpandedStateConditional_renderingPDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable reuse validation ExpandedState' : 'Enable reuse validation ExpandedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('reuse validation ExpandedState enabled branch').fontColor('#117733')
      } else {
        Text('reuse validation ExpandedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('reuse validation ExpandedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: reuse validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingCollapsedStateConditional_renderingQGridBoard {
  @State blocks: string[] = ['reuse validation CollapsedState A', 'reuse validation CollapsedState B', 'reuse validation CollapsedState C', 'reuse validation CollapsedState D']

  build() {
    Column() {
      Text('reuse validation CollapsedState board').fontSize(16)
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
struct ReuseValidationConditionalRenderingSearchStateConditional_renderingRPanel {
  @State clicks: number = 0
  @State subtitle: string = 'reuse validation SearchState action panel'

  build() {
    Column() {
      Text('reuse validation SearchState').fontSize(18)
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

// Case intent: reuse validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingPinnedStateConditional_renderingSLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('reuse validation PinnedState left').fontSize(14)
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
struct ReuseValidationConditionalRenderingMutedStateConditional_renderingTCollection {
  @State items: string[] = ['reuse validation MutedState one', 'reuse validation MutedState two', 'reuse validation MutedState three']

  build() {
    Column() {
      Text('reuse validation MutedState list').fontSize(16)
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

// Case intent: reuse validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingSharedStateConditional_renderingUForm {
  @State keyword: string = 'reuse validation sharedstate'
  @State note: string = 'reuse validation SharedState note'

  build() {
    Column() {
      Text('reuse validation SharedState form').fontSize(16)
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
struct ReuseValidationConditionalRenderingArchivedStateConditional_renderingVDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable reuse validation ArchivedState' : 'Enable reuse validation ArchivedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('reuse validation ArchivedState enabled branch').fontColor('#117733')
      } else {
        Text('reuse validation ArchivedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('reuse validation ArchivedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: reuse validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingCompactStateConditional_renderingWGridBoard {
  @State blocks: string[] = ['reuse validation CompactState A', 'reuse validation CompactState B', 'reuse validation CompactState C', 'reuse validation CompactState D']

  build() {
    Column() {
      Text('reuse validation CompactState board').fontSize(16)
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
struct ReuseValidationConditionalRenderingOnlineStateConditional_renderingXPanel {
  @State clicks: number = 0
  @State subtitle: string = 'reuse validation OnlineState action panel'

  build() {
    Column() {
      Text('reuse validation OnlineState').fontSize(18)
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

// Case intent: reuse validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingSyncStateConditional_renderingYLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('reuse validation SyncState left').fontSize(14)
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
struct ReuseValidationConditionalRenderingLoadingStateConditional_renderingZCollection {
  @State items: string[] = ['reuse validation LoadingState one', 'reuse validation LoadingState two', 'reuse validation LoadingState three']

  build() {
    Column() {
      Text('reuse validation LoadingState list').fontSize(16)
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

// Case intent: reuse validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingWarningStateConditional_renderingAForm {
  @State keyword: string = 'reuse validation warningstate'
  @State note: string = 'reuse validation WarningState note'

  build() {
    Column() {
      Text('reuse validation WarningState form').fontSize(16)
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
struct ReuseValidationConditionalRenderingEmptyStateConditional_renderingBDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable reuse validation EmptyState' : 'Enable reuse validation EmptyState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('reuse validation EmptyState enabled branch').fontColor('#117733')
      } else {
        Text('reuse validation EmptyState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('reuse validation EmptyState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: reuse validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ReuseValidationConditionalRenderingErrorStateConditional_renderingCGridBoard {
  @State blocks: string[] = ['reuse validation ErrorState A', 'reuse validation ErrorState B', 'reuse validation ErrorState C', 'reuse validation ErrorState D']

  build() {
    Column() {
      Text('reuse validation ErrorState board').fontSize(16)
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
struct ReuseValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('reuse validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
