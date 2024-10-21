@Entry
@Component
struct Index {
  pageStack: NavPathStack = new NavPathStack()

  build() {
    Row() {
      Navigation(this.pageStack) {
      }
      .title('Main')
      Navigation() {}
      .title('Main')
    }
  }
}