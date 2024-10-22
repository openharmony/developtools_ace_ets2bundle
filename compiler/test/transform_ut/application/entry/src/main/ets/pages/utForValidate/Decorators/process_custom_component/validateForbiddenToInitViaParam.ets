@Entry
@Component
struct ValidateForbiddenToInitViaParamParent {
  @StorageProp('111') message: string = 'Hello';

  build() {
    Column() {
      ValidateForbiddenToInitViaParamChild({message: this.message});
    }
  }
}

@Component
struct ValidateForbiddenToInitViaParamChild {
  @StorageProp('111') message: string = 'Hello';
  build() {

  }
}