@Entry
@Component
struct ComA {
  uiModule = new TestUlModule4()
  build() {
    Row() {
      FeedComponent({
        createView: this.uiModule.createView()
      })
    }
  }

}

@Component
struct FeedComponent {
  @BuilderParam createView: () =>void
  build() {
  this.createView()
  }
}

class TestUlModule4 {
  builderVar
  createView(): () => void {
    return this.builderVar.builder
  }
}