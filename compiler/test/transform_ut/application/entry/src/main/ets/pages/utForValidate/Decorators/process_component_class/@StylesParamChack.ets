@Entry
@Component
struct StylesParamChackIndex {
  @Styles styleComp(color: string) {
    .backgroundColor(color)
  }
  build() {
    Text('Hello')
      .styleComp('red')
  }
}