@Entry
@Component
struct Parent {
  @StorageProp('111') message: string = 'Hello';

  build() {
    Column() {
      Child({message: this.message});
    }
  }
}

@Component
struct Child {
  @StorageProp('111') message: string = 'Hello';
  build() {

  }
}