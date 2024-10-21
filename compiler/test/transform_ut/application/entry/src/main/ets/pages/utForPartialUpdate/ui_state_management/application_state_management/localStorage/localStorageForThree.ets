let storage = LocalStorage.GetShared();
let route = 'pages/Index';

class ClassA {
}

@Entry({
  routeName: route,
  storage: storage,
  useSharedStorage: true
})
@Component
struct LocalStorageComponent {
    @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
    @LocalStorageProp("storageObjectProp") objectName: ClassA = new ClassA("x");
    build() {
        Column() {       
        }
    }
}