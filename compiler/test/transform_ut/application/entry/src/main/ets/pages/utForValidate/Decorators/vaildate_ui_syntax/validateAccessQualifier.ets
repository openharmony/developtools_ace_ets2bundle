@Entry
@Component
struct ValidateAccessQualifierHomeComponent {
  @State message: string = "hello"

  build() {
    Column() {
      TestAccessQualifier({
        regular_value: "hello",
        state_value: "hello",
        link_value: this.message,
        prop_value: "hello",
        value: "hello"
      })
    }
    .height(500)
  }
}

@Component
struct TestAccessQualifier {
  private regular_value: string = "hello"
  @State private state_value: string = "hello"
  @StorageLink("a") public storage_value: string = "hello"
  @Consume public consume_value: string
  @Link private link_value: string
  @Provide protected provide_value: string = "hello"
  @Require @Prop private prop_value: string = "hello"
  @Require private value: string = "hello"

  build() {}
}