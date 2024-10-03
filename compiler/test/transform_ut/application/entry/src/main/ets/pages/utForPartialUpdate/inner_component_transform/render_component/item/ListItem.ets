@Entry
@Component
struct ParentView {
  build() {
    List() {
      ListItem('true') {
        Text('xx').width(100)
      }.width(200).height(100)
    }
  }
}