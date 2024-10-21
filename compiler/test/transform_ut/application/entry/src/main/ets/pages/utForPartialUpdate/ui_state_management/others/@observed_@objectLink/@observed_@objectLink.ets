let NextID : number = 0;

@Observed class ClassA {
  public id : number;
  public c: number;
  constructor(c: number) {
    this.id = NextID++;
    this.c = c;
  }
}

@Observed class ClassB {
  public a: ClassA;
  constructor(a: ClassA) {
    this.a = a;
  }
}

@Component
struct ViewA {
  @ObjectLink varA : ClassA;
  build() {
    Row() {
      Text('ViewA-' + this.varA.id)
    }
  }
}

@Entry
@Component
struct ViewB {
  @State varB : ClassB = new ClassB(new ClassA(0));
  build() {
    Column() {
      Row() {
        ViewA({ varA: this.varB.a })
        Text('ViewB')
      }
    }
  }
}