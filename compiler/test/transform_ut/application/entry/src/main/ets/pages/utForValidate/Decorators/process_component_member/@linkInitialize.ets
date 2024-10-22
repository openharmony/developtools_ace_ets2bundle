@Entry
@Component
struct LinkInitializeParent {
  @State state: string = 'text'
  build() {
    Column() {
      LinkInitializeChild({link: this.state})
    }
  }
}

@Component
struct LinkInitializeChild {
  @Link link: string = 'text'
  build() {
    Column() {
      Text('text')
    }
  }
}