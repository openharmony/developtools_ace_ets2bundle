let NextID : number = 0;

@Observed class ObservedObjectLinkClassA {
  public id : number;
  public c: number;
  constructor(c: number) {
    this.id = NextID++;
    this.c = c;
  }
}

@Observed class ObservedObjectLinkClassB {
  public a: ObservedObjectLinkClassA;
  constructor(a: ObservedObjectLinkClassA) {
    this.a = a;
  }
}

@Component
struct ViewA {
  @ObjectLink varA : ObservedObjectLinkClassA;
  build() {
    Row() {
      Text('ViewA-' + this.varA.id)
    }
  }
}

@Entry
@Component
struct ViewB {
  @State varB : ObservedObjectLinkClassB = new ObservedObjectLinkClassB(new ObservedObjectLinkClassA(0));
  build() {
    Column() {
      Row() {
        ViewA({ varA: this.varB.a })
        Text('ViewB')
      }
    }
  }
}