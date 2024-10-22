let NextIDa: number = 1;

@Observed
class ClassB {
  public id: number;
  public c: number;

  constructor(c: number) {
    this.id = NextIDa++;
    this.c = c;
  }
}

@Entry
@Component
struct ValidateNonObservedClassTypeIndex {
  @State message: ClassB = new ClassB(0)
  build() {
    Row() {
      ValidateNonObservedClassTypeChild({message: this.message})
    }
  }
}

@Component
struct ValidateNonObservedClassTypeChild {
  @ObjectLink message: ClassB | string
  build() {
    Row() {}
  }
}