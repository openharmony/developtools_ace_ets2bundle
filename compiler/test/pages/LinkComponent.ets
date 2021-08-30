import DefaultComponent from "./DefaultComponent.ets"

@Component
struct LinkComponent1 {
  @Link LinkComponent1Link1?: any
  @Link LinkComponent1Link2?: number
  @Link LinkComponent1Link3?: boolean
  @Link LinkComponent1Link4?: string
  @State indexState1: any = { count: 0 }
  @State indexState2: number = 0
  @State indexState3: boolean = false
  @State indexState4: string = 'Home'

  build() {
    Row() {
      DefaultComponent({
        DefaultComponentLink1: $indexState1,
        DefaultComponentLink2: $indexState2,
        DefaultComponentLink3: $indexState3,
        DefaultComponentLink4: $indexState4,
        myVar: 100,
        myVar2: 100
      })
    }
  }
}

@Component
struct LinkComponent2 {
  @Link LinkComponent2Link1?: any
  @Link LinkComponent2Link2?: number
  @Link LinkComponent2Link3?: boolean
  @Link LinkComponent2Link4?: string
  @State indexState1: any = { count: 0 }
  @State indexState2: number = 0
  @State indexState3: boolean = false
  @State indexState4: string = 'Home'

  build() {
    Row() {
      DefaultComponent({
        DefaultComponentLink1: $indexState1,
        DefaultComponentLink2: $indexState2,
        DefaultComponentLink3: $indexState3,
        DefaultComponentLink4: $indexState4,
        myVar: 100,
        myVar2: 100
      })
    }
  }
}

@Component
struct LinkComponent3 {
  @Link LinkComponent3Link1?: any
  @Link LinkComponent3Link2?: number
  @Link LinkComponent3Link3?: boolean
  @Link LinkComponent3Link4?: string
  @State indexState1: any = { count: 0 }
  @State indexState2: number = 0
  @State indexState3: boolean = false
  @State indexState4: string = 'Home'

  build() {
    Row() {
      DefaultComponent({
        DefaultComponentLink1: $indexState1,
        DefaultComponentLink2: $indexState2,
        DefaultComponentLink3: $indexState3,
        DefaultComponentLink4: $indexState4,
        myVar: 100,
        myVar2: 100
      })
    }
  }
}

@Component
struct LinkComponent4 {
  @Link LinkComponent3Link1?: any
  @Link LinkComponent3Link2?: number
  @Link LinkComponent3Link3?: boolean
  @Link LinkComponent3Link4?: string
  @State indexState1: any = { count: 0 }
  @State indexState2: number = 0
  @State indexState3: boolean = false
  @State indexState4: string = 'Home'

  build() {
    Row() {
      DefaultComponent({
        DefaultComponentLink1: $indexState1,
        DefaultComponentLink2: $indexState2,
        DefaultComponentLink3: $indexState3,
        DefaultComponentLink4: $indexState4,
        myVar: 100,
        myVar2: 100
      })
    }
  }
}

export { LinkComponent1 as LinkComponent, LinkComponent2, LinkComponent3 }

export default LinkComponent4
