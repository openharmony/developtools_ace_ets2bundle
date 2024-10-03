@Entry
@Component
struct ParentView {
  build() {
    Grid() {
      GridItem('true') {
        Text('xx').width(100)
      }.width(200).height(100)
    }
  }
}