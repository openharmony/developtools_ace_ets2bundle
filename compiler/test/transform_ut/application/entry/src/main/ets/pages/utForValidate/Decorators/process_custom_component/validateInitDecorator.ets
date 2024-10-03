@Entry
@Component
struct Parent {
  @State message: string ='Hello';

  build() {
    Column() {
      Child();
    }
  }
}

@Component
struct Child {
  @Require regular_value: string
  @Require @State state_value: string = "hello"
  @Require @Provide provide_value: string = "hello"
  @Require @Prop prop_value: string
  @Require @BuilderParam build_value: Function
  build() {
    Row() {}
  }
}
