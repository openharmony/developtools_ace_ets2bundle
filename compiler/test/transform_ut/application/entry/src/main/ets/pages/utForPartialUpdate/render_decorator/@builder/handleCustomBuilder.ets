@Builder
function global() {
  Text('Global Builder')
}

@Entry
@Component
struct Index {
  judge: boolean = true
  @Builder inner(param: string) {
    Text('Inner Builder Text')
      .bindPopup(false, {
        onStateChange: (e) => {},
        builder: global()
      })
    Text('Inner Builder Text2')
      .bindPopup(false, {
        onStateChange: (e) => {},
        builder: this.judge ? global : undefined
      })
  }

  build() {
    Column() {
      Row()
        .bindMenu(this.inner("111"))
      Row()
        .bindMenu(this.judge ? this.inner("111") : global)
      Row()
        .onDragStart((event: DragEvent, extraParams: string) => {
          console.log('Text onDragStarts, ' + extraParams)
          return this.judge ? this.inner : global()
        })
      Row()
        .onDragStart((event: DragEvent, extraParams: string) => {
          console.log('Text onDragStarts, ' + extraParams)
          return {
            builder: this.judge ? this.inner() : undefined
          }
        })
      Text('Text')
        .bindPopup(false, {
          onStateChange: (e) => {},
          builder: undefined
        })
    }
  }
}