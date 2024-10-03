@Entry
@ComponentV2
struct v1DecoratorInComponentV2 {
  @State state_value: string = "hello"
  @Prop prop_value: string = "hello"
  @Link link_value: string
  @Provide provide_value: string = "hello"
  @Consume consumer_value: string
  @Watch("aa") watch_value: string = "hello"
  @State @Watch("aa") watch_value1: string = "hello"
  @StorageLink("b") storageLink_value: string = "hello"
  @StorageProp("b") storageProp_value: string = "hello"
  @LocalStorageLink("b") localStorageLink_value: string = "hello"
  @LocalStorageProp("b") localStorageProp_value: string = "hello"
  @ObjectLink objectLink_value: AA
  
  aa() {}

  build() {
    Column() {}
  }
}

@Observed
class AA {}