@Component
struct LinkComponent {
  @Link counter: string
  build() {
    Text(this.counter)
  }
}

@Entry
@Component
struct ParentComponent {
  @State value: string = 'first init content';
  build() {
    Column() {
      LinkComponent({counter: this.$value})
    }
  }
}