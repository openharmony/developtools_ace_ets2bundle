@AnimatableExtend(Polyline)
function animatablePoints(points: number) {
  .strokeOpacity(points)
  .backgroundColor(Color.Red)
}

@AnimatableExtend(Text)
function attributeExtend() {
  .fontSize(50)
}

@Entry
@Component
struct HomeComponent {
  points: number = 1

  build() {
    Column() {
      Polyline()
        .animatablePoints(this.points)
        .strokeWidth(3)
        .height(100)
        .width(100)
      Text("hello")
        .attributeExtend()
    }
  }
}