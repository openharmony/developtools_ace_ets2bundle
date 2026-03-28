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
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: computed validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingOnlineStateConditional_renderingADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation OnlineState' : 'Enable computed validation OnlineState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation OnlineState enabled branch').fontColor('#117733')
      } else {
        Text('computed validation OnlineState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation OnlineState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ComputedValidationConditionalRenderingSyncStateConditional_renderingBGridBoard {
  @State blocks: string[] = ['computed validation SyncState A', 'computed validation SyncState B', 'computed validation SyncState C', 'computed validation SyncState D']

  build() {
    Column() {
      Text('computed validation SyncState board').fontSize(16)
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

// Case intent: computed validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingLoadingStateConditional_renderingCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation LoadingState action panel'

  build() {
    Column() {
      Text('computed validation LoadingState').fontSize(18)
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
struct ComputedValidationConditionalRenderingWarningStateConditional_renderingDLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation WarningState left').fontSize(14)
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

// Case intent: computed validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingEmptyStateConditional_renderingECollection {
  @State items: string[] = ['computed validation EmptyState one', 'computed validation EmptyState two', 'computed validation EmptyState three']

  build() {
    Column() {
      Text('computed validation EmptyState list').fontSize(16)
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
struct ComputedValidationConditionalRenderingErrorStateConditional_renderingFForm {
  @State keyword: string = 'computed validation errorstate'
  @State note: string = 'computed validation ErrorState note'

  build() {
    Column() {
      Text('computed validation ErrorState form').fontSize(16)
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

// Case intent: computed validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingFilterStateConditional_renderingGDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation FilterState' : 'Enable computed validation FilterState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation FilterState enabled branch').fontColor('#117733')
      } else {
        Text('computed validation FilterState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation FilterState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ComputedValidationConditionalRenderingSortStateConditional_renderingHGridBoard {
  @State blocks: string[] = ['computed validation SortState A', 'computed validation SortState B', 'computed validation SortState C', 'computed validation SortState D']

  build() {
    Column() {
      Text('computed validation SortState board').fontSize(16)
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

// Case intent: computed validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingEditStateConditional_renderingIPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation EditState action panel'

  build() {
    Column() {
      Text('computed validation EditState').fontSize(18)
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
struct ComputedValidationConditionalRenderingReadonlyStateConditional_renderingJLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation ReadonlyState left').fontSize(14)
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

// Case intent: computed validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingDraftStateConditional_renderingKCollection {
  @State items: string[] = ['computed validation DraftState one', 'computed validation DraftState two', 'computed validation DraftState three']

  build() {
    Column() {
      Text('computed validation DraftState list').fontSize(16)
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
struct ComputedValidationConditionalRenderingPublishStateConditional_renderingLForm {
  @State keyword: string = 'computed validation publishstate'
  @State note: string = 'computed validation PublishState note'

  build() {
    Column() {
      Text('computed validation PublishState form').fontSize(16)
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

// Case intent: computed validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingNightStateConditional_renderingMDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation NightState' : 'Enable computed validation NightState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation NightState enabled branch').fontColor('#117733')
      } else {
        Text('computed validation NightState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation NightState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ComputedValidationConditionalRenderingFocusStateConditional_renderingNGridBoard {
  @State blocks: string[] = ['computed validation FocusState A', 'computed validation FocusState B', 'computed validation FocusState C', 'computed validation FocusState D']

  build() {
    Column() {
      Text('computed validation FocusState board').fontSize(16)
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

// Case intent: computed validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingSelectionStateConditional_renderingOPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation SelectionState action panel'

  build() {
    Column() {
      Text('computed validation SelectionState').fontSize(18)
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
struct ComputedValidationConditionalRenderingExpandedStateConditional_renderingPLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation ExpandedState left').fontSize(14)
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

// Case intent: computed validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingCollapsedStateConditional_renderingQCollection {
  @State items: string[] = ['computed validation CollapsedState one', 'computed validation CollapsedState two', 'computed validation CollapsedState three']

  build() {
    Column() {
      Text('computed validation CollapsedState list').fontSize(16)
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
struct ComputedValidationConditionalRenderingSearchStateConditional_renderingRForm {
  @State keyword: string = 'computed validation searchstate'
  @State note: string = 'computed validation SearchState note'

  build() {
    Column() {
      Text('computed validation SearchState form').fontSize(16)
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

// Case intent: computed validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingPinnedStateConditional_renderingSDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation PinnedState' : 'Enable computed validation PinnedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation PinnedState enabled branch').fontColor('#117733')
      } else {
        Text('computed validation PinnedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation PinnedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ComputedValidationConditionalRenderingMutedStateConditional_renderingTGridBoard {
  @State blocks: string[] = ['computed validation MutedState A', 'computed validation MutedState B', 'computed validation MutedState C', 'computed validation MutedState D']

  build() {
    Column() {
      Text('computed validation MutedState board').fontSize(16)
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

// Case intent: computed validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingSharedStateConditional_renderingUPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation SharedState action panel'

  build() {
    Column() {
      Text('computed validation SharedState').fontSize(18)
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
struct ComputedValidationConditionalRenderingArchivedStateConditional_renderingVLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation ArchivedState left').fontSize(14)
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

// Case intent: computed validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingCompactStateConditional_renderingWCollection {
  @State items: string[] = ['computed validation CompactState one', 'computed validation CompactState two', 'computed validation CompactState three']

  build() {
    Column() {
      Text('computed validation CompactState list').fontSize(16)
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
struct ComputedValidationConditionalRenderingOnlineStateConditional_renderingXForm {
  @State keyword: string = 'computed validation onlinestate'
  @State note: string = 'computed validation OnlineState note'

  build() {
    Column() {
      Text('computed validation OnlineState form').fontSize(16)
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

// Case intent: computed validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingSyncStateConditional_renderingYDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable computed validation SyncState' : 'Enable computed validation SyncState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('computed validation SyncState enabled branch').fontColor('#117733')
      } else {
        Text('computed validation SyncState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('computed validation SyncState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ComputedValidationConditionalRenderingLoadingStateConditional_renderingZGridBoard {
  @State blocks: string[] = ['computed validation LoadingState A', 'computed validation LoadingState B', 'computed validation LoadingState C', 'computed validation LoadingState D']

  build() {
    Column() {
      Text('computed validation LoadingState board').fontSize(16)
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

// Case intent: computed validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingWarningStateConditional_renderingAPanel {
  @State clicks: number = 0
  @State subtitle: string = 'computed validation WarningState action panel'

  build() {
    Column() {
      Text('computed validation WarningState').fontSize(18)
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
struct ComputedValidationConditionalRenderingEmptyStateConditional_renderingBLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('computed validation EmptyState left').fontSize(14)
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

// Case intent: computed validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComputedValidationConditionalRenderingErrorStateConditional_renderingCCollection {
  @State items: string[] = ['computed validation ErrorState one', 'computed validation ErrorState two', 'computed validation ErrorState three']

  build() {
    Column() {
      Text('computed validation ErrorState list').fontSize(16)
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

// Host component: preserves a stable, valid root for parser/tranformer baseline checks.
@Component
struct ComputedValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('computed validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
