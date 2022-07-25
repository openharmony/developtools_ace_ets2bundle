/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
@Component
struct PropComponent {
  @Prop counter: string
  build() {
    Text(this.counter)
  }
}

@Entry
@Component
struct ParentComponent {
  @State value: string = 'first init content';
  build() {
    Column() {
      PropComponent({counter: this.value})
    }
  }
}
`
exports.expectResult =
`class PropComponent extends View {
    constructor(parent, params) {
        super(parent);
        this.__counter = new SynchedPropertySimpleOneWay(params.counter, this, "counter");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
    }
    setStateSourcePropertiesUnchanged() {
    }
    setOneWaySyncPropertiesUnchanged() {
        this.__counter.SetPropertyUnchanged();
    }
    setTwoWaySyncPropertiesUnchanged() {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__counter.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__counter.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get counter() {
        return this.__counter.get();
    }
    set counter(newValue) {
        this.__counter.set(newValue);
    }
    render() {
        Text.create(this.counter);
        Text.pop();
    }
    rerender() {
        this.__counter.markDependentElementsDirty(this);
        this.updateDirtyElements();
    }
}
class ParentComponent extends View {
    constructor(parent, params) {
        super(parent);
        this.__value = new ObservedPropertySimple('first init content', this, "value");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.value !== undefined) {
            this.value = params.value;
        }
    }
    setStateSourcePropertiesUnchanged() {
        this.__value.SetPropertyUnchanged();
    }
    setOneWaySyncPropertiesUnchanged() {
    }
    setTwoWaySyncPropertiesUnchanged() {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get value() {
        return this.__value.get();
    }
    set value(newValue) {
        this.__value.set(newValue);
    }
    render() {
        Column.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new PropComponent("2", this, { counter: this.__value }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({
                counter: this.__value
            });
            View.create(earlierCreatedChild_2);
        }
        Column.pop();
    }
    rerender() {
        this.__value.markDependentElementsDirty(this);
        this.updateDirtyElements();
    }
}
loadDocument(new ParentComponent("1", undefined, {}));
`