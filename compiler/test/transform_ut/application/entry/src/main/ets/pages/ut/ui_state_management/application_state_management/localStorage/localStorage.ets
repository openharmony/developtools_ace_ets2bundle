let storage = LocalStorage.GetShared();

class ClassA {
    public id: number = 1;
    public type: number = 2;
    public a: string = "aaa";
    constructor(a: string){
        this.a = a;
    }
}

@Entry(storage)
@Component
struct LocalStorageComponent {
    @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
    @LocalStorageProp("storageObjectProp") objectName: ClassA = new ClassA("x");
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