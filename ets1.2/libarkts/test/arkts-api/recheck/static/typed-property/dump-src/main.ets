
function main() {}


interface I {
  get prop(): boolean
  set prop(prop: boolean)
  
}

class C implements I {
  public constructor() {}
  
  private _$property$_prop: boolean = true;
  public get prop(): boolean {
    return this._$property$_prop;
  }
  set prop(_$property$_prop: boolean) {
    this._$property$_prop = _$property$_prop;
    return;
  }
  
}

