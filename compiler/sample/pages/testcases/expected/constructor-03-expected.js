class MyPropComponent extends View {
    constructor(inputParams) {
        super();
        this.myVar = 0;
        Object.assign(this, inputParams);
        this.createProp("myProp1");
        this.createProp("myProp2");
        this.createProp("myProp3");
        this.createProp("myProp4");
    }
    render() {
    }
}
loadDocument(new MyPropComponent());
