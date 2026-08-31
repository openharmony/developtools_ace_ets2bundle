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
 * Trusted software Weex validation model. The file keeps all scenarios local and
 * validates declarative UI, builder slots, provider/consumer state, reusable cards,
 * and V2 traced state used by large trusted-container pages.
 */

class WeexPermissionRecord {
  key: string
  granted: boolean
  risk: number

  constructor(key: string, granted: boolean, risk: number) {
    this.key = key
    this.granted = granted
    this.risk = risk
  }

  label(): string {
    return this.key + ':' + this.granted.toString() + ':' + this.risk.toString()
  }
}

@Observed
class WeexTrustBundle {
  bundleName: string
  records: WeexPermissionRecord[]

  constructor(bundleName: string) {
    this.bundleName = bundleName
    this.records = [
      new WeexPermissionRecord('network', true, 1),
      new WeexPermissionRecord('storage', true, 2),
      new WeexPermissionRecord('sensor', false, 3)
    ]
  }

  grantedCount(): number {
    let count: number = 0
    this.records.forEach((record: WeexPermissionRecord) => {
      if (record.granted) {
        count++
      }
    })
    return count
  }
}

@ObservedV2
class WeexRuntimeState {
  @Trace route: string = 'home'
  @Trace revision: number = 0
  @Trace trusted: boolean = true

  switchRoute(route: string): void {
    this.route = route
    this.revision++
  }
}

@Styles
function WeexCardStyle() {
  .padding(8)
  .borderRadius(6)
}

@Extend(Text)
function weexMuted(): void {
  .fontSize(12)
  .fontColor(Color.Gray)
}

@Builder
function WeexTrustHeader(title: string, detail: string): void {
  Column() {
    Text(title).fontSize(16)
    Text(detail).weexMuted()
  }
}

@Builder
function WeexPermissionRows(records: WeexPermissionRecord[]): void {
  Column() {
    ForEach(records, (record: WeexPermissionRecord) => {
      Row() {
        Text(record.key).fontSize(12)
        Text(record.granted.toString()).fontSize(12)
        Text(record.risk.toString()).fontSize(12)
      }
    }, (record: WeexPermissionRecord) => record.key)
  }
}

@Reusable
@Component
struct WeexReusableBadge {
  @State title: string = 'trusted'

  aboutToReuse(params: Record<string, Object>): void {
    this.title = (params['title'] as string) || this.title
  }

  build() {
    Row() {
      Text(this.title).fontSize(12)
    }
    .WeexCardStyle()
  }
}

@Component
struct WeexBundleCard {
  @ObjectLink bundle: WeexTrustBundle

  build() {
    Column() {
      WeexTrustHeader(this.bundle.bundleName, 'granted=' + this.bundle.grantedCount().toString())
      WeexPermissionRows(this.bundle.records)
      WeexReusableBadge({ title: this.bundle.bundleName })
    }
    .WeexCardStyle()
  }
}

@ComponentV2
struct WeexRuntimePanel {
  @Param state: WeexRuntimeState = new WeexRuntimeState()
  @Local tapCount: number = 0
  @Provider('weexTrustMode') mode: string = 'strict'

  @Computed get summary(): string {
    return this.mode + ':' + this.state.route + ':' + this.tapCount.toString()
  }

  @Monitor('tapCount')
  onTapCountChange(): void {
    console.log('weex tap count changed')
  }

  build() {
    Column() {
      Text(this.summary)
      Button('Home').onClick(() => {
        this.tapCount++
        this.state.switchRoute('home')
      })
      Button('Audit').onClick(() => {
        this.tapCount++
        this.state.switchRoute('audit')
      })
      WeexTrustModeConsumer()
    }
    .WeexCardStyle()
  }
}

@ComponentV2
struct WeexTrustModeConsumer {
  @Consumer('weexTrustMode') mode: string = 'strict'

  build() {
    Row() {
      Text('mode').fontSize(12)
      Text(this.mode).fontSize(12)
    }
  }
}

@Component
struct WeexTrustScenario01 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-01')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario01')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 01').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-01', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario02 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-02')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario02')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 02').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-02', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario03 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-03')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario03')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 03').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-03', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario04 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-04')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario04')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 04').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-04', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario05 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-05')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario05')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 05').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-05', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario06 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-06')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario06')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 06').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-06', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario07 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-07')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario07')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 07').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-07', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario08 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-08')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario08')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 08').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-08', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario09 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-09')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario09')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 09').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-09', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario10 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-10')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario10')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 10').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-10', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario11 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-11')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario11')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 11').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-11', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario12 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-12')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario12')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 12').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-12', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario13 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-13')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario13')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 13').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-13', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario14 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-14')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario14')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 14').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-14', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario15 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-15')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario15')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 15').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-15', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario16 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-16')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario16')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 16').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-16', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario17 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-17')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario17')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 17').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-17', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario18 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-18')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario18')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 18').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-18', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario19 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-19')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario19')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 19').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-19', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario20 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-20')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario20')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 20').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-20', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario21 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-21')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario21')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 21').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-21', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario22 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-22')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario22')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 22').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-22', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario23 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-23')
  @State expanded: boolean = false

  build() {
    Column() {
      Text('WeexTrustScenario23')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 23').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-23', this.bundle.bundleName)
      }
    }
  }
}

@Component
struct WeexTrustScenario24 {
  @State bundle: WeexTrustBundle = new WeexTrustBundle('weex-bundle-24')
  @State expanded: boolean = true

  build() {
    Column() {
      Text('WeexTrustScenario24')
      WeexBundleCard({ bundle: this.bundle })
      Button('Expand 24').onClick(() => {
        this.expanded = !this.expanded
      })
      if (this.expanded) {
        WeexPermissionRows(this.bundle.records)
      } else {
        WeexTrustHeader('collapsed-24', this.bundle.bundleName)
      }
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario01 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-01:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 01')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 01').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario02 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-02:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 02')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 02').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario03 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-03:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 03')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 03').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario04 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-04:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 04')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 04').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario05 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-05:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 05')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 05').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario06 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-06:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 06')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 06').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario07 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-07:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 07')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 07').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario08 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-08:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 08')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 08').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario09 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-09:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 09')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 09').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario10 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-10:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 10')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 10').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario11 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-11:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 11')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 11').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario12 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-12:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 12')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 12').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario13 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-13:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 13')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 13').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario14 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-14:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 14')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 14').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario15 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-15:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 15')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 15').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario16 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-16:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 16')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 16').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario17 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-17:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 17')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 17').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario18 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-18:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 18')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 18').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario19 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = false

  @Computed get label(): string {
    return 'runtime-19:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 19')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 19').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@ComponentV2
struct WeexRuntimeScenario20 {
  @Local state: WeexRuntimeState = new WeexRuntimeState()
  @Local active: boolean = true

  @Computed get label(): string {
    return 'runtime-20:' + this.active.toString()
  }

  @Monitor('active')
  onActiveChange(): void {
    console.log('weex runtime active changed 20')
  }

  build() {
    Column() {
      Text(this.label)
      WeexRuntimePanel({ state: this.state })
      Button('Toggle 20').onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@Entry
@Component
struct TrustedWeexGenerated0831Entry {
  build() {
    Scroll() {
      Column() {
        Text('Generated Trusted Weex Validation 0831').fontSize(20)
        WeexTrustScenario01()
        WeexTrustScenario02()
        WeexTrustScenario03()
        WeexTrustScenario04()
        WeexTrustScenario05()
        WeexTrustScenario06()
        WeexTrustScenario07()
        WeexTrustScenario08()
        WeexTrustScenario09()
        WeexTrustScenario10()
        WeexTrustScenario11()
        WeexTrustScenario12()
        WeexTrustScenario13()
        WeexTrustScenario14()
        WeexTrustScenario15()
        WeexTrustScenario16()
        WeexTrustScenario17()
        WeexTrustScenario18()
        WeexTrustScenario19()
        WeexTrustScenario20()
        WeexTrustScenario21()
        WeexTrustScenario22()
        WeexTrustScenario23()
        WeexTrustScenario24()
        WeexRuntimeScenario01()
        WeexRuntimeScenario02()
        WeexRuntimeScenario03()
        WeexRuntimeScenario04()
        WeexRuntimeScenario05()
        WeexRuntimeScenario06()
        WeexRuntimeScenario07()
        WeexRuntimeScenario08()
        WeexRuntimeScenario09()
        WeexRuntimeScenario10()
        WeexRuntimeScenario11()
        WeexRuntimeScenario12()
        WeexRuntimeScenario13()
        WeexRuntimeScenario14()
        WeexRuntimeScenario15()
        WeexRuntimeScenario16()
        WeexRuntimeScenario17()
        WeexRuntimeScenario18()
        WeexRuntimeScenario19()
        WeexRuntimeScenario20()
      }
    }
  }
}
