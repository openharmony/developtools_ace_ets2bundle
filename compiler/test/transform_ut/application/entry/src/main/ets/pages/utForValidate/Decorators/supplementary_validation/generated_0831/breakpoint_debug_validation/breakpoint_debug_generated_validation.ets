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
 * Breakpoint debugging validation for line-rich UI declarations, nested builders,
 * event paths, ForEach branches, and V1/V2 component interactions.
 */

class DebugBreakpointRecord {
  name: string
  width: number
  height: number
  columnCount: number

  constructor(name: string, width: number, height: number, columnCount: number) {
    this.name = name
    this.width = width
    this.height = height
    this.columnCount = columnCount
  }

  label(): string {
    return this.name + ':' + this.width.toString() + 'x' + this.height.toString()
  }
}

@Observed
class DebugRoutePacket {
  route: string
  records: DebugBreakpointRecord[]

  constructor(route: string) {
    this.route = route
    this.records = [
      new DebugBreakpointRecord(route + '-xs', 320, 640, 1),
      new DebugBreakpointRecord(route + '-sm', 600, 840, 2),
      new DebugBreakpointRecord(route + '-md', 840, 1080, 3)
    ]
  }
}

@ObservedV2
class DebugSelectionModel {
  @Trace selected: string = 'xs'
  @Trace revision: number = 0
  @Trace enabled: boolean = true

  choose(name: string): void {
    this.selected = name
    this.revision++
  }
}

@Styles
function DebugCardStyle() {
  .padding(8)
  .borderRadius(6)
}

@Builder
function DebugBreakpointHeader(title: string, subtitle: string): void {
  Column() {
    Text(title).fontSize(16)
    Text(subtitle).fontSize(12)
  }
}

@Builder
function DebugBreakpointRows(records: DebugBreakpointRecord[]): void {
  Column() {
    ForEach(records, (record: DebugBreakpointRecord) => {
      Row() {
        Text(record.name).fontSize(12)
        Text(record.width.toString()).fontSize(12)
        Text(record.height.toString()).fontSize(12)
        Text(record.columnCount.toString()).fontSize(12)
      }
    }, (record: DebugBreakpointRecord) => record.name)
  }
}

@Component
struct DebugRouteChild {
  @ObjectLink packet: DebugRoutePacket

  build() {
    Column() {
      DebugBreakpointHeader(this.packet.route, 'route packet')
      DebugBreakpointRows(this.packet.records)
    }
    .DebugCardStyle()
  }
}

@ComponentV2
struct DebugSelectionPanel {
  @Param model: DebugSelectionModel = new DebugSelectionModel()
  @Param title: string = 'debug'
  @Local pressCount: number = 0

  @Computed get summary(): string {
    return this.title + ':' + this.model.selected + ':' + this.pressCount.toString()
  }

  @Monitor('pressCount')
  onPressCountChange(): void {
    console.log('debug press count changed')
  }

  build() {
    Column() {
      Text(this.summary)
      Button('Select XS').onClick(() => {
        this.pressCount++
        this.model.choose('xs')
      })
      Button('Select SM').onClick(() => {
        this.pressCount++
        this.model.choose('sm')
      })
      Button('Select MD').onClick(() => {
        this.pressCount++
        this.model.choose('md')
      })
    }
    .DebugCardStyle()
  }
}

@Component
struct DebugBreakpointScenario01 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-01')
  @State folded: boolean = false
  @State width: number = 320

  build() {
    Column() {
      Text('DebugBreakpointScenario01')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 01').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-01', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario02 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-02')
  @State folded: boolean = true
  @State width: number = 340

  build() {
    Column() {
      Text('DebugBreakpointScenario02')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 02').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-02', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario03 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-03')
  @State folded: boolean = false
  @State width: number = 360

  build() {
    Column() {
      Text('DebugBreakpointScenario03')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 03').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-03', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario04 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-04')
  @State folded: boolean = true
  @State width: number = 380

  build() {
    Column() {
      Text('DebugBreakpointScenario04')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 04').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-04', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario05 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-05')
  @State folded: boolean = false
  @State width: number = 400

  build() {
    Column() {
      Text('DebugBreakpointScenario05')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 05').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-05', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario06 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-06')
  @State folded: boolean = true
  @State width: number = 420

  build() {
    Column() {
      Text('DebugBreakpointScenario06')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 06').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-06', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario07 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-07')
  @State folded: boolean = false
  @State width: number = 440

  build() {
    Column() {
      Text('DebugBreakpointScenario07')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 07').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-07', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario08 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-08')
  @State folded: boolean = true
  @State width: number = 460

  build() {
    Column() {
      Text('DebugBreakpointScenario08')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 08').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-08', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario09 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-09')
  @State folded: boolean = false
  @State width: number = 480

  build() {
    Column() {
      Text('DebugBreakpointScenario09')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 09').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-09', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario10 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-10')
  @State folded: boolean = true
  @State width: number = 500

  build() {
    Column() {
      Text('DebugBreakpointScenario10')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 10').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-10', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario11 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-11')
  @State folded: boolean = false
  @State width: number = 520

  build() {
    Column() {
      Text('DebugBreakpointScenario11')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 11').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-11', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario12 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-12')
  @State folded: boolean = true
  @State width: number = 540

  build() {
    Column() {
      Text('DebugBreakpointScenario12')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 12').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-12', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario13 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-13')
  @State folded: boolean = false
  @State width: number = 560

  build() {
    Column() {
      Text('DebugBreakpointScenario13')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 13').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-13', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario14 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-14')
  @State folded: boolean = true
  @State width: number = 580

  build() {
    Column() {
      Text('DebugBreakpointScenario14')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 14').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-14', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario15 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-15')
  @State folded: boolean = false
  @State width: number = 600

  build() {
    Column() {
      Text('DebugBreakpointScenario15')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 15').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-15', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario16 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-16')
  @State folded: boolean = true
  @State width: number = 620

  build() {
    Column() {
      Text('DebugBreakpointScenario16')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 16').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-16', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario17 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-17')
  @State folded: boolean = false
  @State width: number = 640

  build() {
    Column() {
      Text('DebugBreakpointScenario17')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 17').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-17', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario18 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-18')
  @State folded: boolean = true
  @State width: number = 660

  build() {
    Column() {
      Text('DebugBreakpointScenario18')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 18').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-18', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario19 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-19')
  @State folded: boolean = false
  @State width: number = 680

  build() {
    Column() {
      Text('DebugBreakpointScenario19')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 19').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-19', this.packet.route)
      }
    }
  }
}

@Component
struct DebugBreakpointScenario20 {
  @State packet: DebugRoutePacket = new DebugRoutePacket('route-20')
  @State folded: boolean = true
  @State width: number = 700

  build() {
    Column() {
      Text('DebugBreakpointScenario20')
      Text('width=' + this.width.toString())
      DebugRouteChild({ packet: this.packet })
      Button('Toggle 20').onClick(() => {
        this.folded = !this.folded
        this.width += 8
      })
      if (this.folded) {
        DebugBreakpointRows(this.packet.records)
      } else {
        DebugBreakpointHeader('inline-20', this.packet.route)
      }
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario01 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 01')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario01')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-01' })
      Button('Flip 01').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario02 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 02')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario02')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-02' })
      Button('Flip 02').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario03 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 03')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario03')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-03' })
      Button('Flip 03').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario04 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 04')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario04')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-04' })
      Button('Flip 04').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario05 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 05')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario05')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-05' })
      Button('Flip 05').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario06 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 06')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario06')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-06' })
      Button('Flip 06').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario07 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 07')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario07')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-07' })
      Button('Flip 07').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario08 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 08')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario08')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-08' })
      Button('Flip 08').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario09 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 09')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario09')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-09' })
      Button('Flip 09').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario10 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 10')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario10')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-10' })
      Button('Flip 10').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario11 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 11')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario11')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-11' })
      Button('Flip 11').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario12 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 12')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario12')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-12' })
      Button('Flip 12').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario13 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 13')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario13')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-13' })
      Button('Flip 13').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario14 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 14')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario14')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-14' })
      Button('Flip 14').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario15 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 15')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario15')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-15' })
      Button('Flip 15').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario16 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 16')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario16')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-16' })
      Button('Flip 16').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario17 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = false

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 17')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario17')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-17' })
      Button('Flip 17').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@ComponentV2
struct DebugV2BreakpointScenario18 {
  @Local model: DebugSelectionModel = new DebugSelectionModel()
  @Local enabled: boolean = true

  @Computed get mode(): string {
    return this.enabled ? 'line' : 'compact'
  }

  @Monitor('enabled')
  onEnabledChange(): void {
    console.log('debug enabled changed 18')
  }

  build() {
    Column() {
      Text('DebugV2BreakpointScenario18')
      Text(this.mode)
      DebugSelectionPanel({ model: this.model, title: 'debug-18' })
      Button('Flip 18').onClick(() => {
        this.enabled = !this.enabled
      })
    }
  }
}

@Entry
@Component
struct BreakpointDebugGenerated0831Entry {
  build() {
    Scroll() {
      Column() {
        Text('Generated Breakpoint Debug Validation 0831').fontSize(20)
        DebugBreakpointScenario01()
        DebugBreakpointScenario02()
        DebugBreakpointScenario03()
        DebugBreakpointScenario04()
        DebugBreakpointScenario05()
        DebugBreakpointScenario06()
        DebugBreakpointScenario07()
        DebugBreakpointScenario08()
        DebugBreakpointScenario09()
        DebugBreakpointScenario10()
        DebugBreakpointScenario11()
        DebugBreakpointScenario12()
        DebugBreakpointScenario13()
        DebugBreakpointScenario14()
        DebugBreakpointScenario15()
        DebugBreakpointScenario16()
        DebugBreakpointScenario17()
        DebugBreakpointScenario18()
        DebugBreakpointScenario19()
        DebugBreakpointScenario20()
        DebugV2BreakpointScenario01()
        DebugV2BreakpointScenario02()
        DebugV2BreakpointScenario03()
        DebugV2BreakpointScenario04()
        DebugV2BreakpointScenario05()
        DebugV2BreakpointScenario06()
        DebugV2BreakpointScenario07()
        DebugV2BreakpointScenario08()
        DebugV2BreakpointScenario09()
        DebugV2BreakpointScenario10()
        DebugV2BreakpointScenario11()
        DebugV2BreakpointScenario12()
        DebugV2BreakpointScenario13()
        DebugV2BreakpointScenario14()
        DebugV2BreakpointScenario15()
        DebugV2BreakpointScenario16()
        DebugV2BreakpointScenario17()
        DebugV2BreakpointScenario18()
      }
    }
  }
}
