let a: string = "aaaaaaaaaa"
@Entry
@Component
struct RecycleReuseIdHomeComponent {
  @State state_value: string = "100%"
  @State value: number = 1
  build() {
    Column() {
      RecycleReuseIdChild({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
        .reuseId("reuse_key")
      RecycleReuseIdChild({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .reuseId(this.state_value)
      RecycleReuseIdChild({propvalue: this.value, linkvalue: this.value})
        .reuseId("reuse_key11111111111")
      RecycleReuseIdChild({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
      RecycleReuseIdChild({propvalue: this.value, linkvalue: this.value})
      .reuseId(a)
    }
  }
}

@Reusable
@Component
struct RecycleReuseIdChild {
  @Prop propvalue: number;
  @Link linkvalue: number;

  build() {
    Column() {
      
    }
  }
}