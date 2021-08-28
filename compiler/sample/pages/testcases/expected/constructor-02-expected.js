class MyLinkComponent extends View {
    constructor(inputParams) {
        super();
        this.myVar = 0;
        Object.assign(this, inputParams);
        this.createLink("myState1");
        this.createLink("myState2");
        this.createLink("myState3");
        this.createLink("myState4");
    }
    render() {
    }
}
loadDocument(new MyLinkComponent());
