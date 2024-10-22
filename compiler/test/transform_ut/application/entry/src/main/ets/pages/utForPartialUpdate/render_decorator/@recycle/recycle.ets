@Entry
@Component
struct RecycleHomeComponent {
  @State state_value: string = "100%"
  @State value: number = 1
  build() {
    Column() {
      RecycleChild({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
      Text("aa")
        .width(this.state_value)
        .height(100)
    }
    .width(this.state_value)
    .height(100)
  }
}

@Reusable
@Component
struct RecycleChild {
  @Prop propvalue: number;
  @Link linkvalue: number;
  @State state_value: number = 1;
  @State width_value: string = "100%"
  reguar_value: number = 50;
  controller: TabsController = new TabsController();
  @State heightValue: number = 100
  build() {
    Column() {
      RecycleAnimationTest()
        .border({width: 3, color: Color.Red})
        .height(this.heightValue)

      Text("hello")
        .width(this.propvalue)
        .fontSize(this.reguar_value)
        .height(100)
        .fontColor(Color.Red)
        .border({width: this.propvalue, color: Color.Red, radius: 100})
      Button() {
        Text("hhhhhhhhhhhhh")
          .fontSize(this.state_value)
          .width(100)
      }
      .border({width: this.reguar_value, color: Color.Red, radius: 100})
      
      ListItem('true') {
        Text('ListItem')
          .width(this.width_value)
          .height(100)
      }
      .width(this.width_value)
      .height(100)

      ListItem('true')
        .width(this.width_value)
        .height(100)

      Tabs({ barPosition: BarPosition.Start, index: 1, controller: this.controller}) {
        TabContent() {
          Flex() {
            Column() {
              Text('text1')
                .width(this.width_value)
                .height(100)
            }
            .width(this.width_value)
            .height(100)
          }
          .width(this.width_value)
          .height(100)
        }
        .tabBar("TabBar")
        .width(this.width_value)
        .height(100)
        TabContent() {
          Text('text2')
          .width(this.width_value)
          .height(100)
        }
        .tabBar("TabBar 2")
        .width(this.width_value)
        .height(100)
        TabContent()
          .width(this.width_value)
          .height(100)
      }
      .width(this.width_value)
      .height(100)
    }
  }
}

@Component
struct RecycleNormalComponent {
  @State width_value: string = "100%"
  build() {
    Column() {
      Text("hello")
        .width(this.width_value)
        .height(100)
    }
  }
}

@Reusable
@Component
struct RecycleAnimationTest {
  @State width_value: string = "100%"
  build() {
    Column() {
      Text("hello")
      .height(100)
      .width(this.width_value)
      .animation({duration: 300})
    }
  }
}