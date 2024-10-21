@Entry
@Component
struct PageOne {
  pageInfos: NavPathStack = new NavPathStack()

  build() {
    Row() {
      NavDestination() {
        Column() {
        }.width('100%').height('100%')
      }.title('pageOne')
      NavDestination() {}
    }
  }
}