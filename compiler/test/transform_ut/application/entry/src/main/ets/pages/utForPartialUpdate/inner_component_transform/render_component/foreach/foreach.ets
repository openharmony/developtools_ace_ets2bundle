@Entry
@Component
struct ParentView {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        item => {
          Text(item)
        }
      )
    }
  }
}

@Component
struct ParentView1 {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        (item, index) => {
          Text(item)
        }
      )
    }
  }
}

@Component
struct ParentView2 {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        (item, index) => {
          Text(item)
        },
        item => item.toString()
      )
    }
  }
}

@Component
struct ParentView3 {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        (item, index) => {
          Text(item)
        },
        (item, index) => item.toString()
      )
    }
  }
}

@Component
struct ParentView4 {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        item => {
          Text(item)
        },
        (item, index) => item.toString()
      )
    }
  }
}

@Component
struct ParentView5 {
  @State arr: string[] = ['1', '2', '3'];
  build() {
    List() {
      ForEach(this.arr,
        item => {
          Text(item)
        },
        item => item.toString()
      )
    }
  }
}

@Component
struct ParentView6 {
  @State arr: string[] = ['1', '2', '3'];
  count: number = 0;
  build() {
    List() {
      ForEach(this.arr,
        item => {
          Text(item)
        },
        item => item.toString()
      )
      .onMove((from: number, to: number)=>{
        this.count += 1;
      })
    }
  }
}