/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Text, Column, Component, Entry, Button, ClickEvent,
  Color, $r,
  BadgePosition,
  BadgeParamWithString,
  DataPanelOptions, DataPanelType,
  GaugeOptions,
  MarqueeOptions,
  ProgressOptions,
  RichEditorController, RichEditorOptions,
  WithThemeOptions,
  PluginComponentOptions, PluginComponentTemplate,
  XComponentParameters, XComponentType, NativeXComponentPointer,
  RadioOptions,
  SelectOption,
  ToggleOptions, ToggleType,
  ImageAIOptions,
  IDataSource, DataChangeListener,
  Particles, ParticleOptions, EmitterOptions, EmitterParticleOptions, ParticleType, ParticleConfigs, PointParticleParameters,
  Scroller,
  RefreshOptions,
  ScrollBarOptions,
  Badge,
  ContainerSpan,
  Counter,
  DataPanel,
  Gauge,
  Hyperlink,
  ImageSpan,
  LoadingProgress,
  Marquee,
  PatternLock,
  Progress,
  QRCode,
  RichEditor,
  Search,
  Span,
  SymbolSpan,
  SymbolGlyph,
  Text,
  TextArea,
  TextClock,
  TextInput,
  TextTimer,
  IndicatorComponent,
  NavDestination,
  Navigation,
  SideBarContainer,
  Swiper,
  TabContent,
  Tabs,
  WithTheme,
  EmbeddedComponent,
  PluginComponent,
  ToolBarItem,
  UIExtensionComponent,
  XComponent,
  Button,
  Checkbox,
  CheckboxGroup,
  Menu,
  MenuItem,
  MenuItemGroup,
  Radio,
  Rating,
  Select,
  Slider,
  Toggle,
  CalendarPicker,
  DatePicker,
  Image,
  ImageAnimator,
  TextPicker,
  TimePicker,
  UIPickerComponent,
  ContentSlot,
  ForEach,
  If,
  LazyForEach,
  NodeContainer,
  Repeat,
  EffectComponent,
  Particle,
  UnionEffectContainer,
  Grid,
  LazyVGridLayout,
  List,
  Refresh,
  Scroll,
  ScrollBar,
  WaterFlow,
  Blank,
  Column,
  ColumnSplit,
  Divider,
  Flex,
  FolderStack,
  GridCol,
  GridRow,
  RelativeContainer,
  Row,
  RowSplit,
  Stack
} from "@ohos.arkui.component";
import { ArcAlphabetIndexer, ArcAlphabetIndexerInitInfo } from "@ohos.arkui.ArcAlphabetIndexer";
import { AlphabetIndexer, AlphabetIndexerOptions } from "arkui.component.alphabetIndexer";
import { ArcSwiper } from "@ohos.arkui.ArcSwiper";
import { ArcList, ArcListItem } from "@ohos.arkui.ArcList";
import { ArcScrollBar, ArcScrollBarOptions } from "@ohos.arkui.ArcScrollBar";
import Want from "@ohos.app.ability.Want";
import { RecordData } from '@ohos.base';
import { Content, NodeController, FrameNode } from '@ohos.arkui.node';
import { UIContext } from "@ohos.arkui.UIContext";

class DataSource implements IDataSource<number> {
    totalCount(): int {
      return 1;
    }
    getData(index: int): number {
      return 1;
    }
    registerDataChangeListener(listener: DataChangeListener): void {}
    unregisterDataChangeListener(listener: DataChangeListener): void {}
}

class ANodeController extends NodeController {
  makeNode(uiContext: UIContext): FrameNode | null {
    return null;
  }
}

@Entry
@Component
struct MyStateSample {
  controller: RichEditorController = new RichEditorController();

  build() {
    Badge({
      value: '1234',
      style: {
        badgeSize : 30
      }
    } as BadgeParamWithString)
    ContainerSpan() {}
    Counter() {}
    DataPanel({ values: [12.3, 21.1, 13.4, 35.2, 26.0, 32.0], max: 140.0, type: DataPanelType.Circle } as DataPanelOptions)
    Gauge({ value: 50.0, min: 1.0, max: 100.0 } as GaugeOptions) {

    }
    Hyperlink('123')
    ImageSpan($r('app.media.app_icon'))
    LoadingProgress()
    Marquee({
      start: true,
      src: '123'
    } as MarqueeOptions)
    PatternLock()
    Progress({ value: 20.0 } as ProgressOptions)
    QRCode('123')
    RichEditor({ controller: this.controller } as RichEditorOptions)
    Search()
    Span('1234')
    SymbolSpan($r('app.string.app_name'))
    SymbolGlyph()
    Text('1234')
    TextArea()
    TextClock()
    TextInput()
    TextTimer()
    ArcAlphabetIndexer({ arrayValue: ['12'], selected: 1 } as ArcAlphabetIndexerInitInfo)
    ArcSwiper() {}
    AlphabetIndexer({ arrayValue: ['12'], selected: 1 } as AlphabetIndexerOptions)
    IndicatorComponent()
    NavDestination() {}
    Navigation() {}
    SideBarContainer() {}
    Swiper() {}
    TabContent() {}
    Tabs() {}
    WithTheme({ } as WithThemeOptions) {}
    EmbeddedComponent({} as Want)
    PluginComponent({ template: { source: '123', bundleName: '1234' } as PluginComponentTemplate, data: {} as RecordData } as PluginComponentOptions)
    ToolBarItem()
    UIExtensionComponent({} as Want)
    XComponent({ id: '123', type: XComponentType.SURFACE, nativeXComponentHandler: (data: NativeXComponentPointer) => {} } as XComponentParameters)
    Button() {}
    Button('123')
    Checkbox() {}
    CheckboxGroup() {}
    Menu() {}
    MenuItem(() => {}) {}
    MenuItemGroup() {}
    Radio({ group: '123', value: '123' } as RadioOptions) {}
    Rating() {}
    Select([{ value: '123' } as SelectOption]) {}
    Slider() {}
    Toggle({ type: ToggleType.Checkbox } as ToggleOptions) {}
    CalendarPicker()
    DatePicker()
    Image('123')
    Image('123', {} as ImageAIOptions)
    Image('123', '1234')
    ImageAnimator()
    TextPicker()
    TimePicker()
    UIPickerComponent()
    ContentSlot({} as Content)
    ForEach([1, 2, 3], (item: int, index: int) => {})
    If(true) {}
    LazyForEach(new DataSource(), (item: number, index: int) => {})
    NodeContainer(new ANodeController())
    Repeat<number>([1, 2, 3])
    EffectComponent()
    Particle({ particles: [{ emitter: { particle: { type: ParticleType.POINT, config: { radius: '123' } as PointParticleParameters, count: 1 } as EmitterParticleOptions } as EmitterOptions } as ParticleOptions] } as Particles)
    UnionEffectContainer() {}
    ArcList() {}
    ArcListItem() {}
    ArcScrollBar({ scroller: new Scroller() } as ArcScrollBarOptions) {}
    Grid() {}
    LazyVGridLayout() {}
    List() {}
    Refresh({ refreshing: true }) {}
    Scroll() {}
    ScrollBar({ scroller: new Scroller() } as ScrollBarOptions) {}
    WaterFlow() {}
    Blank()
    Column() {}
    ColumnSplit() {}
    Divider()
    Flex() {}
    FolderStack() {}
    GridCol() {}
    GridRow() {}
    RelativeContainer() {}
    Row() {}
    RowSplit() {}
    Stack() {}
  }
}
