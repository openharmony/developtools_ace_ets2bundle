// @ts-nocheck
@Entry
@Component
struct Index {
  @State message: string = 'Hi'
  build() {
    Row() {
      Child({message: this.message})
    }
   
  }
}

@Component
struct Child {
 @Link message:string = 'Hello'
  build() {
    Row() {}
  }
}