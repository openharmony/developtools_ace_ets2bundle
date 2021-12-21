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

exports.source = `
class PurchaseItem {
  static NextId : number = 0;

  public id: number;
  public price: number;

  constructor(price : number) {
    this.id = PurchaseItem.NextId++;
    this.price = price;
  }
}

@Component
struct BasketViewer {
    @Link @Watch("onBasketUpdated") shopBasket : PurchaseItem[];
    @State  @Watch('updateTotal') totalPurchase : number = this.updateTotal();
    updateTotal() : number {
      let sum = 0;
      this.shopBasket.forEach((i) => { sum += i.price; });
      this.totalPurchase = (sum < 100) ? sum : 0.9 * sum;
      return this.totalPurchase;
    }
    // @Watch cb
    onBasketUpdated(propName: string) : void {
      this.updateTotal();
    }
    build() {
      Column() {
        ForEach(this.shopBasket,
          (item) => {
            Text(item.price)
          },
          item => item.id.toString()
        )
        Text('this.totalPurchase')
      }
    }
}

@Entry
@Component
struct BasketModifier {
    @State shopBasket : PurchaseItem[] = [ ];
    build() {
      Column() {
        Button("add to basket")
          .onClick(() => { this.shopBasket.push(new PurchaseItem(Math.round(100 * Math.random()))) })
        BasketViewer({shopBasket: this.$shopBasket})
      }
    }
}`

exports.expectResult =
`class PurchaseItem {
    constructor(price) {
        this.id = PurchaseItem.NextId++;
        this.price = price;
    }
}
PurchaseItem.NextId = 0;
class BasketViewer extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__shopBasket = new SynchedPropertyObjectTwoWay(params.shopBasket, this, "shopBasket");
        this.__totalPurchase = new ObservedPropertySimple(this.updateTotal(), this, "totalPurchase");
        this.updateWithValueParams(params);
        this.declareWatch("shopBasket", this.onBasketUpdated);
        this.declareWatch("totalPurchase", this.updateTotal);
    }
    updateWithValueParams(params) {
        if (params.totalPurchase !== undefined) {
            this.totalPurchase = params.totalPurchase;
        }
    }
    aboutToBeDeleted() {
        this.__shopBasket.aboutToBeDeleted();
        this.__totalPurchase.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get shopBasket() {
        return this.__shopBasket.get();
    }
    set shopBasket(newValue) {
        this.__shopBasket.set(newValue);
    }
    get totalPurchase() {
        return this.__totalPurchase.get();
    }
    set totalPurchase(newValue) {
        this.__totalPurchase.set(newValue);
    }
    updateTotal() {
        let sum = 0;
        this.shopBasket.forEach((i) => { sum += i.price; });
        this.totalPurchase = (sum < 100) ? sum : 0.9 * sum;
        return this.totalPurchase;
    }
    // @Watch cb
    onBasketUpdated(propName) {
        this.updateTotal();
    }
    render() {
        Column.create();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.shopBasket), (item) => {
            Text.create(item.price);
            Text.pop();
        }, item => item.id.toString());
        ForEach.pop();
        Text.create('this.totalPurchase');
        Text.pop();
        Column.pop();
    }
}
class BasketModifier extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__shopBasket = new ObservedPropertyObject([], this, "shopBasket");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.shopBasket !== undefined) {
            this.shopBasket = params.shopBasket;
        }
    }
    aboutToBeDeleted() {
        this.__shopBasket.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get shopBasket() {
        return this.__shopBasket.get();
    }
    set shopBasket(newValue) {
        this.__shopBasket.set(newValue);
    }
    render() {
        Column.create();
        Button.createWithLabel("add to basket");
        Button.onClick(() => { this.shopBasket.push(new PurchaseItem(Math.round(100 * Math.random()))); });
        Button.pop();
        let earlierCreatedChild_3 = this.findChildById("3");
        if (earlierCreatedChild_3 == undefined) {
            View.create(new BasketViewer("3", this, { shopBasket: this.__shopBasket }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({});
            View.create(earlierCreatedChild_3);
        }
        Column.pop();
    }
}
loadDocument(new BasketModifier("1", undefined, {}));
`