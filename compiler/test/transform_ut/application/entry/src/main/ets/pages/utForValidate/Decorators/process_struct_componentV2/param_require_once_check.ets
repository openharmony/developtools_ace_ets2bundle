@Entry
@ComponentV2
struct testParam {
  @Param param_value: string;
  @Require @Local param_value1: string = "hello"
  @Require value: string = "hello"
  @Once @Local param_value2: string = "hello"
  @Once value1: string = "hello"
  build() {
    Column() {}
  }
}