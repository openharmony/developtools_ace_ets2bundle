@Entry
@Component
struct PinchGestureExample {
  @State scale2: number = 1

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('PinchGesture scale:' + this.scale2)
    }
    .height(100).width(200).padding(20).border({ width: 1 }).margin(80)
    .scale({ x: this.scale2, y: this.scale2, z: this.scale2 })
    .gesture(
    PinchGesture()
      .onActionStart((event: GestureEvent) => {
        console.info('Pinch start')
      })
      .onActionUpdate((event: GestureEvent) => {
        this.scale2 = event.scale
      })
      .onActionEnd(() => {
        console.info('Pinch end')
      })
    )
  }
}