@Entry
@ComponentV2
struct v2MemberDecorator {
  @Computed computed_value: string = "hello"

  @Local
  aa() {}

  @Computed
  bb() {}

  @Monitor("user") get value(){ return "" }

  build() {
    Column()
  }
}
