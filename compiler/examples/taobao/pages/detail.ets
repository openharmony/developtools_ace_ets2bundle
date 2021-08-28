const detailList = [
  {
    uri: 'resources/rawfile/table/list_one.jpg',
    title: '创意日式环保原木纸巾架 榉木无漆卷纸收纳架 卫生纸柱厨房纸巾架'
  },
  {
    uri: 'resources/rawfile/table/list_two.jpg',
    title: '展示篮海草编新中式收纳筐矮收纳盒藤编制把手托盘杂物家居整理篮'
  },
  {
    uri: 'resources/rawfile/table/list_three.jpg',
    title: '门后挂钩金属门背后衣物挂架免钉无痕衣帽钩创意门上挂衣架挂衣钩'
  },
  {
    uri: 'resources/rawfile/table/list_four.jpg',
    title: '可折叠桌面置物架分层小型架子厨房杂物整理落地收纳架衣柜隔层架'
  },
  {
    uri: 'resources/rawfile/table/list_five.jpg',
    title: 'Castle Garden亲肤水貂绒3D立体树叶双层多功能绒毯 白'
  },
  {
    uri: 'resources/rawfile/table/list_six.jpg',
    title: 'DORA HOUSE欧式法式复古木质烛台 仿古做旧酒吧别墅装饰配烛杯'
  },
  {
    uri: 'resources/rawfile/table/list_seven.jpg',
    title: '美式装饰品北欧创意家居客厅书房电视柜发光地球仪样板房摆件礼品'
  },
  {
    uri: 'resources/rawfile/table/list_eight.jpg',
    title: '树可珐琅 日式收纳筒加厚搪瓷筷子筒笔筒工具筒厨房收纳复古笔筒'
  },
  {
    uri: 'resources/rawfile/table/list_nine.jpg',
    title: '包邮家用陶瓷盘子圆形菜盘 创意碗盘骨瓷西餐具牛扒盘 清新水果盘'
  },
  {
    uri: 'resources/rawfile/table/list_ten.jpg',
    title: '朵颐创意北欧不锈钢西餐餐具黑柄手柄刀叉勺套装甜品叉勺主餐刀叉'
  }
]

@Entry
@Component
struct Detail {
  build() {
    Column() {
      List() {
        ForEach(
          detailList,
          (item) => {
            ListItem() {
              Column() {
                Image(item.uri)
                  .width(275).height(300)
                  .borderRadius(15)
                Text(item.title)
                  .fontSize(16)
                  .width(220).height(50)
              }.width(300).height(400)
              .borderRadius(15)
              .alignItems(HorizontalAlign.Center)
            }.height(410)
          },
          item => item.title)
      }.width(300)
    }.width(360)
    .backgroundColor(Color.White)
    .alignItems(HorizontalAlign.Center)
  }
}