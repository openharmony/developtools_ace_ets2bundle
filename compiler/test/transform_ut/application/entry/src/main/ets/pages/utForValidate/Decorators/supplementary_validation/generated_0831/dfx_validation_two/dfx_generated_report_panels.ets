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

/**
 * Created: 2026-08-31
 * DFX validation coverage for lifecycle-friendly reporting widgets, nested builders,
 * reusable cards, and mixed V1/V2 state updates used by diagnostics views.
 */

class DfxReportRow {
  name: string
  value: number
  unit: string

  constructor(name: string, value: number, unit: string) {
    this.name = name
    this.value = value
    this.unit = unit
  }

  display(): string {
    return this.name + '=' + this.value.toString() + this.unit
  }
}

@Styles
function DfxReportStyle() {
  .padding(10)
  .borderRadius(4)
}

@Extend(Text)
function dfxCaption(): void {
  .fontSize(12)
  .fontColor(Color.Gray)
}

@Builder
function DfxReportHeader(title: string, subtitle: string): void {
  Column() {
    Text(title).fontSize(16)
    Text(subtitle).dfxCaption()
  }
}

@Builder
function DfxReportRows(rows: DfxReportRow[]): void {
  Column() {
    ForEach(rows, (row: DfxReportRow) => {
      Row() {
        Text(row.name).fontSize(12)
        Text(row.value.toString()).fontSize(12)
        Text(row.unit).fontSize(12)
      }
    }, (row: DfxReportRow) => row.name)
  }
}

@Reusable
@Component
struct DfxReusableReportCard {
  @State title: string = 'report'
  @State rows: DfxReportRow[] = [new DfxReportRow('init', 0, 'ms')]

  aboutToReuse(params: Record<string, Object>): void {
    this.title = (params['title'] as string) || this.title
  }

  build() {
    Column() {
      DfxReportHeader(this.title, 'reusable')
      DfxReportRows(this.rows)
    }
    .DfxReportStyle()
  }
}

@ObservedV2
class DfxSessionModel {
  @Trace name: string = 'session'
  @Trace latency: number = 0
  @Trace ok: boolean = true

  update(latency: number, ok: boolean): void {
    this.latency = latency
    this.ok = ok
  }
}

@ComponentV2
struct DfxSessionPanel {
  @Param model: DfxSessionModel = new DfxSessionModel()
  @Local samples: number = 1
  @Local label: string = 'sample'

  @Computed get health(): string {
    return this.model.ok ? 'healthy' : 'degraded'
  }

  @Monitor('samples')
  onSamplesChanged(): void {
    console.log('dfx samples changed')
  }

  build() {
    Column() {
      Text(this.model.name)
      Text(this.health)
      Text(this.label + ':' + this.samples.toString())
      Button('Sample').onClick(() => {
        this.samples++
        this.model.update(this.samples * 3, this.samples % 2 === 0)
      })
    }
    .DfxReportStyle()
  }
}

@Component
struct DfxReportScenario01 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-01', 2, 'ms'),
    new DfxReportRow('check-01', 3, 'ms'),
    new DfxReportRow('emit-01', 4, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 01', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 01' })
      Button('Enable 01').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario02 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-02', 4, 'ms'),
    new DfxReportRow('check-02', 6, 'ms'),
    new DfxReportRow('emit-02', 8, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 02', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 02' })
      Button('Enable 02').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario03 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-03', 6, 'ms'),
    new DfxReportRow('check-03', 9, 'ms'),
    new DfxReportRow('emit-03', 12, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 03', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 03' })
      Button('Enable 03').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario04 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-04', 8, 'ms'),
    new DfxReportRow('check-04', 12, 'ms'),
    new DfxReportRow('emit-04', 16, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 04', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 04' })
      Button('Enable 04').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario05 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-05', 10, 'ms'),
    new DfxReportRow('check-05', 15, 'ms'),
    new DfxReportRow('emit-05', 20, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 05', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 05' })
      Button('Enable 05').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario06 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-06', 12, 'ms'),
    new DfxReportRow('check-06', 18, 'ms'),
    new DfxReportRow('emit-06', 24, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 06', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 06' })
      Button('Enable 06').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario07 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-07', 14, 'ms'),
    new DfxReportRow('check-07', 21, 'ms'),
    new DfxReportRow('emit-07', 28, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 07', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 07' })
      Button('Enable 07').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario08 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-08', 16, 'ms'),
    new DfxReportRow('check-08', 24, 'ms'),
    new DfxReportRow('emit-08', 32, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 08', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 08' })
      Button('Enable 08').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario09 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-09', 18, 'ms'),
    new DfxReportRow('check-09', 27, 'ms'),
    new DfxReportRow('emit-09', 36, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 09', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 09' })
      Button('Enable 09').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario10 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-10', 20, 'ms'),
    new DfxReportRow('check-10', 30, 'ms'),
    new DfxReportRow('emit-10', 40, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 10', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 10' })
      Button('Enable 10').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario11 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-11', 22, 'ms'),
    new DfxReportRow('check-11', 33, 'ms'),
    new DfxReportRow('emit-11', 44, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 11', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 11' })
      Button('Enable 11').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario12 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-12', 24, 'ms'),
    new DfxReportRow('check-12', 36, 'ms'),
    new DfxReportRow('emit-12', 48, 'ms')
  ]
  @State enabled: boolean = true

  build() {
    Column() {
      DfxReportHeader('DFX report 12', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 12' })
      Button('Enable 12').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Component
struct DfxReportScenario13 {
  @State rows: DfxReportRow[] = [
    new DfxReportRow('parse-13', 26, 'ms'),
    new DfxReportRow('check-13', 39, 'ms'),
    new DfxReportRow('emit-13', 52, 'ms')
  ]
  @State enabled: boolean = false

  build() {
    Column() {
      DfxReportHeader('DFX report 13', this.enabled ? 'enabled' : 'disabled')
      DfxReportRows(this.rows)
      DfxReusableReportCard({ title: 'Reusable 13' })
      Button('Enable 13').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario01 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 1

  @Computed get title(): string {
    return 'session-01:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 01')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 01').onClick(() => {
        this.current++
        this.model.name = 'session-01'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario02 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 2

  @Computed get title(): string {
    return 'session-02:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 02')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 02').onClick(() => {
        this.current++
        this.model.name = 'session-02'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario03 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 3

  @Computed get title(): string {
    return 'session-03:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 03')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 03').onClick(() => {
        this.current++
        this.model.name = 'session-03'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario04 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 4

  @Computed get title(): string {
    return 'session-04:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 04')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 04').onClick(() => {
        this.current++
        this.model.name = 'session-04'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario05 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 5

  @Computed get title(): string {
    return 'session-05:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 05')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 05').onClick(() => {
        this.current++
        this.model.name = 'session-05'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario06 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 6

  @Computed get title(): string {
    return 'session-06:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 06')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 06').onClick(() => {
        this.current++
        this.model.name = 'session-06'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario07 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 7

  @Computed get title(): string {
    return 'session-07:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 07')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 07').onClick(() => {
        this.current++
        this.model.name = 'session-07'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario08 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 8

  @Computed get title(): string {
    return 'session-08:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 08')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 08').onClick(() => {
        this.current++
        this.model.name = 'session-08'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario09 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 9

  @Computed get title(): string {
    return 'session-09:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 09')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 09').onClick(() => {
        this.current++
        this.model.name = 'session-09'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario10 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 10

  @Computed get title(): string {
    return 'session-10:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 10')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 10').onClick(() => {
        this.current++
        this.model.name = 'session-10'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario11 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 11

  @Computed get title(): string {
    return 'session-11:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 11')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 11').onClick(() => {
        this.current++
        this.model.name = 'session-11'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario12 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 12

  @Computed get title(): string {
    return 'session-12:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 12')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 12').onClick(() => {
        this.current++
        this.model.name = 'session-12'
      })
    }
  }
}

@ComponentV2
struct DfxSessionScenario13 {
  @Local model: DfxSessionModel = new DfxSessionModel()
  @Local current: number = 13

  @Computed get title(): string {
    return 'session-13:' + this.current.toString()
  }

  @Monitor('current')
  onCurrentChanged(): void {
    console.log('dfx current changed 13')
  }

  build() {
    Column() {
      Text(this.title)
      DfxSessionPanel({ model: this.model })
      Button('Advance 13').onClick(() => {
        this.current++
        this.model.name = 'session-13'
      })
    }
  }
}

@Entry
@Component
struct DfxGenerated0831TwoEntry {
  build() {
    Scroll() {
      Column() {
        Text('Generated DFX Validation Two 0831').fontSize(20)
        DfxReportScenario01()
        DfxReportScenario02()
        DfxReportScenario03()
        DfxReportScenario04()
        DfxReportScenario05()
        DfxReportScenario06()
        DfxReportScenario07()
        DfxReportScenario08()
        DfxReportScenario09()
        DfxReportScenario10()
        DfxReportScenario11()
        DfxReportScenario12()
        DfxReportScenario13()
        DfxSessionScenario01()
        DfxSessionScenario02()
        DfxSessionScenario03()
        DfxSessionScenario04()
        DfxSessionScenario05()
        DfxSessionScenario06()
        DfxSessionScenario07()
        DfxSessionScenario08()
        DfxSessionScenario09()
        DfxSessionScenario10()
        DfxSessionScenario11()
        DfxSessionScenario12()
        DfxSessionScenario13()
      }
    }
  }
}
