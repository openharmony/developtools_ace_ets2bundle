@Entry
@Component
struct CompA {
  @Provide("reviewVote") reviewVotes : number = 0;
  @Provide({allowOverride: 'aliasName'}) message: string = '1111'

  build() {
    Column() {
      CompB()
      Button() {
        Text('' + this.reviewVotes)
          .fontSize(30)
      }
      .onClick(() => {
        this.reviewVotes += 1;
      })
    }
  }
}

@Component
struct CompB {
  build() {
    Column() {
      CompC()
    }
  }
}

@Component
struct CompC {
  @Consume("reviewVote") reviewVotes : number;
  build() {
    Column() {
      Button() {
        Text('' + this.reviewVotes)
          .fontSize(30)
      }
      .onClick(() => {
        this.reviewVotes += 1;
      })
    }
  }
}