interface Model {
    readonly vis: Boolean;
    readonly data: Array<String>;
    readonly width: number;
  
  }
  
  @Builder function comp($$: Model) {
    Column() {
      Child()
        .visibility($$.vis ? Visibility.Visible : Visibility.Hidden)
        .width($$.vis ? 100: 200)
    }
  }
  
  @Component
  struct Child {
    build() {
      Text('TEST')
    }
  }
  
  @Entry
  @Component
  export struct visibility$$Demo {
    @State data: Array<String> = [];
    @State vis: Boolean = false;
    @State w: number = 100;
  
    aboutToAppear(): void {
      this.data = ['test', 'test2']
    }
  
    build() {
      Column() {
        comp({vis: this.vis, data: this.data, width: this.w})
      }
      .height('100%')
    }
  }