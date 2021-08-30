class MyComponent extends View {
    constructor(value1 = "hello world 1", value2 = "hello world 2", value3 = "hello world 3") {
        super();
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
    }
    render() { return new Column(new Text(this.value1), new Text(this.value2), new Text(this.value3)); }
}
loadDocument(new MyComponent());
