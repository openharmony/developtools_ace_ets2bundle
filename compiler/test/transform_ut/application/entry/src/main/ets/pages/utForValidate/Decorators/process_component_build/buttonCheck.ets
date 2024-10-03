@Entry
@Component
struct Index {
  build() {
    Column({ space: 5 }) {
      Button('Hello') {
        Text('Hello')
      }
    }
  }
}