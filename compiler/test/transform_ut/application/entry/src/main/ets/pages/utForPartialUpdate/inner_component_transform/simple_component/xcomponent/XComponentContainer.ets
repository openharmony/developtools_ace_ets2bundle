@Entry
@Component
struct HomeComponent {

  build() {
    Column() {
      XComponent({id: '1', type: 'component'})
      XComponent({id: '2', type: 1})
      XComponent({id: '3', type: XComponentType.COMPONENT})
    }
  }
}