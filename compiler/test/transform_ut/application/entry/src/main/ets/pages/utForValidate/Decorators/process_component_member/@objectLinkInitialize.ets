@Observed
class observe {

}

@Entry
@Component
struct ObjectLinkInitializeParent {
  @State state: observe = new observe()
  build() {
    Column() {
      ObjectLinkInitializeChild({objectLink: this.state})
    }
  }
}

@Component
struct ObjectLinkInitializeChild {
  @ObjectLink objectLink: observe = new observe()
  build() {
    Column() {
      Text('text')
    }
  }
}