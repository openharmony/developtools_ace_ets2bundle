let storage = LocalStorage.GetShared();
let route = 'pages/Index';
let temp = {routeName: route, storage: storage, useSharedStorage: true}
let c= {
    d: temp
}
class ClassA {
}

@Entry(c.d)
@Component
struct LocalStorageComponent {
    @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
    @LocalStorageProp("storageObjectProp") objectName: ClassA = new ClassA("x");
    build() {
        Column() {       
        }
    }
}