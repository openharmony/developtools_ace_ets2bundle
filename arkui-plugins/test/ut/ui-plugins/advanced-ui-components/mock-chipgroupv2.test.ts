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
        'mock-chipgroupv2.ets'
    ),
];

const pluginTester = new PluginTester('test advanced-ui-components mock-chipgroupv2', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { IMutableStateMeta } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { UIUtils } from "arkui.stateManagement.utils";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

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

import { IProviderDecoratedVariable } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { makeBuilderParameterProxy } from "arkui.component.builder";

import { ScrollImpl } from "arkui.component.scroll";

import { ScrollAttribute } from "arkui.component.scroll";

import { StackImpl } from "arkui.component.stack";

import { StackAttribute } from "arkui.component.stack";

import { IMonitor } from "arkui.stateManagement.decorator";

import { IMonitorPathInfo } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { $r, Builder, Button, ButtonOptions, ButtonType, Callback, ClickEvent, Color, ComponentV2, ConstraintSizeOptions, Curve, Dimension, Direction, Flex, FlexAlign, FontWeight, HoverEffect, Image, ImageFit, ItemAlign, KeyEvent, KeyType, Length, LocalizedMargin, LocalizedPadding, Margin, Padding, Resource, ResourceColor, ResourceStr, Row, ForEach, ScaleOptions, ShadowStyle, SizeOptions, SymbolEffect, SymbolEffectStrategy, SymbolGlyph, Text, TextAlign, TextOverflow, VoidCallback, Rectangle, UIContext, RowOptions, EffectComponent, BuilderParam, Scroller, Alignment, Stack, Scroll, ScrollDirection, BlendMode, BlendApplyType, BarState, HitTestMode } from "@ohos.arkui.component";

import { ImageModifier, SymbolGlyphModifier, TextModifier } from "@ohos.arkui.modifier";

import { Require, Param, ObservedV2, Trace, Event, Local, Consumer, Provider, Monitor } from "@ohos.arkui.stateManagement";

import { ColorMetrics, LengthMetrics, LengthUnit, SizeT } from "@ohos.arkui.node";

import { KeyCode } from "@ohos.multimodalInput.keyCode";

import hilog from "@ohos.hilog";

import resourceManager from "@ohos.resourceManager";

import common from "@ohos.app.ability.common";

import mediaquery from "@ohos.mediaquery";

import { EnvironmentCallback } from "@kit.AbilityKit";

import deviceInfo from "@ohos.deviceInfo";

import { Configuration } from "@ohos.app.ability.Configuration";

import AbilityConstant from "@ohos.app.ability.AbilityConstant";

import uiMaterial from "@ohos.arkui.uiMaterial";

import { ChipV2Size, ChipV2ImageIconConfig, ChipV2SuffixImageIconConfig, ChipV2PrefixImageIconConfig, ChipV2LabelConfig, ChipV2CloseConfig, ChipV2SymbolIconConfig, ChipV2PrefixSymbolIconConfig, ChipV2SuffixSymbolIconConfig, ChipV2AccessibilityConfig, ChipV2ImageIcon, ChipV2SuffixImageIcon, ChipV2PrefixImageIcon, ChipV2Label, ChipV2CloseIcon, ChipV2SymbolIcon, ChipV2PrefixSymbolIcon, ChipV2SuffixSymbolIcon, ChipV2, IChipV2OptionsConfig, ChipV2Options, ChipV2AccessibilitySelectedType, ChipV2Icon } from "@ohos.arkui.advanced.ChipV2";

const noop = ((selectedIndexes: Array<int>) => {});
const colorStops: Array<[ResourceColor, number]> = [["rgba(0, 0, 0, 1)", 0], ["rgba(0, 0, 0, 0)", 1]];
const defaultTheme: ChipGroupV2Theme = {
  size: ChipV2Size.NORMAL,
  backgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
  fontColor: _r(16777216, 10003, "com.example.mock", "entry"),
  selectedFontColor: _r(16777216, 10003, "com.example.mock", "entry"),
  selectedBackgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
  chipGroupSpace: {
    itemSpace: 8,
    startSpace: 16,
    endSpace: 16,
  },
  chipGroupPadding: {
    top: 14,
    bottom: 14,
  },
  itemFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
  itemSelectedFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
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

function parseDimension<T>(uiContext: UIContext, value: (Dimension | Length | undefined), isValid: Callback<string, boolean>, defaultValue: T): T {
  if (((((value) === (undefined))) || (((value) === (null))))) {
    return defaultValue;
  }
  const resourceManager = ({let gensym%%_15 = uiContext.getHostContext();
  (((gensym%%_15) == (null)) ? undefined : gensym%%_15.resourceManager)});
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

function withDefaultMaterial(material: (uiMaterial.Material | undefined), defaultMaterial: uiMaterial.Material): (uiMaterial.Material | undefined) {
  return material;
}

function enableEffectComponent(material: (uiMaterial.Material | undefined)) {
  return false;
}

function createECMaterial(material: (uiMaterial.Material | undefined)): (uiMaterial.Material | undefined) {
  return material;
}

function createSubECMaterial(material: (uiMaterial.Material | undefined)): (uiMaterial.Material | undefined) {
  return material;
}

function lengthMetricsToLength(length: LengthMetrics): Length {
  if (((length.unit) === (LengthUnit.PX))) {
    return \`\${length.value}px\`;
  } else {
    if (((length.unit) === (LengthUnit.VP))) {
      return \`\${length.value}vp\`;
    } else {
      if (((length.unit) === (LengthUnit.FP))) {
        return \`\${length.value}fp\`;
      } else {
        if (((length.unit) === (LengthUnit.PERCENT))) {
          return \`\${length.value}%\`;
        } else {
          if (((length.unit) === (LengthUnit.LPX))) {
            return \`\${length.value}lpx\`;
          }
        }
      }
    }
  }
  return 0;
}


interface ChipGroupV2Theme {
  get size(): (ChipV2Size | SizeT<LengthMetrics>)
  set size(size: (ChipV2Size | SizeT<LengthMetrics>))
  get backgroundColor(): ResourceColor
  set backgroundColor(backgroundColor: ResourceColor)
  get fontColor(): ResourceColor
  set fontColor(fontColor: ResourceColor)
  get selectedFontColor(): ResourceColor
  set selectedFontColor(selectedFontColor: ResourceColor)
  get selectedBackgroundColor(): ResourceColor
  set selectedBackgroundColor(selectedBackgroundColor: ResourceColor)
  get chipGroupSpace(): ChipGroupV2SpaceConfig
  set chipGroupSpace(chipGroupSpace: ChipGroupV2SpaceConfig)
  get chipGroupPadding(): ChipGroupV2PaddingConfig
  set chipGroupPadding(chipGroupPadding: ChipGroupV2PaddingConfig)
  get itemFillColor(): ResourceColor
  set itemFillColor(itemFillColor: ResourceColor)
  get itemSelectedFillColor(): ResourceColor
  set itemSelectedFillColor(itemSelectedFillColor: ResourceColor)
  get chipBackgroundSystemMaterial(): uiMaterial.Material
  set chipBackgroundSystemMaterial(chipBackgroundSystemMaterial: uiMaterial.Material)
  get chipSelectedBackgroundSystemMaterial(): uiMaterial.Material
  set chipSelectedBackgroundSystemMaterial(chipSelectedBackgroundSystemMaterial: uiMaterial.Material)
  get iconBackgroundSystemMaterial(): uiMaterial.Material
  set iconBackgroundSystemMaterial(iconBackgroundSystemMaterial: uiMaterial.Material)
  
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
  get defaultEffect(): int
  set defaultEffect(defaultEffect: int)
  
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

interface ChipGroupV2ItemConfig {
  get prefixIcon(): (ChipV2PrefixImageIconConfig | undefined) {
    return undefined;
  }
  set prefixIcon(prefixIcon: (ChipV2PrefixImageIconConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get prefixSymbolIcon(): (ChipV2PrefixSymbolIconConfig | undefined) {
    return undefined;
  }
  set prefixSymbolIcon(prefixSymbolIcon: (ChipV2PrefixSymbolIconConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get label(): ChipV2LabelConfig
  set label(label: ChipV2LabelConfig)
  get suffixIcon(): (ChipV2SuffixImageIconConfig | undefined) {
    return undefined;
  }
  set suffixIcon(suffixIcon: (ChipV2SuffixImageIconConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get suffixSymbolIcon(): (ChipV2SuffixSymbolIconConfig | undefined) {
    return undefined;
  }
  set suffixSymbolIcon(suffixSymbolIcon: (ChipV2SuffixSymbolIconConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get allowClose(): (boolean | undefined) {
    return undefined;
  }
  set allowClose(allowClose: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get closeIcon(): (ChipV2CloseConfig | undefined) {
    return undefined;
  }
  set closeIcon(closeIcon: (ChipV2CloseConfig | undefined)) {
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

@ObservedV2() class ChipGroupV2Item implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"prefixIcon"}) public __backing_prefixIcon?: (ChipV2PrefixImageIcon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_prefixIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_prefixIcon");
  public get prefixIcon(): (ChipV2PrefixImageIcon | undefined) {
    this.conditionalAddRef(this.__meta_prefixIcon);
    return UIUtils.makeObserved((this.__backing_prefixIcon as (ChipV2PrefixImageIcon | undefined)));
  }
  
  public set prefixIcon(newValue: (ChipV2PrefixImageIcon | undefined)) {
    if (((this.__backing_prefixIcon) !== (newValue))) {
      this.__backing_prefixIcon = newValue;
      this.__meta_prefixIcon.fireChange();
      this.executeOnSubscribingWatches("prefixIcon");
    }
  }
  
  @JSONRename({newName:"prefixSymbolIcon"}) public __backing_prefixSymbolIcon?: (ChipV2PrefixSymbolIcon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_prefixSymbolIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_prefixSymbolIcon");
  public get prefixSymbolIcon(): (ChipV2PrefixSymbolIcon | undefined) {
    this.conditionalAddRef(this.__meta_prefixSymbolIcon);
    return UIUtils.makeObserved((this.__backing_prefixSymbolIcon as (ChipV2PrefixSymbolIcon | undefined)));
  }
  
  public set prefixSymbolIcon(newValue: (ChipV2PrefixSymbolIcon | undefined)) {
    if (((this.__backing_prefixSymbolIcon) !== (newValue))) {
      this.__backing_prefixSymbolIcon = newValue;
      this.__meta_prefixSymbolIcon.fireChange();
      this.executeOnSubscribingWatches("prefixSymbolIcon");
    }
  }
  
  @JSONRename({newName:"label"}) public __backing_label?: ChipV2Label;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_label: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_label");
  public get label(): ChipV2Label {
    this.conditionalAddRef(this.__meta_label);
    return UIUtils.makeObserved((this.__backing_label as ChipV2Label));
  }
  
  public set label(newValue: ChipV2Label) {
    if (((this.__backing_label) !== (newValue))) {
      this.__backing_label = newValue;
      this.__meta_label.fireChange();
      this.executeOnSubscribingWatches("label");
    }
  }
  
  @JSONRename({newName:"suffixIcon"}) public __backing_suffixIcon?: (ChipV2SuffixImageIcon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_suffixIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_suffixIcon");
  public get suffixIcon(): (ChipV2SuffixImageIcon | undefined) {
    this.conditionalAddRef(this.__meta_suffixIcon);
    return UIUtils.makeObserved((this.__backing_suffixIcon as (ChipV2SuffixImageIcon | undefined)));
  }
  
  public set suffixIcon(newValue: (ChipV2SuffixImageIcon | undefined)) {
    if (((this.__backing_suffixIcon) !== (newValue))) {
      this.__backing_suffixIcon = newValue;
      this.__meta_suffixIcon.fireChange();
      this.executeOnSubscribingWatches("suffixIcon");
    }
  }
  
  @JSONRename({newName:"suffixSymbolIcon"}) public __backing_suffixSymbolIcon?: (ChipV2SuffixSymbolIcon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_suffixSymbolIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_suffixSymbolIcon");
  public get suffixSymbolIcon(): (ChipV2SuffixSymbolIcon | undefined) {
    this.conditionalAddRef(this.__meta_suffixSymbolIcon);
    return UIUtils.makeObserved((this.__backing_suffixSymbolIcon as (ChipV2SuffixSymbolIcon | undefined)));
  }
  
  public set suffixSymbolIcon(newValue: (ChipV2SuffixSymbolIcon | undefined)) {
    if (((this.__backing_suffixSymbolIcon) !== (newValue))) {
      this.__backing_suffixSymbolIcon = newValue;
      this.__meta_suffixSymbolIcon.fireChange();
      this.executeOnSubscribingWatches("suffixSymbolIcon");
    }
  }
  
  @JSONRename({newName:"allowClose"}) public __backing_allowClose?: (boolean | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_allowClose: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_allowClose");
  public get allowClose(): (boolean | undefined) {
    this.conditionalAddRef(this.__meta_allowClose);
    return UIUtils.makeObserved((this.__backing_allowClose as (boolean | undefined)));
  }
  
  public set allowClose(newValue: (boolean | undefined)) {
    if (((this.__backing_allowClose) !== (newValue))) {
      this.__backing_allowClose = newValue;
      this.__meta_allowClose.fireChange();
      this.executeOnSubscribingWatches("allowClose");
    }
  }
  
  @JSONRename({newName:"closeIcon"}) public __backing_closeIcon?: (ChipV2CloseConfig | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_closeIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_closeIcon");
  public get closeIcon(): (ChipV2CloseConfig | undefined) {
    this.conditionalAddRef(this.__meta_closeIcon);
    return UIUtils.makeObserved((this.__backing_closeIcon as (ChipV2CloseConfig | undefined)));
  }
  
  public set closeIcon(newValue: (ChipV2CloseConfig | undefined)) {
    if (((this.__backing_closeIcon) !== (newValue))) {
      this.__backing_closeIcon = newValue;
      this.__meta_closeIcon.fireChange();
      this.executeOnSubscribingWatches("closeIcon");
    }
  }
  
  @JSONRename({newName:"accessibilityDescription"}) public __backing_accessibilityDescription?: (ResourceStr | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_accessibilityDescription: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_accessibilityDescription");
  public get accessibilityDescription(): (ResourceStr | undefined) {
    this.conditionalAddRef(this.__meta_accessibilityDescription);
    return UIUtils.makeObserved((this.__backing_accessibilityDescription as (ResourceStr | undefined)));
  }
  
  public set accessibilityDescription(newValue: (ResourceStr | undefined)) {
    if (((this.__backing_accessibilityDescription) !== (newValue))) {
      this.__backing_accessibilityDescription = newValue;
      this.__meta_accessibilityDescription.fireChange();
      this.executeOnSubscribingWatches("accessibilityDescription");
    }
  }
  
  @JSONRename({newName:"accessibilityLevel"}) public __backing_accessibilityLevel?: (string | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_accessibilityLevel: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_accessibilityLevel");
  public get accessibilityLevel(): (string | undefined) {
    this.conditionalAddRef(this.__meta_accessibilityLevel);
    return UIUtils.makeObserved((this.__backing_accessibilityLevel as (string | undefined)));
  }
  
  public set accessibilityLevel(newValue: (string | undefined)) {
    if (((this.__backing_accessibilityLevel) !== (newValue))) {
      this.__backing_accessibilityLevel = newValue;
      this.__meta_accessibilityLevel.fireChange();
      this.executeOnSubscribingWatches("accessibilityLevel");
    }
  }
  
  public constructor(config: ChipGroupV2ItemConfig) {
    this.prefixIcon = (config.prefixIcon ? new ChipV2PrefixImageIcon(config.prefixIcon!) : undefined);
    this.prefixSymbolIcon = (config.prefixSymbolIcon ? new ChipV2PrefixSymbolIcon(config.prefixSymbolIcon!) : undefined);
    this.label = new ChipV2Label(config.label);
    this.suffixIcon = (config.suffixIcon ? new ChipV2SuffixImageIcon(config.suffixIcon!) : undefined);
    this.suffixSymbolIcon = (config.suffixSymbolIcon ? new ChipV2SuffixSymbolIcon(config.suffixSymbolIcon!) : undefined);
    this.allowClose = config.allowClose;
    this.closeIcon = config.closeIcon;
    this.accessibilityDescription = config.accessibilityDescription;
    this.accessibilityLevel = config.accessibilityLevel;
  }
  
  static {
    
  }
}

@ObservedV2() class ChipGroupV2Items extends Array<ChipGroupV2Item> implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  public constructor(items: Array<ChipGroupV2ItemConfig>) {
    super();
    items.forEach(((item, index) => {
      this.push(new ChipGroupV2Item(item));
    }));
  }
  
  static {
    
  }
}

interface ChipGroupV2ItemStyleConfig {
  get size(): ((ChipV2Size | SizeT<LengthMetrics>) | undefined) {
    return undefined;
  }
  set size(size: ((ChipV2Size | SizeT<LengthMetrics>) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get backgroundColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set backgroundColor(backgroundColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set fontColor(fontColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get selectedFontColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set selectedFontColor(selectedFontColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get selectedBackgroundColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set selectedBackgroundColor(selectedBackgroundColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get backgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return undefined;
  }
  set backgroundSystemMaterial(backgroundSystemMaterial: (uiMaterial.Material | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get selectedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return undefined;
  }
  set selectedBackgroundSystemMaterial(selectedBackgroundSystemMaterial: (uiMaterial.Material | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipGroupV2ItemStyle implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"size"}) public __backing_size?: (ChipV2Size | SizeT<LengthMetrics> | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_size: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_size");
  public get size(): (ChipV2Size | SizeT<LengthMetrics> | undefined) {
    this.conditionalAddRef(this.__meta_size);
    return UIUtils.makeObserved((this.__backing_size as (ChipV2Size | SizeT<LengthMetrics> | undefined)));
  }
  
  public set size(newValue: (ChipV2Size | SizeT<LengthMetrics> | undefined)) {
    if (((this.__backing_size) !== (newValue))) {
      this.__backing_size = newValue;
      this.__meta_size.fireChange();
      this.executeOnSubscribingWatches("size");
    }
  }
  
  @JSONRename({newName:"backgroundColor"}) public __backing_backgroundColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_backgroundColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_backgroundColor");
  public get backgroundColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_backgroundColor);
    return UIUtils.makeObserved((this.__backing_backgroundColor as (ColorMetrics | undefined)));
  }
  
  public set backgroundColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_backgroundColor) !== (newValue))) {
      this.__backing_backgroundColor = newValue;
      this.__meta_backgroundColor.fireChange();
      this.executeOnSubscribingWatches("backgroundColor");
    }
  }
  
  @JSONRename({newName:"fontColor"}) public __backing_fontColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_fontColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_fontColor");
  public get fontColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_fontColor);
    return UIUtils.makeObserved((this.__backing_fontColor as (ColorMetrics | undefined)));
  }
  
  public set fontColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_fontColor) !== (newValue))) {
      this.__backing_fontColor = newValue;
      this.__meta_fontColor.fireChange();
      this.executeOnSubscribingWatches("fontColor");
    }
  }
  
  @JSONRename({newName:"selectedFontColor"}) public __backing_selectedFontColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_selectedFontColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_selectedFontColor");
  public get selectedFontColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_selectedFontColor);
    return UIUtils.makeObserved((this.__backing_selectedFontColor as (ColorMetrics | undefined)));
  }
  
  public set selectedFontColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_selectedFontColor) !== (newValue))) {
      this.__backing_selectedFontColor = newValue;
      this.__meta_selectedFontColor.fireChange();
      this.executeOnSubscribingWatches("selectedFontColor");
    }
  }
  
  @JSONRename({newName:"selectedBackgroundColor"}) public __backing_selectedBackgroundColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_selectedBackgroundColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_selectedBackgroundColor");
  public get selectedBackgroundColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_selectedBackgroundColor);
    return UIUtils.makeObserved((this.__backing_selectedBackgroundColor as (ColorMetrics | undefined)));
  }
  
  public set selectedBackgroundColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_selectedBackgroundColor) !== (newValue))) {
      this.__backing_selectedBackgroundColor = newValue;
      this.__meta_selectedBackgroundColor.fireChange();
      this.executeOnSubscribingWatches("selectedBackgroundColor");
    }
  }
  
  @JSONRename({newName:"backgroundSystemMaterial"}) public __backing_backgroundSystemMaterial?: (uiMaterial.Material | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_backgroundSystemMaterial: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_backgroundSystemMaterial");
  public get backgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    this.conditionalAddRef(this.__meta_backgroundSystemMaterial);
    return UIUtils.makeObserved((this.__backing_backgroundSystemMaterial as (uiMaterial.Material | undefined)));
  }
  
  public set backgroundSystemMaterial(newValue: (uiMaterial.Material | undefined)) {
    if (((this.__backing_backgroundSystemMaterial) !== (newValue))) {
      this.__backing_backgroundSystemMaterial = newValue;
      this.__meta_backgroundSystemMaterial.fireChange();
      this.executeOnSubscribingWatches("backgroundSystemMaterial");
    }
  }
  
  @JSONRename({newName:"selectedBackgroundSystemMaterial"}) public __backing_selectedBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_selectedBackgroundSystemMaterial: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_selectedBackgroundSystemMaterial");
  public get selectedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    this.conditionalAddRef(this.__meta_selectedBackgroundSystemMaterial);
    return UIUtils.makeObserved((this.__backing_selectedBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
  }
  
  public set selectedBackgroundSystemMaterial(newValue: (uiMaterial.Material | undefined)) {
    if (((this.__backing_selectedBackgroundSystemMaterial) !== (newValue))) {
      this.__backing_selectedBackgroundSystemMaterial = newValue;
      this.__meta_selectedBackgroundSystemMaterial.fireChange();
      this.executeOnSubscribingWatches("selectedBackgroundSystemMaterial");
    }
  }
  
  public constructor(config: ChipGroupV2ItemStyleConfig) {
    this.size = config.size;
    this.backgroundColor = config.backgroundColor;
    this.fontColor = config.fontColor;
    this.selectedFontColor = config.selectedFontColor;
    this.selectedBackgroundColor = config.selectedBackgroundColor;
    this.backgroundSystemMaterial = config.backgroundSystemMaterial;
    this.selectedBackgroundSystemMaterial = config.selectedBackgroundSystemMaterial;
  }
  
  static {
    
  }
}

interface ChipGroupV2SpaceConfig {
  get itemSpace(): ((string | number) | undefined) {
    return undefined;
  }
  set itemSpace(itemSpace: ((string | number) | undefined)) {
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

@ObservedV2() class ChipGroupV2Space implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"itemSpace"}) public __backing_itemSpace?: (string | number | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_itemSpace: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_itemSpace");
  public get itemSpace(): (string | number | undefined) {
    this.conditionalAddRef(this.__meta_itemSpace);
    return UIUtils.makeObserved((this.__backing_itemSpace as (string | number | undefined)));
  }
  
  public set itemSpace(newValue: (string | number | undefined)) {
    if (((this.__backing_itemSpace) !== (newValue))) {
      this.__backing_itemSpace = newValue;
      this.__meta_itemSpace.fireChange();
      this.executeOnSubscribingWatches("itemSpace");
    }
  }
  
  @JSONRename({newName:"startSpace"}) public __backing_startSpace?: (Length | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_startSpace: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_startSpace");
  public get startSpace(): (Length | undefined) {
    this.conditionalAddRef(this.__meta_startSpace);
    return UIUtils.makeObserved((this.__backing_startSpace as (Length | undefined)));
  }
  
  public set startSpace(newValue: (Length | undefined)) {
    if (((this.__backing_startSpace) !== (newValue))) {
      this.__backing_startSpace = newValue;
      this.__meta_startSpace.fireChange();
      this.executeOnSubscribingWatches("startSpace");
    }
  }
  
  @JSONRename({newName:"endSpace"}) public __backing_endSpace?: (Length | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_endSpace: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_endSpace");
  public get endSpace(): (Length | undefined) {
    this.conditionalAddRef(this.__meta_endSpace);
    return UIUtils.makeObserved((this.__backing_endSpace as (Length | undefined)));
  }
  
  public set endSpace(newValue: (Length | undefined)) {
    if (((this.__backing_endSpace) !== (newValue))) {
      this.__backing_endSpace = newValue;
      this.__meta_endSpace.fireChange();
      this.executeOnSubscribingWatches("endSpace");
    }
  }
  
  public constructor(config: ChipGroupV2SpaceConfig) {
    this.itemSpace = config.itemSpace;
    this.startSpace = config.startSpace;
    this.endSpace = config.endSpace;
  }
  
  static {
    
  }
}

interface ChipGroupV2IconItemConfig {
  get icon(): ChipV2ImageIconConfig
  set icon(icon: ChipV2ImageIconConfig)
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

interface ChipGroupV2SymbolItemConfig {
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

interface ChipGroupV2PaddingConfig {
  get top(): Length
  set top(top: Length)
  get bottom(): Length
  set bottom(bottom: Length)
  
}

@ObservedV2() class ChipGroupV2Padding implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"top"}) public __backing_top?: Length;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_top: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_top");
  public get top(): Length {
    this.conditionalAddRef(this.__meta_top);
    return UIUtils.makeObserved((this.__backing_top as Length));
  }
  
  public set top(newValue: Length) {
    if (((this.__backing_top) !== (newValue))) {
      this.__backing_top = newValue;
      this.__meta_top.fireChange();
      this.executeOnSubscribingWatches("top");
    }
  }
  
  @JSONRename({newName:"bottom"}) public __backing_bottom?: Length;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_bottom: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_bottom");
  public get bottom(): Length {
    this.conditionalAddRef(this.__meta_bottom);
    return UIUtils.makeObserved((this.__backing_bottom as Length));
  }
  
  public set bottom(newValue: Length) {
    if (((this.__backing_bottom) !== (newValue))) {
      this.__backing_bottom = newValue;
      this.__meta_bottom.fireChange();
      this.executeOnSubscribingWatches("bottom");
    }
  }
  
  public constructor(config: ChipGroupV2PaddingConfig) {
    this.top = config.top;
    this.bottom = config.bottom;
  }
  
  static {
    
  }
}

@ComponentV2() final struct ChipGroupV2IconGroupSuffix extends CustomComponentV2<ChipGroupV2IconGroupSuffix, __Options_ChipGroupV2IconGroupSuffix> {
  public __initializeStruct(initializers: (__Options_ChipGroupV2IconGroupSuffix | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_items = STATE_MGMT_FACTORY.makeParam<Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>>(this, "items", (initializers!.items as Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>));
    this.__backing_iconBackgroundSystemMaterial = STATE_MGMT_FACTORY.makeParam<(uiMaterial.Material | undefined)>(this, "iconBackgroundSystemMaterial", (({let gensym___168409791 = initializers;
    (((gensym___168409791) == (null)) ? undefined : gensym___168409791.__options_has_iconBackgroundSystemMaterial)}) ? (initializers!.iconBackgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_chipSize = STATE_MGMT_FACTORY.makeConsumer<(ChipV2Size | SizeT<LengthMetrics>)>(this, "chipSize", "chipSize", ChipV2Size.NORMAL);
    this.__backing_symbolEffect = STATE_MGMT_FACTORY.makeLocal<SymbolEffect>(this, "symbolEffect", new SymbolEffect());
  }
  
  public __updateStruct(initializers: (__Options_ChipGroupV2IconGroupSuffix | undefined)): void {
    if (({let gensym___240401574 = initializers;
    (((gensym___240401574) == (null)) ? undefined : gensym___240401574.__options_has_items)})) {
      this.__backing_items!.update((initializers!.items as Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>));
    }
    if (({let gensym___156629981 = initializers;
    (((gensym___156629981) == (null)) ? undefined : gensym___156629981.__options_has_iconBackgroundSystemMaterial)})) {
      this.__backing_iconBackgroundSystemMaterial!.update((initializers!.iconBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ChipGroupV2IconGroupSuffix | undefined)): void {
    this.__backing_items!.resetOnReuse((initializers!.items as Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>));
    this.__backing_iconBackgroundSystemMaterial!.resetOnReuse((({let gensym___207903768 = initializers;
    (((gensym___207903768) == (null)) ? undefined : gensym___207903768.__options_has_iconBackgroundSystemMaterial)}) ? (initializers!.iconBackgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_chipSize!.resetOnReuse(ChipV2Size.NORMAL);
    this.__backing_symbolEffect!.resetOnReuse(new SymbolEffect());
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ChipGroupV2IconGroupSuffix)=> void) | undefined), initializers: ((()=> __Options_ChipGroupV2IconGroupSuffix) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ChipGroupV2IconGroupSuffix, __Options_ChipGroupV2IconGroupSuffix>(style, ((): ChipGroupV2IconGroupSuffix => {
      return new ChipGroupV2IconGroupSuffix();
    }), initializers, reuseId, content, {
      sClass: Class.from<ChipGroupV2IconGroupSuffix>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ChipGroupV2IconGroupSuffix, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ChipGroupV2IconGroupSuffix {
    throw new Error("Declare interface");
  }
  
  private __backing_items?: IParamDecoratedVariable<Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>>;
  public get items(): Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)> {
    return this.__backing_items!.get();
  }
  
  private __backing_iconBackgroundSystemMaterial?: IParamDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get iconBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_iconBackgroundSystemMaterial!.get();
  }
  
  private __backing_chipSize?: IConsumerDecoratedVariable<(ChipV2Size | SizeT<LengthMetrics>)>;
  public get chipSize(): (ChipV2Size | SizeT<LengthMetrics>) {
    return this.__backing_chipSize!.get();
  }
  
  public set chipSize(value: (ChipV2Size | SizeT<LengthMetrics>)) {
    this.__backing_chipSize!.set(value);
  }
  
  private __backing_symbolEffect?: ILocalDecoratedVariable<SymbolEffect>;
  public get symbolEffect(): SymbolEffect {
    return this.__backing_symbolEffect!.get();
  }
  
  public set symbolEffect(value: SymbolEffect) {
    this.__backing_symbolEffect!.set(value);
  }
  
  private getBackgroundSize(): number {
    if (((this.chipSize) === (ChipV2Size.SMALL))) {
      return iconGroupSuffixTheme.smallBackgroundSize;
    } else {
      return iconGroupSuffixTheme.normalBackgroundSize;
    }
  }
  
  private getIconSize(val?: LengthMetrics): Length {
    if (((val) === (undefined))) {
      return (((this.chipSize) === (ChipV2Size.SMALL)) ? iconGroupSuffixTheme.smallIconSize : iconGroupSuffixTheme.normalIconSize);
    }
    let value: Length = lengthMetricsToLength(val);
    return value;
  }
  
  @Memo() 
  public SymbolItemBuilder(@MemoSkip() item: ChipGroupV2SymbolItemConfig) {
    SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
      instance.setSymbolGlyphOptions(undefined).fontColor([iconGroupSuffixTheme.fillColor]).fontSize(this.getIconSize()).attributeModifier(item.symbol).focusable(true).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, iconGroupSuffixTheme.defaultEffect);
      instance.applyAttributesFinish();
      return;
    }));
  }
  
  @Memo() 
  public IconItemBuilder(@MemoSkip() item: ChipGroupV2IconItemConfig) {
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
  public IconButtonsBuilder(@MemoSkip() material: (uiMaterial.Material | undefined)) {
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
        }), @Memo() ((suffixItem: (ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)) => {
          ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
            instance.setButtonOptions(({
              type: ButtonType.Normal,
            } as ButtonOptions)).size({
              width: this.getBackgroundSize(),
              height: this.getBackgroundSize(),
            }).backgroundColor(iconGroupSuffixTheme.backgroundColor).borderRadius(iconGroupSuffixTheme.borderRadius).systemMaterial(material).accessibilityText(this.getAccessibilityText(suffixItem)).accessibilityDescription(this.getAccessibilityDescription(suffixItem)).accessibilityLevel(this.getAccessibilityLevel(suffixItem)).onClick(((event: ClickEvent) => {
              if (((suffixItem) instanceof (ChipGroupV2SymbolItemConfig))) {
                (suffixItem as ChipGroupV2SymbolItemConfig).action();
              }
              if (((suffixItem) instanceof (ChipGroupV2IconItemConfig))) {
                (suffixItem as ChipGroupV2IconItemConfig).action();
              }
            }));
            instance.applyAttributesFinish();
            return;
          }), @Memo() (() => {
            if (((suffixItem) instanceof (SymbolGlyphModifier))) {
              SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
                instance.setSymbolGlyphOptions(undefined).fontColor([iconGroupSuffixTheme.fillColor]).fontSize(this.getIconSize()).attributeModifier((suffixItem as SymbolGlyphModifier)).focusable(true).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, iconGroupSuffixTheme.defaultEffect);
                instance.applyAttributesFinish();
                return;
              }));
            } else {
              if (((suffixItem) instanceof (ChipGroupV2SymbolItemConfig))) {
                this.SymbolItemBuilder((suffixItem as ChipGroupV2SymbolItemConfig));
              } else {
                if (((suffixItem) instanceof (ChipGroupV2IconItemConfig))) {
                  this.IconItemBuilder((suffixItem as ChipGroupV2IconItemConfig));
                }
              }
            }
          }));
        }), undefined);
        return;
      }));
    }));
  }
  
  @Memo() 
  public build() {
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
  
  private isSymbolItem(item: (ChipGroupV2IconItemConfig | ChipGroupV2SymbolItemConfig)): boolean {
    return (((typeof (item as ChipGroupV2SymbolItemConfig).symbol)) !== ("undefined"));
  }
  
  private getAccessibilityLevel(item: (ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)): string {
    if (((item) instanceof (SymbolGlyphModifier))) {
      return "auto";
    }
    return ((item.accessibilityLevel) ?? ("auto"));
  }
  
  private getAccessibilityDescription(item: (ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)): (ResourceStr | undefined) {
    if (((((item) instanceof (SymbolGlyphModifier))) || ((((typeof item.accessibilityDescription)) === ("undefined"))))) {
      return undefined;
    }
    return (item.accessibilityDescription as ResourceStr);
  }
  
  private getAccessibilityText(item: (ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)): (ResourceStr | undefined) {
    if (((((item) instanceof (SymbolGlyphModifier))) || ((((typeof item.accessibilityText)) === ("undefined"))))) {
      return undefined;
    }
    return (item.accessibilityText as ResourceStr);
  }
  
  public constructor() {}
  
  static {
    
  }
}

@Builder() @Memo() type ChipGroupV2SuffixBuilder = (()=> void);

interface ChipV2ItemsBuilderOptions {
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

@ComponentV2() final struct ChipGroupV2 extends CustomComponentV2<ChipGroupV2, __Options_ChipGroupV2> {
  public __initializeStruct(initializers: (__Options_ChipGroupV2 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_items = STATE_MGMT_FACTORY.makeParam<ChipGroupV2Items>(this, "items", (initializers!.items as ChipGroupV2Items));
    this.__backing_$items = (({let gensym___266503239 = initializers;
    (((gensym___266503239) == (null)) ? undefined : gensym___266503239.__options_has_$items)}) ? (initializers!.$items as (Callback<ChipGroupV2Items> | undefined)) : undefined);
    this.__backing_itemStyle = STATE_MGMT_FACTORY.makeParam<(ChipGroupV2ItemStyle | undefined)>(this, "itemStyle", (({let gensym___1717539 = initializers;
    (((gensym___1717539) == (null)) ? undefined : gensym___1717539.__options_has_itemStyle)}) ? (initializers!.itemStyle as (ChipGroupV2ItemStyle | undefined)) : undefined));
    this.__backing_selectedIndexes = STATE_MGMT_FACTORY.makeParam<(Array<int> | undefined)>(this, "selectedIndexes", (({let gensym___257652510 = initializers;
    (((gensym___257652510) == (null)) ? undefined : gensym___257652510.__options_has_selectedIndexes)}) ? (initializers!.selectedIndexes as (Array<int> | undefined)) : undefined));
    this.__backing_$selectedIndexes = (({let gensym___193351859 = initializers;
    (((gensym___193351859) == (null)) ? undefined : gensym___193351859.__options_has_$selectedIndexes)}) ? (initializers!.$selectedIndexes as (Callback<Array<int>> | undefined)) : undefined);
    this.__backing_multiple = STATE_MGMT_FACTORY.makeParam<(boolean | undefined)>(this, "multiple", (({let gensym___55331519 = initializers;
    (((gensym___55331519) == (null)) ? undefined : gensym___55331519.__options_has_multiple)}) ? (initializers!.multiple as (boolean | undefined)) : (false as (boolean | undefined))));
    this.__backing_chipGroupSpace = STATE_MGMT_FACTORY.makeParam<(ChipGroupV2Space | undefined)>(this, "chipGroupSpace", (({let gensym___229020651 = initializers;
    (((gensym___229020651) == (null)) ? undefined : gensym___229020651.__options_has_chipGroupSpace)}) ? (initializers!.chipGroupSpace as (ChipGroupV2Space | undefined)) : (new ChipGroupV2Space(defaultTheme.chipGroupSpace) as (ChipGroupV2Space | undefined))));
    this.__backing_chipGroupPadding = STATE_MGMT_FACTORY.makeParam<(ChipGroupV2Padding | undefined)>(this, "chipGroupPadding", (({let gensym___96283720 = initializers;
    (((gensym___96283720) == (null)) ? undefined : gensym___96283720.__options_has_chipGroupPadding)}) ? (initializers!.chipGroupPadding as (ChipGroupV2Padding | undefined)) : (new ChipGroupV2Padding(defaultTheme.chipGroupPadding) as (ChipGroupV2Padding | undefined))));
    this.__backing_onChange = (({let gensym___118840668 = initializers;
    (((gensym___118840668) == (null)) ? undefined : gensym___118840668.__options_has_onChange)}) ? (initializers!.onChange as (Callback<Array<int>> | undefined)) : undefined);
    this.__backing_suffix = ((((({let gensym___244146260 = initializers;
    (((gensym___244146260) == (null)) ? undefined : gensym___244146260.suffix)})) ?? (content))) ?? (((({let gensym___244146260 = initializers;
    (((gensym___244146260) == (null)) ? undefined : gensym___244146260.suffix)})) ?? (undefined))));
    this.__backing_chipSize = STATE_MGMT_FACTORY.makeProvider<(ChipV2Size | SizeT<LengthMetrics>)>(this, "chipSize", "chipSize", defaultTheme.size);
    this.__backing_scroller = ((({let gensym___8414356 = initializers;
    (((gensym___8414356) == (null)) ? undefined : gensym___8414356.scroller)})) ?? (new Scroller()));
    this.__backing_selectedIndexesInternal = STATE_MGMT_FACTORY.makeLocal<(Array<int> | undefined)>(this, "selectedIndexesInternal", [0]);
    this.__backing_isReachEnd = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "isReachEnd", this.scroller.isAtEnd());
    this.__backing_isRefresh = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "isRefresh", true);
    this.__monitor_onItemsChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "items",
      valueCallback: ((): Any => {
        return this.items;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onItemsChange();
    }), this);
    this.__monitor_onMultipleChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "multiple",
      valueCallback: ((): Any => {
        let x: Any = this.multiple;
        return x;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onMultipleChange();
    }), this);
    this.__monitor_itemStyleOnChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "itemStyle",
      valueCallback: ((): Any => {
        let x: Any = this.itemStyle;
        return x;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.itemStyleOnChange();
    }), this);
    this.__monitor_selectedIndexesOnChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "selectedIndexes",
      valueCallback: ((): Any => {
        let x: Any = this.selectedIndexes;
        return x;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.selectedIndexesOnChange();
    }), this);
  }
  
  public __updateStruct(initializers: (__Options_ChipGroupV2 | undefined)): void {
    if (({let gensym___155306397 = initializers;
    (((gensym___155306397) == (null)) ? undefined : gensym___155306397.__options_has_items)})) {
      this.__backing_items!.update((initializers!.items as ChipGroupV2Items));
    }
    if (({let gensym___148257163 = initializers;
    (((gensym___148257163) == (null)) ? undefined : gensym___148257163.__options_has_itemStyle)})) {
      this.__backing_itemStyle!.update((initializers!.itemStyle as (ChipGroupV2ItemStyle | undefined)));
    }
    if (({let gensym___55256622 = initializers;
    (((gensym___55256622) == (null)) ? undefined : gensym___55256622.__options_has_selectedIndexes)})) {
      this.__backing_selectedIndexes!.update((initializers!.selectedIndexes as (Array<int> | undefined)));
    }
    if (({let gensym___108216097 = initializers;
    (((gensym___108216097) == (null)) ? undefined : gensym___108216097.__options_has_multiple)})) {
      this.__backing_multiple!.update((initializers!.multiple as (boolean | undefined)));
    }
    if (({let gensym___165335333 = initializers;
    (((gensym___165335333) == (null)) ? undefined : gensym___165335333.__options_has_chipGroupSpace)})) {
      this.__backing_chipGroupSpace!.update((initializers!.chipGroupSpace as (ChipGroupV2Space | undefined)));
    }
    if (({let gensym___251277637 = initializers;
    (((gensym___251277637) == (null)) ? undefined : gensym___251277637.__options_has_chipGroupPadding)})) {
      this.__backing_chipGroupPadding!.update((initializers!.chipGroupPadding as (ChipGroupV2Padding | undefined)));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ChipGroupV2 | undefined)): void {
    this.__backing_items!.resetOnReuse((initializers!.items as ChipGroupV2Items));
    this.$items = ((({let gensym___97578426 = initializers;
    (((gensym___97578426) == (null)) ? undefined : gensym___97578426.$items)})) ?? (undefined));
    this.__backing_itemStyle!.resetOnReuse((({let gensym___100562647 = initializers;
    (((gensym___100562647) == (null)) ? undefined : gensym___100562647.__options_has_itemStyle)}) ? (initializers!.itemStyle as (ChipGroupV2ItemStyle | undefined)) : undefined));
    this.__backing_selectedIndexes!.resetOnReuse((({let gensym___175718338 = initializers;
    (((gensym___175718338) == (null)) ? undefined : gensym___175718338.__options_has_selectedIndexes)}) ? (initializers!.selectedIndexes as (Array<int> | undefined)) : undefined));
    this.$selectedIndexes = ((({let gensym___228362134 = initializers;
    (((gensym___228362134) == (null)) ? undefined : gensym___228362134.$selectedIndexes)})) ?? (undefined));
    this.__backing_multiple!.resetOnReuse((({let gensym___103717148 = initializers;
    (((gensym___103717148) == (null)) ? undefined : gensym___103717148.__options_has_multiple)}) ? (initializers!.multiple as (boolean | undefined)) : (false as (boolean | undefined))));
    this.__backing_chipGroupSpace!.resetOnReuse((({let gensym___202432816 = initializers;
    (((gensym___202432816) == (null)) ? undefined : gensym___202432816.__options_has_chipGroupSpace)}) ? (initializers!.chipGroupSpace as (ChipGroupV2Space | undefined)) : (new ChipGroupV2Space(defaultTheme.chipGroupSpace) as (ChipGroupV2Space | undefined))));
    this.__backing_chipGroupPadding!.resetOnReuse((({let gensym___202078470 = initializers;
    (((gensym___202078470) == (null)) ? undefined : gensym___202078470.__options_has_chipGroupPadding)}) ? (initializers!.chipGroupPadding as (ChipGroupV2Padding | undefined)) : (new ChipGroupV2Padding(defaultTheme.chipGroupPadding) as (ChipGroupV2Padding | undefined))));
    this.onChange = (initializers!.onChange as (Callback<Array<int>> | undefined));
    this.__backing_chipSize!.resetOnReuse(defaultTheme.size);
    this.__backing_selectedIndexesInternal!.resetOnReuse([0]);
    this.__backing_isReachEnd!.resetOnReuse(this.scroller.isAtEnd());
    this.__backing_isRefresh!.resetOnReuse(true);
    this.__monitor_onItemsChange!.resetOnReuse();
    this.__monitor_onMultipleChange!.resetOnReuse();
    this.__monitor_itemStyleOnChange!.resetOnReuse();
    this.__monitor_selectedIndexesOnChange!.resetOnReuse();
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ChipGroupV2)=> void) | undefined), initializers: ((()=> __Options_ChipGroupV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ChipGroupV2, __Options_ChipGroupV2>(style, ((): ChipGroupV2 => {
      return new ChipGroupV2();
    }), initializers, reuseId, content, {
      sClass: Class.from<ChipGroupV2>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ChipGroupV2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ChipGroupV2 {
    throw new Error("Declare interface");
  }
  
  private __backing_items?: IParamDecoratedVariable<ChipGroupV2Items>;
  public get items(): ChipGroupV2Items {
    return this.__backing_items!.get();
  }
  
  private __backing_$items?: (Callback<ChipGroupV2Items> | undefined);
  public get $items(): (Callback<ChipGroupV2Items> | undefined) {
    return (this.__backing_$items as (Callback<ChipGroupV2Items> | undefined));
  }
  
  public set $items(value: (Callback<ChipGroupV2Items> | undefined)) {
    this.__backing_$items = value;
  }
  
  private __backing_itemStyle?: IParamDecoratedVariable<(ChipGroupV2ItemStyle | undefined)>;
  public get itemStyle(): (ChipGroupV2ItemStyle | undefined) {
    return this.__backing_itemStyle!.get();
  }
  
  private __backing_selectedIndexes?: IParamDecoratedVariable<(Array<int> | undefined)>;
  public get selectedIndexes(): (Array<int> | undefined) {
    return this.__backing_selectedIndexes!.get();
  }
  
  private __backing_$selectedIndexes?: (Callback<Array<int>> | undefined);
  public get $selectedIndexes(): (Callback<Array<int>> | undefined) {
    return (this.__backing_$selectedIndexes as (Callback<Array<int>> | undefined));
  }
  
  public set $selectedIndexes(value: (Callback<Array<int>> | undefined)) {
    this.__backing_$selectedIndexes = value;
  }
  
  private __backing_multiple?: IParamDecoratedVariable<(boolean | undefined)>;
  public get multiple(): (boolean | undefined) {
    return this.__backing_multiple!.get();
  }
  
  private __backing_chipGroupSpace?: IParamDecoratedVariable<(ChipGroupV2Space | undefined)>;
  public get chipGroupSpace(): (ChipGroupV2Space | undefined) {
    return this.__backing_chipGroupSpace!.get();
  }
  
  private __backing_chipGroupPadding?: IParamDecoratedVariable<(ChipGroupV2Padding | undefined)>;
  public get chipGroupPadding(): (ChipGroupV2Padding | undefined) {
    return this.__backing_chipGroupPadding!.get();
  }
  
  private __backing_onChange?: (Callback<Array<int>> | undefined);
  public get onChange(): (Callback<Array<int>> | undefined) {
    return (this.__backing_onChange as (Callback<Array<int>> | undefined));
  }
  
  public set onChange(value: (Callback<Array<int>> | undefined)) {
    this.__backing_onChange = value;
  }
  
  private __backing_suffix?: (ChipGroupV2SuffixBuilder | undefined);
  public get suffix(): (ChipGroupV2SuffixBuilder | undefined) {
    return this.__backing_suffix;
  }
  
  public set suffix(value: (ChipGroupV2SuffixBuilder | undefined)) {
    this.__backing_suffix = value;
  }
  
  private __backing_chipSize?: IProviderDecoratedVariable<(ChipV2Size | SizeT<LengthMetrics>)>;
  public get chipSize(): (ChipV2Size | SizeT<LengthMetrics>) {
    return this.__backing_chipSize!.get();
  }
  
  public set chipSize(value: (ChipV2Size | SizeT<LengthMetrics>)) {
    this.__backing_chipSize!.set(value);
  }
  
  private __backing_scroller?: Scroller;
  public get scroller(): Scroller {
    return (this.__backing_scroller as Scroller);
  }
  
  public set scroller(value: Scroller) {
    this.__backing_scroller = value;
  }
  
  private __backing_selectedIndexesInternal?: ILocalDecoratedVariable<(Array<int> | undefined)>;
  public get selectedIndexesInternal(): (Array<int> | undefined) {
    return this.__backing_selectedIndexesInternal!.get();
  }
  
  public set selectedIndexesInternal(value: (Array<int> | undefined)) {
    this.__backing_selectedIndexesInternal!.set(value);
  }
  
  private __backing_isReachEnd?: ILocalDecoratedVariable<boolean>;
  public get isReachEnd(): boolean {
    return this.__backing_isReachEnd!.get();
  }
  
  public set isReachEnd(value: boolean) {
    this.__backing_isReachEnd!.set(value);
  }
  
  private __backing_isRefresh?: ILocalDecoratedVariable<boolean>;
  public get isRefresh(): boolean {
    return this.__backing_isRefresh!.get();
  }
  
  public set isRefresh(value: boolean) {
    this.__backing_isRefresh!.set(value);
  }
  
  private __monitor_onItemsChange: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["items"]}) 
  public onItemsChange() {
    this.isRefresh = !(this.isRefresh);
  }
  
  private __monitor_onMultipleChange: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["multiple"]}) 
  public onMultipleChange() {
    if (this.selectedIndexes) {
      this.selectedIndexesOnChange();
    }
    this.selectedIndexesInternal = this.getSelectedIndexes();
  }
  
  private __monitor_itemStyleOnChange: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["itemStyle"]}) 
  public itemStyleOnChange() {
    this.chipSize = this.getChipSize();
  }
  
  private __monitor_selectedIndexesOnChange: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["selectedIndexes"]}) 
  public selectedIndexesOnChange() {
    this.selectedIndexesInternal = ({let gensym%%_3 = this.selectedIndexes;
    (((gensym%%_3) == (null)) ? undefined : gensym%%_3.filter((() => {
      return true;
    })))});
  }
  
  public aboutToAppear() {
    this.itemStyleOnChange();
    this.selectedIndexesOnChange();
    if (((this.getSelectedIndexes().length) === (0))) {
      this.selectedIndexesInternal = [0];
    }
  }
  
  private getChipSize(): (ChipV2Size | SizeT<LengthMetrics>) {
    if (((this.itemStyle) && (this.itemStyle!.size))) {
      if ((((typeof this.itemStyle!.size)) !== ("string"))) {
        if (((((!(({let gensym%%_4 = (this.itemStyle!.size as SizeT<LengthMetrics>)!.width;
        (((gensym%%_4) == (null)) ? undefined : gensym%%_4.value)}))) || (!(({let gensym%%_5 = (this.itemStyle!.size as SizeT<LengthMetrics>)!.height;
        (((gensym%%_5) == (null)) ? undefined : gensym%%_5.value)}))))) || (!(this.itemStyle!.size)))) {
          return defaultTheme.size;
        }
      }
      return this.itemStyle!.size!;
    }
    return defaultTheme.size;
  }
  
  private getFontColor(): ColorMetrics {
    if (((this.itemStyle) && (this.itemStyle!.fontColor))) {
      return this.itemStyle!.fontColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.fontColor);
  }
  
  private getSelectedFontColor(): ColorMetrics {
    if (((this.itemStyle) && (this.itemStyle!.selectedFontColor))) {
      return this.itemStyle!.selectedFontColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.selectedFontColor);
  }
  
  private getFillColor(): ColorMetrics {
    if (((this.itemStyle) && (this.itemStyle!.fontColor))) {
      return this.itemStyle!.fontColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.itemFillColor);
  }
  
  private getSelectedFillColor(): ColorMetrics {
    if (((this.itemStyle) && (this.itemStyle!.selectedFontColor))) {
      return this.itemStyle!.selectedFontColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.itemSelectedFillColor);
  }
  
  private getBackgroundColor(): ColorMetrics {
    if (({let gensym%%_6 = this.itemStyle;
    (((gensym%%_6) == (null)) ? undefined : gensym%%_6.backgroundColor)})) {
      return this.itemStyle!.backgroundColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.backgroundColor!);
  }
  
  private getSelectedBackgroundColor(): ColorMetrics {
    if (({let gensym%%_7 = this.itemStyle;
    (((gensym%%_7) == (null)) ? undefined : gensym%%_7.selectedBackgroundColor)})) {
      return this.itemStyle!.selectedBackgroundColor!;
    }
    return ColorMetrics.resourceColor(defaultTheme.selectedBackgroundColor!);
  }
  
  private getSelectedIndexes(): Array<int> {
    let temp: Array<int> = [];
    temp = ((this.selectedIndexesInternal) ?? ([0])).filter(((element, index, array) => {
      return ((((((((((((element) >= (0))) && (((((element) % (1))) == (0))))) && (((element) != (null))))) && (((element) != (undefined))))) && (((array.indexOf(element)) === (index))))) && (((element) < (((this.items) || (([] as Array<int>))).length))));
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
    if (!(this.isMultiple())) {
      const indexes = this.getSelectedIndexes();
      if (((indexes.length) === (0))) {
        return false;
      }
      return ((itemIndex) == (indexes[0]));
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
  
  private getChipGroupHeight(): Length {
    if ((((typeof this.chipSize)) === ("string"))) {
      if (((this.chipSize) === (ChipV2Size.NORMAL))) {
        return ChipGroupHeight.NORMAL;
      } else {
        return ChipGroupHeight.SMALL;
      }
    } else {
      if ((((typeof this.chipSize)) === ("object"))) {
        return lengthMetricsToLength((this.chipSize as SizeT<LengthMetrics>).height);
      } else {
        return ChipGroupHeight.NORMAL;
      }
    }
  }
  
  private getBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return withDefaultMaterial(({let gensym%%_8 = this.itemStyle;
    (((gensym%%_8) == (null)) ? undefined : gensym%%_8.backgroundSystemMaterial)}), defaultTheme.chipBackgroundSystemMaterial);
  }
  
  private getSelectedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return withDefaultMaterial(({let gensym%%_9 = this.itemStyle;
    (((gensym%%_9) == (null)) ? undefined : gensym%%_9.selectedBackgroundSystemMaterial)}), defaultTheme.chipSelectedBackgroundSystemMaterial);
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
  public ChipItemsBuilder(@MemoSkip() options: ChipV2ItemsBuilderOptions) {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(({
        space: this.getChipGroupItemSpace(),
      } as RowOptions));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ForEachImpl(@Memo() ((instance: ForEachAttribute): void => {
        instance.setForEachOptions((() => {
          return (this.items as Array<ChipGroupV2Item>);
        }), @Memo() ((chipItem: ChipGroupV2Item, index: int) => {
          if (chipItem) {
            ChipV2._invoke(undefined, (() => {
              return {
                chipV2Options: new ChipV2Options(({
                  label: this.getLabel(chipItem.label),
                  prefixIcon: this.getPrefixIcon(chipItem),
                  suffixIcon: this.getSuffixIcon(chipItem),
                  allowClose: ((chipItem.allowClose) ?? (false)),
                  closeIcon: (chipItem.closeIcon ? new ChipV2CloseIcon(chipItem.closeIcon!) : undefined),
                  enabled: true,
                  activated: this.isSelected(index),
                  backgroundColor: this.getBackgroundColor(),
                  backgroundSystemMaterial: options.backgroundSystemMaterial,
                  activatedBackgroundSystemMaterial: options.activatedBackgroundSystemMaterial,
                  size: this.getChipSize(),
                  activatedBackgroundColor: this.getSelectedBackgroundColor(),
                  accessibilitySelectedType: (this.multiple ? ChipV2AccessibilitySelectedType.CHECKED : ChipV2AccessibilitySelectedType.SELECTED),
                  accessibilityDescription: chipItem.accessibilityDescription,
                  accessibilityLevel: chipItem.accessibilityLevel,
                  onClicked: (() => {
                    if (this.isSelected(index)) {
                      if (!(!(this.isMultiple()))) {
                        if (((this.getSelectedIndexes().length) > (1))) {
                          this.selectedIndexesInternal!.splice(this.selectedIndexesInternal!.indexOf(index), 1);
                        }
                      }
                    } else {
                      if (((!(this.selectedIndexesInternal)) || (((this.selectedIndexesInternal!.length) === (0))))) {
                        this.selectedIndexesInternal = this.getSelectedIndexes();
                      }
                      if (!(this.isMultiple())) {
                        this.selectedIndexesInternal = [];
                      }
                      this.selectedIndexesInternal!.push(index);
                    }
                    this.getOnChange()(this.getSelectedIndexes());
                    ({let gensym%%_10 = this.$selectedIndexes;
                    (((gensym%%_10) == (null)) ? undefined : gensym%%_10(this.selectedIndexesInternal!))});
                  }),
                  onClose: (() => {
                    if (this.$items) {
                      ({let gensym%%_11 = this.selectedIndexesInternal;
                      (((gensym%%_11) == (null)) ? undefined : gensym%%_11.forEach(((element, idx, array) => {
                        if (((element) > (index))) {
                          (array[idx]--);
                        }
                      })))});
                      ({let gensym%%_12 = this.$selectedIndexes;
                      (((gensym%%_12) == (null)) ? undefined : gensym%%_12(this.selectedIndexesInternal!))});
                      let newItems = new ChipGroupV2Items([]);
                      (this.items as Array<ChipGroupV2Item>).forEach(((element) => {
                        if (((element) !== (chipItem))) {
                          newItems.push(element);
                        }
                      }));
                      ({let gensym%%_13 = this.$items;
                      (((gensym%%_13) == (null)) ? undefined : gensym%%_13(newItems))});
                    }
                  }),
                } as IChipV2OptionsConfig)),
                __options_has_chipV2Options: true,
              };
            }), undefined, undefined, undefined);
          }
        }), ((chipItem: ChipGroupV2Item, index: int) => {
          return ((JSON.stringify(this.isRefresh)) + (index.toString()));
        }));
        return;
      }));
    }));
  }
  
  @Memo() 
  public build() {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined).align(Alignment.End).width("100%");
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      StackImpl(@Memo() ((instance: StackAttribute): void => {
        instance.setStackOptions(undefined).padding({
          top: this.getPaddingTop(),
          bottom: this.getPaddingBottom(),
        }).layoutWeight(1).blendMode(this.getOutsideBlendMode(), this.getOutsideBlendType()).alignContent(Alignment.End);
        instance.applyAttributesFinish();
        return;
      }), @Memo() (() => {
        ScrollImpl(@Memo() ((instance: ScrollAttribute): void => {
          instance.setScrollOptions(this.scroller).padding({
            left: this.getChipGroupStartSpace(),
            right: this.getChipGroupEndSpace(),
          }).constraintSize({
            minWidth: "100%",
          }).scrollable(ScrollDirection.Horizontal).scrollBar(BarState.Off).align(Alignment.Start).width("100%").clip(false).onDidScroll((() => {
            this.isReachEnd = this.scroller.isAtEnd();
          }));
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {
          if (((deviceInfo.sdkApiVersion) >= (26))) {
            if (enableEffectComponent(({let gensym%%_14 = this.itemStyle;
            (((gensym%%_14) == (null)) ? undefined : gensym%%_14.backgroundSystemMaterial)}))) {
              EffectComponentImpl(@Memo() ((instance: EffectComponentAttribute): void => {
                instance.setEffectComponentOptions(undefined).systemMaterial(createECMaterial(this.getBackgroundSystemMaterial()));
                instance.applyAttributesFinish();
                return;
              }), @Memo() (() => {
                RowImpl(@Memo() ((instance: RowAttribute): void => {
                  instance.setRowOptions(({
                    space: this.getChipGroupItemSpace(),
                  } as RowOptions));
                  instance.applyAttributesFinish();
                  return;
                }), @Memo() (() => {
                  this.ChipItemsBuilder(makeBuilderParameterProxy<ChipV2ItemsBuilderOptions>({
                    backgroundSystemMaterial: createSubECMaterial(this.getBackgroundSystemMaterial()),
                    activatedBackgroundSystemMaterial: this.getSelectedBackgroundSystemMaterial(),
                  }, new Map<string, (()=> Any)>([["backgroundSystemMaterial", ((): Any => {
                    return createSubECMaterial(this.getBackgroundSystemMaterial());
                  })], ["activatedBackgroundSystemMaterial", ((): Any => {
                    return this.getSelectedBackgroundSystemMaterial();
                  })]]), ((gensym___19933264: ChipV2ItemsBuilderOptions) => {})));
                }));
              }));
            } else {
              this.ChipItemsBuilder(makeBuilderParameterProxy<ChipV2ItemsBuilderOptions>({
                backgroundSystemMaterial: this.getBackgroundSystemMaterial(),
                activatedBackgroundSystemMaterial: this.getSelectedBackgroundSystemMaterial(),
              }, new Map<string, (()=> Any)>([["backgroundSystemMaterial", ((): Any => {
                return this.getBackgroundSystemMaterial();
              })], ["activatedBackgroundSystemMaterial", ((): Any => {
                return this.getSelectedBackgroundSystemMaterial();
              })]]), ((gensym___53871481: ChipV2ItemsBuilderOptions) => {})));
            }
          } else {
            this.ChipItemsBuilder(makeBuilderParameterProxy<ChipV2ItemsBuilderOptions>({}, new Map<string, (()=> Any)>(), ((gensym___111307461: ChipV2ItemsBuilderOptions) => {})));
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
          instance.setRowOptions(undefined).padding({
            left: iconGroupSuffixTheme.marginLeft,
            right: iconGroupSuffixTheme.marginRight,
          });
          instance.applyAttributesFinish();
          return;
        }), @Memo() (() => {
          this.suffix!();
        }));
      }
    }));
  }
  
  private getLabel(label: ChipV2Label): ChipV2Label {
    const result = new ChipV2Label({
      text: label.text,
      fontSize: label.fontSize,
      fontColor: ((label.fontColor) || (this.getFontColor())),
      activatedFontColor: ((label.activatedFontColor) || (this.getSelectedFontColor())),
      fontFamily: label.fontFamily,
      labelMargin: label.labelMargin,
      localizedLabelMargin: label.localizedLabelMargin,
      modifier: label.modifier,
    });
    return result;
  }
  
  private getPrefixIcon(chipItem: ChipGroupV2Item): (ChipV2Icon | undefined) {
    if (chipItem.prefixSymbolIcon) {
      return chipItem.prefixSymbolIcon;
    }
    if (chipItem.prefixIcon) {
      return new ChipV2PrefixImageIcon({
        src: chipItem.prefixIcon!.src,
        size: chipItem.prefixIcon!.size,
        fillColor: ((chipItem.prefixIcon!.fillColor) || (this.getFillColor())),
        activatedFillColor: ((chipItem.prefixIcon!.activatedFillColor) || (this.getSelectedFillColor())),
        modifier: chipItem.prefixIcon!.modifier,
      });
    }
    return undefined;
  }
  
  private getSuffixIcon(chipItem: ChipGroupV2Item): (ChipV2Icon | undefined) {
    if (chipItem.suffixSymbolIcon) {
      return chipItem.suffixSymbolIcon;
    }
    if (chipItem.suffixIcon) {
      const suffixIcon = new ChipV2SuffixImageIcon({
        src: chipItem.suffixIcon!.src,
        size: chipItem.suffixIcon!.size,
        fillColor: ((chipItem.suffixIcon!.fillColor) || (this.getFillColor())),
        activatedFillColor: ((chipItem.suffixIcon!.activatedFillColor) || (this.getSelectedFillColor())),
        modifier: chipItem.suffixIcon!.modifier,
        accessibilityLevel: chipItem.suffixIcon!.accessibilityLevel,
        accessibilityText: chipItem.suffixIcon!.accessibilityText,
        accessibilityDescription: chipItem.suffixIcon!.accessibilityDescription,
        action: chipItem.suffixIcon!.action,
      });
      return suffixIcon;
    }
    return undefined;
  }
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_ChipGroupV2IconGroupSuffix {
  @Require() @Param() public items: Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>;
  public __backing_items?: IParamDecoratedVariable<Array<(ChipGroupV2IconItemConfig | SymbolGlyphModifier | ChipGroupV2SymbolItemConfig)>>;
  public __options_has_items?: boolean;
  @Param() public iconBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_iconBackgroundSystemMaterial?: IParamDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_iconBackgroundSystemMaterial?: boolean;
  @Consumer() public chipSize?: (ChipV2Size | SizeT<LengthMetrics>);
  public __backing_chipSize?: IConsumerDecoratedVariable<(ChipV2Size | SizeT<LengthMetrics>)>;
  public __options_has_chipSize?: boolean;
  @Local() public symbolEffect?: SymbolEffect;
  public __backing_symbolEffect?: ILocalDecoratedVariable<SymbolEffect>;
  public __options_has_symbolEffect?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_ChipGroupV2 {
  @Require() @Param() public items: ChipGroupV2Items;
  public __backing_items?: IParamDecoratedVariable<ChipGroupV2Items>;
  public __options_has_items?: boolean;
  @Event() public $items?: (Callback<ChipGroupV2Items> | undefined);
  public __options_has_$items?: boolean;
  @Param() public itemStyle?: (ChipGroupV2ItemStyle | undefined);
  public __backing_itemStyle?: IParamDecoratedVariable<(ChipGroupV2ItemStyle | undefined)>;
  public __options_has_itemStyle?: boolean;
  @Param() public selectedIndexes?: (Array<int> | undefined);
  public __backing_selectedIndexes?: IParamDecoratedVariable<(Array<int> | undefined)>;
  public __options_has_selectedIndexes?: boolean;
  @Event() public $selectedIndexes?: (Callback<Array<int>> | undefined);
  public __options_has_$selectedIndexes?: boolean;
  @Param() public multiple?: (boolean | undefined);
  public __backing_multiple?: IParamDecoratedVariable<(boolean | undefined)>;
  public __options_has_multiple?: boolean;
  @Param() public chipGroupSpace?: (ChipGroupV2Space | undefined);
  public __backing_chipGroupSpace?: IParamDecoratedVariable<(ChipGroupV2Space | undefined)>;
  public __options_has_chipGroupSpace?: boolean;
  @Param() public chipGroupPadding?: (ChipGroupV2Padding | undefined);
  public __backing_chipGroupPadding?: IParamDecoratedVariable<(ChipGroupV2Padding | undefined)>;
  public __options_has_chipGroupPadding?: boolean;
  @Event() public onChange?: (Callback<Array<int>> | undefined);
  public __options_has_onChange?: boolean;
  public suffix?: (ChipGroupV2SuffixBuilder | undefined);
  public __options_has_suffix?: boolean;
  @Provider() public chipSize?: (ChipV2Size | SizeT<LengthMetrics>);
  public __backing_chipSize?: IProviderDecoratedVariable<(ChipV2Size | SizeT<LengthMetrics>)>;
  public __options_has_chipSize?: boolean;
  public scroller?: Scroller;
  public __options_has_scroller?: boolean;
  @Local() public selectedIndexesInternal?: (Array<int> | undefined);
  public __backing_selectedIndexesInternal?: ILocalDecoratedVariable<(Array<int> | undefined)>;
  public __options_has_selectedIndexesInternal?: boolean;
  @Local() public isReachEnd?: boolean;
  public __backing_isReachEnd?: ILocalDecoratedVariable<boolean>;
  public __options_has_isReachEnd?: boolean;
  @Local() public isRefresh?: boolean;
  public __backing_isRefresh?: ILocalDecoratedVariable<boolean>;
  public __options_has_isRefresh?: boolean;
  public constructor() {}
  
}

`;

function testChipGroupV2UITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform advanced-ui-components mock-chipgroupv2',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testChipGroupV2UITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
