/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

exports.source =
`
import { collections } from '@kit.ArkTS';
import { UIUtils } from '@kit.ArkUI';

@Sendable
class Info {
  id: number = 0;
  name: string = 'cc';

  constructor(id: number) {
    this.id = id;
  }
}


@Entry
@ComponentV2
struct Index {
  scroller: Scroller = new Scroller();
  @Local arrCollect: collections.Array<Info> =
    UIUtils.makeObserved(new collections.Array<Info>(new Info(1), new Info(2)));

  build() {
    Column() {
      // ForEach接口仅支持Array<any>，不支持collections.Array<any>。
      // 但ForEach的实现用到的Array的API，collections.Array都有提供。所以可以使用as类型断言Array。
      // 需要注意断言并不会改变原本的数据类型。
      ForEach(this.arrCollect as object as Array<Info>, (item: Info) => {
        Text('' + item.id).onClick(() => {
          item.id++;
        })
      }, (item: Info, index) => item.id.toString() + index.toString())
      Divider()
        .color('blue')
      if (this.arrCollect.length > 0) {
        Text('the first one ' + this.arrCollect[this.arrCollect.length - this.arrCollect.length].id)
        Text('the last one ' + this.arrCollect[this.arrCollect.length - 1].id)
      }
      Divider()
        .color('blue')

      /****************************改变数据长度的api**************************/
      Scroll(this.scroller) {
        Column({space: 10}) {
          // push: 新增新元素
          Button('push').onClick(() => {
            this.arrCollect.push(new Info(30));
          })
          // pop: 删除最后一个
          Button('pop').onClick(() => {
            this.arrCollect.pop();
          })
          // shift: 删除第一个
          Button('shift').onClick(() => {
            this.arrCollect.shift();
          })
          // unshift: 在数组的开头插入新项
          Button('unshift').onClick(() => {
            this.arrCollect.unshift(new Info(50));
          })
          // splice: 从数组的指定位置删除元素
          Button('splice').onClick(() => {
            this.arrCollect.splice(1);
          })

          // shrinkTo: 将数组长度缩小到给定的长度
          Button('shrinkTo').onClick(() => {
            this.arrCollect.shrinkTo(1);
          })
          // extendTo: 将数组长度扩展到给定的长度
          Button('extendTo').onClick(() => {
            this.arrCollect.extendTo(6, new Info(20));
          })

          Divider()
            .color('blue')

          /****************************************改变数组item本身*****************/
          // sort：从大到小排序
          Button('sort').onClick(() => {
            this.arrCollect.sort((a: Info, b: Info) => b.id - a.id);
          })
          // fill: 用值填充指定部分
          Button('fill').onClick(() => {
            this.arrCollect.fill(new Info(5), 0, 2);
          })

          /*****************************不会改变数组本身API***************************/
          // slice：返回新的数组，根据start end对原数组的拷贝，不会改变原数组，所以直接调用slice不会触发UI刷新
          // 可以构建用例为返回的浅拷贝的数据赋值给this.arrCollect,需要注意这里依然要调用makeObserved，否则this.arr被普通变量赋值后，会丧失观察能力
          Button('slice').onClick(() => {
            this.arrCollect = UIUtils.makeObserved(this.arrCollect.slice(0, 1));
          })
          // map：原理同上
          Button('map').onClick(() => {
            this.arrCollect = UIUtils.makeObserved(this.arrCollect.map((value) => {
              value.id += 10;
              return value;
            }))
          })
          // filter：原理同上
          Button('filter').onClick(() => {
            this.arrCollect = UIUtils.makeObserved(this.arrCollect.filter((value: Info) => value.id % 2 === 0));
          })

          // concat：原理同上
          Button('concat').onClick(() => {
            let array1 = new collections.Array(new Info(100))
            this.arrCollect = UIUtils.makeObserved(this.arrCollect.concat(array1));
          })
        }.height('200%')
      }.height('60%')
    }
    .height('100%')
    .width('100%')
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
import collections from "@ohos:arkts.collections";
import { UIUtils as UIUtils } from "@ohos:arkui.StateManagement";
class Info {
    id: number = 0;
    name: string = 'cc';
    constructor(id: number) {
        "use sendable";
        this.id = id;
    }
}
class Index extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.scroller = new Scroller();
        this.arrCollect = UIUtils.makeObserved(new collections.Array<Info>(new Info(1), new Info(2)));
        this.finalizeConstruction();
    }
    public resetStateVarsOnReuse(params: Object): void {
        this.arrCollect = UIUtils.makeObserved(new collections.Array<Info>(new Info(1), new Info(2)));
    }
    scroller: Scroller;
    @Local
    arrCollect: collections.Array<Info>;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ForEach接口仅支持Array<any>，不支持collections.Array<any>。
            // 但ForEach的实现用到的Array的API，collections.Array都有提供。所以可以使用as类型断言Array。
            // 需要注意断言并不会改变原本的数据类型。
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('' + item.id);
                    Text.onClick(() => {
                        item.id++;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.arrCollect as object as Array<Info>, forEachItemGenFunction, (item: Info, index) => item.id.toString() + index.toString(), false, true);
        }, ForEach);
        // ForEach接口仅支持Array<any>，不支持collections.Array<any>。
        // 但ForEach的实现用到的Array的API，collections.Array都有提供。所以可以使用as类型断言Array。
        // 需要注意断言并不会改变原本的数据类型。
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('blue');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.arrCollect.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('the first one ' + this.arrCollect[this.arrCollect.length - this.arrCollect.length].id);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('the last one ' + this.arrCollect[this.arrCollect.length - 1].id);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('blue');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            /****************************改变数据长度的api**************************/
            Scroll.create(this.scroller);
            /****************************改变数据长度的api**************************/
            Scroll.height('60%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.height('200%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // push: 新增新元素
            Button.createWithLabel('push');
            // push: 新增新元素
            Button.onClick(() => {
                this.arrCollect.push(new Info(30));
            });
        }, Button);
        // push: 新增新元素
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // pop: 删除最后一个
            Button.createWithLabel('pop');
            // pop: 删除最后一个
            Button.onClick(() => {
                this.arrCollect.pop();
            });
        }, Button);
        // pop: 删除最后一个
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // shift: 删除第一个
            Button.createWithLabel('shift');
            // shift: 删除第一个
            Button.onClick(() => {
                this.arrCollect.shift();
            });
        }, Button);
        // shift: 删除第一个
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // unshift: 在数组的开头插入新项
            Button.createWithLabel('unshift');
            // unshift: 在数组的开头插入新项
            Button.onClick(() => {
                this.arrCollect.unshift(new Info(50));
            });
        }, Button);
        // unshift: 在数组的开头插入新项
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // splice: 从数组的指定位置删除元素
            Button.createWithLabel('splice');
            // splice: 从数组的指定位置删除元素
            Button.onClick(() => {
                this.arrCollect.splice(1);
            });
        }, Button);
        // splice: 从数组的指定位置删除元素
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // shrinkTo: 将数组长度缩小到给定的长度
            Button.createWithLabel('shrinkTo');
            // shrinkTo: 将数组长度缩小到给定的长度
            Button.onClick(() => {
                this.arrCollect.shrinkTo(1);
            });
        }, Button);
        // shrinkTo: 将数组长度缩小到给定的长度
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // extendTo: 将数组长度扩展到给定的长度
            Button.createWithLabel('extendTo');
            // extendTo: 将数组长度扩展到给定的长度
            Button.onClick(() => {
                this.arrCollect.extendTo(6, new Info(20));
            });
        }, Button);
        // extendTo: 将数组长度扩展到给定的长度
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('blue');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            /****************************************改变数组item本身*****************/
            // sort：从大到小排序
            Button.createWithLabel('sort');
            /****************************************改变数组item本身*****************/
            // sort：从大到小排序
            Button.onClick(() => {
                this.arrCollect.sort((a: Info, b: Info) => b.id - a.id);
            });
        }, Button);
        /****************************************改变数组item本身*****************/
        // sort：从大到小排序
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // fill: 用值填充指定部分
            Button.createWithLabel('fill');
            // fill: 用值填充指定部分
            Button.onClick(() => {
                this.arrCollect.fill(new Info(5), 0, 2);
            });
        }, Button);
        // fill: 用值填充指定部分
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            /*****************************不会改变数组本身API***************************/
            // slice：返回新的数组，根据start end对原数组的拷贝，不会改变原数组，所以直接调用slice不会触发UI刷新
            // 可以构建用例为返回的浅拷贝的数据赋值给this.arrCollect,需要注意这里依然要调用makeObserved，否则this.arr被普通变量赋值后，会丧失观察能力
            Button.createWithLabel('slice');
            /*****************************不会改变数组本身API***************************/
            // slice：返回新的数组，根据start end对原数组的拷贝，不会改变原数组，所以直接调用slice不会触发UI刷新
            // 可以构建用例为返回的浅拷贝的数据赋值给this.arrCollect,需要注意这里依然要调用makeObserved，否则this.arr被普通变量赋值后，会丧失观察能力
            Button.onClick(() => {
                this.arrCollect = UIUtils.makeObserved(this.arrCollect.slice(0, 1));
            });
        }, Button);
        /*****************************不会改变数组本身API***************************/
        // slice：返回新的数组，根据start end对原数组的拷贝，不会改变原数组，所以直接调用slice不会触发UI刷新
        // 可以构建用例为返回的浅拷贝的数据赋值给this.arrCollect,需要注意这里依然要调用makeObserved，否则this.arr被普通变量赋值后，会丧失观察能力
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // map：原理同上
            Button.createWithLabel('map');
            // map：原理同上
            Button.onClick(() => {
                this.arrCollect = UIUtils.makeObserved(this.arrCollect.map((value) => {
                    value.id += 10;
                    return value;
                }));
            });
        }, Button);
        // map：原理同上
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // filter：原理同上
            Button.createWithLabel('filter');
            // filter：原理同上
            Button.onClick(() => {
                this.arrCollect = UIUtils.makeObserved(this.arrCollect.filter((value: Info) => value.id % 2 === 0));
            });
        }, Button);
        // filter：原理同上
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // concat：原理同上
            Button.createWithLabel('concat');
            // concat：原理同上
            Button.onClick(() => {
                let array1 = new collections.Array(new Info(100));
                this.arrCollect = UIUtils.makeObserved(this.arrCollect.concat(array1));
            });
        }, Button);
        // concat：原理同上
        Button.pop();
        Column.pop();
        /****************************改变数据长度的api**************************/
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
