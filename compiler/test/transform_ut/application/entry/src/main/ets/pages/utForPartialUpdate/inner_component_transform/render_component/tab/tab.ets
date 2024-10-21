@Entry
@Component
struct TabSimple {
  private controller: TabsController = new TabsController();
  build() {
    Column() {
      Tabs({ barPosition: BarPosition.Start, index: 1, controller: this.controller}) {
        TabContent() {
          Flex() {
            Column() {
              Text('text1')
              .height(100)
              .width(200)
              Text('xxx')
              .height(100)
              .width(200)
            }
            .height(100)
            .width(200)
          }
            .height(100)
            .width(200)
        }
        .tabBar("TabBar")
        .height(100)
        .width(200)
        TabContent() {
          Text('text2')
        }
        .tabBar("TabBar 2")
        .height(100)
        .width(200)
      }
    }
  }
}