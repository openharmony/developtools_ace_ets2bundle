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

// Category: component_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: component validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingOnlineStateConditional_renderingAGridBoard {
  @State blocks: string[] = ['component validation OnlineState A', 'component validation OnlineState B', 'component validation OnlineState C', 'component validation OnlineState D']

  build() {
    Column() {
      Text('component validation OnlineState board').fontSize(16)
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
struct ComponentValidationConditionalRenderingSyncStateConditional_renderingBPanel {
  @State clicks: number = 0
  @State subtitle: string = 'component validation SyncState action panel'

  build() {
    Column() {
      Text('component validation SyncState').fontSize(18)
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

// Case intent: component validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingLoadingStateConditional_renderingCLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('component validation LoadingState left').fontSize(14)
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
struct ComponentValidationConditionalRenderingWarningStateConditional_renderingDCollection {
  @State items: string[] = ['component validation WarningState one', 'component validation WarningState two', 'component validation WarningState three']

  build() {
    Column() {
      Text('component validation WarningState list').fontSize(16)
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

// Case intent: component validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingEmptyStateConditional_renderingEForm {
  @State keyword: string = 'component validation emptystate'
  @State note: string = 'component validation EmptyState note'

  build() {
    Column() {
      Text('component validation EmptyState form').fontSize(16)
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
struct ComponentValidationConditionalRenderingErrorStateConditional_renderingFDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable component validation ErrorState' : 'Enable component validation ErrorState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('component validation ErrorState enabled branch').fontColor('#117733')
      } else {
        Text('component validation ErrorState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('component validation ErrorState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: component validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingFilterStateConditional_renderingGGridBoard {
  @State blocks: string[] = ['component validation FilterState A', 'component validation FilterState B', 'component validation FilterState C', 'component validation FilterState D']

  build() {
    Column() {
      Text('component validation FilterState board').fontSize(16)
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
struct ComponentValidationConditionalRenderingSortStateConditional_renderingHPanel {
  @State clicks: number = 0
  @State subtitle: string = 'component validation SortState action panel'

  build() {
    Column() {
      Text('component validation SortState').fontSize(18)
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

// Case intent: component validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingEditStateConditional_renderingILayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('component validation EditState left').fontSize(14)
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
struct ComponentValidationConditionalRenderingReadonlyStateConditional_renderingJCollection {
  @State items: string[] = ['component validation ReadonlyState one', 'component validation ReadonlyState two', 'component validation ReadonlyState three']

  build() {
    Column() {
      Text('component validation ReadonlyState list').fontSize(16)
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

// Case intent: component validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingDraftStateConditional_renderingKForm {
  @State keyword: string = 'component validation draftstate'
  @State note: string = 'component validation DraftState note'

  build() {
    Column() {
      Text('component validation DraftState form').fontSize(16)
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
struct ComponentValidationConditionalRenderingPublishStateConditional_renderingLDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable component validation PublishState' : 'Enable component validation PublishState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('component validation PublishState enabled branch').fontColor('#117733')
      } else {
        Text('component validation PublishState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('component validation PublishState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: component validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingNightStateConditional_renderingMGridBoard {
  @State blocks: string[] = ['component validation NightState A', 'component validation NightState B', 'component validation NightState C', 'component validation NightState D']

  build() {
    Column() {
      Text('component validation NightState board').fontSize(16)
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
struct ComponentValidationConditionalRenderingFocusStateConditional_renderingNPanel {
  @State clicks: number = 0
  @State subtitle: string = 'component validation FocusState action panel'

  build() {
    Column() {
      Text('component validation FocusState').fontSize(18)
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

// Case intent: component validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingSelectionStateConditional_renderingOLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('component validation SelectionState left').fontSize(14)
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
struct ComponentValidationConditionalRenderingExpandedStateConditional_renderingPCollection {
  @State items: string[] = ['component validation ExpandedState one', 'component validation ExpandedState two', 'component validation ExpandedState three']

  build() {
    Column() {
      Text('component validation ExpandedState list').fontSize(16)
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

// Case intent: component validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingCollapsedStateConditional_renderingQForm {
  @State keyword: string = 'component validation collapsedstate'
  @State note: string = 'component validation CollapsedState note'

  build() {
    Column() {
      Text('component validation CollapsedState form').fontSize(16)
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
struct ComponentValidationConditionalRenderingSearchStateConditional_renderingRDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable component validation SearchState' : 'Enable component validation SearchState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('component validation SearchState enabled branch').fontColor('#117733')
      } else {
        Text('component validation SearchState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('component validation SearchState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: component validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingPinnedStateConditional_renderingSGridBoard {
  @State blocks: string[] = ['component validation PinnedState A', 'component validation PinnedState B', 'component validation PinnedState C', 'component validation PinnedState D']

  build() {
    Column() {
      Text('component validation PinnedState board').fontSize(16)
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
struct ComponentValidationConditionalRenderingMutedStateConditional_renderingTPanel {
  @State clicks: number = 0
  @State subtitle: string = 'component validation MutedState action panel'

  build() {
    Column() {
      Text('component validation MutedState').fontSize(18)
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

// Case intent: component validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingSharedStateConditional_renderingULayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('component validation SharedState left').fontSize(14)
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
struct ComponentValidationConditionalRenderingArchivedStateConditional_renderingVCollection {
  @State items: string[] = ['component validation ArchivedState one', 'component validation ArchivedState two', 'component validation ArchivedState three']

  build() {
    Column() {
      Text('component validation ArchivedState list').fontSize(16)
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

// Case intent: component validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingCompactStateConditional_renderingWForm {
  @State keyword: string = 'component validation compactstate'
  @State note: string = 'component validation CompactState note'

  build() {
    Column() {
      Text('component validation CompactState form').fontSize(16)
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
struct ComponentValidationConditionalRenderingOnlineStateConditional_renderingXDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable component validation OnlineState' : 'Enable component validation OnlineState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('component validation OnlineState enabled branch').fontColor('#117733')
      } else {
        Text('component validation OnlineState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('component validation OnlineState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: component validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingSyncStateConditional_renderingYGridBoard {
  @State blocks: string[] = ['component validation SyncState A', 'component validation SyncState B', 'component validation SyncState C', 'component validation SyncState D']

  build() {
    Column() {
      Text('component validation SyncState board').fontSize(16)
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
struct ComponentValidationConditionalRenderingLoadingStateConditional_renderingZPanel {
  @State clicks: number = 0
  @State subtitle: string = 'component validation LoadingState action panel'

  build() {
    Column() {
      Text('component validation LoadingState').fontSize(18)
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

// Case intent: component validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingWarningStateConditional_renderingALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('component validation WarningState left').fontSize(14)
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
struct ComponentValidationConditionalRenderingEmptyStateConditional_renderingBCollection {
  @State items: string[] = ['component validation EmptyState one', 'component validation EmptyState two', 'component validation EmptyState three']

  build() {
    Column() {
      Text('component validation EmptyState list').fontSize(16)
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

// Case intent: component validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ComponentValidationConditionalRenderingErrorStateConditional_renderingCForm {
  @State keyword: string = 'component validation errorstate'
  @State note: string = 'component validation ErrorState note'

  build() {
    Column() {
      Text('component validation ErrorState form').fontSize(16)
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
struct ComponentValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('component validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
