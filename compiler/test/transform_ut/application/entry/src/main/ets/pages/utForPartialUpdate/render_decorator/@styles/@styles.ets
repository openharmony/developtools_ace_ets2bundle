@Styles function globalFancy() {
  .backgroundColor(Color.Red)
}

@Styles function useStateStyles() {
  .stateStyles({
    normal: {
      .width(200)
    }
  })
}

@Entry
@Component
struct FancyUse {
  @State enable: boolean = true
  @Styles componentFancy() {
    .backgroundColor(Color.Blue)
  }
  build() {
    Column({ space: 10 }) {
      Text("Fancy")
        .globalFancy()
        .width(100)
        .height(100)
      Text("Fancy")
        .componentFancy()
        .width(100)
        .height(100)
      Button() {
        Text("Fancy")
      }
      .enabled(this.enable)
      .onClick(() => {
        this.enable = false
      })
      .stateStyles({
        normal: {
          .backgroundColor(Color.Green)
        },
        disabled: this.componentFancy,
        pressed: globalFancy
      })
      Text("Fancy")
        .useStateStyles()
    }
  }
}