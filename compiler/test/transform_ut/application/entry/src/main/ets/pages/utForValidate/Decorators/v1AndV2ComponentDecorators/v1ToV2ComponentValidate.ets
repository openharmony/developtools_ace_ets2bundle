@Entry
@Component
struct V1ToV2ComponentValidate {
  build() {}
}

class A {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

class B {}

@Component
struct TestV1Parent1 {
  @State state_value: A | string = new A("hello")
  build() {
    Column() {
      TestV2Child1({
        param_value: this.state_value
      })
    }
  }
}

@ComponentV2
struct TestV2Child1 {
  @Param param_value: A | string = "hello"
  build() {

  }
}

type newType = A | B

@Component
struct TestV1Parent2 {
  @State state_value: A | B = new A("hello")
  @State state_value_alias_type: newType = new A("hello")
  build() {
    Column() {
      TestV2Child2({
        param_value: this.state_value,
        param_value_alias_type: this.state_value_alias_type
      })
    }
  }
}

@ComponentV2
struct TestV2Child2 {
  @Param param_value: A | B = new B()
  @Param param_value_alias_type: newType = new B()
  build() {

  }
}

enum MemberType {
  first = 1
}

@Observed
class TestObserved {

}

@Component
struct TestV1Parent {
  regular_value: A = new A("hello")
  @State state_value: A = new A("hello")
  @Prop prop_value: A = new A("hello")
  @Link link_value: A
  @Provide provide_value: A = new A("hello")
  @Consume consume_value: A
  @ObjectLink objectLink_value: TestObserved
  @StorageLink("a") storage_link_value: A = new A("hello")
  @StorageProp("b") storage_prop_value: A = new A("hello")
  @LocalStorageLink("c") local_storage_link_value: A = new A("hello")
  @LocalStorageProp("c") local_storage_prop_value: A = new A("hello")
  
  build() {
    Column() {
      TestV2Child({
        regular_value: this.regular_value,
        state_value: this.state_value,
        prop_value: this.prop_value,
        link_value: this.link_value,
        provide_value: this.provide_value,
        consume_value: this.consume_value,
        objectLink_value: this.objectLink_value,
        storage_link_value: this.storage_link_value,
        storage_prop_value: this.storage_prop_value,
        local_storage_link_value: this.local_storage_link_value,
        local_storage_prop_value: this.local_storage_prop_value
      })
    }
  }
}
@ComponentV2
struct TestV2Child {
  @Param regular_value: A = new A("hello")
  @Param state_value: A = new A("hello")
  @Param prop_value: A = new A("hello")
  @Param link_value: A = new A("hello")
  @Param provide_value: A = new A("hello")
  @Param consume_value: A = new A("hello")
  @Param objectLink_value: TestObserved = new TestObserved()
  @Param storage_link_value: A = new A("hello")
  @Event storage_prop_value: A = new A("hello")
  @Param local_storage_link_value: A = new A("hello")
  @Event local_storage_prop_value: A = new A("hello")

  build() {
    
  }
}
