@Entry
@ComponentV2
struct HomeComponent {
  @BuilderParam buildTest: () => void
  @BuilderParam buildTest1: () => void = this.testBuilder

  @Builder
  testBuilder() {
    Text("hello testBuilder")
  }

  @Styles
  testStyles() {
    .backgroundColor(Color.Red)
  }

  @Styles useStateStyles() {
    .stateStyles({
      normal: {
        .width(200)
      }
    })
  }

  build() {
    Column() {
      Button() {
        Text("hello HomeComponent")
        .fontSize(30)
        .testStyles()
      }
      .stateStyles({
        normal: {
          .backgroundColor(Color.Green)
        },
        disabled: this.testStyles,
        pressed: this.useStateStyles
      })
      Text("Fancy")
        .useStateStyles()
    }
  }
}