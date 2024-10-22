@Entry
@Component
struct ValidateInitDecoratorParent {
  @State message: string ='Hello';

  build() {
    Column() {
      ValidateInitDecoratorChild();
    }
  }
}

@Component
struct ValidateInitDecoratorChild {
  @Require regular_value: string = "hello"
  @Require @State state_value: string = "hello"
  @Require @Provide provide_value: string = "hello"
  @Require @Prop prop_value: string
  @Require @BuilderParam build_value: Function
  build() {
    Row() {}
  }
}