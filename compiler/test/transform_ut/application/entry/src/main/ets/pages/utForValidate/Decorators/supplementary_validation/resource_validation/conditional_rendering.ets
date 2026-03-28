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

// Category: resource_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: resource validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingOnlineStateConditional_renderingADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable resource validation OnlineState' : 'Enable resource validation OnlineState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('resource validation OnlineState enabled branch').fontColor('#117733')
      } else {
        Text('resource validation OnlineState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('resource validation OnlineState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ResourceValidationConditionalRenderingSyncStateConditional_renderingBGridBoard {
  @State blocks: string[] = ['resource validation SyncState A', 'resource validation SyncState B', 'resource validation SyncState C', 'resource validation SyncState D']

  build() {
    Column() {
      Text('resource validation SyncState board').fontSize(16)
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

// Case intent: resource validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingLoadingStateConditional_renderingCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'resource validation LoadingState action panel'

  build() {
    Column() {
      Text('resource validation LoadingState').fontSize(18)
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
struct ResourceValidationConditionalRenderingWarningStateConditional_renderingDLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('resource validation WarningState left').fontSize(14)
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

// Case intent: resource validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingEmptyStateConditional_renderingECollection {
  @State items: string[] = ['resource validation EmptyState one', 'resource validation EmptyState two', 'resource validation EmptyState three']

  build() {
    Column() {
      Text('resource validation EmptyState list').fontSize(16)
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
struct ResourceValidationConditionalRenderingErrorStateConditional_renderingFForm {
  @State keyword: string = 'resource validation errorstate'
  @State note: string = 'resource validation ErrorState note'

  build() {
    Column() {
      Text('resource validation ErrorState form').fontSize(16)
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

// Case intent: resource validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingFilterStateConditional_renderingGDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable resource validation FilterState' : 'Enable resource validation FilterState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('resource validation FilterState enabled branch').fontColor('#117733')
      } else {
        Text('resource validation FilterState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('resource validation FilterState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ResourceValidationConditionalRenderingSortStateConditional_renderingHGridBoard {
  @State blocks: string[] = ['resource validation SortState A', 'resource validation SortState B', 'resource validation SortState C', 'resource validation SortState D']

  build() {
    Column() {
      Text('resource validation SortState board').fontSize(16)
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

// Case intent: resource validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingEditStateConditional_renderingIPanel {
  @State clicks: number = 0
  @State subtitle: string = 'resource validation EditState action panel'

  build() {
    Column() {
      Text('resource validation EditState').fontSize(18)
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
struct ResourceValidationConditionalRenderingReadonlyStateConditional_renderingJLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('resource validation ReadonlyState left').fontSize(14)
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

// Case intent: resource validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingDraftStateConditional_renderingKCollection {
  @State items: string[] = ['resource validation DraftState one', 'resource validation DraftState two', 'resource validation DraftState three']

  build() {
    Column() {
      Text('resource validation DraftState list').fontSize(16)
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
struct ResourceValidationConditionalRenderingPublishStateConditional_renderingLForm {
  @State keyword: string = 'resource validation publishstate'
  @State note: string = 'resource validation PublishState note'

  build() {
    Column() {
      Text('resource validation PublishState form').fontSize(16)
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

// Case intent: resource validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingNightStateConditional_renderingMDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable resource validation NightState' : 'Enable resource validation NightState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('resource validation NightState enabled branch').fontColor('#117733')
      } else {
        Text('resource validation NightState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('resource validation NightState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ResourceValidationConditionalRenderingFocusStateConditional_renderingNGridBoard {
  @State blocks: string[] = ['resource validation FocusState A', 'resource validation FocusState B', 'resource validation FocusState C', 'resource validation FocusState D']

  build() {
    Column() {
      Text('resource validation FocusState board').fontSize(16)
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

// Case intent: resource validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingSelectionStateConditional_renderingOPanel {
  @State clicks: number = 0
  @State subtitle: string = 'resource validation SelectionState action panel'

  build() {
    Column() {
      Text('resource validation SelectionState').fontSize(18)
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
struct ResourceValidationConditionalRenderingExpandedStateConditional_renderingPLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('resource validation ExpandedState left').fontSize(14)
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

// Case intent: resource validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingCollapsedStateConditional_renderingQCollection {
  @State items: string[] = ['resource validation CollapsedState one', 'resource validation CollapsedState two', 'resource validation CollapsedState three']

  build() {
    Column() {
      Text('resource validation CollapsedState list').fontSize(16)
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
struct ResourceValidationConditionalRenderingSearchStateConditional_renderingRForm {
  @State keyword: string = 'resource validation searchstate'
  @State note: string = 'resource validation SearchState note'

  build() {
    Column() {
      Text('resource validation SearchState form').fontSize(16)
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

// Case intent: resource validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingPinnedStateConditional_renderingSDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable resource validation PinnedState' : 'Enable resource validation PinnedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('resource validation PinnedState enabled branch').fontColor('#117733')
      } else {
        Text('resource validation PinnedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('resource validation PinnedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ResourceValidationConditionalRenderingMutedStateConditional_renderingTGridBoard {
  @State blocks: string[] = ['resource validation MutedState A', 'resource validation MutedState B', 'resource validation MutedState C', 'resource validation MutedState D']

  build() {
    Column() {
      Text('resource validation MutedState board').fontSize(16)
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

// Case intent: resource validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingSharedStateConditional_renderingUPanel {
  @State clicks: number = 0
  @State subtitle: string = 'resource validation SharedState action panel'

  build() {
    Column() {
      Text('resource validation SharedState').fontSize(18)
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
struct ResourceValidationConditionalRenderingArchivedStateConditional_renderingVLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('resource validation ArchivedState left').fontSize(14)
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

// Case intent: resource validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingCompactStateConditional_renderingWCollection {
  @State items: string[] = ['resource validation CompactState one', 'resource validation CompactState two', 'resource validation CompactState three']

  build() {
    Column() {
      Text('resource validation CompactState list').fontSize(16)
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
struct ResourceValidationConditionalRenderingOnlineStateConditional_renderingXForm {
  @State keyword: string = 'resource validation onlinestate'
  @State note: string = 'resource validation OnlineState note'

  build() {
    Column() {
      Text('resource validation OnlineState form').fontSize(16)
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

// Case intent: resource validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingSyncStateConditional_renderingYDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable resource validation SyncState' : 'Enable resource validation SyncState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('resource validation SyncState enabled branch').fontColor('#117733')
      } else {
        Text('resource validation SyncState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('resource validation SyncState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct ResourceValidationConditionalRenderingLoadingStateConditional_renderingZGridBoard {
  @State blocks: string[] = ['resource validation LoadingState A', 'resource validation LoadingState B', 'resource validation LoadingState C', 'resource validation LoadingState D']

  build() {
    Column() {
      Text('resource validation LoadingState board').fontSize(16)
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

// Case intent: resource validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingWarningStateConditional_renderingAPanel {
  @State clicks: number = 0
  @State subtitle: string = 'resource validation WarningState action panel'

  build() {
    Column() {
      Text('resource validation WarningState').fontSize(18)
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
struct ResourceValidationConditionalRenderingEmptyStateConditional_renderingBLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('resource validation EmptyState left').fontSize(14)
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

// Case intent: resource validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct ResourceValidationConditionalRenderingErrorStateConditional_renderingCCollection {
  @State items: string[] = ['resource validation ErrorState one', 'resource validation ErrorState two', 'resource validation ErrorState three']

  build() {
    Column() {
      Text('resource validation ErrorState list').fontSize(16)
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
struct ResourceValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('resource validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
