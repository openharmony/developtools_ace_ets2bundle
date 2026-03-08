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
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: decorator validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingOnlineStateConditional_renderingAGridBoard {
  @State blocks: string[] = ['decorator validation OnlineState A', 'decorator validation OnlineState B', 'decorator validation OnlineState C', 'decorator validation OnlineState D']

  build() {
    Column() {
      Text('decorator validation OnlineState board').fontSize(16)
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
struct DecoratorValidationConditionalRenderingSyncStateConditional_renderingBPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation SyncState action panel'

  build() {
    Column() {
      Text('decorator validation SyncState').fontSize(18)
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

// Case intent: decorator validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingLoadingStateConditional_renderingCLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation LoadingState left').fontSize(14)
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
struct DecoratorValidationConditionalRenderingWarningStateConditional_renderingDCollection {
  @State items: string[] = ['decorator validation WarningState one', 'decorator validation WarningState two', 'decorator validation WarningState three']

  build() {
    Column() {
      Text('decorator validation WarningState list').fontSize(16)
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

// Case intent: decorator validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingEmptyStateConditional_renderingEForm {
  @State keyword: string = 'decorator validation emptystate'
  @State note: string = 'decorator validation EmptyState note'

  build() {
    Column() {
      Text('decorator validation EmptyState form').fontSize(16)
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
struct DecoratorValidationConditionalRenderingErrorStateConditional_renderingFDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation ErrorState' : 'Enable decorator validation ErrorState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation ErrorState enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation ErrorState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation ErrorState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: decorator validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingFilterStateConditional_renderingGGridBoard {
  @State blocks: string[] = ['decorator validation FilterState A', 'decorator validation FilterState B', 'decorator validation FilterState C', 'decorator validation FilterState D']

  build() {
    Column() {
      Text('decorator validation FilterState board').fontSize(16)
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
struct DecoratorValidationConditionalRenderingSortStateConditional_renderingHPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation SortState action panel'

  build() {
    Column() {
      Text('decorator validation SortState').fontSize(18)
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

// Case intent: decorator validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingEditStateConditional_renderingILayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation EditState left').fontSize(14)
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
struct DecoratorValidationConditionalRenderingReadonlyStateConditional_renderingJCollection {
  @State items: string[] = ['decorator validation ReadonlyState one', 'decorator validation ReadonlyState two', 'decorator validation ReadonlyState three']

  build() {
    Column() {
      Text('decorator validation ReadonlyState list').fontSize(16)
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

// Case intent: decorator validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingDraftStateConditional_renderingKForm {
  @State keyword: string = 'decorator validation draftstate'
  @State note: string = 'decorator validation DraftState note'

  build() {
    Column() {
      Text('decorator validation DraftState form').fontSize(16)
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
struct DecoratorValidationConditionalRenderingPublishStateConditional_renderingLDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation PublishState' : 'Enable decorator validation PublishState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation PublishState enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation PublishState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation PublishState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: decorator validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingNightStateConditional_renderingMGridBoard {
  @State blocks: string[] = ['decorator validation NightState A', 'decorator validation NightState B', 'decorator validation NightState C', 'decorator validation NightState D']

  build() {
    Column() {
      Text('decorator validation NightState board').fontSize(16)
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
struct DecoratorValidationConditionalRenderingFocusStateConditional_renderingNPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation FocusState action panel'

  build() {
    Column() {
      Text('decorator validation FocusState').fontSize(18)
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

// Case intent: decorator validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingSelectionStateConditional_renderingOLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation SelectionState left').fontSize(14)
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
struct DecoratorValidationConditionalRenderingExpandedStateConditional_renderingPCollection {
  @State items: string[] = ['decorator validation ExpandedState one', 'decorator validation ExpandedState two', 'decorator validation ExpandedState three']

  build() {
    Column() {
      Text('decorator validation ExpandedState list').fontSize(16)
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

// Case intent: decorator validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingCollapsedStateConditional_renderingQForm {
  @State keyword: string = 'decorator validation collapsedstate'
  @State note: string = 'decorator validation CollapsedState note'

  build() {
    Column() {
      Text('decorator validation CollapsedState form').fontSize(16)
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
struct DecoratorValidationConditionalRenderingSearchStateConditional_renderingRDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation SearchState' : 'Enable decorator validation SearchState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation SearchState enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation SearchState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation SearchState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: decorator validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingPinnedStateConditional_renderingSGridBoard {
  @State blocks: string[] = ['decorator validation PinnedState A', 'decorator validation PinnedState B', 'decorator validation PinnedState C', 'decorator validation PinnedState D']

  build() {
    Column() {
      Text('decorator validation PinnedState board').fontSize(16)
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
struct DecoratorValidationConditionalRenderingMutedStateConditional_renderingTPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation MutedState action panel'

  build() {
    Column() {
      Text('decorator validation MutedState').fontSize(18)
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

// Case intent: decorator validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingSharedStateConditional_renderingULayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation SharedState left').fontSize(14)
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
struct DecoratorValidationConditionalRenderingArchivedStateConditional_renderingVCollection {
  @State items: string[] = ['decorator validation ArchivedState one', 'decorator validation ArchivedState two', 'decorator validation ArchivedState three']

  build() {
    Column() {
      Text('decorator validation ArchivedState list').fontSize(16)
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

// Case intent: decorator validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingCompactStateConditional_renderingWForm {
  @State keyword: string = 'decorator validation compactstate'
  @State note: string = 'decorator validation CompactState note'

  build() {
    Column() {
      Text('decorator validation CompactState form').fontSize(16)
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
struct DecoratorValidationConditionalRenderingOnlineStateConditional_renderingXDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable decorator validation OnlineState' : 'Enable decorator validation OnlineState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('decorator validation OnlineState enabled branch').fontColor('#117733')
      } else {
        Text('decorator validation OnlineState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('decorator validation OnlineState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

// Case intent: decorator validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingSyncStateConditional_renderingYGridBoard {
  @State blocks: string[] = ['decorator validation SyncState A', 'decorator validation SyncState B', 'decorator validation SyncState C', 'decorator validation SyncState D']

  build() {
    Column() {
      Text('decorator validation SyncState board').fontSize(16)
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
struct DecoratorValidationConditionalRenderingLoadingStateConditional_renderingZPanel {
  @State clicks: number = 0
  @State subtitle: string = 'decorator validation LoadingState action panel'

  build() {
    Column() {
      Text('decorator validation LoadingState').fontSize(18)
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

// Case intent: decorator validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingWarningStateConditional_renderingALayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('decorator validation WarningState left').fontSize(14)
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
struct DecoratorValidationConditionalRenderingEmptyStateConditional_renderingBCollection {
  @State items: string[] = ['decorator validation EmptyState one', 'decorator validation EmptyState two', 'decorator validation EmptyState three']

  build() {
    Column() {
      Text('decorator validation EmptyState list').fontSize(16)
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

// Case intent: decorator validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct DecoratorValidationConditionalRenderingErrorStateConditional_renderingCForm {
  @State keyword: string = 'decorator validation errorstate'
  @State note: string = 'decorator validation ErrorState note'

  build() {
    Column() {
      Text('decorator validation ErrorState form').fontSize(16)
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
struct DecoratorValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('decorator validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
