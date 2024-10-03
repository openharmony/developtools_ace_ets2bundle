import { AllStarComponent } from '../../../test/ExportStarComponent'
import TsModule from '../../../test/TsModule'

@Entry
@Component
struct ImportTest {
  @State myState1: any = new TsModule(1).method();
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'ImportTest'

  build() {
    Column() {
      AllStarComponent.ExportComponent({
        ExportComponent1Link1: $myState1,
        ExportComponent1Link2: $myState2,
        ExportComponent1Link3: $myState3,
        ExportComponent1Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'ExportComponent1'
      })
      AllStarComponent.default({
        ExportComponent4Link1: $myState1,
        ExportComponent4Link2: $myState2,
        ExportComponent4Link3: $myState3,
        ExportComponent4Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'ExportComponent4'
      })
    }
  }
}