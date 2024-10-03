interface optionsType {
    message: string;
}
let options: optionsType = {message: 'Hi'}
@Entry
@Component
struct Index {
  @State message1: string = 'hello'
  message2: string = 'Hi'
  build() {
    Row() {
      Child({options, message1:this.message1, message2: this.message2})
      Child2(options)
    }
  }
}

@Component
struct Child {
  private options: optionsType;
  @Link message1: string;
  @Prop message2: string;
  build() {
    Column() {
        Text(this.message1)
    }
  }
}

@Component
struct Child2 {
  private message: string;
  build() {
    Column() {
        Text(this.message)
    }
  }
}