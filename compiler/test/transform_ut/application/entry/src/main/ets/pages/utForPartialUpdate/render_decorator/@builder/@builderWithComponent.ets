@Builder
function myBuilder() {
  child();
}

@Entry
@Component
struct Index {
  @Builder Builder1() {
    child()
  }
  build() {
    Row() {
      myBuilder();
      this.Builder1();
      child();
    }
  }
}

@Component
struct child{
  build() {
    Text('Hello')
  }
}