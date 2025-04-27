import { Component, Entry } from "@ohos.arkui.component"
import { State, Prop, StorageLink, StorageProp, Link, Watch, ObjectLink, Observed, Track, Provide, Consume } from "@ohos.arkui.stateManagement"

@Observed
class A {
  propA: string = 'hello'
  @Track trackA: string = 'world'
}

@Entry
@Component
struct MyStateSample {
  @State @Watch('stateOnChange') statevar: string = 'Hello World';
  @Prop @Watch('propOnChange') propvar: string = 'Hello World';
  // @Link @Watch('linkOnChange') linkvar: string;
  @StorageLink('prop1') @Watch('storageLinkOnChange') storagelinkvar: string = 'Hello World';
  @StorageProp('prop2') @Watch('storagePropOnChange') storagepropvar: string = 'Hello World';
  // @ObjectLink @Watch('objectLinkOnChange') objectlinkvar: A;
  @Provide @Watch('ProvideOnChange') providevar: string = 'Hello World';
  
  stateOnChange(propName: string) {}
  propOnChange(propName: string) {}
  // linkOnChange(propName: string) {}
  storageLinkOnChange(propName: string) {}
  storagePropOnChange(propName: string) {}
  // objectLinkOnChange(propName: string) {}
  ProvideOnChange(propName: string) {}

  build() {
    Child()
  }
}

@Component
struct Child {
  // @Consume @Watch('ConsumeOnChange') providevar: string;

  // ConsumeOnChange(propName: string) {}

  build() {}
}