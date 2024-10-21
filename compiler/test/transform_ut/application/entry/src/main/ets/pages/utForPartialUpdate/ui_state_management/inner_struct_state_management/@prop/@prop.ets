@Component
struct CustomX{
  @Prop fruit:string='香蕉'
  build(){

  }
}
@Entry
@Component
struct CustomY {
  @State parentFruit: string = '苹果'
  build() {
    Row() {
      CustomX({fruit:this.parentFruit})
      CustomX({})
    }
  }
}