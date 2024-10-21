let storage = LocalStorage.GetShared();
let route = 'pages/Index';
let temp = {routeName: route, storage: storage, useSharedStorage: true}

class ClassA {
}

@Entry(temp)
@Component
struct LocalStorageComponent {
    @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
    @LocalStorageProp("storageObjectProp") objectName: ClassA = new ClassA("x");
    build() {
        Column() {       
        }
    }
}