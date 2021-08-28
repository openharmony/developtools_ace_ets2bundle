class MyComponent extends View {
    constructor() {
        super();
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
        console.info('into constructor');
    }
    render() { return new Column(new Text(this.value1), new Text(this.value2), new Text(this.value3)); }
}
loadDocument(new MyComponent());
