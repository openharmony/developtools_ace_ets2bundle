// class without @Component convert tool will not process.
class Month {
    year: number = 2010; // why add assignment here, TS grammar required, if not it will omit by TSC.
    month: number = 2;
    days: number[] = [1, 2];

    constructor(year:number, month:number, days:number[]){
        this.year = year;
        this.month = month;
        this.days = days;
    }
}

@Component
@Entry
struct CalendarDemo {

// simulate with 6 months
@State calendar : Month[] = [
    new Month(2020, 1, [...Array(31).keys()]),
    new Month(2020, 2, [...Array(28).keys()]),
    new Month(2020, 3, [...Array(31).keys()])
]

    build() {
        Column() {
            Button() {
                Text('next month')
            }.onClick(() => {
                this.calendar.shift()
                this.calendar.push(new Month(2020, 4, [...Array(30).keys()]))
            })

            ForEach(this.calendar,
                (item: Month) => {
                    Row() {
                        ForEach(item.days,
                            (day : number) => {
                                Text(`${day}`)
                            },
                            (day : number) => day.toString()) // inner ForEach
                    }
                },
                (item: Month) => (item.year * 12 + item.month).toString()) // outer ForEach
        }
    }
}