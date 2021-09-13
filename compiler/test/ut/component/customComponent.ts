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

export const source: string = `
@Entry
@Component
struct Parent {
    public regularToState: string = 'regularToState'
    @State stateToProp: string = 'stateToProp'
    public regularToRegular: string = 'regularToRegular'
    @State stateToLink: string = 'stateToLink'
    build() {
        Row() {
            Child({ stateProperty: this.regularToState,
                    propProperty: this.stateToProp,
                    regularProperty: this.regularToRegular,
                    linkProperty: this.$stateToLink
                })
        }
    }
}

@Component
struct Child {
    @State stateProperty: string = 'state'
    @Prop propProperty: string
    public regularProperty: string = 'regular'
    @Link linkProperty: string
    build() {
        Column() {}
    }
}
`

export const expectResult: string =
`class Parent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.regularToState = 'regularToState';
        this.__stateToProp = new ObservedPropertySimple('stateToProp', this, "stateToProp");
        this.regularToRegular = 'regularToRegular';
        this.__stateToLink = new ObservedPropertySimple('stateToLink', this, "stateToLink");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.regularToState !== undefined) {
            this.regularToState = params.regularToState;
        }
        if (params.stateToProp !== undefined) {
            this.stateToProp = params.stateToProp;
        }
        if (params.regularToRegular !== undefined) {
            this.regularToRegular = params.regularToRegular;
        }
        if (params.stateToLink !== undefined) {
            this.stateToLink = params.stateToLink;
        }
    }
    aboutToBeDeleted() {
        this.__stateToProp.aboutToBeDeleted();
        this.__stateToLink.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get stateToProp() {
        return this.__stateToProp.get();
    }
    set stateToProp(newValue) {
        this.__stateToProp.set(newValue);
    }
    get stateToLink() {
        return this.__stateToLink.get();
    }
    set stateToLink(newValue) {
        this.__stateToLink.set(newValue);
    }
    render() {
        Row.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new Child("2", this, { stateProperty: this.regularToState,
                propProperty: this.stateToProp,
                regularProperty: this.regularToRegular,
                linkProperty: this.__stateToLink
            }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({
                stateProperty: this.regularToState,
                propProperty: this.stateToProp,
                regularProperty: this.regularToRegular
            });
            View.create(earlierCreatedChild_2);
        }
        Row.pop();
    }
}
class Child extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__stateProperty = new ObservedPropertySimple('state', this, "stateProperty");
        this.__propProperty = new SynchedPropertySimpleOneWay(params.propProperty, this, "propProperty");
        this.regularProperty = 'regular';
        this.__linkProperty = new SynchedPropertySimpleTwoWay(params.linkProperty, this, "linkProperty");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.stateProperty !== undefined) {
            this.stateProperty = params.stateProperty;
        }
        this.propProperty = params.propProperty;
        if (params.regularProperty !== undefined) {
            this.regularProperty = params.regularProperty;
        }
    }
    aboutToBeDeleted() {
        this.__stateProperty.aboutToBeDeleted();
        this.__propProperty.aboutToBeDeleted();
        this.__linkProperty.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get stateProperty() {
        return this.__stateProperty.get();
    }
    set stateProperty(newValue) {
        this.__stateProperty.set(newValue);
    }
    get propProperty() {
        return this.__propProperty.get();
    }
    set propProperty(newValue) {
        this.__propProperty.set(newValue);
    }
    get linkProperty() {
        return this.__linkProperty.get();
    }
    set linkProperty(newValue) {
        this.__linkProperty.set(newValue);
    }
    render() {
        Column.create();
        Column.pop();
    }
}
loadDocument(new Parent("1", undefined, {}));
`
