// @ts-nocheck
@Entry
@Component
struct Index {
  @Styles styleComp(color) {
    .backgroundColor(color)
  }
  build() {
    Text('Hello')
    .styleComp('red')
  }
}