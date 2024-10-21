let para: Record<string, number> = { 'PropA': 47 };
let storage: LocalStorage = new LocalStorage(para);
@Entry(storage)
@Component
struct localStorageParam {
  @LocalStorageLink('PropA') storageLink1: number = 1;

  build() {
    Column() {
      ComA({message: 'Hi'}, storage);
      ComB({}, storage);
      ComD(storage);
      ComE();
    }
  }
}

@Component
struct ComA {
  @Prop message: string;
  build() {

  }
}

@Component
struct ComB {
  build() {

  }
}

@Component
struct ComD {
  build() {

  }
}

@Component
struct ComE {
  build() {

  }
}