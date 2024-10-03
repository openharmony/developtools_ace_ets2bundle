@Entry
@Component
struct PinchGestureExample {
  @State scale: number = 1

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('PinchGesture scale:' + this.scale)
    }
    .height(100).width(200).padding(20).border({ width: 1 }).margin(80)
    .scale({ x: this.scale, y: this.scale, z: this.scale })
    .gesture(
    PinchGesture()
      .onActionStart((event: GestureEvent) => {
        console.info('Pinch start')
      })
      .onActionUpdate((event: GestureEvent) => {
        this.scale = event.scale
      })
      .onActionEnd(() => {
        console.info('Pinch end')
      })
    )
  }
}