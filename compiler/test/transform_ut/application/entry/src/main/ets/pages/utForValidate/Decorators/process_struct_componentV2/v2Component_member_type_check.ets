@Builder
function testBuilder() {
  Text("testBuilder")
    .fontSize(30)
}

@Entry
@ComponentV2
struct V2ComponentMemberTypeCheck {
  regular_value = "hello"
  @Local local_value = "hello"
  @BuilderParam builder_value = testBuilder
  @Once @Param @Require param_value = "hello"
  @Param @Require param_value1 = "hello"
  @Once @Param param_value2 = "hello"
  @Param param_value3 = "hello"
  @Event event_value = "hello"
  @Provider() provide_value = "hello"
  @Consumer() consumer_value = "hello"

  build() {
    Text("V2Component member type check")
  }
}