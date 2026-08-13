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
        'mock-chipv2.ets'
    ),
];

const pluginTester = new PluginTester('test advanced-ui-components mock-chipv2', buildConfig);

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

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { SymbolGlyphImpl } from "arkui.component.symbolglyph";

import { SymbolGlyphAttribute } from "arkui.component.symbolglyph";

import { Memo } from "arkui.incremental.annotation";

import { ImageImpl } from "arkui.component.image";

import { ImageAttribute } from "arkui.component.image";

import { TextImpl } from "arkui.component.text";

import { TextAttribute } from "arkui.component.text";

import { ButtonImpl } from "arkui.component.button";

import { ButtonAttribute } from "arkui.component.button";

import { FlexImpl } from "arkui.component.flex";

import { FlexAttribute } from "arkui.component.flex";

import { RowImpl } from "arkui.component.row";

import { RowAttribute } from "arkui.component.row";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { $r, Builder, Button, ButtonOptions, ButtonType, Callback, ClickEvent, Color, ComponentV2, ConstraintSizeOptions, Curve, Dimension, Direction, Flex, FlexAlign, FontWeight, HoverEffect, Image, ImageFit, ItemAlign, KeyEvent, KeyType, Length, LocalizedMargin, LocalizedPadding, Margin, Padding, Resource, ResourceColor, ResourceStr, Row, ScaleOptions, ShadowStyle, SizeOptions, SymbolEffect, SymbolEffectStrategy, SymbolGlyph, Text, TextAlign, TextOverflow, VoidCallback, Rectangle } from "@ohos.arkui.component";

import { ImageModifier, SymbolGlyphModifier, TextModifier } from "@ohos.arkui.modifier";

import { Require, Param, ObservedV2, Trace, Event, Local } from "@ohos.arkui.stateManagement";

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

const RESOURCE_TYPE_STRING = 10003;
const RESOURCE_TYPE_FLOAT = 10002;
const RESOURCE_TYPE_INTEGER = 10007;
const HOT_SPOT_MIN_HEIGHT: number = 32;
function main() {}

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

function lengthMetricsToDimension(length: LengthMetrics): Dimension {
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

function colorMetricsToResourceColor(color: (ColorMetrics | undefined)): (ResourceColor | undefined) {
  if (!color) {
    return undefined;
  }
  return color.color;
}

"use static";

final class ChipV2Size extends BaseEnum<String> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  
  private constructor(ordinal: int, value: String) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly NORMAL: ChipV2Size = new ChipV2Size(0, "NORMAL");
  public static readonly SMALL: ChipV2Size = new ChipV2Size(1, "SMALL");
  private static readonly #NamesArray: String[] = ["NORMAL", "SMALL"];
  private static readonly #StringValuesArray: String[] = ["NORMAL", "SMALL"];
  private static readonly #ItemsArray: ChipV2Size[] = [ChipV2Size.NORMAL, ChipV2Size.SMALL];
  public getName(): String {
    return ChipV2Size.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): ChipV2Size {
    for (let i = ((ChipV2Size.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (ChipV2Size.#NamesArray[i]))) {
        return ChipV2Size.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant ChipV2Size.") + (name)));
  }
  
  public static fromValue(value: String): ChipV2Size {
    for (let i = ((ChipV2Size.#StringValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (ChipV2Size.#StringValuesArray[i]))) {
        return ChipV2Size.#ItemsArray[i];
      }
    }
    throw new Error((("No enum ChipV2Size with value ") + (value)));
  }
  
  public valueOf(): String {
    return ChipV2Size.#StringValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return ChipV2Size.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): ChipV2Size[] {
    return ChipV2Size.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: ChipV2Size): String {
    return e.getName();
  }
  
}

final class IconType extends BaseEnum<String> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  
  private constructor(ordinal: int, value: String) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly PREFIX_ICON: IconType = new IconType(0, "PREFIXICON");
  public static readonly SUFFIX_ICON: IconType = new IconType(1, "SUFFIXICON");
  public static readonly PREFIX_SYMBOL: IconType = new IconType(2, "PREFIXSYMBOL");
  public static readonly SUFFIX_SYMBOL: IconType = new IconType(3, "SUFFIXSYMBOL");
  private static readonly #NamesArray: String[] = ["PREFIX_ICON", "SUFFIX_ICON", "PREFIX_SYMBOL", "SUFFIX_SYMBOL"];
  private static readonly #StringValuesArray: String[] = ["PREFIXICON", "SUFFIXICON", "PREFIXSYMBOL", "SUFFIXSYMBOL"];
  private static readonly #ItemsArray: IconType[] = [IconType.PREFIX_ICON, IconType.SUFFIX_ICON, IconType.PREFIX_SYMBOL, IconType.SUFFIX_SYMBOL];
  public getName(): String {
    return IconType.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): IconType {
    for (let i = ((IconType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (IconType.#NamesArray[i]))) {
        return IconType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant IconType.") + (name)));
  }
  
  public static fromValue(value: String): IconType {
    for (let i = ((IconType.#StringValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (IconType.#StringValuesArray[i]))) {
        return IconType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum IconType with value ") + (value)));
  }
  
  public valueOf(): String {
    return IconType.#StringValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return IconType.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): IconType[] {
    return IconType.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: IconType): String {
    return e.getName();
  }
  
}

final class BreakPointsType extends BaseEnum<String> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  
  private constructor(ordinal: int, value: String) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly SM: BreakPointsType = new BreakPointsType(0, "SM");
  public static readonly MD: BreakPointsType = new BreakPointsType(1, "MD");
  public static readonly LG: BreakPointsType = new BreakPointsType(2, "LG");
  private static readonly #NamesArray: String[] = ["SM", "MD", "LG"];
  private static readonly #StringValuesArray: String[] = ["SM", "MD", "LG"];
  private static readonly #ItemsArray: BreakPointsType[] = [BreakPointsType.SM, BreakPointsType.MD, BreakPointsType.LG];
  public getName(): String {
    return BreakPointsType.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): BreakPointsType {
    for (let i = ((BreakPointsType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (BreakPointsType.#NamesArray[i]))) {
        return BreakPointsType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant BreakPointsType.") + (name)));
  }
  
  public static fromValue(value: String): BreakPointsType {
    for (let i = ((BreakPointsType.#StringValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (BreakPointsType.#StringValuesArray[i]))) {
        return BreakPointsType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum BreakPointsType with value ") + (value)));
  }
  
  public valueOf(): String {
    return BreakPointsType.#StringValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return BreakPointsType.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): BreakPointsType[] {
    return BreakPointsType.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: BreakPointsType): String {
    return e.getName();
  }
  
}

final class ChipV2AccessibilitySelectedType extends BaseEnum<int> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  
  private constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }
  
  public static readonly CLICKED: ChipV2AccessibilitySelectedType = new ChipV2AccessibilitySelectedType(0, 0);
  public static readonly CHECKED: ChipV2AccessibilitySelectedType = new ChipV2AccessibilitySelectedType(1, 1);
  public static readonly SELECTED: ChipV2AccessibilitySelectedType = new ChipV2AccessibilitySelectedType(2, 2);
  private static readonly #NamesArray: String[] = ["CLICKED", "CHECKED", "SELECTED"];
  private static readonly #ValuesArray: int[] = [0, 1, 2];
  private static readonly #StringValuesArray: String[] = ["0", "1", "2"];
  private static readonly #ItemsArray: ChipV2AccessibilitySelectedType[] = [ChipV2AccessibilitySelectedType.CLICKED, ChipV2AccessibilitySelectedType.CHECKED, ChipV2AccessibilitySelectedType.SELECTED];
  public getName(): String {
    return ChipV2AccessibilitySelectedType.#NamesArray[this.#ordinal];
  }
  
  public static getValueOf(name: String): ChipV2AccessibilitySelectedType {
    for (let i = ((ChipV2AccessibilitySelectedType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (ChipV2AccessibilitySelectedType.#NamesArray[i]))) {
        return ChipV2AccessibilitySelectedType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant ChipV2AccessibilitySelectedType.") + (name)));
  }
  
  public static fromValue(value: int): ChipV2AccessibilitySelectedType {
    for (let i = ((ChipV2AccessibilitySelectedType.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (ChipV2AccessibilitySelectedType.#ValuesArray[i]))) {
        return ChipV2AccessibilitySelectedType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum ChipV2AccessibilitySelectedType with value ") + (value)));
  }
  
  public valueOf(): int {
    return ChipV2AccessibilitySelectedType.#ValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return ChipV2AccessibilitySelectedType.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): ChipV2AccessibilitySelectedType[] {
    return ChipV2AccessibilitySelectedType.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: ChipV2AccessibilitySelectedType): String {
    return e.getName();
  }
  
}

interface ChipV2ImageIconConfig {
  get src(): ResourceStr
  set src(src: ResourceStr)
  get size(): (SizeT<LengthMetrics> | undefined) {
    return undefined;
  }
  set size(size: (SizeT<LengthMetrics> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fillColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set fillColor(fillColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedFillColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set activatedFillColor(activatedFillColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get modifier(): (ImageModifier | undefined) {
    return undefined;
  }
  set modifier(modifier: (ImageModifier | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

abstract class ChipV2Icon {
  public constructor() {}
  
}

class ChipV2ImageIcon extends ChipV2Icon {
  public src: ResourceStr;
  public size?: (SizeT<LengthMetrics> | undefined);
  public fillColor?: (ColorMetrics | undefined);
  public activatedFillColor?: (ColorMetrics | undefined);
  public modifier?: (ImageModifier | undefined);
  public constructor(config: ChipV2ImageIconConfig) {
    super();
    this.src = config.src;
    this.size = config.size;
    this.fillColor = config.fillColor;
    this.activatedFillColor = config.activatedFillColor;
    this.modifier = config.modifier;
  }
  
}

interface ChipV2SuffixImageIconConfig extends ChipV2ImageIconConfig, ChipV2AccessibilityConfig {
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
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
  get action(): (VoidCallback | undefined) {
    return undefined;
  }
  set action(action: (VoidCallback | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipV2SuffixImageIcon extends ChipV2ImageIcon implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"accessibilityText"}) public __backing_accessibilityText?: (ResourceStr | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_accessibilityText: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_accessibilityText");
  public get accessibilityText(): (ResourceStr | undefined) {
    this.conditionalAddRef(this.__meta_accessibilityText);
    return UIUtils.makeObserved((this.__backing_accessibilityText as (ResourceStr | undefined)));
  }
  
  public set accessibilityText(newValue: (ResourceStr | undefined)) {
    if (((this.__backing_accessibilityText) !== (newValue))) {
      this.__backing_accessibilityText = newValue;
      this.__meta_accessibilityText.fireChange();
      this.executeOnSubscribingWatches("accessibilityText");
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
  
  @JSONRename({newName:"action"}) public __backing_action?: (VoidCallback | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_action: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_action");
  public get action(): (VoidCallback | undefined) {
    this.conditionalAddRef(this.__meta_action);
    return UIUtils.makeObserved((this.__backing_action as (VoidCallback | undefined)));
  }
  
  public set action(newValue: (VoidCallback | undefined)) {
    if (((this.__backing_action) !== (newValue))) {
      this.__backing_action = newValue;
      this.__meta_action.fireChange();
      this.executeOnSubscribingWatches("action");
    }
  }
  
  public constructor(config: ChipV2SuffixImageIconConfig) {
    super(config);
    this.accessibilityLevel = config.accessibilityLevel;
    this.accessibilityText = config.accessibilityText;
    this.accessibilityDescription = config.accessibilityDescription;
    this.action = config.action;
  }
  
  static {
    
  }
}

interface ChipV2PrefixImageIconConfig extends ChipV2ImageIconConfig {
  
}

@ObservedV2() class ChipV2PrefixImageIcon extends ChipV2ImageIcon implements IObservedObject, ISubscribedWatches {
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
  
  public constructor(config: ChipV2PrefixImageIconConfig) {
    super(config);
  }
  
  static {
    
  }
}

interface ChipV2AccessibilityConfig {
  get accessibilityLevel(): (string | undefined) {
    return undefined;
  }
  set accessibilityLevel(accessibilityLevel: (string | undefined)) {
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
  
}

class ChipV2Accessibility {
  public accessibilityLevel?: (string | undefined);
  public accessibilityText?: (ResourceStr | undefined);
  public accessibilityDescription?: (ResourceStr | undefined);
  public constructor(config: ChipV2AccessibilityConfig) {
    this.accessibilityLevel = config.accessibilityLevel;
    this.accessibilityText = config.accessibilityText;
    this.accessibilityDescription = config.accessibilityDescription;
  }
  
}

interface ChipV2CloseConfig extends ChipV2AccessibilityConfig {
  get fontSize(): (LengthMetrics | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipV2CloseIcon extends ChipV2Accessibility implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"fontSize"}) public __backing_fontSize?: (LengthMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_fontSize: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_fontSize");
  public get fontSize(): (LengthMetrics | undefined) {
    this.conditionalAddRef(this.__meta_fontSize);
    return UIUtils.makeObserved((this.__backing_fontSize as (LengthMetrics | undefined)));
  }
  
  public set fontSize(newValue: (LengthMetrics | undefined)) {
    if (((this.__backing_fontSize) !== (newValue))) {
      this.__backing_fontSize = newValue;
      this.__meta_fontSize.fireChange();
      this.executeOnSubscribingWatches("fontSize");
    }
  }
  
  public constructor(config: ChipV2CloseConfig) {
    super(config);
    this.fontSize = config.fontSize;
  }
  
  static {
    
  }
}

interface ChipV2SymbolIconConfig {
  get normal(): (SymbolGlyphModifier | undefined) {
    return undefined;
  }
  set normal(normal: (SymbolGlyphModifier | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activated(): (SymbolGlyphModifier | undefined) {
    return undefined;
  }
  set activated(activated: (SymbolGlyphModifier | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

class ChipV2SymbolIcon extends ChipV2Icon {
  public normal?: (SymbolGlyphModifier | undefined);
  public activated?: (SymbolGlyphModifier | undefined);
  public constructor(config: ChipV2SymbolIconConfig) {
    super();
    this.normal = config.normal;
    this.activated = config.activated;
  }
  
}

interface ChipV2PrefixSymbolIconConfig extends ChipV2SymbolIconConfig {
  
}

@ObservedV2() class ChipV2PrefixSymbolIcon extends ChipV2SymbolIcon implements IObservedObject, ISubscribedWatches {
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
  
  public constructor(config: ChipV2PrefixSymbolIconConfig) {
    super(config);
  }
  
  static {
    
  }
}

interface ChipV2SuffixSymbolIconConfig extends ChipV2SymbolIconConfig {
  get normalAccessibility(): (ChipV2AccessibilityConfig | undefined) {
    return undefined;
  }
  set normalAccessibility(normalAccessibility: (ChipV2AccessibilityConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedAccessibility(): (ChipV2AccessibilityConfig | undefined) {
    return undefined;
  }
  set activatedAccessibility(activatedAccessibility: (ChipV2AccessibilityConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get action(): (VoidCallback | undefined) {
    return undefined;
  }
  set action(action: (VoidCallback | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipV2SuffixSymbolIcon extends ChipV2SymbolIcon implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"normalAccessibility"}) public __backing_normalAccessibility?: (ChipV2Accessibility | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_normalAccessibility: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_normalAccessibility");
  public get normalAccessibility(): (ChipV2Accessibility | undefined) {
    this.conditionalAddRef(this.__meta_normalAccessibility);
    return UIUtils.makeObserved((this.__backing_normalAccessibility as (ChipV2Accessibility | undefined)));
  }
  
  public set normalAccessibility(newValue: (ChipV2Accessibility | undefined)) {
    if (((this.__backing_normalAccessibility) !== (newValue))) {
      this.__backing_normalAccessibility = newValue;
      this.__meta_normalAccessibility.fireChange();
      this.executeOnSubscribingWatches("normalAccessibility");
    }
  }
  
  @JSONRename({newName:"activatedAccessibility"}) public __backing_activatedAccessibility?: (ChipV2Accessibility | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_activatedAccessibility: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_activatedAccessibility");
  public get activatedAccessibility(): (ChipV2Accessibility | undefined) {
    this.conditionalAddRef(this.__meta_activatedAccessibility);
    return UIUtils.makeObserved((this.__backing_activatedAccessibility as (ChipV2Accessibility | undefined)));
  }
  
  public set activatedAccessibility(newValue: (ChipV2Accessibility | undefined)) {
    if (((this.__backing_activatedAccessibility) !== (newValue))) {
      this.__backing_activatedAccessibility = newValue;
      this.__meta_activatedAccessibility.fireChange();
      this.executeOnSubscribingWatches("activatedAccessibility");
    }
  }
  
  @JSONRename({newName:"action"}) public __backing_action?: (VoidCallback | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_action: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_action");
  public get action(): (VoidCallback | undefined) {
    this.conditionalAddRef(this.__meta_action);
    return UIUtils.makeObserved((this.__backing_action as (VoidCallback | undefined)));
  }
  
  public set action(newValue: (VoidCallback | undefined)) {
    if (((this.__backing_action) !== (newValue))) {
      this.__backing_action = newValue;
      this.__meta_action.fireChange();
      this.executeOnSubscribingWatches("action");
    }
  }
  
  public constructor(config: ChipV2SuffixSymbolIconConfig) {
    super(config);
    this.normalAccessibility = (config.normalAccessibility ? new ChipV2Accessibility(config.normalAccessibility!) : undefined);
    this.activatedAccessibility = (config.activatedAccessibility ? new ChipV2Accessibility(config.activatedAccessibility!) : undefined);
    this.action = config.action;
  }
  
  static {
    
  }
}

interface ChipV2LabelMarginConfig {
  get left(): (LengthMetrics | undefined) {
    return undefined;
  }
  set left(left: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get right(): (LengthMetrics | undefined) {
    return undefined;
  }
  set right(right: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

interface ChipV2LocalizedLabelMarginConfig {
  get start(): (LengthMetrics | undefined) {
    return undefined;
  }
  set start(start: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get end(): (LengthMetrics | undefined) {
    return undefined;
  }
  set end(end: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

interface ChipV2LabelConfig {
  get text(): string
  set text(text: string)
  get fontSize(): (LengthMetrics | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set fontColor(fontColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedFontColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set activatedFontColor(activatedFontColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontFamily(): (string | undefined) {
    return undefined;
  }
  set fontFamily(fontFamily: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get labelMargin(): (ChipV2LabelMarginConfig | undefined) {
    return undefined;
  }
  set labelMargin(labelMargin: (ChipV2LabelMarginConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get localizedLabelMargin(): (ChipV2LocalizedLabelMarginConfig | undefined) {
    return undefined;
  }
  set localizedLabelMargin(localizedLabelMargin: (ChipV2LocalizedLabelMarginConfig | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get modifier(): (TextModifier | undefined) {
    return undefined;
  }
  set modifier(modifier: (TextModifier | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipV2Label implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"text"}) public __backing_text?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_text: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_text");
  public get text(): string {
    this.conditionalAddRef(this.__meta_text);
    return UIUtils.makeObserved((this.__backing_text as string));
  }
  
  public set text(newValue: string) {
    if (((this.__backing_text) !== (newValue))) {
      this.__backing_text = newValue;
      this.__meta_text.fireChange();
      this.executeOnSubscribingWatches("text");
    }
  }
  
  @JSONRename({newName:"fontSize"}) public __backing_fontSize?: (LengthMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_fontSize: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_fontSize");
  public get fontSize(): (LengthMetrics | undefined) {
    this.conditionalAddRef(this.__meta_fontSize);
    return UIUtils.makeObserved((this.__backing_fontSize as (LengthMetrics | undefined)));
  }
  
  public set fontSize(newValue: (LengthMetrics | undefined)) {
    if (((this.__backing_fontSize) !== (newValue))) {
      this.__backing_fontSize = newValue;
      this.__meta_fontSize.fireChange();
      this.executeOnSubscribingWatches("fontSize");
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
  
  @JSONRename({newName:"activatedFontColor"}) public __backing_activatedFontColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_activatedFontColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_activatedFontColor");
  public get activatedFontColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_activatedFontColor);
    return UIUtils.makeObserved((this.__backing_activatedFontColor as (ColorMetrics | undefined)));
  }
  
  public set activatedFontColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_activatedFontColor) !== (newValue))) {
      this.__backing_activatedFontColor = newValue;
      this.__meta_activatedFontColor.fireChange();
      this.executeOnSubscribingWatches("activatedFontColor");
    }
  }
  
  @JSONRename({newName:"fontFamily"}) public __backing_fontFamily?: (string | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_fontFamily: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_fontFamily");
  public get fontFamily(): (string | undefined) {
    this.conditionalAddRef(this.__meta_fontFamily);
    return UIUtils.makeObserved((this.__backing_fontFamily as (string | undefined)));
  }
  
  public set fontFamily(newValue: (string | undefined)) {
    if (((this.__backing_fontFamily) !== (newValue))) {
      this.__backing_fontFamily = newValue;
      this.__meta_fontFamily.fireChange();
      this.executeOnSubscribingWatches("fontFamily");
    }
  }
  
  @JSONRename({newName:"labelMargin"}) public __backing_labelMargin?: (ChipV2LabelMarginConfig | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_labelMargin: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_labelMargin");
  public get labelMargin(): (ChipV2LabelMarginConfig | undefined) {
    this.conditionalAddRef(this.__meta_labelMargin);
    return UIUtils.makeObserved((this.__backing_labelMargin as (ChipV2LabelMarginConfig | undefined)));
  }
  
  public set labelMargin(newValue: (ChipV2LabelMarginConfig | undefined)) {
    if (((this.__backing_labelMargin) !== (newValue))) {
      this.__backing_labelMargin = newValue;
      this.__meta_labelMargin.fireChange();
      this.executeOnSubscribingWatches("labelMargin");
    }
  }
  
  @JSONRename({newName:"localizedLabelMargin"}) public __backing_localizedLabelMargin?: (ChipV2LocalizedLabelMarginConfig | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_localizedLabelMargin: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_localizedLabelMargin");
  public get localizedLabelMargin(): (ChipV2LocalizedLabelMarginConfig | undefined) {
    this.conditionalAddRef(this.__meta_localizedLabelMargin);
    return UIUtils.makeObserved((this.__backing_localizedLabelMargin as (ChipV2LocalizedLabelMarginConfig | undefined)));
  }
  
  public set localizedLabelMargin(newValue: (ChipV2LocalizedLabelMarginConfig | undefined)) {
    if (((this.__backing_localizedLabelMargin) !== (newValue))) {
      this.__backing_localizedLabelMargin = newValue;
      this.__meta_localizedLabelMargin.fireChange();
      this.executeOnSubscribingWatches("localizedLabelMargin");
    }
  }
  
  @JSONRename({newName:"modifier"}) public __backing_modifier?: (TextModifier | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_modifier: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_modifier");
  public get modifier(): (TextModifier | undefined) {
    this.conditionalAddRef(this.__meta_modifier);
    return UIUtils.makeObserved((this.__backing_modifier as (TextModifier | undefined)));
  }
  
  public set modifier(newValue: (TextModifier | undefined)) {
    if (((this.__backing_modifier) !== (newValue))) {
      this.__backing_modifier = newValue;
      this.__meta_modifier.fireChange();
      this.executeOnSubscribingWatches("modifier");
    }
  }
  
  public constructor(config: ChipV2LabelConfig) {
    this.text = config.text;
    this.fontSize = config.fontSize;
    this.fontColor = config.fontColor;
    this.activatedFontColor = config.activatedFontColor;
    this.fontFamily = config.fontFamily;
    this.labelMargin = config.labelMargin;
    this.localizedLabelMargin = config.localizedLabelMargin;
    this.modifier = config.modifier;
  }
  
  static {
    
  }
}

interface IconTheme {
  get normalSize(): SizeOptions
  set normalSize(normalSize: SizeOptions)
  get smallSize(): SizeOptions
  set smallSize(smallSize: SizeOptions)
  get fillColor(): ResourceColor
  set fillColor(fillColor: ResourceColor)
  get activatedFillColor(): ResourceColor
  set activatedFillColor(activatedFillColor: ResourceColor)
  get focusFillColor(): ResourceColor
  set focusFillColor(focusFillColor: ResourceColor)
  get focusActivatedColor(): ResourceColor
  set focusActivatedColor(focusActivatedColor: ResourceColor)
  
}

interface PrefixIconTheme extends IconTheme {
  
}

interface SuffixIconTheme extends IconTheme {
  get defaultDeleteIcon(): ResourceStr
  set defaultDeleteIcon(defaultDeleteIcon: ResourceStr)
  get focusable(): boolean
  set focusable(focusable: boolean)
  get isShowMargin(): Resource
  set isShowMargin(isShowMargin: Resource)
  
}

interface DefaultSymbolTheme {
  get normalFontColor(): Array<ResourceColor>
  set normalFontColor(normalFontColor: Array<ResourceColor>)
  get activatedFontColor(): Array<ResourceColor>
  set activatedFontColor(activatedFontColor: Array<ResourceColor>)
  get smallSymbolFontSize(): Length
  set smallSymbolFontSize(smallSymbolFontSize: Length)
  get normalSymbolFontSize(): Length
  set normalSymbolFontSize(normalSymbolFontSize: Length)
  get defaultEffect(): int
  set defaultEffect(defaultEffect: int)
  
}

interface LabelTheme {
  get normalFontSize(): Dimension
  set normalFontSize(normalFontSize: Dimension)
  get smallFontSize(): Dimension
  set smallFontSize(smallFontSize: Dimension)
  get adaptiveItemFontSize(): Dimension
  set adaptiveItemFontSize(adaptiveItemFontSize: Dimension)
  get focusFontColor(): ResourceColor
  set focusFontColor(focusFontColor: ResourceColor)
  get focusActiveFontColor(): ResourceColor
  set focusActiveFontColor(focusActiveFontColor: ResourceColor)
  get fontColor(): ResourceColor
  set fontColor(fontColor: ResourceColor)
  get activatedFontColor(): ResourceColor
  set activatedFontColor(activatedFontColor: ResourceColor)
  get fontFamily(): string
  set fontFamily(fontFamily: string)
  get normalMargin(): Margin
  set normalMargin(normalMargin: Margin)
  get localizedNormalMargin(): LocalizedMargin
  set localizedNormalMargin(localizedNormalMargin: LocalizedMargin)
  get smallMargin(): Margin
  set smallMargin(smallMargin: Margin)
  get localizedSmallMargin(): LocalizedMargin
  set localizedSmallMargin(localizedSmallMargin: LocalizedMargin)
  get defaultFontSize(): Dimension
  set defaultFontSize(defaultFontSize: Dimension)
  get fontWeight(): Resource
  set fontWeight(fontWeight: Resource)
  get activatedFontWeight(): Resource
  set activatedFontWeight(activatedFontWeight: Resource)
  
}

interface ChipNodeOpacity {
  get normal(): number
  set normal(normal: number)
  get hover(): number
  set hover(hover: number)
  get pressed(): number
  set pressed(pressed: number)
  
}

interface ChipNodeConstraintWidth {
  get breakPointMinWidth(): number
  set breakPointMinWidth(breakPointMinWidth: number)
  get breakPointSmMaxWidth(): number
  set breakPointSmMaxWidth(breakPointSmMaxWidth: number)
  get breakPointMdMaxWidth(): number
  set breakPointMdMaxWidth(breakPointMdMaxWidth: number)
  get breakPointLgMaxWidth(): number
  set breakPointLgMaxWidth(breakPointLgMaxWidth: number)
  
}

interface ChipNodeTheme {
  get suitAgeScale(): number
  set suitAgeScale(suitAgeScale: number)
  get minLabelWidth(): Dimension
  set minLabelWidth(minLabelWidth: Dimension)
  get normalHeight(): Dimension
  set normalHeight(normalHeight: Dimension)
  get smallHeight(): Dimension
  set smallHeight(smallHeight: Dimension)
  get activatedNormalHeight(): Dimension
  set activatedNormalHeight(activatedNormalHeight: Dimension)
  get activatedSmallHeight(): Dimension
  set activatedSmallHeight(activatedSmallHeight: Dimension)
  get enabled(): boolean
  set enabled(enabled: boolean)
  get activated(): boolean
  set activated(activated: boolean)
  get backgroundColor(): ResourceColor
  set backgroundColor(backgroundColor: ResourceColor)
  get activatedBackgroundColor(): ResourceColor
  set activatedBackgroundColor(activatedBackgroundColor: ResourceColor)
  get backgroundSystemMaterial(): uiMaterial.Material
  set backgroundSystemMaterial(backgroundSystemMaterial: uiMaterial.Material)
  get activatedBackgroundSystemMaterial(): uiMaterial.Material
  set activatedBackgroundSystemMaterial(activatedBackgroundSystemMaterial: uiMaterial.Material)
  get focusOutlineColor(): ResourceColor
  set focusOutlineColor(focusOutlineColor: ResourceColor)
  get borderColor(): ResourceColor
  set borderColor(borderColor: ResourceColor)
  get defaultBorderWidth(): Dimension
  set defaultBorderWidth(defaultBorderWidth: Dimension)
  get activatedBorderColor(): ResourceColor
  set activatedBorderColor(activatedBorderColor: ResourceColor)
  get focusBtnScaleX(): Resource
  set focusBtnScaleX(focusBtnScaleX: Resource)
  get focusBtnScaleY(): Resource
  set focusBtnScaleY(focusBtnScaleY: Resource)
  get focusBgColor(): ResourceColor
  set focusBgColor(focusBgColor: ResourceColor)
  get focusActivatedBgColor(): ResourceColor
  set focusActivatedBgColor(focusActivatedBgColor: ResourceColor)
  get normalShadowStyle(): Resource
  set normalShadowStyle(normalShadowStyle: Resource)
  get smallShadowStyle(): Resource
  set smallShadowStyle(smallShadowStyle: Resource)
  get focusOutlineMargin(): number
  set focusOutlineMargin(focusOutlineMargin: number)
  get normalBorderRadius(): Dimension
  set normalBorderRadius(normalBorderRadius: Dimension)
  get smallBorderRadius(): Dimension
  set smallBorderRadius(smallBorderRadius: Dimension)
  get borderWidth(): number
  set borderWidth(borderWidth: number)
  get activatedBorderWidth(): Dimension
  set activatedBorderWidth(activatedBorderWidth: Dimension)
  get localizedNormalPadding(): LocalizedPadding
  set localizedNormalPadding(localizedNormalPadding: LocalizedPadding)
  get localizedSmallPadding(): LocalizedPadding
  set localizedSmallPadding(localizedSmallPadding: LocalizedPadding)
  get localizedActivatedNormalPadding(): LocalizedPadding
  set localizedActivatedNormalPadding(localizedActivatedNormalPadding: LocalizedPadding)
  get localizedActivatedSmallPadding(): LocalizedPadding
  set localizedActivatedSmallPadding(localizedActivatedSmallPadding: LocalizedPadding)
  get hoverBlendColor(): ResourceColor
  set hoverBlendColor(hoverBlendColor: ResourceColor)
  get pressedBlendColor(): ResourceColor
  set pressedBlendColor(pressedBlendColor: ResourceColor)
  get opacity(): ChipNodeOpacity
  set opacity(opacity: ChipNodeOpacity)
  get breakPointConstraintWidth(): ChipNodeConstraintWidth
  set breakPointConstraintWidth(breakPointConstraintWidth: ChipNodeConstraintWidth)
  
}

interface ChipTheme {
  get prefixIcon(): PrefixIconTheme
  set prefixIcon(prefixIcon: PrefixIconTheme)
  get label(): LabelTheme
  set label(label: LabelTheme)
  get suffixIcon(): SuffixIconTheme
  set suffixIcon(suffixIcon: SuffixIconTheme)
  get defaultSymbol(): DefaultSymbolTheme
  set defaultSymbol(defaultSymbol: DefaultSymbolTheme)
  get chipNode(): ChipNodeTheme
  set chipNode(chipNode: ChipNodeTheme)
  
}

class LengthMetricsUtils {
  private static instance?: (LengthMetricsUtils | undefined);
  private constructor() {}
  
  public static getInstance(): LengthMetricsUtils {
    if (!(LengthMetricsUtils.instance)) {
      LengthMetricsUtils.instance = new LengthMetricsUtils();
    }
    return LengthMetricsUtils.instance!;
  }
  
  public isNaturalNumber(metrics: LengthMetrics): boolean {
    return ((metrics.value) >= (0));
  }
  
  static {
    
  }
}

class LengthMetricsCache {
  private static _cache: Map<string, LengthMetrics> = new Map<string, LengthMetrics>();
  public static get(key: string, defaultValue: LengthMetrics): LengthMetrics {
    if (LengthMetricsCache._cache.has(key)) {
      return LengthMetricsCache._cache.get(key)!;
    }
    try {
      const res: Resource = {
        id: -1,
        type: 10002,
        params: [key],
        bundleName: "__harDefaultBundleName__",
        moduleName: "__harDefaultModuleName__",
      };
      const metrics = LengthMetrics.resource(res);
      LengthMetricsCache._cache.set(key, metrics);
      return metrics;
    } catch (error) {
      return defaultValue;
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

interface IChipV2OptionsConfig {
  get label(): ChipV2Label
  set label(label: ChipV2Label)
  get prefixIcon(): (ChipV2Icon | undefined) {
    return undefined;
  }
  set prefixIcon(prefixIcon: (ChipV2Icon | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get suffixIcon(): (ChipV2Icon | undefined) {
    return undefined;
  }
  set suffixIcon(suffixIcon: (ChipV2Icon | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get allowClose(): (boolean | undefined) {
    return undefined;
  }
  set allowClose(allowClose: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get closeIcon(): (ChipV2CloseIcon | undefined) {
    return undefined;
  }
  set closeIcon(closeIcon: (ChipV2CloseIcon | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get enabled(): (boolean | undefined) {
    return undefined;
  }
  set enabled(enabled: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activated(): (boolean | undefined) {
    return undefined;
  }
  set activated(activated: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get backgroundColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set backgroundColor(backgroundColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedBackgroundColor(): (ColorMetrics | undefined) {
    return undefined;
  }
  set activatedBackgroundColor(activatedBackgroundColor: (ColorMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get borderRadius(): (LengthMetrics | undefined) {
    return undefined;
  }
  set borderRadius(borderRadius: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get size(): ((ChipV2Size | SizeT<LengthMetrics>) | undefined) {
    return undefined;
  }
  set size(size: ((ChipV2Size | SizeT<LengthMetrics>) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get direction(): (Direction | undefined) {
    return undefined;
  }
  set direction(direction: (Direction | undefined)) {
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
  get accessibilitySelectedType(): (ChipV2AccessibilitySelectedType | undefined) {
    return undefined;
  }
  set accessibilitySelectedType(accessibilitySelectedType: (ChipV2AccessibilitySelectedType | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get maxFontScale(): ((number | Resource) | undefined) {
    return undefined;
  }
  set maxFontScale(maxFontScale: ((number | Resource) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get minFontScale(): ((number | Resource) | undefined) {
    return undefined;
  }
  set minFontScale(minFontScale: ((number | Resource) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get padding(): (LocalizedPadding | undefined) {
    return undefined;
  }
  set padding(padding: (LocalizedPadding | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontSize(): (LengthMetrics | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (LengthMetrics | undefined)) {
    throw new InvalidStoreAccessError();
  }
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
  get onClose(): (VoidCallback | undefined) {
    return undefined;
  }
  set onClose(onClose: (VoidCallback | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get onClicked(): (Callback<void> | undefined) {
    return undefined;
  }
  set onClicked(onClicked: (Callback<void> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ObservedV2() class ChipV2Options implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"prefixIcon"}) public __backing_prefixIcon?: (ChipV2Icon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_prefixIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_prefixIcon");
  public get prefixIcon(): (ChipV2Icon | undefined) {
    this.conditionalAddRef(this.__meta_prefixIcon);
    return UIUtils.makeObserved((this.__backing_prefixIcon as (ChipV2Icon | undefined)));
  }
  
  public set prefixIcon(newValue: (ChipV2Icon | undefined)) {
    if (((this.__backing_prefixIcon) !== (newValue))) {
      this.__backing_prefixIcon = newValue;
      this.__meta_prefixIcon.fireChange();
      this.executeOnSubscribingWatches("prefixIcon");
    }
  }
  
  @JSONRename({newName:"suffixIcon"}) public __backing_suffixIcon?: (ChipV2Icon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_suffixIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_suffixIcon");
  public get suffixIcon(): (ChipV2Icon | undefined) {
    this.conditionalAddRef(this.__meta_suffixIcon);
    return UIUtils.makeObserved((this.__backing_suffixIcon as (ChipV2Icon | undefined)));
  }
  
  public set suffixIcon(newValue: (ChipV2Icon | undefined)) {
    if (((this.__backing_suffixIcon) !== (newValue))) {
      this.__backing_suffixIcon = newValue;
      this.__meta_suffixIcon.fireChange();
      this.executeOnSubscribingWatches("suffixIcon");
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
  
  @JSONRename({newName:"closeIcon"}) public __backing_closeIcon?: (ChipV2CloseIcon | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_closeIcon: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_closeIcon");
  public get closeIcon(): (ChipV2CloseIcon | undefined) {
    this.conditionalAddRef(this.__meta_closeIcon);
    return UIUtils.makeObserved((this.__backing_closeIcon as (ChipV2CloseIcon | undefined)));
  }
  
  public set closeIcon(newValue: (ChipV2CloseIcon | undefined)) {
    if (((this.__backing_closeIcon) !== (newValue))) {
      this.__backing_closeIcon = newValue;
      this.__meta_closeIcon.fireChange();
      this.executeOnSubscribingWatches("closeIcon");
    }
  }
  
  @JSONRename({newName:"enabled"}) public __backing_enabled?: (boolean | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_enabled: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_enabled");
  public get enabled(): (boolean | undefined) {
    this.conditionalAddRef(this.__meta_enabled);
    return UIUtils.makeObserved((this.__backing_enabled as (boolean | undefined)));
  }
  
  public set enabled(newValue: (boolean | undefined)) {
    if (((this.__backing_enabled) !== (newValue))) {
      this.__backing_enabled = newValue;
      this.__meta_enabled.fireChange();
      this.executeOnSubscribingWatches("enabled");
    }
  }
  
  @JSONRename({newName:"activated"}) public __backing_activated?: (boolean | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_activated: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_activated");
  public get activated(): (boolean | undefined) {
    this.conditionalAddRef(this.__meta_activated);
    return UIUtils.makeObserved((this.__backing_activated as (boolean | undefined)));
  }
  
  public set activated(newValue: (boolean | undefined)) {
    if (((this.__backing_activated) !== (newValue))) {
      this.__backing_activated = newValue;
      this.__meta_activated.fireChange();
      this.executeOnSubscribingWatches("activated");
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
  
  @JSONRename({newName:"activatedBackgroundColor"}) public __backing_activatedBackgroundColor?: (ColorMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_activatedBackgroundColor: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_activatedBackgroundColor");
  public get activatedBackgroundColor(): (ColorMetrics | undefined) {
    this.conditionalAddRef(this.__meta_activatedBackgroundColor);
    return UIUtils.makeObserved((this.__backing_activatedBackgroundColor as (ColorMetrics | undefined)));
  }
  
  public set activatedBackgroundColor(newValue: (ColorMetrics | undefined)) {
    if (((this.__backing_activatedBackgroundColor) !== (newValue))) {
      this.__backing_activatedBackgroundColor = newValue;
      this.__meta_activatedBackgroundColor.fireChange();
      this.executeOnSubscribingWatches("activatedBackgroundColor");
    }
  }
  
  @JSONRename({newName:"borderRadius"}) public __backing_borderRadius?: (LengthMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_borderRadius: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_borderRadius");
  public get borderRadius(): (LengthMetrics | undefined) {
    this.conditionalAddRef(this.__meta_borderRadius);
    return UIUtils.makeObserved((this.__backing_borderRadius as (LengthMetrics | undefined)));
  }
  
  public set borderRadius(newValue: (LengthMetrics | undefined)) {
    if (((this.__backing_borderRadius) !== (newValue))) {
      this.__backing_borderRadius = newValue;
      this.__meta_borderRadius.fireChange();
      this.executeOnSubscribingWatches("borderRadius");
    }
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
  
  @JSONRename({newName:"direction"}) public __backing_direction?: (Direction | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_direction: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_direction");
  public get direction(): (Direction | undefined) {
    this.conditionalAddRef(this.__meta_direction);
    return UIUtils.makeObserved((this.__backing_direction as (Direction | undefined)));
  }
  
  public set direction(newValue: (Direction | undefined)) {
    if (((this.__backing_direction) !== (newValue))) {
      this.__backing_direction = newValue;
      this.__meta_direction.fireChange();
      this.executeOnSubscribingWatches("direction");
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
  
  @JSONRename({newName:"accessibilitySelectedType"}) public __backing_accessibilitySelectedType?: (ChipV2AccessibilitySelectedType | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_accessibilitySelectedType: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_accessibilitySelectedType");
  public get accessibilitySelectedType(): (ChipV2AccessibilitySelectedType | undefined) {
    this.conditionalAddRef(this.__meta_accessibilitySelectedType);
    return UIUtils.makeObserved((this.__backing_accessibilitySelectedType as (ChipV2AccessibilitySelectedType | undefined)));
  }
  
  public set accessibilitySelectedType(newValue: (ChipV2AccessibilitySelectedType | undefined)) {
    if (((this.__backing_accessibilitySelectedType) !== (newValue))) {
      this.__backing_accessibilitySelectedType = newValue;
      this.__meta_accessibilitySelectedType.fireChange();
      this.executeOnSubscribingWatches("accessibilitySelectedType");
    }
  }
  
  @JSONRename({newName:"maxFontScale"}) public __backing_maxFontScale?: (number | Resource | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_maxFontScale: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_maxFontScale");
  public get maxFontScale(): (number | Resource | undefined) {
    this.conditionalAddRef(this.__meta_maxFontScale);
    return UIUtils.makeObserved((this.__backing_maxFontScale as (number | Resource | undefined)));
  }
  
  public set maxFontScale(newValue: (number | Resource | undefined)) {
    if (((this.__backing_maxFontScale) !== (newValue))) {
      this.__backing_maxFontScale = newValue;
      this.__meta_maxFontScale.fireChange();
      this.executeOnSubscribingWatches("maxFontScale");
    }
  }
  
  @JSONRename({newName:"minFontScale"}) public __backing_minFontScale?: (number | Resource | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_minFontScale: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_minFontScale");
  public get minFontScale(): (number | Resource | undefined) {
    this.conditionalAddRef(this.__meta_minFontScale);
    return UIUtils.makeObserved((this.__backing_minFontScale as (number | Resource | undefined)));
  }
  
  public set minFontScale(newValue: (number | Resource | undefined)) {
    if (((this.__backing_minFontScale) !== (newValue))) {
      this.__backing_minFontScale = newValue;
      this.__meta_minFontScale.fireChange();
      this.executeOnSubscribingWatches("minFontScale");
    }
  }
  
  @JSONRename({newName:"padding"}) public __backing_padding?: (LocalizedPadding | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_padding: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_padding");
  public get padding(): (LocalizedPadding | undefined) {
    this.conditionalAddRef(this.__meta_padding);
    return UIUtils.makeObserved((this.__backing_padding as (LocalizedPadding | undefined)));
  }
  
  public set padding(newValue: (LocalizedPadding | undefined)) {
    if (((this.__backing_padding) !== (newValue))) {
      this.__backing_padding = newValue;
      this.__meta_padding.fireChange();
      this.executeOnSubscribingWatches("padding");
    }
  }
  
  @JSONRename({newName:"fontSize"}) public __backing_fontSize?: (LengthMetrics | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_fontSize: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_fontSize");
  public get fontSize(): (LengthMetrics | undefined) {
    this.conditionalAddRef(this.__meta_fontSize);
    return UIUtils.makeObserved((this.__backing_fontSize as (LengthMetrics | undefined)));
  }
  
  public set fontSize(newValue: (LengthMetrics | undefined)) {
    if (((this.__backing_fontSize) !== (newValue))) {
      this.__backing_fontSize = newValue;
      this.__meta_fontSize.fireChange();
      this.executeOnSubscribingWatches("fontSize");
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
  
  @JSONRename({newName:"activatedBackgroundSystemMaterial"}) public __backing_activatedBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_activatedBackgroundSystemMaterial: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_activatedBackgroundSystemMaterial");
  public get activatedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    this.conditionalAddRef(this.__meta_activatedBackgroundSystemMaterial);
    return UIUtils.makeObserved((this.__backing_activatedBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
  }
  
  public set activatedBackgroundSystemMaterial(newValue: (uiMaterial.Material | undefined)) {
    if (((this.__backing_activatedBackgroundSystemMaterial) !== (newValue))) {
      this.__backing_activatedBackgroundSystemMaterial = newValue;
      this.__meta_activatedBackgroundSystemMaterial.fireChange();
      this.executeOnSubscribingWatches("activatedBackgroundSystemMaterial");
    }
  }
  
  public onClose?: (VoidCallback | undefined);
  public onClicked?: (Callback<void> | undefined);
  public constructor(config: IChipV2OptionsConfig) {
    this.label = config.label;
    this.prefixIcon = config.prefixIcon;
    this.suffixIcon = config.suffixIcon;
    this.allowClose = config.allowClose;
    this.closeIcon = config.closeIcon;
    this.enabled = ((config.enabled) ?? (true));
    this.activated = config.activated;
    this.backgroundColor = config.backgroundColor;
    this.activatedBackgroundColor = config.activatedBackgroundColor;
    this.borderRadius = config.borderRadius;
    this.size = ((config.size) ?? (ChipV2Size.NORMAL));
    this.direction = ((config.direction) ?? (Direction.Auto));
    this.accessibilityDescription = config.accessibilityDescription;
    this.accessibilityLevel = config.accessibilityLevel;
    this.accessibilitySelectedType = config.accessibilitySelectedType;
    this.maxFontScale = config.maxFontScale;
    this.minFontScale = config.minFontScale;
    this.padding = config.padding;
    this.fontSize = config.fontSize;
    this.backgroundSystemMaterial = config.backgroundSystemMaterial;
    this.activatedBackgroundSystemMaterial = config.activatedBackgroundSystemMaterial;
    this.onClose = config.onClose;
    this.onClicked = config.onClicked;
  }
  
  static {
    
  }
}

class ChipV2EnvironmentCallbackEntry implements EnvironmentCallback {
  private chipv2: ChipV2;
  public constructor(chipv2: ChipV2) {
    this.chipv2 = chipv2;
  }
  
  public onConfigurationUpdated(config: Configuration) {
    this.chipv2.fontSizeScale = ((config.fontSizeScale) ?? (1));
    this.chipv2.updateLanguageLineHeight();
  }
  
  public onMemoryLevel(level: AbilityConstant.MemoryLevel) {}
  
}

@ComponentV2() final struct ChipV2 extends CustomComponentV2<ChipV2, __Options_ChipV2> {
  public __initializeStruct(initializers: (__Options_ChipV2 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_theme = ((({let gensym___148283410 = initializers;
    (((gensym___148283410) == (null)) ? undefined : gensym___148283410.theme)})) ?? ({
      prefixIcon: {
        normalSize: {
          width: _r(16777216, 10003, "com.example.mock", "entry"),
          height: _r(16777216, 10003, "com.example.mock", "entry"),
        },
        smallSize: {
          width: _r(16777216, 10003, "com.example.mock", "entry"),
          height: _r(16777216, 10003, "com.example.mock", "entry"),
        },
        fillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusActivatedColor: _r(16777216, 10003, "com.example.mock", "entry"),
      },
      label: {
        normalFontSize: _r(16777216, 10003, "com.example.mock", "entry"),
        smallFontSize: _r(16777216, 10003, "com.example.mock", "entry"),
        adaptiveItemFontSize: _r(16777216, 10003, "com.example.mock", "entry"),
        focusFontColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusActiveFontColor: _r(16777216, 10003, "com.example.mock", "entry"),
        fontColor: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedFontColor: _r(16777216, 10003, "com.example.mock", "entry"),
        fontFamily: "HarmonyOS Sans",
        fontWeight: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedFontWeight: _r(16777216, 10003, "com.example.mock", "entry"),
        normalMargin: {
          left: 6,
          right: 6,
          top: 0,
          bottom: 0,
        },
        smallMargin: {
          left: 4,
          right: 4,
          top: 0,
          bottom: 0,
        },
        defaultFontSize: 14,
        localizedNormalMargin: {
          start: LengthMetricsCache.get("sys.float.chip_normal_text_margin", LengthMetrics.vp(6)),
          end: LengthMetricsCache.get("sys.float.chip_normal_text_margin", LengthMetrics.vp(6)),
          top: LengthMetrics.vp(0),
          bottom: LengthMetrics.vp(0),
        },
        localizedSmallMargin: {
          start: LengthMetricsCache.get("sys.float.chip_small_text_margin", LengthMetrics.vp(4)),
          end: LengthMetricsCache.get("sys.float.chip_small_text_margin", LengthMetrics.vp(4)),
          top: LengthMetrics.vp(0),
          bottom: LengthMetrics.vp(0),
        },
      },
      suffixIcon: {
        normalSize: {
          width: _r(16777216, 10003, "com.example.mock", "entry"),
          height: _r(16777216, 10003, "com.example.mock", "entry"),
        },
        smallSize: {
          width: _r(16777216, 10003, "com.example.mock", "entry"),
          height: _r(16777216, 10003, "com.example.mock", "entry"),
        },
        fillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusFillColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusActivatedColor: _r(16777216, 10003, "com.example.mock", "entry"),
        defaultDeleteIcon: _r(16777216, 10003, "com.example.mock", "entry"),
        focusable: false,
        isShowMargin: _r(16777216, 10003, "com.example.mock", "entry"),
      },
      defaultSymbol: {
        normalFontColor: [_r(16777216, 10003, "com.example.mock", "entry")],
        activatedFontColor: [_r(16777216, 10003, "com.example.mock", "entry")],
        normalSymbolFontSize: (LengthMetricsCache.get("sys.float.chip_normal_icon_size", LengthMetrics.vp(16)).value as Length),
        smallSymbolFontSize: (LengthMetricsCache.get("sys.float.chip_small_icon_size", LengthMetrics.vp(16)).value as Length),
        defaultEffect: -1,
      },
      chipNode: {
        suitAgeScale: 1.75,
        minLabelWidth: 12,
        normalHeight: _r(16777216, 10003, "com.example.mock", "entry"),
        smallHeight: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedNormalHeight: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedSmallHeight: _r(16777216, 10003, "com.example.mock", "entry"),
        enabled: true,
        activated: false,
        backgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedBackgroundColor: _r(16777216, 10003, "com.example.mock", "entry"),
        backgroundSystemMaterial: new uiMaterial.ImmersiveMaterial({
          style: uiMaterial.ImmersiveStyle.ULTRA_THIN,
        }),
        activatedBackgroundSystemMaterial: new uiMaterial.ImmersiveMaterial({
          style: uiMaterial.ImmersiveStyle.ULTRA_THIN,
          materialColor: _r(16777216, 10003, "com.example.mock", "entry"),
        }),
        focusOutlineColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusOutlineMargin: 2,
        borderColor: _r(16777216, 10003, "com.example.mock", "entry"),
        defaultBorderWidth: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedBorderColor: _r(16777216, 10003, "com.example.mock", "entry"),
        normalBorderRadius: _r(16777216, 10003, "com.example.mock", "entry"),
        smallBorderRadius: _r(16777216, 10003, "com.example.mock", "entry"),
        activatedBorderWidth: _r(16777216, 10003, "com.example.mock", "entry"),
        borderWidth: 2,
        focusBtnScaleX: _r(16777216, 10003, "com.example.mock", "entry"),
        focusBtnScaleY: _r(16777216, 10003, "com.example.mock", "entry"),
        localizedNormalPadding: {
          start: LengthMetricsCache.get("sys.float.chip_normal_text_padding", LengthMetrics.vp(16)),
          end: LengthMetricsCache.get("sys.float.chip_normal_text_padding", LengthMetrics.vp(16)),
          top: LengthMetrics.vp(4),
          bottom: LengthMetrics.vp(4),
        },
        localizedSmallPadding: {
          start: LengthMetricsCache.get("sys.float.chip_small_text_padding", LengthMetrics.vp(12)),
          end: LengthMetricsCache.get("sys.float.chip_small_text_padding", LengthMetrics.vp(12)),
          top: LengthMetrics.vp(4),
          bottom: LengthMetrics.vp(4),
        },
        localizedActivatedNormalPadding: {
          start: LengthMetricsCache.get("sys.float.chip_activated_normal_text_padding", LengthMetrics.vp(16)),
          end: LengthMetricsCache.get("sys.float.chip_activated_normal_text_padding", LengthMetrics.vp(16)),
          top: LengthMetrics.vp(4),
          bottom: LengthMetrics.vp(4),
        },
        localizedActivatedSmallPadding: {
          start: LengthMetricsCache.get("sys.float.chip_activated_small_text_padding", LengthMetrics.vp(12)),
          end: LengthMetricsCache.get("sys.float.chip_activated_small_text_padding", LengthMetrics.vp(12)),
          top: LengthMetrics.vp(4),
          bottom: LengthMetrics.vp(4),
        },
        hoverBlendColor: _r(16777216, 10003, "com.example.mock", "entry"),
        pressedBlendColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusBgColor: _r(16777216, 10003, "com.example.mock", "entry"),
        focusActivatedBgColor: _r(16777216, 10003, "com.example.mock", "entry"),
        opacity: {
          normal: 1,
          hover: 0.95,
          pressed: 0.9,
        },
        normalShadowStyle: _r(16777216, 10003, "com.example.mock", "entry"),
        smallShadowStyle: _r(16777216, 10003, "com.example.mock", "entry"),
        breakPointConstraintWidth: {
          breakPointMinWidth: 128,
          breakPointSmMaxWidth: 156,
          breakPointMdMaxWidth: 280,
          breakPointLgMaxWidth: 400,
        },
      },
    }));
    this.__backing_chipV2Options = STATE_MGMT_FACTORY.makeParam<ChipV2Options>(this, "chipV2Options", (initializers!.chipV2Options as ChipV2Options));
    this.__backing_onClose = (({let gensym___130158589 = initializers;
    (((gensym___130158589) == (null)) ? undefined : gensym___130158589.__options_has_onClose)}) ? (initializers!.onClose as (VoidCallback | undefined)) : undefined);
    this.__backing_onClicked = (({let gensym___18887803 = initializers;
    (((gensym___18887803) == (null)) ? undefined : gensym___18887803.__options_has_onClicked)}) ? (initializers!.onClicked as (Callback<void> | undefined)) : undefined);
    this.__backing_isChipExist = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "isChipExist", true);
    this.__backing_chipScale = STATE_MGMT_FACTORY.makeLocal<ScaleOptions>(this, "chipScale", {
      x: 1,
      y: 1,
    });
    this.__backing_chipOpacity = STATE_MGMT_FACTORY.makeLocal<number>(this, "chipOpacity", 1);
    this.__backing_chipNodeInFocus = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "chipNodeInFocus", false);
    this.__backing_breakPoint = STATE_MGMT_FACTORY.makeLocal<BreakPointsType>(this, "breakPoint", BreakPointsType.SM);
    this.__backing_fontSizeScale = STATE_MGMT_FACTORY.makeLocal<number>(this, "fontSizeScale", 1);
    this.__backing_useAdaptiveLineHeight = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "useAdaptiveLineHeight", false);
    this.__backing_smListener = ((({let gensym___39584539 = initializers;
    (((gensym___39584539) == (null)) ? undefined : gensym___39584539.smListener)})) ?? (this.getUIContext().getMediaQuery().matchMediaSync("(0vp<width) and (width<600vp)")));
    this.__backing_mdListener = ((({let gensym___127312911 = initializers;
    (((gensym___127312911) == (null)) ? undefined : gensym___127312911.mdListener)})) ?? (this.getUIContext().getMediaQuery().matchMediaSync("(600vp<=width) and (width<840vp)")));
    this.__backing_lgListener = ((({let gensym___144153735 = initializers;
    (((gensym___144153735) == (null)) ? undefined : gensym___144153735.lgListener)})) ?? (this.getUIContext().getMediaQuery().matchMediaSync("(840vp<=width)")));
    this.__backing_symbolEffect = ((({let gensym___113161387 = initializers;
    (((gensym___113161387) == (null)) ? undefined : gensym___113161387.symbolEffect)})) ?? (new SymbolEffect()));
    this.__backing_environmentCallbackID = ((({let gensym___89695923 = initializers;
    (((gensym___89695923) == (null)) ? undefined : gensym___89695923.environmentCallbackID)})) ?? (undefined));
    this.__backing_environmentCallback = ((({let gensym___49550792 = initializers;
    (((gensym___49550792) == (null)) ? undefined : gensym___49550792.environmentCallback)})) ?? (new ChipV2EnvironmentCallbackEntry(this)));
    this.__backing_isSuffixIconFocusStyleCustomized = ((({let gensym___75292983 = initializers;
    (((gensym___75292983) == (null)) ? undefined : gensym___75292983.isSuffixIconFocusStyleCustomized)})) ?? (((this.resourceToNumber(this.theme.suffixIcon.isShowMargin, 0)) !== (0))));
    this.__backing_isSuffixIconFocusable = ((({let gensym___135021234 = initializers;
    (((gensym___135021234) == (null)) ? undefined : gensym___135021234.isSuffixIconFocusable)})) ?? (((this.resourceToNumber(this.theme.suffixIcon.isShowMargin, 0)) !== (1))));
  }
  
  public __updateStruct(initializers: (__Options_ChipV2 | undefined)): void {
    if (({let gensym___177030522 = initializers;
    (((gensym___177030522) == (null)) ? undefined : gensym___177030522.__options_has_chipV2Options)})) {
      this.__backing_chipV2Options!.update((initializers!.chipV2Options as ChipV2Options));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ChipV2 | undefined)): void {
    this.__backing_chipV2Options!.resetOnReuse((initializers!.chipV2Options as ChipV2Options));
    this.onClose = (initializers!.onClose as (VoidCallback | undefined));
    this.onClicked = (initializers!.onClicked as (Callback<void> | undefined));
    this.__backing_isChipExist!.resetOnReuse(true);
    this.__backing_chipScale!.resetOnReuse({
      x: 1,
      y: 1,
    });
    this.__backing_chipOpacity!.resetOnReuse(1);
    this.__backing_chipNodeInFocus!.resetOnReuse(false);
    this.__backing_breakPoint!.resetOnReuse(BreakPointsType.SM);
    this.__backing_fontSizeScale!.resetOnReuse(1);
    this.__backing_useAdaptiveLineHeight!.resetOnReuse(false);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ChipV2)=> void) | undefined), initializers: ((()=> __Options_ChipV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ChipV2, __Options_ChipV2>(style, ((): ChipV2 => {
      return new ChipV2();
    }), initializers, reuseId, content, {
      sClass: Class.from<ChipV2>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ChipV2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ChipV2 {
    throw new Error("Declare interface");
  }
  
  private __backing_theme?: ChipTheme;
  public get theme(): ChipTheme {
    return (this.__backing_theme as ChipTheme);
  }
  
  public set theme(value: ChipTheme) {
    this.__backing_theme = value;
  }
  
  private __backing_chipV2Options?: IParamDecoratedVariable<ChipV2Options>;
  public get chipV2Options(): ChipV2Options {
    return this.__backing_chipV2Options!.get();
  }
  
  private __backing_onClose?: (VoidCallback | undefined);
  public get onClose(): (VoidCallback | undefined) {
    return (this.__backing_onClose as (VoidCallback | undefined));
  }
  
  public set onClose(value: (VoidCallback | undefined)) {
    this.__backing_onClose = value;
  }
  
  private __backing_onClicked?: (Callback<void> | undefined);
  public get onClicked(): (Callback<void> | undefined) {
    return (this.__backing_onClicked as (Callback<void> | undefined));
  }
  
  public set onClicked(value: (Callback<void> | undefined)) {
    this.__backing_onClicked = value;
  }
  
  private __backing_isChipExist?: ILocalDecoratedVariable<boolean>;
  public get isChipExist(): boolean {
    return this.__backing_isChipExist!.get();
  }
  
  public set isChipExist(value: boolean) {
    this.__backing_isChipExist!.set(value);
  }
  
  private __backing_chipScale?: ILocalDecoratedVariable<ScaleOptions>;
  public get chipScale(): ScaleOptions {
    return this.__backing_chipScale!.get();
  }
  
  public set chipScale(value: ScaleOptions) {
    this.__backing_chipScale!.set(value);
  }
  
  private __backing_chipOpacity?: ILocalDecoratedVariable<number>;
  public get chipOpacity(): number {
    return this.__backing_chipOpacity!.get();
  }
  
  public set chipOpacity(value: number) {
    this.__backing_chipOpacity!.set(value);
  }
  
  private __backing_chipNodeInFocus?: ILocalDecoratedVariable<boolean>;
  public get chipNodeInFocus(): boolean {
    return this.__backing_chipNodeInFocus!.get();
  }
  
  public set chipNodeInFocus(value: boolean) {
    this.__backing_chipNodeInFocus!.set(value);
  }
  
  private __backing_breakPoint?: ILocalDecoratedVariable<BreakPointsType>;
  public get breakPoint(): BreakPointsType {
    return this.__backing_breakPoint!.get();
  }
  
  public set breakPoint(value: BreakPointsType) {
    this.__backing_breakPoint!.set(value);
  }
  
  private __backing_fontSizeScale?: ILocalDecoratedVariable<number>;
  public get fontSizeScale(): number {
    return this.__backing_fontSizeScale!.get();
  }
  
  public set fontSizeScale(value: number) {
    this.__backing_fontSizeScale!.set(value);
  }
  
  private __backing_useAdaptiveLineHeight?: ILocalDecoratedVariable<boolean>;
  public get useAdaptiveLineHeight(): boolean {
    return this.__backing_useAdaptiveLineHeight!.get();
  }
  
  public set useAdaptiveLineHeight(value: boolean) {
    this.__backing_useAdaptiveLineHeight!.set(value);
  }
  
  private __backing_smListener?: mediaquery.MediaQueryListener;
  public get smListener(): mediaquery.MediaQueryListener {
    return (this.__backing_smListener as mediaquery.MediaQueryListener);
  }
  
  public set smListener(value: mediaquery.MediaQueryListener) {
    this.__backing_smListener = value;
  }
  
  private __backing_mdListener?: mediaquery.MediaQueryListener;
  public get mdListener(): mediaquery.MediaQueryListener {
    return (this.__backing_mdListener as mediaquery.MediaQueryListener);
  }
  
  public set mdListener(value: mediaquery.MediaQueryListener) {
    this.__backing_mdListener = value;
  }
  
  private __backing_lgListener?: mediaquery.MediaQueryListener;
  public get lgListener(): mediaquery.MediaQueryListener {
    return (this.__backing_lgListener as mediaquery.MediaQueryListener);
  }
  
  public set lgListener(value: mediaquery.MediaQueryListener) {
    this.__backing_lgListener = value;
  }
  
  private __backing_symbolEffect?: SymbolEffect;
  public get symbolEffect(): SymbolEffect {
    return (this.__backing_symbolEffect as SymbolEffect);
  }
  
  public set symbolEffect(value: SymbolEffect) {
    this.__backing_symbolEffect = value;
  }
  
  private __backing_environmentCallbackID?: (int | undefined);
  public get environmentCallbackID(): (int | undefined) {
    return (this.__backing_environmentCallbackID as (int | undefined));
  }
  
  public set environmentCallbackID(value: (int | undefined)) {
    this.__backing_environmentCallbackID = value;
  }
  
  private __backing_environmentCallback?: ChipV2EnvironmentCallbackEntry;
  public get environmentCallback(): ChipV2EnvironmentCallbackEntry {
    return (this.__backing_environmentCallback as ChipV2EnvironmentCallbackEntry);
  }
  
  public set environmentCallback(value: ChipV2EnvironmentCallbackEntry) {
    this.__backing_environmentCallback = value;
  }
  
  private __backing_isSuffixIconFocusStyleCustomized?: boolean;
  public get isSuffixIconFocusStyleCustomized(): boolean {
    return (this.__backing_isSuffixIconFocusStyleCustomized as boolean);
  }
  
  public set isSuffixIconFocusStyleCustomized(value: boolean) {
    this.__backing_isSuffixIconFocusStyleCustomized = value;
  }
  
  private __backing_isSuffixIconFocusable?: boolean;
  public get isSuffixIconFocusable(): boolean {
    return (this.__backing_isSuffixIconFocusable as boolean);
  }
  
  public set isSuffixIconFocusable(value: boolean) {
    this.__backing_isSuffixIconFocusable = value;
  }
  
  public updateLanguageLineHeight(): void {
    if (((deviceInfo.sdkApiVersion) < (26))) {
      return;
    }
    const resourceManager = ({let gensym%%_1 = this.getUIContext().getHostContext();
    (((gensym%%_1) == (null)) ? undefined : gensym%%_1.resourceManager)});
    if (!resourceManager) {
      console.error("[ChipV2] failed to get resourceManager");
      return;
    }
    try {
      this.useAdaptiveLineHeight = ((resourceManager!.getStringByNameSync("text_fallback_line_spacing")) === ("true"));
    } catch (e) {
      console.error("[ChipV2] failed to get text_fallback_line_spacing resource");
    }
  }
  
  public aboutToAppear(): void {
    ({let gensym%%_2 = this.smListener;
    (((gensym%%_2) == (null)) ? undefined : gensym%%_2.onChange(((result) => {
      if (result.matches) {
        this.breakPoint = BreakPointsType.SM;
      }
    })))});
    ({let gensym%%_3 = this.mdListener;
    (((gensym%%_3) == (null)) ? undefined : gensym%%_3.onChange(((result) => {
      if (result.matches) {
        this.breakPoint = BreakPointsType.MD;
      }
    })))});
    ({let gensym%%_4 = this.lgListener;
    (((gensym%%_4) == (null)) ? undefined : gensym%%_4.onChange(((result) => {
      if (result.matches) {
        this.breakPoint = BreakPointsType.LG;
      }
    })))});
    this.updateLanguageLineHeight();
    let abilityContext = this.getUIContext().getHostContext();
    if (abilityContext) {
      this.environmentCallbackID = abilityContext.getApplicationContext().onEnvironment(this.environmentCallback);
    }
    this.onClose = this.chipV2Options.onClose;
    this.onClicked = this.chipV2Options.onClicked;
  }
  
  public aboutToDisappear(): void {
    ({let gensym%%_5 = this.smListener;
    (((gensym%%_5) == (null)) ? undefined : gensym%%_5.offChange())});
    ({let gensym%%_6 = this.mdListener;
    (((gensym%%_6) == (null)) ? undefined : gensym%%_6.offChange())});
    ({let gensym%%_7 = this.lgListener;
    (((gensym%%_7) == (null)) ? undefined : gensym%%_7.offChange())});
    if (((this.environmentCallbackID) !== (undefined))) {
      ({let gensym%%_9 = ({let gensym%%_8 = this.getUIContext();
      (((gensym%%_8) == (null)) ? undefined : gensym%%_8.getHostContext())});
      (((gensym%%_9) == (null)) ? undefined : gensym%%_9.getApplicationContext().offEnvironment((this.environmentCallbackID as int)))});
      this.environmentCallbackID = undefined;
    }
  }
  
  private isSetActiveChipBgColor(): boolean {
    if (!(this.chipV2Options.activatedBackgroundColor)) {
      return false;
    }
    try {
      return (((this.chipV2Options.activatedBackgroundColor as ColorMetrics).color) !== (ColorMetrics.resourceColor(this.theme.chipNode.activatedBackgroundColor).color));
    } catch (error) {
      console.error("[ChipV2] failed to get ColorMetrics.resourceColor");
      return false;
    }
  }
  
  private isSetNormalChipBgColor(): boolean {
    if (!(this.chipV2Options.backgroundColor)) {
      return false;
    }
    try {
      return (((this.chipV2Options.backgroundColor as ColorMetrics).color) !== (ColorMetrics.resourceColor(this.theme.chipNode.backgroundColor).color));
    } catch (error) {
      console.error("[ChipV2] failed to get resourceColor");
      return false;
    }
  }
  
  private getShadowStyles(): (ShadowStyle | undefined) {
    if (!(this.chipNodeInFocus)) {
      return undefined;
    }
    switch (Double.toInt(this.resourceToNumber((this.isSmallChipSize() ? this.theme.chipNode.smallShadowStyle : this.theme.chipNode.normalShadowStyle), -1))) {
      case -1: {
        return undefined;
      }
      case 0: {
        return ShadowStyle.OUTER_DEFAULT_XS;
      }
      case 1: {
        return ShadowStyle.OUTER_DEFAULT_SM;
      }
      case 2: {
        return ShadowStyle.OUTER_DEFAULT_MD;
      }
      case 3: {
        return ShadowStyle.OUTER_DEFAULT_LG;
      }
      case 4: {
        return ShadowStyle.OUTER_FLOATING_SM;
      }
      case 5: {
        return ShadowStyle.OUTER_FLOATING_MD;
      }
      default: {
        return undefined;
      }
    }
  }
  
  @Memo() 
  public ChipBuilder() {
    ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
      instance.setButtonOptions({
        type: ButtonType.Normal,
      }).clip(false).shadow(this.getShadowStyles()).padding(0).focusable(true).size(this.getChipSize()).enabled(this.isChipEnabled()).direction(this.chipV2Options.direction).systemMaterial(this.getBackgroundSystemMaterial()).backgroundColor(this.getChipBackgroundColor()).borderWidth(this.getChipNodeBorderWidth()).borderColor(this.getChipNodeBorderColor()).borderRadius(this.getChipBorderRadius()).responseRegion(this.getChipResponseRegion()).scale(this.chipScale).opacity(this.chipOpacity).accessibilityGroup(true).accessibilityDescription(this.getAccessibilityDescription()).accessibilityLevel(this.chipV2Options.accessibilityLevel).accessibilityChecked(this.getAccessibilityChecked()).accessibilitySelected(this.getAccessibilitySelected()).onClick(this.getChipOnClicked()).onKeyEvent(((event: KeyEvent) => {
        if (((((!event) || (((event.type) === (null))))) || (((event.type) !== (KeyType.Down))))) {
          return false;
        }
        let isDeleteChip = ((event.keyCode) === (KeyCode.KEYCODE_FORWARD_DEL));
        let isEnterDeleteChip = ((((((((event.keyCode) === (KeyCode.KEYCODE_ENTER))) && (((this.chipV2Options.allowClose) !== (false))))) && (!(this.hasSuffixImageIcon())))) && (this.isSuffixIconFocusStyleCustomized));
        if (((isDeleteChip) || (isEnterDeleteChip))) {
          this.deleteChip();
        }
      })).onFocus((() => {
        if (this.isSuffixIconFocusStyleCustomized) {
          this.chipNodeInFocus = true;
        }
        this.chipZoomIn();
      })).onBlur((() => {
        if (this.isSuffixIconFocusStyleCustomized) {
          this.chipNodeInFocus = false;
        }
        this.chipZoomOut();
      })).onHover((!(this.isSuffixIconFocusStyleCustomized) ? undefined : ((isHover: boolean) => {
        (isHover ? this.chipZoomIn() : this.chipZoomOut());
      })));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      FlexImpl(@Memo() ((instance: FlexAttribute): void => {
        instance.setFlexOptions({
          justifyContent: FlexAlign.Center,
          alignItems: ItemAlign.Center,
        }).direction(this.chipV2Options.direction).padding(this.getChipPadding()).size(this.getChipSize()).constraintSize(this.getChipConstraintSize());
        instance.applyAttributesFinish();
        return;
      }), @Memo() (() => {
        if (this.hasPrefixSymbolIcon()) {
          SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
            instance.setSymbolGlyphOptions(undefined).fontSize(this.getFontSizeForSymbol()).maxFontScale(this.chipV2Options.maxFontScale).minFontScale(this.chipV2Options.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.PREFIX_SYMBOL)).flexShrink(0).attributeModifier(this.getPrefixSymbolModifier()).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, this.theme.defaultSymbol.defaultEffect);
            instance.applyAttributesFinish();
            return;
          }));
        } else {
          if (this.hasPrefixImageIcon()) {
            ImageImpl(@Memo() ((instance: ImageAttribute): void => {
              instance.setImageOptions(this.getPrefixImageIcon()!.src, undefined).direction(this.chipV2Options.direction).size(this.getPrefixIconSize()).fillColor(this.getPrefixIconFilledColor()).objectFit(ImageFit.Cover).focusable(false).flexShrink(0).draggable(false).attributeModifier(this.getPrefixImageIcon()!.modifier);
              instance.applyAttributesFinish();
              return;
            }));
          }
        }
        TextImpl(@Memo() ((instance: TextAttribute): void => {
          instance.setTextOptions(this.chipV2Options.label.text, undefined).draggable(false).flexShrink(1).focusable(true).maxLines(1).textOverflow({
            overflow: TextOverflow.Ellipsis,
          }).textAlign(TextAlign.Center).direction(this.chipV2Options.direction).fontSize(this.getLabelFontSize()).fontColor(this.getLabelFontColor()).fontFamily(this.getLabelFontFamily()).fontWeight(this.getLabelFontWeight()).maxFontScale(this.chipV2Options.maxFontScale).minFontScale(this.chipV2Options.minFontScale).margin(this.getLabelMargin()).includeFontPadding(this.useAdaptiveLineHeight).fallbackLineSpacing(this.useAdaptiveLineHeight).attributeModifier(this.chipV2Options.label.modifier);
          instance.applyAttributesFinish();
          return;
        }), undefined);
        if (this.hasSuffixSymbolIcon()) {
          ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
            instance.setButtonOptions({
              type: ButtonType.Normal,
            }).onClick(this.getSuffixSymbolAction()).accessibilityText(this.getSuffixSymbolAccessibilityText()).accessibilityDescription(this.getSuffixSymbolAccessibilityDescription()).accessibilityLevel(this.getSuffixSymbolAccessibilityLevel()).flexShrink(0).backgroundColor(Color.Transparent).borderRadius(0).padding(0).stateEffect(false).hoverEffect(HoverEffect.None).focusable(this.isSuffixIconFocusable);
            instance.applyAttributesFinish();
            return;
          }), @Memo() (() => {
            SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
              instance.setSymbolGlyphOptions(undefined).fontSize(this.getFontSizeForSymbol()).maxFontScale(this.chipV2Options.maxFontScale).minFontScale(this.chipV2Options.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.SUFFIX_SYMBOL)).attributeModifier(this.getSuffixSymbolModifier()).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, this.theme.defaultSymbol.defaultEffect);
              instance.applyAttributesFinish();
              return;
            }));
          }));
        } else {
          if (this.hasSuffixImageIcon()) {
            ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
              instance.setButtonOptions({
                type: ButtonType.Normal,
              }).backgroundColor(Color.Transparent).borderRadius(0).padding(0).flexShrink(0).stateEffect(false).hoverEffect(HoverEffect.None).size(this.getSuffixIconSize()).accessibilityText(this.getSuffixImageIconAccessibilityText()).accessibilityDescription(this.getSuffixImageIconAccessibilityDescription()).accessibilityLevel(this.getSuffixImageIconAccessibilityLevel()).onClick(this.getSuffixIconAction()).focusable(this.isSuffixIconFocusable);
              instance.applyAttributesFinish();
              return;
            }), @Memo() (() => {
              ImageImpl(@Memo() ((instance: ImageAttribute): void => {
                instance.setImageOptions(this.getSuffixImageIcon()!.src, undefined).direction(this.chipV2Options.direction).size(this.getSuffixIconSize()).fillColor(this.getSuffixIconFilledColor()).objectFit(ImageFit.Cover).draggable(false).attributeModifier(this.getSuffixImageIcon()!.modifier);
                instance.applyAttributesFinish();
                return;
              }));
            }));
          } else {
            if (this.isClosable()) {
              ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
                instance.setButtonOptions({
                  type: ButtonType.Normal,
                }).backgroundColor(Color.Transparent).borderRadius(0).padding(0).flexShrink(0).stateEffect(false).hoverEffect(HoverEffect.None).accessibilityText(this.getCloseIconAccessibilityText()).accessibilityDescription(this.getCloseIconAccessibilityDescription()).accessibilityLevel(this.getCloseIconAccessibilityLevel()).responseRegion({
                  x: _r(16777216, 10003, "com.example.mock", "entry"),
                  y: _r(16777216, 10003, "com.example.mock", "entry"),
                  width: "100%",
                  height: "100%",
                }).onClick((() => {
                  if (!(this.isChipEnabled())) {
                    return;
                  }
                  ({let gensym%%_10 = this.onClose;
                  (((gensym%%_10) == (null)) ? undefined : gensym%%_10())});
                  this.deleteChip();
                })).focusable(this.isSuffixIconFocusable);
                instance.applyAttributesFinish();
                return;
              }), @Memo() (() => {
                SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
                  instance.setSymbolGlyphOptions(_r(16777216, 10003, "com.example.mock", "entry")).fontSize(this.getCloseOptionsFontsize()).maxFontScale(this.chipV2Options.maxFontScale).minFontScale(this.chipV2Options.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.SUFFIX_SYMBOL));
                  instance.applyAttributesFinish();
                  return;
                }));
              }));
            }
          }
        }
      }));
    }));
  }
  
  private hasPrefixImageIcon(): boolean {
    return ((this.chipV2Options.prefixIcon) instanceof (ChipV2PrefixImageIcon));
  }
  
  private hasPrefixSymbolIcon(): boolean {
    return ((((this.chipV2Options.prefixIcon) instanceof (ChipV2PrefixSymbolIcon))) && (!(!((((this.chipV2Options.prefixIcon as ChipV2PrefixSymbolIcon).normal) || ((this.chipV2Options.prefixIcon as ChipV2PrefixSymbolIcon).activated))))));
  }
  
  private hasSuffixImageIcon(): boolean {
    return ((this.chipV2Options.suffixIcon) instanceof (ChipV2SuffixImageIcon));
  }
  
  private hasSuffixSymbolIcon(): boolean {
    return ((((this.chipV2Options.suffixIcon) instanceof (ChipV2SuffixSymbolIcon))) && (!(!((((this.chipV2Options.suffixIcon as ChipV2SuffixSymbolIcon).normal) || ((this.chipV2Options.suffixIcon as ChipV2SuffixSymbolIcon).activated))))));
  }
  
  private getPrefixImageIcon(): (ChipV2PrefixImageIcon | undefined) {
    return (this.hasPrefixImageIcon() ? (this.chipV2Options.prefixIcon as ChipV2PrefixImageIcon) : undefined);
  }
  
  private getSuffixImageIcon(): (ChipV2SuffixImageIcon | undefined) {
    return (this.hasSuffixImageIcon() ? (this.chipV2Options.suffixIcon as ChipV2SuffixImageIcon) : undefined);
  }
  
  private getSuffixSymbolIcon(): (ChipV2SuffixSymbolIcon | undefined) {
    return (this.hasSuffixSymbolIcon() ? (this.chipV2Options.suffixIcon as ChipV2SuffixSymbolIcon) : undefined);
  }
  
  private getCloseIconAccessibilityLevel(): string {
    const level = ({let gensym%%_11 = this.chipV2Options.closeIcon;
    (((gensym%%_11) == (null)) ? undefined : gensym%%_11.accessibilityLevel)});
    if (((((level) === ("no"))) || (((level) === ("no-hide-descendants"))))) {
      return level!;
    }
    return "yes";
  }
  
  private getCloseIconAccessibilityDescription(): (ResourceStr | undefined) {
    if ((((typeof ({let gensym%%_12 = this.chipV2Options.closeIcon;
    (((gensym%%_12) == (null)) ? undefined : gensym%%_12.accessibilityDescription)}))) === ("undefined"))) {
      return undefined;
    }
    return (({let gensym%%_13 = this.chipV2Options.closeIcon;
    (((gensym%%_13) == (null)) ? undefined : gensym%%_13.accessibilityDescription)}) as ResourceStr);
  }
  
  private getCloseIconAccessibilityText(): ResourceStr {
    if ((((typeof ({let gensym%%_14 = this.chipV2Options.closeIcon;
    (((gensym%%_14) == (null)) ? undefined : gensym%%_14.accessibilityText)}))) === ("undefined"))) {
      return _r(16777216, 10003, "com.example.mock", "entry");
    }
    return (({let gensym%%_15 = this.chipV2Options.closeIcon;
    (((gensym%%_15) == (null)) ? undefined : gensym%%_15.accessibilityText)}) as ResourceStr);
  }
  
  public getSuffixIconAction(): (Callback<ClickEvent> | undefined) {
    if (this.hasSuffixImageIcon()) {
      const suffixImgIcon = this.getSuffixImageIcon()!;
      if (!(suffixImgIcon.action)) {
        return undefined;
      }
      return (() => {
        if (this.isChipEnabled()) {
          ({let gensym%%_16 = suffixImgIcon.action;
          (((gensym%%_16) == (null)) ? undefined : gensym%%_16())});
        }
      });
    }
    return undefined;
  }
  
  public getSuffixIconFilledColor(): (ResourceColor | ColorMetrics) {
    if (this.isChipActivated()) {
      return ((({let gensym%%_17 = this.getSuffixImageIcon();
      (((gensym%%_17) == (null)) ? undefined : gensym%%_17.activatedFillColor)})) ?? (this.getDefaultActiveIconColor(IconType.PREFIX_ICON)));
    }
    return ((({let gensym%%_18 = this.getSuffixImageIcon();
    (((gensym%%_18) == (null)) ? undefined : gensym%%_18.fillColor)})) ?? (this.getDefaultFillIconColor(IconType.SUFFIX_ICON)));
  }
  
  public getSuffixIconSize(): SizeOptions {
    let suffixIconSize: SizeOptions = {
      width: 0,
      height: 0,
    };
    let width: (LengthMetrics | undefined) = ({let gensym%%_20 = ({let gensym%%_19 = this.getSuffixImageIcon();
    (((gensym%%_19) == (null)) ? undefined : gensym%%_19.size)});
    (((gensym%%_20) == (null)) ? undefined : gensym%%_20.width)});
    if ((((((typeof width)) !== ("undefined"))) && (this.isValidLength(width)))) {
      suffixIconSize.width = lengthMetricsToLength(width!);
    } else {
      suffixIconSize.width = (this.isSmallChipSize() ? this.theme.suffixIcon.smallSize.width : this.theme.suffixIcon.normalSize.width);
    }
    let height: (LengthMetrics | undefined) = ({let gensym%%_22 = ({let gensym%%_21 = this.getSuffixImageIcon();
    (((gensym%%_21) == (null)) ? undefined : gensym%%_21.size)});
    (((gensym%%_22) == (null)) ? undefined : gensym%%_22.height)});
    if ((((((typeof height)) !== ("undefined"))) && (this.isValidLength(height)))) {
      suffixIconSize.height = lengthMetricsToLength(height!);
    } else {
      suffixIconSize.height = (this.isSmallChipSize() ? this.theme.suffixIcon.smallSize.height : this.theme.suffixIcon.normalSize.height);
    }
    return suffixIconSize;
  }
  
  public getSuffixImageIconAccessibilityLevel(): string {
    const suffixIcon = this.getSuffixImageIcon();
    if (((((({let gensym%%_23 = suffixIcon;
    (((gensym%%_23) == (null)) ? undefined : gensym%%_23.accessibilityLevel)})) === ("no"))) || (((({let gensym%%_24 = suffixIcon;
    (((gensym%%_24) == (null)) ? undefined : gensym%%_24.accessibilityLevel)})) === ("no-hide-descendants"))))) {
      return suffixIcon!.accessibilityLevel!;
    }
    return (({let gensym%%_25 = suffixIcon;
    (((gensym%%_25) == (null)) ? undefined : gensym%%_25.action)}) ? "yes" : "no");
  }
  
  public getSuffixImageIconAccessibilityDescription(): (ResourceStr | undefined) {
    const suffixIcon = this.getSuffixImageIcon();
    if ((((typeof ({let gensym%%_26 = suffixIcon;
    (((gensym%%_26) == (null)) ? undefined : gensym%%_26.accessibilityDescription)}))) === ("undefined"))) {
      return undefined;
    }
    return (suffixIcon!.accessibilityDescription as ResourceStr);
  }
  
  public getSuffixImageIconAccessibilityText(): (ResourceStr | undefined) {
    const suffixIcon = this.getSuffixImageIcon();
    if ((((typeof ({let gensym%%_27 = suffixIcon;
    (((gensym%%_27) == (null)) ? undefined : gensym%%_27.accessibilityText)}))) === ("undefined"))) {
      return undefined;
    }
    return (suffixIcon!.accessibilityText as ResourceStr);
  }
  
  public isClosable(): boolean {
    return ((this.chipV2Options.allowClose) ?? (true));
  }
  
  public getSuffixSymbolModifier(): (SymbolGlyphModifier | undefined) {
    if (this.isChipActivated()) {
      return ({let gensym%%_28 = this.getSuffixSymbolIcon();
      (((gensym%%_28) == (null)) ? undefined : gensym%%_28.activated)});
    }
    return ({let gensym%%_29 = this.getSuffixSymbolIcon();
    (((gensym%%_29) == (null)) ? undefined : gensym%%_29.normal)});
  }
  
  public getSuffixSymbolAccessibilityLevel(): string {
    if (this.isChipActivated()) {
      if (((((({let gensym%%_31 = ({let gensym%%_30 = this.getSuffixSymbolIcon();
      (((gensym%%_30) == (null)) ? undefined : gensym%%_30.activatedAccessibility)});
      (((gensym%%_31) == (null)) ? undefined : gensym%%_31.accessibilityLevel)})) === ("no"))) || (((({let gensym%%_33 = ({let gensym%%_32 = this.getSuffixSymbolIcon();
      (((gensym%%_32) == (null)) ? undefined : gensym%%_32.activatedAccessibility)});
      (((gensym%%_33) == (null)) ? undefined : gensym%%_33.accessibilityLevel)})) === ("no-hide-descendants"))))) {
        return this.getSuffixSymbolIcon()!.activatedAccessibility!.accessibilityLevel!;
      }
      return (({let gensym%%_34 = this.getSuffixSymbolIcon();
      (((gensym%%_34) == (null)) ? undefined : gensym%%_34.action)}) ? "yes" : "no");
    }
    if (((((({let gensym%%_36 = ({let gensym%%_35 = this.getSuffixSymbolIcon();
    (((gensym%%_35) == (null)) ? undefined : gensym%%_35.normalAccessibility)});
    (((gensym%%_36) == (null)) ? undefined : gensym%%_36.accessibilityLevel)})) === ("no"))) || (((({let gensym%%_38 = ({let gensym%%_37 = this.getSuffixSymbolIcon();
    (((gensym%%_37) == (null)) ? undefined : gensym%%_37.normalAccessibility)});
    (((gensym%%_38) == (null)) ? undefined : gensym%%_38.accessibilityLevel)})) === ("no-hide-descendants"))))) {
      return this.getSuffixSymbolIcon()!.normalAccessibility!.accessibilityLevel!;
    }
    return (({let gensym%%_39 = this.getSuffixSymbolIcon();
    (((gensym%%_39) == (null)) ? undefined : gensym%%_39.action)}) ? "yes" : "no");
  }
  
  public getSuffixSymbolAccessibilityDescription(): (ResourceStr | undefined) {
    if (this.isChipActivated()) {
      if ((((typeof ({let gensym%%_41 = ({let gensym%%_40 = this.getSuffixSymbolIcon();
      (((gensym%%_40) == (null)) ? undefined : gensym%%_40.activatedAccessibility)});
      (((gensym%%_41) == (null)) ? undefined : gensym%%_41.accessibilityDescription)}))) !== ("undefined"))) {
        return (this.getSuffixSymbolIcon()!.activatedAccessibility!.accessibilityDescription as ResourceStr);
      }
      return undefined;
    }
    if ((((typeof ({let gensym%%_43 = ({let gensym%%_42 = this.getSuffixSymbolIcon();
    (((gensym%%_42) == (null)) ? undefined : gensym%%_42.normalAccessibility)});
    (((gensym%%_43) == (null)) ? undefined : gensym%%_43.accessibilityDescription)}))) !== ("undefined"))) {
      return (this.getSuffixSymbolIcon()!.normalAccessibility!.accessibilityDescription as ResourceStr);
    }
    return undefined;
  }
  
  public getSuffixSymbolAccessibilityText(): (ResourceStr | undefined) {
    if (this.isChipActivated()) {
      if ((((typeof ({let gensym%%_45 = ({let gensym%%_44 = this.getSuffixSymbolIcon();
      (((gensym%%_44) == (null)) ? undefined : gensym%%_44.activatedAccessibility)});
      (((gensym%%_45) == (null)) ? undefined : gensym%%_45.accessibilityText)}))) !== ("undefined"))) {
        return (this.getSuffixSymbolIcon()!.activatedAccessibility!.accessibilityText as ResourceStr);
      }
      return undefined;
    }
    if ((((typeof ({let gensym%%_47 = ({let gensym%%_46 = this.getSuffixSymbolIcon();
    (((gensym%%_46) == (null)) ? undefined : gensym%%_46.normalAccessibility)});
    (((gensym%%_47) == (null)) ? undefined : gensym%%_47.accessibilityText)}))) !== ("undefined"))) {
      return (this.getSuffixSymbolIcon()!.normalAccessibility!.accessibilityText as ResourceStr);
    }
    return undefined;
  }
  
  public getSuffixSymbolAction(): (Callback<ClickEvent> | undefined) {
    if ((((typeof ({let gensym%%_48 = this.getSuffixSymbolIcon();
    (((gensym%%_48) == (null)) ? undefined : gensym%%_48.action)}))) === ("undefined"))) {
      return undefined;
    }
    return (() => {
      if (!(this.isChipEnabled())) {
        return;
      }
      ({let gensym%%_50 = ({let gensym%%_49 = this.getSuffixSymbolIcon();
      (((gensym%%_49) == (null)) ? undefined : gensym%%_49.action)});
      (((gensym%%_50) == (null)) ? undefined : gensym%%_50())});
    });
  }
  
  public getPrefixIconFilledColor(): (ResourceColor | ColorMetrics) {
    if (this.isChipActivated()) {
      return ((({let gensym%%_51 = this.getPrefixImageIcon();
      (((gensym%%_51) == (null)) ? undefined : gensym%%_51.activatedFillColor)})) ?? (this.getDefaultActiveIconColor(IconType.PREFIX_ICON)));
    }
    return ((({let gensym%%_52 = this.getPrefixImageIcon();
    (((gensym%%_52) == (null)) ? undefined : gensym%%_52.fillColor)})) ?? (this.getDefaultFillIconColor(IconType.PREFIX_ICON)));
  }
  
  public getPrefixIconSize(): SizeOptions {
    let prefixIconSize: SizeOptions = {
      width: 0,
      height: 0,
    };
    let width: (LengthMetrics | undefined) = ({let gensym%%_54 = ({let gensym%%_53 = this.getPrefixImageIcon();
    (((gensym%%_53) == (null)) ? undefined : gensym%%_53.size)});
    (((gensym%%_54) == (null)) ? undefined : gensym%%_54.width)});
    if ((((((typeof width)) !== ("undefined"))) && (this.isValidLength(width)))) {
      prefixIconSize.width = lengthMetricsToLength(width!);
    } else {
      prefixIconSize.width = (this.isSmallChipSize() ? this.theme.prefixIcon.smallSize.width : this.theme.prefixIcon.normalSize.width);
    }
    let height: (LengthMetrics | undefined) = ({let gensym%%_56 = ({let gensym%%_55 = this.getPrefixImageIcon();
    (((gensym%%_55) == (null)) ? undefined : gensym%%_55.size)});
    (((gensym%%_56) == (null)) ? undefined : gensym%%_56.height)});
    if ((((((typeof height)) !== ("undefined"))) && (this.isValidLength(height)))) {
      prefixIconSize.height = lengthMetricsToLength(height!);
    } else {
      prefixIconSize.height = (this.isSmallChipSize() ? this.theme.prefixIcon.smallSize.height : this.theme.prefixIcon.normalSize.height);
    }
    return prefixIconSize;
  }
  
  public getPrefixSymbolModifier(): (SymbolGlyphModifier | undefined) {
    if (!(((this.chipV2Options.prefixIcon) instanceof (ChipV2PrefixSymbolIcon)))) {
      return undefined;
    }
    const prefixSymbol = (this.chipV2Options.prefixIcon as ChipV2PrefixSymbolIcon);
    if (this.isChipActivated()) {
      return prefixSymbol.activated;
    }
    return prefixSymbol.normal;
  }
  
  public getDefaultSymbolColor(iconType: IconType): Array<ResourceColor> {
    return (this.isChipActivated() ? this.getSymbolActiveColor(iconType) : this.getSymbolFillColor(iconType));
  }
  
  private getDefaultActiveIconColor(iconType: IconType): ResourceColor {
    if (((iconType) === (IconType.PREFIX_ICON))) {
      return (this.chipNodeInFocus ? this.theme.prefixIcon.focusActivatedColor : this.theme.prefixIcon.activatedFillColor);
    } else {
      return (this.chipNodeInFocus ? this.theme.suffixIcon.focusActivatedColor : this.theme.suffixIcon.activatedFillColor);
    }
  }
  
  private getDefaultFillIconColor(iconType: IconType): ResourceColor {
    if (((iconType) === (IconType.PREFIX_ICON))) {
      return (this.chipNodeInFocus ? this.theme.prefixIcon.focusFillColor : this.theme.prefixIcon.fillColor);
    } else {
      return (this.chipNodeInFocus ? this.theme.suffixIcon.focusFillColor : this.theme.suffixIcon.fillColor);
    }
  }
  
  private getSymbolActiveColor(iconType: IconType): Array<ResourceColor> {
    if (!(this.chipNodeInFocus)) {
      return this.theme.defaultSymbol.activatedFontColor;
    }
    if (((iconType) === (IconType.PREFIX_SYMBOL))) {
      return [this.theme.prefixIcon.focusActivatedColor];
    }
    if (((iconType) === (IconType.SUFFIX_SYMBOL))) {
      return [this.theme.suffixIcon.focusActivatedColor];
    }
    return this.theme.defaultSymbol.activatedFontColor;
  }
  
  private getSymbolFillColor(iconType?: IconType): Array<ResourceColor> {
    if (!(this.chipNodeInFocus)) {
      return this.theme.defaultSymbol.normalFontColor;
    }
    if (((iconType) === (IconType.PREFIX_SYMBOL))) {
      return [this.theme.prefixIcon.focusFillColor];
    }
    if (((iconType) === (IconType.SUFFIX_SYMBOL))) {
      return [this.theme.suffixIcon.focusFillColor];
    }
    return this.theme.defaultSymbol.normalFontColor;
  }
  
  public getChipConstraintSize(): (ConstraintSizeOptions | undefined) {
    const constraintSize: ConstraintSizeOptions = {};
    if ((((typeof this.chipV2Options.size)) === ("string"))) {
      constraintSize.maxWidth = this.getChipMaxWidth();
      if (((this.chipV2Options.size) === (ChipV2Size.SMALL))) {
        constraintSize.minHeight = (this.isChipActivated() ? this.theme.chipNode.activatedSmallHeight : this.theme.chipNode.smallHeight);
      } else {
        constraintSize.minHeight = (this.isChipActivated() ? this.theme.chipNode.activatedNormalHeight : this.theme.chipNode.normalHeight);
      }
    } else {
      if ((((((typeof ({let gensym%%_57 = (this.chipV2Options.size as SizeT<LengthMetrics>);
      (((gensym%%_57) == (null)) ? undefined : gensym%%_57.width)}))) === ("undefined"))) || (!(this.isValidLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.width))))) {
        constraintSize.maxWidth = this.getChipMaxWidth();
      }
      if ((((((typeof ({let gensym%%_58 = (this.chipV2Options.size as SizeT<LengthMetrics>);
      (((gensym%%_58) == (null)) ? undefined : gensym%%_58.height)}))) === ("undefined"))) || (!(this.isValidLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.height))))) {
        constraintSize.minHeight = (this.isChipActivated() ? this.theme.chipNode.activatedNormalHeight : this.theme.chipNode.normalHeight);
      }
    }
    return constraintSize;
  }
  
  private getChipHeight(): number {
    let height: Length;
    if ((((typeof this.chipV2Options.size)) !== ("string"))) {
      if ((((((typeof ({let gensym%%_59 = (this.chipV2Options.size as SizeT<LengthMetrics>);
      (((gensym%%_59) == (null)) ? undefined : gensym%%_59.height)}))) !== ("undefined"))) && (this.isValidLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.height)))) {
        height = lengthMetricsToLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.height);
      } else {
        height = (this.isChipActivated() ? this.theme.chipNode.activatedNormalHeight : this.theme.chipNode.normalHeight);
      }
    } else {
      if (((this.chipV2Options.size) === (ChipV2Size.SMALL))) {
        height = (this.isChipActivated() ? this.theme.chipNode.activatedSmallHeight : this.theme.chipNode.smallHeight);
      } else {
        height = (this.isChipActivated() ? this.theme.chipNode.activatedNormalHeight : this.theme.chipNode.normalHeight);
      }
    }
    return ((this.parseLength(height)) ?? (HOT_SPOT_MIN_HEIGHT));
  }
  
  private getChipResponseRegion(): (Rectangle | undefined) {
    const chipHeight = this.getChipHeight();
    if (((chipHeight) < (HOT_SPOT_MIN_HEIGHT))) {
      return {
        x: 0,
        y: ((((chipHeight) - (HOT_SPOT_MIN_HEIGHT))) / (2)),
        width: "100%",
        height: HOT_SPOT_MIN_HEIGHT,
      };
    }
    return undefined;
  }
  
  public getChipMaxWidth(): (Length | undefined) {
    if (((this.fontSizeScale) >= (this.theme.chipNode.suitAgeScale))) {
      return undefined;
    }
    if (((this.breakPoint) === (BreakPointsType.SM))) {
      return this.theme.chipNode.breakPointConstraintWidth.breakPointSmMaxWidth;
    }
    if (((this.breakPoint) === (BreakPointsType.MD))) {
      return this.theme.chipNode.breakPointConstraintWidth.breakPointMdMaxWidth;
    }
    if (((this.breakPoint) === (BreakPointsType.LG))) {
      return this.theme.chipNode.breakPointConstraintWidth.breakPointLgMaxWidth;
    }
    return undefined;
  }
  
  public getChipSize(): (SizeOptions | undefined) {
    const chipSize: SizeOptions = {
      width: "auto",
      height: "auto",
    };
    if ((((typeof this.chipV2Options.size)) !== ("string"))) {
      if ((((((typeof ({let gensym%%_60 = (this.chipV2Options.size as SizeT<LengthMetrics>);
      (((gensym%%_60) == (null)) ? undefined : gensym%%_60.width)}))) !== ("undefined"))) && (this.isValidLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.width)))) {
        chipSize.width = lengthMetricsToLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.width);
      }
      if ((((((typeof ({let gensym%%_61 = (this.chipV2Options.size as SizeT<LengthMetrics>);
      (((gensym%%_61) == (null)) ? undefined : gensym%%_61.height)}))) !== ("undefined"))) && (this.isValidLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.height)))) {
        chipSize.height = lengthMetricsToLength((this.chipV2Options.size as SizeT<LengthMetrics>)!.height);
      }
    }
    return chipSize;
  }
  
  public copyPadding(src: LocalizedPadding): LocalizedPadding {
    return {
      top: src.top,
      bottom: src.bottom,
      start: src.start,
      end: src.end,
    };
  }
  
  public getChipPadding(): (Length | Padding | LocalizedPadding) {
    let chipTheme = this.theme.chipNode;
    let res: LocalizedPadding;
    if (this.isSmallChipSize()) {
      res = (this.isChipActivated() ? this.copyPadding(chipTheme.localizedActivatedSmallPadding) : this.copyPadding(chipTheme.localizedSmallPadding));
    } else {
      res = (this.isChipActivated() ? this.copyPadding(chipTheme.localizedActivatedNormalPadding) : this.copyPadding(chipTheme.localizedNormalPadding));
    }
    if (((({let gensym%%_62 = this.chipV2Options.padding;
    (((gensym%%_62) == (null)) ? undefined : gensym%%_62.top)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipV2Options.padding!.top!)))) {
      res.top = this.chipV2Options.padding!.top!;
    }
    if (((({let gensym%%_63 = this.chipV2Options.padding;
    (((gensym%%_63) == (null)) ? undefined : gensym%%_63.bottom)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipV2Options.padding!.bottom!)))) {
      res.bottom = this.chipV2Options.padding!.bottom!;
    }
    if (((({let gensym%%_64 = this.chipV2Options.padding;
    (((gensym%%_64) == (null)) ? undefined : gensym%%_64.start)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipV2Options.padding!.start!)))) {
      res.start = this.chipV2Options.padding!.start!;
    }
    if (((({let gensym%%_65 = this.chipV2Options.padding;
    (((gensym%%_65) == (null)) ? undefined : gensym%%_65.end)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipV2Options.padding!.end!)))) {
      res.end = this.chipV2Options.padding!.end!;
    }
    return res;
  }
  
  public getLabelMargin(): (Length | Padding | LocalizedPadding) {
    const localizedLabelMargin: LocalizedMargin = {
      start: LengthMetrics.vp(0),
      end: LengthMetrics.vp(0),
    };
    const defaultLocalizedMargin = (this.isSmallChipSize() ? this.theme.label.localizedSmallMargin : this.theme.label.localizedNormalMargin);
    if ((((((typeof ({let gensym%%_67 = ({let gensym%%_66 = this.chipV2Options.label;
    (((gensym%%_66) == (null)) ? undefined : gensym%%_66.localizedLabelMargin)});
    (((gensym%%_67) == (null)) ? undefined : gensym%%_67.start)}))) !== ("undefined"))) && (((this.chipV2Options.label!.localizedLabelMargin!.start!.value) >= (0))))) {
      localizedLabelMargin.start = this.chipV2Options.label!.localizedLabelMargin!.start;
    } else {
      if (this.hasPrefix()) {
        localizedLabelMargin.start = defaultLocalizedMargin.start;
      }
    }
    if ((((((typeof ({let gensym%%_69 = ({let gensym%%_68 = this.chipV2Options.label;
    (((gensym%%_68) == (null)) ? undefined : gensym%%_68.localizedLabelMargin)});
    (((gensym%%_69) == (null)) ? undefined : gensym%%_69.end)}))) !== ("undefined"))) && (((this.chipV2Options.label!.localizedLabelMargin!.end!.value) >= (0))))) {
      localizedLabelMargin.end = this.chipV2Options.label!.localizedLabelMargin!.end;
    } else {
      if (((this.hasSuffix()) || (this.isNeedShowCloseIconMargin()))) {
        localizedLabelMargin.end = defaultLocalizedMargin.end;
      }
    }
    if ((((typeof ({let gensym%%_70 = this.chipV2Options.label;
    (((gensym%%_70) == (null)) ? undefined : gensym%%_70.localizedLabelMargin)}))) === ("object"))) {
      return localizedLabelMargin;
    }
    if ((((typeof ({let gensym%%_71 = this.chipV2Options.label;
    (((gensym%%_71) == (null)) ? undefined : gensym%%_71.labelMargin)}))) === ("object"))) {
      const labelMargin: Margin = {
        left: 0,
        right: 0,
      };
      const defaultLabelMargin: Margin = (this.isSmallChipSize() ? this.theme.label.smallMargin : this.theme.label.normalMargin);
      if ((((((typeof ({let gensym%%_73 = ({let gensym%%_72 = this.chipV2Options.label;
      (((gensym%%_72) == (null)) ? undefined : gensym%%_72.labelMargin)});
      (((gensym%%_73) == (null)) ? undefined : gensym%%_73.left)}))) !== ("undefined"))) && (this.isValidLength((this.chipV2Options.label!.labelMargin!.left as LengthMetrics))))) {
        labelMargin.left = lengthMetricsToLength(this.chipV2Options.label!.labelMargin!.left!);
      } else {
        if (this.hasPrefix()) {
          labelMargin.left = defaultLabelMargin.left;
        }
      }
      if ((((((typeof ({let gensym%%_75 = ({let gensym%%_74 = this.chipV2Options.label;
      (((gensym%%_74) == (null)) ? undefined : gensym%%_74.labelMargin)});
      (((gensym%%_75) == (null)) ? undefined : gensym%%_75.right)}))) !== ("undefined"))) && (this.isValidLength((this.chipV2Options.label!.labelMargin!.right as LengthMetrics))))) {
        labelMargin.right = lengthMetricsToLength(this.chipV2Options.label!.labelMargin!.right!);
      } else {
        if (this.hasSuffix()) {
          labelMargin.right = defaultLabelMargin.right;
        }
      }
      return labelMargin;
    }
    return localizedLabelMargin;
  }
  
  public hasSuffix(): boolean {
    if (this.hasSuffixImageIcon()) {
      return true;
    }
    if (this.isChipActivated()) {
      return ((((this.chipV2Options.suffixIcon) instanceof (ChipV2SuffixSymbolIcon))) && (!(!(({let gensym%%_76 = (this.chipV2Options.suffixIcon as ChipV2SuffixSymbolIcon);
      (((gensym%%_76) == (null)) ? undefined : gensym%%_76.activated)})))));
    } else {
      return ((((this.chipV2Options.suffixIcon) instanceof (ChipV2SuffixSymbolIcon))) && (!(!(({let gensym%%_77 = (this.chipV2Options.suffixIcon as ChipV2SuffixSymbolIcon);
      (((gensym%%_77) == (null)) ? undefined : gensym%%_77.normal)})))));
    }
  }
  
  private hasPrefix(): boolean {
    if (this.hasPrefixImageIcon()) {
      return true;
    }
    if (!(((this.chipV2Options.prefixIcon) instanceof (ChipV2PrefixSymbolIcon)))) {
      return false;
    }
    return (this.isChipActivated() ? !(!(({let gensym%%_78 = (this.chipV2Options.prefixIcon as ChipV2PrefixSymbolIcon);
    (((gensym%%_78) == (null)) ? undefined : gensym%%_78.activated)}))) : !(!(({let gensym%%_79 = (this.chipV2Options.prefixIcon as ChipV2PrefixSymbolIcon);
    (((gensym%%_79) == (null)) ? undefined : gensym%%_79.normal)}))));
  }
  
  private getLabelFontWeight(): (string | int | FontWeight) {
    const fontWeight = (this.isChipActivated() ? this.resourceToNumber(this.theme.label.activatedFontWeight, FontWeight.Medium) : this.resourceToNumber(this.theme.label.fontWeight, FontWeight.Regular));
    switch (Double.toInt(fontWeight)) {
      case 0: {
        return FontWeight.Lighter;
      }
      case 1: {
        return FontWeight.Normal;
      }
      case 2: {
        return FontWeight.Regular;
      }
      case 3: {
        return FontWeight.Medium;
      }
      case 4: {
        return FontWeight.Bold;
      }
      case 5: {
        return FontWeight.Bolder;
      }
      default: {
        return FontWeight.Regular;
      }
    }
  }
  
  public getLabelFontFamily(): ResourceStr {
    return ((this.chipV2Options.label.fontFamily) ?? (this.theme.label.fontFamily));
  }
  
  private getFontSizeForSymbol(): (Length | Dimension) {
    if (((!(!(this.chipV2Options.fontSize))) && (this.isValidLength(this.chipV2Options.fontSize)))) {
      return lengthMetricsToLength(this.chipV2Options.fontSize!);
    }
    return (this.isSmallChipSize() ? this.theme.defaultSymbol.smallSymbolFontSize : this.theme.defaultSymbol.normalSymbolFontSize);
  }
  
  private getCloseOptionsFontsize(): (Length | Dimension) {
    if (((!(!(({let gensym%%_80 = this.chipV2Options.closeIcon;
    (((gensym%%_80) == (null)) ? undefined : gensym%%_80.fontSize)})))) && (this.isValidLength(({let gensym%%_81 = this.chipV2Options.closeIcon;
    (((gensym%%_81) == (null)) ? undefined : gensym%%_81.fontSize)}))))) {
      return lengthMetricsToLength(this.chipV2Options.closeIcon!.fontSize!);
    }
    if (((!(!(this.chipV2Options.fontSize))) && (this.isValidLength(this.chipV2Options.fontSize)))) {
      return lengthMetricsToLength(this.chipV2Options.fontSize!);
    }
    return (this.isSmallChipSize() ? this.theme.defaultSymbol.smallSymbolFontSize : this.theme.defaultSymbol.normalSymbolFontSize);
  }
  
  private getActiveFontColor(): ResourceColor {
    return (this.chipNodeInFocus ? this.theme.label.focusActiveFontColor : this.theme.label.activatedFontColor);
  }
  
  private getFontColor(): ResourceColor {
    return (this.chipNodeInFocus ? this.theme.label.focusFontColor : this.theme.label.fontColor);
  }
  
  private getChipNodeBorderColor(): (ResourceColor | undefined) {
    if (this.getBackgroundSystemMaterial()) {
      return undefined;
    }
    let themeChipNode = this.theme.chipNode;
    return (this.isChipActivated() ? themeChipNode.activatedBorderColor : themeChipNode.borderColor);
  }
  
  private getChipNodeBorderWidth(): (Dimension | undefined) {
    if (this.getBackgroundSystemMaterial()) {
      return undefined;
    }
    let themeChipNode = this.theme.chipNode;
    return (this.isChipActivated() ? themeChipNode.activatedBorderWidth : themeChipNode.defaultBorderWidth);
  }
  
  public getLabelFontColor(): ResourceColor {
    if (this.isChipActivated()) {
      return ((colorMetricsToResourceColor(this.chipV2Options.label.activatedFontColor)) ?? (this.getActiveFontColor()));
    }
    return ((colorMetricsToResourceColor(this.chipV2Options.label.fontColor)) ?? (this.getFontColor()));
  }
  
  public getLabelFontSize(): Dimension {
    if ((((((typeof this.chipV2Options.label.fontSize)) !== ("undefined"))) && (this.isValidLength(this.chipV2Options.label.fontSize)))) {
      return lengthMetricsToDimension(this.chipV2Options.label.fontSize!);
    }
    if (((!(!(this.chipV2Options.fontSize))) && (this.isValidLength(this.chipV2Options.fontSize)))) {
      return lengthMetricsToDimension(this.chipV2Options.fontSize!);
    }
    if (this.isSmallChipSize()) {
      return (this.useAdaptiveLineHeight ? this.theme.label.adaptiveItemFontSize : this.theme.label.smallFontSize);
    }
    return (this.useAdaptiveLineHeight ? this.theme.label.adaptiveItemFontSize : this.theme.label.normalFontSize);
  }
  
  public deleteChip() {
    this.getUIContext().animateTo({
      curve: Curve.Sharp,
      duration: 150,
    }, (() => {
      this.chipOpacity = 0;
    }));
    this.getUIContext().animateTo({
      curve: Curve.FastOutLinearIn,
      duration: 150,
      onFinish: (() => {
        this.isChipExist = false;
      }),
    }, (() => {
      this.chipScale = {
        x: 0.85,
        y: 0.85,
      };
    }));
  }
  
  public getChipOnClicked(): (Callback<ClickEvent> | undefined) {
    if (this.onClicked) {
      return ((event: ClickEvent) => {
        this.onClicked!(undefined);
      });
    }
    return undefined;
  }
  
  private getAccessibilitySelected(): (boolean | undefined) {
    if (((this.getChipAccessibilitySelectedType()) === (ChipV2AccessibilitySelectedType.SELECTED))) {
      return this.isChipActivated();
    }
    return undefined;
  }
  
  private getAccessibilityChecked(): (boolean | undefined) {
    if (((this.getChipAccessibilitySelectedType()) === (ChipV2AccessibilitySelectedType.CHECKED))) {
      return this.isChipActivated();
    }
    return undefined;
  }
  
  private getChipAccessibilitySelectedType(): ChipV2AccessibilitySelectedType {
    if ((((typeof this.chipV2Options.activated)) === ("undefined"))) {
      return ChipV2AccessibilitySelectedType.CLICKED;
    }
    return ((this.chipV2Options.accessibilitySelectedType) ?? (ChipV2AccessibilitySelectedType.CHECKED));
  }
  
  private getAccessibilityDescription(): (ResourceStr | undefined) {
    if ((((typeof this.chipV2Options.accessibilityDescription)) === ("undefined"))) {
      return undefined;
    }
    return (this.chipV2Options.accessibilityDescription as ResourceStr);
  }
  
  public isChipEnabled(): boolean {
    return ((this.chipV2Options.enabled) ?? (true));
  }
  
  public getChipBorderRadius(): Dimension {
    if ((((((typeof this.chipV2Options.borderRadius)) !== ("undefined"))) && (this.isValidLength(this.chipV2Options.borderRadius)))) {
      return lengthMetricsToDimension(this.chipV2Options.borderRadius!);
    }
    return (this.isSmallChipSize() ? this.theme.chipNode.smallBorderRadius : this.theme.chipNode.normalBorderRadius);
  }
  
  public isSmallChipSize() {
    return (((((typeof this.chipV2Options.size)) === ("string"))) && (((this.chipV2Options.size) === (ChipV2Size.SMALL))));
  }
  
  public getChipBackgroundColor(): ResourceColor {
    let themeChipNode = this.theme.chipNode;
    if (this.isChipActivated()) {
      return (((this.chipNodeInFocus) && (!(this.isSetActiveChipBgColor()))) ? themeChipNode.focusActivatedBgColor : this.getColor(this.chipV2Options.activatedBackgroundColor, themeChipNode.activatedBackgroundColor));
    }
    return (((this.chipNodeInFocus) && (!(this.isSetNormalChipBgColor()))) ? themeChipNode.focusBgColor : this.getColor(this.chipV2Options.backgroundColor, this.theme.chipNode.backgroundColor));
  }
  
  public getBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    if (((deviceInfo.sdkApiVersion) < (26))) {
      return undefined;
    }
    if (this.isChipActivated()) {
      return this.chipV2Options.activatedBackgroundSystemMaterial;
    }
    return this.chipV2Options.backgroundSystemMaterial;
  }
  
  public getColor(color: (ColorMetrics | undefined), defaultColor: ResourceColor): ResourceColor {
    if (!color) {
      return defaultColor;
    }
    try {
      return color.color;
    } catch (e) {
      console.error("[ChipV2] failed to get color");
      return Color.Transparent;
    }
  }
  
  public isChipActivated() {
    return ((this.chipV2Options.activated) ?? (false));
  }
  
  private getResourceNumber(resource: Resource): (number | null) {
    const resourceManager = ({let gensym%%_82 = this.getUIContext().getHostContext();
    (((gensym%%_82) == (null)) ? undefined : gensym%%_82.resourceManager)});
    if (!resourceManager) {
      console.error("[ChipV2] failed to get resourceManager");
      return null;
    }
    switch (resource.type) {
      case RESOURCE_TYPE_FLOAT:
      case RESOURCE_TYPE_INTEGER: {
        try {
          if (((resource.id) !== (-1))) {
            return resourceManager.getDouble(resource.id);
          }
          return resourceManager.getDoubleByName((resource.params![0] as string).split(".")[2]);
        } catch (error) {
          console.error("[ChipV2] get resource error");
          return null;
        }
      }
      default: {
        return null;
      }
    }
  }
  
  public resourceToNumber(resource: Resource, defaultValue: number): number {
    if (((!resource) || (!(resource.type)))) {
      console.error("[ChipV2] failed: resource get fail");
      return defaultValue;
    }
    const result = this.getResourceNumber(resource);
    return (((result) !== (null)) ? result : defaultValue);
  }
  
  public isValidLength(length: (LengthMetrics | undefined)): boolean {
    if (((!length) || (((length.unit) === (LengthUnit.PERCENT))))) {
      return false;
    }
    return ((length.value) >= (0));
  }
  
  private chipZoomOut() {
    if (this.isSuffixIconFocusStyleCustomized) {
      this.chipScale = {
        x: 1,
        y: 1,
      };
    }
  }
  
  private chipZoomIn() {
    if (this.isSuffixIconFocusStyleCustomized) {
      this.chipScale = {
        x: this.resourceToNumber(this.theme.chipNode.focusBtnScaleX, 1),
        y: this.resourceToNumber(this.theme.chipNode.focusBtnScaleY, 1),
      };
    }
  }
  
  private isNeedShowCloseIconMargin(): boolean {
    return ((this.isClosable()) && (this.isSuffixIconFocusStyleCustomized));
  }
  
  private parseLength(length: Length): (double | undefined) {
    if ((((typeof length)) === ("number"))) {
      return (length as double);
    }
    if ((((typeof length)) === ("string"))) {
      const regexp = new RegExp("(\\d+)(vp|px|lpx|fp)?");
      const matches = regexp.match((length as string));
      if (((!matches) || (((matches.length) < (2))))) {
        return undefined;
      }
      const value = parseFloat((matches[1] as string));
      const unit = (((matches.length) >= (3)) ? matches[2] : "");
      if (((((unit) === ("vp"))) || (((unit) === (""))))) {
        return value;
      } else {
        if (((unit) === ("px"))) {
          return this.getUIContext().px2vp(value);
        } else {
          if (((unit) === ("fp"))) {
            return this.getUIContext().px2vp(this.getUIContext().fp2px(value));
          } else {
            if (((unit) === ("lpx"))) {
              return this.getUIContext().px2vp(this.getUIContext().lpx2px(value));
            } else {
              return undefined;
            }
          }
        }
      }
    }
    if ((((typeof length)) === ("object"))) {
      try {
        const metrics = LengthMetrics.resource((length as Resource));
        if (((metrics.unit) === (LengthUnit.VP))) {
          return metrics.value;
        } else {
          if (((metrics.unit) === (LengthUnit.PX))) {
            return this.getUIContext().px2vp(metrics.value);
          } else {
            if (((metrics.unit) === (LengthUnit.FP))) {
              return this.getUIContext().px2vp(this.getUIContext().fp2px(metrics.value));
            } else {
              return this.getUIContext().px2vp(this.getUIContext().lpx2px(metrics.value));
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse length because the type of resource is invalid");
        return undefined;
      }
    }
    return undefined;
  }
  
  @Memo() 
  public build() {
    if (this.isChipExist) {
      this.ChipBuilder();
    } else {
      RowImpl(@Memo() ((instance: RowAttribute): void => {
        instance.setRowOptions(undefined).width(0).height(0);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_ChipV2 {
  public theme?: ChipTheme;
  public __options_has_theme?: boolean;
  @Require() @Param() public chipV2Options: ChipV2Options;
  public __backing_chipV2Options?: IParamDecoratedVariable<ChipV2Options>;
  public __options_has_chipV2Options?: boolean;
  @Event() public onClose?: (VoidCallback | undefined);
  public __options_has_onClose?: boolean;
  @Event() public onClicked?: (Callback<void> | undefined);
  public __options_has_onClicked?: boolean;
  @Local() public isChipExist?: boolean;
  public __backing_isChipExist?: ILocalDecoratedVariable<boolean>;
  public __options_has_isChipExist?: boolean;
  @Local() public chipScale?: ScaleOptions;
  public __backing_chipScale?: ILocalDecoratedVariable<ScaleOptions>;
  public __options_has_chipScale?: boolean;
  @Local() public chipOpacity?: number;
  public __backing_chipOpacity?: ILocalDecoratedVariable<number>;
  public __options_has_chipOpacity?: boolean;
  @Local() public chipNodeInFocus?: boolean;
  public __backing_chipNodeInFocus?: ILocalDecoratedVariable<boolean>;
  public __options_has_chipNodeInFocus?: boolean;
  @Local() public breakPoint?: BreakPointsType;
  public __backing_breakPoint?: ILocalDecoratedVariable<BreakPointsType>;
  public __options_has_breakPoint?: boolean;
  @Local() public fontSizeScale?: number;
  public __backing_fontSizeScale?: ILocalDecoratedVariable<number>;
  public __options_has_fontSizeScale?: boolean;
  @Local() public useAdaptiveLineHeight?: boolean;
  public __backing_useAdaptiveLineHeight?: ILocalDecoratedVariable<boolean>;
  public __options_has_useAdaptiveLineHeight?: boolean;
  public smListener?: mediaquery.MediaQueryListener;
  public __options_has_smListener?: boolean;
  public mdListener?: mediaquery.MediaQueryListener;
  public __options_has_mdListener?: boolean;
  public lgListener?: mediaquery.MediaQueryListener;
  public __options_has_lgListener?: boolean;
  public symbolEffect?: SymbolEffect;
  public __options_has_symbolEffect?: boolean;
  public environmentCallbackID?: (int | undefined);
  public __options_has_environmentCallbackID?: boolean;
  public environmentCallback?: ChipV2EnvironmentCallbackEntry;
  public __options_has_environmentCallback?: boolean;
  public isSuffixIconFocusStyleCustomized?: boolean;
  public __options_has_isSuffixIconFocusStyleCustomized?: boolean;
  public isSuffixIconFocusable?: boolean;
  public __options_has_isSuffixIconFocusable?: boolean;
  public constructor() {}
  
}
`;

function testChipV2UITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform advanced-ui-components mock-chipv2',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testChipV2UITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
