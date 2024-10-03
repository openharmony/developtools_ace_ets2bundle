@Entry
@ComponentV2
@Component
struct componentV2BothWithComponent {
  build() {
    Column() {}
  }
}

@ComponentV2
@CustomDialog
struct componentV2BothWithComponent1 {
  build() {
    Column() {}
  }
}

@ComponentV2
@Reusable
struct componentV2BothWithComponent2 {
  build() {
    Column() {}
  }
}