class MyLinkTestComponent extends View {
    constructor(inputParams) {
        super();
        this.myVar = 0;
        Object.assign(this, inputParams);
        this.createLink("myLink1");
        this.createLink("myLink2");
        this.createLink("myLink3");
        this.createLink("myLink4");
    }
    render() {
    }
}
class LinkTest extends View {
    constructor(inputParams) {
        super();
        this.myState1 = { count: 0 };
        this.myState2 = 0;
        this.myState3 = false;
        this.myState4 = 'Home';
        Object.assign(this, inputParams);
        this.createState("myState1");
        this.createState("myState2");
        this.createState("myState3");
        this.createState("myState4");
    }
    render() { return new Row(new MyLinkTestComponent({
        myLink1: createLinkReference(this, "myState1"),
        myLink2: createLinkReference(this, "myState2"),
        myLink3: createLinkReference(this, "myState3"),
        myLink4: createLinkReference(this, "myState4"),
        myVar: 100,
        myVar2: 100,
    })); }
}
loadDocument(new LinkTest());
