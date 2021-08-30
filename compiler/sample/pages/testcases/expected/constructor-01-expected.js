class MyStateComponent extends View {
    constructor(inputParams) {
        super();
        this.myState1 = { count: 0 };
        this.myState2 = 0;
        this.myState3 = false;
        this.myState4 = 'Home';
        this.myVar = 0;
        Object.assign(this, inputParams);
        this.createState("myState1");
        this.createState("myState2");
        this.createState("myState3");
        this.createState("myState4");
    }
    render() {
    }
}
loadDocument(new MyStateComponent());
