@Entry
@Component
struct Parent {
  @State state: string = 'text'
  build() {
    Column() {
      Child({link: this.state})
    }
  }
}

@Component
struct Child {
  @Link link: string = 'text'
  build() {
    Column() {
      Text('text')
    }
  }
}