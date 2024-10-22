@Entry
@Component
struct NoSrcPaworks {

  build(){
    Column(){
      Image($rawfile('test.png'))
    }
  }
}