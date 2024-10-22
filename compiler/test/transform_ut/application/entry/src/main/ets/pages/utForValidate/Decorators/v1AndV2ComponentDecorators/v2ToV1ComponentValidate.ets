enum MemberType {
  first = 1
}

@Entry
@Component
struct V1ToV2Component {
  build() {}
}

@Component
struct TestV1Parent {
  @State state_string_value: string = "hello"
  @Prop prop_number_value: number = 1
  @Link link_boolean_value: boolean
  @Provide provide_enum_value: MemberType = MemberType.first
  @Consume consume_null_value: null
  @StorageLink("a") storage_link_undefined_value: undefined = undefined
  @StorageProp("b") storage_prop_string_value: string = "hello"
  @LocalStorageLink("c") func_value1: Function = () => {}
  @LocalStorageProp("d") func_value2: () => void  = () => {}

  build() {
    Column() {
      TestV2Child({
        state_string_value: this.state_string_value,
        prop_number_value: this.prop_number_value,
        link_boolean_value: this.link_boolean_value,
        provide_enum_value: this.provide_enum_value,
        consume_null_value: this.consume_null_value,
        storage_link_undefined_value: this.storage_link_undefined_value,
        storage_prop_string_value: this.storage_prop_string_value,
        func_value1: this.func_value1,
        func_value2: this.func_value2
      })
    }
  }
}
@ComponentV2
struct TestV2Child {
  @Param state_string_value: string = "hello"
  @Param prop_number_value: number = 1
  @Param link_boolean_value: boolean = true
  @Param provide_enum_value: MemberType = MemberType.first
  @Param consume_null_value: null = null
  @Param storage_link_undefined_value: undefined = undefined
  @Param storage_prop_string_value: string = "hello"
  @Event func_value1: Function = () => {}
  @Event func_value2: () => void  = () => {}

  build() {

  }
}