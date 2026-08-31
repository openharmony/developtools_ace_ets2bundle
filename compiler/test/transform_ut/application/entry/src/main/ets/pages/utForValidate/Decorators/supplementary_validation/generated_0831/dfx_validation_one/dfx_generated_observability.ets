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
 * DFX validation coverage for diagnostic counters, monitor callbacks, provider/consumer
 * propagation, and readable status panels without producing compiler warnings.
 */

@Styles
function DfxPanelStyle() {
  .padding(8)
  .borderRadius(6)
}

@Builder
function DfxMetricLine(name: string, value: string): void {
  Row() {
    Text(name).fontSize(12)
    Text(value).fontSize(12)
  }
}

@Builder
function DfxStatusBadge(level: string, message: string): void {
  Row() {
    Text(level).fontSize(12)
    Text(message).fontSize(12)
  }
  .DfxPanelStyle()
}

@Observed
class DfxMetricPacket {
  id: number
  label: string
  counters: Map<string, number>

  constructor(id: number, label: string) {
    this.id = id
    this.label = label
    this.counters = new Map([
      ['render', id * 2],
      ['state', id * 3],
      ['event', id * 4]
    ])
  }

  total(): number {
    let sum: number = 0
    this.counters.forEach((value: number) => {
      sum += value
    })
    return sum
  }
}

@ObservedV2
class DfxTracePacket {
  @Trace stage: string = 'idle'
  @Trace count: number = 0
  @Trace message: string = 'created'

  advance(stage: string): void {
    this.stage = stage
    this.count++
    this.message = stage + ':' + this.count.toString()
  }
}

@Component
struct DfxMetricLeaf {
  @ObjectLink packet: DfxMetricPacket

  build() {
    Column() {
      Text(this.packet.label)
      DfxMetricLine('render', (this.packet.counters.get('render') ?? 0).toString())
      DfxMetricLine('state', (this.packet.counters.get('state') ?? 0).toString())
      DfxMetricLine('event', (this.packet.counters.get('event') ?? 0).toString())
      DfxMetricLine('total', this.packet.total().toString())
    }
    .DfxPanelStyle()
  }
}

@ComponentV2
struct DfxTraceLeaf {
  @Param trace: DfxTracePacket = new DfxTracePacket()
  @Param name: string = 'trace'
  @Local localCount: number = 0

  @Computed get summary(): string {
    return this.name + ':' + this.trace.stage + ':' + this.localCount.toString()
  }

  @Monitor('localCount')
  onLocalCountChange(): void {
    console.log('dfx local count changed')
  }

  build() {
    Column() {
      Text(this.summary)
      Text(this.trace.message)
      Button('Local').onClick(() => {
        this.localCount++
      })
      Button('Trace').onClick(() => {
        this.trace.advance(this.name)
      })
    }
    .DfxPanelStyle()
  }
}

@ComponentV2
struct DfxStatusProvider {
  @Provider('dfxStatus') status: string = 'ready'
  @Local tick: number = 0

  @Computed get statusText(): string {
    return this.status + ':' + this.tick.toString()
  }

  build() {
    Column() {
      Text(this.statusText)
      Button('Next Status').onClick(() => {
        this.tick++
        this.status = this.tick % 2 === 0 ? 'ready' : 'busy'
      })
      DfxStatusConsumer()
    }
  }
}

@ComponentV2
struct DfxStatusConsumer {
  @Consumer('dfxStatus') status: string = 'ready'

  build() {
    Column() {
      DfxStatusBadge('consumer', this.status)
    }
  }
}

@Component
struct DfxMetricScenario01 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(1, 'metric-01')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario01')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 01').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario02 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(2, 'metric-02')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario02')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 02').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario03 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(3, 'metric-03')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario03')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 03').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario04 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(4, 'metric-04')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario04')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 04').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario05 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(5, 'metric-05')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario05')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 05').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario06 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(6, 'metric-06')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario06')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 06').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario07 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(7, 'metric-07')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario07')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 07').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario08 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(8, 'metric-08')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario08')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 08').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario09 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(9, 'metric-09')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario09')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 09').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario10 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(10, 'metric-10')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario10')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 10').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario11 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(11, 'metric-11')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario11')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 11').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario12 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(12, 'metric-12')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario12')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 12').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario13 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(13, 'metric-13')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario13')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 13').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario14 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(14, 'metric-14')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('DfxMetricScenario14')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 14').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@Component
struct DfxMetricScenario15 {
  @State packet: DfxMetricPacket = new DfxMetricPacket(15, 'metric-15')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('DfxMetricScenario15')
      DfxMetricLeaf({ packet: this.packet })
      DfxStatusBadge('expanded', this.expanded.toString())
      Button('Toggle 15').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        DfxMetricLine('details', this.packet.total().toString())
      }
    }
  }
}

@ComponentV2
struct DfxTraceScenario01 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = false

  @Computed get title(): string {
    return 'trace-01:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 01')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-01' })
      Button('Switch 01').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario02 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = true

  @Computed get title(): string {
    return 'trace-02:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 02')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-02' })
      Button('Switch 02').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario03 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = false

  @Computed get title(): string {
    return 'trace-03:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 03')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-03' })
      Button('Switch 03').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario04 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = true

  @Computed get title(): string {
    return 'trace-04:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 04')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-04' })
      Button('Switch 04').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario05 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = false

  @Computed get title(): string {
    return 'trace-05:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 05')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-05' })
      Button('Switch 05').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario06 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = true

  @Computed get title(): string {
    return 'trace-06:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 06')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-06' })
      Button('Switch 06').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario07 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = false

  @Computed get title(): string {
    return 'trace-07:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 07')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-07' })
      Button('Switch 07').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario08 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = true

  @Computed get title(): string {
    return 'trace-08:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 08')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-08' })
      Button('Switch 08').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario09 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = false

  @Computed get title(): string {
    return 'trace-09:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 09')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-09' })
      Button('Switch 09').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct DfxTraceScenario10 {
  @Local trace: DfxTracePacket = new DfxTracePacket()
  @Local active: boolean = true

  @Computed get title(): string {
    return 'trace-10:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChanged(): void {
    console.log('dfx active changed 10')
  }

  build() {
    Column() {
      Text(this.title)
      DfxTraceLeaf({ trace: this.trace, name: 'trace-10' })
      Button('Switch 10').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@Entry
@Component
struct DfxGenerated0831OneEntry {
  build() {
    Scroll() {
      Column() {
        Text('Generated DFX Validation One 0831').fontSize(20)
        DfxStatusProvider()
        DfxMetricScenario01()
        DfxMetricScenario02()
        DfxMetricScenario03()
        DfxMetricScenario04()
        DfxMetricScenario05()
        DfxMetricScenario06()
        DfxMetricScenario07()
        DfxMetricScenario08()
        DfxMetricScenario09()
        DfxMetricScenario10()
        DfxMetricScenario11()
        DfxMetricScenario12()
        DfxMetricScenario13()
        DfxMetricScenario14()
        DfxMetricScenario15()
        DfxTraceScenario01()
        DfxTraceScenario02()
        DfxTraceScenario03()
        DfxTraceScenario04()
        DfxTraceScenario05()
        DfxTraceScenario06()
        DfxTraceScenario07()
        DfxTraceScenario08()
        DfxTraceScenario09()
        DfxTraceScenario10()
      }
    }
  }
}
