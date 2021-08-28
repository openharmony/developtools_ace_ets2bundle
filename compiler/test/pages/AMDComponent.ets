@Component
struct AMDComponent {
  @Link AMDComponentLink1?: any
  @Link AMDComponentLink2?: number
  @Link AMDComponentLink3?: boolean
  @Link AMDComponentLink4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

export = AMDComponent
