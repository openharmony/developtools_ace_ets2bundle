@Entry
@Component
struct UserView1 {

    build(){
        Column() {
          Image('/common/seaman2.png')
          .alt("/common/seaman2.png")
          .onComplete((e) => {
            console.log('load image, width2: ' + e.width)
            console.log('load image, height3: ' + e.height)
          })
          .onError(() => {
            console.log('load image error1')
          })
        }
    }
}