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

// Category: comprehensive_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: comprehensive validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingOnlineStateConditional_renderingAForm {
  @State keyword: string = 'comprehensive validation onlinestate'
  @State note: string = 'comprehensive validation OnlineState note'

  build() {
    Column() {
      Text('comprehensive validation OnlineState form').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingSyncStateConditional_renderingBDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable comprehensive validation SyncState' : 'Enable comprehensive validation SyncState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('comprehensive validation SyncState enabled branch').fontColor('#117733')
      } else {
        Text('comprehensive validation SyncState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('comprehensive validation SyncState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: comprehensive validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingLoadingStateConditional_renderingCGridBoard {
  @State blocks: string[] = ['comprehensive validation LoadingState A', 'comprehensive validation LoadingState B', 'comprehensive validation LoadingState C', 'comprehensive validation LoadingState D']

  build() {
    Column() {
      Text('comprehensive validation LoadingState board').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingWarningStateConditional_renderingDPanel {
  @State clicks: number = 0
  @State subtitle: string = 'comprehensive validation WarningState action panel'

  build() {
    Column() {
      Text('comprehensive validation WarningState').fontSize(18)
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

// Case intent: comprehensive validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingEmptyStateConditional_renderingELayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('comprehensive validation EmptyState left').fontSize(14)
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
struct ComprehensiveValidationConditionalRenderingErrorStateConditional_renderingFCollection {
  @State items: string[] = ['comprehensive validation ErrorState one', 'comprehensive validation ErrorState two', 'comprehensive validation ErrorState three']

  build() {
    Column() {
      Text('comprehensive validation ErrorState list').fontSize(16)
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

// Case intent: comprehensive validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingFilterStateConditional_renderingGForm {
  @State keyword: string = 'comprehensive validation filterstate'
  @State note: string = 'comprehensive validation FilterState note'

  build() {
    Column() {
      Text('comprehensive validation FilterState form').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingSortStateConditional_renderingHDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable comprehensive validation SortState' : 'Enable comprehensive validation SortState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('comprehensive validation SortState enabled branch').fontColor('#117733')
      } else {
        Text('comprehensive validation SortState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('comprehensive validation SortState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: comprehensive validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingEditStateConditional_renderingIGridBoard {
  @State blocks: string[] = ['comprehensive validation EditState A', 'comprehensive validation EditState B', 'comprehensive validation EditState C', 'comprehensive validation EditState D']

  build() {
    Column() {
      Text('comprehensive validation EditState board').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingReadonlyStateConditional_renderingJPanel {
  @State clicks: number = 0
  @State subtitle: string = 'comprehensive validation ReadonlyState action panel'

  build() {
    Column() {
      Text('comprehensive validation ReadonlyState').fontSize(18)
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

// Case intent: comprehensive validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingDraftStateConditional_renderingKLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('comprehensive validation DraftState left').fontSize(14)
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
struct ComprehensiveValidationConditionalRenderingPublishStateConditional_renderingLCollection {
  @State items: string[] = ['comprehensive validation PublishState one', 'comprehensive validation PublishState two', 'comprehensive validation PublishState three']

  build() {
    Column() {
      Text('comprehensive validation PublishState list').fontSize(16)
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

// Case intent: comprehensive validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingNightStateConditional_renderingMForm {
  @State keyword: string = 'comprehensive validation nightstate'
  @State note: string = 'comprehensive validation NightState note'

  build() {
    Column() {
      Text('comprehensive validation NightState form').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingFocusStateConditional_renderingNDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable comprehensive validation FocusState' : 'Enable comprehensive validation FocusState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('comprehensive validation FocusState enabled branch').fontColor('#117733')
      } else {
        Text('comprehensive validation FocusState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('comprehensive validation FocusState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: comprehensive validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingSelectionStateConditional_renderingOGridBoard {
  @State blocks: string[] = ['comprehensive validation SelectionState A', 'comprehensive validation SelectionState B', 'comprehensive validation SelectionState C', 'comprehensive validation SelectionState D']

  build() {
    Column() {
      Text('comprehensive validation SelectionState board').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingExpandedStateConditional_renderingPPanel {
  @State clicks: number = 0
  @State subtitle: string = 'comprehensive validation ExpandedState action panel'

  build() {
    Column() {
      Text('comprehensive validation ExpandedState').fontSize(18)
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

// Case intent: comprehensive validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingCollapsedStateConditional_renderingQLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('comprehensive validation CollapsedState left').fontSize(14)
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
struct ComprehensiveValidationConditionalRenderingSearchStateConditional_renderingRCollection {
  @State items: string[] = ['comprehensive validation SearchState one', 'comprehensive validation SearchState two', 'comprehensive validation SearchState three']

  build() {
    Column() {
      Text('comprehensive validation SearchState list').fontSize(16)
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

// Case intent: comprehensive validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingPinnedStateConditional_renderingSForm {
  @State keyword: string = 'comprehensive validation pinnedstate'
  @State note: string = 'comprehensive validation PinnedState note'

  build() {
    Column() {
      Text('comprehensive validation PinnedState form').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingMutedStateConditional_renderingTDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable comprehensive validation MutedState' : 'Enable comprehensive validation MutedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('comprehensive validation MutedState enabled branch').fontColor('#117733')
      } else {
        Text('comprehensive validation MutedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('comprehensive validation MutedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: comprehensive validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingSharedStateConditional_renderingUGridBoard {
  @State blocks: string[] = ['comprehensive validation SharedState A', 'comprehensive validation SharedState B', 'comprehensive validation SharedState C', 'comprehensive validation SharedState D']

  build() {
    Column() {
      Text('comprehensive validation SharedState board').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingArchivedStateConditional_renderingVPanel {
  @State clicks: number = 0
  @State subtitle: string = 'comprehensive validation ArchivedState action panel'

  build() {
    Column() {
      Text('comprehensive validation ArchivedState').fontSize(18)
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

// Case intent: comprehensive validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingCompactStateConditional_renderingWLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('comprehensive validation CompactState left').fontSize(14)
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
struct ComprehensiveValidationConditionalRenderingOnlineStateConditional_renderingXCollection {
  @State items: string[] = ['comprehensive validation OnlineState one', 'comprehensive validation OnlineState two', 'comprehensive validation OnlineState three']

  build() {
    Column() {
      Text('comprehensive validation OnlineState list').fontSize(16)
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

// Case intent: comprehensive validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingSyncStateConditional_renderingYForm {
  @State keyword: string = 'comprehensive validation syncstate'
  @State note: string = 'comprehensive validation SyncState note'

  build() {
    Column() {
      Text('comprehensive validation SyncState form').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingLoadingStateConditional_renderingZDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable comprehensive validation LoadingState' : 'Enable comprehensive validation LoadingState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('comprehensive validation LoadingState enabled branch').fontColor('#117733')
      } else {
        Text('comprehensive validation LoadingState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('comprehensive validation LoadingState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: comprehensive validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingWarningStateConditional_renderingAGridBoard {
  @State blocks: string[] = ['comprehensive validation WarningState A', 'comprehensive validation WarningState B', 'comprehensive validation WarningState C', 'comprehensive validation WarningState D']

  build() {
    Column() {
      Text('comprehensive validation WarningState board').fontSize(16)
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
struct ComprehensiveValidationConditionalRenderingEmptyStateConditional_renderingBPanel {
  @State clicks: number = 0
  @State subtitle: string = 'comprehensive validation EmptyState action panel'

  build() {
    Column() {
      Text('comprehensive validation EmptyState').fontSize(18)
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

// Case intent: comprehensive validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComprehensiveValidationConditionalRenderingErrorStateConditional_renderingCLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('comprehensive validation ErrorState left').fontSize(14)
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
struct ComprehensiveValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('comprehensive validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
