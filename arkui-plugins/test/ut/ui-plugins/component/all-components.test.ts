/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig, mockProjectConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins, ProjectConfig } from '../../../../common/plugin-context';
import { dumpConstructor } from '../../../utils/simplify-dump';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'all-components.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 26;

const pluginTester = new PluginTester('test all components transformation', buildConfig, projectConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { StackAttribute as StackAttribute } from "arkui.component.stack";

import { Stack as Stack } from "arkui.component.stack";

import { RowSplitAttribute as RowSplitAttribute } from "arkui.component.rowSplit";

import { RowSplit as RowSplit } from "arkui.component.rowSplit";

import { RowAttribute as RowAttribute } from "arkui.component.row";

import { Row as Row } from "arkui.component.row";

import { RelativeContainerAttribute as RelativeContainerAttribute } from "arkui.component.relativeContainer";

import { RelativeContainer as RelativeContainer } from "arkui.component.relativeContainer";

import { GridRowAttribute as GridRowAttribute } from "arkui.component.gridRow";

import { GridRow as GridRow } from "arkui.component.gridRow";

import { GridColAttribute as GridColAttribute } from "arkui.component.gridCol";

import { GridCol as GridCol } from "arkui.component.gridCol";

import { FolderStackAttribute as FolderStackAttribute } from "arkui.component.folderStack";

import { FolderStack as FolderStack } from "arkui.component.folderStack";

import { FlexAttribute as FlexAttribute } from "arkui.component.flex";

import { Flex as Flex } from "arkui.component.flex";

import { DividerAttribute as DividerAttribute } from "arkui.component.divider";

import { Divider as Divider } from "arkui.component.divider";

import { ColumnSplitAttribute as ColumnSplitAttribute } from "arkui.component.columnSplit";

import { ColumnSplit as ColumnSplit } from "arkui.component.columnSplit";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { Column as Column } from "arkui.component.column";

import { BlankAttribute as BlankAttribute } from "arkui.component.blank";

import { Blank as Blank } from "arkui.component.blank";

import { WaterFlowAttribute as WaterFlowAttribute } from "arkui.component.waterFlow";

import { WaterFlow as WaterFlow } from "arkui.component.waterFlow";

import { ScrollBarAttribute as ScrollBarAttribute } from "arkui.component.scrollBar";

import { ScrollBar as ScrollBar } from "arkui.component.scrollBar";

import { ScrollAttribute as ScrollAttribute } from "arkui.component.scroll";

import { Scroll as Scroll } from "arkui.component.scroll";

import { RefreshAttribute as RefreshAttribute } from "arkui.component.refresh";

import { Refresh as Refresh } from "arkui.component.refresh";

import { ListAttribute as ListAttribute } from "arkui.component.list";

import { List as List } from "arkui.component.list";

import { LazyVGridLayoutAttribute as LazyVGridLayoutAttribute } from "arkui.component.lazyGridLayout";

import { LazyVGridLayout as LazyVGridLayout } from "arkui.component.lazyGridLayout";

import { GridAttribute as GridAttribute } from "arkui.component.grid";

import { Grid as Grid } from "arkui.component.grid";

import { ArcScrollBarAttribute as ArcScrollBarAttribute } from "@ohos.arkui.ArcScrollBar";

import { ArcScrollBar as ArcScrollBar } from "@ohos.arkui.ArcScrollBar";

import { ArcListItemAttribute as ArcListItemAttribute } from "@ohos.arkui.ArcList";

import { ArcListItem as ArcListItem } from "@ohos.arkui.ArcList";

import { ArcListAttribute as ArcListAttribute } from "@ohos.arkui.ArcList";

import { ArcList as ArcList } from "@ohos.arkui.ArcList";

import { UnionEffectContainerAttribute as UnionEffectContainerAttribute } from "arkui.component.unionEffectContainer";

import { UnionEffectContainer as UnionEffectContainer } from "arkui.component.unionEffectContainer";

import { ParticleAttribute as ParticleAttribute } from "arkui.component.particle";

import { Particle as Particle } from "arkui.component.particle";

import { EffectComponentAttribute as EffectComponentAttribute } from "arkui.component.effectComponent";

import { EffectComponent as EffectComponent } from "arkui.component.effectComponent";

import { RepeatAttribute as RepeatAttribute } from "arkui.component.repeat";

import { Repeat as Repeat } from "arkui.component.repeat";

import { NodeContainerAttribute as NodeContainerAttribute } from "arkui.component.nodeContainer";

import { NodeContainer as NodeContainer } from "arkui.component.nodeContainer";

import { LazyForEachAttribute as LazyForEachAttribute } from "arkui.component.lazyForEach";

import { LazyForEach as LazyForEach } from "arkui.component.lazyForEach";

import { IfAttribute as IfAttribute } from "arkui.component.if";

import { If as If } from "arkui.component.if";

import { ForEachAttribute as ForEachAttribute } from "arkui.component.forEach";

import { ForEach as ForEach } from "arkui.component.forEach";

import { ContentSlotAttribute as ContentSlotAttribute } from "arkui.component.contentSlot";

import { ContentSlot as ContentSlot } from "arkui.component.contentSlot";

import { UIPickerComponentAttribute as UIPickerComponentAttribute } from "arkui.component.uiPickerComponent";

import { UIPickerComponent as UIPickerComponent } from "arkui.component.uiPickerComponent";

import { TimePickerAttribute as TimePickerAttribute } from "arkui.component.timePicker";

import { TimePicker as TimePicker } from "arkui.component.timePicker";

import { TextPickerAttribute as TextPickerAttribute } from "arkui.component.textPicker";

import { TextPicker as TextPicker } from "arkui.component.textPicker";

import { ImageAnimatorAttribute as ImageAnimatorAttribute } from "arkui.component.imageAnimator";

import { ImageAnimator as ImageAnimator } from "arkui.component.imageAnimator";

import { ImageAttribute as ImageAttribute } from "arkui.component.image";

import { Image as Image } from "arkui.component.image";

import { DatePickerAttribute as DatePickerAttribute } from "arkui.component.datePicker";

import { DatePicker as DatePicker } from "arkui.component.datePicker";

import { CalendarPickerAttribute as CalendarPickerAttribute } from "arkui.component.calendarPicker";

import { CalendarPicker as CalendarPicker } from "arkui.component.calendarPicker";

import { ToggleAttribute as ToggleAttribute } from "arkui.component.toggle";

import { Toggle as Toggle } from "arkui.component.toggle";

import { SliderAttribute as SliderAttribute } from "arkui.component.slider";

import { Slider as Slider } from "arkui.component.slider";

import { SelectAttribute as SelectAttribute } from "arkui.component.select";

import { Select as Select } from "arkui.component.select";

import { RatingAttribute as RatingAttribute } from "arkui.component.rating";

import { Rating as Rating } from "arkui.component.rating";

import { RadioAttribute as RadioAttribute } from "arkui.component.radio";

import { Radio as Radio } from "arkui.component.radio";

import { MenuItemGroupAttribute as MenuItemGroupAttribute } from "arkui.component.menuItemGroup";

import { MenuItemGroup as MenuItemGroup } from "arkui.component.menuItemGroup";

import { MenuItemAttribute as MenuItemAttribute } from "arkui.component.menuItem";

import { MenuItem as MenuItem } from "arkui.component.menuItem";

import { MenuAttribute as MenuAttribute } from "arkui.component.menu";

import { Menu as Menu } from "arkui.component.menu";

import { CheckboxGroupAttribute as CheckboxGroupAttribute } from "arkui.component.checkboxgroup";

import { CheckboxGroup as CheckboxGroup } from "arkui.component.checkboxgroup";

import { CheckboxAttribute as CheckboxAttribute } from "arkui.component.checkbox";

import { Checkbox as Checkbox } from "arkui.component.checkbox";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { Button as Button } from "arkui.component.button";

import { XComponentAttribute as XComponentAttribute } from "arkui.component.xcomponent";

import { XComponent as XComponent } from "arkui.component.xcomponent";

import { UIExtensionComponentAttribute as UIExtensionComponentAttribute } from "arkui.component.uiExtensionComponent";

import { UIExtensionComponent as UIExtensionComponent } from "arkui.component.uiExtensionComponent";

import { ToolBarItemAttribute as ToolBarItemAttribute } from "arkui.component.toolbar";

import { ToolBarItem as ToolBarItem } from "arkui.component.toolbar";

import { PluginComponentAttribute as PluginComponentAttribute } from "arkui.component.pluginComponent";

import { PluginComponent as PluginComponent } from "arkui.component.pluginComponent";

import { EmbeddedComponentAttribute as EmbeddedComponentAttribute } from "arkui.component.embeddedComponent";

import { EmbeddedComponent as EmbeddedComponent } from "arkui.component.embeddedComponent";

import { WithThemeAttribute as WithThemeAttribute } from "arkui.component.withTheme";

import { WithTheme as WithTheme } from "arkui.component.withTheme";

import { TabsAttribute as TabsAttribute } from "arkui.component.tabs";

import { Tabs as Tabs } from "arkui.component.tabs";

import { TabContentAttribute as TabContentAttribute } from "arkui.component.tabContent";

import { TabContent as TabContent } from "arkui.component.tabContent";

import { SwiperAttribute as SwiperAttribute } from "arkui.component.swiper";

import { Swiper as Swiper } from "arkui.component.swiper";

import { SideBarContainerAttribute as SideBarContainerAttribute } from "arkui.component.sidebar";

import { SideBarContainer as SideBarContainer } from "arkui.component.sidebar";

import { NavigationAttribute as NavigationAttribute } from "arkui.component.navigation";

import { Navigation as Navigation } from "arkui.component.navigation";

import { NavDestinationAttribute as NavDestinationAttribute } from "arkui.component.navDestination";

import { NavDestination as NavDestination } from "arkui.component.navDestination";

import { IndicatorComponentAttribute as IndicatorComponentAttribute } from "arkui.component.indicatorcomponent";

import { IndicatorComponent as IndicatorComponent } from "arkui.component.indicatorcomponent";

import { AlphabetIndexerAttribute as AlphabetIndexerAttribute } from "arkui.component.alphabetIndexer";

import { AlphabetIndexer as AlphabetIndexer } from "arkui.component.alphabetIndexer";

import { ArcSwiperAttribute as ArcSwiperAttribute } from "@ohos.arkui.ArcSwiper";

import { ArcSwiper as ArcSwiper } from "@ohos.arkui.ArcSwiper";

import { ArcAlphabetIndexerAttribute as ArcAlphabetIndexerAttribute } from "@ohos.arkui.ArcAlphabetIndexer";

import { ArcAlphabetIndexer as ArcAlphabetIndexer } from "@ohos.arkui.ArcAlphabetIndexer";

import { TextTimerAttribute as TextTimerAttribute } from "arkui.component.textTimer";

import { TextTimer as TextTimer } from "arkui.component.textTimer";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInput as TextInput } from "arkui.component.textInput";

import { TextClockAttribute as TextClockAttribute } from "arkui.component.textClock";

import { TextClock as TextClock } from "arkui.component.textClock";

import { TextAreaAttribute as TextAreaAttribute } from "arkui.component.textArea";

import { TextArea as TextArea } from "arkui.component.textArea";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { Text as Text } from "arkui.component.text";

import { SymbolGlyphAttribute as SymbolGlyphAttribute } from "arkui.component.symbolglyph";

import { SymbolGlyph as SymbolGlyph } from "arkui.component.symbolglyph";

import { SymbolSpanAttribute as SymbolSpanAttribute } from "arkui.component.symbolSpan";

import { SymbolSpan as SymbolSpan } from "arkui.component.symbolSpan";

import { SpanAttribute as SpanAttribute } from "arkui.component.span";

import { Span as Span } from "arkui.component.span";

import { SearchAttribute as SearchAttribute } from "arkui.component.search";

import { Search as Search } from "arkui.component.search";

import { RichEditorAttribute as RichEditorAttribute } from "arkui.component.richEditor";

import { RichEditor as RichEditor } from "arkui.component.richEditor";

import { QRCodeAttribute as QRCodeAttribute } from "arkui.component.qrcode";

import { QRCode as QRCode } from "arkui.component.qrcode";

import { ProgressAttribute as ProgressAttribute } from "arkui.component.progress";

import { Progress as Progress } from "arkui.component.progress";

import { PatternLockAttribute as PatternLockAttribute } from "arkui.component.patternLock";

import { PatternLock as PatternLock } from "arkui.component.patternLock";

import { MarqueeAttribute as MarqueeAttribute } from "arkui.component.marquee";

import { Marquee as Marquee } from "arkui.component.marquee";

import { LoadingProgressAttribute as LoadingProgressAttribute } from "arkui.component.loadingProgress";

import { LoadingProgress as LoadingProgress } from "arkui.component.loadingProgress";

import { ImageSpanAttribute as ImageSpanAttribute } from "arkui.component.imageSpan";

import { ImageSpan as ImageSpan } from "arkui.component.imageSpan";

import { HyperlinkAttribute as HyperlinkAttribute } from "arkui.component.hyperlink";

import { Hyperlink as Hyperlink } from "arkui.component.hyperlink";

import { GaugeAttribute as GaugeAttribute } from "arkui.component.gauge";

import { Gauge as Gauge } from "arkui.component.gauge";

import { DataPanelAttribute as DataPanelAttribute } from "arkui.component.dataPanel";

import { DataPanel as DataPanel } from "arkui.component.dataPanel";

import { CounterAttribute as CounterAttribute } from "arkui.component.counter";

import { Counter as Counter } from "arkui.component.counter";

import { ContainerSpanAttribute as ContainerSpanAttribute } from "arkui.component.containerSpan";

import { ContainerSpan as ContainerSpan } from "arkui.component.containerSpan";

import { Memo as Memo } from "arkui.incremental.annotation";

import { BadgeAttribute as BadgeAttribute } from "arkui.component.badge";

import { Badge as Badge } from "arkui.component.badge";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent, Color as Color, $r as $r, BadgePosition as BadgePosition, BadgeParamWithString as BadgeParamWithString, DataPanelOptions as DataPanelOptions, DataPanelType as DataPanelType, GaugeOptions as GaugeOptions, MarqueeOptions as MarqueeOptions, ProgressOptions as ProgressOptions, RichEditorController as RichEditorController, RichEditorOptions as RichEditorOptions, WithThemeOptions as WithThemeOptions, PluginComponentOptions as PluginComponentOptions, PluginComponentTemplate as PluginComponentTemplate, XComponentParameters as XComponentParameters, XComponentType as XComponentType, NativeXComponentPointer as NativeXComponentPointer, RadioOptions as RadioOptions, SelectOption as SelectOption, ToggleOptions as ToggleOptions, ToggleType as ToggleType, ImageAIOptions as ImageAIOptions, IDataSource as IDataSource, DataChangeListener as DataChangeListener, Particles as Particles, ParticleOptions as ParticleOptions, EmitterOptions as EmitterOptions, EmitterParticleOptions as EmitterParticleOptions, ParticleType as ParticleType, ParticleConfigs as ParticleConfigs, PointParticleParameters as PointParticleParameters, Scroller as Scroller, RefreshOptions as RefreshOptions, ScrollBarOptions as ScrollBarOptions, Badge as Badge, ContainerSpan as ContainerSpan, Counter as Counter, DataPanel as DataPanel, Gauge as Gauge, Hyperlink as Hyperlink, ImageSpan as ImageSpan, LoadingProgress as LoadingProgress, Marquee as Marquee, PatternLock as PatternLock, Progress as Progress, QRCode as QRCode, RichEditor as RichEditor, Search as Search, Span as Span, SymbolSpan as SymbolSpan, SymbolGlyph as SymbolGlyph, Text as Text, TextArea as TextArea, TextClock as TextClock, TextInput as TextInput, TextTimer as TextTimer, IndicatorComponent as IndicatorComponent, NavDestination as NavDestination, Navigation as Navigation, SideBarContainer as SideBarContainer, Swiper as Swiper, TabContent as TabContent, Tabs as Tabs, WithTheme as WithTheme, EmbeddedComponent as EmbeddedComponent, PluginComponent as PluginComponent, ToolBarItem as ToolBarItem, UIExtensionComponent as UIExtensionComponent, XComponent as XComponent, Button as Button, Checkbox as Checkbox, CheckboxGroup as CheckboxGroup, Menu as Menu, MenuItem as MenuItem, MenuItemGroup as MenuItemGroup, Radio as Radio, Rating as Rating, Select as Select, Slider as Slider, Toggle as Toggle, CalendarPicker as CalendarPicker, DatePicker as DatePicker, Image as Image, ImageAnimator as ImageAnimator, TextPicker as TextPicker, TimePicker as TimePicker, UIPickerComponent as UIPickerComponent, ContentSlot as ContentSlot, ForEach as ForEach, If as If, LazyForEach as LazyForEach, NodeContainer as NodeContainer, Repeat as Repeat, EffectComponent as EffectComponent, Particle as Particle, UnionEffectContainer as UnionEffectContainer, Grid as Grid, LazyVGridLayout as LazyVGridLayout, List as List, Refresh as Refresh, Scroll as Scroll, ScrollBar as ScrollBar, WaterFlow as WaterFlow, Blank as Blank, Column as Column, ColumnSplit as ColumnSplit, Divider as Divider, Flex as Flex, FolderStack as FolderStack, GridCol as GridCol, GridRow as GridRow, RelativeContainer as RelativeContainer, Row as Row, RowSplit as RowSplit, Stack as Stack } from "@ohos.arkui.component";

import { ArcAlphabetIndexer as ArcAlphabetIndexer, ArcAlphabetIndexerInitInfo as ArcAlphabetIndexerInitInfo } from "@ohos.arkui.ArcAlphabetIndexer";

import { AlphabetIndexer as AlphabetIndexer, AlphabetIndexerOptions as AlphabetIndexerOptions } from "arkui.component.alphabetIndexer";

import { ArcSwiper as ArcSwiper } from "@ohos.arkui.ArcSwiper";

import { ArcList as ArcList, ArcListItem as ArcListItem } from "@ohos.arkui.ArcList";

import { ArcScrollBar as ArcScrollBar, ArcScrollBarOptions as ArcScrollBarOptions } from "@ohos.arkui.ArcScrollBar";

import Want from "@ohos.app.ability.Want";

import { RecordData as RecordData } from "@ohos.base";

import { Content as Content, NodeController as NodeController, FrameNode as FrameNode } from "@ohos.arkui.node";

import { UIContext as UIContext } from "@ohos.arkui.UIContext";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../component/all-components",
  pageFullPath: "test/demo/mock/component/all-components",
  integratedHsp: "false",
} as NavInterface));
class DataSource implements IDataSource<number> {
  public totalCount(): int {
    return 1;
  }
  
  public getData(index: int): number {
    return 1;
  }
  
  public registerDataChangeListener(listener: DataChangeListener): void {}
  
  public unregisterDataChangeListener(listener: DataChangeListener): void {}
  
  public constructor() {}
  
}

class ANodeController extends NodeController {
  public makeNode(uiContext: UIContext): (FrameNode | null) {
    return null;
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_controller = ((({let gensym___93787132 = initializers;
    (((gensym___93787132) == (null)) ? undefined : gensym___93787132.controller)})) ?? (new RichEditorController()));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_controller?: RichEditorController;
  public get controller(): RichEditorController {
    return (this.__backing_controller as RichEditorController);
  }
  
  public set controller(value: RichEditorController) {
    this.__backing_controller = value;
  }
  
  @Memo() 
  public build() {
    Badge(@Memo() ((instance: BadgeAttribute): void => {
      instance.setBadgeOptions(({
        value: "1234",
        style: {
          badgeSize: 30,
        },
      } as BadgeParamWithString));
      instance.applyAttributesFinish();
      return;
    }), undefined);
    ContainerSpan(@Memo() ((instance: ContainerSpanAttribute): void => {
      instance.setContainerSpanOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Counter(@Memo() ((instance: CounterAttribute): void => {
      instance.setCounterOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    DataPanel(@Memo() ((instance: DataPanelAttribute): void => {
      instance.setDataPanelOptions(({
        values: [12.3, 21.1, 13.4, 35.2, 26.0, 32.0],
        max: 140.0,
        type: DataPanelType.Circle,
      } as DataPanelOptions));
      instance.applyAttributesFinish();
      return;
    }));
    Gauge(@Memo() ((instance: GaugeAttribute): void => {
      instance.setGaugeOptions(({
        value: 50.0,
        min: 1.0,
        max: 100.0,
      } as GaugeOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Hyperlink(@Memo() ((instance: HyperlinkAttribute): void => {
      instance.setHyperlinkOptions("123", undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    ImageSpan(@Memo() ((instance: ImageSpanAttribute): void => {
      instance.setImageSpanOptions(_r(16777217, 20000, "com.example.mock", "entry"));
      instance.applyAttributesFinish();
      return;
    }));
    LoadingProgress(@Memo() ((instance: LoadingProgressAttribute): void => {
      instance.setLoadingProgressOptions();
      instance.applyAttributesFinish();
      return;
    }));
    Marquee(@Memo() ((instance: MarqueeAttribute): void => {
      instance.setMarqueeOptions(({
        start: true,
        src: "123",
      } as MarqueeOptions));
      instance.applyAttributesFinish();
      return;
    }));
    PatternLock(@Memo() ((instance: PatternLockAttribute): void => {
      instance.setPatternLockOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Progress(@Memo() ((instance: ProgressAttribute): void => {
      instance.setProgressOptions(({
        value: 20.0,
      } as ProgressOptions));
      instance.applyAttributesFinish();
      return;
    }));
    QRCode(@Memo() ((instance: QRCodeAttribute): void => {
      instance.setQRCodeOptions("123");
      instance.applyAttributesFinish();
      return;
    }));
    RichEditor(@Memo() ((instance: RichEditorAttribute): void => {
      instance.setRichEditorOptions(({
        controller: this.controller,
      } as RichEditorOptions));
      instance.applyAttributesFinish();
      return;
    }));
    Search(@Memo() ((instance: SearchAttribute): void => {
      instance.setSearchOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Span(@Memo() ((instance: SpanAttribute): void => {
      instance.setSpanOptions("1234");
      instance.applyAttributesFinish();
      return;
    }));
    SymbolSpan(@Memo() ((instance: SymbolSpanAttribute): void => {
      instance.setSymbolSpanOptions(_r(16777216, 10003, "com.example.mock", "entry"));
      instance.applyAttributesFinish();
      return;
    }));
    SymbolGlyph(@Memo() ((instance: SymbolGlyphAttribute): void => {
      instance.setSymbolGlyphOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Text(@Memo() ((instance: TextAttribute): void => {
      instance.setTextOptions("1234", undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    TextArea(@Memo() ((instance: TextAreaAttribute): void => {
      instance.setTextAreaOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    TextClock(@Memo() ((instance: TextClockAttribute): void => {
      instance.setTextClockOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    TextInput(@Memo() ((instance: TextInputAttribute): void => {
      instance.setTextInputOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    TextTimer(@Memo() ((instance: TextTimerAttribute): void => {
      instance.setTextTimerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    ArcAlphabetIndexer(@Memo() ((instance: ArcAlphabetIndexerAttribute): void => {
      instance.setArcAlphabetIndexerOptions(({
        arrayValue: ["12"],
        selected: 1,
      } as ArcAlphabetIndexerInitInfo));
      instance.applyAttributesFinish();
      return;
    }));
    ArcSwiper(@Memo() ((instance: ArcSwiperAttribute): void => {
      instance.setArcSwiperOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    AlphabetIndexer(@Memo() ((instance: AlphabetIndexerAttribute): void => {
      instance.setAlphabetIndexerOptions(({
        arrayValue: ["12"],
        selected: 1,
      } as AlphabetIndexerOptions));
      instance.applyAttributesFinish();
      return;
    }));
    IndicatorComponent(@Memo() ((instance: IndicatorComponentAttribute): void => {
      instance.setIndicatorComponentOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    NavDestination(@Memo() ((instance: NavDestinationAttribute): void => {
      instance.setNavDestinationOptions({
        moduleName: "entry",
        pagePath: "mock/component/all-components",
      });
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Navigation(@Memo() ((instance: NavigationAttribute): void => {
      instance.setNavigationOptions(undefined, {
        moduleName: "entry",
        pagePath: "mock/component/all-components",
        isUserCreateStack: false,
      });
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    SideBarContainer(@Memo() ((instance: SideBarContainerAttribute): void => {
      instance.setSideBarContainerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Swiper(@Memo() ((instance: SwiperAttribute): void => {
      instance.setSwiperOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    TabContent(@Memo() ((instance: TabContentAttribute): void => {
      instance.setTabContentOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Tabs(@Memo() ((instance: TabsAttribute): void => {
      instance.setTabsOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    WithTheme(@Memo() ((instance: WithThemeAttribute): void => {
      instance.setWithThemeOptions(({} as WithThemeOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    EmbeddedComponent(@Memo() ((instance: EmbeddedComponentAttribute): void => {
      instance.setEmbeddedComponentOptions(({} as Want), undefined);
      instance.applyAttributesFinish();
      return;
    }));
    PluginComponent(@Memo() ((instance: PluginComponentAttribute): void => {
      instance.setPluginComponentOptions(({
        template: ({
          source: "123",
          bundleName: "1234",
        } as PluginComponentTemplate),
        data: ({} as RecordData),
      } as PluginComponentOptions));
      instance.applyAttributesFinish();
      return;
    }));
    ToolBarItem(@Memo() ((instance: ToolBarItemAttribute): void => {
      instance.setToolBarItemOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    UIExtensionComponent(@Memo() ((instance: UIExtensionComponentAttribute): void => {
      instance.setUIExtensionComponentOptions(({} as Want), undefined);
      instance.applyAttributesFinish();
      return;
    }));
    XComponent(@Memo() ((instance: XComponentAttribute): void => {
      instance.setXComponentOptions(({
        id: "123",
        type: XComponentType.SURFACE,
        nativeXComponentHandler: ((data: NativeXComponentPointer) => {}),
      } as XComponentParameters));
      instance.applyAttributesFinish();
      return;
    }));
    Button(@Memo() ((instance: ButtonAttribute): void => {
      instance.setButtonOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Button(@Memo() ((instance: ButtonAttribute): void => {
      instance.setButtonOptions("123", undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    Checkbox(@Memo() ((instance: CheckboxAttribute): void => {
      instance.setCheckboxOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    CheckboxGroup(@Memo() ((instance: CheckboxGroupAttribute): void => {
      instance.setCheckboxGroupOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Menu(@Memo() ((instance: MenuAttribute): void => {
      instance.setMenuOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    MenuItem(@Memo() ((instance: MenuItemAttribute): void => {
      instance.setMenuItemOptions((() => {}));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    MenuItemGroup(@Memo() ((instance: MenuItemGroupAttribute): void => {
      instance.setMenuItemGroupOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Radio(@Memo() ((instance: RadioAttribute): void => {
      instance.setRadioOptions(({
        group: "123",
        value: "123",
      } as RadioOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Rating(@Memo() ((instance: RatingAttribute): void => {
      instance.setRatingOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Select(@Memo() ((instance: SelectAttribute): void => {
      instance.setSelectOptions([({
        value: "123",
      } as SelectOption)]);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Slider(@Memo() ((instance: SliderAttribute): void => {
      instance.setSliderOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Toggle(@Memo() ((instance: ToggleAttribute): void => {
      instance.setToggleOptions(({
        type: ToggleType.Checkbox,
      } as ToggleOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    CalendarPicker(@Memo() ((instance: CalendarPickerAttribute): void => {
      instance.setCalendarPickerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    DatePicker(@Memo() ((instance: DatePickerAttribute): void => {
      instance.setDatePickerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Image(@Memo() ((instance: ImageAttribute): void => {
      instance.setImageOptions("123", undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Image(@Memo() ((instance: ImageAttribute): void => {
      instance.setImageOptions("123", ({} as ImageAIOptions));
      instance.applyAttributesFinish();
      return;
    }));
    Image(@Memo() ((instance: ImageAttribute): void => {
      instance.setImageOptions("123", "1234");
      instance.applyAttributesFinish();
      return;
    }));
    ImageAnimator(@Memo() ((instance: ImageAnimatorAttribute): void => {
      instance.setImageAnimatorOptions();
      instance.applyAttributesFinish();
      return;
    }));
    TextPicker(@Memo() ((instance: TextPickerAttribute): void => {
      instance.setTextPickerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    TimePicker(@Memo() ((instance: TimePickerAttribute): void => {
      instance.setTimePickerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    UIPickerComponent(@Memo() ((instance: UIPickerComponentAttribute): void => {
      instance.setUIPickerComponentOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    ContentSlot(@Memo() ((instance: ContentSlotAttribute): void => {
      instance.setContentSlotOptions(({} as Content));
      instance.applyAttributesFinish();
      return;
    }));
    ForEach(@Memo() ((instance: ForEachAttribute): void => {
      instance.setForEachOptions((() => {
        return [1, 2, 3];
      }), ((item: int, index: int) => {}), undefined);
      instance.applyAttributesFinish();
      return;
    }));
    If(@Memo() ((instance: IfAttribute): void => {
      instance.setIfOptions(true);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    LazyForEach(@Memo() ((instance: LazyForEachAttribute): void => {
      instance.setLazyForEachOptions(new DataSource(), ((item: number, index: int) => {}), undefined);
      instance.applyAttributesFinish();
      return;
    }));
    NodeContainer(@Memo() ((instance: NodeContainerAttribute): void => {
      instance.setNodeContainerOptions(new ANodeController());
      instance.applyAttributesFinish();
      return;
    }));
    Repeat<number>(@Memo() ((instance): void => {
      instance.setRepeatOptions<number>([1, 2, 3]);
      instance.applyAttributesFinish();
      return;
    }));
    EffectComponent(@Memo() ((instance: EffectComponentAttribute): void => {
      instance.setEffectComponentOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), undefined);
    Particle(@Memo() ((instance: ParticleAttribute): void => {
      instance.setParticleOptions(({
        particles: [({
          emitter: ({
            particle: ({
              type: ParticleType.POINT,
              config: ({
                radius: "123",
              } as PointParticleParameters),
              count: 1,
            } as EmitterParticleOptions),
          } as EmitterOptions),
        } as ParticleOptions)],
      } as Particles));
      instance.applyAttributesFinish();
      return;
    }));
    UnionEffectContainer(@Memo() ((instance: UnionEffectContainerAttribute): void => {
      instance.setUnionEffectContainerOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    ArcList(@Memo() ((instance: ArcListAttribute): void => {
      instance.setArcListOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    ArcListItem(@Memo() ((instance: ArcListItemAttribute): void => {
      instance.setArcListItemOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    ArcScrollBar(@Memo() ((instance: ArcScrollBarAttribute): void => {
      instance.setArcScrollBarOptions(({
        scroller: new Scroller(),
      } as ArcScrollBarOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Grid(@Memo() ((instance: GridAttribute): void => {
      instance.setGridOptions(undefined, undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    LazyVGridLayout(@Memo() ((instance: LazyVGridLayoutAttribute): void => {
      instance.setLazyVGridLayoutOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    List(@Memo() ((instance: ListAttribute): void => {
      instance.setListOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Refresh(@Memo() ((instance: RefreshAttribute): void => {
      instance.setRefreshOptions({
        refreshing: true,
      });
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Scroll(@Memo() ((instance: ScrollAttribute): void => {
      instance.setScrollOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    ScrollBar(@Memo() ((instance: ScrollBarAttribute): void => {
      instance.setScrollBarOptions(({
        scroller: new Scroller(),
      } as ScrollBarOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    WaterFlow(@Memo() ((instance: WaterFlowAttribute): void => {
      instance.setWaterFlowOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Blank(@Memo() ((instance: BlankAttribute): void => {
      instance.setBlankOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }));
    Column(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    ColumnSplit(@Memo() ((instance: ColumnSplitAttribute): void => {
      instance.setColumnSplitOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Divider(@Memo() ((instance: DividerAttribute): void => {
      instance.setDividerOptions();
      instance.applyAttributesFinish();
      return;
    }));
    Flex(@Memo() ((instance: FlexAttribute): void => {
      instance.setFlexOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    FolderStack(@Memo() ((instance: FolderStackAttribute): void => {
      instance.setFolderStackOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    GridCol(@Memo() ((instance: GridColAttribute): void => {
      instance.setGridColOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    GridRow(@Memo() ((instance: GridRowAttribute): void => {
      instance.setGridRowOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    RelativeContainer(@Memo() ((instance: RelativeContainerAttribute): void => {
      instance.setRelativeContainerOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Row(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    RowSplit(@Memo() ((instance: RowSplitAttribute): void => {
      instance.setRowSplitOptions();
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
    Stack(@Memo() ((instance: StackAttribute): void => {
      instance.setStackOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  ${dumpConstructor()}
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() interface __Options_MyStateSample {
  get controller(): (RichEditorController | undefined) {
    return undefined;
  }
  set controller(controller: (RichEditorController | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_controller(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_controller(__options_has_controller: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test all components transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);