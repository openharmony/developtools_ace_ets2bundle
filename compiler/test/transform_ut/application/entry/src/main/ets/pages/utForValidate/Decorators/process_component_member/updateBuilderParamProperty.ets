@Component
struct UpdateBuilderParamPropertyChild {
  @BuilderParam componentBuilder: string = 'Hello';
  build() {
    Row() {}
  }
}

@Entry
@Component
struct UpdateBuilderParamPropertyParent {
  build() {
    Column() {
      UpdateBuilderParamPropertyChild()
    }
  }
}