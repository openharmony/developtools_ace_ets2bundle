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

// test for validating Binding reference in Builder component, covering @State and @Local scenarios
import {
  UIUtils,
  Binding
} from '@ohos.arkui.StateManagement'

class BuilderProfileModel {
  id: number
  name: string
  level: string
  metrics: Map<string, number>

  constructor(id: number, name: string, level: string, metrics: Map<string, number>) {
    this.id = id
    this.name = name
    this.level = level
    this.metrics = metrics
  }

  total(): number {
    let sum: number = 0
    this.metrics.forEach((value: number) => {
      sum += value
    })
    return sum
  }
}

@Builder
function BindingStringPanel(scene: string, textRef: Binding<string>): void {
  Column() {
    Text(scene + ' String').fontSize(16)
    Text('value=' + textRef.value).fontSize(14)
    Text('length=' + textRef.value.length).fontSize(12)
    Text('upper=' + textRef.value.toUpperCase()).fontSize(12)
  }
  .padding(6)
}

@Builder
function BindingMapPanel(scene: string, mapRef: Binding<Map<string, number>>): void {
  Column() {
    Text(scene + ' Map').fontSize(16)
    Text('size=' + mapRef.value.size).fontSize(14)
    Text('keys=' + Array.from(mapRef.value.keys()).join(',')).fontSize(12)
    Text('values=' + Array.from(mapRef.value.values()).join(',')).fontSize(12)
  }
  .padding(6)
}

@Builder
function BindingClassPanel(scene: string, modelRef: Binding<BuilderProfileModel>): void {
  Column() {
    Text(scene + ' Class').fontSize(16)
    Text('id=' + modelRef.value.id).fontSize(14)
    Text('name=' + modelRef.value.name).fontSize(12)
    Text('level=' + modelRef.value.level).fontSize(12)
    Text('total=' + modelRef.value.total()).fontSize(12)
  }
  .padding(6)
}

@Builder
function BindingMixedPanel(scene: string, textRef: Binding<string>, mapRef: Binding<Map<string, number>>, modelRef: Binding<BuilderProfileModel>): void {
  Column() {
    Text(scene + ' Mixed').fontSize(16)
    Text('text=' + textRef.value).fontSize(14)
    Text('map size=' + mapRef.value.size).fontSize(12)
    Text('model=' + modelRef.value.name + ':' + modelRef.value.total()).fontSize(12)
  }
  .padding(6)
}

@Builder
function BindingSummaryPanel(scene: string, textRef: Binding<string>, mapRef: Binding<Map<string, number>>, modelRef: Binding<BuilderProfileModel>): void {
  Column() {
    Text(scene + ' Summary').fontSize(16)
    Text('summary=' + textRef.value + ' | ' + mapRef.value.size + ' | ' + modelRef.value.level).fontSize(12)
  }
  .padding(6)
}

@Entry
@Component
struct BindingReferenceValidationEntry {
  @State stateText01: string = 'state_text_01'
  @State stateMap01: Map<string, number> = new Map([
    ['a01', 1],
    ['b01', 2],
    ['c01', 3]
  ])
  @State stateModel01: BuilderProfileModel = new BuilderProfileModel(
    1,
    'state_model_01',
    'L01',
    new Map([
      ['x01', 10],
      ['y01', 13]
    ])
  )

  @State stateText02: string = 'state_text_02'
  @State stateMap02: Map<string, number> = new Map([
    ['a02', 2],
    ['b02', 3],
    ['c02', 4]
  ])
  @State stateModel02: BuilderProfileModel = new BuilderProfileModel(
    2,
    'state_model_02',
    'L02',
    new Map([
      ['x02', 20],
      ['y02', 23]
    ])
  )

  @State stateText03: string = 'state_text_03'
  @State stateMap03: Map<string, number> = new Map([
    ['a03', 3],
    ['b03', 4],
    ['c03', 5]
  ])
  @State stateModel03: BuilderProfileModel = new BuilderProfileModel(
    3,
    'state_model_03',
    'L03',
    new Map([
      ['x03', 30],
      ['y03', 33]
    ])
  )

  @State stateText04: string = 'state_text_04'
  @State stateMap04: Map<string, number> = new Map([
    ['a04', 4],
    ['b04', 5],
    ['c04', 6]
  ])
  @State stateModel04: BuilderProfileModel = new BuilderProfileModel(
    4,
    'state_model_04',
    'L04',
    new Map([
      ['x04', 40],
      ['y04', 43]
    ])
  )

  @State stateText05: string = 'state_text_05'
  @State stateMap05: Map<string, number> = new Map([
    ['a05', 5],
    ['b05', 6],
    ['c05', 7]
  ])
  @State stateModel05: BuilderProfileModel = new BuilderProfileModel(
    5,
    'state_model_05',
    'L05',
    new Map([
      ['x05', 50],
      ['y05', 53]
    ])
  )

  @State stateText06: string = 'state_text_06'
  @State stateMap06: Map<string, number> = new Map([
    ['a06', 6],
    ['b06', 7],
    ['c06', 8]
  ])
  @State stateModel06: BuilderProfileModel = new BuilderProfileModel(
    6,
    'state_model_06',
    'L06',
    new Map([
      ['x06', 60],
      ['y06', 63]
    ])
  )

  build() {
    Column() {
      Text('Builder Binding Reference Validation (@State)').fontSize(20)

      BindingStringPanel('StateScene01', UIUtils.makeBinding<string>(() => this.stateText01))
      BindingMapPanel('StateScene01', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap01))
      BindingClassPanel('StateScene01', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel01))
      BindingMixedPanel(
        'StateScene01',
        UIUtils.makeBinding<string>(() => this.stateText01),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap01),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel01)
      )
      BindingSummaryPanel(
        'StateScene01',
        UIUtils.makeBinding<string>(() => this.stateText01),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap01),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel01)
      )

      BindingStringPanel('StateScene02', UIUtils.makeBinding<string>(() => this.stateText02))
      BindingMapPanel('StateScene02', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap02))
      BindingClassPanel('StateScene02', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel02))
      BindingMixedPanel(
        'StateScene02',
        UIUtils.makeBinding<string>(() => this.stateText02),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap02),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel02)
      )
      BindingSummaryPanel(
        'StateScene02',
        UIUtils.makeBinding<string>(() => this.stateText02),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap02),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel02)
      )

      BindingStringPanel('StateScene03', UIUtils.makeBinding<string>(() => this.stateText03))
      BindingMapPanel('StateScene03', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap03))
      BindingClassPanel('StateScene03', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel03))
      BindingMixedPanel(
        'StateScene03',
        UIUtils.makeBinding<string>(() => this.stateText03),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap03),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel03)
      )
      BindingSummaryPanel(
        'StateScene03',
        UIUtils.makeBinding<string>(() => this.stateText03),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap03),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel03)
      )

      BindingStringPanel('StateScene04', UIUtils.makeBinding<string>(() => this.stateText04))
      BindingMapPanel('StateScene04', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap04))
      BindingClassPanel('StateScene04', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel04))
      BindingMixedPanel(
        'StateScene04',
        UIUtils.makeBinding<string>(() => this.stateText04),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap04),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel04)
      )
      BindingSummaryPanel(
        'StateScene04',
        UIUtils.makeBinding<string>(() => this.stateText04),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap04),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel04)
      )

      BindingStringPanel('StateScene05', UIUtils.makeBinding<string>(() => this.stateText05))
      BindingMapPanel('StateScene05', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap05))
      BindingClassPanel('StateScene05', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel05))
      BindingMixedPanel(
        'StateScene05',
        UIUtils.makeBinding<string>(() => this.stateText05),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap05),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel05)
      )
      BindingSummaryPanel(
        'StateScene05',
        UIUtils.makeBinding<string>(() => this.stateText05),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap05),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel05)
      )

      BindingStringPanel('StateScene06', UIUtils.makeBinding<string>(() => this.stateText06))
      BindingMapPanel('StateScene06', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap06))
      BindingClassPanel('StateScene06', UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel06))
      BindingMixedPanel(
        'StateScene06',
        UIUtils.makeBinding<string>(() => this.stateText06),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap06),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel06)
      )
      BindingSummaryPanel(
        'StateScene06',
        UIUtils.makeBinding<string>(() => this.stateText06),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap06),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.stateModel06)
      )

    }
  }
}

@ComponentV2
struct BindingLocalReferenceShowcase {
  @Local localText01: string = 'local_text_01'
  @Local localMap01: Map<string, number> = new Map([
    ['la01', 3],
    ['lb01', 4],
    ['lc01', 5]
  ])
  @Local localModel01: BuilderProfileModel = new BuilderProfileModel(
    21,
    'local_model_01',
    'V01',
    new Map([
      ['lx01', 7],
      ['ly01', 12]
    ])
  )

  @Local localText02: string = 'local_text_02'
  @Local localMap02: Map<string, number> = new Map([
    ['la02', 4],
    ['lb02', 5],
    ['lc02', 6]
  ])
  @Local localModel02: BuilderProfileModel = new BuilderProfileModel(
    22,
    'local_model_02',
    'V02',
    new Map([
      ['lx02', 14],
      ['ly02', 19]
    ])
  )

  @Local localText03: string = 'local_text_03'
  @Local localMap03: Map<string, number> = new Map([
    ['la03', 5],
    ['lb03', 6],
    ['lc03', 7]
  ])
  @Local localModel03: BuilderProfileModel = new BuilderProfileModel(
    23,
    'local_model_03',
    'V03',
    new Map([
      ['lx03', 21],
      ['ly03', 26]
    ])
  )

  @Local localText04: string = 'local_text_04'
  @Local localMap04: Map<string, number> = new Map([
    ['la04', 6],
    ['lb04', 7],
    ['lc04', 8]
  ])
  @Local localModel04: BuilderProfileModel = new BuilderProfileModel(
    24,
    'local_model_04',
    'V04',
    new Map([
      ['lx04', 28],
      ['ly04', 33]
    ])
  )

  @Local localText05: string = 'local_text_05'
  @Local localMap05: Map<string, number> = new Map([
    ['la05', 7],
    ['lb05', 8],
    ['lc05', 9]
  ])
  @Local localModel05: BuilderProfileModel = new BuilderProfileModel(
    25,
    'local_model_05',
    'V05',
    new Map([
      ['lx05', 35],
      ['ly05', 40]
    ])
  )

  build() {
    Column() {
      Text('Builder Binding Reference Validation (@Local)').fontSize(20)

      BindingStringPanel('LocalScene01', UIUtils.makeBinding<string>(() => this.localText01))
      BindingMapPanel('LocalScene01', UIUtils.makeBinding<Map<string, number>>(() => this.localMap01))
      BindingClassPanel('LocalScene01', UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel01))
      BindingMixedPanel(
        'LocalScene01',
        UIUtils.makeBinding<string>(() => this.localText01),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap01),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel01)
      )
      BindingSummaryPanel(
        'LocalScene01',
        UIUtils.makeBinding<string>(() => this.localText01),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap01),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel01)
      )

      BindingStringPanel('LocalScene02', UIUtils.makeBinding<string>(() => this.localText02))
      BindingMapPanel('LocalScene02', UIUtils.makeBinding<Map<string, number>>(() => this.localMap02))
      BindingClassPanel('LocalScene02', UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel02))
      BindingMixedPanel(
        'LocalScene02',
        UIUtils.makeBinding<string>(() => this.localText02),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap02),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel02)
      )
      BindingSummaryPanel(
        'LocalScene02',
        UIUtils.makeBinding<string>(() => this.localText02),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap02),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel02)
      )

      BindingStringPanel('LocalScene03', UIUtils.makeBinding<string>(() => this.localText03))
      BindingMapPanel('LocalScene03', UIUtils.makeBinding<Map<string, number>>(() => this.localMap03))
      BindingClassPanel('LocalScene03', UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel03))
      BindingMixedPanel(
        'LocalScene03',
        UIUtils.makeBinding<string>(() => this.localText03),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap03),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel03)
      )
      BindingSummaryPanel(
        'LocalScene03',
        UIUtils.makeBinding<string>(() => this.localText03),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap03),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel03)
      )

      BindingStringPanel('LocalScene04', UIUtils.makeBinding<string>(() => this.localText04))
      BindingMapPanel('LocalScene04', UIUtils.makeBinding<Map<string, number>>(() => this.localMap04))
      BindingClassPanel('LocalScene04', UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel04))
      BindingMixedPanel(
        'LocalScene04',
        UIUtils.makeBinding<string>(() => this.localText04),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap04),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel04)
      )
      BindingSummaryPanel(
        'LocalScene04',
        UIUtils.makeBinding<string>(() => this.localText04),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap04),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel04)
      )

      BindingStringPanel('LocalScene05', UIUtils.makeBinding<string>(() => this.localText05))
      BindingMapPanel('LocalScene05', UIUtils.makeBinding<Map<string, number>>(() => this.localMap05))
      BindingClassPanel('LocalScene05', UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel05))
      BindingMixedPanel(
        'LocalScene05',
        UIUtils.makeBinding<string>(() => this.localText05),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap05),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel05)
      )
      BindingSummaryPanel(
        'LocalScene05',
        UIUtils.makeBinding<string>(() => this.localText05),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap05),
        UIUtils.makeBinding<BuilderProfileModel>(() => this.localModel05)
      )

    }
  }
}
