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

// test for validating MutableBinding reference in Builder component, covering @State and @Local scenarios
import {
  UIUtils,
  MutableBinding
} from '@ohos.arkui.StateManagement'

class MutableProfileModel {
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
function MutableStringPanel(scene: string, textRef: MutableBinding<string>): void {
  Column() {
    Text(scene + ' String').fontSize(16)
    Text('value=' + textRef.value).fontSize(14)
    Text('length=' + textRef.value.length).fontSize(12)
    Button('append').onClick(() => {
      textRef.value = textRef.value + '_m'
    })
    Button('reset').onClick(() => {
      textRef.value = scene + '_reset'
    })
  }
  .padding(6)
}

@Builder
function MutableMapPanel(scene: string, mapRef: MutableBinding<Map<string, number>>): void {
  Column() {
    Text(scene + ' Map').fontSize(16)
    Text('size=' + mapRef.value.size).fontSize(14)
    Text('keys=' + Array.from(mapRef.value.keys()).join(',')).fontSize(12)
    Text('values=' + Array.from(mapRef.value.values()).join(',')).fontSize(12)
    Button('replace map').onClick(() => {
      let nextMap = new Map(mapRef.value)
      nextMap.set(scene + '_k', nextMap.size + 1)
      mapRef.value = nextMap
    })
  }
  .padding(6)
}

@Builder
function MutableClassPanel(scene: string, modelRef: MutableBinding<MutableProfileModel>): void {
  Column() {
    Text(scene + ' Class').fontSize(16)
    Text('id=' + modelRef.value.id).fontSize(14)
    Text('name=' + modelRef.value.name).fontSize(12)
    Text('level=' + modelRef.value.level).fontSize(12)
    Text('total=' + modelRef.value.total()).fontSize(12)
    Button('upgrade model').onClick(() => {
      let nextMetrics = new Map(modelRef.value.metrics)
      nextMetrics.set('bonus', nextMetrics.size * 3)
      modelRef.value = new MutableProfileModel(
        modelRef.value.id,
        modelRef.value.name + '_next',
        modelRef.value.level + '+',
        nextMetrics
      )
    })
  }
  .padding(6)
}

@Builder
function MutableMixedPanel(scene: string, textRef: MutableBinding<string>, mapRef: MutableBinding<Map<string, number>>, modelRef: MutableBinding<MutableProfileModel>): void {
  Column() {
    Text(scene + ' Mixed').fontSize(16)
    Text('text=' + textRef.value).fontSize(12)
    Text('map size=' + mapRef.value.size).fontSize(12)
    Text('model=' + modelRef.value.name + ':' + modelRef.value.total()).fontSize(12)
    Button('batch mutate').onClick(() => {
      textRef.value = textRef.value + '_batch'
      let nextMap = new Map(mapRef.value)
      nextMap.set(scene + '_batch', nextMap.size + 2)
      mapRef.value = nextMap
      modelRef.value = new MutableProfileModel(
        modelRef.value.id + 1,
        modelRef.value.name + '_batch',
        modelRef.value.level,
        new Map(modelRef.value.metrics)
      )
    })
  }
  .padding(6)
}

@Entry
@Component
struct MutableBindingReferenceValidationEntry {
  @State stateText01: string = 'state_text_01'
  @State stateMap01: Map<string, number> = new Map([
    ['sa01', 2],
    ['sb01', 3]
  ])
  @State stateModel01: MutableProfileModel = new MutableProfileModel(
    31,
    'state_model_01',
    'M01',
    new Map([
      ['sx01', 6],
      ['sy01', 8]
    ])
  )

  @State stateText02: string = 'state_text_02'
  @State stateMap02: Map<string, number> = new Map([
    ['sa02', 3],
    ['sb02', 4]
  ])
  @State stateModel02: MutableProfileModel = new MutableProfileModel(
    32,
    'state_model_02',
    'M02',
    new Map([
      ['sx02', 12],
      ['sy02', 14]
    ])
  )

  @State stateText03: string = 'state_text_03'
  @State stateMap03: Map<string, number> = new Map([
    ['sa03', 4],
    ['sb03', 5]
  ])
  @State stateModel03: MutableProfileModel = new MutableProfileModel(
    33,
    'state_model_03',
    'M03',
    new Map([
      ['sx03', 18],
      ['sy03', 20]
    ])
  )

  @State stateText04: string = 'state_text_04'
  @State stateMap04: Map<string, number> = new Map([
    ['sa04', 5],
    ['sb04', 6]
  ])
  @State stateModel04: MutableProfileModel = new MutableProfileModel(
    34,
    'state_model_04',
    'M04',
    new Map([
      ['sx04', 24],
      ['sy04', 26]
    ])
  )

  @State stateText05: string = 'state_text_05'
  @State stateMap05: Map<string, number> = new Map([
    ['sa05', 6],
    ['sb05', 7]
  ])
  @State stateModel05: MutableProfileModel = new MutableProfileModel(
    35,
    'state_model_05',
    'M05',
    new Map([
      ['sx05', 30],
      ['sy05', 32]
    ])
  )

  @State stateText06: string = 'state_text_06'
  @State stateMap06: Map<string, number> = new Map([
    ['sa06', 7],
    ['sb06', 8]
  ])
  @State stateModel06: MutableProfileModel = new MutableProfileModel(
    36,
    'state_model_06',
    'M06',
    new Map([
      ['sx06', 36],
      ['sy06', 38]
    ])
  )

  build() {
    Column() {
      Text('Builder MutableBinding Validation (@State)').fontSize(20)

      MutableStringPanel('StateScene01', UIUtils.makeBinding<string>(() => this.stateText01, (val: string) => { this.stateText01 = val }))
      MutableMapPanel('StateScene01', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap01, (val: Map<string, number>) => { this.stateMap01 = val }))
      MutableClassPanel('StateScene01', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel01, (val: MutableProfileModel) => { this.stateModel01 = val }))
      MutableMixedPanel(
        'StateScene01',
        UIUtils.makeBinding<string>(() => this.stateText01, (val: string) => { this.stateText01 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap01, (val: Map<string, number>) => { this.stateMap01 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel01, (val: MutableProfileModel) => { this.stateModel01 = val })
      )

      MutableStringPanel('StateScene02', UIUtils.makeBinding<string>(() => this.stateText02, (val: string) => { this.stateText02 = val }))
      MutableMapPanel('StateScene02', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap02, (val: Map<string, number>) => { this.stateMap02 = val }))
      MutableClassPanel('StateScene02', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel02, (val: MutableProfileModel) => { this.stateModel02 = val }))
      MutableMixedPanel(
        'StateScene02',
        UIUtils.makeBinding<string>(() => this.stateText02, (val: string) => { this.stateText02 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap02, (val: Map<string, number>) => { this.stateMap02 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel02, (val: MutableProfileModel) => { this.stateModel02 = val })
      )

      MutableStringPanel('StateScene03', UIUtils.makeBinding<string>(() => this.stateText03, (val: string) => { this.stateText03 = val }))
      MutableMapPanel('StateScene03', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap03, (val: Map<string, number>) => { this.stateMap03 = val }))
      MutableClassPanel('StateScene03', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel03, (val: MutableProfileModel) => { this.stateModel03 = val }))
      MutableMixedPanel(
        'StateScene03',
        UIUtils.makeBinding<string>(() => this.stateText03, (val: string) => { this.stateText03 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap03, (val: Map<string, number>) => { this.stateMap03 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel03, (val: MutableProfileModel) => { this.stateModel03 = val })
      )

      MutableStringPanel('StateScene04', UIUtils.makeBinding<string>(() => this.stateText04, (val: string) => { this.stateText04 = val }))
      MutableMapPanel('StateScene04', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap04, (val: Map<string, number>) => { this.stateMap04 = val }))
      MutableClassPanel('StateScene04', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel04, (val: MutableProfileModel) => { this.stateModel04 = val }))
      MutableMixedPanel(
        'StateScene04',
        UIUtils.makeBinding<string>(() => this.stateText04, (val: string) => { this.stateText04 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap04, (val: Map<string, number>) => { this.stateMap04 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel04, (val: MutableProfileModel) => { this.stateModel04 = val })
      )

      MutableStringPanel('StateScene05', UIUtils.makeBinding<string>(() => this.stateText05, (val: string) => { this.stateText05 = val }))
      MutableMapPanel('StateScene05', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap05, (val: Map<string, number>) => { this.stateMap05 = val }))
      MutableClassPanel('StateScene05', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel05, (val: MutableProfileModel) => { this.stateModel05 = val }))
      MutableMixedPanel(
        'StateScene05',
        UIUtils.makeBinding<string>(() => this.stateText05, (val: string) => { this.stateText05 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap05, (val: Map<string, number>) => { this.stateMap05 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel05, (val: MutableProfileModel) => { this.stateModel05 = val })
      )

      MutableStringPanel('StateScene06', UIUtils.makeBinding<string>(() => this.stateText06, (val: string) => { this.stateText06 = val }))
      MutableMapPanel('StateScene06', UIUtils.makeBinding<Map<string, number>>(() => this.stateMap06, (val: Map<string, number>) => { this.stateMap06 = val }))
      MutableClassPanel('StateScene06', UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel06, (val: MutableProfileModel) => { this.stateModel06 = val }))
      MutableMixedPanel(
        'StateScene06',
        UIUtils.makeBinding<string>(() => this.stateText06, (val: string) => { this.stateText06 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.stateMap06, (val: Map<string, number>) => { this.stateMap06 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.stateModel06, (val: MutableProfileModel) => { this.stateModel06 = val })
      )

    }
  }
}

@ComponentV2
struct MutableBindingLocalReferenceShowcase {
  @Local localText01: string = 'local_text_01'
  @Local localMap01: Map<string, number> = new Map([
    ['la01', 6],
    ['lb01', 7]
  ])
  @Local localModel01: MutableProfileModel = new MutableProfileModel(
    61,
    'local_model_01',
    'N01',
    new Map([
      ['lx01', 8],
      ['ly01', 12]
    ])
  )

  @Local localText02: string = 'local_text_02'
  @Local localMap02: Map<string, number> = new Map([
    ['la02', 7],
    ['lb02', 8]
  ])
  @Local localModel02: MutableProfileModel = new MutableProfileModel(
    62,
    'local_model_02',
    'N02',
    new Map([
      ['lx02', 16],
      ['ly02', 20]
    ])
  )

  @Local localText03: string = 'local_text_03'
  @Local localMap03: Map<string, number> = new Map([
    ['la03', 8],
    ['lb03', 9]
  ])
  @Local localModel03: MutableProfileModel = new MutableProfileModel(
    63,
    'local_model_03',
    'N03',
    new Map([
      ['lx03', 24],
      ['ly03', 28]
    ])
  )

  @Local localText04: string = 'local_text_04'
  @Local localMap04: Map<string, number> = new Map([
    ['la04', 9],
    ['lb04', 10]
  ])
  @Local localModel04: MutableProfileModel = new MutableProfileModel(
    64,
    'local_model_04',
    'N04',
    new Map([
      ['lx04', 32],
      ['ly04', 36]
    ])
  )

  @Local localText05: string = 'local_text_05'
  @Local localMap05: Map<string, number> = new Map([
    ['la05', 10],
    ['lb05', 11]
  ])
  @Local localModel05: MutableProfileModel = new MutableProfileModel(
    65,
    'local_model_05',
    'N05',
    new Map([
      ['lx05', 40],
      ['ly05', 44]
    ])
  )

  build() {
    Column() {
      Text('Builder MutableBinding Validation (@Local)').fontSize(20)

      MutableStringPanel('LocalScene01', UIUtils.makeBinding<string>(() => this.localText01, (val: string) => { this.localText01 = val }))
      MutableMapPanel('LocalScene01', UIUtils.makeBinding<Map<string, number>>(() => this.localMap01, (val: Map<string, number>) => { this.localMap01 = val }))
      MutableClassPanel('LocalScene01', UIUtils.makeBinding<MutableProfileModel>(() => this.localModel01, (val: MutableProfileModel) => { this.localModel01 = val }))
      MutableMixedPanel(
        'LocalScene01',
        UIUtils.makeBinding<string>(() => this.localText01, (val: string) => { this.localText01 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap01, (val: Map<string, number>) => { this.localMap01 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.localModel01, (val: MutableProfileModel) => { this.localModel01 = val })
      )

      MutableStringPanel('LocalScene02', UIUtils.makeBinding<string>(() => this.localText02, (val: string) => { this.localText02 = val }))
      MutableMapPanel('LocalScene02', UIUtils.makeBinding<Map<string, number>>(() => this.localMap02, (val: Map<string, number>) => { this.localMap02 = val }))
      MutableClassPanel('LocalScene02', UIUtils.makeBinding<MutableProfileModel>(() => this.localModel02, (val: MutableProfileModel) => { this.localModel02 = val }))
      MutableMixedPanel(
        'LocalScene02',
        UIUtils.makeBinding<string>(() => this.localText02, (val: string) => { this.localText02 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap02, (val: Map<string, number>) => { this.localMap02 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.localModel02, (val: MutableProfileModel) => { this.localModel02 = val })
      )

      MutableStringPanel('LocalScene03', UIUtils.makeBinding<string>(() => this.localText03, (val: string) => { this.localText03 = val }))
      MutableMapPanel('LocalScene03', UIUtils.makeBinding<Map<string, number>>(() => this.localMap03, (val: Map<string, number>) => { this.localMap03 = val }))
      MutableClassPanel('LocalScene03', UIUtils.makeBinding<MutableProfileModel>(() => this.localModel03, (val: MutableProfileModel) => { this.localModel03 = val }))
      MutableMixedPanel(
        'LocalScene03',
        UIUtils.makeBinding<string>(() => this.localText03, (val: string) => { this.localText03 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap03, (val: Map<string, number>) => { this.localMap03 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.localModel03, (val: MutableProfileModel) => { this.localModel03 = val })
      )

      MutableStringPanel('LocalScene04', UIUtils.makeBinding<string>(() => this.localText04, (val: string) => { this.localText04 = val }))
      MutableMapPanel('LocalScene04', UIUtils.makeBinding<Map<string, number>>(() => this.localMap04, (val: Map<string, number>) => { this.localMap04 = val }))
      MutableClassPanel('LocalScene04', UIUtils.makeBinding<MutableProfileModel>(() => this.localModel04, (val: MutableProfileModel) => { this.localModel04 = val }))
      MutableMixedPanel(
        'LocalScene04',
        UIUtils.makeBinding<string>(() => this.localText04, (val: string) => { this.localText04 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap04, (val: Map<string, number>) => { this.localMap04 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.localModel04, (val: MutableProfileModel) => { this.localModel04 = val })
      )

      MutableStringPanel('LocalScene05', UIUtils.makeBinding<string>(() => this.localText05, (val: string) => { this.localText05 = val }))
      MutableMapPanel('LocalScene05', UIUtils.makeBinding<Map<string, number>>(() => this.localMap05, (val: Map<string, number>) => { this.localMap05 = val }))
      MutableClassPanel('LocalScene05', UIUtils.makeBinding<MutableProfileModel>(() => this.localModel05, (val: MutableProfileModel) => { this.localModel05 = val }))
      MutableMixedPanel(
        'LocalScene05',
        UIUtils.makeBinding<string>(() => this.localText05, (val: string) => { this.localText05 = val }),
        UIUtils.makeBinding<Map<string, number>>(() => this.localMap05, (val: Map<string, number>) => { this.localMap05 = val }),
        UIUtils.makeBinding<MutableProfileModel>(() => this.localModel05, (val: MutableProfileModel) => { this.localModel05 = val })
      )

    }
  }
}
