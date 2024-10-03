import { tExtend, tStyles, DivideTest, Base } from '../../../test/ImportNestAll';

@Entry
@Component
struct ImportTest {
  @State testText1: string = 'Hello'
  @State testText2: string = 'World'
  @State testText3: string = 'Test'
  @State testText4: string = 'Component'

  @State testState1: string = 'Base'
  @State testState2: number = 0
  @State testState3: object = { name: 'Base' }
  @State testState4: number = 3
  @State testState5: number = 10

  build() {
    Column() {
      Text(this.testText1)
        .fontSize(50)
      tExtend(20)
      Text(this.testText2)
      tStyles()
      Button(this.testText3)
      Text(this.testText4)
        .fontSize(50)

      Base({
        testStr: $testState1,
        testNum: $testState2,
        testObj: $testState3
      })
      DivideTest({
        testNum1: $testState4,
        testNum2: $testState5
      })
    }
  }
}