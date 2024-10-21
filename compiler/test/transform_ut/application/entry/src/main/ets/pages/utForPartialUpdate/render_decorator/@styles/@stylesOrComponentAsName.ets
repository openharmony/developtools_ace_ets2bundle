@Entry
@Component
struct Index {
  @Styles Index() {
    .backgroundColor(Color.Blue)
  }
  build() {
    Row() {
      Text('111')
        .width(30)
        .Index()
        .height(30)
      ComB();
      ComA();
      MyComponent();
    }
  }
}

@Component
struct ComA {
   @Styles ComA() {
    .backgroundColor(Color.Blue)
  }
  build() {
    Row() {
      Text('111')
        .ComA()
        .width(30)
        .height(30)
    }
  }
}

@Component
struct ComB {
   @Styles ComB() {
    .backgroundColor(Color.Blue)
  }
  build() {
    Row() {
      Text('111')
        .width(30)
        .height(30)
        .ComB()
    }
  }
}

@Component
struct MyComponent {
  @Styles MyComponent() {
    .backgroundColor(Color.Gray)
  }

  build() {
    Column() {
      Text('Text1')
        .fontSize(50)
        .fontColor(Color.White)
        .stateStyles({
          normal: this.MyComponent,
        })
    }
  }
}