@Entry
@ComponentV2
struct Test {
  build() {}
}
class v2DecoratorInClass {
  @Local local_value: string = "hello"
  @Param param_value: string = "hello"
  @Param @Once param_once_value: string = "hello"
  @Once once_value: string = "hello"
  @Event event: () => void = () => {}
  @Provider() provider_value: string = "hello"
  @Consumer() consumer_value: string = "hello"
}