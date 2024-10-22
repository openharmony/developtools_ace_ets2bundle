let storage = LocalStorage.getShared();

class EntryDecoParamClassA {
  public id: number = 1;
  public type: number = 2;
  public a: string = "aaa";
  constructor(a: string){
    this.a = a;
  }
}

@Entry
@Component
struct LocalStorageComponent {
  @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
  @LocalStorageProp("storageObjectProp") objectName: EntryDecoParamClassA = new EntryDecoParamClassA("x");
  build() {
    Column() {
      Text(this.objectName.a)
        .onClick(()=>{
          this.simpleVarName +=1;
          this.objectName.a = this.objectName.a === 'x' ? 'yex' : 'no';
        })
    }
    .height(500)
  }
}