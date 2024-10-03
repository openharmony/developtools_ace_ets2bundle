@Component
struct ctComponent {
  @Prop name: string
  @Prop canPlay: boolean
  @Prop count: number
  private costOfOneAttempt: number

  build() {
    Column() {
      if(this.canPlay) {
        if (this.count > 0) {
          Text(this.name + ' have ' + this.count + ' Nuggets left')
        } else {
          Text('Sorry, ' + this.name + '. Game over!')
        }

        Button() {
          Text('Try again')
        }.onClick(() => {
          this.count -= this.costOfOneAttempt
        })
      }else{
        Text(this.name + ', sorry. You do not play this game')
      }
    }
  }
}
@Entry
@Component
struct PageComponent {
  @State countDownStartValue: number = 10
  build() {
    Column() {
      Text('Grant ' + this.countDownStartValue + ' nuggets to play')
      Button() {
        Text('+1 - Nuggets in New Game')
      }.onClick(() => {
        this.countDownStartValue += 1
      })
      Button() {
        Text('-1  - Nuggets in New Game')
      }.onClick(() => {
        this.countDownStartValue -= 1
      })
      ctComponent({ name: 'xiaoming', canPlay: true, count: this.countDownStartValue, costOfOneAttempt: 2})
    }
  }
}