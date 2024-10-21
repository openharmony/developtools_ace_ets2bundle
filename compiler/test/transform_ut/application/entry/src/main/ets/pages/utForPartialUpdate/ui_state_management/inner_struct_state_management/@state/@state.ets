@Entry
@Component
struct StatePage {
  @State counter: number = 0;
  build() {
    Column() {
      Text("counter:" + this.counter)
    }
  }
}