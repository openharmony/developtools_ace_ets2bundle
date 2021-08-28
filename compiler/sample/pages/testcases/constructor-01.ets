class DataModel{
  private myData1: number = 0
}

@Entry
@Component
struct MyStateComponent {
  @State myState1: any = { count: 0 }
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'Home'
  @State myState5: DataModel = new DataModel()

  private myVar : number = 0
  private myVar2 : number

  build() {

  }
}