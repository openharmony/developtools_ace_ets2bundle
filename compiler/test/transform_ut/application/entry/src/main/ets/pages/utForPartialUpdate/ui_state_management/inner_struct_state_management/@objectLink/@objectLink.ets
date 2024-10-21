var nextID: number = 0;
@Observed
class Model {
  text : string = '';
  color: string = '#00ff00';
  constructor(t: string, c: string) {
    this.text = t;
    this.color = c;
  }
}

@Component
struct CustomText {
  @ObjectLink model: Model;
  build() {
    Row() {
      Text(this.model.text)
    }
  }
}

@Entry
@Component
struct Parent {
  nextId: number = 1;
  @State models : Model[] = [ new Model('0', '#ffffff'), new Model('1', '#fff456') ];
  build() {
    Column() {
      ForEach (this.models, (item) => {
          CustomText({model: item})
        },
        (item) => item.text
      )
    }
  }
}