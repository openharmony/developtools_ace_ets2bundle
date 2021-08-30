@Component
struct MyLinkTestComponent {
  @Link myLink1?: any
  @Link myLink2?: number
  @Link myLink3?: boolean
  @Link myLink4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

@Entry
@Component
struct LinkTest {
  @State myState1: any = { count: 0 }
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'Home'

  build() {
    Row() {
      MyLinkTestComponent({
          myLink1: $myState1,
          myLink2: $myState2,
          myLink3: $myState3,
          myLink4: $myState4,
          myVar: 100,
          myVar2: 100,
      })
    }
  }
}