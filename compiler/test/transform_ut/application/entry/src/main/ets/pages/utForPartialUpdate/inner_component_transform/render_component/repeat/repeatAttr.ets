@ObservedV2
class VehicleData {
  @Trace name: string;
  @Trace price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}

@ObservedV2
class VehicleDB {
  public vehicleItems: VehicleData[] = [];

  constructor() {

  }
}

@Entry
@ComponentV2
struct entryCompSucc {
  @Local vehicleItems: VehicleData[] = new VehicleDB().vehicleItems;

  build() {
    Column() {
      List() {
        Repeat(this.vehicleItems)
          .template('default', ((((ri) => {
           Text('11111111111')
          }))), { cachedCount: 5 })
          .each(((ri) => {
            ListItem() {
              Text("Wrong")

            }.border({ width: 1 })
          }))
          .key((item, index) => 'index')
      }

      }
    }
}