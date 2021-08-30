import fetch from '@system.fetch'
import router from '@system.router'

@Entry
@Component
struct HomeComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"

  build() {
    Column() {
      if (this.value1 === 'Hello') {
          Text(this.value1)
      } else if (this.value1 === '') {
          Button()
      }
    }
    .height(500)
  }
}