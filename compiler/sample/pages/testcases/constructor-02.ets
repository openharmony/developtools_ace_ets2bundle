@Entry
@Component
struct MyLinkComponent {
  @Link myLink1?: any
  @Link myLink2?: number
  @Link myLink3?: boolean
  @Link myLink4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}