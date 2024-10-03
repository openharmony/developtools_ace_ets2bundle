@Entry
@ComponentV2
struct mutiDecoratorInComponentV2 {
  @Local @Param local_value: string = "hello"
  @Provider() @Consumer() provide_value: string = "hello"
  @Require @Param param_value1: string = "hello"
  @Param @Once param_value2: string = "hello"
  build() {
    Column() {}
  }
}