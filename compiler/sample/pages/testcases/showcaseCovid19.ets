/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * COVID Showcase App
 *
 * Made for the purpose of comparing ACE-Diff with ACE-JSF.
 * Read the README.md file in the same directory for build instructions
 *
 * ACE @ Web Helsinki
 *

 */

const enum FlexAlign {
  AUTO,

  // align to the start of the axis, can be both used in MainAxisAlign and CrossAxisAlign.
  FLEX_START,

  // align to the center of the axis, can be both used in MainAxisAlign and CrossAxisAlign.
  CENTER,

  // align to the end of the axis, can be both used in MainAxisAlign and CrossAxisAlign.
  FLEX_END,

  // stretch the cross size, only used in CrossAxisAlign.
  STRETCH,

  // adjust the cross position according to the textBaseline, only used in CrossAxisAlign.
  BASELINE,

  // align the children on both ends, only used in MainAxisAlign.
  SPACE_BETWEEN,

  // align the child with equivalent space, only used in MainAxisAlign.
  SPACE_AROUND
}

const enum TextOverflow {
  CLIP,
  ELLIPSIS,
  NONE,
}

class MonthData {
    month: number = 0;
    new_cases: number = 0;
    incidence: number = 0;
    new_dead: number = 0;
    incidence_dead: number = 0;

    constructor(month: number, new_cases: number, incidence: number, new_dead: number, incidence_dead: number) {
      this.month = month;
      this.new_cases = new_cases;
      this.incidence = incidence;
      this.new_dead = new_dead;
      this.incidence_dead = incidence_dead;
    }
}

class MonthVM {
    data: MonthData = undefined;
    dirLabel: string = '';
    dirColor: string = '';
    constructor(data: MonthData, dirLabel: string, dirColor: string) {
      this.data = data;
      this.dirLabel = dirLabel;
      this.dirColor = dirColor;
    }
}

class CountryTrendVM {
    id: number = 0;
    height: number = 0;
    color: string = '';
    isVisible: boolean = false;
    constructor(id: number, height: number, color: string, isVisible: boolean) {
      this.id = id;
      this.height = height;
      this.color = color;
      this.isVisible = isVisible;
    }
}


// non-mutaitng Model holding basic data about a country
// no need to observe instances
class CountryData {
  name: string = '';
  continent: string = '';
  alpha2: string = '';
  population: number = 0;
  months: Array<MonthData> = undefined;
  maxCases: number = 0;

  constructor(name: string,
    continent: string,
    alpha2: string,
    population: number,
    maxCases: number,
    months: Array<MonthData>) {
    this.name = name;
    this.continent = continent;
    this.alpha2 = alpha2;
    this.population = population;
    this.maxCases = maxCases;
    this.months = months;
  }

  compareName(c2: CountryData): number {
    return (this.name == c2.name) ? 0 : (this.name < c2.name) ? -1 : 1;
    // FXXME V8 ICU issue workaround, do not use: return this.name.localeCompare(c2.name);
  }
}

// mutating part of Country model
// needs to be wrapped by an Observable
class CountryVM {
  show: boolean = false;
  data: CountryData = undefined;

  constructor(show: boolean, data: CountryData) {
    this.show = show;
    this.data = data;
  }
}

// singleton, mutating object about how to vide countries
class CountriesPresentation {
  // first country to show in View
  firstCountry_: number = 0;

  // sorting by country name: +1: A..Z; -1: Z..A
  countriesSortDirection: number = 0;

  // total number of countries in VM, i.e. after filtering
  countriesN: number = 0;

  static readonly TOTAL_COUNTRIES = 183;// change when data set updated
  static readonly SHOW_COUNTRIES = 25;
  static readonly SHIFT_BY = 18;

  static readonly N_REGULAR_FONT_SIZE = 18;
  static readonly REGULAR_FONT_SIZE = CountriesPresentation.N_REGULAR_FONT_SIZE + 'px';

  constructor() {
    this.firstCountry_ = 0;
    this.countriesSortDirection = 1; // A..Z order
    this.countriesN = CountriesPresentation.TOTAL_COUNTRIES;
  }

  firstCountry(): number {
    return this.firstCountry_;
  }

  lastCountry(): number {
    return this.firstCountry_ + CountriesPresentation.SHOW_COUNTRIES;
  }
  // shift visible countries by
  shiftBy(byCount: number): void {
    this.firstCountry_ = Math.max(0,
      Math.min(this.firstCountry_ + byCount,
        this.countriesN - CountriesPresentation.SHOW_COUNTRIES)
    );
    console.log(`shiftCountries this.firstCountry=${this.firstCountry}`);
  }

  // after applying filters reset firstCountry and sorting direction,
  // and recalc number of to be shown countries
  resetByFilters(countriesData: any): void {
    this.countriesN = countriesData.filter((c) => c.show).length;
    this.firstCountry_ = 0;
    this.countriesSortDirection = 1
    console.log(`CountriesPresentation: setCountriesN(${this.countriesN}) `);
  }

  // reverse sorting direction of visible countries
  reverseDirection(): void {
    this.countriesSortDirection *= -1;
  }
}


// similar to CountryPresentation, singleton mutating object about how to present
// months' data of each country
class MonthsPresentation {
  firstMonth_: number = 8;

  constructor() {
    this.firstMonth_ = 8;
  }

  firstMonth(): number {
    return this.firstMonth_;
  }
  lastMonth(): number {
    return this.firstMonth_ + 2;
  }

  shiftBy(byCount) {
    this.firstMonth_ = Math.max(0, Math.min(this.firstMonth_ + byCount, 8));
    console.log(`shiftMonths this.firstMonth=${this.firstMonth_}`);
  }
}

var initCountriesData = function (): Array<CountryVM> {
  var result = new Array<CountryVM>();
  APP_DATA.forEach((country: any) => {
    let countryVM = new CountryVM(
      /*show */ true,
      new CountryData(country.name, country.continent, country.alpha2, country.population, country.maxCases, country.months)
    );
    result.push(countryVM);
  });
  console.log(`initCountriesData: result.length ${result.length}`);
  return result;
}


// -------------------- PageView ------------------------------------------------------------

@Entry
@Component
struct PageView {

  @State showFilters: boolean = false;
  @State countriesPresentation: CountriesPresentation =  new CountriesPresentation();
  @State monthsPresentation: MonthsPresentation =  new MonthsPresentation();

  countriesData: Array<CountryVM> = initCountriesData();

  /*
  constructor(id: string, parent: View, params: { countriesData: Array<CountryVM> }) {
    super(id, parent);
    console.log(`Create PageView`);

    // Properties 'firstCountry', 'countriesSortDirection', 'firstMonth' only
    // change in this View when also 'showFilters' changes.
    // same applies to countriesData
    // Hence, we do not need to make countriesPresentation and monthsPresentation
    // a @State variable
    this.setInitialObjectState({
      showFilters: false,
      countriesPresentation: new CountriesPresentation(),
      monthsPresentation: new MonthsPresentation(),
      countriesData: []
    });

    this.updateObjectState(params);

    this.createState("showFilters");
    this.createState("countriesPresentation");
    this.createState("monthsPresentation");

    this.____is_initialized___ = true;
  }

render(): ViewAbstract {
    console.log(`Render PageView`);
    // if ... {} else {}
    return this.showFilters ? new Column(
      new FiltersView("FiltersView", this, { countriesVM: this.countriesData }),
      new Row(
        new Button("Apply Filters").onClick(() => this.onApplyFiltersPressed())
        .height('50px')
        .width('300px'),
        new Button("Dump MemInfo").onClick(() => {
          dumpMemoryStats("FiltersView visile");
        }).width('300px')
      )
    ).setUniqueKey("Filters")
      : new Column(
        new Row(
          new Button("Show Filters")
            .onClick(() => this.showFilters = true).width('300px'),
          new Button("Dump MemInfo")
            .onClick(() => {
              dumpMemoryStats("StatsView visible");
            }).width('300px'),
        ),
        new StatsView("StatsView", this, {
          countriesData: this.countriesData,
          countriesPresentation: createLinkReference<CountriesPresentation>(this, "countriesPresentation"),
          monthsPresentation: createLinkReference<MonthsPresentation>(this, "monthsPresentation")
        }).setUniqueKey("StatsView")
      ).setUniqueKey("Stats")
  }
  */

  onApplyFiltersPressed(): void {
    this.showFilters = false;
    this.countriesPresentation.resetByFilters(this.countriesData);
    this.monthsPresentation.firstMonth_ = 8;
  }

  build() {
      Column() {
        if (this.showFilters) {
          Column() {
            FiltersView({ countriesVM: this.countriesData })
            Row() {
              Button("Apply Filters").onClick(() => { this.onApplyFiltersPressed() } ).height('50px').width('300px')
              Button("Dump MemInfo").onClick(() => { dumpMemoryStats("FiltersView visile") }).width('300px')
            }.wrapContent()
          }.wrapContent()
        } else {
          Column() {
              Row() {
                Button("Show Filters")
                  .width('300px')
                  .onClick(() => { this.showFilters = true } )
                Button("Dump MemInfo")
                  .width('300px')
                  .onClick(() => { dumpMemoryStats("StatsView visible") })
              }.wrapContent() 
              StatsView({countriesData: this.countriesData, countriesPresentation: $countriesPresentation, monthsPresentation: $monthsPresentation})
                  .setUniqueKey("StatsView")
         }.wrapContent()
        } 
      }.wrapContent().setUniqueKey("Page")
  }
}


// -------------------- StatsView ------------------------------------------------------------

@Component
struct  StatsView  {

  // just a regular class variable
  countriesData: Array<CountryVM>;

  @Link  countriesPresentation: CountriesPresentation;

  @Link  monthsPresentation: MonthsPresentation;

  /*
  constructor(id: string, parent: PageView,
    params: {
      countriesData: Array<CountryVM>,
      countriesPresentation: LinkReference<CountriesPresentation>,
      monthsPresentation: LinkReference<MonthsPresentation>
    }) {
    super(id, parent);
    console.log(`Create StatsView`);

    this.setInitialObjectState({ countriesData: [] })
    this.updateObjectState(params);

    this.createLink("countriesPresentation");
    this.createLink("monthsPresentation");

    this.____is_initialized___ = true;
  }

  render(): Flex {
    console.log(`Render StatsView`);
    return new Column(
      new StatsViewHeading("160", this,
        { monthsPresentation: createLinkReference(this, "monthsPresentation") })
        .setUniqueKey("Heading"), // all children of Column have unique keys

      new ForEach("161", this,
        this.countriesVM(),
        (country: CountryVM) => new CountryStatsView("140", this,
          { countryData: country, monthsPresentation: createLinkReference(this, "monthsPresentation") }),
        (country: CountryVM) => country.data.alpha2
      ).setUniqueKey("Countries"),
      new Row(
        new Button("Prev").onClick(() => this.countriesPresentation.shiftBy(-CountriesPresentation.SHIFT_BY)).setUniqueKey("Prev"),
        new Button("Next").onClick(() => this.countriesPresentation.shiftBy(CountriesPresentation.SHIFT_BY)).setUniqueKey("Next"),
        new Button(this.countriesPresentation.countriesSortDirection > 0 ? "Z..A" : "A..Z").onClick(() => this.countriesPresentation.reverseDirection()).setUniqueKey("Sort"),
        new Button("Earier").onClick(() => this.monthsPresentation.shiftBy(-1)).setUniqueKey("Earlier"),
        new Button("Later").onClick(() => this.monthsPresentation.shiftBy(1)).setUniqueKey("Later"),
      ).height('100px').setUniqueKey("Buttons_Row") // all children of Column have unique keys
    ).wrapContent()
  }

  */

 build()  {
    Column() {
      StatsViewHeading({ monthsPresentation: $monthsPresentation }).setUniqueKey("Heading")
      CountriesStatsView({ countriesPresentation: $countriesPresentation, monthsPresentation: $monthsPresentation, countriesData: this.countriesData}).setUniqueKey("CSV")
      Row() {
        Button("Prev").onClick(() => { this.countriesPresentation.shiftBy(-CountriesPresentation.SHIFT_BY) } ).setUniqueKey("Prev")
        Button("Next").onClick(() => { this.countriesPresentation.shiftBy(CountriesPresentation.SHIFT_BY) } ).setUniqueKey("Next")
        Button(this.countriesPresentation.countriesSortDirection > 0 ? "Z..A" : "A..Z").onClick(() => { this.countriesPresentation.reverseDirection() } ).setUniqueKey("Sort")
        Button("Earier").onClick(() => { this.monthsPresentation.shiftBy(-1) } ).setUniqueKey("Earlier")
        Button("Later").onClick(() => { this.monthsPresentation.shiftBy(1) } ).setUniqueKey("Later")
      }.height('100px').setUniqueKey("Buttons_Row")
    }.wrapContent()
  }
}



@Component
struct StatsViewHeading {

  static monthsLabel: string[] = ["February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  @Link  monthsPresentation: MonthsPresentation;

  /*
  constructor(id: string, parent: StatsView, params: { monthsPresentation: LinkReference<MonthsPresentation> }) {
    super(id, parent);
    console.log(`Create StatsViewHeading`);

    this.setInitialObjectState({})
    this.updateObjectState(params);

    this.createLink("monthsPresentation");

    this.____is_initialized___ = true;
  }

   render(): ViewAbstract {
    return new Row(
      new Text("Territory").fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('222px').setUniqueKey("Territory"), // all children of Row need unique Key
      new ForEach("171", this,
        StatsViewHeading.monthsLabel.slice(this.monthsPresentation.firstMonth(), this.monthsPresentation.lastMonth()),
        (month) => new Text(month).fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('182px'),
        (month) => month
      ),
      new Text("Trend").fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('110px').setUniqueKey("Trend"), // all children of Row need unique Key
    ).height('50px');
  }
  */

  build() {
    Row() {
      Text("Territory").fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('222px').setUniqueKey("Territory") // all children of Row need unique Key
      ForEach(
        StatsViewHeading.monthsLabel.slice(this.monthsPresentation.firstMonth(), this.monthsPresentation.lastMonth()),
        (month) => { Text(month).fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('182px') },
        (month) => month
      ) 
      Text("Trend").fontSize(CountriesPresentation.REGULAR_FONT_SIZE).fontWeight("bold").width('110px').setUniqueKey("Trend") // all children of Row need unique Key
    }.height('50px')
  }
}



@Component
struct CountriesStatsView {

  @Link countriesPresentation: CountriesPresentation;
  @Link monthsPresentation: MonthsPresentation;
  countriesData: Array<CountryVM>;

  filteredCountries(): Array<CountryVM> {
    var result = this.countriesData.filter((c) => c.show);
    console.log("update filteredCountries, length: " + result.length);
    return result;
  }

  countriesVM(): Array<CountryVM> {
     console.log("update countriesVM, ...");
    var result = this.filteredCountries()
      .slice(this.countriesPresentation.firstCountry(), this.countriesPresentation.lastCountry())
      .sort(function (c1: CountryVM, c2: CountryVM) {
        return this.countriesPresentation.countriesSortDirection * c1.data.compareName(c2.data)
        }.bind(this)
      );

    console.log("update countriesVM, length: " + result.length);
    return result;
  }

// do not put curley brackets around the item gen function below, compiler will not generate needed return 
  build()  {
    Column() { 
      ForEach(this.countriesVM(),
        (country) => CountryStatsView({ monthsPresentation: $monthsPresentation, countryData: country}),
        (country) => country.data.alpha2
      ).setUniqueKey("ForEach")
    }.wrapContent().setUniqueKey("ForEach_Col")
  }
}


@Component
struct CountryStatsView {

  @State countryData: CountryVM = new CountryVM(false, undefined);  // dummy init
  @Link monthsPresentation: MonthsPresentation;

  /*
  constructor(id: string, parent: StatsView,
    params: { countryData: CountryVM, monthsPresentation: LinkReference<MonthsPresentation> }) {
    super(id, parent);
    console.log(`Create CountryStatsView`);

    // we need to init the @State countryData variable with a dummy
    this.setInitialObjectState({ countryData: new CountryVM(false, undefined) })
    this.updateObjectState(params);

    // countryData is wrapped with an ObservableObject already
    // createState will pick up the Obs.Object and have the View subscribe to it.
    this.createState("countryData");
    this.createLink("monthsPresentation");

    this.____is_initialized___ = true;
    console.log(`Create CountryStatsView of ${this.countryData.data.name}`);
  }
*/

  build() {
    Row() {
      Image(`pictures/diff/flags/${this.countryData.data.alpha2}.png`).width('32px').height('32px').marginRight('5px').setUniqueKey("Country_Flag")
      Row() {
        Text(this.countryData.data.name).fontSize(CountriesPresentation.REGULAR_FONT_SIZE).textOverflow(TextOverflow.Ellipsis).maxLines(1)
      }.justifyContent(FlexAlign.start).width('190px').height('50px').setUniqueKey("Country_Name")
      CountryMonthsStatView({ countryData: $countryData, monthsPresentation: $monthsPresentation }).setUniqueKey("CountryMonthsStatView")
      CountryTrendView({ countryData: $countryData, monthsPresentation: $monthsPresentation }).setUniqueKey("CountryTrendView")
    }.alignItems(FlexAlign.start).justifyContent(FlexAlign.Center).wrapContent().height('50px')
  }
}

@Component
struct CountryMonthsStatView {

  @Link countryData: CountryVM;
  @Link monthsPresentation: MonthsPresentation;

  areCasesRising(monthIndex: number): boolean {
    const caseData: MonthData[] = this.countryData.data.months;
    return ((monthIndex == 0) && (caseData[monthIndex] != undefined) && (caseData[monthIndex].new_cases > 0) ||
      ((caseData[monthIndex - 1] != undefined) && (caseData[monthIndex] != undefined) && (caseData[monthIndex].new_cases > caseData[monthIndex - 1].new_cases)));
  }

  areCasesDeclining(monthIndex: number): boolean {
    const caseData: MonthData[] = this.countryData.data.months;
    return ((monthIndex > 0) && (caseData[monthIndex] != undefined) && (caseData[monthIndex - 1] != undefined) && (caseData[monthIndex].new_cases < caseData[monthIndex - 1].new_cases));
  }

  /*
  constructor(id: string, parent: CountryStatsView, params: { countryData: LinkReference<CountryVM>, monthsPresentation: LinkReference<MonthsPresentation> }) {
    super(id, parent);
    console.log(`Create CountryMonthsStatView`);

    this.setInitialObjectState({})
    this.updateObjectState(params);

    this.createLink("countryData");
    this.createLink("monthsPresentation");

    this.____is_initialized___ = true;
    console.log(`Create CountryMonthsStatView of ${this.countryData.data.name}`);
  }
*/

  calcVM(): Array<MonthVM> {
    console.log(`Render CountryMonthsStatView of ${this.countryData.data.name}`);
    var vm: MonthVM[] = [];
    for (var monthsIndex = this.monthsPresentation.firstMonth(); monthsIndex < this.monthsPresentation.lastMonth(); monthsIndex++) {
      vm.push(new MonthVM(
        this.countryData.data.months[monthsIndex],
        this.areCasesDeclining(monthsIndex) ? "▼" : this.areCasesRising(monthsIndex) ? "▲" : "►",
        this.areCasesDeclining(monthsIndex) ? "#228B22" : this.areCasesRising(monthsIndex) ? "#ff4500" : "#000000",
      ));
    }
    return vm;
  }

  build() {
    Row() {
      ForEach(this.calcVM(),
        (month) => {
            Row() {
              Row() {
                Text(month.data.new_cases.toString())
              }
                .justifyContent(FlexAlign.end).width('110px').height('50px')
              Text(month.dirLabel)
                .color(month.dirColor)
                .fontSize(CountriesPresentation.REGULAR_FONT_SIZE)
                .height('50px').width('18px') 
              Row() {
                Text(month.data.incidence.toString())
                  .fontSize(CountriesPresentation.REGULAR_FONT_SIZE)
                  .color(CountryTrendView.calcBarColor(month.data.incidence))
              } 
                .justifyContent(FlexAlign.end).width('70px').height('50px')
            } 
              .width((110 + 70) + 'px').height('50px')
        }, 
        (month) => month.data.month.toString()
      ) 
    } 
    .wrapContent().width((2 * (110 + 90))  + 'px').height('50px')
  }
}


@Component
struct CountryTrendView {

  @Link countryData: CountryVM;
  @Link monthsPresentation: MonthsPresentation;

  /*
  constructor(id: string, parent: CountryStatsView, params: { countryData: LinkReference<CountryVM>, monthsPresentation: LinkReference<MonthsPresentation> }) {
    super(id, parent);

    console.log(`Create CountryTrendView`);

    this.setInitialObjectState({})
    this.updateObjectState(params);

    this.createLink("countryData");
    this.createLink("monthsPresentation");

    this.____is_initialized___ = true;
    console.log(`Create CountryTrendView of ${this.countryData.data.name}`);
  }
*/

  calcBarHeight(monthCases: number): number {
    let result = (this.countryData.data.maxCases == 0) ? 1 : 1 + (39 * monthCases / this.countryData.data.maxCases);
    console.log(`bar height ${result} maxCases ${this.countryData.data.maxCases}`);
    return result;
  }

  static calcBarColor(incidence: number): string {
    return (incidence >= 500) ? "#a52729" : (incidence >= 250) ? "#7e2e1f" : (incidence >= 100) ? "#98503C" : (incidence >= 50) ? "#a5714E" : (incidence >= 35) ? "#b99c6b" : "#d5c4a1";
  }

  calcVM(): Array<CountryTrendVM> {
    console.log(`Render CountryTrendView of ${this.countryData.data.name} for ${this.countryData.data.months.length} months`);
    const vm: CountryTrendVM[] = [];
    for (var i = 0; i < this.countryData.data.months.length; i++) {
      const isVisible: boolean = (this.monthsPresentation.firstMonth() <= i) && (i < this.monthsPresentation.lastMonth());
      vm.push(new CountryTrendVM(
        this.countryData.data.months[i].month,
        this.calcBarHeight(this.countryData.data.months[i].new_cases),
        CountryTrendView.calcBarColor(this.countryData.data.months[i].incidence),
        isVisible
      ));
    }
    return vm;
  }

  build() {
    Row() {
      ForEach(this.calcVM(),
        (m) => {
                Column() {
          if (m.isVisible) {
                Column() {
                  Column() {
                    /* emtry */ }
                    .height(Math.max(0, m.height - 2)  + 'px')
                    .width('5px')
                    .backgroundColor(m.color)
                  Column() {
                    /* emtry */ }
                    .height('2px').width('5px').backgroundColor("#000000")
                } // Column
                .height(m.height).width('5px').marginRight('1px')
           } else {
              Column() {
                /* emtry */ }
                  .height(m.height  + 'px')
                  .width('5px')
                  .backgroundColor(m.color)
                  .marginRight('1px')
           } // else
           }.wrapContent().height(m.height  + 'px')
        }, // ForEach item gen func
        (m) => m.id // ForEach id gen func
      ) // ForEach
    } // Row
      .wrapContent().alignItems(FlexAlign.end).height('50px').width('60px').marginLeft('10px')
  }
}




// -------------------- FiltersView ------------------------------------------------------------

@Component
struct FiltersView {

  // @State hack against mising @Observed / observableObject for all ContryVM instances
  @State countryHasChanged: boolean = false;

  // regular parameter
  countriesVM: Array<CountryVM> = [];

  static CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"];

  /*  constructor(id: string, parent: PageView, params: { countriesVM: Array<CountryVM> }) {
      super(id, parent);
      console.log(`Create FiltersView`);

      this.setInitialObjectState({ countriesVM: [] })
      this.updateObjectState(params);
      this.createState("countryHasChanged")
      this.____is_initialized___ = true;
    }
  */

  getCovidDataByContinent(ct: string): Array < CountryVM > {
    let result = this.countriesVM.filter((c: CountryVM) => c.data.continent == ct);
    console.log(`getCovidDataByContinent(${ct}) returns length ${result.length}`);
    return result;
  }

  toggleContinent(conti: string): void {
    console.log(`toggleContinent ...${conti}`);
    let data: Array < CountryVM > = this.getCovidDataByContinent(conti);
    let newValue: boolean = (data.length > 0) ? !data[0].show : false;
    data.forEach((c: CountryVM) => c.show = newValue);

    // hack to make this vew render and take chnaged 'show' CountryVM instances into account
    // this need @Observed CountryVM / createdObservableObject to work efficiently.
    this.countryHasChanged = !this.countryHasChanged
  }

  build() {
    Column() {
      ForEach(
        FiltersView.CONTINENTS,
        (conti) => {
          Column() {
            Button(conti)
              .onClick(() => { this.toggleContinent(conti) } )
              .height('50px')
              .width('400px')
              .setUniqueKey("Button_" + conti)
            ContinentFiltersView({ countriesVM: this.getCovidDataByContinent(conti) }).setUniqueKey("ContinentFiltersView_" + conti) // all children of Row need unique Key
          }.wrapContent().setUniqueKey("ContinentFiltersView_row_" + conti)
        },
        (conti) => conti
      )
    }.wrapContent().width('740px');
  }
}


@Component
struct ContinentFiltersView {
  // regular variable
  countriesVM: Array<CountryVM> = [];

  /*
  constructor(id: string, parent: FiltersView, params: { countriesVM: Array<CountryVM> }) {
    super(id, parent);
    this.setInitialObjectState({ countriesVM: [] })
    this.updateObjectState(params);

    console.log(`Create ContinentFiltersView for ${this.countriesVM.length} countries`);
    this.____is_initialized___ = true;
  }
*/

  build() {
    Row() {
      ForEach(
        this.countriesVM,
        (country) => {
          CountryFiltersView({ countryVM: country })
        },
        (country) => country.data.alpha2
      ) // ForEach
    }.wrap(true).wrapContent()
  }
}


@Component
struct CountryFiltersView  {
  @State countryVM: CountryVM = new CountryVM(true, undefined);

  /*
  constructor(id: string, parent: ContinentFiltersView, params: { countryVM: CountryVM }) {
    super(id, parent);
    console.log(`Create CountryFiltersView  ...`);

    this.setInitialObjectState({ countriesVM: [] })
    this.updateObjectState(params);

    // individdual countryVM is wrapped inside a ObservableObject alredy.
    // createState will take it and register this View to the Obs.Object.
    this.createState("countryVM");
    this.____is_initialized___ = true;

    console.log(`Create CountryFiltersView for ${this.countryVM.data.name}`);
  }
*/

  build() {
    Row() {
      // country flag
      Image(`pictures/diff/flags/${this.countryVM.data.alpha2}.png`)
        .width('32px').height('32px')
        .marginTop('4px').marginBottom('4px').marginRight('10px')

      // country 2-letter code
      Text(this.countryVM.data.alpha2)
        .fontSize(CountriesPresentation.REGULAR_FONT_SIZE)
        .fontWeight(this.countryVM.show ? 'bold' : 'normal').width('50px').height('40px')
    }.wrapContent()
      .width('90px').height('40px')
      .backgroundColor(this.countryVM.show ? '#ffffff' : '#c0c0c0')
  }
}


const APP_DATA = [
        {
          "name": "Afghanistan", "continent": "Asia", "alpha2": "af", "population": 38928341, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 174, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1952, "incidence": 1, "new_dead": 60, "incidence_dead": 0 },
            { "month": 5, "new_cases": 13081, "incidence": 8, "new_dead": 194, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 16299, "incidence": 10, "new_dead": 494, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 5158, "incidence": 3, "new_dead": 532, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 1494, "incidence": 1, "new_dead": 119, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 1109, "incidence": 1, "new_dead": 57, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2157, "incidence": 1, "new_dead": 78, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 4849, "incidence": 3, "new_dead": 257, "incidence_dead": 0.2 },
          ],
          maxCases: 16299
        },
        {
          "name": "Albania", "continent": "Europe", "alpha2": "al", "population": 2877800, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 241, "incidence": 2, "new_dead": 14, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 530, "incidence": 5, "new_dead": 16, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 364, "incidence": 3, "new_dead": 2, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1398, "incidence": 12, "new_dead": 29, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 2741, "incidence": 24, "new_dead": 95, "incidence_dead": 0.8 },
            { "month": 8, "new_cases": 4237, "incidence": 37, "new_dead": 127, "incidence_dead": 1.1 },
            { "month": 9, "new_cases": 4136, "incidence": 36, "new_dead": 103, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 7226, "incidence": 63, "new_dead": 122, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 17307, "incidence": 150, "new_dead": 301, "incidence_dead": 2.6 },
          ],
          maxCases: 17307
        },
        {
          "name": "Algeria", "continent": "Africa", "alpha2": "dz", "population": 43851043, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 715, "incidence": 0, "new_dead": 43, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3290, "incidence": 2, "new_dead": 406, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 5388, "incidence": 3, "new_dead": 203, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 4513, "incidence": 3, "new_dead": 259, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 16487, "incidence": 9, "new_dead": 298, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 14100, "incidence": 8, "new_dead": 300, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 7036, "incidence": 4, "new_dead": 226, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 6412, "incidence": 4, "new_dead": 228, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 25257, "incidence": 14, "new_dead": 467, "incidence_dead": 0.3 },
          ],
          maxCases: 25257
        },
        {
          "name": "Andorra", "continent": "Europe", "alpha2": "ad", "population": 77265, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 375, "incidence": 121, "new_dead": 11, "incidence_dead": 3.6 },
            { "month": 4, "new_cases": 369, "incidence": 119, "new_dead": 30, "incidence_dead": 9.7 },
            { "month": 5, "new_cases": 19, "incidence": 6, "new_dead": 9, "incidence_dead": 2.9 },
            { "month": 6, "new_cases": 91, "incidence": 29, "new_dead": 1, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 70, "incidence": 23, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 251, "incidence": 81, "new_dead": 1, "incidence_dead": 0.3 },
            { "month": 9, "new_cases": 874, "incidence": 283, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2706, "incidence": 876, "new_dead": 22, "incidence_dead": 7.1 },
            { "month": 11, "new_cases": 1989, "incidence": 644, "new_dead": 1, "incidence_dead": 0.3 },
          ],
          maxCases: 2706
        },
        {
          "name": "Angola", "continent": "Africa", "alpha2": "ao", "population": 32866268, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 20, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 59, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 6, "new_cases": 198, "incidence": 0, "new_dead": 9, "incidence_dead": 0 },
            { "month": 7, "new_cases": 864, "incidence": 1, "new_dead": 39, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1506, "incidence": 1, "new_dead": 56, "incidence_dead": 0 },
            { "month": 9, "new_cases": 2318, "incidence": 2, "new_dead": 75, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 5833, "incidence": 4, "new_dead": 101, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 4334, "incidence": 3, "new_dead": 64, "incidence_dead": 0 },
          ],
          maxCases: 5833
        },
        {
          "name": "Antigua and Barbuda", "continent": "North America", "alpha2": "ag", "population": 97928, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 17, "incidence": 4, "new_dead": 2, "incidence_dead": 0.5 },
            { "month": 5, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 43, "incidence": 11, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 22, "incidence": 6, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 3, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 7, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 27, "incidence": 7, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 13, "incidence": 3, "new_dead": 1, "incidence_dead": 0.3 },
          ],
          maxCases: 43
        },
        {
          "name": "Argentina", "continent": "South America", "alpha2": "ar", "population": 45195777, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1053, "incidence": 1, "new_dead": 26, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3374, "incidence": 2, "new_dead": 191, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 12423, "incidence": 7, "new_dead": 321, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 47679, "incidence": 26, "new_dead": 768, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 126772, "incidence": 70, "new_dead": 2236, "incidence_dead": 1.2 },
            { "month": 8, "new_cases": 226433, "incidence": 125, "new_dead": 5117, "incidence_dead": 2.8 },
            { "month": 9, "new_cases": 333266, "incidence": 184, "new_dead": 8277, "incidence_dead": 4.6 },
            { "month": 10, "new_cases": 415923, "incidence": 230, "new_dead": 14065, "incidence_dead": 7.8 },
            { "month": 11, "new_cases": 257609, "incidence": 142, "new_dead": 7728, "incidence_dead": 4.3 },
          ],
          maxCases: 415923
        },
        {
          "name": "Armenia", "continent": "Asia", "alpha2": "am", "population": 2963234, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 531, "incidence": 4, "new_dead": 2, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1534, "incidence": 13, "new_dead": 29, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 7216, "incidence": 61, "new_dead": 99, "incidence_dead": 0.8 },
            { "month": 6, "new_cases": 16260, "incidence": 137, "new_dead": 312, "incidence_dead": 2.6 },
            { "month": 7, "new_cases": 13008, "incidence": 110, "new_dead": 295, "incidence_dead": 2.5 },
            { "month": 8, "new_cases": 5231, "incidence": 44, "new_dead": 141, "incidence_dead": 1.2 },
            { "month": 9, "new_cases": 6578, "incidence": 55, "new_dead": 80, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 39454, "incidence": 333, "new_dead": 382, "incidence_dead": 3.2 },
            { "month": 11, "new_cases": 45311, "incidence": 382, "new_dead": 823, "incidence_dead": 6.9 },
          ],
          maxCases: 45311
        },
        {
          "name": "Australia", "continent": "Oceania", "alpha2": "au", "population": 25499881, "months": [
            { "month": 2, "new_cases": 16, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4534, "incidence": 4, "new_dead": 17, "incidence_dead": 0 },
            { "month": 4, "new_cases": 2207, "incidence": 2, "new_dead": 75, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 436, "incidence": 0, "new_dead": 10, "incidence_dead": 0 },
            { "month": 6, "new_cases": 718, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 9360, "incidence": 9, "new_dead": 97, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 8539, "incidence": 8, "new_dead": 456, "incidence_dead": 0.4 },
            { "month": 9, "new_cases": 1277, "incidence": 1, "new_dead": 231, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 499, "incidence": 0, "new_dead": 19, "incidence_dead": 0 },
            { "month": 11, "new_cases": 317, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 9360
        },
        {
          "name": "Austria", "continent": "Europe", "alpha2": "at", "population": 9006400, "months": [
            { "month": 2, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 10171, "incidence": 28, "new_dead": 127, "incidence_dead": 0.4 },
            { "month": 4, "new_cases": 5272, "incidence": 15, "new_dead": 456, "incidence_dead": 1.3 },
            { "month": 5, "new_cases": 1279, "incidence": 4, "new_dead": 84, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 1035, "incidence": 3, "new_dead": 37, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 3364, "incidence": 9, "new_dead": 13, "incidence_dead": 0 },
            { "month": 8, "new_cases": 6308, "incidence": 18, "new_dead": 15, "incidence_dead": 0 },
            { "month": 9, "new_cases": 17375, "incidence": 48, "new_dead": 66, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 60112, "incidence": 167, "new_dead": 310, "incidence_dead": 0.9 },
            { "month": 11, "new_cases": 177531, "incidence": 493, "new_dead": 2075, "incidence_dead": 5.8 },
          ],
          maxCases: 177531
        },
        {
          "name": "Azerbaijan", "continent": "Asia", "alpha2": "az", "population": 10139175, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 295, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1506, "incidence": 4, "new_dead": 19, "incidence_dead": 0 },
            { "month": 5, "new_cases": 3690, "incidence": 9, "new_dead": 39, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 12030, "incidence": 30, "new_dead": 150, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 14354, "incidence": 35, "new_dead": 235, "incidence_dead": 0.6 },
            { "month": 8, "new_cases": 4557, "incidence": 11, "new_dead": 86, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 3794, "incidence": 9, "new_dead": 57, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 15040, "incidence": 37, "new_dead": 139, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 65907, "incidence": 163, "new_dead": 662, "incidence_dead": 1.6 },
          ],
          maxCases: 65907
        },
        {
          "name": "Bahamas", "continent": "North America", "alpha2": "bs", "population": 393248, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 13, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 67, "incidence": 4, "new_dead": 10, "incidence_dead": 0.6 },
            { "month": 5, "new_cases": 21, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 470, "incidence": 30, "new_dead": 3, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 1643, "incidence": 104, "new_dead": 36, "incidence_dead": 2.3 },
            { "month": 9, "new_cases": 1906, "incidence": 121, "new_dead": 46, "incidence_dead": 2.9 },
            { "month": 10, "new_cases": 2591, "incidence": 165, "new_dead": 48, "incidence_dead": 3.1 },
            { "month": 11, "new_cases": 827, "incidence": 53, "new_dead": 19, "incidence_dead": 1.2 },
          ],
          maxCases: 2591
        },
        {
          "name": "Bahrain", "continent": "Asia", "alpha2": "bh", "population": 1701583, "months": [
            { "month": 2, "new_cases": 40, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 526, "incidence": 8, "new_dead": 3, "incidence_dead": 0 },
            { "month": 4, "new_cases": 2473, "incidence": 36, "new_dead": 4, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 8358, "incidence": 123, "new_dead": 11, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 15360, "incidence": 226, "new_dead": 68, "incidence_dead": 1 },
            { "month": 7, "new_cases": 14224, "incidence": 209, "new_dead": 60, "incidence_dead": 0.9 },
            { "month": 8, "new_cases": 10990, "incidence": 161, "new_dead": 43, "incidence_dead": 0.6 },
            { "month": 9, "new_cases": 18892, "incidence": 278, "new_dead": 61, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 10781, "incidence": 158, "new_dead": 70, "incidence_dead": 1 },
            { "month": 11, "new_cases": 5311, "incidence": 78, "new_dead": 20, "incidence_dead": 0.3 },
          ],
          maxCases: 18892
        },
        {
          "name": "Bangladesh", "continent": "Asia", "alpha2": "bd", "population": 164689383, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 48, "incidence": 0, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 7616, "incidence": 1, "new_dead": 163, "incidence_dead": 0 },
            { "month": 5, "new_cases": 39486, "incidence": 6, "new_dead": 482, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 98330, "incidence": 15, "new_dead": 1197, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 92178, "incidence": 14, "new_dead": 1264, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 75335, "incidence": 11, "new_dead": 1170, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 50483, "incidence": 8, "new_dead": 970, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 44205, "incidence": 7, "new_dead": 672, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 57248, "incidence": 9, "new_dead": 721, "incidence_dead": 0.1 },
          ],
          maxCases: 98330
        },
        {
          "name": "Barbados", "continent": "North America", "alpha2": "bb", "population": 287371, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 32, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 47, "incidence": 4, "new_dead": 6, "incidence_dead": 0.5 },
            { "month": 5, "new_cases": 11, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 13, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 64, "incidence": 6, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 16, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 47, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 39, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 64
        },
        {
          "name": "Belarus", "continent": "Europe", "alpha2": "by", "population": 9449321, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 151, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 13875, "incidence": 37, "new_dead": 88, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 28529, "incidence": 75, "new_dead": 146, "incidence_dead": 0.4 },
            { "month": 6, "new_cases": 19562, "incidence": 52, "new_dead": 157, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 5690, "incidence": 15, "new_dead": 167, "incidence_dead": 0.4 },
            { "month": 8, "new_cases": 4035, "incidence": 11, "new_dead": 122, "incidence_dead": 0.3 },
            { "month": 9, "new_cases": 6788, "incidence": 18, "new_dead": 152, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 19851, "incidence": 53, "new_dead": 147, "incidence_dead": 0.4 },
            { "month": 11, "new_cases": 38165, "incidence": 101, "new_dead": 178, "incidence_dead": 0.5 },
          ],
          maxCases: 38165
        },
        {
          "name": "Belgium", "continent": "Europe", "alpha2": "be", "population": 11589616, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 12774, "incidence": 28, "new_dead": 702, "incidence_dead": 1.5 },
            { "month": 4, "new_cases": 35744, "incidence": 77, "new_dead": 6889, "incidence_dead": 14.9 },
            { "month": 5, "new_cases": 9862, "incidence": 21, "new_dead": 1873, "incidence_dead": 4 },
            { "month": 6, "new_cases": 3046, "incidence": 7, "new_dead": 280, "incidence_dead": 0.6 },
            { "month": 7, "new_cases": 7324, "incidence": 16, "new_dead": 94, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 16485, "incidence": 36, "new_dead": 54, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 33216, "incidence": 72, "new_dead": 121, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 310777, "incidence": 670, "new_dead": 1609, "incidence_dead": 3.5 },
            { "month": 11, "new_cases": 148116, "incidence": 320, "new_dead": 5020, "incidence_dead": 10.8 },
          ],
          maxCases: 310777
        },
        {
          "name": "Belize", "continent": "North America", "alpha2": "bz", "population": 397621, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 15, "incidence": 1, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 24, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 959, "incidence": 60, "new_dead": 11, "incidence_dead": 0.7 },
            { "month": 9, "new_cases": 985, "incidence": 62, "new_dead": 14, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 1495, "incidence": 94, "new_dead": 32, "incidence_dead": 2 },
            { "month": 11, "new_cases": 2367, "incidence": 149, "new_dead": 89, "incidence_dead": 5.6 },
          ],
          maxCases: 2367
        },
        {
          "name": "Benin", "continent": "Africa", "alpha2": "bj", "population": 12123198, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 55, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 168, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 6, "new_cases": 967, "incidence": 2, "new_dead": 18, "incidence_dead": 0 },
            { "month": 7, "new_cases": 606, "incidence": 1, "new_dead": 15, "incidence_dead": 0 },
            { "month": 8, "new_cases": 340, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 9, "new_cases": 212, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 286, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 372, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
          ],
          maxCases: 967
        },
        {
          "name": "Bhutan", "continent": "Asia", "alpha2": "bt", "population": 771612, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 36, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 34, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 24, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 124, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 57, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 67, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 61, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 124
        },
        {
          "name": "Bolivia", "continent": "South America", "alpha2": "bo", "population": 11673029, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 105, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1060, "incidence": 2, "new_dead": 56, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 8815, "incidence": 19, "new_dead": 251, "incidence_dead": 0.5 },
            { "month": 6, "new_cases": 23237, "incidence": 50, "new_dead": 810, "incidence_dead": 1.7 },
            { "month": 7, "new_cases": 43570, "incidence": 93, "new_dead": 1854, "incidence_dead": 4 },
            { "month": 8, "new_cases": 39809, "incidence": 85, "new_dead": 2050, "incidence_dead": 4.4 },
            { "month": 9, "new_cases": 18713, "incidence": 40, "new_dead": 2938, "incidence_dead": 6.3 },
            { "month": 10, "new_cases": 6446, "incidence": 14, "new_dead": 760, "incidence_dead": 1.6 },
            { "month": 11, "new_cases": 2951, "incidence": 6, "new_dead": 232, "incidence_dead": 0.5 },
          ],
          maxCases: 43570
        },
        {
          "name": "Bosnia and Herzegovina", "continent": "Europe", "alpha2": "ba", "population": 3280815, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 418, "incidence": 3, "new_dead": 12, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 1337, "incidence": 10, "new_dead": 56, "incidence_dead": 0.4 },
            { "month": 5, "new_cases": 753, "incidence": 6, "new_dead": 84, "incidence_dead": 0.6 },
            { "month": 6, "new_cases": 1943, "incidence": 15, "new_dead": 33, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 7423, "incidence": 57, "new_dead": 153, "incidence_dead": 1.2 },
            { "month": 8, "new_cases": 8088, "incidence": 62, "new_dead": 270, "incidence_dead": 2.1 },
            { "month": 9, "new_cases": 7505, "incidence": 57, "new_dead": 247, "incidence_dead": 1.9 },
            { "month": 10, "new_cases": 22621, "incidence": 172, "new_dead": 378, "incidence_dead": 2.9 },
            { "month": 11, "new_cases": 37811, "incidence": 288, "new_dead": 1447, "incidence_dead": 11 },
          ],
          maxCases: 37811
        },
        {
          "name": "Botswana", "continent": "Africa", "alpha2": "bw", "population": 2351625, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 19, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 12, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 192, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 577, "incidence": 6, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 829, "incidence": 9, "new_dead": 4, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1539, "incidence": 16, "new_dead": 10, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 3470, "incidence": 37, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 4100, "incidence": 44, "new_dead": 10, "incidence_dead": 0.1 },
          ],
          maxCases: 4100
        },
        {
          "name": "Brazil", "continent": "South America", "alpha2": "br", "population": 212559409, "months": [
            { "month": 2, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 5715, "incidence": 1, "new_dead": 200, "incidence_dead": 0 },
            { "month": 4, "new_cases": 81470, "incidence": 10, "new_dead": 5805, "incidence_dead": 0.7 },
            { "month": 5, "new_cases": 427662, "incidence": 50, "new_dead": 23308, "incidence_dead": 2.7 },
            { "month": 6, "new_cases": 887192, "incidence": 104, "new_dead": 30280, "incidence_dead": 3.6 },
            { "month": 7, "new_cases": 1260444, "incidence": 148, "new_dead": 32881, "incidence_dead": 3.9 },
            { "month": 8, "new_cases": 1245787, "incidence": 147, "new_dead": 28906, "incidence_dead": 3.4 },
            { "month": 9, "new_cases": 902663, "incidence": 106, "new_dead": 22571, "incidence_dead": 2.7 },
            { "month": 10, "new_cases": 724670, "incidence": 85, "new_dead": 15932, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 800273, "incidence": 94, "new_dead": 13236, "incidence_dead": 1.6 },
          ],
          maxCases: 1260444
        },
        {
          "name": "Brunei", "continent": "Asia", "alpha2": "bn", "population": 437483, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 128, "incidence": 7, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 9, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 3, "incidence": 0, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 128
        },
        {
          "name": "Bulgaria", "continent": "Europe", "alpha2": "bg", "population": 6948445, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 395, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1107, "incidence": 4, "new_dead": 58, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 1007, "incidence": 4, "new_dead": 74, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 2476, "incidence": 9, "new_dead": 90, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 6701, "incidence": 24, "new_dead": 153, "incidence_dead": 0.6 },
            { "month": 8, "new_cases": 4576, "incidence": 16, "new_dead": 246, "incidence_dead": 0.9 },
            { "month": 9, "new_cases": 4567, "incidence": 16, "new_dead": 196, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 32011, "incidence": 115, "new_dead": 454, "incidence_dead": 1.6 },
            { "month": 11, "new_cases": 92456, "incidence": 333, "new_dead": 2756, "incidence_dead": 9.9 },
          ],
          maxCases: 92456
        },
        {
          "name": "Burkina Faso", "continent": "Africa", "alpha2": "bf", "population": 20903278, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 260, "incidence": 0, "new_dead": 13, "incidence_dead": 0 },
            { "month": 4, "new_cases": 384, "incidence": 0, "new_dead": 29, "incidence_dead": 0 },
            { "month": 5, "new_cases": 202, "incidence": 0, "new_dead": 10, "incidence_dead": 0 },
            { "month": 6, "new_cases": 115, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 144, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 262, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 688, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 10, "new_cases": 444, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 11, "new_cases": 386, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 688
        },
        {
          "name": "Burundi", "continent": "Africa", "alpha2": "bi", "population": 11890781, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 52, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 107, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 217, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 58, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 63, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 77, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 103, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 217
        },
        {
          "name": "Cambodia", "continent": "Asia", "alpha2": "kh", "population": 16718971, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 108, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 16, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 98, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 35, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 14, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 35, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 108
        },
        {
          "name": "Cameroon", "continent": "Africa", "alpha2": "cm", "population": 26545864, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 192, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1639, "incidence": 2, "new_dead": 55, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 4072, "incidence": 4, "new_dead": 130, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 6688, "incidence": 6, "new_dead": 122, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 4663, "incidence": 4, "new_dead": 78, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 1887, "incidence": 2, "new_dead": 20, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1696, "incidence": 2, "new_dead": 7, "incidence_dead": 0 },
            { "month": 10, "new_cases": 955, "incidence": 1, "new_dead": 8, "incidence_dead": 0 },
            { "month": 11, "new_cases": 2652, "incidence": 2, "new_dead": 11, "incidence_dead": 0 },
          ],
          maxCases: 6688
        },
        {
          "name": "Canada", "continent": "North America", "alpha2": "ca", "population": 37742157, "months": [
            { "month": 2, "new_cases": 16, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8507, "incidence": 6, "new_dead": 100, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 45930, "incidence": 30, "new_dead": 3209, "incidence_dead": 2.1 },
            { "month": 5, "new_cases": 38022, "incidence": 25, "new_dead": 4064, "incidence_dead": 2.7 },
            { "month": 6, "new_cases": 13618, "incidence": 9, "new_dead": 1276, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 12184, "incidence": 8, "new_dead": 330, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 12637, "incidence": 8, "new_dead": 193, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 30189, "incidence": 20, "new_dead": 173, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 76206, "incidence": 50, "new_dead": 841, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 144244, "incidence": 96, "new_dead": 1960, "incidence_dead": 1.3 },
          ],
          maxCases: 144244
        },
        {
          "name": "Cape Verde", "continent": "Africa", "alpha2": "cv", "population": 555988, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 115, "incidence": 5, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 314, "incidence": 14, "new_dead": 3, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 792, "incidence": 36, "new_dead": 11, "incidence_dead": 0.5 },
            { "month": 7, "new_cases": 1224, "incidence": 55, "new_dead": 8, "incidence_dead": 0.4 },
            { "month": 8, "new_cases": 1433, "incidence": 64, "new_dead": 17, "incidence_dead": 0.8 },
            { "month": 9, "new_cases": 2140, "incidence": 96, "new_dead": 20, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 2769, "incidence": 125, "new_dead": 35, "incidence_dead": 1.6 },
            { "month": 11, "new_cases": 1968, "incidence": 88, "new_dead": 10, "incidence_dead": 0.4 },
          ],
          maxCases: 2769
        },
        {
          "name": "Central African Republic", "continent": "Africa", "alpha2": "cf", "population": 4829764, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 47, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 961, "incidence": 5, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 2734, "incidence": 14, "new_dead": 45, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 863, "incidence": 4, "new_dead": 12, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 103, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 9, "new_cases": 118, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 37, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 47, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 2734
        },
        {
          "name": "Chad", "continent": "Africa", "alpha2": "td", "population": 16425859, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 66, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 5, "new_cases": 705, "incidence": 1, "new_dead": 60, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 88, "incidence": 0, "new_dead": 9, "incidence_dead": 0 },
            { "month": 7, "new_cases": 70, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 77, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 187, "incidence": 0, "new_dead": 8, "incidence_dead": 0 },
            { "month": 10, "new_cases": 283, "incidence": 0, "new_dead": 13, "incidence_dead": 0 },
            { "month": 11, "new_cases": 205, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
          ],
          maxCases: 705
        },
        {
          "name": "Chile", "continent": "South America", "alpha2": "cl", "population": 19116209, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2842, "incidence": 4, "new_dead": 11, "incidence_dead": 0 },
            { "month": 4, "new_cases": 14858, "incidence": 19, "new_dead": 215, "incidence_dead": 0.3 },
            { "month": 5, "new_cases": 105848, "incidence": 138, "new_dead": 827, "incidence_dead": 1.1 },
            { "month": 6, "new_cases": 155843, "incidence": 204, "new_dead": 4634, "incidence_dead": 6.1 },
            { "month": 7, "new_cases": 76274, "incidence": 100, "new_dead": 3769, "incidence_dead": 4.9 },
            { "month": 8, "new_cases": 56059, "incidence": 73, "new_dead": 1832, "incidence_dead": 2.4 },
            { "month": 9, "new_cases": 51265, "incidence": 67, "new_dead": 1452, "incidence_dead": 1.9 },
            { "month": 10, "new_cases": 47265, "incidence": 62, "new_dead": 1466, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 41487, "incidence": 54, "new_dead": 1203, "incidence_dead": 1.6 },
          ],
          maxCases: 155843
        },
        {
          "name": "China", "continent": "Asia", "alpha2": "cn", "population": 1439323774, "months": [
            { "month": 2, "new_cases": 69554, "incidence": 1, "new_dead": 2624, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2923, "incidence": 0, "new_dead": 472, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1677, "incidence": 0, "new_dead": 1328, "incidence_dead": 0 },
            { "month": 5, "new_cases": 190, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 639, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2870, "incidence": 0, "new_dead": 20, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2259, "incidence": 0, "new_dead": 62, "incidence_dead": 0 },
            { "month": 9, "new_cases": 631, "incidence": 0, "new_dead": 16, "incidence_dead": 0 },
            { "month": 10, "new_cases": 821, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1536, "incidence": 0, "new_dead": 4, "incidence_dead": 0 },
          ],
          maxCases: 69554
        },
        {
          "name": "Colombia", "continent": "South America", "alpha2": "co", "population": 50882884, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 905, "incidence": 0, "new_dead": 14, "incidence_dead": 0 },
            { "month": 4, "new_cases": 5601, "incidence": 3, "new_dead": 277, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 22876, "incidence": 11, "new_dead": 646, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 68463, "incidence": 34, "new_dead": 2395, "incidence_dead": 1.2 },
            { "month": 7, "new_cases": 197662, "incidence": 97, "new_dead": 6771, "incidence_dead": 3.3 },
            { "month": 8, "new_cases": 319586, "incidence": 157, "new_dead": 9557, "incidence_dead": 4.7 },
            { "month": 9, "new_cases": 214585, "incidence": 105, "new_dead": 6336, "incidence_dead": 3.1 },
            { "month": 10, "new_cases": 244505, "incidence": 120, "new_dead": 5316, "incidence_dead": 2.6 },
            { "month": 11, "new_cases": 242622, "incidence": 119, "new_dead": 5452, "incidence_dead": 2.7 },
          ],
          maxCases: 319586
        },
        {
          "name": "Comoros", "continent": "Africa", "alpha2": "km", "population": 869595, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 105, "incidence": 3, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 197, "incidence": 6, "new_dead": 5, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 75, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 45, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 56, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 66, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 66, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 197
        },
        {
          "name": "Congo", "continent": "Africa", "alpha2": "cg", "population": 5518092, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 18, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 201, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 5, "new_cases": 391, "incidence": 2, "new_dead": 11, "incidence_dead": 0 },
            { "month": 6, "new_cases": 476, "incidence": 2, "new_dead": 17, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 2113, "incidence": 10, "new_dead": 17, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 779, "incidence": 4, "new_dead": 24, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 1110, "incidence": 5, "new_dead": 11, "incidence_dead": 0 },
            { "month": 10, "new_cases": 201, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 11, "new_cases": 484, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
          ],
          maxCases: 2113
        },
        {
          "name": "Costa Rica", "continent": "North America", "alpha2": "cr", "population": 5094114, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 346, "incidence": 2, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 372, "incidence": 2, "new_dead": 4, "incidence_dead": 0 },
            { "month": 5, "new_cases": 337, "incidence": 2, "new_dead": 4, "incidence_dead": 0 },
            { "month": 6, "new_cases": 2403, "incidence": 12, "new_dead": 6, "incidence_dead": 0 },
            { "month": 7, "new_cases": 14361, "incidence": 70, "new_dead": 134, "incidence_dead": 0.7 },
            { "month": 8, "new_cases": 23467, "incidence": 115, "new_dead": 286, "incidence_dead": 1.4 },
            { "month": 9, "new_cases": 34473, "incidence": 169, "new_dead": 468, "incidence_dead": 2.3 },
            { "month": 10, "new_cases": 34211, "incidence": 168, "new_dead": 481, "incidence_dead": 2.4 },
            { "month": 11, "new_cases": 29667, "incidence": 146, "new_dead": 341, "incidence_dead": 1.7 },
          ],
          maxCases: 34473
        },
        {
          "name": "Cote d'Ivoire", "continent": "Africa", "alpha2": "ci", "population": 26378275, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 178, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1096, "incidence": 1, "new_dead": 13, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1558, "incidence": 1, "new_dead": 19, "incidence_dead": 0 },
            { "month": 6, "new_cases": 6666, "incidence": 6, "new_dead": 35, "incidence_dead": 0 },
            { "month": 7, "new_cases": 6548, "incidence": 6, "new_dead": 34, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2020, "incidence": 2, "new_dead": 15, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1657, "incidence": 2, "new_dead": 3, "incidence_dead": 0 },
            { "month": 10, "new_cases": 992, "incidence": 1, "new_dead": 6, "incidence_dead": 0 },
            { "month": 11, "new_cases": 615, "incidence": 1, "new_dead": 6, "incidence_dead": 0 },
          ],
          maxCases: 6666
        },
        {
          "name": "Croatia", "continent": "Europe", "alpha2": "hr", "population": 4105268, "months": [
            { "month": 2, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 861, "incidence": 5, "new_dead": 5, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1209, "incidence": 7, "new_dead": 63, "incidence_dead": 0.4 },
            { "month": 5, "new_cases": 170, "incidence": 1, "new_dead": 34, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 531, "incidence": 3, "new_dead": 4, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2362, "incidence": 14, "new_dead": 38, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 5130, "incidence": 31, "new_dead": 41, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 6324, "incidence": 39, "new_dead": 94, "incidence_dead": 0.6 },
            { "month": 10, "new_cases": 32723, "incidence": 199, "new_dead": 266, "incidence_dead": 1.6 },
            { "month": 11, "new_cases": 79126, "incidence": 482, "new_dead": 1240, "incidence_dead": 7.6 },
          ],
          maxCases: 79126
        },
        {
          "name": "Cuba", "continent": "North America", "alpha2": "cu", "population": 11326616, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 183, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1315, "incidence": 3, "new_dead": 55, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 544, "incidence": 1, "new_dead": 22, "incidence_dead": 0 },
            { "month": 6, "new_cases": 296, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 267, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1424, "incidence": 3, "new_dead": 7, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1565, "incidence": 3, "new_dead": 28, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 1290, "incidence": 3, "new_dead": 6, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1397, "incidence": 3, "new_dead": 7, "incidence_dead": 0 },
          ],
          maxCases: 1565
        },
        {
          "name": "Cyprus", "continent": "Europe", "alpha2": "cy", "population": 875899, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 260, "incidence": 7, "new_dead": 7, "incidence_dead": 0.2 },
            { "month": 4, "new_cases": 588, "incidence": 17, "new_dead": 7, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 94, "incidence": 3, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 54, "incidence": 2, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 116, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 374, "incidence": 11, "new_dead": 1, "incidence_dead": 0 },
            { "month": 9, "new_cases": 267, "incidence": 8, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 2611, "incidence": 75, "new_dead": 4, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 6199, "incidence": 177, "new_dead": 23, "incidence_dead": 0.7 },
          ],
          maxCases: 6199
        },
        {
          "name": "Czechia", "continent": "Europe", "alpha2": "cz", "population": 10708982, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 3305, "incidence": 8, "new_dead": 30, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 4374, "incidence": 10, "new_dead": 205, "incidence_dead": 0.5 },
            { "month": 5, "new_cases": 1586, "incidence": 4, "new_dead": 84, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 2686, "incidence": 6, "new_dead": 29, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 4620, "incidence": 11, "new_dead": 33, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 8044, "incidence": 19, "new_dead": 42, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 46145, "incidence": 108, "new_dead": 231, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 264339, "incidence": 617, "new_dead": 2596, "incidence_dead": 6.1 },
            { "month": 11, "new_cases": 188196, "incidence": 439, "new_dead": 5044, "incidence_dead": 11.8 },
          ],
          maxCases: 264339
        },
        {
          "name": "Democratic Republic of Congo", "continent": "Africa", "alpha2": "cd", "population": 89561404, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 97, "incidence": 0, "new_dead": 7, "incidence_dead": 0 },
            { "month": 4, "new_cases": 474, "incidence": 0, "new_dead": 23, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2498, "incidence": 1, "new_dead": 41, "incidence_dead": 0 },
            { "month": 6, "new_cases": 3969, "incidence": 1, "new_dead": 98, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2031, "incidence": 1, "new_dead": 45, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1027, "incidence": 0, "new_dead": 43, "incidence_dead": 0 },
            { "month": 9, "new_cases": 562, "incidence": 0, "new_dead": 14, "incidence_dead": 0 },
            { "month": 10, "new_cases": 647, "incidence": 0, "new_dead": 35, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1466, "incidence": 0, "new_dead": 26, "incidence_dead": 0 },
          ],
          maxCases: 3969
        },
        {
          "name": "Denmark", "continent": "Europe", "alpha2": "dk", "population": 5792203, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 3036, "incidence": 13, "new_dead": 89, "incidence_dead": 0.4 },
            { "month": 4, "new_cases": 6317, "incidence": 27, "new_dead": 362, "incidence_dead": 1.6 },
            { "month": 5, "new_cases": 2513, "incidence": 11, "new_dead": 122, "incidence_dead": 0.5 },
            { "month": 6, "new_cases": 1099, "incidence": 5, "new_dead": 31, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 1060, "incidence": 5, "new_dead": 10, "incidence_dead": 0 },
            { "month": 8, "new_cases": 3382, "incidence": 15, "new_dead": 9, "incidence_dead": 0 },
            { "month": 9, "new_cases": 11069, "incidence": 48, "new_dead": 26, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 18384, "incidence": 79, "new_dead": 71, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 34139, "incidence": 147, "new_dead": 116, "incidence_dead": 0.5 },
          ],
          maxCases: 34139
        },
        {
          "name": "Djibouti", "continent": "Africa", "alpha2": "dj", "population": 988002, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 29, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1059, "incidence": 27, "new_dead": 1, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2265, "incidence": 57, "new_dead": 22, "incidence_dead": 0.6 },
            { "month": 6, "new_cases": 1328, "incidence": 34, "new_dead": 30, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 402, "incidence": 10, "new_dead": 4, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 303, "incidence": 8, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 29, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 145, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 118, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 2265
        },
        {
          "name": "Dominica", "continent": "North America", "alpha2": "dm", "population": 71991, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 11, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 4, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 10, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 20, "incidence": 7, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 35, "incidence": 12, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 35
        },
        {
          "name": "Dominican Republic", "continent": "North America", "alpha2": "do", "population": 10847904, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1108, "incidence": 3, "new_dead": 50, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 5863, "incidence": 14, "new_dead": 250, "incidence_dead": 0.6 },
            { "month": 5, "new_cases": 10313, "incidence": 24, "new_dead": 201, "incidence_dead": 0.5 },
            { "month": 6, "new_cases": 15283, "incidence": 35, "new_dead": 245, "incidence_dead": 0.6 },
            { "month": 7, "new_cases": 37081, "incidence": 85, "new_dead": 413, "incidence_dead": 1 },
            { "month": 8, "new_cases": 25066, "incidence": 58, "new_dead": 550, "incidence_dead": 1.3 },
            { "month": 9, "new_cases": 17494, "incidence": 40, "new_dead": 395, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 14809, "incidence": 34, "new_dead": 140, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 16970, "incidence": 39, "new_dead": 86, "incidence_dead": 0.2 },
          ],
          maxCases: 37081
        },
        {
          "name": "Ecuador", "continent": "South America", "alpha2": "ec", "population": 17643060, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2234, "incidence": 3, "new_dead": 73, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 22694, "incidence": 32, "new_dead": 825, "incidence_dead": 1.2 },
            { "month": 5, "new_cases": 14164, "incidence": 20, "new_dead": 2458, "incidence_dead": 3.5 },
            { "month": 6, "new_cases": 17334, "incidence": 25, "new_dead": 1169, "incidence_dead": 1.7 },
            { "month": 7, "new_cases": 28923, "incidence": 41, "new_dead": 1175, "incidence_dead": 1.7 },
            { "month": 8, "new_cases": 28412, "incidence": 40, "new_dead": 854, "incidence_dead": 1.2 },
            { "month": 9, "new_cases": 23280, "incidence": 33, "new_dead": 4799, "incidence_dead": 6.8 },
            { "month": 10, "new_cases": 31145, "incidence": 44, "new_dead": 1315, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 24493, "incidence": 35, "new_dead": 791, "incidence_dead": 1.1 },
          ],
          maxCases: 31145
        },
        {
          "name": "Egypt", "continent": "Africa", "alpha2": "eg", "population": 102334403, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 709, "incidence": 0, "new_dead": 45, "incidence_dead": 0 },
            { "month": 4, "new_cases": 4827, "incidence": 1, "new_dead": 346, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 19448, "incidence": 5, "new_dead": 567, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 43326, "incidence": 11, "new_dead": 1994, "incidence_dead": 0.5 },
            { "month": 7, "new_cases": 25767, "incidence": 6, "new_dead": 1852, "incidence_dead": 0.5 },
            { "month": 8, "new_cases": 4861, "incidence": 1, "new_dead": 616, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 4259, "incidence": 1, "new_dead": 509, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 4357, "incidence": 1, "new_dead": 336, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 8356, "incidence": 2, "new_dead": 384, "incidence_dead": 0.1 },
          ],
          maxCases: 43326
        },
        {
          "name": "El Salvador", "continent": "North America", "alpha2": "sv", "population": 6486201, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 31, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 363, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2122, "incidence": 8, "new_dead": 36, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 3921, "incidence": 15, "new_dead": 128, "incidence_dead": 0.5 },
            { "month": 7, "new_cases": 10194, "incidence": 39, "new_dead": 274, "incidence_dead": 1.1 },
            { "month": 8, "new_cases": 9097, "incidence": 35, "new_dead": 269, "incidence_dead": 1 },
            { "month": 9, "new_cases": 3348, "incidence": 13, "new_dead": 126, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 4368, "incidence": 17, "new_dead": 132, "incidence_dead": 0.5 },
            { "month": 11, "new_cases": 4960, "incidence": 19, "new_dead": 139, "incidence_dead": 0.5 },
          ],
          maxCases: 10194
        },
        {
          "name": "Equatorial Guinea", "continent": "Africa", "alpha2": "gq", "population": 1402985, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 11, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 303, "incidence": 5, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 991, "incidence": 18, "new_dead": 11, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 695, "incidence": 12, "new_dead": 20, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 2820, "incidence": 50, "new_dead": 51, "incidence_dead": 0.9 },
            { "month": 8, "new_cases": 120, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 89, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 58, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 65, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
          ],
          maxCases: 2820
        },
        {
          "name": "Eritrea", "continent": "Africa", "alpha2": "er", "population": 3546427, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 14, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 24, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 164, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 76, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 40, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 56, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 88, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 114, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 164
        },
        {
          "name": "Estonia", "continent": "Europe", "alpha2": "ee", "population": 1326539, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 744, "incidence": 14, "new_dead": 3, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 944, "incidence": 18, "new_dead": 48, "incidence_dead": 0.9 },
            { "month": 5, "new_cases": 180, "incidence": 3, "new_dead": 16, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 120, "incidence": 2, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 75, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 311, "incidence": 6, "new_dead": -5, "incidence_dead": -0.1 },
            { "month": 9, "new_cases": 996, "incidence": 19, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1534, "incidence": 29, "new_dead": 9, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 7403, "incidence": 140, "new_dead": 45, "incidence_dead": 0.8 },
          ],
          maxCases: 7403
        },
        {
          "name": "Eswatini", "continent": "Africa", "alpha2": "sz", "population": 1160164, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 91, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 185, "incidence": 4, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 527, "incidence": 11, "new_dead": 9, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 1836, "incidence": 40, "new_dead": 30, "incidence_dead": 0.6 },
            { "month": 8, "new_cases": 1929, "incidence": 42, "new_dead": 50, "incidence_dead": 1.1 },
            { "month": 9, "new_cases": 905, "incidence": 20, "new_dead": 18, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 435, "incidence": 9, "new_dead": 8, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 502, "incidence": 11, "new_dead": 5, "incidence_dead": 0.1 },
          ],
          maxCases: 1929
        },
        {
          "name": "Ethiopia", "continent": "Africa", "alpha2": "et", "population": 114963583, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 25, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 105, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1041, "incidence": 0, "new_dead": 8, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4674, "incidence": 1, "new_dead": 92, "incidence_dead": 0 },
            { "month": 7, "new_cases": 11684, "incidence": 3, "new_dead": 171, "incidence_dead": 0 },
            { "month": 8, "new_cases": 34601, "incidence": 8, "new_dead": 535, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 23237, "incidence": 5, "new_dead": 389, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 20801, "incidence": 5, "new_dead": 271, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 13905, "incidence": 3, "new_dead": 237, "incidence_dead": 0.1 },
          ],
          maxCases: 34601
        },
        {
          "name": "Fiji", "continent": "Oceania", "alpha2": "fj", "population": 896444, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 9, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 8, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 13
        },
        {
          "name": "Finland", "continent": "Europe", "alpha2": "fi", "population": 5540718, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1415, "incidence": 6, "new_dead": 16, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 3577, "incidence": 16, "new_dead": 194, "incidence_dead": 0.9 },
            { "month": 5, "new_cases": 1864, "incidence": 8, "new_dead": 109, "incidence_dead": 0.5 },
            { "month": 6, "new_cases": 355, "incidence": 2, "new_dead": 8, "incidence_dead": 0 },
            { "month": 7, "new_cases": 218, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 654, "incidence": 3, "new_dead": 7, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1906, "incidence": 9, "new_dead": 8, "incidence_dead": 0 },
            { "month": 10, "new_cases": 6121, "incidence": 28, "new_dead": 14, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 8799, "incidence": 40, "new_dead": 41, "incidence_dead": 0.2 },
          ],
          maxCases: 8799
        },
        {
          "name": "France", "continent": "Europe", "alpha2": "fr", "population": 65273512, "months": [
            { "month": 2, "new_cases": 95, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 3, "new_cases": 52178, "incidence": 20, "new_dead": 3524, "incidence_dead": 1.3 },
            { "month": 4, "new_cases": 116583, "incidence": 45, "new_dead": 20823, "incidence_dead": 8 },
            { "month": 5, "new_cases": 22114, "incidence": 8, "new_dead": 4456, "incidence_dead": 1.7 },
            { "month": 6, "new_cases": 13269, "incidence": 5, "new_dead": 1041, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 22995, "incidence": 9, "new_dead": 422, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 93921, "incidence": 36, "new_dead": 378, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 284733, "incidence": 109, "new_dead": 1332, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 808471, "incidence": 310, "new_dead": 4849, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 862510, "incidence": 330, "new_dead": 15992, "incidence_dead": 6.1 },
          ],
          maxCases: 862510
        },
        {
          "name": "Gabon", "continent": "Africa", "alpha2": "ga", "population": 2225728, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 15, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 260, "incidence": 3, "new_dead": 2, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2379, "incidence": 27, "new_dead": 14, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 2739, "incidence": 31, "new_dead": 25, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 1958, "incidence": 22, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 1181, "incidence": 13, "new_dead": 4, "incidence_dead": 0 },
            { "month": 9, "new_cases": 233, "incidence": 3, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 202, "incidence": 2, "new_dead": 1, "incidence_dead": 0 },
            { "month": 11, "new_cases": 246, "incidence": 3, "new_dead": 5, "incidence_dead": 0.1 },
          ],
          maxCases: 2739
        },
        {
          "name": "Gambia", "continent": "Africa", "alpha2": "gm", "population": 2416664, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 14, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 24, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 449, "incidence": 5, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 2465, "incidence": 26, "new_dead": 87, "incidence_dead": 0.9 },
            { "month": 9, "new_cases": 616, "incidence": 6, "new_dead": 16, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 93, "incidence": 1, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 70, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
          ],
          maxCases: 2465
        },
        {
          "name": "Georgia", "continent": "Asia", "alpha2": "ge", "population": 3989175, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 109, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 429, "incidence": 3, "new_dead": 5, "incidence_dead": 0 },
            { "month": 5, "new_cases": 244, "incidence": 2, "new_dead": 6, "incidence_dead": 0 },
            { "month": 6, "new_cases": 145, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 240, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 319, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 4705, "incidence": 29, "new_dead": 20, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 32744, "incidence": 205, "new_dead": 268, "incidence_dead": 1.7 },
            { "month": 11, "new_cases": 96648, "incidence": 606, "new_dead": 960, "incidence_dead": 6 },
          ],
          maxCases: 96648
        },
        {
          "name": "Germany", "continent": "Europe", "alpha2": "de", "population": 83783945, "months": [
            { "month": 2, "new_cases": 74, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 71729, "incidence": 21, "new_dead": 773, "incidence_dead": 0.2 },
            { "month": 4, "new_cases": 91201, "incidence": 27, "new_dead": 5848, "incidence_dead": 1.7 },
            { "month": 5, "new_cases": 20401, "incidence": 6, "new_dead": 1917, "incidence_dead": 0.6 },
            { "month": 6, "new_cases": 12008, "incidence": 4, "new_dead": 450, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 14981, "incidence": 4, "new_dead": 157, "incidence_dead": 0 },
            { "month": 8, "new_cases": 34403, "incidence": 10, "new_dead": 156, "incidence_dead": 0 },
            { "month": 9, "new_cases": 48111, "incidence": 14, "new_dead": 192, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 238877, "incidence": 71, "new_dead": 988, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 538122, "incidence": 161, "new_dead": 6211, "incidence_dead": 1.9 },
          ],
          maxCases: 538122
        },
        {
          "name": "Ghana", "continent": "Africa", "alpha2": "gh", "population": 31072945, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 158, "incidence": 0, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1913, "incidence": 2, "new_dead": 12, "incidence_dead": 0 },
            { "month": 5, "new_cases": 5996, "incidence": 5, "new_dead": 19, "incidence_dead": 0 },
            { "month": 6, "new_cases": 9671, "incidence": 8, "new_dead": 76, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 17760, "incidence": 14, "new_dead": 70, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 8797, "incidence": 7, "new_dead": 94, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 2328, "incidence": 2, "new_dead": 25, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1429, "incidence": 1, "new_dead": 19, "incidence_dead": 0 },
            { "month": 11, "new_cases": 3612, "incidence": 3, "new_dead": 3, "incidence_dead": 0 },
          ],
          maxCases: 17760
        },
        {
          "name": "Greece", "continent": "Europe", "alpha2": "gr", "population": 10423056, "months": [
            { "month": 2, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1310, "incidence": 3, "new_dead": 48, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 1277, "incidence": 3, "new_dead": 91, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 326, "incidence": 1, "new_dead": 35, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 492, "incidence": 1, "new_dead": 17, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1068, "incidence": 3, "new_dead": 14, "incidence_dead": 0 },
            { "month": 8, "new_cases": 5840, "incidence": 14, "new_dead": 60, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 8158, "incidence": 20, "new_dead": 125, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 20776, "incidence": 50, "new_dead": 235, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 66020, "incidence": 158, "new_dead": 1780, "incidence_dead": 4.3 },
          ],
          maxCases: 66020
        },
        {
          "name": "Grenada", "continent": "North America", "alpha2": "gd", "population": 112519, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 11, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 3, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 4, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 13, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 13
        },
        {
          "name": "Guatemala", "continent": "North America", "alpha2": "gt", "population": 17915567, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 37, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 561, "incidence": 1, "new_dead": 15, "incidence_dead": 0 },
            { "month": 5, "new_cases": 4488, "incidence": 6, "new_dead": 92, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 13009, "incidence": 18, "new_dead": 665, "incidence_dead": 0.9 },
            { "month": 7, "new_cases": 31693, "incidence": 44, "new_dead": 1151, "incidence_dead": 1.6 },
            { "month": 8, "new_cases": 24285, "incidence": 34, "new_dead": 836, "incidence_dead": 1.2 },
            { "month": 9, "new_cases": 17672, "incidence": 25, "new_dead": 486, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 16193, "incidence": 23, "new_dead": 483, "incidence_dead": 0.7 },
            { "month": 11, "new_cases": 14123, "incidence": 20, "new_dead": 442, "incidence_dead": 0.6 },
          ],
          maxCases: 31693
        },
        {
          "name": "Guinea", "continent": "Africa", "alpha2": "gn", "population": 13132792, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 21, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1473, "incidence": 3, "new_dead": 6, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2211, "incidence": 4, "new_dead": 16, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1685, "incidence": 3, "new_dead": 10, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1917, "incidence": 4, "new_dead": 13, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2101, "incidence": 4, "new_dead": 13, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1243, "incidence": 2, "new_dead": 7, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1420, "incidence": 3, "new_dead": 6, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1047, "incidence": 2, "new_dead": 4, "incidence_dead": 0 },
          ],
          maxCases: 2211
        },
        {
          "name": "Guinea-Bissau", "continent": "Africa", "alpha2": "gw", "population": 1967998, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 197, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1051, "incidence": 13, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 398, "incidence": 5, "new_dead": 16, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 327, "incidence": 4, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 224, "incidence": 3, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 119, "incidence": 2, "new_dead": 5, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 89, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
            { "month": 11, "new_cases": 28, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
          ],
          maxCases: 1051
        },
        {
          "name": "Guyana", "continent": "South America", "alpha2": "gy", "population": 786559, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 11, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 70, "incidence": 2, "new_dead": 7, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 71, "incidence": 2, "new_dead": 3, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 92, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 168, "incidence": 5, "new_dead": 8, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 893, "incidence": 28, "new_dead": 19, "incidence_dead": 0.6 },
            { "month": 9, "new_cases": 1588, "incidence": 50, "new_dead": 41, "incidence_dead": 1.3 },
            { "month": 10, "new_cases": 1268, "incidence": 40, "new_dead": 44, "incidence_dead": 1.4 },
            { "month": 11, "new_cases": 1244, "incidence": 40, "new_dead": 27, "incidence_dead": 0.9 },
          ],
          maxCases: 1588
        },
        {
          "name": "Haiti", "continent": "North America", "alpha2": "ht", "population": 11402533, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 66, "incidence": 0, "new_dead": 7, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2043, "incidence": 4, "new_dead": 36, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 3851, "incidence": 8, "new_dead": 61, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 1449, "incidence": 3, "new_dead": 56, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 800, "incidence": 2, "new_dead": 40, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 542, "incidence": 1, "new_dead": 28, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 291, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 11, "new_cases": 237, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 3851
        },
        {
          "name": "Honduras", "continent": "North America", "alpha2": "hn", "population": 9904608, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 139, "incidence": 0, "new_dead": 6, "incidence_dead": 0 },
            { "month": 4, "new_cases": 630, "incidence": 2, "new_dead": 64, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 4431, "incidence": 11, "new_dead": 141, "incidence_dead": 0.4 },
            { "month": 6, "new_cases": 14356, "incidence": 36, "new_dead": 285, "incidence_dead": 0.7 },
            { "month": 7, "new_cases": 22456, "incidence": 57, "new_dead": 840, "incidence_dead": 2.1 },
            { "month": 8, "new_cases": 19000, "incidence": 48, "new_dead": 536, "incidence_dead": 1.4 },
            { "month": 9, "new_cases": 15886, "incidence": 40, "new_dead": 480, "incidence_dead": 1.2 },
            { "month": 10, "new_cases": 19988, "incidence": 50, "new_dead": 316, "incidence_dead": 0.8 },
            { "month": 11, "new_cases": 11365, "incidence": 29, "new_dead": 249, "incidence_dead": 0.6 },
          ],
          maxCases: 22456
        },
        {
          "name": "Hungary", "continent": "Europe", "alpha2": "hu", "population": 9660350, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 490, "incidence": 1, "new_dead": 15, "incidence_dead": 0 },
            { "month": 4, "new_cases": 2283, "incidence": 6, "new_dead": 296, "incidence_dead": 0.8 },
            { "month": 5, "new_cases": 1101, "incidence": 3, "new_dead": 214, "incidence_dead": 0.6 },
            { "month": 6, "new_cases": 279, "incidence": 1, "new_dead": 59, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 350, "incidence": 1, "new_dead": 11, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1634, "incidence": 4, "new_dead": 19, "incidence_dead": 0 },
            { "month": 9, "new_cases": 20322, "incidence": 53, "new_dead": 150, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 48860, "incidence": 126, "new_dead": 985, "incidence_dead": 2.5 },
            { "month": 11, "new_cases": 141801, "incidence": 367, "new_dead": 3073, "incidence_dead": 8 },
          ],
          maxCases: 141801
        },
        {
          "name": "Iceland", "continent": "Europe", "alpha2": "is", "population": 341250, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1134, "incidence": 83, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 662, "incidence": 48, "new_dead": 8, "incidence_dead": 0.6 },
            { "month": 5, "new_cases": 9, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 18, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 61, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 222, "incidence": 16, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 621, "incidence": 45, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2137, "incidence": 157, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 527, "incidence": 39, "new_dead": 14, "incidence_dead": 1 },
          ],
          maxCases: 2137
        },
        {
          "name": "India", "continent": "Asia", "alpha2": "in", "population": 1380004385, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1394, "incidence": 0, "new_dead": 34, "incidence_dead": 0 },
            { "month": 4, "new_cases": 33466, "incidence": 1, "new_dead": 1119, "incidence_dead": 0 },
            { "month": 5, "new_cases": 155746, "incidence": 3, "new_dead": 4254, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 394872, "incidence": 7, "new_dead": 11992, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 1110507, "incidence": 20, "new_dead": 19111, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 1995178, "incidence": 36, "new_dead": 28777, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 2621418, "incidence": 47, "new_dead": 33390, "incidence_dead": 0.6 },
            { "month": 10, "new_cases": 1871498, "incidence": 34, "new_dead": 23433, "incidence_dead": 0.4 },
            { "month": 11, "new_cases": 1278727, "incidence": 23, "new_dead": 15510, "incidence_dead": 0.3 },
          ],
          maxCases: 2621418
        },
        {
          "name": "Indonesia", "continent": "Asia", "alpha2": "id", "population": 273523621, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1526, "incidence": 0, "new_dead": 135, "incidence_dead": 0 },
            { "month": 4, "new_cases": 8590, "incidence": 1, "new_dead": 656, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 16355, "incidence": 1, "new_dead": 821, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 29912, "incidence": 3, "new_dead": 1263, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 51991, "incidence": 5, "new_dead": 2255, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 66420, "incidence": 6, "new_dead": 2286, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 112212, "incidence": 10, "new_dead": 3323, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 123080, "incidence": 11, "new_dead": 3129, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 128795, "incidence": 12, "new_dead": 3076, "incidence_dead": 0.3 },
          ],
          maxCases: 128795
        },
        {
          "name": "Iraq", "continent": "Asia", "alpha2": "iq", "population": 40222503, "months": [
            { "month": 2, "new_cases": 12, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 681, "incidence": 0, "new_dead": 48, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1391, "incidence": 1, "new_dead": 43, "incidence_dead": 0 },
            { "month": 5, "new_cases": 4354, "incidence": 3, "new_dead": 112, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 42670, "incidence": 27, "new_dead": 1738, "incidence_dead": 1.1 },
            { "month": 7, "new_cases": 75500, "incidence": 47, "new_dead": 2798, "incidence_dead": 1.7 },
            { "month": 8, "new_cases": 110325, "incidence": 69, "new_dead": 2301, "incidence_dead": 1.4 },
            { "month": 9, "new_cases": 128047, "incidence": 80, "new_dead": 2139, "incidence_dead": 1.3 },
            { "month": 10, "new_cases": 109649, "incidence": 68, "new_dead": 1729, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 79919, "incidence": 50, "new_dead": 1348, "incidence_dead": 0.8 },
          ],
          maxCases: 128047
        },
        {
          "name": "Ireland", "continent": "Europe", "alpha2": "ie", "population": 4937796, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 3234, "incidence": 16, "new_dead": 70, "incidence_dead": 0.4 },
            { "month": 4, "new_cases": 17377, "incidence": 88, "new_dead": 1161, "incidence_dead": 5.9 },
            { "month": 5, "new_cases": 4378, "incidence": 22, "new_dead": 420, "incidence_dead": 2.1 },
            { "month": 6, "new_cases": 483, "incidence": 2, "new_dead": 84, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 592, "incidence": 3, "new_dead": 27, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 2746, "incidence": 14, "new_dead": 14, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 7344, "incidence": 37, "new_dead": 27, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 25301, "incidence": 128, "new_dead": 109, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 11088, "incidence": 56, "new_dead": 140, "incidence_dead": 0.7 },
          ],
          maxCases: 25301
        },
        {
          "name": "Israel", "continent": "Asia", "alpha2": "il", "population": 8655541, "months": [
            { "month": 2, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 5711, "incidence": 16, "new_dead": 20, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 10179, "incidence": 29, "new_dead": 204, "incidence_dead": 0.6 },
            { "month": 5, "new_cases": 1183, "incidence": 3, "new_dead": 62, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 8359, "incidence": 24, "new_dead": 40, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 46296, "incidence": 134, "new_dead": 237, "incidence_dead": 0.7 },
            { "month": 8, "new_cases": 45172, "incidence": 130, "new_dead": 389, "incidence_dead": 1.1 },
            { "month": 9, "new_cases": 130505, "incidence": 377, "new_dead": 651, "incidence_dead": 1.9 },
            { "month": 10, "new_cases": 66938, "incidence": 193, "new_dead": 957, "incidence_dead": 2.8 },
            { "month": 11, "new_cases": 22842, "incidence": 66, "new_dead": 311, "incidence_dead": 0.9 },
          ],
          maxCases: 130505
        },
        {
          "name": "Italy", "continent": "Europe", "alpha2": "it", "population": 60461828, "months": [
            { "month": 2, "new_cases": 1126, "incidence": 0, "new_dead": 28, "incidence_dead": 0 },
            { "month": 3, "new_cases": 104664, "incidence": 43, "new_dead": 12399, "incidence_dead": 5.1 },
            { "month": 4, "new_cases": 99671, "incidence": 41, "new_dead": 15539, "incidence_dead": 6.4 },
            { "month": 5, "new_cases": 27534, "incidence": 11, "new_dead": 5448, "incidence_dead": 2.3 },
            { "month": 6, "new_cases": 7581, "incidence": 3, "new_dead": 1352, "incidence_dead": 0.6 },
            { "month": 7, "new_cases": 6959, "incidence": 3, "new_dead": 374, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 21677, "incidence": 9, "new_dead": 342, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 45647, "incidence": 19, "new_dead": 411, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 364569, "incidence": 151, "new_dead": 2724, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 922124, "incidence": 381, "new_dead": 16958, "incidence_dead": 7 },
          ],
          maxCases: 922124
        },
        {
          "name": "Jamaica", "continent": "North America", "alpha2": "jm", "population": 2961161, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 35, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 386, "incidence": 3, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 164, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 116, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 176, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1581, "incidence": 13, "new_dead": 11, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 4023, "incidence": 34, "new_dead": 86, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 2612, "incidence": 22, "new_dead": 99, "incidence_dead": 0.8 },
            { "month": 11, "new_cases": 1669, "incidence": 14, "new_dead": 51, "incidence_dead": 0.4 },
          ],
          maxCases: 4023
        },
        {
          "name": "Japan", "continent": "Asia", "alpha2": "jp", "population": 126476458, "months": [
            { "month": 2, "new_cases": 230, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2010, "incidence": 0, "new_dead": 61, "incidence_dead": 0 },
            { "month": 4, "new_cases": 12029, "incidence": 2, "new_dead": 414, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 2467, "incidence": 0, "new_dead": 417, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 1864, "incidence": 0, "new_dead": 74, "incidence_dead": 0 },
            { "month": 7, "new_cases": 17619, "incidence": 3, "new_dead": 36, "incidence_dead": 0 },
            { "month": 8, "new_cases": 32162, "incidence": 6, "new_dead": 290, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 15195, "incidence": 3, "new_dead": 277, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 17736, "incidence": 4, "new_dead": 194, "incidence_dead": 0 },
            { "month": 11, "new_cases": 47635, "incidence": 9, "new_dead": 307, "incidence_dead": 0.1 },
          ],
          maxCases: 47635
        },
        {
          "name": "Jordan", "continent": "Asia", "alpha2": "jo", "population": 10203140, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 273, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 179, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 5, "new_cases": 286, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 393, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 61, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 841, "incidence": 2, "new_dead": 4, "incidence_dead": 0 },
            { "month": 9, "new_cases": 9791, "incidence": 24, "new_dead": 46, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 60782, "incidence": 149, "new_dead": 768, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 146823, "incidence": 360, "new_dead": 1922, "incidence_dead": 4.7 },
          ],
          maxCases: 146823
        },
        {
          "name": "Kazakhstan", "continent": "Asia", "alpha2": "kz", "population": 18776707, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 339, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3059, "incidence": 4, "new_dead": 23, "incidence_dead": 0 },
            { "month": 5, "new_cases": 7456, "incidence": 10, "new_dead": 15, "incidence_dead": 0 },
            { "month": 6, "new_cases": 11450, "incidence": 15, "new_dead": 148, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 68059, "incidence": 91, "new_dead": 605, "incidence_dead": 0.8 },
            { "month": 8, "new_cases": 40306, "incidence": 54, "new_dead": 988, "incidence_dead": 1.3 },
            { "month": 9, "new_cases": 10034, "incidence": 13, "new_dead": 297, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 8992, "incidence": 12, "new_dead": 148, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 24864, "incidence": 33, "new_dead": 207, "incidence_dead": 0.3 },
          ],
          maxCases: 68059
        },
        {
          "name": "Kenya", "continent": "Africa", "alpha2": "ke", "population": 53771300, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 58, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 337, "incidence": 0, "new_dead": 16, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1566, "incidence": 1, "new_dead": 47, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4404, "incidence": 2, "new_dead": 84, "incidence_dead": 0 },
            { "month": 7, "new_cases": 14270, "incidence": 7, "new_dead": 193, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 13565, "incidence": 6, "new_dead": 236, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 4328, "incidence": 2, "new_dead": 134, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 16663, "incidence": 8, "new_dead": 270, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 28426, "incidence": 13, "new_dead": 488, "incidence_dead": 0.2 },
          ],
          maxCases: 28426
        },
        {
          "name": "Kuwait", "continent": "Asia", "alpha2": "kw", "population": 4270563, "months": [
            { "month": 2, "new_cases": 44, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 244, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3735, "incidence": 22, "new_dead": 25, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 23019, "incidence": 135, "new_dead": 186, "incidence_dead": 1.1 },
            { "month": 6, "new_cases": 19152, "incidence": 112, "new_dead": 142, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 20762, "incidence": 122, "new_dead": 93, "incidence_dead": 0.5 },
            { "month": 8, "new_cases": 18152, "incidence": 106, "new_dead": 84, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 20073, "incidence": 118, "new_dead": 79, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 20744, "incidence": 121, "new_dead": 169, "incidence_dead": 1 },
            { "month": 11, "new_cases": 16709, "incidence": 98, "new_dead": 101, "incidence_dead": 0.6 },
          ],
          maxCases: 23019
        },
        {
          "name": "Kyrgyzstan", "continent": "Asia", "alpha2": "kg", "population": 6524191, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 104, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 639, "incidence": 2, "new_dead": 7, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1002, "incidence": 4, "new_dead": 8, "incidence_dead": 0 },
            { "month": 6, "new_cases": 3758, "incidence": 14, "new_dead": 45, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 30299, "incidence": 116, "new_dead": 1317, "incidence_dead": 5 },
            { "month": 8, "new_cases": 8093, "incidence": 31, "new_dead": -320, "incidence_dead": -1.2 },
            { "month": 9, "new_cases": 2771, "incidence": 11, "new_dead": 6, "incidence_dead": 0 },
            { "month": 10, "new_cases": 12209, "incidence": 47, "new_dead": 80, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 14300, "incidence": 55, "new_dead": 131, "incidence_dead": 0.5 },
          ],
          maxCases: 30299
        },
        {
          "name": "Laos", "continent": "Asia", "alpha2": "la", "population": 7275556, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 10, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 15, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 15
        },
        {
          "name": "Latvia", "continent": "Europe", "alpha2": "lv", "population": 1886202, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 397, "incidence": 5, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 460, "incidence": 6, "new_dead": 14, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 208, "incidence": 3, "new_dead": 9, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 52, "incidence": 1, "new_dead": 6, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 113, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 165, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 428, "incidence": 6, "new_dead": 3, "incidence_dead": 0 },
            { "month": 10, "new_cases": 4070, "incidence": 54, "new_dead": 34, "incidence_dead": 0.5 },
            { "month": 11, "new_cases": 11181, "incidence": 148, "new_dead": 135, "incidence_dead": 1.8 },
          ],
          maxCases: 11181
        },
        {
          "name": "Lebanon", "continent": "Asia", "alpha2": "lb", "population": 6825442, "months": [
            { "month": 2, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 466, "incidence": 2, "new_dead": 11, "incidence_dead": 0 },
            { "month": 4, "new_cases": 255, "incidence": 1, "new_dead": 12, "incidence_dead": 0 },
            { "month": 5, "new_cases": 495, "incidence": 2, "new_dead": 3, "incidence_dead": 0 },
            { "month": 6, "new_cases": 558, "incidence": 2, "new_dead": 7, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2777, "incidence": 10, "new_dead": 27, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 12753, "incidence": 47, "new_dead": 106, "incidence_dead": 0.4 },
            { "month": 9, "new_cases": 22326, "incidence": 82, "new_dead": 200, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 41594, "incidence": 152, "new_dead": 270, "incidence_dead": 1 },
            { "month": 11, "new_cases": 46716, "incidence": 171, "new_dead": 381, "incidence_dead": 1.4 },
          ],
          maxCases: 46716
        },
        {
          "name": "Lesotho", "continent": "Africa", "alpha2": "ls", "population": 2142252, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 25, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 577, "incidence": 7, "new_dead": 12, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 481, "incidence": 6, "new_dead": 18, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 510, "incidence": 6, "new_dead": 5, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 358, "incidence": 4, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 156, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 577
        },
        {
          "name": "Liberia", "continent": "Africa", "alpha2": "lr", "population": 5057677, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 138, "incidence": 1, "new_dead": 15, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 147, "incidence": 1, "new_dead": 11, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 492, "incidence": 2, "new_dead": 9, "incidence_dead": 0 },
            { "month": 7, "new_cases": 406, "incidence": 2, "new_dead": 39, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 118, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 9, "new_cases": 39, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 83, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 169, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 492
        },
        {
          "name": "Libya", "continent": "Africa", "alpha2": "ly", "population": 6871287, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 51, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 5, "new_cases": 95, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 6, "new_cases": 668, "incidence": 2, "new_dead": 19, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 2797, "incidence": 10, "new_dead": 50, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 10345, "incidence": 38, "new_dead": 163, "incidence_dead": 0.6 },
            { "month": 9, "new_cases": 20559, "incidence": 75, "new_dead": 314, "incidence_dead": 1.1 },
            { "month": 10, "new_cases": 26570, "incidence": 97, "new_dead": 306, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 21714, "incidence": 79, "new_dead": 326, "incidence_dead": 1.2 },
          ],
          maxCases: 26570
        },
        {
          "name": "Liechtenstein", "continent": "Europe", "alpha2": "li", "population": 38137, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 67, "incidence": 44, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 14, "incidence": 9, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 6, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 19, "incidence": 12, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 11, "incidence": 7, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 415, "incidence": 272, "new_dead": 2, "incidence_dead": 1.3 },
            { "month": 11, "new_cases": 737, "incidence": 483, "new_dead": 13, "incidence_dead": 8.5 },
          ],
          maxCases: 737
        },
        {
          "name": "Lithuania", "continent": "Europe", "alpha2": "lt", "population": 2722291, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 536, "incidence": 5, "new_dead": 7, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 848, "incidence": 8, "new_dead": 37, "incidence_dead": 0.3 },
            { "month": 5, "new_cases": 290, "incidence": 3, "new_dead": 25, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 142, "incidence": 1, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 258, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 831, "incidence": 8, "new_dead": 6, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 1787, "incidence": 16, "new_dead": 6, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 10131, "incidence": 93, "new_dead": 73, "incidence_dead": 0.7 },
            { "month": 11, "new_cases": 46501, "incidence": 427, "new_dead": 341, "incidence_dead": 3.1 },
          ],
          maxCases: 46501
        },
        {
          "name": "Luxembourg", "continent": "Europe", "alpha2": "lu", "population": 625976, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2177, "incidence": 87, "new_dead": 22, "incidence_dead": 0.9 },
            { "month": 4, "new_cases": 1606, "incidence": 64, "new_dead": 67, "incidence_dead": 2.7 },
            { "month": 5, "new_cases": 234, "incidence": 9, "new_dead": 20, "incidence_dead": 0.8 },
            { "month": 6, "new_cases": 281, "incidence": 11, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2396, "incidence": 96, "new_dead": 4, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": -70, "incidence": -3, "new_dead": 10, "incidence_dead": 0.4 },
            { "month": 9, "new_cases": 1884, "incidence": 75, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 8625, "incidence": 344, "new_dead": 28, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 17544, "incidence": 701, "new_dead": 169, "incidence_dead": 6.7 },
          ],
          maxCases: 17544
        },
        {
          "name": "Madagascar", "continent": "Africa", "alpha2": "mg", "population": 27691019, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 54, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 71, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 643, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1443, "incidence": 1, "new_dead": 14, "incidence_dead": 0 },
            { "month": 7, "new_cases": 8654, "incidence": 8, "new_dead": 86, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 3995, "incidence": 4, "new_dead": 86, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 1545, "incidence": 1, "new_dead": 38, "incidence_dead": 0 },
            { "month": 10, "new_cases": 703, "incidence": 1, "new_dead": 14, "incidence_dead": 0 },
            { "month": 11, "new_cases": 230, "incidence": 0, "new_dead": 7, "incidence_dead": 0 },
          ],
          maxCases: 8654
        },
        {
          "name": "Malawi", "continent": "Africa", "alpha2": "mw", "population": 19129955, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 34, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 5, "new_cases": 247, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 940, "incidence": 1, "new_dead": 10, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2854, "incidence": 4, "new_dead": 100, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 1488, "incidence": 2, "new_dead": 61, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 207, "incidence": 0, "new_dead": 4, "incidence_dead": 0 },
            { "month": 10, "new_cases": 157, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 11, "new_cases": 98, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 2854
        },
        {
          "name": "Malaysia", "continent": "Asia", "alpha2": "my", "population": 32365998, "months": [
            { "month": 2, "new_cases": 17, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2741, "incidence": 2, "new_dead": 41, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3236, "incidence": 2, "new_dead": 59, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1817, "incidence": 1, "new_dead": 13, "incidence_dead": 0 },
            { "month": 6, "new_cases": 820, "incidence": 1, "new_dead": 6, "incidence_dead": 0 },
            { "month": 7, "new_cases": 337, "incidence": 0, "new_dead": 4, "incidence_dead": 0 },
            { "month": 8, "new_cases": 364, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1884, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 10, "new_cases": 20324, "incidence": 16, "new_dead": 113, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 34149, "incidence": 26, "new_dead": 111, "incidence_dead": 0.1 },
          ],
          maxCases: 34149
        },
        {
          "name": "Maldives", "continent": "Asia", "alpha2": "mv", "population": 540542, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 14, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 450, "incidence": 21, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1305, "incidence": 60, "new_dead": 4, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 588, "incidence": 27, "new_dead": 4, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 1432, "incidence": 66, "new_dead": 7, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 4011, "incidence": 186, "new_dead": 12, "incidence_dead": 0.6 },
            { "month": 9, "new_cases": 2487, "incidence": 115, "new_dead": 6, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 1368, "incidence": 63, "new_dead": 4, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 1352, "incidence": 63, "new_dead": 8, "incidence_dead": 0.4 },
          ],
          maxCases: 4011
        },
        {
          "name": "Mali", "continent": "Africa", "alpha2": "ml", "population": 20250834, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 26, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 462, "incidence": 1, "new_dead": 24, "incidence_dead": 0 },
            { "month": 5, "new_cases": 775, "incidence": 1, "new_dead": 51, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 916, "incidence": 1, "new_dead": 39, "incidence_dead": 0 },
            { "month": 7, "new_cases": 354, "incidence": 0, "new_dead": 8, "incidence_dead": 0 },
            { "month": 8, "new_cases": 241, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 342, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 10, "new_cases": 436, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1156, "incidence": 1, "new_dead": 20, "incidence_dead": 0 },
          ],
          maxCases: 1156
        },
        {
          "name": "Malta", "continent": "Europe", "alpha2": "mt", "population": 441539, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 166, "incidence": 9, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 296, "incidence": 17, "new_dead": 3, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 153, "incidence": 9, "new_dead": 5, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 52, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 154, "incidence": 9, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1059, "incidence": 60, "new_dead": 3, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 1175, "incidence": 67, "new_dead": 23, "incidence_dead": 1.3 },
            { "month": 10, "new_cases": 2984, "incidence": 169, "new_dead": 27, "incidence_dead": 1.5 },
            { "month": 11, "new_cases": 3831, "incidence": 217, "new_dead": 75, "incidence_dead": 4.2 },
          ],
          maxCases: 3831
        },
        {
          "name": "Marshall Islands", "continent": "Oceania", "alpha2": "mh", "population": 59194, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 2
        },
        {
          "name": "Mauritania", "continent": "Africa", "alpha2": "mr", "population": 4649660, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 522, "incidence": 3, "new_dead": 22, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 3833, "incidence": 21, "new_dead": 106, "incidence_dead": 0.6 },
            { "month": 7, "new_cases": 1947, "incidence": 10, "new_dead": 28, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 738, "incidence": 4, "new_dead": 2, "incidence_dead": 0 },
            { "month": 9, "new_cases": 454, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 10, "new_cases": 201, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
            { "month": 11, "new_cases": 898, "incidence": 5, "new_dead": 14, "incidence_dead": 0.1 },
          ],
          maxCases: 3833
        },
        {
          "name": "Mauritius", "continent": "Africa", "alpha2": "mu", "population": 1271767, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 140, "incidence": 3, "new_dead": 4, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 189, "incidence": 4, "new_dead": 5, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 12, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 25, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 60, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 63, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 189
        },
        {
          "name": "Mexico", "continent": "North America", "alpha2": "mx", "population": 128932753, "months": [
            { "month": 2, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1211, "incidence": 0, "new_dead": 28, "incidence_dead": 0 },
            { "month": 4, "new_cases": 18009, "incidence": 3, "new_dead": 1830, "incidence_dead": 0.4 },
            { "month": 5, "new_cases": 71440, "incidence": 14, "new_dead": 8071, "incidence_dead": 1.6 },
            { "month": 6, "new_cases": 135425, "incidence": 26, "new_dead": 17839, "incidence_dead": 3.5 },
            { "month": 7, "new_cases": 198548, "incidence": 38, "new_dead": 18919, "incidence_dead": 3.7 },
            { "month": 8, "new_cases": 174923, "incidence": 34, "new_dead": 17726, "incidence_dead": 3.4 },
            { "month": 9, "new_cases": 143656, "incidence": 28, "new_dead": 13232, "incidence_dead": 2.6 },
            { "month": 10, "new_cases": 181746, "incidence": 35, "new_dead": 14107, "incidence_dead": 2.7 },
            { "month": 11, "new_cases": 188581, "incidence": 37, "new_dead": 14187, "incidence_dead": 2.8 },
          ],
          maxCases: 198548
        },
        {
          "name": "Moldova", "continent": "Europe", "alpha2": "md", "population": 4033963, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 352, "incidence": 2, "new_dead": 3, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3544, "incidence": 22, "new_dead": 112, "incidence_dead": 0.7 },
            { "month": 5, "new_cases": 4354, "incidence": 27, "new_dead": 179, "incidence_dead": 1.1 },
            { "month": 6, "new_cases": 8362, "incidence": 52, "new_dead": 250, "incidence_dead": 1.5 },
            { "month": 7, "new_cases": 8120, "incidence": 50, "new_dead": 233, "incidence_dead": 1.4 },
            { "month": 8, "new_cases": 12187, "incidence": 76, "new_dead": 217, "incidence_dead": 1.3 },
            { "month": 9, "new_cases": 16122, "incidence": 100, "new_dead": 325, "incidence_dead": 2 },
            { "month": 10, "new_cases": 22998, "incidence": 143, "new_dead": 465, "incidence_dead": 2.9 },
            { "month": 11, "new_cases": 31324, "incidence": 194, "new_dead": 519, "incidence_dead": 3.2 },
          ],
          maxCases: 31324
        },
        {
          "name": "Monaco", "continent": "Europe", "alpha2": "mc", "population": 39244, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 51, "incidence": 32, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 43, "incidence": 27, "new_dead": 3, "incidence_dead": 1.9 },
            { "month": 5, "new_cases": 4, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 17, "incidence": 11, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 34, "incidence": 22, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 64, "incidence": 41, "new_dead": -2, "incidence_dead": -1.3 },
            { "month": 10, "new_cases": 141, "incidence": 90, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 250, "incidence": 159, "new_dead": 1, "incidence_dead": 0.6 },
          ],
          maxCases: 250
        },
        {
          "name": "Mongolia", "continent": "Asia", "alpha2": "mn", "population": 3278292, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 11, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 26, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 141, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 41, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 71, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 33, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 455, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 455
        },
        {
          "name": "Montenegro", "continent": "Europe", "alpha2": "me", "population": 628062, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 107, "incidence": 4, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 213, "incidence": 8, "new_dead": 5, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 2, "incidence": 0, "new_dead": 2, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 224, "incidence": 9, "new_dead": 3, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 2525, "incidence": 101, "new_dead": 36, "incidence_dead": 1.4 },
            { "month": 8, "new_cases": 1762, "incidence": 70, "new_dead": 52, "incidence_dead": 2.1 },
            { "month": 9, "new_cases": 5937, "incidence": 236, "new_dead": 69, "incidence_dead": 2.7 },
            { "month": 10, "new_cases": 7569, "incidence": 301, "new_dead": 132, "incidence_dead": 5.3 },
            { "month": 11, "new_cases": 16924, "incidence": 674, "new_dead": 198, "incidence_dead": 7.9 },
          ],
          maxCases: 16924
        },
        {
          "name": "Morocco", "continent": "Africa", "alpha2": "ma", "population": 36910558, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 616, "incidence": 0, "new_dead": 35, "incidence_dead": 0 },
            { "month": 4, "new_cases": 3806, "incidence": 3, "new_dead": 134, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 3384, "incidence": 2, "new_dead": 35, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4726, "incidence": 3, "new_dead": 23, "incidence_dead": 0 },
            { "month": 7, "new_cases": 11789, "incidence": 8, "new_dead": 125, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 38268, "incidence": 26, "new_dead": 788, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 61063, "incidence": 41, "new_dead": 1053, "incidence_dead": 0.7 },
            { "month": 10, "new_cases": 95431, "incidence": 65, "new_dead": 1501, "incidence_dead": 1 },
            { "month": 11, "new_cases": 137252, "incidence": 93, "new_dead": 2151, "incidence_dead": 1.5 },
          ],
          maxCases: 137252
        },
        {
          "name": "Mozambique", "continent": "Africa", "alpha2": "mz", "population": 31255435, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 68, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 178, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 635, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 7, "new_cases": 975, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2052, "incidence": 2, "new_dead": 12, "incidence_dead": 0 },
            { "month": 9, "new_cases": 4812, "incidence": 4, "new_dead": 38, "incidence_dead": 0 },
            { "month": 10, "new_cases": 4141, "incidence": 3, "new_dead": 31, "incidence_dead": 0 },
            { "month": 11, "new_cases": 2832, "incidence": 2, "new_dead": 39, "incidence_dead": 0 },
          ],
          maxCases: 4812
        },
        {
          "name": "Myanmar", "continent": "Asia", "alpha2": "mm", "population": 54409794, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 136, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 5, "new_cases": 73, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 75, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 54, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 529, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 12491, "incidence": 6, "new_dead": 304, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 39333, "incidence": 18, "new_dead": 927, "incidence_dead": 0.4 },
            { "month": 11, "new_cases": 38007, "incidence": 17, "new_dead": 704, "incidence_dead": 0.3 },
          ],
          maxCases: 39333
        },
        {
          "name": "Namibia", "continent": "Africa", "alpha2": "na", "population": 2540916, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 8, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 181, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1924, "incidence": 19, "new_dead": 9, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 5421, "incidence": 53, "new_dead": 65, "incidence_dead": 0.6 },
            { "month": 9, "new_cases": 3715, "incidence": 37, "new_dead": 46, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 1670, "incidence": 16, "new_dead": 12, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 1445, "incidence": 14, "new_dead": 18, "incidence_dead": 0.2 },
          ],
          maxCases: 5421
        },
        {
          "name": "Nepal", "continent": "Asia", "alpha2": "np", "population": 29136808, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 52, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1515, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 6, "new_cases": 11992, "incidence": 10, "new_dead": 21, "incidence_dead": 0 },
            { "month": 7, "new_cases": 6207, "incidence": 5, "new_dead": 27, "incidence_dead": 0 },
            { "month": 8, "new_cases": 19689, "incidence": 17, "new_dead": 172, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 38357, "incidence": 33, "new_dead": 270, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 92926, "incidence": 80, "new_dead": 439, "incidence_dead": 0.4 },
            { "month": 11, "new_cases": 62709, "incidence": 54, "new_dead": 571, "incidence_dead": 0.5 },
          ],
          maxCases: 92926
        },
        {
          "name": "Netherlands", "continent": "Europe", "alpha2": "nl", "population": 17134873, "months": [
            { "month": 2, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 12661, "incidence": 18, "new_dead": 1039, "incidence_dead": 1.5 },
            { "month": 4, "new_cases": 26845, "incidence": 39, "new_dead": 3771, "incidence_dead": 5.5 },
            { "month": 5, "new_cases": 7133, "incidence": 10, "new_dead": 1164, "incidence_dead": 1.7 },
            { "month": 6, "new_cases": 3838, "incidence": 6, "new_dead": 157, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 4107, "incidence": 6, "new_dead": 34, "incidence_dead": 0 },
            { "month": 8, "new_cases": 18642, "incidence": 27, "new_dead": 86, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 52756, "incidence": 77, "new_dead": 205, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 231652, "incidence": 338, "new_dead": 1002, "incidence_dead": 1.5 },
            { "month": 11, "new_cases": 174290, "incidence": 254, "new_dead": 1994, "incidence_dead": 2.9 },
          ],
          maxCases: 231652
        },
        {
          "name": "New Zealand", "continent": "Oceania", "alpha2": "nz", "population": 4822233, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 646, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 832, "incidence": 4, "new_dead": 18, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 25, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 6, "new_cases": 24, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 34, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 190, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 96, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 10, "new_cases": 111, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 100, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 832
        },
        {
          "name": "Nicaragua", "continent": "North America", "alpha2": "ni", "population": 6624554, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 9, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 5, "new_cases": 745, "incidence": 3, "new_dead": 32, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 1760, "incidence": 7, "new_dead": 48, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 1153, "incidence": 4, "new_dead": 33, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 822, "incidence": 3, "new_dead": 21, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 676, "incidence": 3, "new_dead": 14, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 344, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 11, "new_cases": 270, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
          ],
          maxCases: 1760
        },
        {
          "name": "Niger", "continent": "Africa", "alpha2": "ne", "population": 24206636, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 26, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 4, "new_cases": 692, "incidence": 1, "new_dead": 29, "incidence_dead": 0 },
            { "month": 5, "new_cases": 239, "incidence": 0, "new_dead": 32, "incidence_dead": 0 },
            { "month": 6, "new_cases": 117, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 59, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 42, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 21, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 23, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 328, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
          ],
          maxCases: 692
        },
        {
          "name": "Nigeria", "continent": "Africa", "alpha2": "ng", "population": 206139587, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 134, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1797, "incidence": 0, "new_dead": 56, "incidence_dead": 0 },
            { "month": 5, "new_cases": 8230, "incidence": 1, "new_dead": 229, "incidence_dead": 0 },
            { "month": 6, "new_cases": 15532, "incidence": 2, "new_dead": 303, "incidence_dead": 0 },
            { "month": 7, "new_cases": 17457, "incidence": 2, "new_dead": 289, "incidence_dead": 0 },
            { "month": 8, "new_cases": 10857, "incidence": 1, "new_dead": 134, "incidence_dead": 0 },
            { "month": 9, "new_cases": 4840, "incidence": 1, "new_dead": 99, "incidence_dead": 0 },
            { "month": 10, "new_cases": 4005, "incidence": 0, "new_dead": 32, "incidence_dead": 0 },
            { "month": 11, "new_cases": 4704, "incidence": 1, "new_dead": 29, "incidence_dead": 0 },
          ],
          maxCases: 17457
        },
        {
          "name": "North Macedonia", "continent": "Europe", "alpha2": "mk", "population": 2083380, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 328, "incidence": 4, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 1136, "incidence": 14, "new_dead": 68, "incidence_dead": 0.8 },
            { "month": 5, "new_cases": 761, "incidence": 9, "new_dead": 56, "incidence_dead": 0.7 },
            { "month": 6, "new_cases": 4108, "incidence": 49, "new_dead": 169, "incidence_dead": 2 },
            { "month": 7, "new_cases": 4420, "incidence": 53, "new_dead": 184, "incidence_dead": 2.2 },
            { "month": 8, "new_cases": 3587, "incidence": 43, "new_dead": 117, "incidence_dead": 1.4 },
            { "month": 9, "new_cases": 3636, "incidence": 44, "new_dead": 136, "incidence_dead": 1.6 },
            { "month": 10, "new_cases": 13595, "incidence": 163, "new_dead": 255, "incidence_dead": 3.1 },
            { "month": 11, "new_cases": 30306, "incidence": 364, "new_dead": 769, "incidence_dead": 9.2 },
          ],
          maxCases: 30306
        },
        {
          "name": "Norway", "continent": "Europe", "alpha2": "no", "population": 5421242, "months": [
            { "month": 2, "new_cases": 14, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4626, "incidence": 21, "new_dead": 36, "incidence_dead": 0.2 },
            { "month": 4, "new_cases": 3097, "incidence": 14, "new_dead": 171, "incidence_dead": 0.8 },
            { "month": 5, "new_cases": 702, "incidence": 3, "new_dead": 26, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 439, "incidence": 2, "new_dead": 14, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 361, "incidence": 2, "new_dead": 5, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1542, "incidence": 7, "new_dead": 9, "incidence_dead": 0 },
            { "month": 9, "new_cases": 3245, "incidence": 15, "new_dead": 10, "incidence_dead": 0 },
            { "month": 10, "new_cases": 6304, "incidence": 29, "new_dead": 8, "incidence_dead": 0 },
            { "month": 11, "new_cases": 15819, "incidence": 73, "new_dead": 50, "incidence_dead": 0.2 },
          ],
          maxCases: 15819
        },
        {
          "name": "Oman", "continent": "Asia", "alpha2": "om", "population": 5106622, "months": [
            { "month": 2, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 186, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 2156, "incidence": 11, "new_dead": 10, "incidence_dead": 0 },
            { "month": 5, "new_cases": 9089, "incidence": 44, "new_dead": 38, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 28633, "incidence": 140, "new_dead": 127, "incidence_dead": 0.6 },
            { "month": 7, "new_cases": 39089, "incidence": 191, "new_dead": 245, "incidence_dead": 1.2 },
            { "month": 8, "new_cases": 6563, "incidence": 32, "new_dead": 264, "incidence_dead": 1.3 },
            { "month": 9, "new_cases": 12863, "incidence": 63, "new_dead": 250, "incidence_dead": 1.2 },
            { "month": 10, "new_cases": 15849, "incidence": 78, "new_dead": 273, "incidence_dead": 1.3 },
            { "month": 11, "new_cases": 9265, "incidence": 45, "new_dead": 215, "incidence_dead": 1.1 },
          ],
          maxCases: 39089
        },
        {
          "name": "Pakistan", "continent": "Asia", "alpha2": "pk", "population": 220892331, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2114, "incidence": 0, "new_dead": 25, "incidence_dead": 0 },
            { "month": 4, "new_cases": 15996, "incidence": 2, "new_dead": 390, "incidence_dead": 0 },
            { "month": 5, "new_cases": 54346, "incidence": 6, "new_dead": 1126, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 141010, "incidence": 16, "new_dead": 2852, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 64835, "incidence": 7, "new_dead": 1556, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 17544, "incidence": 2, "new_dead": 343, "incidence_dead": 0 },
            { "month": 9, "new_cases": 16957, "incidence": 2, "new_dead": 190, "incidence_dead": 0 },
            { "month": 10, "new_cases": 21164, "incidence": 2, "new_dead": 339, "incidence_dead": 0 },
            { "month": 11, "new_cases": 66512, "incidence": 8, "new_dead": 1268, "incidence_dead": 0.1 },
          ],
          maxCases: 141010
        },
        {
          "name": "Panama", "continent": "North America", "alpha2": "pa", "population": 4314768, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1180, "incidence": 7, "new_dead": 29, "incidence_dead": 0.2 },
            { "month": 4, "new_cases": 5351, "incidence": 31, "new_dead": 158, "incidence_dead": 0.9 },
            { "month": 5, "new_cases": 6931, "incidence": 40, "new_dead": 148, "incidence_dead": 0.9 },
            { "month": 6, "new_cases": 20087, "incidence": 116, "new_dead": 295, "incidence_dead": 1.7 },
            { "month": 7, "new_cases": 31706, "incidence": 184, "new_dead": 790, "incidence_dead": 4.6 },
            { "month": 8, "new_cases": 27726, "incidence": 161, "new_dead": 581, "incidence_dead": 3.4 },
            { "month": 9, "new_cases": 19613, "incidence": 114, "new_dead": 370, "incidence_dead": 2.1 },
            { "month": 10, "new_cases": 21003, "incidence": 122, "new_dead": 328, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 32208, "incidence": 187, "new_dead": 379, "incidence_dead": 2.2 },
          ],
          maxCases: 32208
        },
        {
          "name": "Papua New Guinea", "continent": "Oceania", "alpha2": "pg", "population": 8947027, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 61, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 387, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 9, "new_cases": 75, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 10, "new_cases": 55, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 67, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 387
        },
        {
          "name": "Paraguay", "continent": "South America", "alpha2": "py", "population": 7132530, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 64, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 4, "new_cases": 201, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 5, "new_cases": 720, "incidence": 3, "new_dead": 1, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1235, "incidence": 4, "new_dead": 6, "incidence_dead": 0 },
            { "month": 7, "new_cases": 3117, "incidence": 11, "new_dead": 32, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 12324, "incidence": 43, "new_dead": 277, "incidence_dead": 1 },
            { "month": 9, "new_cases": 23096, "incidence": 81, "new_dead": 531, "incidence_dead": 1.9 },
            { "month": 10, "new_cases": 22427, "incidence": 79, "new_dead": 547, "incidence_dead": 1.9 },
            { "month": 11, "new_cases": 19239, "incidence": 67, "new_dead": 352, "incidence_dead": 1.2 },
          ],
          maxCases: 23096
        },
        {
          "name": "Peru", "continent": "South America", "alpha2": "pe", "population": 32971846, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1064, "incidence": 1, "new_dead": 27, "incidence_dead": 0 },
            { "month": 4, "new_cases": 35911, "incidence": 27, "new_dead": 1021, "incidence_dead": 0.8 },
            { "month": 5, "new_cases": 127500, "incidence": 97, "new_dead": 3455, "incidence_dead": 2.6 },
            { "month": 6, "new_cases": 120737, "incidence": 92, "new_dead": 5171, "incidence_dead": 3.9 },
            { "month": 7, "new_cases": 122279, "incidence": 93, "new_dead": 9344, "incidence_dead": 7.1 },
            { "month": 8, "new_cases": 239674, "incidence": 182, "new_dead": 9767, "incidence_dead": 7.4 },
            { "month": 9, "new_cases": 164602, "incidence": 125, "new_dead": 3608, "incidence_dead": 2.7 },
            { "month": 10, "new_cases": 88412, "incidence": 67, "new_dead": 2015, "incidence_dead": 1.5 },
            { "month": 11, "new_cases": 62350, "incidence": 47, "new_dead": 1512, "incidence_dead": 1.1 },
          ],
          maxCases: 239674
        },
        {
          "name": "Philippines", "continent": "Asia", "alpha2": "ph", "population": 109581085, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2081, "incidence": 0, "new_dead": 87, "incidence_dead": 0 },
            { "month": 4, "new_cases": 6404, "incidence": 1, "new_dead": 480, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 9598, "incidence": 2, "new_dead": 389, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 19428, "incidence": 4, "new_dead": 309, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 55840, "incidence": 13, "new_dead": 757, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 127465, "incidence": 29, "new_dead": 1535, "incidence_dead": 0.4 },
            { "month": 9, "new_cases": 90875, "incidence": 21, "new_dead": 1946, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 69035, "incidence": 16, "new_dead": 1717, "incidence_dead": 0.4 },
            { "month": 11, "new_cases": 50901, "incidence": 12, "new_dead": 1171, "incidence_dead": 0.3 },
          ],
          maxCases: 127465
        },
        {
          "name": "Poland", "continent": "Europe", "alpha2": "pl", "population": 37846605, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2310, "incidence": 2, "new_dead": 32, "incidence_dead": 0 },
            { "month": 4, "new_cases": 10566, "incidence": 7, "new_dead": 611, "incidence_dead": 0.4 },
            { "month": 5, "new_cases": 10909, "incidence": 7, "new_dead": 420, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 10607, "incidence": 7, "new_dead": 399, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 11295, "incidence": 7, "new_dead": 253, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 21684, "incidence": 14, "new_dead": 323, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 24142, "incidence": 16, "new_dead": 474, "incidence_dead": 0.3 },
            { "month": 10, "new_cases": 271217, "incidence": 179, "new_dead": 3118, "incidence_dead": 2.1 },
            { "month": 11, "new_cases": 628080, "incidence": 415, "new_dead": 11519, "incidence_dead": 7.6 },
          ],
          maxCases: 628080
        },
        {
          "name": "Portugal", "continent": "Europe", "alpha2": "pt", "population": 10196707, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 7441, "incidence": 18, "new_dead": 159, "incidence_dead": 0.4 },
            { "month": 4, "new_cases": 17602, "incidence": 43, "new_dead": 829, "incidence_dead": 2 },
            { "month": 5, "new_cases": 7455, "incidence": 18, "new_dead": 421, "incidence_dead": 1 },
            { "month": 6, "new_cases": 9641, "incidence": 24, "new_dead": 166, "incidence_dead": 0.4 },
            { "month": 7, "new_cases": 8931, "incidence": 22, "new_dead": 159, "incidence_dead": 0.4 },
            { "month": 8, "new_cases": 6940, "incidence": 17, "new_dead": 87, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 17530, "incidence": 43, "new_dead": 149, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 65737, "incidence": 161, "new_dead": 536, "incidence_dead": 1.3 },
            { "month": 11, "new_cases": 156782, "incidence": 384, "new_dead": 1998, "incidence_dead": 4.9 },
          ],
          maxCases: 156782
        },
        {
          "name": "Qatar", "continent": "Asia", "alpha2": "qa", "population": 2881060, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 780, "incidence": 7, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 12628, "incidence": 110, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 43501, "incidence": 377, "new_dead": 28, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 39178, "incidence": 340, "new_dead": 75, "incidence_dead": 0.7 },
            { "month": 7, "new_cases": 14607, "incidence": 127, "new_dead": 61, "incidence_dead": 0.5 },
            { "month": 8, "new_cases": 8083, "incidence": 70, "new_dead": 23, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 6982, "incidence": 61, "new_dead": 17, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 6796, "incidence": 59, "new_dead": 18, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 6277, "incidence": 54, "new_dead": 5, "incidence_dead": 0 },
          ],
          maxCases: 43501
        },
        {
          "name": "Romania", "continent": "Europe", "alpha2": "ro", "population": 19237682, "months": [
            { "month": 2, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2242, "incidence": 3, "new_dead": 79, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 9995, "incidence": 13, "new_dead": 635, "incidence_dead": 0.8 },
            { "month": 5, "new_cases": 7017, "incidence": 9, "new_dead": 549, "incidence_dead": 0.7 },
            { "month": 6, "new_cases": 7713, "incidence": 10, "new_dead": 385, "incidence_dead": 0.5 },
            { "month": 7, "new_cases": 23916, "incidence": 31, "new_dead": 692, "incidence_dead": 0.9 },
            { "month": 8, "new_cases": 36654, "incidence": 48, "new_dead": 1278, "incidence_dead": 1.7 },
            { "month": 9, "new_cases": 40032, "incidence": 52, "new_dead": 1204, "incidence_dead": 1.6 },
            { "month": 10, "new_cases": 113767, "incidence": 148, "new_dead": 2143, "incidence_dead": 2.8 },
            { "month": 11, "new_cases": 234023, "incidence": 304, "new_dead": 4363, "incidence_dead": 5.7 },
          ],
          maxCases: 234023
        },
        {
          "name": "Russia", "continent": "Europe", "alpha2": "ru", "population": 145934460, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 2335, "incidence": 0, "new_dead": 16, "incidence_dead": 0 },
            { "month": 4, "new_cases": 104161, "incidence": 18, "new_dead": 1056, "incidence_dead": 0.2 },
            { "month": 5, "new_cases": 299345, "incidence": 51, "new_dead": 3620, "incidence_dead": 0.6 },
            { "month": 6, "new_cases": 241086, "incidence": 41, "new_dead": 4613, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 191532, "incidence": 33, "new_dead": 4633, "incidence_dead": 0.8 },
            { "month": 8, "new_cases": 153941, "incidence": 26, "new_dead": 3189, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 178397, "incidence": 31, "new_dead": 3502, "incidence_dead": 0.6 },
            { "month": 10, "new_cases": 435468, "incidence": 75, "new_dead": 7157, "incidence_dead": 1.2 },
            { "month": 11, "new_cases": 669669, "incidence": 115, "new_dead": 11704, "incidence_dead": 2 },
          ],
          maxCases: 669669
        },
        {
          "name": "Rwanda", "continent": "Africa", "alpha2": "rw", "population": 12952209, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 74, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 168, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 127, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 655, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 997, "incidence": 2, "new_dead": 3, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2041, "incidence": 4, "new_dead": 11, "incidence_dead": 0 },
            { "month": 9, "new_cases": 777, "incidence": 1, "new_dead": 13, "incidence_dead": 0 },
            { "month": 10, "new_cases": 297, "incidence": 1, "new_dead": 6, "incidence_dead": 0 },
            { "month": 11, "new_cases": 797, "incidence": 2, "new_dead": 14, "incidence_dead": 0 },
          ],
          maxCases: 2041
        },
        {
          "name": "Saint Kitts and Nevis", "continent": "North America", "alpha2": "kn", "population": 53192, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 7, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 2, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 3, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 7
        },
        {
          "name": "Saint Lucia", "continent": "North America", "alpha2": "lc", "population": 183629, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 12, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 4, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 6, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 51, "incidence": 7, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 181, "incidence": 25, "new_dead": 1, "incidence_dead": 0.1 },
          ],
          maxCases: 181
        },
        {
          "name": "Saint Vincent and the Grenadines", "continent": "North America", "alpha2": "vc", "population": 110947, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 15, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 10, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 3, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 25, "incidence": 6, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 6, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 4, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 10, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 11, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 25
        },
        {
          "name": "Samoa", "continent": "Oceania", "alpha2": "ws", "population": 198410, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 1
        },
        {
          "name": "San Marino", "continent": "Europe", "alpha2": "sm", "population": 33938, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 235, "incidence": 173, "new_dead": 25, "incidence_dead": 18.4 },
            { "month": 4, "new_cases": 333, "incidence": 245, "new_dead": 15, "incidence_dead": 11 },
            { "month": 5, "new_cases": 102, "incidence": 75, "new_dead": 1, "incidence_dead": 0.7 },
            { "month": 6, "new_cases": 27, "incidence": 20, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 16, "incidence": 12, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 17, "incidence": 13, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 196, "incidence": 144, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 684, "incidence": 504, "new_dead": 4, "incidence_dead": 2.9 },
          ],
          maxCases: 684
        },
        {
          "name": "Sao Tome and Principe", "continent": "Africa", "alpha2": "st", "population": 219161, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 10, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 469, "incidence": 53, "new_dead": 11, "incidence_dead": 1.3 },
            { "month": 6, "new_cases": 231, "incidence": 26, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 157, "incidence": 18, "new_dead": 2, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 25, "incidence": 3, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 15, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 34, "incidence": 4, "new_dead": 1, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 46, "incidence": 5, "new_dead": 1, "incidence_dead": 0.1 },
          ],
          maxCases: 469
        },
        {
          "name": "Saudi Arabia", "continent": "Asia", "alpha2": "sa", "population": 34813867, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1562, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 4, "new_cases": 21190, "incidence": 15, "new_dead": 152, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 62508, "incidence": 45, "new_dead": 341, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 105562, "incidence": 76, "new_dead": 1146, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 85082, "incidence": 61, "new_dead": 1217, "incidence_dead": 0.9 },
            { "month": 8, "new_cases": 39867, "incidence": 29, "new_dead": 1031, "incidence_dead": 0.7 },
            { "month": 9, "new_cases": 18833, "incidence": 14, "new_dead": 871, "incidence_dead": 0.6 },
            { "month": 10, "new_cases": 12677, "incidence": 9, "new_dead": 634, "incidence_dead": 0.5 },
            { "month": 11, "new_cases": 10078, "incidence": 7, "new_dead": 494, "incidence_dead": 0.4 },
          ],
          maxCases: 105562
        },
        {
          "name": "Senegal", "continent": "Africa", "alpha2": "sn", "population": 16743930, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 174, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 758, "incidence": 1, "new_dead": 8, "incidence_dead": 0 },
            { "month": 5, "new_cases": 2712, "incidence": 4, "new_dead": 33, "incidence_dead": 0 },
            { "month": 6, "new_cases": 3148, "incidence": 5, "new_dead": 70, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 3439, "incidence": 5, "new_dead": 93, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 3379, "incidence": 5, "new_dead": 79, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 1371, "incidence": 2, "new_dead": 27, "incidence_dead": 0 },
            { "month": 10, "new_cases": 634, "incidence": 1, "new_dead": 13, "incidence_dead": 0 },
            { "month": 11, "new_cases": 473, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
          ],
          maxCases: 3439
        },
        {
          "name": "Serbia", "continent": "Europe", "alpha2": "rs", "population": 6804596, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 899, "incidence": 3, "new_dead": 15, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 8109, "incidence": 30, "new_dead": 163, "incidence_dead": 0.6 },
            { "month": 5, "new_cases": 2403, "incidence": 9, "new_dead": 64, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 3152, "incidence": 12, "new_dead": 34, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 10988, "incidence": 40, "new_dead": 296, "incidence_dead": 1.1 },
            { "month": 8, "new_cases": 5854, "incidence": 22, "new_dead": 140, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 2145, "incidence": 8, "new_dead": 36, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 13403, "incidence": 49, "new_dead": 71, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 128484, "incidence": 472, "new_dead": 784, "incidence_dead": 2.9 },
          ],
          maxCases: 128484
        },
        {
          "name": "Seychelles", "continent": "Africa", "alpha2": "sc", "population": 98340, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 70, "incidence": 18, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 33, "incidence": 8, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 22, "incidence": 6, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 8, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 9, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 30, "incidence": 8, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 70
        },
        {
          "name": "Sierra Leone", "continent": "Africa", "alpha2": "sl", "population": 7976985, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 123, "incidence": 0, "new_dead": 6, "incidence_dead": 0 },
            { "month": 5, "new_cases": 737, "incidence": 2, "new_dead": 39, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 601, "incidence": 2, "new_dead": 14, "incidence_dead": 0 },
            { "month": 7, "new_cases": 361, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 8, "new_cases": 199, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 9, "new_cases": 209, "incidence": 1, "new_dead": 2, "incidence_dead": 0 },
            { "month": 10, "new_cases": 135, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 11, "new_cases": 46, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 737
        },
        {
          "name": "Singapore", "continent": "Asia", "alpha2": "sg", "population": 5850343, "months": [
            { "month": 2, "new_cases": 89, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 824, "incidence": 4, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 15243, "incidence": 65, "new_dead": 12, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 18715, "incidence": 80, "new_dead": 8, "incidence_dead": 0 },
            { "month": 6, "new_cases": 9023, "incidence": 39, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 8298, "incidence": 35, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 4607, "incidence": 20, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 953, "incidence": 4, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 250, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 11, "new_cases": 203, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 18715
        },
        {
          "name": "Slovakia", "continent": "Europe", "alpha2": "sk", "population": 5459643, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 362, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1033, "incidence": 5, "new_dead": 22, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 125, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 6, "new_cases": 146, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 625, "incidence": 3, "new_dead": 1, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1625, "incidence": 7, "new_dead": 4, "incidence_dead": 0 },
            { "month": 9, "new_cases": 6224, "incidence": 29, "new_dead": 15, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 47523, "incidence": 218, "new_dead": 171, "incidence_dead": 0.8 },
            { "month": 11, "new_cases": 48265, "incidence": 221, "new_dead": 620, "incidence_dead": 2.8 },
          ],
          maxCases: 48265
        },
        {
          "name": "Slovenia", "continent": "Europe", "alpha2": "si", "population": 2078932, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 800, "incidence": 10, "new_dead": 14, "incidence_dead": 0.2 },
            { "month": 4, "new_cases": 627, "incidence": 8, "new_dead": 76, "incidence_dead": 0.9 },
            { "month": 5, "new_cases": 44, "incidence": 1, "new_dead": 17, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 127, "incidence": 2, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 556, "incidence": 7, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 727, "incidence": 9, "new_dead": 14, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 2807, "incidence": 34, "new_dead": 17, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 28617, "incidence": 344, "new_dead": 188, "incidence_dead": 2.3 },
            { "month": 11, "new_cases": 41507, "incidence": 499, "new_dead": 1097, "incidence_dead": 13.2 },
          ],
          maxCases: 41507
        },
        {
          "name": "Solomon Islands", "continent": "Oceania", "alpha2": "sb", "population": 686878, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 6, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 9, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 9
        },
        {
          "name": "Somalia", "continent": "Africa", "alpha2": "so", "population": 15893219, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 596, "incidence": 1, "new_dead": 27, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1375, "incidence": 2, "new_dead": 50, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 948, "incidence": 1, "new_dead": 12, "incidence_dead": 0 },
            { "month": 7, "new_cases": 288, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 8, "new_cases": 98, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 9, "new_cases": 278, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 353, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 11, "new_cases": 510, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
          ],
          maxCases: 1375
        },
        {
          "name": "South Africa", "continent": "Africa", "alpha2": "za", "population": 59308690, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1352, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 4294, "incidence": 2, "new_dead": 98, "incidence_dead": 0 },
            { "month": 5, "new_cases": 27036, "incidence": 11, "new_dead": 580, "incidence_dead": 0.2 },
            { "month": 6, "new_cases": 118526, "incidence": 50, "new_dead": 1974, "incidence_dead": 0.8 },
            { "month": 7, "new_cases": 341974, "incidence": 144, "new_dead": 5348, "incidence_dead": 2.3 },
            { "month": 8, "new_cases": 133858, "incidence": 56, "new_dead": 6144, "incidence_dead": 2.6 },
            { "month": 9, "new_cases": 47298, "incidence": 20, "new_dead": 2585, "incidence_dead": 1.1 },
            { "month": 10, "new_cases": 51113, "incidence": 22, "new_dead": 2542, "incidence_dead": 1.1 },
            { "month": 11, "new_cases": 64552, "incidence": 27, "new_dead": 2259, "incidence_dead": 1 },
          ],
          maxCases: 341974
        },
        {
          "name": "South Korea", "continent": "Asia", "alpha2": "kr", "population": 51269183, "months": [
            { "month": 2, "new_cases": 3139, "incidence": 2, "new_dead": 15, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6636, "incidence": 3, "new_dead": 146, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 988, "incidence": 0, "new_dead": 86, "incidence_dead": 0 },
            { "month": 5, "new_cases": 729, "incidence": 0, "new_dead": 23, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1347, "incidence": 1, "new_dead": 11, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1486, "incidence": 1, "new_dead": 19, "incidence_dead": 0 },
            { "month": 8, "new_cases": 5846, "incidence": 3, "new_dead": 23, "incidence_dead": 0 },
            { "month": 9, "new_cases": 3707, "incidence": 2, "new_dead": 91, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2746, "incidence": 1, "new_dead": 51, "incidence_dead": 0 },
            { "month": 11, "new_cases": 8017, "incidence": 4, "new_dead": 60, "incidence_dead": 0 },
          ],
          maxCases: 8017
        },
        {
          "name": "South Sudan", "continent": "Africa", "alpha2": "ss", "population": 11193729, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 34, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 959, "incidence": 2, "new_dead": 6, "incidence_dead": 0 },
            { "month": 6, "new_cases": 1013, "incidence": 2, "new_dead": 28, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 315, "incidence": 1, "new_dead": 8, "incidence_dead": 0 },
            { "month": 8, "new_cases": 205, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 9, "new_cases": 177, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 10, "new_cases": 201, "incidence": 0, "new_dead": 9, "incidence_dead": 0 },
            { "month": 11, "new_cases": 204, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
          ],
          maxCases: 1013
        },
        {
          "name": "Spain", "continent": "Europe", "alpha2": "es", "population": 46754783, "months": [
            { "month": 2, "new_cases": 44, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 95878, "incidence": 51, "new_dead": 8463, "incidence_dead": 4.5 },
            { "month": 4, "new_cases": 117512, "incidence": 63, "new_dead": 16079, "incidence_dead": 8.6 },
            { "month": 5, "new_cases": 26044, "incidence": 14, "new_dead": 2584, "incidence_dead": 1.4 },
            { "month": 6, "new_cases": 9792, "incidence": 5, "new_dead": 1228, "incidence_dead": 0.7 },
            { "month": 7, "new_cases": 39251, "incidence": 21, "new_dead": 90, "incidence_dead": 0 },
            { "month": 8, "new_cases": 174336, "incidence": 93, "new_dead": 649, "incidence_dead": 0.3 },
            { "month": 9, "new_cases": 306330, "incidence": 164, "new_dead": 2697, "incidence_dead": 1.4 },
            { "month": 10, "new_cases": 416490, "incidence": 223, "new_dead": 4087, "incidence_dead": 2.2 },
            { "month": 11, "new_cases": 462509, "incidence": 247, "new_dead": 9191, "incidence_dead": 4.9 },
          ],
          maxCases: 462509
        },
        {
          "name": "Sri Lanka", "continent": "Asia", "alpha2": "lk", "population": 21413250, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 142, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 520, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 5, "new_cases": 970, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 6, "new_cases": 414, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 768, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 234, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 9, "new_cases": 331, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 7283, "incidence": 9, "new_dead": 7, "incidence_dead": 0 },
            { "month": 11, "new_cases": 13324, "incidence": 16, "new_dead": 98, "incidence_dead": 0.1 },
          ],
          maxCases: 13324
        },
        {
          "name": "Sudan", "continent": "Africa", "alpha2": "sd", "population": 43849269, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 6, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 435, "incidence": 0, "new_dead": 29, "incidence_dead": 0 },
            { "month": 5, "new_cases": 4584, "incidence": 3, "new_dead": 255, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 4231, "incidence": 2, "new_dead": 286, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 2387, "incidence": 1, "new_dead": 174, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 1545, "incidence": 1, "new_dead": 77, "incidence_dead": 0 },
            { "month": 9, "new_cases": 451, "incidence": 0, "new_dead": 13, "incidence_dead": 0 },
            { "month": 10, "new_cases": 164, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 11, "new_cases": 4006, "incidence": 2, "new_dead": 412, "incidence_dead": 0.2 },
          ],
          maxCases: 4584
        },
        {
          "name": "Suriname", "continent": "South America", "alpha2": "sr", "population": 586634, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 8, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 13, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 492, "incidence": 21, "new_dead": 12, "incidence_dead": 0.5 },
            { "month": 7, "new_cases": 1135, "incidence": 48, "new_dead": 13, "incidence_dead": 0.6 },
            { "month": 8, "new_cases": 2384, "incidence": 102, "new_dead": 45, "incidence_dead": 1.9 },
            { "month": 9, "new_cases": 843, "incidence": 36, "new_dead": 33, "incidence_dead": 1.4 },
            { "month": 10, "new_cases": 326, "incidence": 14, "new_dead": 7, "incidence_dead": 0.3 },
            { "month": 11, "new_cases": 109, "incidence": 5, "new_dead": 6, "incidence_dead": 0.3 },
          ],
          maxCases: 2384
        },
        {
          "name": "Sweden", "continent": "Europe", "alpha2": "se", "population": 10099270, "months": [
            { "month": 2, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 4820, "incidence": 12, "new_dead": 384, "incidence_dead": 1 },
            { "month": 4, "new_cases": 16767, "incidence": 42, "new_dead": 2569, "incidence_dead": 6.4 },
            { "month": 5, "new_cases": 17060, "incidence": 42, "new_dead": 1719, "incidence_dead": 4.3 },
            { "month": 6, "new_cases": 29263, "incidence": 72, "new_dead": 842, "incidence_dead": 2.1 },
            { "month": 7, "new_cases": 9152, "incidence": 23, "new_dead": 251, "incidence_dead": 0.6 },
            { "month": 8, "new_cases": 7303, "incidence": 18, "new_dead": 42, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 8484, "incidence": 21, "new_dead": 85, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 31492, "incidence": 78, "new_dead": 84, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 118774, "incidence": 294, "new_dead": 704, "incidence_dead": 1.7 },
          ],
          maxCases: 118774
        },
        {
          "name": "Switzerland", "continent": "Europe", "alpha2": "ch", "population": 8654618, "months": [
            { "month": 2, "new_cases": 17, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 16587, "incidence": 48, "new_dead": 432, "incidence_dead": 1.2 },
            { "month": 4, "new_cases": 12981, "incidence": 37, "new_dead": 1304, "incidence_dead": 3.8 },
            { "month": 5, "new_cases": 1276, "incidence": 4, "new_dead": 183, "incidence_dead": 0.5 },
            { "month": 6, "new_cases": 852, "incidence": 2, "new_dead": 43, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 3518, "incidence": 10, "new_dead": 18, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 6945, "incidence": 20, "new_dead": 25, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 11105, "incidence": 32, "new_dead": 68, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 100969, "incidence": 292, "new_dead": 223, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 172821, "incidence": 499, "new_dead": 2518, "incidence_dead": 7.3 },
          ],
          maxCases: 172821
        },
        {
          "name": "Tajikistan", "continent": "Asia", "alpha2": "tj", "population": 9537642, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 3915, "incidence": 10, "new_dead": 45, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 1970, "incidence": 5, "new_dead": 5, "incidence_dead": 0 },
            { "month": 7, "new_cases": 1509, "incidence": 4, "new_dead": 8, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1174, "incidence": 3, "new_dead": 8, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1186, "incidence": 3, "new_dead": 8, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1248, "incidence": 3, "new_dead": 6, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1177, "incidence": 3, "new_dead": 4, "incidence_dead": 0 },
          ],
          maxCases: 3915
        },
        {
          "name": "Tanzania", "continent": "Africa", "alpha2": "tz", "population": 59734213, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 18, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 461, "incidence": 0, "new_dead": 15, "incidence_dead": 0 },
            { "month": 5, "new_cases": 29, "incidence": 0, "new_dead": 5, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 461
        },
        {
          "name": "Thailand", "continent": "Asia", "alpha2": "th", "population": 69799978, "months": [
            { "month": 2, "new_cases": 23, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 1609, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1303, "incidence": 0, "new_dead": 44, "incidence_dead": 0 },
            { "month": 5, "new_cases": 127, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 6, "new_cases": 90, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 139, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 107, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 152, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 215, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 224, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
          ],
          maxCases: 1609
        },
        {
          "name": "Timor", "continent": "Asia", "alpha2": "tl", "population": 1318442, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 23, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 3, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 2, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 23
        },
        {
          "name": "Togo", "continent": "Africa", "alpha2": "tg", "population": 8278737, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 33, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 82, "incidence": 0, "new_dead": 8, "incidence_dead": 0 },
            { "month": 5, "new_cases": 326, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 6, "new_cases": 208, "incidence": 1, "new_dead": 1, "incidence_dead": 0 },
            { "month": 7, "new_cases": 291, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 8, "new_cases": 459, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 9, "new_cases": 384, "incidence": 1, "new_dead": 20, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 547, "incidence": 2, "new_dead": 9, "incidence_dead": 0 },
            { "month": 11, "new_cases": 643, "incidence": 2, "new_dead": 7, "incidence_dead": 0 },
          ],
          maxCases: 643
        },
        {
          "name": "Trinidad and Tobago", "continent": "North America", "alpha2": "tt", "population": 1399491, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 85, "incidence": 2, "new_dead": 2, "incidence_dead": 0 },
            { "month": 4, "new_cases": 29, "incidence": 1, "new_dead": 5, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 1, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 13, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 39, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1590, "incidence": 28, "new_dead": 14, "incidence_dead": 0.3 },
            { "month": 9, "new_cases": 2772, "incidence": 50, "new_dead": 54, "incidence_dead": 1 },
            { "month": 10, "new_cases": 1161, "incidence": 21, "new_dead": 32, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 977, "incidence": 17, "new_dead": 12, "incidence_dead": 0.2 },
          ],
          maxCases: 2772
        },
        {
          "name": "Tunisia", "continent": "Africa", "alpha2": "tn", "population": 11818618, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 393, "incidence": 1, "new_dead": 9, "incidence_dead": 0 },
            { "month": 4, "new_cases": 600, "incidence": 1, "new_dead": 31, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 83, "incidence": 0, "new_dead": 7, "incidence_dead": 0 },
            { "month": 6, "new_cases": 97, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 7, "new_cases": 361, "incidence": 1, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 2268, "incidence": 5, "new_dead": 27, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 14610, "incidence": 31, "new_dead": 188, "incidence_dead": 0.4 },
            { "month": 10, "new_cases": 41400, "incidence": 88, "new_dead": 1052, "incidence_dead": 2.2 },
            { "month": 11, "new_cases": 36956, "incidence": 78, "new_dead": 1943, "incidence_dead": 4.1 },
          ],
          maxCases: 41400
        },
        {
          "name": "Turkey", "continent": "Asia", "alpha2": "tr", "population": 84339067, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 13530, "incidence": 4, "new_dead": 213, "incidence_dead": 0.1 },
            { "month": 4, "new_cases": 106673, "incidence": 32, "new_dead": 2960, "incidence_dead": 0.9 },
            { "month": 5, "new_cases": 43738, "incidence": 13, "new_dead": 1366, "incidence_dead": 0.4 },
            { "month": 6, "new_cases": 35964, "incidence": 11, "new_dead": 591, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 30967, "incidence": 9, "new_dead": 560, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 39260, "incidence": 12, "new_dead": 679, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 48530, "incidence": 14, "new_dead": 1825, "incidence_dead": 0.5 },
            { "month": 10, "new_cases": 56704, "incidence": 17, "new_dead": 2057, "incidence_dead": 0.6 },
            { "month": 11, "new_cases": 263480, "incidence": 78, "new_dead": 3494, "incidence_dead": 1 },
          ],
          maxCases: 263480
        },
        {
          "name": "Uganda", "continent": "Africa", "alpha2": "ug", "population": 45741000, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 43, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 39, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 334, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 472, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 265, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 8, "new_cases": 1818, "incidence": 1, "new_dead": 29, "incidence_dead": 0 },
            { "month": 9, "new_cases": 5157, "incidence": 3, "new_dead": 43, "incidence_dead": 0 },
            { "month": 10, "new_cases": 4366, "incidence": 2, "new_dead": 36, "incidence_dead": 0 },
            { "month": 11, "new_cases": 7964, "incidence": 4, "new_dead": 94, "incidence_dead": 0.1 },
          ],
          maxCases: 7964
        },
        {
          "name": "Ukraine", "continent": "Europe", "alpha2": "ua", "population": 43733759, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 644, "incidence": 0, "new_dead": 16, "incidence_dead": 0 },
            { "month": 4, "new_cases": 9761, "incidence": 6, "new_dead": 244, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 13266, "incidence": 8, "new_dead": 447, "incidence_dead": 0.3 },
            { "month": 6, "new_cases": 21582, "incidence": 12, "new_dead": 465, "incidence_dead": 0.3 },
            { "month": 7, "new_cases": 26150, "incidence": 15, "new_dead": 544, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 52728, "incidence": 30, "new_dead": 888, "incidence_dead": 0.5 },
            { "month": 9, "new_cases": 90314, "incidence": 52, "new_dead": 1616, "incidence_dead": 0.9 },
            { "month": 10, "new_cases": 184884, "incidence": 106, "new_dead": 3178, "incidence_dead": 1.8 },
            { "month": 11, "new_cases": 353013, "incidence": 202, "new_dead": 5332, "incidence_dead": 3 },
          ],
          maxCases: 353013
        },
        {
          "name": "United Arab Emirates", "continent": "Asia", "alpha2": "ae", "population": 9890400, "months": [
            { "month": 2, "new_cases": 17, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 643, "incidence": 2, "new_dead": 4, "incidence_dead": 0 },
            { "month": 4, "new_cases": 11817, "incidence": 30, "new_dead": 99, "incidence_dead": 0.3 },
            { "month": 5, "new_cases": 22076, "incidence": 56, "new_dead": 159, "incidence_dead": 0.4 },
            { "month": 6, "new_cases": 14110, "incidence": 36, "new_dead": 51, "incidence_dead": 0.1 },
            { "month": 7, "new_cases": 11839, "incidence": 30, "new_dead": 36, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 9725, "incidence": 25, "new_dead": 33, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 23959, "incidence": 61, "new_dead": 35, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 38439, "incidence": 97, "new_dead": 76, "incidence_dead": 0.2 },
            { "month": 11, "new_cases": 36231, "incidence": 92, "new_dead": 77, "incidence_dead": 0.2 },
          ],
          maxCases: 38439
        },
        {
          "name": "United Kingdom", "continent": "Europe", "alpha2": "gb", "population": 67886004, "months": [
            { "month": 2, "new_cases": 59, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 38754, "incidence": 14, "new_dead": 2456, "incidence_dead": 0.9 },
            { "month": 4, "new_cases": 139956, "incidence": 52, "new_dead": 24297, "incidence_dead": 8.9 },
            { "month": 5, "new_cases": 78768, "incidence": 29, "new_dead": 10773, "incidence_dead": 4 },
            { "month": 6, "new_cases": 27677, "incidence": 10, "new_dead": 2952, "incidence_dead": 1.1 },
            { "month": 7, "new_cases": 19577, "incidence": 7, "new_dead": 795, "incidence_dead": 0.3 },
            { "month": 8, "new_cases": 33290, "incidence": 12, "new_dead": 315, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 117763, "incidence": 43, "new_dead": 644, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 558947, "incidence": 206, "new_dead": 4412, "incidence_dead": 1.6 },
            { "month": 11, "new_cases": 618940, "incidence": 228, "new_dead": 11900, "incidence_dead": 4.4 },
          ],
          maxCases: 618940
        },
        {
          "name": "United States", "continent": "North America", "alpha2": "us", "population": 331002647, "months": [
            { "month": 2, "new_cases": 17, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 192152, "incidence": 15, "new_dead": 5277, "incidence_dead": 0.4 },
            { "month": 4, "new_cases": 884047, "incidence": 67, "new_dead": 60738, "incidence_dead": 4.6 },
            { "month": 5, "new_cases": 718241, "incidence": 54, "new_dead": 41703, "incidence_dead": 3.1 },
            { "month": 6, "new_cases": 842906, "incidence": 64, "new_dead": 20112, "incidence_dead": 1.5 },
            { "month": 7, "new_cases": 1915966, "incidence": 145, "new_dead": 26446, "incidence_dead": 2 },
            { "month": 8, "new_cases": 1463760, "incidence": 111, "new_dead": 29532, "incidence_dead": 2.2 },
            { "month": 9, "new_cases": 1202896, "incidence": 91, "new_dead": 23418, "incidence_dead": 1.8 },
            { "month": 10, "new_cases": 1917201, "incidence": 145, "new_dead": 23974, "incidence_dead": 1.8 },
            { "month": 11, "new_cases": 4462302, "incidence": 337, "new_dead": 36964, "incidence_dead": 2.8 },
          ],
          maxCases: 4462302
        },
        {
          "name": "Uruguay", "continent": "South America", "alpha2": "uy", "population": 3473727, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 334, "incidence": 2, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 305, "incidence": 2, "new_dead": 16, "incidence_dead": 0.1 },
            { "month": 5, "new_cases": 180, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 6, "new_cases": 113, "incidence": 1, "new_dead": 5, "incidence_dead": 0 },
            { "month": 7, "new_cases": 328, "incidence": 2, "new_dead": 8, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 331, "incidence": 2, "new_dead": 9, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 451, "incidence": 3, "new_dead": 4, "incidence_dead": 0 },
            { "month": 10, "new_cases": 1078, "incidence": 8, "new_dead": 10, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 2733, "incidence": 20, "new_dead": 19, "incidence_dead": 0.1 },
          ],
          maxCases: 2733
        },
        {
          "name": "Uzbekistan", "continent": "Asia", "alpha2": "uz", "population": 33469199, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 171, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 4, "new_cases": 1867, "incidence": 1, "new_dead": 7, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1584, "incidence": 1, "new_dead": 6, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4880, "incidence": 4, "new_dead": 11, "incidence_dead": 0 },
            { "month": 7, "new_cases": 15506, "incidence": 12, "new_dead": 115, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 17884, "incidence": 13, "new_dead": 179, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 14824, "incidence": 11, "new_dead": 150, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 10215, "incidence": 8, "new_dead": 96, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 6162, "incidence": 5, "new_dead": 44, "incidence_dead": 0 },
          ],
          maxCases: 17884
        },
        {
          "name": "Vanuatu", "continent": "Oceania", "alpha2": "vu", "population": 307150, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 9, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 10, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 0
        },
        {
          "name": "Venezuela", "continent": "South America", "alpha2": "ve", "population": 28435943, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 133, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 4, "new_cases": 198, "incidence": 0, "new_dead": 13, "incidence_dead": 0 },
            { "month": 5, "new_cases": 1177, "incidence": 1, "new_dead": -2, "incidence_dead": 0 },
            { "month": 6, "new_cases": 4322, "incidence": 4, "new_dead": 37, "incidence_dead": 0 },
            { "month": 7, "new_cases": 12742, "incidence": 11, "new_dead": 113, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 28154, "incidence": 25, "new_dead": 222, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 28394, "incidence": 25, "new_dead": 242, "incidence_dead": 0.2 },
            { "month": 10, "new_cases": 16891, "incidence": 15, "new_dead": 170, "incidence_dead": 0.1 },
            { "month": 11, "new_cases": 10381, "incidence": 9, "new_dead": 99, "incidence_dead": 0.1 },
          ],
          maxCases: 28394
        },
        {
          "name": "Vietnam", "continent": "Asia", "alpha2": "vn", "population": 97338583, "months": [
            { "month": 2, "new_cases": 14, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 196, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 58, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 58, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 27, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 7, "new_cases": 203, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 8, "new_cases": 486, "incidence": 0, "new_dead": 31, "incidence_dead": 0 },
            { "month": 9, "new_cases": 50, "incidence": 0, "new_dead": 1, "incidence_dead": 0 },
            { "month": 10, "new_cases": 86, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 11, "new_cases": 167, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
          ],
          maxCases: 486
        },
        {
          "name": "Yemen", "continent": "Asia", "alpha2": "ye", "population": 29825968, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 5, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 5, "new_cases": 317, "incidence": 0, "new_dead": 78, "incidence_dead": 0.1 },
            { "month": 6, "new_cases": 835, "incidence": 1, "new_dead": 232, "incidence_dead": 0.2 },
            { "month": 7, "new_cases": 570, "incidence": 0, "new_dead": 181, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 230, "incidence": 0, "new_dead": 73, "incidence_dead": 0.1 },
            { "month": 9, "new_cases": 76, "incidence": 0, "new_dead": 21, "incidence_dead": 0 },
            { "month": 10, "new_cases": 29, "incidence": 0, "new_dead": 12, "incidence_dead": 0 },
            { "month": 11, "new_cases": 128, "incidence": 0, "new_dead": 20, "incidence_dead": 0 },
          ],
          maxCases: 835
        },
        {
          "name": "Zambia", "continent": "Africa", "alpha2": "zm", "population": 18383956, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 33, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 71, "incidence": 0, "new_dead": 2, "incidence_dead": 0 },
            { "month": 5, "new_cases": 951, "incidence": 1, "new_dead": 4, "incidence_dead": 0 },
            { "month": 6, "new_cases": 537, "incidence": 1, "new_dead": 17, "incidence_dead": 0 },
            { "month": 7, "new_cases": 4369, "incidence": 6, "new_dead": 127, "incidence_dead": 0.2 },
            { "month": 8, "new_cases": 6134, "incidence": 8, "new_dead": 137, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 2662, "incidence": 4, "new_dead": 44, "incidence_dead": 0.1 },
            { "month": 10, "new_cases": 1673, "incidence": 2, "new_dead": 17, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1215, "incidence": 2, "new_dead": 8, "incidence_dead": 0 },
          ],
          maxCases: 6134
        },
        {
          "name": "Zimbabwe", "continent": "Africa", "alpha2": "zw", "population": 14862927, "months": [
            { "month": 2, "new_cases": 0, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 3, "new_cases": 7, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 4, "new_cases": 32, "incidence": 0, "new_dead": 3, "incidence_dead": 0 },
            { "month": 5, "new_cases": 138, "incidence": 0, "new_dead": 0, "incidence_dead": 0 },
            { "month": 6, "new_cases": 413, "incidence": 1, "new_dead": 3, "incidence_dead": 0 },
            { "month": 7, "new_cases": 2578, "incidence": 4, "new_dead": 60, "incidence_dead": 0.1 },
            { "month": 8, "new_cases": 3328, "incidence": 6, "new_dead": 135, "incidence_dead": 0.2 },
            { "month": 9, "new_cases": 1341, "incidence": 2, "new_dead": 26, "incidence_dead": 0 },
            { "month": 10, "new_cases": 529, "incidence": 1, "new_dead": 15, "incidence_dead": 0 },
            { "month": 11, "new_cases": 1583, "incidence": 3, "new_dead": 33, "incidence_dead": 0.1 },
          ],
          maxCases: 3328
        },
      ];
