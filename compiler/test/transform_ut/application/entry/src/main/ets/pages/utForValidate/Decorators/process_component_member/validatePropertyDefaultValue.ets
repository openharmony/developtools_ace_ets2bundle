@Entry
@Component
struct ValidatePropertyDefaultValueIndex {
  @State message: string = 'Hi'
  build() {
    Row() {
      ValidatePropertyDefaultValueChild({message: this.message})
    }

  }
}

@Component
struct ValidatePropertyDefaultValueChild {
  @Link message:string = 'Hello'
  build() {
    Row() {}
  }
}