@Component
struct Title {
  @Prop currentMonth: number
  @Prop currentYear: number
  private weekNames: string[] = ['日', '一', '二', '三', '四', '五', '六']
  build() {
    Column() {
      Column() {
        Text(`${this.currentYear} 年 ${this.currentMonth+1} 月`)
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
      }.height(39)
      Grid() {
        ForEach(
          this.weekNames,
          item => {
            GridItem() {
              Text(item)
                .fontSize(10)
            }
          },
          item => item
        )
      }.rowsTemplate('1fr').columnsTemplate('1fr 1fr 1fr 1fr 1fr 1fr 1fr').height(34)
    }
  }
}

@Component
struct Day {
  @Prop day: number
  @Prop month: number
  @Prop lunarDay: string
  @Prop lunarMonth: number
  @Link private selectedDay?: number
  @Link private selectedLunarMonth?: number
  @Link private selectedLunarDay?: string
  build() {
    Column() {
      Text(`${this.day}`)
        .fontSize(17)
        .fontWeight(FontWeight.Bold)
        .color(this.selectedDay === this.day ? Color.Red : Color.Black)
      Text(`${this.lunarDay}`)
        .fontSize(10)
        .color(this.selectedDay === this.day ? Color.Red : Color.Black)
    }.height(72)
    .alignItems(HorizontalAlign.Center)
    .onClick(() => {
      this.selectedLunarDay = this.lunarDay
      this.selectedLunarMonth = this.lunarMonth
      this.selectedDay = this.day
    })
  }
}

@Component
struct MonthView {
  @Prop month: number
  private lunarMonthDays: string[] = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
  private lunarMonthNames: string[] = [
    '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
  @State selectedLunarDay: string = '初十'
  @State selectedLunarMonth: number = new Date().getMonth() + 1
  @State selectedDay: number = new Date().getDate()

  build() {
    Column() {
      Row() {
        Grid() {
          ForEach(
            Array.from({length: 35}, (a, i) => i + 1),
            item => {
              GridItem() {
                Day({day: item,
                  month: this.month,
                  lunarDay: this.lunarMonthDays[item % 30],
                  lunarMonth: this.month,
                  selectedLunarDay: this.$selectedLunarDay,
                  selectedLunarMonth: this.$selectedLunarMonth,
                  selectedDay: this.$selectedDay})
              }
            },
            item => item
          )
        }.rowsTemplate('1fr 1fr 1fr 1fr 1fr').columnsTemplate('1fr 1fr 1fr 1fr 1fr 1fr 1fr').height(288)
      }.alignItems(VerticalAlign.Center)

      Row() {
        Column() {
          Row() {
            Text(`农历 ${this.lunarMonthNames[this.selectedLunarMonth]}${this.selectedLunarDay}`)
              .fontSize(15)
              .margin(10)
          }
          Row() {
            Text('今日无日程')
              .fontSize(15)
          }.alignItems(VerticalAlign.Center)
        }
      }.alignItems(VerticalAlign.Center)
    }
  }
}

@Component
struct SwiperView {
  private monthList: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  @Link private month?: number
  @Link private year?: number
  build() {
    Swiper() {
      ForEach(
        this.monthList,
        item => {
          Column() {
            MonthView({month: item})
          }.margin({left: 20, right: 20, bottom: 20, top: 3})
        },
        item => item)
    }.indicator(false)
    .index(this.month)
    .onChange(e => {
      this.month = e.index
    })
    }
  }
}

@Entry
@Component
struct MyCalendar {
  @State monthIdx: number = new Date().getMonth()
  @State yearIdx: number = new Date().getFullYear()
  build() {
    Column() {
      Row() {
        Title({currentMonth:this.monthIdx, currentYear:this.yearIdx})
      }.height(72)
      .margin({left: 20, right: 20, top: 20})
      SwiperView({month: this.$monthIdx, year: this.$yearIdx})
    }
  }
}
