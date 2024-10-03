@Entry
@Component
struct Index {
  @State WIDTH_AND_HEIGHT: Array<{ w: number, h: number }> = [
    { w: 10, h: 10 },
    { w: 20, h: 20 },
    { w: 30, h: 30 },
    { w: 40, h: 40 },
    { w: 50, h: 50 }
  ]
  build() {
    Row() {
      Column() {
        ForEach(this.WIDTH_AND_HEIGHT, ({ w, h }) => {
          Button()
            .width(w)
            .height(h)
        }, item => item.toString())
      }
      .width('100%')
    }
    .height('100%')
  }
}