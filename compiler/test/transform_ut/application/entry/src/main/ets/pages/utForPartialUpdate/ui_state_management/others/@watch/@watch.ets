@Entry
@Component
struct CompA {
  @State @Watch("onBasketUpdated") shopBasket: Array<number> = [ 7, 12, 47, 3 ];
  @State totalPurchase: number = 0;
  @State @Watch('onPutItem') defArray: Array<string> = ['c', 'g', 't', 'z'];
  @State resultTip: string = '';

  updateTotal() : number {
    let sum = 0;
    this.shopBasket.forEach((i) => { sum += i; });
    this.totalPurchase = (sum < 100) ? sum : 0.9 * sum;
    return this.totalPurchase;
  }

  onBasketUpdated(propName: string) : void {
    animateTo({duration: 1000}, () => {
      this.updateTotal();
    })
  }

  updateTip() : string {
    let tempArray = this.defArray.slice(0, -1);
    let addItem = this.defArray[this.defArray.length -1];
    this.resultTip = tempArray.includes(addItem) ?
      'add item invalid' :
      'congratulations! add item success';
    return this.resultTip;
  }

  onPutItem(propName: string) : void {
    this.updateTip();
  }

  build() {
    Column(){
      Button("add to basket").onClick(() => {
        this.shopBasket.push(Math.round(100 * Math.random()))
      })
      Text('totalPurchase: ' + this.totalPurchase).fontSize(20)
      Button("put item").onClick(() => {
        let alList = 'abcdefghijklmnopqrstuvwxyz';
        let ranItem = alList[Math.floor(Math.random() * 26)];
        this.defArray.push(ranItem)
      })
      Text('tips: ' + this.resultTip).fontSize(20)
    }
  }
}