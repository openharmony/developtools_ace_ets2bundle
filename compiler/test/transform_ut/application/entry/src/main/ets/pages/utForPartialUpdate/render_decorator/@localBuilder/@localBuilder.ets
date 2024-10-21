class Tmp {
    paramA1: string = ''
  }
  
  @Entry
  @Component
  struct HomeComponent {
    @State label: string = 'Hello';
    @LocalBuilder xx($$: Tmp, aa: string = '1') {
      Chind({message: $$.paramA1})
    }
    build() {
      Column() {
        this.xx({paramA1: this.label});
      }
      .height(500)
    }
  }
  
  @Component
  struct Chind {
    @Link message: string;
    build() {
  
    }
  }