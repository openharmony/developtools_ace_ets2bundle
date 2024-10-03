@Entry
@Component
struct SwipeGestureExample {
  @State rotateAngle : number = 0
  @State speed : number = 1

  build() {
    Column() {
      Text("SwipGesture speed : " + this.speed)
      Text("SwipGesture angle : " + this.rotateAngle)
    }
    .border({width:2})
    .width(260).height(260)
    .rotate({x: 0, y: 0, z: 1, angle: this.rotateAngle})
    .gesture(
    SwipeGesture({fingers: 1, direction:SwipeDirection.Vertical})
      .onAction((event: GestureEvent) => {
        this.speed = event.speed
        this.rotateAngle = event.angle
      })
    )
  }
}