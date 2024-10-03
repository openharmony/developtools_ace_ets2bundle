class Model {
    value: string
    constructor(value: string) {
      this.value = value
    }
  }
  @Component
  struct MyComponent {
    @State title: Model = {value: 'Hello World'}
    @State count: number = 0
    private toggle: string = 'Hello World'
    private increaseBy: number = 1
  
    build() {
      Column() {
        Text('title.value: ' + this.title.value)
        Button() {
          Text('Click to change title')
        }.onClick(() => {
          this.title.value = (this.toggle == this.title.value) ? 'Hello World' : 'Hello UI'
        })
  
        Button() {
          Text('Click to increase count=' + this.count)
        }.onClick(() => {
          this.count += this.increaseBy
        })
      }
    }
  }
  @Entry
  @Component
  struct EntryComponent {
    build() {
      Column() {
        MyComponent({count: 1, increaseBy: 2})
        MyComponent({title: {value: 'Hello, World 2'}, count: 7})
      }
    }
  }