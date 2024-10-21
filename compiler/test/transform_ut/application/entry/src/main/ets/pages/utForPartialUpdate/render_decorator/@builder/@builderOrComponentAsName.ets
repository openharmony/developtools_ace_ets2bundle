@Builder function ComA() {

}

@Entry
@Component
struct Index {
  @Builder AAA() {
    AAA({AAA: ComA})
  }
  @Builder CCC() {

  }
  build() {
    Row() {
      CCC({CCC: this.CCC});
      this.AAA();
      BBB();
    }
  }
}

@Component
struct AAA {
  @BuilderParam AAA: () => void
  build() {
    Row() {
      this.AAA();
    }
  }
}

@Component
struct BBB {
  @Builder BBB() {

  }
  build() {
    Row() {
      this.BBB();
    }
  }
}

@Component
struct CCC {
  @Builder DDD() {

  }
  @BuilderParam CCC: () => void = this.DDD;
  build() {
    Row() {
      this.CCC();
    }
  }
}