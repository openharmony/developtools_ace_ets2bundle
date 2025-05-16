import {Component, Flex, XComponent, FlexDirection, XComponentType, Entry, XComponentController, ItemAlign, FlexAlign, XComponentParameter} from '@ohos.arkui.component'

@Entry
@Component
struct Index {
  myXComponentController: XComponentController = new XComponentController();
  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Start }) {
      XComponent({
        id: 'xComponentId',
        type: XComponentType.TEXTURE,
        libraryname: 'nativerender',
        controller: this.myXComponentController
      } as XComponentParameter)
    }
    .width('100%')
    .height('100%')
  }
}