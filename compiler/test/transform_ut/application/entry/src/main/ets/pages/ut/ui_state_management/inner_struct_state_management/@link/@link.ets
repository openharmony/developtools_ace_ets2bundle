@Component
struct linkComp {
  @Link buttonPlaying: boolean
  @Link items: number[]
  @Link obj: {name: string, age: number}[]
  build() {
    Column() {
      Button() {
        Text(this.buttonPlaying ? 'play' : 'pause')
      }.onClick(() => {
        this.buttonPlaying = !this.buttonPlaying
      })
      Row(){
        Button(){
          Text('push 100')
        }.onClick(() => {
          this.items.push(100)
        })
        Button(){
          Text('remove item')
        }.onClick(() => {
          this.items.pop()
        })
      }
      Row(){
        Button(){
          Text('新增一人')
        }.onClick(() => {
          this.obj.push({name: 'xiaohua', age: 18})
        })
      }
    }
  }
}

@Entry
@Component
struct linkPage {
  @State isPlaying: boolean = false
  @State itemsArr: number[] = [1, 2, 3]
  @State peoples: {name: string, age: number}[] = [{name: 'xiaoming', age: 8}]
  build() {
    Column() {
      linkComp({buttonPlaying: $isPlaying, items: $itemsArr, obj: $peoples})
      Text('Player is ' + (this.isPlaying ? '' : 'not') + ' playing')
      ForEach(this.itemsArr, item => Text('' + item), item => item.toString())
      ForEach(this.peoples, item => {
        Text(item.name + ': ' + item.age)
      })
    }
  }
}