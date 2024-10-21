import {componentParent, componentParentObj} from '../../../../test/import@ComponentConst'
@Entry
@Component({freezeWhenInactive: true})
struct Index {
  build() {
    Row(){
      ComA()
      ComB()
    }
  }
}

@Component({freezeWhenInactive: componentParent})
struct ComA {
  build() {

  }
}

@Component({freezeWhenInactive: componentParentObj.componentParent})
struct ComB {
  build() {

  }
}