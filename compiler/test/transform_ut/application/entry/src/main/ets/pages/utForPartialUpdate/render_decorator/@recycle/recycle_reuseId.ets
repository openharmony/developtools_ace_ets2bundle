let a: string = "aaaaaaaaaa"
@Entry
@Component
struct HomeComponent {
  @State state_value: string = "100%"
  @State value: number = 1
  build() {
    Column() {
      child({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
        .reuseId("reuse_key")
      child({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .reuseId(this.state_value)
      child({propvalue: this.value, linkvalue: this.value})
        .reuseId("reuse_key11111111111")
      child({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
      child({propvalue: this.value, linkvalue: this.value})
      .reuseId(a)
    }
  }
}

@Reusable
@Component
struct child {
  @Prop propvalue: number;
  @Link linkvalue: number;

  build() {
    Column() {
      
    }
  }
}