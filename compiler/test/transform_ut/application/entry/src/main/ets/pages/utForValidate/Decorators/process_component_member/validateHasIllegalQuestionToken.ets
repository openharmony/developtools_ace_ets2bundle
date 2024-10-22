let NextID: number = 1;

@Observed
class ClassA {
  public id: number;
  public c: number;

  constructor(c: number) {
    this.id = NextID++;
    this.c = c;
  }
}

@Entry
@Component
struct ValidateHasIllegalQuestionTokenIndex {
  @State message: ClassA = new ClassA(0)
  build() {
    Row() {
      ValidateHasIllegalQuestionTokenChild({message: this.message})
    }
  }
}

@Component
struct ValidateHasIllegalQuestionTokenChild {
  @ObjectLink message?: ClassA
  build() {
    Row() {}
  }
}