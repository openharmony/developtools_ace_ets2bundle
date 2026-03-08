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

// Category: v1v2_compatibility_validation
// Topic: conditional_rendering
// Scenario design notes:
// 1) Cases mimic practical UI combinations from docs (layout, input, list, conditional branches).
// 2) Each case keeps syntax valid so registered workflow files have stable diagnostics.
// 3) State transitions are explicit to improve readability during compiler transform debugging.

// Case intent: v1v2 compatibility validation OnlineState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingOnlineStateConditional_renderingACollection {
  @State items: string[] = ['v1v2 compatibility validation OnlineState one', 'v1v2 compatibility validation OnlineState two', 'v1v2 compatibility validation OnlineState three']

  build() {
    Column() {
      Text('v1v2 compatibility validation OnlineState list').fontSize(16)
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
struct V1v2CompatibilityValidationConditionalRenderingSyncStateConditional_renderingBForm {
  @State keyword: string = 'v1v2 compatibility validation syncstate'
  @State note: string = 'v1v2 compatibility validation SyncState note'

  build() {
    Column() {
      Text('v1v2 compatibility validation SyncState form').fontSize(16)
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

// Case intent: v1v2 compatibility validation LoadingState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingLoadingStateConditional_renderingCDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable v1v2 compatibility validation LoadingState' : 'Enable v1v2 compatibility validation LoadingState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('v1v2 compatibility validation LoadingState enabled branch').fontColor('#117733')
      } else {
        Text('v1v2 compatibility validation LoadingState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('v1v2 compatibility validation LoadingState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct V1v2CompatibilityValidationConditionalRenderingWarningStateConditional_renderingDGridBoard {
  @State blocks: string[] = ['v1v2 compatibility validation WarningState A', 'v1v2 compatibility validation WarningState B', 'v1v2 compatibility validation WarningState C', 'v1v2 compatibility validation WarningState D']

  build() {
    Column() {
      Text('v1v2 compatibility validation WarningState board').fontSize(16)
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

// Case intent: v1v2 compatibility validation EmptyState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingEmptyStateConditional_renderingEPanel {
  @State clicks: number = 0
  @State subtitle: string = 'v1v2 compatibility validation EmptyState action panel'

  build() {
    Column() {
      Text('v1v2 compatibility validation EmptyState').fontSize(18)
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
struct V1v2CompatibilityValidationConditionalRenderingErrorStateConditional_renderingFLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('v1v2 compatibility validation ErrorState left').fontSize(14)
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

// Case intent: v1v2 compatibility validation FilterState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingFilterStateConditional_renderingGCollection {
  @State items: string[] = ['v1v2 compatibility validation FilterState one', 'v1v2 compatibility validation FilterState two', 'v1v2 compatibility validation FilterState three']

  build() {
    Column() {
      Text('v1v2 compatibility validation FilterState list').fontSize(16)
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
struct V1v2CompatibilityValidationConditionalRenderingSortStateConditional_renderingHForm {
  @State keyword: string = 'v1v2 compatibility validation sortstate'
  @State note: string = 'v1v2 compatibility validation SortState note'

  build() {
    Column() {
      Text('v1v2 compatibility validation SortState form').fontSize(16)
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

// Case intent: v1v2 compatibility validation EditState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingEditStateConditional_renderingIDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable v1v2 compatibility validation EditState' : 'Enable v1v2 compatibility validation EditState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('v1v2 compatibility validation EditState enabled branch').fontColor('#117733')
      } else {
        Text('v1v2 compatibility validation EditState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('v1v2 compatibility validation EditState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct V1v2CompatibilityValidationConditionalRenderingReadonlyStateConditional_renderingJGridBoard {
  @State blocks: string[] = ['v1v2 compatibility validation ReadonlyState A', 'v1v2 compatibility validation ReadonlyState B', 'v1v2 compatibility validation ReadonlyState C', 'v1v2 compatibility validation ReadonlyState D']

  build() {
    Column() {
      Text('v1v2 compatibility validation ReadonlyState board').fontSize(16)
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

// Case intent: v1v2 compatibility validation DraftState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingDraftStateConditional_renderingKPanel {
  @State clicks: number = 0
  @State subtitle: string = 'v1v2 compatibility validation DraftState action panel'

  build() {
    Column() {
      Text('v1v2 compatibility validation DraftState').fontSize(18)
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
struct V1v2CompatibilityValidationConditionalRenderingPublishStateConditional_renderingLLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('v1v2 compatibility validation PublishState left').fontSize(14)
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

// Case intent: v1v2 compatibility validation NightState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingNightStateConditional_renderingMCollection {
  @State items: string[] = ['v1v2 compatibility validation NightState one', 'v1v2 compatibility validation NightState two', 'v1v2 compatibility validation NightState three']

  build() {
    Column() {
      Text('v1v2 compatibility validation NightState list').fontSize(16)
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
struct V1v2CompatibilityValidationConditionalRenderingFocusStateConditional_renderingNForm {
  @State keyword: string = 'v1v2 compatibility validation focusstate'
  @State note: string = 'v1v2 compatibility validation FocusState note'

  build() {
    Column() {
      Text('v1v2 compatibility validation FocusState form').fontSize(16)
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

// Case intent: v1v2 compatibility validation SelectionState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingSelectionStateConditional_renderingODecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable v1v2 compatibility validation SelectionState' : 'Enable v1v2 compatibility validation SelectionState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('v1v2 compatibility validation SelectionState enabled branch').fontColor('#117733')
      } else {
        Text('v1v2 compatibility validation SelectionState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('v1v2 compatibility validation SelectionState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct V1v2CompatibilityValidationConditionalRenderingExpandedStateConditional_renderingPGridBoard {
  @State blocks: string[] = ['v1v2 compatibility validation ExpandedState A', 'v1v2 compatibility validation ExpandedState B', 'v1v2 compatibility validation ExpandedState C', 'v1v2 compatibility validation ExpandedState D']

  build() {
    Column() {
      Text('v1v2 compatibility validation ExpandedState board').fontSize(16)
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

// Case intent: v1v2 compatibility validation CollapsedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingCollapsedStateConditional_renderingQPanel {
  @State clicks: number = 0
  @State subtitle: string = 'v1v2 compatibility validation CollapsedState action panel'

  build() {
    Column() {
      Text('v1v2 compatibility validation CollapsedState').fontSize(18)
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
struct V1v2CompatibilityValidationConditionalRenderingSearchStateConditional_renderingRLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('v1v2 compatibility validation SearchState left').fontSize(14)
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

// Case intent: v1v2 compatibility validation PinnedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingPinnedStateConditional_renderingSCollection {
  @State items: string[] = ['v1v2 compatibility validation PinnedState one', 'v1v2 compatibility validation PinnedState two', 'v1v2 compatibility validation PinnedState three']

  build() {
    Column() {
      Text('v1v2 compatibility validation PinnedState list').fontSize(16)
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
struct V1v2CompatibilityValidationConditionalRenderingMutedStateConditional_renderingTForm {
  @State keyword: string = 'v1v2 compatibility validation mutedstate'
  @State note: string = 'v1v2 compatibility validation MutedState note'

  build() {
    Column() {
      Text('v1v2 compatibility validation MutedState form').fontSize(16)
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

// Case intent: v1v2 compatibility validation SharedState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingSharedStateConditional_renderingUDecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable v1v2 compatibility validation SharedState' : 'Enable v1v2 compatibility validation SharedState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('v1v2 compatibility validation SharedState enabled branch').fontColor('#117733')
      } else {
        Text('v1v2 compatibility validation SharedState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('v1v2 compatibility validation SharedState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct V1v2CompatibilityValidationConditionalRenderingArchivedStateConditional_renderingVGridBoard {
  @State blocks: string[] = ['v1v2 compatibility validation ArchivedState A', 'v1v2 compatibility validation ArchivedState B', 'v1v2 compatibility validation ArchivedState C', 'v1v2 compatibility validation ArchivedState D']

  build() {
    Column() {
      Text('v1v2 compatibility validation ArchivedState board').fontSize(16)
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

// Case intent: v1v2 compatibility validation CompactState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingCompactStateConditional_renderingWPanel {
  @State clicks: number = 0
  @State subtitle: string = 'v1v2 compatibility validation CompactState action panel'

  build() {
    Column() {
      Text('v1v2 compatibility validation CompactState').fontSize(18)
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
struct V1v2CompatibilityValidationConditionalRenderingOnlineStateConditional_renderingXLayout {
  @State selected: boolean = false

  build() {
    Column() {
      Row() {
        Text('v1v2 compatibility validation OnlineState left').fontSize(14)
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

// Case intent: v1v2 compatibility validation SyncState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingSyncStateConditional_renderingYCollection {
  @State items: string[] = ['v1v2 compatibility validation SyncState one', 'v1v2 compatibility validation SyncState two', 'v1v2 compatibility validation SyncState three']

  build() {
    Column() {
      Text('v1v2 compatibility validation SyncState list').fontSize(16)
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
struct V1v2CompatibilityValidationConditionalRenderingLoadingStateConditional_renderingZForm {
  @State keyword: string = 'v1v2 compatibility validation loadingstate'
  @State note: string = 'v1v2 compatibility validation LoadingState note'

  build() {
    Column() {
      Text('v1v2 compatibility validation LoadingState form').fontSize(16)
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

// Case intent: v1v2 compatibility validation WarningState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingWarningStateConditional_renderingADecision {
  @State enabled: boolean = true
  @State options: string[] = ['alpha', 'beta', 'gamma']

  build() {
    Column() {
      Button(this.enabled ? 'Disable v1v2 compatibility validation WarningState' : 'Enable v1v2 compatibility validation WarningState')
        .onClick(() => { this.enabled = !this.enabled })
      if (this.enabled) {
        Text('v1v2 compatibility validation WarningState enabled branch').fontColor('#117733')
      } else {
        Text('v1v2 compatibility validation WarningState disabled branch').fontColor('#BB4422')
      }
      ForEach(this.options, (op: string) => {
        Text('v1v2 compatibility validation WarningState: ' + op)
      })
    }
    .padding(12)
    .space(6)
  }
}

@Component
struct V1v2CompatibilityValidationConditionalRenderingEmptyStateConditional_renderingBGridBoard {
  @State blocks: string[] = ['v1v2 compatibility validation EmptyState A', 'v1v2 compatibility validation EmptyState B', 'v1v2 compatibility validation EmptyState C', 'v1v2 compatibility validation EmptyState D']

  build() {
    Column() {
      Text('v1v2 compatibility validation EmptyState board').fontSize(16)
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

// Case intent: v1v2 compatibility validation ErrorState demonstrates conditional rendering with explicit state and interaction transitions.
@Component
struct V1v2CompatibilityValidationConditionalRenderingErrorStateConditional_renderingCPanel {
  @State clicks: number = 0
  @State subtitle: string = 'v1v2 compatibility validation ErrorState action panel'

  build() {
    Column() {
      Text('v1v2 compatibility validation ErrorState').fontSize(18)
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
struct V1v2CompatibilityValidationConditionalRenderingConditional_renderingHost {
  build() {
    Column() {
      Text('v1v2 compatibility validation conditional_rendering host')
      Text('Realistic composition cases generated from UI docs patterns')
    }
    .padding(12)
    .space(4)
  }
}
