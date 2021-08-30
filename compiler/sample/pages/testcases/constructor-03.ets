@Entry
@Component
struct MyPropComponent {
  @Prop myProp1?: any
  @Prop myProp2?: number
  @Prop myProp3?: boolean
  @Prop myProp4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}