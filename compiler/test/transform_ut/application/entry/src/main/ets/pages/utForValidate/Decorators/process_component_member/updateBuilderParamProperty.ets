@Component
struct Child {
  @BuilderParam componentBuilder: string = 'Hello';
  build() {
    Row() {}
  }
}

@Entry
@Component
struct Parent {
  build() {
    Column() {
      Child()
    }
  }
}