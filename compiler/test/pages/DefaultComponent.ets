@Component
struct DefaultComponent {
  @Link DefaultComponentLink1?: any
  @Link DefaultComponentLink2?: number
  @Link DefaultComponentLink3?: boolean
  @Link DefaultComponentLink4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

export default DefaultComponent
