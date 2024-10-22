class param {
  paramA1: string = ""
}
@Entry
@Component
struct CheckBuilderParent {
  @State label: string = 'Hello';

  @Builder ABuilder($$: param) {
    CheckBuilderChild({ message: $$.paramA1 })
  }

  build() {
    Column() {
      this.ABuilder({ paramA1: this.label })

    }
  }
}

@Component
struct CheckBuilderChild {
  @Link message: string

  build() {
    Column() {
    }
  }
}