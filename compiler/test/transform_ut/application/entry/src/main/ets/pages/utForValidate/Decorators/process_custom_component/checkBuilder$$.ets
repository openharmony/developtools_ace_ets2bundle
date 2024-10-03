@Entry
@Component
struct Parent {
  @State label: string = 'Hello';

  @Builder ABuilder($$: { paramA1: string }) {
    Child({ message: $$.paramA1 })
  }

  build() {
    Column() {
      this.ABuilder({ paramA1: this.label })

    }
  }
}

@Component
struct Child {
  @Link message: string

  build() {
    Column() {
    }
  }
}