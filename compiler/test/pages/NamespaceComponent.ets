@Component
struct NamespaceComponent1 {
  @Link NamespaceComponent1Link1?: any
  @Link NamespaceComponent1Link2?: number
  @Link NamespaceComponent1Link3?: boolean
  @Link NamespaceComponent1Link4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

@Component
struct NamespaceComponent2 {
  @Link NamespaceComponent2Link1?: any
  @Link NamespaceComponent2Link2?: number
  @Link NamespaceComponent2Link3?: boolean
  @Link NamespaceComponent2Link4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

@Component
struct NamespaceComponent3 {
  @Link NamespaceComponent3Link1?: any
  @Link NamespaceComponent3Link2?: number
  @Link NamespaceComponent3Link3?: boolean
  @Link NamespaceComponent3Link4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

export { NamespaceComponent1, NamespaceComponent2 }

export default NamespaceComponent3
