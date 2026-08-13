/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { Plugins } from '../../../../common/plugin-context';
import { uiTransform } from '../../../../ui-plugins/index';
import { dumpAnnotation } from '../../../utils/simplify-dump';

const ADVANCED_UI_COMPONENTS_DIR_PATH: string = 'advanced-ui-components';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        ADVANCED_UI_COMPONENTS_DIR_PATH,
        'mock-chipgroup.ets'
    ),
];

const pluginTester = new PluginTester('test advanced-ui-components mock-chipgroup', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `

import { STATE_MGMT_FACTORY } from "arkui.component.customComponent";

import { IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { SymbolGlyphImpl } from "arkui.component.symbolglyph";

import { SymbolGlyphAttribute } from "arkui.component.symbolglyph";

import { Memo } from "arkui.incremental.annotation";

import { MemoSkip } from "arkui.incremental.annotation";

import { ImageImpl } from "arkui.component.image";

import { ImageAttribute } from "arkui.component.image";

import { ButtonImpl } from "arkui.component.button";

import { ButtonAttribute } from "arkui.component.button";

import { ForEachImpl } from "arkui.component.forEach";

import { ForEachAttribute } from "arkui.component.forEach";

import { RowImpl } from "arkui.component.row";

import { RowAttribute } from "arkui.component.row";

import { EffectComponentImpl } from "arkui.component.effectComponent";

import { EffectComponentAttribute } from "arkui.component.effectComponent";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { makeBuilderParameterProxy } from "arkui.component.builder";

import { ScrollImpl } from "arkui.component.scroll";

import { ScrollAttribute } from "arkui.component.scroll";

import { StackImpl } from "arkui.component.stack";

import { StackAttribute } from "arkui.component.stack";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { $r, ResourceStr, SizeOptions, Length, ResourceColor, VoidCallback, Dimension, UIContext, Resource, Component, SymbolEffect, Builder, SymbolGlyph, SymbolEffectStrategy, Image, Row, ForEach, Button, BuilderParam, Scroller, Stack, Scroll, ScrollDirection, BarState, Alignment, BlendMode, BlendApplyType, HitTestMode, RowOptions, Padding, ButtonOptions, ButtonType, Color, Text, EffectComponent } from "@ohos.arkui.component";

import { Consume, Link, Watch, ObjectLink, Observed, Require, State, Provide, PropRef, UIUtils } from "@ohos.arkui.stateManagement";

import { SymbolGlyphModifier } from "@ohos.arkui.modifier";

import { AccessibilitySelectedType, Chip, ChipSize, ChipSuffixSymbolGlyphOptions, ChipSymbolGlyphOptions, CloseOptions, PrefixIconOptions, SuffixIconOptions, ChipOptions, LabelOptions } from "@ohos.arkui.advanced.Chip";

import resourceManager from "@ohos.resourceManager";

import hilog from "@ohos.hilog";

import uiMaterial from "@ohos.arkui.uiMaterial";

import deviceInfo from "@ohos.deviceInfo";

const noop = ((selectedIndexes: Array<int>) => {});
const colorStops: Array<[ResourceColor, number]> = [["rgba(0, 0, 0, 1)", 0], ["rgba(0, 0, 0, 0)", 1]];
const defaultTheme: ChipGroupTheme = {
  itemStyle: {
    size: ChipSize.NORMAL,
    backgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
    fontColor: _r(16777216, 10003, "com.example.mock", "entry"),
    selectedFontColor: _r(16777216, 10003, "com.example.mock", "entry"),
    selectedBackgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
    fillColor: _r(16777216, 10003, "com.example.mock", "entry"),
    selectedFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
  },
  chipGroupSpace: {
    itemSpace: 8,
    startSpace: 16,
    endSpace: 16,
  },
  chipGroupPadding: {
    top: 14,
    bottom: 14,
  },
  chipBackgroundSystemMaterial: new uiMaterial.ImmersiveMaterial({
    style: uiMaterial.ImmersiveStyle.ULTRA_THIN,
  }),
  chipSelectedBackgroundSystemMaterial: new uiMaterial.ImmersiveMaterial({
    style: uiMaterial.ImmersiveStyle.ULTRA_THIN,
    materialColor: _r(16777216, 10003, "com.example.mock", "entry"),
  }),
  iconBackgroundSystemMaterial: new uiMaterial.ImmersiveMaterial({
    style: uiMaterial.ImmersiveStyle.ULTRA_THIN,
  }),
};
const iconGroupSuffixTheme: IconGroupSuffixTheme = {
  backgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
  borderRadius: _r(16777216, 10003, "com.example.mock", "entry"),
  smallIconSize: 16,
  normalIconSize: 24,
  smallBackgroundSize: 28,
  normalBackgroundSize: 36,
  marginLeft: 8,
  marginRight: 16,
  fillColor: _r(16777216, 10003, "com.example.mock", "entry"),
  defaultEffect: -1,
};
function main() {}

function getChipItemStyle(tar: ChipGroupStyleTheme) {
  return ({
    size: tar.size,
    backgroundColor: tar.backgroundColor,
    fontColor: tar.fontColor,
    selectedFontColor: tar.selectedFontColor,
    selectedBackgroundColor: tar.selectedBackgroundColor,
  } as ChipItemStyle);
}

function parseDimension<T>(uiContext: UIContext, value: (Dimension | Length | undefined), isValid: InnerCallback<string, boolean>, defaultValue: T): T {
  if (((((value) === (undefined))) || (((value) === (null))))) {
    return defaultValue;
  }
  const resourceManager = ({let gensym%%_9 = uiContext.getHostContext();
  (((gensym%%_9) == (null)) ? undefined : gensym%%_9.resourceManager)});
  if (!resourceManager) {
    return defaultValue;
  }
  if ((((typeof value)) === ("object"))) {
    let temp: Resource = (value as Resource);
    if (((((temp.type) === (10002))) || (((temp.type) === (10007))))) {
      if (((resourceManager) && (((resourceManager.getDouble(temp.id)) >= (0))))) {
        return (value as T);
      }
    } else {
      if (((temp.type) === (10003))) {
        let stringValue: string = "";
        try {
          stringValue = resourceManager.getStringSync(temp.id);
        } catch (err) {
          stringValue = "";
        }
        if (((resourceManager) && (isValidDimensionString(stringValue)))) {
          return (value as T);
        }
      }
    }
  } else {
    if ((((typeof value)) === ("number"))) {
      if ((((value as number)) >= (0))) {
        return (value as T);
      }
    } else {
      if ((((typeof value)) === ("string"))) {
        if (isValid((value as string))) {
          return (value as T);
        }
      }
    }
  }
  return defaultValue;
}

function isValidString(dimension: string, regex: RegExp): boolean {
  const matches = dimension.match(regex);
  if (((((!matches) || (((matches.length) < (3))))) || (!(matches[1])))) {
    return false;
  }
  const value = Number.parseFloat(matches[1]!);
  return ((value) >= (0));
}

function isValidDimensionString(dimension: string): boolean {
  return isValidString(dimension, new RegExp("(-?\\d+(?:\\.\\d+)?)_?(fp|vp|px|lpx|%)?$", "i"));
}

function isValidDimensionNoPercentageString(dimension: string): boolean {
  return isValidString(dimension, new RegExp("(-?\\d+(?:\\.\\d+)?)_?(fp|vp|px|lpx)?$", "i"));
}

function toStringFormat(resource: (ResourceStr | undefined)): string {
  try {
    if ((((typeof resource)) === ("undefined"))) {
      return "";
    } else {
      if ((((typeof resource)) === ("string"))) {
        return (resource as string);
      } else {
        return resourceManager.getSysResourceManager().getStringSync((resource as Resource).id);
      }
    }
  } catch (error) {
    let code: (number | undefined) = (error as ClassCastError).code;
    let message: (string | undefined) = (error as ClassCastError).message;
    hilog.error(0x3900, "Chip", \`toStringFormat error, code: \${code}, message: \${message}\`);
    return "";
  }
}

function withDefaultMaterial(material: (uiMaterial.Material | undefined), defaultMaterial: uiMaterial.Material): (uiMaterial.Material | undefined) {
  return material;
}

function enableEffectComponent(material: (uiMaterial.Material | undefined)): boolean {
  return false;
}

function createECMaterial(material: (uiMaterial.Material | undefined)): (uiMaterial.Material | undefined) {
  return material;
}

function createSubECMaterial(material: (uiMaterial.Material | undefined)): (uiMaterial.Material | undefined) {
  return material;
}


type InnerCallback<T, V = void> = ((data: T)=> V);

interface ChipGroupTheme {
  get itemStyle(): ChipGroupStyleTheme
  set itemStyle(itemStyle: ChipGroupStyleTheme)
  get chipGroupSpace(): ChipGroupSpaceOptions
  set chipGroupSpace(chipGroupSpace: ChipGroupSpaceOptions)
  get chipGroupPadding(): ChipGroupPaddingOptions
  set chipGroupPadding(chipGroupPadding: ChipGroupPaddingOptions)
  get chipBackgroundSystemMaterial(): uiMaterial.Material
  set chipBackgroundSystemMaterial(chipBackgroundSystemMaterial: uiMaterial.Material)
  get chipSelectedBackgroundSystemMaterial(): uiMaterial.Material
  set chipSelectedBackgroundSystemMaterial(chipSelectedBackgroundSystemMaterial: uiMaterial.Material)
  get iconBackgroundSystemMaterial(): uiMaterial.Material
  set iconBackgroundSystemMaterial(iconBackgroundSystemMaterial: uiMaterial.Material)
  
}

final class ChipGroupHeight extends BaseEnum<int> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  
  private constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly NORMAL: ChipGroupHeight = new ChipGroupHeight(0, 36);
  public static readonly SMALL: ChipGroupHeight = new ChipGroupHeight(1, 28);
  private static readonly #NamesArray: String[] = ["NORMAL", "SMALL"];
  private static readonly #ValuesArray: int[] = [36, 28];
  private static readonly #StringValuesArray: String[] = ["36", "28"];
  private static readonly #ItemsArray: ChipGroupHeight[] = [ChipGroupHeight.NORMAL, ChipGroupHeight.SMALL];
  public getName(): String {
    return ChipGroupHeight.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): ChipGroupHeight {
    for (let i = ((ChipGroupHeight.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (ChipGroupHeight.#NamesArray[i]))) {
        return ChipGroupHeight.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant ChipGroupHeight.") + (name)));
  }
  
  public static fromValue(value: int): ChipGroupHeight {
    for (let i = ((ChipGroupHeight.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (ChipGroupHeight.#ValuesArray[i]))) {
        return ChipGroupHeight.#ItemsArray[i];
      }
    }
    throw new Error((("No enum ChipGroupHeight with value ") + (value)));
  }
  
  public valueOf(): int {
    return ChipGroupHeight.#ValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return ChipGroupHeight.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): ChipGroupHeight[] {
    return ChipGroupHeight.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: ChipGroupHeight): String {
    return e.getName();
  }
  
}

export interface IconOptions {
  get src(): ResourceStr
  set src(src: ResourceStr)
  get size(): (SizeOptions | undefined) {
    return undefined;
  }
  set size(size: (SizeOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface ChipGroupPaddingOptions {
  get top(): Length
  set top(top: Length)
  get bottom(): Length
  set bottom(bottom: Length)
  
}

interface ChipGroupStyleTheme {
  get size(): (ChipSize | SizeOptions)
  set size(size: (ChipSize | SizeOptions))
  get backgroundColor(): ResourceColor
  set backgroundColor(backgroundColor: ResourceColor)
  get fontColor(): ResourceColor
  set fontColor(fontColor: ResourceColor)
  get selectedFontColor(): ResourceColor
  set selectedFontColor(selectedFontColor: ResourceColor)
  get selectedBackgroundColor(): ResourceColor
  set selectedBackgroundColor(selectedBackgroundColor: ResourceColor)
  get fillColor(): ResourceColor
  set fillColor(fillColor: ResourceColor)
  get selectedFillColor(): ResourceColor
  set selectedFillColor(selectedFillColor: ResourceColor)
  
}

export interface ChipItemLabelOptions {
  get text(): string
  set text(text: string)
  
}

export interface SuffixImageIconOptions extends IconOptions {
  get action(): (VoidCallback | undefined) {
    return undefined;
  }
  set action(action: (VoidCallback | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityText(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityText(accessibilityText: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityDescription(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityDescription(accessibilityDescription: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface ChipGroupItemOptions {
  get prefixIcon(): (IconOptions | undefined) {
    return undefined;
  }
  set prefixIcon(prefixIcon: (IconOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get prefixSymbol(): (ChipSymbolGlyphOptions | undefined) {
    return undefined;
  }
  set prefixSymbol(prefixSymbol: (ChipSymbolGlyphOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get label(): ChipItemLabelOptions
  set label(label: ChipItemLabelOptions)
  get suffixImageIcon(): (SuffixImageIconOptions | undefined) {
    return undefined;
  }
  set suffixImageIcon(suffixImageIcon: (SuffixImageIconOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get suffixSymbol(): (ChipSymbolGlyphOptions | undefined) {
    return undefined;
  }
  set suffixSymbol(suffixSymbol: (ChipSymbolGlyphOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get suffixSymbolOptions(): (ChipSuffixSymbolGlyphOptions | undefined) {
    return undefined;
  }
  set suffixSymbolOptions(suffixSymbolOptions: (ChipSuffixSymbolGlyphOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get allowClose(): (boolean | undefined) {
    return undefined;
  }
  set allowClose(allowClose: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get closeOptions(): (CloseOptions | undefined) {
    return undefined;
  }
  set closeOptions(closeOptions: (CloseOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityDescription(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityDescription(accessibilityDescription: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface ChipItemStyle {
  get size(): ((ChipSize | SizeOptions) | undefined) {
    return undefined;
  }
  set size(size: ((ChipSize | SizeOptions) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get backgroundColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set backgroundColor(backgroundColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set fontColor(fontColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get selectedFontColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set selectedFontColor(selectedFontColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get selectedBackgroundColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set selectedBackgroundColor(selectedBackgroundColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface ChipGroupSpaceOptions {
  get itemSpace(): ((number | string) | undefined) {
    return undefined;
  }
  set itemSpace(itemSpace: ((number | string) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get startSpace(): (Length | undefined) {
    return undefined;
  }
  set startSpace(startSpace: (Length | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get endSpace(): (Length | undefined) {
    return undefined;
  }
  set endSpace(endSpace: (Length | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface IconItemOptions {
  get icon(): IconOptions
  set icon(icon: IconOptions)
  get action(): VoidCallback
  set action(action: VoidCallback)
  get accessibilityText(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityText(accessibilityText: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityDescription(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityDescription(accessibilityDescription: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

export interface SymbolItemOptions {
  get symbol(): SymbolGlyphModifier
  set symbol(symbol: SymbolGlyphModifier)
  get action(): VoidCallback
  set action(action: VoidCallback)
  get accessibilityText(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityText(accessibilityText: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityDescription(): (ResourceStr | undefined) {
    return undefined;
  }
  set accessibilityDescription(accessibilityDescription: (ResourceStr | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

interface IconGroupSuffixTheme {
  get smallIconSize(): number
  set smallIconSize(smallIconSize: number)
  get normalIconSize(): number
  set normalIconSize(normalIconSize: number)
  get backgroundColor(): ResourceColor
  set backgroundColor(backgroundColor: ResourceColor)
  get smallBackgroundSize(): number
  set smallBackgroundSize(smallBackgroundSize: number)
  get normalBackgroundSize(): number
  set normalBackgroundSize(normalBackgroundSize: number)
  get borderRadius(): Dimension
  set borderRadius(borderRadius: Dimension)
  get marginLeft(): number
  set marginLeft(marginLeft: number)
  get marginRight(): number
  set marginRight(marginRight: number)
  get fillColor(): ResourceColor
  set fillColor(fillColor: ResourceColor)
  get defaultEffect(): number
  set defaultEffect(defaultEffect: number)
  
}

@Component() export final struct IconGroupSuffix extends CustomComponent<IconGroupSuffix, __Options_IconGroupSuffix> {
  public __initializeStruct(initializers: (__Options_IconGroupSuffix | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_chipSize = STATE_MGMT_FACTORY.makeConsume<(ChipSize | SizeOptions)>(this, "chipSize", "chipSize");
    this.__backing_refreshCnt = STATE_MGMT_FACTORY.makeState<int>(this, "refreshCnt", (({let gensym___83786427 = initializers;
    (((gensym___83786427) == (null)) ? undefined : gensym___83786427.__options_has_refreshCnt)}) ? (initializers!.refreshCnt as int) : (0 as int)));
    this.__backing_items = STATE_MGMT_FACTORY.makePropRef<Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>>(this, "items", (({let gensym___9401810 = initializers;
    (((gensym___9401810) == (null)) ? undefined : gensym___9401810.__options_has_items)}) ? (initializers!.items as Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>) : (new Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>() as Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>)), ((_: string): void => {
      this.onItems(_);
    }));
    this.__backing_iconBackgroundSystemMaterial = STATE_MGMT_FACTORY.makePropRef<(uiMaterial.Material | undefined)>(this, "iconBackgroundSystemMaterial", (({let gensym___252835145 = initializers;
    (((gensym___252835145) == (null)) ? undefined : gensym___252835145.__options_has_iconBackgroundSystemMaterial)}) ? (initializers!.iconBackgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_symbolEffect = (({let gensym___16817839 = initializers;
    (((gensym___16817839) == (null)) ? undefined : gensym___16817839.__options_has_symbolEffect)}) ? (initializers!.symbolEffect as SymbolEffect) : (new SymbolEffect() as SymbolEffect));
  }
  
  public __updateStruct(initializers: (__Options_IconGroupSuffix | undefined)): void {
    if (({let gensym___104432943 = initializers;
    (((gensym___104432943) == (null)) ? undefined : gensym___104432943.__options_has_items)})) {
      this.__backing_items!.update((initializers!.items as Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>));
    }
    if (({let gensym___177944741 = initializers;
    (((gensym___177944741) == (null)) ? undefined : gensym___177944741.__options_has_iconBackgroundSystemMaterial)})) {
      this.__backing_iconBackgroundSystemMaterial!.update((initializers!.iconBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_IconGroupSuffix | undefined)): void {
    this.__backing_chipSize!.resetOnReuse("chipSize");
    this.__backing_refreshCnt!.resetOnReuse((((({let gensym___200150809 = initializers;
    (((gensym___200150809) == (null)) ? undefined : gensym___200150809.refreshCnt)})) ?? (0)) as int));
    this.__backing_items!.resetOnReuse((((({let gensym___28845123 = initializers;
    (((gensym___28845123) == (null)) ? undefined : gensym___28845123.items)})) ?? (new Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>())) as Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>));
    this.__backing_iconBackgroundSystemMaterial!.resetOnReuse(((({let gensym___30091805 = initializers;
    (((gensym___30091805) == (null)) ? undefined : gensym___30091805.iconBackgroundSystemMaterial)})) ?? (undefined)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: IconGroupSuffix)=> void) | undefined), initializers: ((()=> __Options_IconGroupSuffix) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<IconGroupSuffix, __Options_IconGroupSuffix>(style, ((): IconGroupSuffix => {
      return new IconGroupSuffix(false, ({let gensym___64599093 = storage;
      (((gensym___64599093) == (null)) ? undefined : gensym___64599093())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_IconGroupSuffix, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): IconGroupSuffix {
    throw new Error("Declare interface");
  }
  
  private __backing_chipSize?: IConsumeDecoratedVariable<(ChipSize | SizeOptions)>;
  public get chipSize(): (ChipSize | SizeOptions) {
    return this.__backing_chipSize!.get();
  }
  
  public set chipSize(value: (ChipSize | SizeOptions)) {
    this.__backing_chipSize!.set(value);
  }
  
  private __backing_refreshCnt?: IStateDecoratedVariable<int>;
  public get refreshCnt(): int {
    return this.__backing_refreshCnt!.get();
  }
  
  public set refreshCnt(value: int) {
    this.__backing_refreshCnt!.set(value);
  }
  
  private __backing_items?: IPropRefDecoratedVariable<Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>>;
  public get items(): Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)> {
    return this.__backing_items!.get();
  }
  
  public set items(value: Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>) {
    this.__backing_items!.set(value);
  }
  
  private __backing_iconBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get iconBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_iconBackgroundSystemMaterial!.get();
  }
  
  public set iconBackgroundSystemMaterial(value: (uiMaterial.Material | undefined)) {
    this.__backing_iconBackgroundSystemMaterial!.set(value);
  }
  
  private __backing_symbolEffect?: SymbolEffect;
  public get symbolEffect(): SymbolEffect {
    return (this.__backing_symbolEffect as SymbolEffect);
  }
  
  public set symbolEffect(value: SymbolEffect) {
    this.__backing_symbolEffect = value;
  }
  
  private onItems(_: string): void {
    (this.refreshCnt++);
  }
  
  private getBackgroundSize(): number {
    if (((this.chipSize) === (ChipSize.SMALL))) {
      return iconGroupSuffixTheme.smallBackgroundSize;
    } else {
      return iconGroupSuffixTheme.normalBackgroundSize;
    }
  }
  
  private getIconSize(val?: Length): Length {
    if (((val) === (undefined))) {
      return (((this.chipSize) === (ChipSize.SMALL)) ? iconGroupSuffixTheme.smallIconSize : iconGroupSuffixTheme.normalIconSize);
    }
    let value: Length;
    if (((this.chipSize) === (ChipSize.SMALL))) {
      value = parseDimension(this.getUIContext(), val, isValidDimensionString, iconGroupSuffixTheme.smallIconSize);
    } else {
      value = parseDimension(this.getUIContext(), val, isValidDimensionString, iconGroupSuffixTheme.normalIconSize);
    }
    return value;
  }
  
  @Memo() 
  public SymbolItemBuilder(@MemoSkip() item: SymbolItemOptions): void {
    SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
      instance.setSymbolGlyphOptions(undefined).fontColor([iconGroupSuffixTheme.fillColor]).fontSize(this.getIconSize()).attributeModifier(item.symbol).focusable(true).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, Double.toInt(iconGroupSuffixTheme.defaultEffect));
      instance.applyAttributesFinish();
      return;
    }));
  }
  
  @Memo() 
  public IconItemBuilder(@MemoSkip() item: IconItemOptions): void {
    ImageImpl(@Memo() ((instance: ImageAttribute): void => {
      instance.setImageOptions(item.icon.src, undefined).fillColor(iconGroupSuffixTheme.fillColor).size({
        width: this.getIconSize(({let gensym%%_1 = item.icon.size;
        (((gensym%%_1) == (null)) ? undefined : gensym%%_1.width)})),
        height: this.getIconSize(({let gensym%%_2 = item.icon.size;
        (((gensym%%_2) == (null)) ? undefined : gensym%%_2.height)})),
      }).focusable(true);
      instance.applyAttributesFinish();
      return;
    }));
  }
  
  @Memo() 
  public IconButtonsBuilder(@MemoSkip() material: (uiMaterial.Material | undefined)): void {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(({
        space: 8,
      } as RowOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ForEachImpl(@Memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions((() => {
          return this.items;
        }), @Memo() ((suffixItem: (IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)) => {
          ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
            instance.setButtonOptions(({
              type: ButtonType.Normal,
            } as ButtonOptions)).size({
              width: this.getBackgroundSize(),
              height: this.getBackgroundSize(),
            }).systemMaterial(material).backgroundColor(iconGroupSuffixTheme.backgroundColor).borderRadius(iconGroupSuffixTheme.borderRadius).accessibilityText(this.getAccessibilityText(suffixItem)).accessibilityDescription(this.getAccessibilityDescription(suffixItem)).accessibilityLevel(this.getAccessibilityLevel(suffixItem)).onClick((() => {
              if (((suffixItem) instanceof (IconItemOptions))) {
                (suffixItem as IconItemOptions).action();
              }
              if (((suffixItem) instanceof (SymbolItemOptions))) {
                (suffixItem as SymbolItemOptions).action();
              }
            }));
            instance.applyAttributesFinish();
            return;
          }), @Memo() (() => {
            if (((suffixItem) instanceof (SymbolGlyphModifier))) {
              SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
                instance.setSymbolGlyphOptions(undefined).fontColor([iconGroupSuffixTheme.fillColor]).fontSize(this.getIconSize()).attributeModifier((suffixItem as SymbolGlyphModifier)).focusable(true).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, Double.toInt(iconGroupSuffixTheme.defaultEffect));
                instance.applyAttributesFinish();
                return;
              }));
            } else {
              if (((suffixItem) instanceof (SymbolItemOptions))) {
                this.SymbolItemBuilder((suffixItem as SymbolItemOptions));
              } else {
                if (((suffixItem) instanceof (IconItemOptions))) {
                  this.IconItemBuilder((suffixItem as IconItemOptions));
                }
              }
            }
          }));
        }), ((suffixItem: (IconItemOptions | SymbolGlyphModifier | SymbolItemOptions), index: int) => {
          return \`\${this.refreshCnt}_\${index}\`;
        }));
        return;
      }));
    }));
  }
  
  @Memo() 
  public build(): void {
    if (((deviceInfo.sdkApiVersion) >= (26))) {
      if (enableEffectComponent(this.iconBackgroundSystemMaterial)) {
        EffectComponentImpl(@Memo() ((instance: EffectComponentAttribute): void => {
          instance.setEffectComponentOptions(undefined).systemMaterial(createECMaterial(withDefaultMaterial(this.iconBackgroundSystemMaterial, defaultTheme.iconBackgroundSystemMaterial)));
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {
          this.IconButtonsBuilder(createSubECMaterial(withDefaultMaterial(this.iconBackgroundSystemMaterial, defaultTheme.iconBackgroundSystemMaterial)));
        }));
      } else {
        this.IconButtonsBuilder(withDefaultMaterial(this.iconBackgroundSystemMaterial, defaultTheme.iconBackgroundSystemMaterial));
      }
    } else {
      this.IconButtonsBuilder(undefined);
    }
  }
  
  private isSymbolItem(item: (IconItemOptions | SymbolItemOptions)): boolean {
    return ((item) instanceof (SymbolItemOptions));
  }
  
  private getAccessibilityLevel(item: (IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)): string {
    if (((item) instanceof (SymbolGlyphModifier))) {
      return "auto";
    }
    return ((item.accessibilityLevel) ?? ("auto"));
  }
  
  private getAccessibilityDescription(item: (IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)): string {
    if (((((item) instanceof (SymbolGlyphModifier))) || ((((typeof item.accessibilityDescription)) === ("undefined"))))) {
      return "";
    }
    return toStringFormat(item.accessibilityDescription);
  }
  
  private getAccessibilityText(item: (IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)): string {
    if (((((item) instanceof (SymbolGlyphModifier))) || ((((typeof item.accessibilityText)) === ("undefined"))))) {
      return "";
    }
    return toStringFormat(item.accessibilityText);
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  public static _buildCompatibleNode(options: __Options_IconGroupSuffix): void {
    return;
  }
  
  static {
    
  }
}

@Builder() @Memo() export type ChipGroupSuffixBuilder = (()=> void);

export interface ChipItemsBuilderOptions {
  get backgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return undefined;
  }
  set backgroundSystemMaterial(backgroundSystemMaterial: (uiMaterial.Material | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return undefined;
  }
  set activatedBackgroundSystemMaterial(activatedBackgroundSystemMaterial: (uiMaterial.Material | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@Component() export final struct ChipGroup extends CustomComponent<ChipGroup, __Options_ChipGroup> {
  public __initializeStruct(initializers: (__Options_ChipGroup | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_items = STATE_MGMT_FACTORY.makePropRef<Array<ChipGroupItemOptions>>(this, "items", (({let gensym___154807979 = initializers;
    (((gensym___154807979) == (null)) ? undefined : gensym___154807979.__options_has_items)}) ? (initializers!.items as Array<ChipGroupItemOptions>) : (new Array<ChipGroupItemOptions>() as Array<ChipGroupItemOptions>)), ((_: string): void => {
      this.onItemsChange(_);
    }));
    this.__backing_itemStyle = STATE_MGMT_FACTORY.makePropRef<(ChipItemStyle | undefined)>(this, "itemStyle", (({let gensym___150266975 = initializers;
    (((gensym___150266975) == (null)) ? undefined : gensym___150266975.__options_has_itemStyle)}) ? (initializers!.itemStyle as (ChipItemStyle | undefined)) : (getChipItemStyle(defaultTheme.itemStyle) as (ChipItemStyle | undefined))), ((_: string): void => {
      this.itemStyleOnChange(_);
    }));
    this.__backing_chipSize = STATE_MGMT_FACTORY.makeProvide<(ChipSize | SizeOptions)>(this, "chipSize", "chipSize", (({let gensym___31308678 = initializers;
    (((gensym___31308678) == (null)) ? undefined : gensym___31308678.__options_has_chipSize)}) ? (initializers!.chipSize as (ChipSize | SizeOptions)) : (defaultTheme.itemStyle.size as (ChipSize | SizeOptions))), false);
    this.__backing_selectedIndexes = STATE_MGMT_FACTORY.makePropRef<(Array<int> | undefined)>(this, "selectedIndexes", (({let gensym___122416143 = initializers;
    (((gensym___122416143) == (null)) ? undefined : gensym___122416143.__options_has_selectedIndexes)}) ? (initializers!.selectedIndexes as (Array<int> | undefined)) : ([0] as (Array<int> | undefined))));
    this.__backing_multiple = STATE_MGMT_FACTORY.makePropRef<(boolean | undefined)>(this, "multiple", (({let gensym___47626593 = initializers;
    (((gensym___47626593) == (null)) ? undefined : gensym___47626593.__options_has_multiple)}) ? (initializers!.multiple as (boolean | undefined)) : (false as (boolean | undefined))), ((_: string): void => {
      this.onMultipleChange(_);
    }));
    this.__backing_chipGroupSpace = STATE_MGMT_FACTORY.makePropRef<(ChipGroupSpaceOptions | undefined)>(this, "chipGroupSpace", (({let gensym___146961257 = initializers;
    (((gensym___146961257) == (null)) ? undefined : gensym___146961257.__options_has_chipGroupSpace)}) ? (initializers!.chipGroupSpace as (ChipGroupSpaceOptions | undefined)) : (defaultTheme.chipGroupSpace as (ChipGroupSpaceOptions | undefined))));
    this.__backing_backgroundSystemMaterial = STATE_MGMT_FACTORY.makePropRef<(uiMaterial.Material | undefined)>(this, "backgroundSystemMaterial", (({let gensym___8460253 = initializers;
    (((gensym___8460253) == (null)) ? undefined : gensym___8460253.__options_has_backgroundSystemMaterial)}) ? (initializers!.backgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_selectedBackgroundSystemMaterial = STATE_MGMT_FACTORY.makePropRef<(uiMaterial.Material | undefined)>(this, "selectedBackgroundSystemMaterial", (({let gensym___58508055 = initializers;
    (((gensym___58508055) == (null)) ? undefined : gensym___58508055.__options_has_selectedBackgroundSystemMaterial)}) ? (initializers!.selectedBackgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_suffix = ((((({let gensym___59816598 = initializers;
    (((gensym___59816598) == (null)) ? undefined : gensym___59816598.suffix)})) ?? (content))) ?? (((({let gensym___59816598 = initializers;
    (((gensym___59816598) == (null)) ? undefined : gensym___59816598.suffix)})) ?? (undefined))));
    this.__backing_onChange = (({let gensym___230085569 = initializers;
    (((gensym___230085569) == (null)) ? undefined : gensym___230085569.__options_has_onChange)}) ? (initializers!.onChange as InnerCallback<Array<int>>) : (noop as InnerCallback<Array<int>>));
    this.__backing_scroller = (({let gensym___222932377 = initializers;
    (((gensym___222932377) == (null)) ? undefined : gensym___222932377.__options_has_scroller)}) ? (initializers!.scroller as Scroller) : (new Scroller() as Scroller));
    this.__backing_isReachEnd = STATE_MGMT_FACTORY.makeState<boolean>(this, "isReachEnd", (({let gensym___239540341 = initializers;
    (((gensym___239540341) == (null)) ? undefined : gensym___239540341.__options_has_isReachEnd)}) ? (initializers!.isReachEnd as boolean) : (false as boolean)));
    this.__backing_chipGroupPadding = STATE_MGMT_FACTORY.makePropRef<(ChipGroupPaddingOptions | undefined)>(this, "chipGroupPadding", (({let gensym___58892418 = initializers;
    (((gensym___58892418) == (null)) ? undefined : gensym___58892418.__options_has_chipGroupPadding)}) ? (initializers!.chipGroupPadding as (ChipGroupPaddingOptions | undefined)) : (defaultTheme.chipGroupPadding as (ChipGroupPaddingOptions | undefined))));
    this.__backing_refreshCnt = STATE_MGMT_FACTORY.makeState<int>(this, "refreshCnt", (({let gensym___221049592 = initializers;
    (((gensym___221049592) == (null)) ? undefined : gensym___221049592.__options_has_refreshCnt)}) ? (initializers!.refreshCnt as int) : (0 as int)));
  }
  
  public __updateStruct(initializers: (__Options_ChipGroup | undefined)): void {
    if (({let gensym___242572983 = initializers;
    (((gensym___242572983) == (null)) ? undefined : gensym___242572983.__options_has_items)})) {
      this.__backing_items!.update((initializers!.items as Array<ChipGroupItemOptions>));
    }
    if (({let gensym___21965309 = initializers;
    (((gensym___21965309) == (null)) ? undefined : gensym___21965309.__options_has_itemStyle)})) {
      this.__backing_itemStyle!.update((initializers!.itemStyle as (ChipItemStyle | undefined)));
    }
    if (({let gensym___87867310 = initializers;
    (((gensym___87867310) == (null)) ? undefined : gensym___87867310.__options_has_selectedIndexes)})) {
      this.__backing_selectedIndexes!.update((initializers!.selectedIndexes as (Array<int> | undefined)));
    }
    if (({let gensym___71718673 = initializers;
    (((gensym___71718673) == (null)) ? undefined : gensym___71718673.__options_has_multiple)})) {
      this.__backing_multiple!.update((initializers!.multiple as (boolean | undefined)));
    }
    if (({let gensym___40195262 = initializers;
    (((gensym___40195262) == (null)) ? undefined : gensym___40195262.__options_has_chipGroupSpace)})) {
      this.__backing_chipGroupSpace!.update((initializers!.chipGroupSpace as (ChipGroupSpaceOptions | undefined)));
    }
    if (({let gensym___240165126 = initializers;
    (((gensym___240165126) == (null)) ? undefined : gensym___240165126.__options_has_backgroundSystemMaterial)})) {
      this.__backing_backgroundSystemMaterial!.update((initializers!.backgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
    if (({let gensym___233249352 = initializers;
    (((gensym___233249352) == (null)) ? undefined : gensym___233249352.__options_has_selectedBackgroundSystemMaterial)})) {
      this.__backing_selectedBackgroundSystemMaterial!.update((initializers!.selectedBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
    if (({let gensym___230794727 = initializers;
    (((gensym___230794727) == (null)) ? undefined : gensym___230794727.__options_has_chipGroupPadding)})) {
      this.__backing_chipGroupPadding!.update((initializers!.chipGroupPadding as (ChipGroupPaddingOptions | undefined)));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ChipGroup | undefined)): void {
    this.__backing_items!.resetOnReuse((((({let gensym___249057386 = initializers;
    (((gensym___249057386) == (null)) ? undefined : gensym___249057386.items)})) ?? (new Array<ChipGroupItemOptions>())) as Array<ChipGroupItemOptions>));
    this.__backing_itemStyle!.resetOnReuse((((({let gensym___172157995 = initializers;
    (((gensym___172157995) == (null)) ? undefined : gensym___172157995.itemStyle)})) ?? (getChipItemStyle(defaultTheme.itemStyle))) as (ChipItemStyle | undefined)));
    this.__backing_chipSize!.resetOnReuse((((({let gensym___757336 = initializers;
    (((gensym___757336) == (null)) ? undefined : gensym___757336.chipSize)})) ?? (defaultTheme.itemStyle.size)) as (ChipSize | SizeOptions)));
    this.__backing_selectedIndexes!.resetOnReuse((((({let gensym___201459747 = initializers;
    (((gensym___201459747) == (null)) ? undefined : gensym___201459747.selectedIndexes)})) ?? ([0])) as (Array<int> | undefined)));
    this.__backing_multiple!.resetOnReuse((((({let gensym___248268746 = initializers;
    (((gensym___248268746) == (null)) ? undefined : gensym___248268746.multiple)})) ?? (false)) as (boolean | undefined)));
    this.__backing_chipGroupSpace!.resetOnReuse((((({let gensym___262216556 = initializers;
    (((gensym___262216556) == (null)) ? undefined : gensym___262216556.chipGroupSpace)})) ?? (defaultTheme.chipGroupSpace)) as (ChipGroupSpaceOptions | undefined)));
    this.__backing_backgroundSystemMaterial!.resetOnReuse(((({let gensym___211644045 = initializers;
    (((gensym___211644045) == (null)) ? undefined : gensym___211644045.backgroundSystemMaterial)})) ?? (undefined)));
    this.__backing_selectedBackgroundSystemMaterial!.resetOnReuse(((({let gensym___174728226 = initializers;
    (((gensym___174728226) == (null)) ? undefined : gensym___174728226.selectedBackgroundSystemMaterial)})) ?? (undefined)));
    this.__backing_isReachEnd!.resetOnReuse((((({let gensym___240600034 = initializers;
    (((gensym___240600034) == (null)) ? undefined : gensym___240600034.isReachEnd)})) ?? (false)) as boolean));
    this.__backing_chipGroupPadding!.resetOnReuse((((({let gensym___187384672 = initializers;
    (((gensym___187384672) == (null)) ? undefined : gensym___187384672.chipGroupPadding)})) ?? (defaultTheme.chipGroupPadding)) as (ChipGroupPaddingOptions | undefined)));
    this.__backing_refreshCnt!.resetOnReuse((((({let gensym___142717650 = initializers;
    (((gensym___142717650) == (null)) ? undefined : gensym___142717650.refreshCnt)})) ?? (0)) as int));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ChipGroup)=> void) | undefined), initializers: ((()=> __Options_ChipGroup) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ChipGroup, __Options_ChipGroup>(style, ((): ChipGroup => {
      return new ChipGroup(false, ({let gensym___148603986 = storage;
      (((gensym___148603986) == (null)) ? undefined : gensym___148603986())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ChipGroup, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ChipGroup {
    throw new Error("Declare interface");
  }
  
  private __backing_items?: IPropRefDecoratedVariable<Array<ChipGroupItemOptions>>;
  public get items(): Array<ChipGroupItemOptions> {
    return this.__backing_items!.get();
  }
  
  public set items(value: Array<ChipGroupItemOptions>) {
    this.__backing_items!.set(value);
  }
  
  private __backing_itemStyle?: IPropRefDecoratedVariable<(ChipItemStyle | undefined)>;
  public get itemStyle(): (ChipItemStyle | undefined) {
    return this.__backing_itemStyle!.get();
  }
  
  public set itemStyle(value: (ChipItemStyle | undefined)) {
    this.__backing_itemStyle!.set(value);
  }
  
  private __backing_chipSize?: IProvideDecoratedVariable<(ChipSize | SizeOptions)>;
  public get chipSize(): (ChipSize | SizeOptions) {
    return this.__backing_chipSize!.get();
  }
  
  public set chipSize(value: (ChipSize | SizeOptions)) {
    this.__backing_chipSize!.set(value);
  }
  
  private __backing_selectedIndexes?: IPropRefDecoratedVariable<(Array<int> | undefined)>;
  public get selectedIndexes(): (Array<int> | undefined) {
    return this.__backing_selectedIndexes!.get();
  }
  
  public set selectedIndexes(value: (Array<int> | undefined)) {
    this.__backing_selectedIndexes!.set(value);
  }
  
  private __backing_multiple?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public get multiple(): (boolean | undefined) {
    return this.__backing_multiple!.get();
  }
  
  public set multiple(value: (boolean | undefined)) {
    this.__backing_multiple!.set(value);
  }
  
  private __backing_chipGroupSpace?: IPropRefDecoratedVariable<(ChipGroupSpaceOptions | undefined)>;
  public get chipGroupSpace(): (ChipGroupSpaceOptions | undefined) {
    return this.__backing_chipGroupSpace!.get();
  }
  
  public set chipGroupSpace(value: (ChipGroupSpaceOptions | undefined)) {
    this.__backing_chipGroupSpace!.set(value);
  }
  
  private __backing_backgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get backgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_backgroundSystemMaterial!.get();
  }
  
  public set backgroundSystemMaterial(value: (uiMaterial.Material | undefined)) {
    this.__backing_backgroundSystemMaterial!.set(value);
  }
  
  private __backing_selectedBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get selectedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_selectedBackgroundSystemMaterial!.get();
  }
  
  public set selectedBackgroundSystemMaterial(value: (uiMaterial.Material | undefined)) {
    this.__backing_selectedBackgroundSystemMaterial!.set(value);
  }
  
  private __backing_suffix?: (ChipGroupSuffixBuilder | undefined);
  public get suffix(): (ChipGroupSuffixBuilder | undefined) {
    return this.__backing_suffix;
  }
  
  public set suffix(value: (ChipGroupSuffixBuilder | undefined)) {
    this.__backing_suffix = value;
  }
  
  private __backing_onChange?: InnerCallback<Array<int>>;
  public get onChange(): InnerCallback<Array<int>> {
    return (this.__backing_onChange as InnerCallback<Array<int>>);
  }
  
  public set onChange(value: InnerCallback<Array<int>>) {
    this.__backing_onChange = value;
  }
  
  private __backing_scroller?: Scroller;
  public get scroller(): Scroller {
    return (this.__backing_scroller as Scroller);
  }
  
  public set scroller(value: Scroller) {
    this.__backing_scroller = value;
  }
  
  private __backing_isReachEnd?: IStateDecoratedVariable<boolean>;
  public get isReachEnd(): boolean {
    return this.__backing_isReachEnd!.get();
  }
  
  public set isReachEnd(value: boolean) {
    this.__backing_isReachEnd!.set(value);
  }
  
  private __backing_chipGroupPadding?: IPropRefDecoratedVariable<(ChipGroupPaddingOptions | undefined)>;
  public get chipGroupPadding(): (ChipGroupPaddingOptions | undefined) {
    return this.__backing_chipGroupPadding!.get();
  }
  
  public set chipGroupPadding(value: (ChipGroupPaddingOptions | undefined)) {
    this.__backing_chipGroupPadding!.set(value);
  }
  
  private __backing_refreshCnt?: IStateDecoratedVariable<int>;
  public get refreshCnt(): int {
    return this.__backing_refreshCnt!.get();
  }
  
  public set refreshCnt(value: int) {
    this.__backing_refreshCnt!.set(value);
  }
  
  public onItemsChange(value: string): void {
    (this.refreshCnt++);
  }
  
  public onMultipleChange(value: string): void {
    this.selectedIndexes = this.getSelectedIndexes();
  }
  
  public itemStyleOnChange(value?: string): void {
    this.chipSize = this.getChipSize();
  }
  
  public aboutToAppear(): void {
    this.itemStyleOnChange();
    if (((this.getSelectedIndexes().length) === (0))) {
      this.selectedIndexes = [0];
    }
  }
  
  private getChipSize(): (ChipSize | SizeOptions) {
    if (((this.itemStyle) && (this.itemStyle!.size))) {
      if (((this.itemStyle!.size) instanceof (SizeOptions))) {
        const sizeOptions = (this.itemStyle!.size as SizeOptions);
        if (((!(sizeOptions.width)) || (!(sizeOptions.height)))) {
          return defaultTheme.itemStyle.size!;
        }
      }
      return this.itemStyle!.size!;
    }
    return defaultTheme.itemStyle.size;
  }
  
  private getFontColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.fontColor))) {
      if ((((typeof this.itemStyle!.fontColor)) === ("object"))) {
        let temp: Resource = (this.itemStyle!.fontColor! as Resource);
        if (((((temp) == (undefined))) || (((temp) == (null))))) {
          return defaultTheme.itemStyle.fontColor;
        }
        if (((temp.type) === (10001))) {
          return this.itemStyle!.fontColor!;
        }
        return defaultTheme.itemStyle.fontColor;
      }
      return this.itemStyle!.fontColor!;
    }
    return defaultTheme.itemStyle.fontColor;
  }
  
  private getSelectedFontColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.selectedFontColor))) {
      if ((((typeof this.itemStyle!.selectedFontColor)) === ("object"))) {
        let temp: Resource = (this.itemStyle!.selectedFontColor as Resource);
        if (((((temp) == (undefined))) || (((temp) == (null))))) {
          return defaultTheme.itemStyle.selectedFontColor;
        }
        if (((temp.type) === (10001))) {
          return this.itemStyle!.selectedFontColor!;
        }
        return defaultTheme.itemStyle.selectedFontColor;
      }
      return this.itemStyle!.selectedFontColor!;
    }
    return defaultTheme.itemStyle.selectedFontColor;
  }
  
  private getFillColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.fontColor))) {
      return this.itemStyle!.fontColor!;
    }
    return defaultTheme.itemStyle.fillColor;
  }
  
  private getSelectedFillColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.selectedFontColor))) {
      return this.itemStyle!.selectedFontColor!;
    }
    return defaultTheme.itemStyle.selectedFillColor;
  }
  
  private getBackgroundColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.backgroundColor))) {
      if ((((typeof this.itemStyle!.backgroundColor)) === ("object"))) {
        let temp: Resource = (this.itemStyle!.backgroundColor! as Resource);
        if (((((temp) == (undefined))) || (((temp) == (null))))) {
          return defaultTheme.itemStyle.backgroundColor;
        }
        if (((temp.type) === (10001))) {
          return this.itemStyle!.backgroundColor!;
        }
        return defaultTheme.itemStyle.backgroundColor;
      }
      return this.itemStyle!.backgroundColor!;
    }
    return defaultTheme.itemStyle.backgroundColor;
  }
  
  private getSelectedBackgroundColor(): ResourceColor {
    if (((this.itemStyle) && (this.itemStyle!.selectedBackgroundColor))) {
      if ((((typeof this.itemStyle!.selectedBackgroundColor)) === ("object"))) {
        let temp: Resource = (this.itemStyle!.selectedBackgroundColor as Resource);
        if (((((temp) == (undefined))) || (((temp) == (null))))) {
          return defaultTheme.itemStyle.selectedBackgroundColor;
        }
        if (((temp.type) === (10001))) {
          return this.itemStyle!.selectedBackgroundColor!;
        }
        return defaultTheme.itemStyle.selectedBackgroundColor;
      }
      return this.itemStyle!.selectedBackgroundColor!;
    }
    return defaultTheme.itemStyle.selectedBackgroundColor;
  }
  
  private getSelectedIndexes(): Array<int> {
    let temp: Array<int> = [];
    temp = ((this.selectedIndexes) ?? ([0])).filter(((element, index, array) => {
      return ((((((((((element) >= (0))) && (((element) != (null))))) && (((element) != (undefined))))) && (((array.indexOf(element)) === (index))))) && (((element) < (((this.items) || (([] as Array<int>))).length))));
    }));
    return temp;
  }
  
  private isMultiple(): boolean {
    return ((this.multiple) ?? (false));
  }
  
  private getChipGroupItemSpace() {
    if (((this.chipGroupSpace) == (undefined))) {
      return defaultTheme.chipGroupSpace.itemSpace;
    }
    return parseDimension(this.getUIContext(), this.chipGroupSpace!.itemSpace, isValidDimensionNoPercentageString, defaultTheme.chipGroupSpace.itemSpace);
  }
  
  private getChipGroupStartSpace() {
    if (((this.chipGroupSpace) == (undefined))) {
      return defaultTheme.chipGroupSpace.startSpace;
    }
    return parseDimension(this.getUIContext(), this.chipGroupSpace!.startSpace, isValidDimensionNoPercentageString, defaultTheme.chipGroupSpace.startSpace);
  }
  
  private getChipGroupEndSpace() {
    if (((this.chipGroupSpace) == (undefined))) {
      return defaultTheme.chipGroupSpace.endSpace;
    }
    return parseDimension(this.getUIContext(), this.chipGroupSpace!.endSpace, isValidDimensionNoPercentageString, defaultTheme.chipGroupSpace.endSpace);
  }
  
  private getOnChange(): ((selectedIndexes: Array<int>)=> void) {
    return ((this.onChange) ?? (noop));
  }
  
  private isSelected(itemIndex: int): boolean {
    if (((!(this.isMultiple())) && (((this.getSelectedIndexes().length) > (0))))) {
      return ((itemIndex) == (this.getSelectedIndexes()[0]));
    } else {
      return this.getSelectedIndexes().some(((element, index, array) => {
        return ((element) == (itemIndex));
      }));
    }
  }
  
  private getPaddingTop() {
    if (((!(this.chipGroupPadding)) || (!(this.chipGroupPadding!.top)))) {
      return defaultTheme.chipGroupPadding.top;
    }
    return parseDimension(this.getUIContext(), this.chipGroupPadding!.top, isValidDimensionNoPercentageString, defaultTheme.chipGroupPadding.top);
  }
  
  private getPaddingBottom() {
    if (((!(this.chipGroupPadding)) || (!(this.chipGroupPadding!.bottom)))) {
      return defaultTheme.chipGroupPadding.bottom;
    }
    return parseDimension(this.getUIContext(), this.chipGroupPadding!.bottom, isValidDimensionNoPercentageString, defaultTheme.chipGroupPadding.bottom);
  }
  
  private getChipGroupHeight(): double {
    if ((((typeof this.chipSize)) === ("string"))) {
      if (((this.chipSize) === (ChipSize.NORMAL))) {
        return ChipGroupHeight.NORMAL;
      } else {
        return ChipGroupHeight.SMALL;
      }
    } else {
      if (((this.chipSize) instanceof (SizeOptions))) {
        return ((this.chipSize as SizeOptions).height as double);
      } else {
        return ChipGroupHeight.NORMAL;
      }
    }
  }
  
  private getBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return withDefaultMaterial(this.backgroundSystemMaterial, defaultTheme.chipBackgroundSystemMaterial);
  }
  
  private getSelectedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return withDefaultMaterial(this.selectedBackgroundSystemMaterial, defaultTheme.chipSelectedBackgroundSystemMaterial);
  }
  
  private getOutsideBlendType(): (BlendApplyType | undefined) {
    if (((!(this.suffix)) && (((!(!(this.getBackgroundSystemMaterial()))) || (!(!(this.getSelectedBackgroundSystemMaterial()))))))) {
      return undefined;
    }
    return BlendApplyType.OFFSCREEN;
  }
  
  private getOutsideBlendMode(): (BlendMode | undefined) {
    if (((!(this.suffix)) && (((!(!(this.getBackgroundSystemMaterial()))) || (!(!(this.getSelectedBackgroundSystemMaterial()))))))) {
      return undefined;
    }
    return BlendMode.SRC_OVER;
  }
  
  @Memo() 
  public ChipItemsBuilder(@MemoSkip() options: ChipItemsBuilderOptions): void {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(({
        space: this.getChipGroupItemSpace(),
      } as RowOptions)).padding(({
        left: this.getChipGroupStartSpace(),
        right: this.getChipGroupEndSpace(),
      } as Padding)).constraintSize({
        minWidth: "100%",
      });
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ForEachImpl(@Memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions((() => {
          return this.items;
        }), @Memo() ((chipItem: ChipGroupItemOptions, index: int) => {
          if (chipItem) {
            Chip((makeBuilderParameterProxy<ChipOptions>({
              prefixIcon: this.getPrefixIcon(chipItem),
              prefixSymbol: ({let gensym%%_3 = chipItem;
              (((gensym%%_3) == (null)) ? undefined : gensym%%_3.prefixSymbol)}),
              label: ({
                text: ((({let gensym%%_5 = ({let gensym%%_4 = chipItem;
                (((gensym%%_4) == (null)) ? undefined : gensym%%_4.label)});
                (((gensym%%_5) == (null)) ? undefined : gensym%%_5.text)})) ?? (" ")),
                fontColor: this.getFontColor(),
                activatedFontColor: this.getSelectedFontColor(),
              } as LabelOptions),
              suffixIcon: this.getSuffixIcon(chipItem),
              suffixSymbol: ({let gensym%%_6 = chipItem;
              (((gensym%%_6) == (null)) ? undefined : gensym%%_6.suffixSymbol)}),
              suffixSymbolOptions: chipItem.suffixSymbolOptions,
              allowClose: ((chipItem.allowClose) ?? (false)),
              closeOptions: chipItem.closeOptions,
              enabled: true,
              activated: this.isSelected(index),
              backgroundColor: this.getBackgroundColor(),
              backgroundSystemMaterial: options.backgroundSystemMaterial,
              activatedBackgroundSystemMaterial: options.activatedBackgroundSystemMaterial,
              size: this.getChipSize(),
              activatedBackgroundColor: this.getSelectedBackgroundColor(),
              accessibilitySelectedType: (this.multiple ? AccessibilitySelectedType.CHECKED : AccessibilitySelectedType.SELECTED),
              accessibilityDescription: chipItem.accessibilityDescription,
              accessibilityLevel: chipItem.accessibilityLevel,
              onClicked: (() => {
                if (this.isSelected(index)) {
                  if (!(!(this.isMultiple()))) {
                    if (((this.getSelectedIndexes().length) > (1))) {
                      this.selectedIndexes = this.selectedIndexes!.filter(((v, _) => {
                        return ((v) !== (index));
                      }));
                    }
                  }
                } else {
                  if (((!(this.selectedIndexes)) || (((this.selectedIndexes!.length) === (0))))) {
                    this.selectedIndexes = this.getSelectedIndexes();
                  }
                  if (!(this.isMultiple())) {
                    this.selectedIndexes = [];
                  }
                  this.selectedIndexes!.push(index);
                }
                this.getOnChange()(this.getSelectedIndexes());
              }),
            }, new Map<string, (()=> Any)>([["prefixIcon", ((): Any => {
              return this.getPrefixIcon(chipItem);
            })], ["prefixSymbol", ((): Any => {
              return ({let gensym%%_3 = chipItem;
              (((gensym%%_3) == (null)) ? undefined : gensym%%_3.prefixSymbol)});
            })], ["label", ((): Any => {
              return ({
                text: ((({let gensym%%_5 = ({let gensym%%_4 = chipItem;
                (((gensym%%_4) == (null)) ? undefined : gensym%%_4.label)});
                (((gensym%%_5) == (null)) ? undefined : gensym%%_5.text)})) ?? (" ")),
                fontColor: this.getFontColor(),
                activatedFontColor: this.getSelectedFontColor(),
              } as LabelOptions);
            })], ["suffixIcon", ((): Any => {
              return this.getSuffixIcon(chipItem);
            })], ["suffixSymbol", ((): Any => {
              return ({let gensym%%_6 = chipItem;
              (((gensym%%_6) == (null)) ? undefined : gensym%%_6.suffixSymbol)});
            })], ["suffixSymbolOptions", ((): Any => {
              return chipItem.suffixSymbolOptions;
            })], ["allowClose", ((): Any => {
              return ((chipItem.allowClose) ?? (false));
            })], ["closeOptions", ((): Any => {
              return chipItem.closeOptions;
            })], ["enabled", ((): Any => {
              return true;
            })], ["activated", ((): Any => {
              return this.isSelected(index);
            })], ["backgroundColor", ((): Any => {
              return this.getBackgroundColor();
            })], ["backgroundSystemMaterial", ((): Any => {
              return options.backgroundSystemMaterial;
            })], ["activatedBackgroundSystemMaterial", ((): Any => {
              return options.activatedBackgroundSystemMaterial;
            })], ["size", ((): Any => {
              return this.getChipSize();
            })], ["activatedBackgroundColor", ((): Any => {
              return this.getSelectedBackgroundColor();
            })], ["accessibilitySelectedType", ((): Any => {
              return (this.multiple ? AccessibilitySelectedType.CHECKED : AccessibilitySelectedType.SELECTED);
            })], ["accessibilityDescription", ((): Any => {
              return chipItem.accessibilityDescription;
            })], ["accessibilityLevel", ((): Any => {
              return chipItem.accessibilityLevel;
            })], ["onClicked", ((): Any => {
              return (() => {
                if (this.isSelected(index)) {
                  if (!(!(this.isMultiple()))) {
                    if (((this.getSelectedIndexes().length) > (1))) {
                      this.selectedIndexes = this.selectedIndexes!.filter(((v, _) => {
                        return ((v) !== (index));
                      }));
                    }
                  }
                } else {
                  if (((!(this.selectedIndexes)) || (((this.selectedIndexes!.length) === (0))))) {
                    this.selectedIndexes = this.getSelectedIndexes();
                  }
                  if (!(this.isMultiple())) {
                    this.selectedIndexes = [];
                  }
                  this.selectedIndexes!.push(index);
                }
                this.getOnChange()(this.getSelectedIndexes());
              });
            })]]), ((gensym___231298632: ChipOptions) => {})) as ChipOptions));
          }
        }), ((chipItem: ChipGroupItemOptions, index: int) => {
          return \`\${this.refreshCnt}_\${index}\`;
        }));
        return;
      }));
    }));
  }
  
  @Memo() 
  public build(): void {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined).align(Alignment.End).width("100%");
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      StackImpl(@Memo() ((instance: StackAttribute): void => {
        instance.setStackOptions(undefined).padding(({
          top: this.getPaddingTop(),
          bottom: this.getPaddingBottom(),
        } as Padding)).layoutWeight(1).blendMode(this.getOutsideBlendMode(), this.getOutsideBlendType()).alignContent(Alignment.End);
        instance.applyAttributesFinish();
        return;
      }), @Memo() (() => {
        ScrollImpl(@Memo() ((instance: ScrollAttribute): void => {
          instance.setScrollOptions(this.scroller).scrollable(ScrollDirection.Horizontal).scrollBar(BarState.Off).align(Alignment.Start).width("100%").clip(false).onDidScroll((() => {
            this.isReachEnd = this.scroller.isAtEnd();
          }));
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {
          if (((deviceInfo.sdkApiVersion) >= (26))) {
            if (enableEffectComponent(this.backgroundSystemMaterial)) {
              EffectComponentImpl(@Memo() ((instance: EffectComponentAttribute): void => {
                instance.setEffectComponentOptions(undefined).systemMaterial(createECMaterial(this.getBackgroundSystemMaterial()));
                instance.applyAttributesFinish();
                return;
              }), @Memo() (() => {
                this.ChipItemsBuilder(makeBuilderParameterProxy<ChipItemsBuilderOptions>({
                  backgroundSystemMaterial: createSubECMaterial(this.getBackgroundSystemMaterial()),
                  activatedBackgroundSystemMaterial: this.getSelectedBackgroundSystemMaterial(),
                }, new Map<string, (()=> Any)>([["backgroundSystemMaterial", ((): Any => {
                  return createSubECMaterial(this.getBackgroundSystemMaterial());
                })], ["activatedBackgroundSystemMaterial", ((): Any => {
                  return this.getSelectedBackgroundSystemMaterial();
                })]]), ((gensym___61958548: ChipItemsBuilderOptions) => {})));
              }));
            } else {
              this.ChipItemsBuilder(makeBuilderParameterProxy<ChipItemsBuilderOptions>({
                backgroundSystemMaterial: this.getBackgroundSystemMaterial(),
                activatedBackgroundSystemMaterial: this.getSelectedBackgroundSystemMaterial(),
              }, new Map<string, (()=> Any)>([["backgroundSystemMaterial", ((): Any => {
                return this.getBackgroundSystemMaterial();
              })], ["activatedBackgroundSystemMaterial", ((): Any => {
                return this.getSelectedBackgroundSystemMaterial();
              })]]), ((gensym___243485254: ChipItemsBuilderOptions) => {})));
            }
          } else {
            this.ChipItemsBuilder(makeBuilderParameterProxy<ChipItemsBuilderOptions>({}, new Map<string, (()=> Any)>(), ((gensym___52312768: ChipItemsBuilderOptions) => {})));
          }
        }));
        if (((this.suffix) && (!(this.isReachEnd)))) {
          StackImpl(@Memo() ((instance: StackAttribute): void => {
            instance.setStackOptions(undefined).width(iconGroupSuffixTheme.normalBackgroundSize).height(this.getChipGroupHeight()).linearGradient({
              angle: 90,
              colors: colorStops,
            }).blendMode(BlendMode.DST_IN, BlendApplyType.OFFSCREEN).hitTestBehavior(HitTestMode.None);
            instance.applyAttributesFinish();
            return;
          }), undefined);
        }
      }));
      if (this.suffix) {
        RowImpl(@Memo() ((instance: RowAttribute): void => {
          instance.setRowOptions(undefined).padding(({
            left: iconGroupSuffixTheme.marginLeft,
            right: iconGroupSuffixTheme.marginRight,
          } as Padding));
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {
          this.suffix!();
        }));
      }
    }));
  }
  
  public getPrefixIcon(chipItem: ChipGroupItemOptions): PrefixIconOptions {
    return {
      src: ((({let gensym%%_7 = chipItem.prefixIcon;
      (((gensym%%_7) == (null)) ? undefined : gensym%%_7.src)})) ?? ("")),
      size: ((({let gensym%%_8 = chipItem.prefixIcon;
      (((gensym%%_8) == (null)) ? undefined : gensym%%_8.size)})) ?? (undefined)),
      fillColor: this.getFillColor(),
      activatedFillColor: this.getSelectedFillColor(),
    };
  }
  
  private getSuffixIcon(chipItem: ChipGroupItemOptions): (SuffixIconOptions | undefined) {
    if (!(!(chipItem.suffixImageIcon))) {
      return ({
        src: chipItem.suffixImageIcon!.src,
        size: chipItem.suffixImageIcon!.size,
        fillColor: this.getFillColor(),
        activatedFillColor: this.getSelectedFillColor(),
        action: chipItem.suffixImageIcon!.action,
        accessibilityText: chipItem.suffixImageIcon!.accessibilityText,
        accessibilityDescription: chipItem.suffixImageIcon!.accessibilityDescription,
        accessibilityLevel: chipItem.suffixImageIcon!.accessibilityLevel,
      } as SuffixIconOptions);
    }
    return undefined;
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  public static _buildCompatibleNode(options: __Options_ChipGroup): void {
    return;
  }
  
  static {
    
  }
}

@Component() export class __Options_IconGroupSuffix {
  @Consume() public chipSize?: (ChipSize | SizeOptions);
  public __backing_chipSize?: IConsumeDecoratedVariable<(ChipSize | SizeOptions)>;
  public __options_has_chipSize?: boolean;
  @State() public refreshCnt?: int;
  public __backing_refreshCnt?: IStateDecoratedVariable<int>;
  public __options_has_refreshCnt?: boolean;
  @Watch({value:"onItems"}) @PropRef() public items?: Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>;
  public __backing_items?: IPropRefDecoratedVariable<Array<(IconItemOptions | SymbolGlyphModifier | SymbolItemOptions)>>;
  public __options_has_items?: boolean;
  @PropRef() public iconBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_iconBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_iconBackgroundSystemMaterial?: boolean;
  public symbolEffect?: SymbolEffect;
  public __options_has_symbolEffect?: boolean;
  public constructor() {}
  
}

@Component() export class __Options_ChipGroup {
  @PropRef() @Watch({value:"onItemsChange"}) public items?: Array<ChipGroupItemOptions>;
  public __backing_items?: IPropRefDecoratedVariable<Array<ChipGroupItemOptions>>;
  public __options_has_items?: boolean;
  @PropRef() @Watch({value:"itemStyleOnChange"}) public itemStyle?: (ChipItemStyle | undefined);
  public __backing_itemStyle?: IPropRefDecoratedVariable<(ChipItemStyle | undefined)>;
  public __options_has_itemStyle?: boolean;
  @Provide() public chipSize?: (ChipSize | SizeOptions);
  public __backing_chipSize?: IProvideDecoratedVariable<(ChipSize | SizeOptions)>;
  public __options_has_chipSize?: boolean;
  @PropRef() public selectedIndexes?: (Array<int> | undefined);
  public __backing_selectedIndexes?: IPropRefDecoratedVariable<(Array<int> | undefined)>;
  public __options_has_selectedIndexes?: boolean;
  @PropRef() @Watch({value:"onMultipleChange"}) public multiple?: (boolean | undefined);
  public __backing_multiple?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public __options_has_multiple?: boolean;
  @PropRef() public chipGroupSpace?: (ChipGroupSpaceOptions | undefined);
  public __backing_chipGroupSpace?: IPropRefDecoratedVariable<(ChipGroupSpaceOptions | undefined)>;
  public __options_has_chipGroupSpace?: boolean;
  @PropRef() public backgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_backgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_backgroundSystemMaterial?: boolean;
  @PropRef() public selectedBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_selectedBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_selectedBackgroundSystemMaterial?: boolean;
  public suffix?: (ChipGroupSuffixBuilder | undefined);
  public __options_has_suffix?: boolean;
  public onChange?: InnerCallback<Array<int>>;
  public __options_has_onChange?: boolean;
  public scroller?: Scroller;
  public __options_has_scroller?: boolean;
  @State() public isReachEnd?: boolean;
  public __backing_isReachEnd?: IStateDecoratedVariable<boolean>;
  public __options_has_isReachEnd?: boolean;
  @PropRef() public chipGroupPadding?: (ChipGroupPaddingOptions | undefined);
  public __backing_chipGroupPadding?: IPropRefDecoratedVariable<(ChipGroupPaddingOptions | undefined)>;
  public __options_has_chipGroupPadding?: boolean;
  @State() public refreshCnt?: int;
  public __backing_refreshCnt?: IStateDecoratedVariable<int>;
  public __options_has_refreshCnt?: boolean;
  public constructor() {}
  
}

`;

function testChipGroupUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform advanced-ui-components mock-chipgroup',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testChipGroupUITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
