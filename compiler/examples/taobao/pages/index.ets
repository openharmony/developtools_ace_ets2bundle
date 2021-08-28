const SelectItems = [
  {
    uri1: 'class/type_new.png', title1: '天猫新品', uri2: 'class/type_recharge.png', title2: '充值中心'
  },
  {
    uri1: 'class/type_international.png', title1: '天猫国际', uri2: 'class/type_garden.png', title2: '金币庄园'
  },
  {
    uri1: 'class/type_order.png', title1: '饿了么', uri2: 'class/type_auction.png', title2: '阿里拍卖'
  },
  {
    uri1: 'class/type_market.png', title1: '天猫超市', uri2: 'class/type_eat.png', title2: '淘宝吃货'
  },
  {
    uri1: 'class/type_all.png', title1: '分类', uri2: 'class/type_used.png', title2: '咸鱼'
  },
  {
    uri1: 'class/type_food.png', title1: '天猫美食', uri2: 'class/type_vip.png', title2: '会员中心'
  },
  {
    uri1: 'class/type_health.png', title1: '阿里健康', uri2: 'class/type_movie.png', title2: '淘票票'
  },
  {
    uri1: 'class/type_life.png', title1: '口碑生活', uri2: 'class/type_membership.png', title2: '会员店'
  },
]

const ProductItems = [
  {
    uri1: 'table/list_one.jpg', description1: '创意日式环保原木纸巾架 榉木无漆卷纸收纳架 卫生纸柱厨房纸巾架', price1:'￥29.9', soldNumber1: '79人已购买',
    uri2: 'table/list_two.jpg', description2: '展示篮海草编新中式收纳筐矮收纳盒藤编制把手托盘杂物家居整理篮', price2: '￥35.1', soldNumber2: '24人已购买'
  },
  {
    uri1: 'table/list_three.jpg', description1: '门后挂钩金属门背后衣物挂架免钉无痕衣帽钩创意门上挂衣架挂衣钩', price1: '￥27.9', soldNumber1: '214人已购买',
    uri2: 'table/list_four.jpg', description2: '可折叠桌面置物架分层小型架子厨房杂物整理落地收纳架衣柜隔层架', price2: '￥8', soldNumber2: '1234人已购买'
  },
  {
    uri1: 'table/list_five.jpg', description1: 'Castle Garden亲肤水貂绒3D立体树叶双层多功能绒毯白', price1: '￥198.8', soldNumber1: '38人已购买',
    uri2: 'table/list_six.jpg', description2: 'DORA HOUSE欧式法式复古木质烛台 仿古做旧酒吧别墅装饰配烛杯', price2: '￥168', soldNumber2: '82人已购买'
  },
  {
    uri1: 'table/list_seven.jpg', description1: '美式装饰品北欧创意家居客厅书房电视柜发光地球仪样板房摆件礼品', price1: '￥148', soldNumber1: '19人已购买',
    uri2: 'table/list_eight.jpg', description2: '树可珐琅 日式收纳筒加厚搪瓷筷子筒笔筒工具筒厨房收纳复古笔筒', price2: '￥39', soldNumber2: '113人已购买'
  },
  {
    uri1: 'table/list_nine.jpg', description1: '包邮家用陶瓷盘子圆形菜盘 创意碗盘骨瓷西餐具牛扒盘 清新水果盘', price1: '￥24.9', soldNumber1: '21人已购买',
    uri2: 'table/list_ten.jpg', description2: '朵颐创意北欧不锈钢西餐餐具黑柄手柄刀叉勺套装甜品叉勺主餐刀叉', price2: '￥19', soldNumber2: '25人已购买'
  },
  {
    uri1: 'table/list_eleven.jpg', description1: '「番茄设计出品 / 千鸟格纹路」设计师高靠背布艺软床', price1: '￥3,625', soldNumber1: '11人已购买',
    uri2: 'table/list_twelve.jpg', description2: '复古做旧实木多肉花架 田园乡村置物架托盘 储物架 花园园艺杂货', price2: '￥275', soldNumber2: '8人已购买'
  },
  {
    uri1: 'table/list_thirteen.jpg', description1: '北欧简约胡桃木色门厅柜玄关柜鞋柜组合定做隔断柜镂空屏风鞋柜', price1: '￥2,290', soldNumber1: '78人已购买',
    uri2: 'table/list_fourteen.jpg', description2: '厨房创意竹木陶瓷调味罐三件套胡椒盐罐味精瓶调料盒套装调味瓶罐', price2: '￥35', soldNumber2: '25人已购买'
  },
  {
    uri1: 'table/list_fifteen.jpg', description1: 'Moreover原创设计耐高温水杯玻璃杯饮料杯酒杯早餐杯牛奶杯简约', price1: '￥22', soldNumber1: '66人已购买',
    uri2: 'table/list_sixteen.jpg', description2: '乐尚多功能碎菜器 家用手动蔬菜绞碎器 蒜肉搅碎机绞肉机饺子馅机', price2: '￥45', soldNumber2: '23人已购买'
  },
  {
    uri1: 'table/list_seventeen.jpg', description1: '满天星云南干花束雏菊小向日葵太阳花家居装饰插花送朋友满包邮', price1: '￥21.5', soldNumber1: '30人已购买',
    uri2: 'table/list_eighteen.jpg', description2: '厨房创意竹木陶瓷调味罐三件套胡椒盐罐味精瓶调料盒套装调味瓶罐', price2: '￥16', soldNumber2: '23人已购买'
  },
  {
    uri1: 'table/list_ninteen.jpg', description1: '梵辰组装现代简约复古做旧靠背实木扶手酒店餐厅餐椅休闲网红椅子', price1: '￥229', soldNumber1: '382人已购买',
    uri2: 'table/list_twenty.png', description2: '烘焙工具 软瓷裱花枪  家用奶油挤花器 蛋糕裱花笔diy套装', price2: '￥24.8', soldNumber2: '23人已购买'
  },
  {
    uri1: 'table/list_twentyone.jpg', description1: '汇安 实木床双人1.5m1.8米北欧日式经济型木床现代简约主卧家具', price1: '￥1,288', soldNumber1: '0人已购买',
    uri2: 'table/list_twentytwo.jpg', description2: '旅侣 天然植物干花永生花黄金球金槌花花束搭配家居装饰摆拍道具', price2: '￥30.9', soldNumber2: '100人已购买'
  },
  {
    uri1: 'table/list_twentythree.jpg', description1: '北欧风格ins文艺范工作室店铺墙面铁丝网格照片装饰墙挂件收纳', price1: '￥88', soldNumber1: '15人已购买',
    uri2: 'table/list_twentyfour.jpg', description2: '北欧餐椅现代简约家用实木靠背曲木椅奶茶店设计创意餐厅椅子ins', price2: '￥315', soldNumber2: '23人已购买'
  },
  {
    uri1: 'table/list_twentyfive.jpg', description1: '大号裱花嘴套装 不锈钢9头裱花咀超大八齿圆孔大玫瑰大寿桃大10齿', price1: '￥25', soldNumber1: '116人已购买',
    uri2: 'table/list_twentysix.jpg', description2: '【Home deco】【现货】日本进口冰箱保鲜盒食品密封盒带盖收纳盒', price2: '￥18.5', soldNumber2: '67人已购买'
  },
]

const resourcePath = 'resources/rawfile/'

class ProductItem {
  public uri1: string
  public description1: string
  public price1: string
  public soldNumber1: string
  public uri2: string
  public description2: string
  public price2: string
  public soldNumber2: string
}

@Entry
@Component
struct MainPage {
  build() {
    Column() {
      List() {
        ListItem() {
          TopList()
        }
        ListItem() {
          Banner()
        }
        ListItem() {
          SelectItemList()
        }
        ListItem() {
          SpecialItemList()
        }
        ListItem() {
          Row() {
            Image(resourcePath + 'double_twelve.gif')
              .width(327).height(87)
              .objectFit(ImageFit.Fill)
          }.alignItems(VerticalAlign.Center).justifyContent(FlexAlign.Center)
        }
        ForEach(
          ProductItems,
          (item) => {
            ListItem() {
              ProductListItem({item: item})
            }
          },
          item => item.uri1)
        ForEach(
          ProductItems,
          (item) => {
            ListItem() {
              ProductListItem({item: item})
            }
          },
          item => item.uri1)
        ForEach(
          ProductItems,
          (item) => {
            ListItem() {
              ProductListItem({item: item})
            }
          },
          item => item.uri1)
      }
    }.alignItems(HorizontalAlign.Center)
  }
}

@Component
struct TopList {
  private topList: string[] = ['首页','生鲜','食品','女装','鞋靴','饰品','百货','母婴','箱包','男装','内衣','手机','美妆',
      '家装','运动','电器','洗护','数码','车品','企业','保健']
  build() {
    List() {
      ForEach(
        this.topList,
        (item) => {
          ListItem() {
            Text(item)
              .fontSize(14)
              .width(39)
              .textAlign(TextAlign.Center)
          }
        },
        item => item)
    }.height(34)
    .listDirection(ListDirection.Horizontal)
  }
}

@Component
struct Banner {
  private bannerList: string[] = ['swiper/swiper_one.jpg','swiper/swiper_two.jpg', 'swiper/swiper_three.jpg',
      'swiper/swiper_four.jpg','swiper/swiper_five.jpg']
  build() {
    Row() {
      Swiper() {
        ForEach(
          this.bannerList,
          (item) => { Image(resourcePath + item) },
          item => item)
      }.width(288).height(96)
      .autoPlay(true)
    }.alignItems(VerticalAlign.Center)
  }
}

@Component
struct SelectItemList {
  build() {
    List() {
      ForEach(
        SelectItems,
        (item) => {
          ListItem() {
            Column() {
              Image(resourcePath + item.uri1)
                .width(48).height(44)
              Text(item.title1)
                .fontSize(12)
              Image(resourcePath + item.uri2)
                .width(48).height(44)
              Text(item.title2)
                .fontSize(12)
            }.width(68).height(130)
            .alignItems(HorizontalAlign.Center)
          }
        },
        item => item.title1)
      }.height(144).padding(8)
      .listDirection(ListDirection.Horizontal)
  }
}

@Component
struct SpecialItemList {
  private SpecialItems: Object[] = [
    {uri1: 'special/attention_doubletwelve.png', uri2:'special/attention_double_one.png', uri3: 'special/attention_double_two.jpg'},
    {uri1: 'special/attention_best.png', uri2:'special/attention_best_one.png', uri3: 'special/attention_best_two.jpg'},
    {uri1: 'special/attention_live.png', uri2:'special/attention_live_one.png', uri3: 'special/attention_live_two.jpg'},
    {uri1: 'special/attention_video.png', uri2:'special/attention_video_one.png', uri3: 'special/attention_video_two.png'},
  ]

  build() {
    Column() {
      Grid() {
        ForEach(
          this.SpecialItems,
          (item) => {
            GridItem() {
              Column() {
                Image(resourcePath + item.uri1)
                  .width(154).height(22)
                  .objectFit(ImageFit.Fill)
                Row() {
                  Image(resourcePath + item.uri2)
                    .width(72).height(87)
                    .objectFit(ImageFit.Fill)
                  Image(resourcePath + item.uri3)
                    .width(72).height(87)
                    .objectFit(ImageFit.Fill)
                }.justifyContent(FlexAlign.SpaceAround)
              }.alignItems(HorizontalAlign.Center)
            }
          },
          item => item.uri1)
      }.width(360).height(240)
      .columnsTemplate('1fr, 1fr').rowsTemplate('1fr, 1fr')
    }.width(360)
      .alignItems(HorizontalAlign.Center)
  }
}

@Component
struct ProductListItem {
  private item: ProductItem

  build() {
    Row() {
      Product({uri: this.item.uri1, description: this.item.description1, price: this.item.price1, soldNumber: this.item.soldNumber1})
      Product({uri: this.item.uri2, description: this.item.description2, price: this.item.price2, soldNumber: this.item.soldNumber2})
    }
  }
}

@Component
struct Product {
  private uri: string
  private description: string
  private price: string
  private soldNumber: string
  build() {
    Column() {
      Image(resourcePath + this.uri)
        .width(144).height(144)
        .borderRadius(15)
      Text(this.description)
        .fontSize(15).height(63)
      Row() {
        Text(this.price)
          .color(0xffff4500)
          .fontSize(14).width(58)
          .textAlign(TextAlign.Start)
        Text(this.soldNumber)
          .color(0xff808080)
          .fontSize(11)
      }.width(144).height(20)
      .alignItems(VerticalAlign.Center)
    }.width(168).height(245)
    .alignItems(HorizontalAlign.Center)
  }
}