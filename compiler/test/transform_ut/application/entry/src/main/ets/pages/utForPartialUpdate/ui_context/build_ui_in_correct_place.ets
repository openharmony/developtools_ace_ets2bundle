function func1(){}

@Component
struct Child {
  @BuilderParam build1: ()=>void
  build() {
    Text('Child')
  }
}

@Entry
@Component
struct Parent {
  build() {
    Column() {
      ForEach([1], (item: number)=>{
        Column(){
          Child() {
            Text('example1')
          }
          Repeat([1])
            .each((repeatItem: RepeatItem<number>)=>{
              Child() {
                Text('example2')
              }
              Text('example6')
                .onClick(()=>{
                  func1()
                  {
                    let b = 1;
                  }
                })
            })
            .key((item: number)=>{
              func1()
              {
                let b = 1;
              }
              return item.toString()
            })
            .template('1', (repeatItem: RepeatItem<number>)=>{
              Child() {
                Text('example3')
              }
              Text('example4')
                .onClick(()=>{
                  func1()
                  {
                    let b = 1;
                  }
                })
            })
        }
      }, (item: number)=>{
        return item.toString()
      })
    }.onClick(()=>{
      func1()
      {
        let b = 1;
      }
    })
  }
}