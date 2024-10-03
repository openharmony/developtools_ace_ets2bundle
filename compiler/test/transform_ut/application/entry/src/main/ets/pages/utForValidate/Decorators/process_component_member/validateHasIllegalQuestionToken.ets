// @ts-nocheck
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
struct Index {
  @State message: ClassA = new ClassA(0)
  build() {
    Row() {
      Child({message: this.message})
    }
  }
}

@Component
struct Child {
  @ObjectLink message?: string
  build() {
    Row() {}
  }
}