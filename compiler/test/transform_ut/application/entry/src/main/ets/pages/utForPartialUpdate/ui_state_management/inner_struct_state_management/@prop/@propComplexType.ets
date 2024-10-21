var nextID: number = 0

@Observed
class ClassA {
  public name: string
  public c: number
  public id: number

  constructor(c: number, name: string = 'OK') {
    this.name = name
    this.c = c
    this.id = nextID++
  }
}
@Component
struct CustomX{
  @Prop fruit:ClassA = new ClassA(1)
  build(){
    Row() {
      Text(JSON.stringify(this.fruit.c))
    }
  }
}
@Entry
@Component
struct Index {
  @State arrA:ClassA[] = [new ClassA(0), new ClassA(0)];
  build() {
    Row() {
      CustomX({fruit:this.arrA[0]})
      CustomX({})
    }
  }
}