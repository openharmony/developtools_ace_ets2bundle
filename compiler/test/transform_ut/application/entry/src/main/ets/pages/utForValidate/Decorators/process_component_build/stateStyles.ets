// @ts-nocheck
@Entry
@Component
struct Index {
  build() {
    Column({ space: 5 }) {
      Button() {
        Text('Hello')
      }
      .stateStyles()
    }
  }
}
