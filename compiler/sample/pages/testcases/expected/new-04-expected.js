class Banner extends View {
    constructor(value1 = "hello world 2") {
        super();
        this.value1 = value1;
    }
    render() { return new Column(new Text(this.value1)); }
}
class MyComponent extends View {
    constructor(value1 = "hello world 1") {
        super();
        this.value1 = value1;
    }
    render() { return new Column(new Text(this.value1), new Banner()); }
}
loadDocument(new MyComponent());
