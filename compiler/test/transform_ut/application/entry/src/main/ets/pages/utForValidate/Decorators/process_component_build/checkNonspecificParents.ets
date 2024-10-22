@Entry
@Component
struct CheckNonspecificParentsIndex {
  build() {
    Row() {
      List() {
        ListItem() {
          Blank()
        }
      }
      if (true) {
        Blank()
      }
    }
  }
}