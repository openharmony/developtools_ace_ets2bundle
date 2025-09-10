
function main() {}

function foo(): void {
  HasInstantiate.$_instantiate((() => {
    return new HasInstantiate();
  }), "foo");
}

function hasTrailing(first?: string, trailing?: (()=> void)): void {
  ({let gensym%%_865 = trailing;
  (((gensym%%_865) == (null)) ? undefined : gensym%%_865())});
}

function bar(zzz: string): void {
  hasTrailing("xxx");
  hasTrailing("xxx", (() => {
    const d = zzz;
  }));
}


class HasInstantiate {
  public static $_instantiate(factory: (()=> HasInstantiate), arg: string) {}
  
  public constructor() {}
  
}

