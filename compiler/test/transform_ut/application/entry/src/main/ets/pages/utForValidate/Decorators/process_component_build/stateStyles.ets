@Entry
@Component
struct StateStylesIndex {
  build() {
    Column({ space: 5 }) {
      Button() {
        Text('Hello')
      }
      .stateStyles()
    }
  }
}