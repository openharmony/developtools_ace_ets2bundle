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

// Category: state_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: state validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingOnlineStateConditional_renderingALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('state validation OnlineState left').fontSize(14)
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
struct StateValidationConditionalRenderingSyncStateConditional_renderingBCollection {
  @State items: string[] = ['state validation SyncState one', 'state validation SyncState two', 'state validation SyncState three']

  build() {
    Column() {
      Text('state validation SyncState list').fontSize(16)
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

// Case intent: state validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingLoadingStateConditional_renderingCForm {
  @State keyword: string = 'state validation loadingstate'
  @State note: string = 'state validation LoadingState note'

  build() {
    Column() {
      Text('state validation LoadingState form').fontSize(16)
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
struct StateValidationConditionalRenderingWarningStateConditional_renderingDDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable state validation WarningState' : 'Enable state validation WarningState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('state validation WarningState enabled branch').fontColor('#117733')
      } else {
        Text('state validation WarningState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('state validation WarningState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: state validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingEmptyStateConditional_renderingEGridBoard {
  @State blocks: string[] = ['state validation EmptyState A', 'state validation EmptyState B', 'state validation EmptyState C', 'state validation EmptyState D']

  build() {
    Column() {
      Text('state validation EmptyState board').fontSize(16)
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
struct StateValidationConditionalRenderingErrorStateConditional_renderingFPanel {
  @State clicks: number = 0
  @State subtitle: string = 'state validation ErrorState action panel'

  build() {
    Column() {
      Text('state validation ErrorState').fontSize(18)
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

// Case intent: state validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingFilterStateConditional_renderingGLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('state validation FilterState left').fontSize(14)
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
struct StateValidationConditionalRenderingSortStateConditional_renderingHCollection {
  @State items: string[] = ['state validation SortState one', 'state validation SortState two', 'state validation SortState three']

  build() {
    Column() {
      Text('state validation SortState list').fontSize(16)
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

// Case intent: state validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingEditStateConditional_renderingIForm {
  @State keyword: string = 'state validation editstate'
  @State note: string = 'state validation EditState note'

  build() {
    Column() {
      Text('state validation EditState form').fontSize(16)
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
struct StateValidationConditionalRenderingReadonlyStateConditional_renderingJDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable state validation ReadonlyState' : 'Enable state validation ReadonlyState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('state validation ReadonlyState enabled branch').fontColor('#117733')
      } else {
        Text('state validation ReadonlyState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('state validation ReadonlyState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: state validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingDraftStateConditional_renderingKGridBoard {
  @State blocks: string[] = ['state validation DraftState A', 'state validation DraftState B', 'state validation DraftState C', 'state validation DraftState D']

  build() {
    Column() {
      Text('state validation DraftState board').fontSize(16)
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
struct StateValidationConditionalRenderingPublishStateConditional_renderingLPanel {
  @State clicks: number = 0
  @State subtitle: string = 'state validation PublishState action panel'

  build() {
    Column() {
      Text('state validation PublishState').fontSize(18)
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

// Case intent: state validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingNightStateConditional_renderingMLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('state validation NightState left').fontSize(14)
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
struct StateValidationConditionalRenderingFocusStateConditional_renderingNCollection {
  @State items: string[] = ['state validation FocusState one', 'state validation FocusState two', 'state validation FocusState three']

  build() {
    Column() {
      Text('state validation FocusState list').fontSize(16)
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

// Case intent: state validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingSelectionStateConditional_renderingOForm {
  @State keyword: string = 'state validation selectionstate'
  @State note: string = 'state validation SelectionState note'

  build() {
    Column() {
      Text('state validation SelectionState form').fontSize(16)
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
struct StateValidationConditionalRenderingExpandedStateConditional_renderingPDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable state validation ExpandedState' : 'Enable state validation ExpandedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('state validation ExpandedState enabled branch').fontColor('#117733')
      } else {
        Text('state validation ExpandedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('state validation ExpandedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: state validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingCollapsedStateConditional_renderingQGridBoard {
  @State blocks: string[] = ['state validation CollapsedState A', 'state validation CollapsedState B', 'state validation CollapsedState C', 'state validation CollapsedState D']

  build() {
    Column() {
      Text('state validation CollapsedState board').fontSize(16)
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
struct StateValidationConditionalRenderingSearchStateConditional_renderingRPanel {
  @State clicks: number = 0
  @State subtitle: string = 'state validation SearchState action panel'

  build() {
    Column() {
      Text('state validation SearchState').fontSize(18)
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

// Case intent: state validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingPinnedStateConditional_renderingSLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('state validation PinnedState left').fontSize(14)
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
struct StateValidationConditionalRenderingMutedStateConditional_renderingTCollection {
  @State items: string[] = ['state validation MutedState one', 'state validation MutedState two', 'state validation MutedState three']

  build() {
    Column() {
      Text('state validation MutedState list').fontSize(16)
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

// Case intent: state validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingSharedStateConditional_renderingUForm {
  @State keyword: string = 'state validation sharedstate'
  @State note: string = 'state validation SharedState note'

  build() {
    Column() {
      Text('state validation SharedState form').fontSize(16)
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
struct StateValidationConditionalRenderingArchivedStateConditional_renderingVDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable state validation ArchivedState' : 'Enable state validation ArchivedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('state validation ArchivedState enabled branch').fontColor('#117733')
      } else {
        Text('state validation ArchivedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('state validation ArchivedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: state validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingCompactStateConditional_renderingWGridBoard {
  @State blocks: string[] = ['state validation CompactState A', 'state validation CompactState B', 'state validation CompactState C', 'state validation CompactState D']

  build() {
    Column() {
      Text('state validation CompactState board').fontSize(16)
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
struct StateValidationConditionalRenderingOnlineStateConditional_renderingXPanel {
  @State clicks: number = 0
  @State subtitle: string = 'state validation OnlineState action panel'

  build() {
    Column() {
      Text('state validation OnlineState').fontSize(18)
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

// Case intent: state validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingSyncStateConditional_renderingYLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('state validation SyncState left').fontSize(14)
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
struct StateValidationConditionalRenderingLoadingStateConditional_renderingZCollection {
  @State items: string[] = ['state validation LoadingState one', 'state validation LoadingState two', 'state validation LoadingState three']

  build() {
    Column() {
      Text('state validation LoadingState list').fontSize(16)
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

// Case intent: state validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingWarningStateConditional_renderingAForm {
  @State keyword: string = 'state validation warningstate'
  @State note: string = 'state validation WarningState note'

  build() {
    Column() {
      Text('state validation WarningState form').fontSize(16)
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
struct StateValidationConditionalRenderingEmptyStateConditional_renderingBDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable state validation EmptyState' : 'Enable state validation EmptyState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('state validation EmptyState enabled branch').fontColor('#117733')
      } else {
        Text('state validation EmptyState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('state validation EmptyState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: state validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct StateValidationConditionalRenderingErrorStateConditional_renderingCGridBoard {
  @State blocks: string[] = ['state validation ErrorState A', 'state validation ErrorState B', 'state validation ErrorState C', 'state validation ErrorState D']

  build() {
    Column() {
      Text('state validation ErrorState board').fontSize(16)
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
struct StateValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('state validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
