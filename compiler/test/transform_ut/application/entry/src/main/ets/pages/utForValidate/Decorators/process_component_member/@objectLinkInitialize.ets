@Observed
class observe {

}

@Entry
@Component
struct Parent {
  @State state: observe = new observe()
  build() {
    Column() {
      Child({objectLink: this.state})
    }
  }
}

@Component
struct Child {
  @ObjectLink objectLink: observe = new observe()
  build() {
    Column() {
      Text('text')
    }
  }
}