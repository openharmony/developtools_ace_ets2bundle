@Entry
@Component
struct IdCheckIndex {
  build() {
    Column() {
      Text('Hello').id('1')
      Text('Hi').id('1')
    }
  }
}