@Entry
@Component
struct Parent {
  @State message: string ='Hello';

  build() {
    Column() {
      Child();
    }
  }
}

@Component
struct Child {
  @Link message: string
  build() {
    Row() {}
  }
}