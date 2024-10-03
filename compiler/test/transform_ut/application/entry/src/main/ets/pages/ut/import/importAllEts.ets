import * as AllComponent from '../../../test/NamespaceComponent'
import TsModule from '../../../test/TsModule'

@Entry
@Component
struct ImportTest {
  @State myState1: any = new TsModule(1).method()
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'ImportTest'

  build() {
    Column() {
        AllComponent.NamespaceComponent1({
            NamespaceComponent1Link1: $myState1,
            NamespaceComponent1Link2: $myState2,
            NamespaceComponent1Link3: $myState3,
            NamespaceComponent1Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
        AllComponent.NamespaceComponent1({
            NamespaceComponent1Link1: $myState1,
            NamespaceComponent1Link2: $myState2,
            NamespaceComponent1Link3: $myState3,
            NamespaceComponent1Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          .width(100)
          AllComponent.default({
            NamespaceComponent3Link1: $myState1,
            NamespaceComponent3Link2: $myState2,
            NamespaceComponent3Link3: $myState3,
            NamespaceComponent3Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          AllComponent.default({
            NamespaceComponent3Link1: $myState1,
            NamespaceComponent3Link2: $myState2,
            NamespaceComponent3Link3: $myState3,
            NamespaceComponent3Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          .height(200)
    }
  }
}