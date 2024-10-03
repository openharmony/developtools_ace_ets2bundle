@Entry
@Component
struct Index {
  @State message: string = 'Hello'
  @State num: 0 | 1 | 2 = 0

  build() {
    Row() {
      Column() {
        Text(this.message)
        if (this.num === 0) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 1) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 2) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 3) {
            Refresh({refreshing: $$this.message})
        } else {
            Refresh({refreshing: $$this.message})
        }
      }
    }
  }
}