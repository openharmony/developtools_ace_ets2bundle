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
        'mock-chip.ets'
    ),
];

const pluginTester = new PluginTester('test advanced-ui-components mock-chip', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTransform',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { MemoSkip } from "arkui.incremental.annotation";

import { _r } from "arkui.component.resources";

import { IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY } from "arkui.component.customComponent";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

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

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { SymbolGlyphModifier } from "@ohos.arkui.modifier";

import { PropRef, Require, State } from "@ohos.arkui.stateManagement";

import { ColorMetrics, LengthMetrics, LengthUnit } from "@ohos.arkui.node";

import { KeyCode } from "@ohos.multimodalInput.keyCode";

import hilog from "@ohos.hilog";

import resourceManager from "@ohos.resourceManager";

import common from "@ohos.app.ability.common";

import { EnvironmentCallback } from "@kit.AbilityKit";

import deviceInfo from "@ohos.deviceInfo";

import { Configuration } from "@ohos.app.ability.Configuration";

import AbilityConstant from "@ohos.app.ability.AbilityConstant";

import uiMaterial from "@ohos.arkui.uiMaterial";

const RESOURCE_TYPE_STRING: int = 10003;
const RESOURCE_TYPE_FLOAT: int = 10002;
const RESOURCE_TYPE_INTEGER: int = 10007;
const HOT_SPOT_MIN_HEIGHT: double = 32.0f;
function main() {}

function resolveResourceStr(resource: (ResourceStr | undefined)): string {
  try {
    if (!resource) {
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
    hilog.error(0x3900, "utils", \`resolveResourceStr error, code: \${code}, message: \${message}\`);
    return "";
  }
}

${dumpAnnotation('Builder')}
${dumpAnnotation('Memo')}
function Chip(@MemoSkip() options: ChipOptions): void {
  ChipComponent._invoke(undefined, (() => {
    return {
      chipSize: ((options.size) ?? (ChipSize.NORMAL)),
      __options_has_chipSize: true,
      prefixIcon: options.prefixIcon,
      __options_has_prefixIcon: true,
      prefixSymbol: options.prefixSymbol,
      __options_has_prefixSymbol: true,
      label: options.label,
      __options_has_label: true,
      suffixIcon: options.suffixIcon,
      __options_has_suffixIcon: true,
      suffixSymbol: options.suffixSymbol,
      __options_has_suffixSymbol: true,
      suffixSymbolOptions: options.suffixSymbolOptions,
      __options_has_suffixSymbolOptions: true,
      allowClose: options.allowClose,
      __options_has_allowClose: true,
      closeOptions: options.closeOptions,
      __options_has_closeOptions: true,
      chipEnabled: ((options.enabled) ?? (true)),
      __options_has_chipEnabled: true,
      chipActivated: options.activated,
      __options_has_chipActivated: true,
      chipNodeBackgroundColor: options.backgroundColor,
      __options_has_chipNodeBackgroundColor: true,
      chipNodeActivatedBackgroundColor: options.activatedBackgroundColor,
      __options_has_chipNodeActivatedBackgroundColor: true,
      backgroundSystemMaterial: options.backgroundSystemMaterial,
      __options_has_backgroundSystemMaterial: true,
      activatedBackgroundSystemMaterial: options.activatedBackgroundSystemMaterial,
      __options_has_activatedBackgroundSystemMaterial: true,
      chipNodeRadius: options.borderRadius,
      __options_has_chipNodeRadius: true,
      chipDirection: ((options.direction) ?? (Direction.Auto)),
      __options_has_chipDirection: true,
      chipAccessibilitySelectedType: options.accessibilitySelectedType,
      __options_has_chipAccessibilitySelectedType: true,
      chipAccessibilityDescription: options.accessibilityDescription,
      __options_has_chipAccessibilityDescription: true,
      chipAccessibilityLevel: options.accessibilityLevel,
      __options_has_chipAccessibilityLevel: true,
      onClose: options.onClose,
      __options_has_onClose: true,
      onClicked: options.onClicked,
      __options_has_onClicked: true,
      maxFontScale: options.maxFontScale,
      __options_has_maxFontScale: true,
      minFontScale: options.minFontScale,
      __options_has_minFontScale: true,
      chipPadding: options.padding,
      __options_has_chipPadding: true,
      chipFontSize: options.fontSize,
      __options_has_chipFontSize: true,
    };
  }), undefined, undefined, undefined);
}


final class ChipSize extends BaseEnum<String> {
  private readonly #ordinal: int;
  private static <cctor>() {}

  private constructor(ordinal: int, value: String) {
    super(value);
    this.#ordinal = ordinal;
  }

  public static readonly NORMAL: ChipSize = new ChipSize(0, "NORMAL");
  public static readonly SMALL: ChipSize = new ChipSize(1, "SMALL");
  private static readonly #NamesArray: String[] = ["NORMAL", "SMALL"];
  private static readonly #StringValuesArray: String[] = ["NORMAL", "SMALL"];
  private static readonly #ItemsArray: ChipSize[] = [ChipSize.NORMAL, ChipSize.SMALL];
  public getName(): String {
    return ChipSize.#NamesArray[this.#ordinal];
  }

  public static getValueOf(name: String): ChipSize {
    for (let i = ((ChipSize.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (ChipSize.#NamesArray[i]))) {
        return ChipSize.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant ChipSize.") + (name)));
  }

  public static fromValue(value: String): ChipSize {
    for (let i = ((ChipSize.#StringValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (ChipSize.#StringValuesArray[i]))) {
        return ChipSize.#ItemsArray[i];
      }
    }
    throw new Error((("No enum ChipSize with value ") + (value)));
  }

  public valueOf(): String {
    return ChipSize.#StringValuesArray[this.#ordinal];
  }

  public toString(): String {
    return ChipSize.#StringValuesArray[this.#ordinal];
  }

  public static values(): ChipSize[] {
    return ChipSize.#ItemsArray;
  }

  public getOrdinal(): int {
    return this.#ordinal;
  }

  public static $_get(e: ChipSize): String {
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

final class AccessibilitySelectedType extends BaseEnum<int> {
  private readonly #ordinal: int;
  private static <cctor>() {}

  private constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }

  public static readonly CLICKED: AccessibilitySelectedType = new AccessibilitySelectedType(0, 0);
  public static readonly CHECKED: AccessibilitySelectedType = new AccessibilitySelectedType(1, 1);
  public static readonly SELECTED: AccessibilitySelectedType = new AccessibilitySelectedType(2, 2);
  private static readonly #NamesArray: String[] = ["CLICKED", "CHECKED", "SELECTED"];
  private static readonly #ValuesArray: int[] = [0, 1, 2];
  private static readonly #StringValuesArray: String[] = ["0", "1", "2"];
  private static readonly #ItemsArray: AccessibilitySelectedType[] = [AccessibilitySelectedType.CLICKED, AccessibilitySelectedType.CHECKED, AccessibilitySelectedType.SELECTED];
  public getName(): String {
    return AccessibilitySelectedType.#NamesArray[this.#ordinal];
  }

  public static getValueOf(name: String): AccessibilitySelectedType {
    for (let i = ((AccessibilitySelectedType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (AccessibilitySelectedType.#NamesArray[i]))) {
        return AccessibilitySelectedType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant AccessibilitySelectedType.") + (name)));
  }

  public static fromValue(value: int): AccessibilitySelectedType {
    for (let i = ((AccessibilitySelectedType.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (AccessibilitySelectedType.#ValuesArray[i]))) {
        return AccessibilitySelectedType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum AccessibilitySelectedType with value ") + (value)));
  }

  public valueOf(): int {
    return AccessibilitySelectedType.#ValuesArray[this.#ordinal];
  }

  public toString(): String {
    return AccessibilitySelectedType.#StringValuesArray[this.#ordinal];
  }

  public static values(): AccessibilitySelectedType[] {
    return AccessibilitySelectedType.#ItemsArray;
  }

  public getOrdinal(): int {
    return this.#ordinal;
  }

  public static $_get(e: AccessibilitySelectedType): String {
    return e.getName();
  }

}

interface IconCommonOptions {
  get src(): ResourceStr
  set src(src: ResourceStr)
  get size(): (SizeOptions | undefined) {
    return undefined;
  }
  set size(size: (SizeOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fillColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set fillColor(fillColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedFillColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set activatedFillColor(activatedFillColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }

}

interface SuffixIconOptions extends IconCommonOptions {
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

interface PrefixIconOptions extends IconCommonOptions {

}

interface ChipSuffixSymbolGlyphOptions {
  get normalAccessibility(): (AccessibilityOptions | undefined) {
    return undefined;
  }
  set normalAccessibility(normalAccessibility: (AccessibilityOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedAccessibility(): (AccessibilityOptions | undefined) {
    return undefined;
  }
  set activatedAccessibility(activatedAccessibility: (AccessibilityOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get action(): (VoidCallback | undefined) {
    return undefined;
  }
  set action(action: (VoidCallback | undefined)) {
    throw new InvalidStoreAccessError();
  }

}

interface LabelMarginOptions {
  get left(): (Dimension | undefined) {
    return undefined;
  }
  set left(left: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get right(): (Dimension | undefined) {
    return undefined;
  }
  set right(right: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }

}

interface LocalizedLabelMarginOptions {
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

interface LabelOptions {
  get text(): string
  set text(text: string)
  get fontSize(): (Dimension | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set fontColor(fontColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedFontColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set activatedFontColor(activatedFontColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontFamily(): (string | undefined) {
    return undefined;
  }
  set fontFamily(fontFamily: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get labelMargin(): (LabelMarginOptions | undefined) {
    return undefined;
  }
  set labelMargin(labelMargin: (LabelMarginOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get localizedLabelMargin(): (LocalizedLabelMarginOptions | undefined) {
    return undefined;
  }
  set localizedLabelMargin(localizedLabelMargin: (LocalizedLabelMarginOptions | undefined)) {
    throw new InvalidStoreAccessError();
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
  get adaptiveItemFontSize(): Dimension
  set adaptiveItemFontSize(adaptiveItemFontSize: Dimension)

}

interface ChipNodeOpacity {
  get normal(): double
  set normal(normal: double)
  get hover(): double
  set hover(hover: double)
  get pressed(): double
  set pressed(pressed: double)

}

interface ChipNodeConstraintWidth {
  get breakPointMinWidth(): double
  set breakPointMinWidth(breakPointMinWidth: double)
  get breakPointSmMaxWidth(): double
  set breakPointSmMaxWidth(breakPointSmMaxWidth: double)
  get breakPointMdMaxWidth(): double
  set breakPointMdMaxWidth(breakPointMdMaxWidth: double)
  get breakPointLgMaxWidth(): double
  set breakPointLgMaxWidth(breakPointLgMaxWidth: double)

}

interface AccessibilityOptions {
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

interface CloseOptions extends AccessibilityOptions {
  get fontSize(): (Dimension | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }

}

interface ChipNodeTheme {
  get suitAgeScale(): double
  set suitAgeScale(suitAgeScale: double)
  get minLabelWidth(): Dimension
  set minLabelWidth(minLabelWidth: Dimension)
  get normalHeight(): Dimension
  set normalHeight(normalHeight: Dimension)
  get smallHeight(): Dimension
  set smallHeight(smallHeight: Dimension)
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
  get focusOutlineMargin(): double
  set focusOutlineMargin(focusOutlineMargin: double)
  get normalBorderRadius(): Dimension
  set normalBorderRadius(normalBorderRadius: Dimension)
  get smallBorderRadius(): Dimension
  set smallBorderRadius(smallBorderRadius: Dimension)
  get borderWidth(): double
  set borderWidth(borderWidth: double)
  get localizedNormalPadding(): LocalizedPadding
  set localizedNormalPadding(localizedNormalPadding: LocalizedPadding)
  get localizedSmallPadding(): LocalizedPadding
  set localizedSmallPadding(localizedSmallPadding: LocalizedPadding)
  get hoverBlendColor(): ResourceColor
  set hoverBlendColor(hoverBlendColor: ResourceColor)
  get pressedBlendColor(): ResourceColor
  set pressedBlendColor(pressedBlendColor: ResourceColor)
  get opacity(): ChipNodeOpacity
  set opacity(opacity: ChipNodeOpacity)
  get breakPointConstraintWidth(): ChipNodeConstraintWidth
  set breakPointConstraintWidth(breakPointConstraintWidth: ChipNodeConstraintWidth)

}

interface ChipSymbolGlyphOptions {
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

interface ChipOptions {
  get prefixIcon(): (PrefixIconOptions | undefined) {
    return undefined;
  }
  set prefixIcon(prefixIcon: (PrefixIconOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get prefixSymbol(): (ChipSymbolGlyphOptions | undefined) {
    return undefined;
  }
  set prefixSymbol(prefixSymbol: (ChipSymbolGlyphOptions | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get label(): LabelOptions
  set label(label: LabelOptions)
  get suffixIcon(): (SuffixIconOptions | undefined) {
    return undefined;
  }
  set suffixIcon(suffixIcon: (SuffixIconOptions | undefined)) {
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
  get backgroundColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set backgroundColor(backgroundColor: (ResourceColor | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get activatedBackgroundColor(): (ResourceColor | undefined) {
    return undefined;
  }
  set activatedBackgroundColor(activatedBackgroundColor: (ResourceColor | undefined)) {
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
  get borderRadius(): (Dimension | undefined) {
    return undefined;
  }
  set borderRadius(borderRadius: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get size(): ((ChipSize | SizeOptions) | undefined) {
    return undefined;
  }
  set size(size: ((ChipSize | SizeOptions) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get direction(): (Direction | undefined) {
    return undefined;
  }
  set direction(direction: (Direction | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get accessibilitySelectedType(): (AccessibilitySelectedType | undefined) {
    return undefined;
  }
  set accessibilitySelectedType(accessibilitySelectedType: (AccessibilitySelectedType | undefined)) {
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
  get onClose(): ((()=> void) | undefined) {
    return undefined;
  }
  set onClose(onClose: ((()=> void) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get onClicked(): ((()=> void) | undefined) {
    return undefined;
  }
  set onClicked(onClicked: ((()=> void) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get maxFontScale(): ((double | Resource) | undefined) {
    return undefined;
  }
  set maxFontScale(maxFontScale: ((double | Resource) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get minFontScale(): ((double | Resource) | undefined) {
    return undefined;
  }
  set minFontScale(minFontScale: ((double | Resource) | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get padding(): (LocalizedPadding | undefined) {
    return undefined;
  }
  set padding(padding: (LocalizedPadding | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get fontSize(): (Dimension | undefined) {
    return undefined;
  }
  set fontSize(fontSize: (Dimension | undefined)) {
    throw new InvalidStoreAccessError();
  }

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

class EnvironmentCallbackEntry implements EnvironmentCallback {
  private chipComponent: ChipComponent;
  public constructor(chipComponent: ChipComponent) {
    this.chipComponent = chipComponent;
  }

  public onConfigurationUpdated(config: Configuration): void {
    this.chipComponent.updateLanguageLineHeight();
  }

  public onMemoryLevel(level: AbilityConstant.MemoryLevel): void {}

}

@Component() final struct ChipComponent extends CustomComponent<ChipComponent, __Options_ChipComponent> {
  public __initializeStruct(initializers: (__Options_ChipComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_theme = (({let gensym___148283410 = initializers;
    (((gensym___148283410) == (null)) ? undefined : gensym___148283410.__options_has_theme)}) ? (initializers!.theme as ChipTheme) : ({
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
        fontFamily: "",
        fontWeight: _r(16777216, 10003, "com.example.mock", "entry"),
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
          start: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          end: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          top: LengthMetrics.vp(0),
          bottom: LengthMetrics.vp(0),
        },
        localizedSmallMargin: {
          start: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          end: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
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
        defaultDeleteIcon: _r(16777216, 10003, "com.example.mock", "entry", 16, 16),
        focusable: false,
        isShowMargin: _r(16777216, 10003, "com.example.mock", "entry"),
      },
      defaultSymbol: {
        normalFontColor: [_r(16777216, 10003, "com.example.mock", "entry")],
        activatedFontColor: [_r(16777216, 10003, "com.example.mock", "entry")],
        normalSymbolFontSize: (LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")).value as Length),
        smallSymbolFontSize: (LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")).value as Length),
        defaultEffect: -1,
      },
      chipNode: {
        suitAgeScale: 1.75,
        minLabelWidth: 12,
        normalHeight: _r(16777216, 10003, "com.example.mock", "entry"),
        smallHeight: _r(16777216, 10003, "com.example.mock", "entry"),
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
        borderWidth: 2,
        focusBtnScaleX: _r(16777216, 10003, "com.example.mock", "entry"),
        focusBtnScaleY: _r(16777216, 10003, "com.example.mock", "entry"),
        localizedNormalPadding: {
          start: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          end: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          top: LengthMetrics.vp(4),
          bottom: LengthMetrics.vp(4),
        },
        localizedSmallPadding: {
          start: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
          end: LengthMetrics.resource(_r(16777216, 10003, "com.example.mock", "entry")),
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
    } as ChipTheme));
    this.__backing_chipSize = STATE_MGMT_FACTORY.makePropRef<(ChipSize | SizeOptions | undefined)>(this, "chipSize", (({let gensym___30913016 = initializers;
    (((gensym___30913016) == (null)) ? undefined : gensym___30913016.__options_has_chipSize)}) ? (initializers!.chipSize as (ChipSize | SizeOptions | undefined)) : undefined));
    this.__backing_allowClose = STATE_MGMT_FACTORY.makePropRef<(boolean | undefined)>(this, "allowClose", (({let gensym___187224658 = initializers;
    (((gensym___187224658) == (null)) ? undefined : gensym___187224658.__options_has_allowClose)}) ? (initializers!.allowClose as (boolean | undefined)) : undefined));
    this.__backing_closeOptions = STATE_MGMT_FACTORY.makePropRef<(CloseOptions | undefined)>(this, "closeOptions", (({let gensym___222090767 = initializers;
    (((gensym___222090767) == (null)) ? undefined : gensym___222090767.__options_has_closeOptions)}) ? (initializers!.closeOptions as (CloseOptions | undefined)) : undefined));
    this.__backing_prefixSymbol = STATE_MGMT_FACTORY.makePropRef<(ChipSymbolGlyphOptions | undefined)>(this, "prefixSymbol", (({let gensym___148644609 = initializers;
    (((gensym___148644609) == (null)) ? undefined : gensym___148644609.__options_has_prefixSymbol)}) ? (initializers!.prefixSymbol as (ChipSymbolGlyphOptions | undefined)) : undefined));
    this.__backing_chipDirection = STATE_MGMT_FACTORY.makePropRef<(Direction | undefined)>(this, "chipDirection", (({let gensym___54058911 = initializers;
    (((gensym___54058911) == (null)) ? undefined : gensym___54058911.__options_has_chipDirection)}) ? (initializers!.chipDirection as (Direction | undefined)) : undefined));
    this.__backing_prefixIcon = STATE_MGMT_FACTORY.makePropRef<(PrefixIconOptions | undefined)>(this, "prefixIcon", (({let gensym___107123049 = initializers;
    (((gensym___107123049) == (null)) ? undefined : gensym___107123049.__options_has_prefixIcon)}) ? (initializers!.prefixIcon as (PrefixIconOptions | undefined)) : undefined));
    this.__backing_label = STATE_MGMT_FACTORY.makePropRef<LabelOptions>(this, "label", (initializers!.label as LabelOptions));
    this.__backing_suffixIcon = STATE_MGMT_FACTORY.makePropRef<(SuffixIconOptions | undefined)>(this, "suffixIcon", (({let gensym___27602576 = initializers;
    (((gensym___27602576) == (null)) ? undefined : gensym___27602576.__options_has_suffixIcon)}) ? (initializers!.suffixIcon as (SuffixIconOptions | undefined)) : undefined));
    this.__backing_suffixSymbol = STATE_MGMT_FACTORY.makePropRef<(ChipSymbolGlyphOptions | undefined)>(this, "suffixSymbol", (({let gensym___9595060 = initializers;
    (((gensym___9595060) == (null)) ? undefined : gensym___9595060.__options_has_suffixSymbol)}) ? (initializers!.suffixSymbol as (ChipSymbolGlyphOptions | undefined)) : undefined));
    this.__backing_suffixSymbolOptions = STATE_MGMT_FACTORY.makePropRef<(ChipSuffixSymbolGlyphOptions | undefined)>(this, "suffixSymbolOptions", (({let gensym___89096940 = initializers;
    (((gensym___89096940) == (null)) ? undefined : gensym___89096940.__options_has_suffixSymbolOptions)}) ? (initializers!.suffixSymbolOptions as (ChipSuffixSymbolGlyphOptions | undefined)) : undefined));
    this.__backing_chipNodeBackgroundColor = STATE_MGMT_FACTORY.makePropRef<(ResourceColor | undefined)>(this, "chipNodeBackgroundColor", (({let gensym___39179621 = initializers;
    (((gensym___39179621) == (null)) ? undefined : gensym___39179621.__options_has_chipNodeBackgroundColor)}) ? (initializers!.chipNodeBackgroundColor as (ResourceColor | undefined)) : undefined));
    this.__backing_chipNodeActivatedBackgroundColor = STATE_MGMT_FACTORY.makePropRef<(ResourceColor | undefined)>(this, "chipNodeActivatedBackgroundColor", (({let gensym___91328402 = initializers;
    (((gensym___91328402) == (null)) ? undefined : gensym___91328402.__options_has_chipNodeActivatedBackgroundColor)}) ? (initializers!.chipNodeActivatedBackgroundColor as (ResourceColor | undefined)) : undefined));
    this.__backing_backgroundSystemMaterial = STATE_MGMT_FACTORY.makePropRef<(uiMaterial.Material | undefined)>(this, "backgroundSystemMaterial", (({let gensym___168048413 = initializers;
    (((gensym___168048413) == (null)) ? undefined : gensym___168048413.__options_has_backgroundSystemMaterial)}) ? (initializers!.backgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_activatedBackgroundSystemMaterial = STATE_MGMT_FACTORY.makePropRef<(uiMaterial.Material | undefined)>(this, "activatedBackgroundSystemMaterial", (({let gensym___69404244 = initializers;
    (((gensym___69404244) == (null)) ? undefined : gensym___69404244.__options_has_activatedBackgroundSystemMaterial)}) ? (initializers!.activatedBackgroundSystemMaterial as (uiMaterial.Material | undefined)) : undefined));
    this.__backing_chipNodeRadius = STATE_MGMT_FACTORY.makePropRef<(Dimension | undefined)>(this, "chipNodeRadius", (({let gensym___148728954 = initializers;
    (((gensym___148728954) == (null)) ? undefined : gensym___148728954.__options_has_chipNodeRadius)}) ? (initializers!.chipNodeRadius as (Dimension | undefined)) : undefined));
    this.__backing_chipEnabled = STATE_MGMT_FACTORY.makePropRef<(boolean | undefined)>(this, "chipEnabled", (({let gensym___170449148 = initializers;
    (((gensym___170449148) == (null)) ? undefined : gensym___170449148.__options_has_chipEnabled)}) ? (initializers!.chipEnabled as (boolean | undefined)) : undefined));
    this.__backing_chipActivated = STATE_MGMT_FACTORY.makePropRef<(boolean | undefined)>(this, "chipActivated", (({let gensym___82586163 = initializers;
    (((gensym___82586163) == (null)) ? undefined : gensym___82586163.__options_has_chipActivated)}) ? (initializers!.chipActivated as (boolean | undefined)) : undefined));
    this.__backing_chipAccessibilitySelectedType = STATE_MGMT_FACTORY.makePropRef<(AccessibilitySelectedType | undefined)>(this, "chipAccessibilitySelectedType", (({let gensym___82518029 = initializers;
    (((gensym___82518029) == (null)) ? undefined : gensym___82518029.__options_has_chipAccessibilitySelectedType)}) ? (initializers!.chipAccessibilitySelectedType as (AccessibilitySelectedType | undefined)) : undefined));
    this.__backing_chipAccessibilityDescription = STATE_MGMT_FACTORY.makePropRef<(ResourceStr | undefined)>(this, "chipAccessibilityDescription", (({let gensym___250566524 = initializers;
    (((gensym___250566524) == (null)) ? undefined : gensym___250566524.__options_has_chipAccessibilityDescription)}) ? (initializers!.chipAccessibilityDescription as (ResourceStr | undefined)) : undefined));
    this.__backing_chipAccessibilityLevel = STATE_MGMT_FACTORY.makePropRef<(string | undefined)>(this, "chipAccessibilityLevel", (({let gensym___39724913 = initializers;
    (((gensym___39724913) == (null)) ? undefined : gensym___39724913.__options_has_chipAccessibilityLevel)}) ? (initializers!.chipAccessibilityLevel as (string | undefined)) : undefined));
    this.__backing_maxFontScale = STATE_MGMT_FACTORY.makePropRef<(number | Resource | undefined)>(this, "maxFontScale", (({let gensym___36577383 = initializers;
    (((gensym___36577383) == (null)) ? undefined : gensym___36577383.__options_has_maxFontScale)}) ? (initializers!.maxFontScale as (number | Resource | undefined)) : undefined));
    this.__backing_minFontScale = STATE_MGMT_FACTORY.makePropRef<(number | Resource | undefined)>(this, "minFontScale", (({let gensym___232938662 = initializers;
    (((gensym___232938662) == (null)) ? undefined : gensym___232938662.__options_has_minFontScale)}) ? (initializers!.minFontScale as (number | Resource | undefined)) : undefined));
    this.__backing_chipPadding = STATE_MGMT_FACTORY.makePropRef<(LocalizedPadding | undefined)>(this, "chipPadding", (({let gensym___182881388 = initializers;
    (((gensym___182881388) == (null)) ? undefined : gensym___182881388.__options_has_chipPadding)}) ? (initializers!.chipPadding as (LocalizedPadding | undefined)) : undefined));
    this.__backing_chipFontSize = STATE_MGMT_FACTORY.makePropRef<(Dimension | undefined)>(this, "chipFontSize", (({let gensym___103218042 = initializers;
    (((gensym___103218042) == (null)) ? undefined : gensym___103218042.__options_has_chipFontSize)}) ? (initializers!.chipFontSize as (Dimension | undefined)) : undefined));
    this.__backing_isChipExist = STATE_MGMT_FACTORY.makeState<boolean>(this, "isChipExist", (({let gensym___48638295 = initializers;
    (((gensym___48638295) == (null)) ? undefined : gensym___48638295.__options_has_isChipExist)}) ? (initializers!.isChipExist as boolean) : (true as boolean)));
    this.__backing_chipScale = STATE_MGMT_FACTORY.makeState<ScaleOptions>(this, "chipScale", (({let gensym___227764602 = initializers;
    (((gensym___227764602) == (null)) ? undefined : gensym___227764602.__options_has_chipScale)}) ? (initializers!.chipScale as ScaleOptions) : ({
      x: 1,
      y: 1,
    } as ScaleOptions)));
    this.__backing_chipOpacity = STATE_MGMT_FACTORY.makeState<number>(this, "chipOpacity", (({let gensym___136891512 = initializers;
    (((gensym___136891512) == (null)) ? undefined : gensym___136891512.__options_has_chipOpacity)}) ? (initializers!.chipOpacity as number) : (1 as number)));
    this.__backing_suffixSymbolHeight = STATE_MGMT_FACTORY.makeState<number>(this, "suffixSymbolHeight", (({let gensym___28620040 = initializers;
    (((gensym___28620040) == (null)) ? undefined : gensym___28620040.__options_has_suffixSymbolHeight)}) ? (initializers!.suffixSymbolHeight as number) : (0 as number)));
    this.__backing_suffixSymbolWidth = STATE_MGMT_FACTORY.makeState<number>(this, "suffixSymbolWidth", (({let gensym___183948987 = initializers;
    (((gensym___183948987) == (null)) ? undefined : gensym___183948987.__options_has_suffixSymbolWidth)}) ? (initializers!.suffixSymbolWidth as number) : (0 as number)));
    this.__backing_breakPoint = STATE_MGMT_FACTORY.makeState<BreakPointsType>(this, "breakPoint", (({let gensym___79053079 = initializers;
    (((gensym___79053079) == (null)) ? undefined : gensym___79053079.__options_has_breakPoint)}) ? (initializers!.breakPoint as BreakPointsType) : BreakPointsType.SM));
    this.__backing_fontSizeScale = STATE_MGMT_FACTORY.makeState<number>(this, "fontSizeScale", (({let gensym___11100840 = initializers;
    (((gensym___11100840) == (null)) ? undefined : gensym___11100840.__options_has_fontSizeScale)}) ? (initializers!.fontSizeScale as number) : (1 as number)));
    this.__backing_useAdaptiveLineHeight = STATE_MGMT_FACTORY.makeState<boolean>(this, "useAdaptiveLineHeight", (({let gensym___259426147 = initializers;
    (((gensym___259426147) == (null)) ? undefined : gensym___259426147.__options_has_useAdaptiveLineHeight)}) ? (initializers!.useAdaptiveLineHeight as boolean) : (false as boolean)));
    this.__backing_isSuffixIconFocusStyleCustomized = (({let gensym___1503822 = initializers;
    (((gensym___1503822) == (null)) ? undefined : gensym___1503822.__options_has_isSuffixIconFocusStyleCustomized)}) ? (initializers!.isSuffixIconFocusStyleCustomized as boolean) : (((this.resourceToNumber(this.theme.suffixIcon.isShowMargin, 0)) !== (0)) as boolean));
    this.__backing_isSuffixIconFocusable = (({let gensym___72620981 = initializers;
    (((gensym___72620981) == (null)) ? undefined : gensym___72620981.__options_has_isSuffixIconFocusable)}) ? (initializers!.isSuffixIconFocusable as boolean) : (((this.resourceToNumber(this.theme.suffixIcon.isShowMargin, 0)) !== (0)) as boolean));
    this.__backing_onClose = (({let gensym___224990050 = initializers;
    (((gensym___224990050) == (null)) ? undefined : gensym___224990050.__options_has_onClose)}) ? (initializers!.onClose as (VoidCallback | undefined)) : undefined);
    this.__backing_onClicked = (({let gensym___143203209 = initializers;
    (((gensym___143203209) == (null)) ? undefined : gensym___143203209.__options_has_onClicked)}) ? (initializers!.onClicked as (VoidCallback | undefined)) : undefined);
    this.__backing_chipNodeInFocus = STATE_MGMT_FACTORY.makeState<boolean>(this, "chipNodeInFocus", (({let gensym___174558003 = initializers;
    (((gensym___174558003) == (null)) ? undefined : gensym___174558003.__options_has_chipNodeInFocus)}) ? (initializers!.chipNodeInFocus as boolean) : (false as boolean)));
    this.__backing_symbolEffect = (({let gensym___158761561 = initializers;
    (((gensym___158761561) == (null)) ? undefined : gensym___158761561.__options_has_symbolEffect)}) ? (initializers!.symbolEffect as SymbolEffect) : (new SymbolEffect() as SymbolEffect));
    this.__backing_environmentCallbackID = (({let gensym___129712899 = initializers;
    (((gensym___129712899) == (null)) ? undefined : gensym___129712899.__options_has_environmentCallbackID)}) ? (initializers!.environmentCallbackID as (int | undefined)) : undefined);
    this.__backing_environmentCallback = (({let gensym___99850970 = initializers;
    (((gensym___99850970) == (null)) ? undefined : gensym___99850970.__options_has_environmentCallback)}) ? (initializers!.environmentCallback as EnvironmentCallbackEntry) : (new EnvironmentCallbackEntry(this) as EnvironmentCallbackEntry));
  }

  public __updateStruct(initializers: (__Options_ChipComponent | undefined)): void {
    if (({let gensym___256846649 = initializers;
    (((gensym___256846649) == (null)) ? undefined : gensym___256846649.__options_has_chipSize)})) {
      this.__backing_chipSize!.update((initializers!.chipSize as (ChipSize | SizeOptions | undefined)));
    }
    if (({let gensym___734273 = initializers;
    (((gensym___734273) == (null)) ? undefined : gensym___734273.__options_has_allowClose)})) {
      this.__backing_allowClose!.update((initializers!.allowClose as (boolean | undefined)));
    }
    if (({let gensym___173411570 = initializers;
    (((gensym___173411570) == (null)) ? undefined : gensym___173411570.__options_has_closeOptions)})) {
      this.__backing_closeOptions!.update((initializers!.closeOptions as (CloseOptions | undefined)));
    }
    if (({let gensym___105833033 = initializers;
    (((gensym___105833033) == (null)) ? undefined : gensym___105833033.__options_has_prefixSymbol)})) {
      this.__backing_prefixSymbol!.update((initializers!.prefixSymbol as (ChipSymbolGlyphOptions | undefined)));
    }
    if (({let gensym___112815286 = initializers;
    (((gensym___112815286) == (null)) ? undefined : gensym___112815286.__options_has_chipDirection)})) {
      this.__backing_chipDirection!.update((initializers!.chipDirection as (Direction | undefined)));
    }
    if (({let gensym___129597849 = initializers;
    (((gensym___129597849) == (null)) ? undefined : gensym___129597849.__options_has_prefixIcon)})) {
      this.__backing_prefixIcon!.update((initializers!.prefixIcon as (PrefixIconOptions | undefined)));
    }
    if (({let gensym___12681792 = initializers;
    (((gensym___12681792) == (null)) ? undefined : gensym___12681792.__options_has_label)})) {
      this.__backing_label!.update((initializers!.label as LabelOptions));
    }
    if (({let gensym___263910161 = initializers;
    (((gensym___263910161) == (null)) ? undefined : gensym___263910161.__options_has_suffixIcon)})) {
      this.__backing_suffixIcon!.update((initializers!.suffixIcon as (SuffixIconOptions | undefined)));
    }
    if (({let gensym___174304043 = initializers;
    (((gensym___174304043) == (null)) ? undefined : gensym___174304043.__options_has_suffixSymbol)})) {
      this.__backing_suffixSymbol!.update((initializers!.suffixSymbol as (ChipSymbolGlyphOptions | undefined)));
    }
    if (({let gensym___195833240 = initializers;
    (((gensym___195833240) == (null)) ? undefined : gensym___195833240.__options_has_suffixSymbolOptions)})) {
      this.__backing_suffixSymbolOptions!.update((initializers!.suffixSymbolOptions as (ChipSuffixSymbolGlyphOptions | undefined)));
    }
    if (({let gensym___75840604 = initializers;
    (((gensym___75840604) == (null)) ? undefined : gensym___75840604.__options_has_chipNodeBackgroundColor)})) {
      this.__backing_chipNodeBackgroundColor!.update((initializers!.chipNodeBackgroundColor as (ResourceColor | undefined)));
    }
    if (({let gensym___56306490 = initializers;
    (((gensym___56306490) == (null)) ? undefined : gensym___56306490.__options_has_chipNodeActivatedBackgroundColor)})) {
      this.__backing_chipNodeActivatedBackgroundColor!.update((initializers!.chipNodeActivatedBackgroundColor as (ResourceColor | undefined)));
    }
    if (({let gensym___6769669 = initializers;
    (((gensym___6769669) == (null)) ? undefined : gensym___6769669.__options_has_backgroundSystemMaterial)})) {
      this.__backing_backgroundSystemMaterial!.update((initializers!.backgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
    if (({let gensym___224821225 = initializers;
    (((gensym___224821225) == (null)) ? undefined : gensym___224821225.__options_has_activatedBackgroundSystemMaterial)})) {
      this.__backing_activatedBackgroundSystemMaterial!.update((initializers!.activatedBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
    }
    if (({let gensym___22268045 = initializers;
    (((gensym___22268045) == (null)) ? undefined : gensym___22268045.__options_has_chipNodeRadius)})) {
      this.__backing_chipNodeRadius!.update((initializers!.chipNodeRadius as (Dimension | undefined)));
    }
    if (({let gensym___231602028 = initializers;
    (((gensym___231602028) == (null)) ? undefined : gensym___231602028.__options_has_chipEnabled)})) {
      this.__backing_chipEnabled!.update((initializers!.chipEnabled as (boolean | undefined)));
    }
    if (({let gensym___148333693 = initializers;
    (((gensym___148333693) == (null)) ? undefined : gensym___148333693.__options_has_chipActivated)})) {
      this.__backing_chipActivated!.update((initializers!.chipActivated as (boolean | undefined)));
    }
    if (({let gensym___200044810 = initializers;
    (((gensym___200044810) == (null)) ? undefined : gensym___200044810.__options_has_chipAccessibilitySelectedType)})) {
      this.__backing_chipAccessibilitySelectedType!.update((initializers!.chipAccessibilitySelectedType as (AccessibilitySelectedType | undefined)));
    }
    if (({let gensym___263335482 = initializers;
    (((gensym___263335482) == (null)) ? undefined : gensym___263335482.__options_has_chipAccessibilityDescription)})) {
      this.__backing_chipAccessibilityDescription!.update((initializers!.chipAccessibilityDescription as (ResourceStr | undefined)));
    }
    if (({let gensym___56990841 = initializers;
    (((gensym___56990841) == (null)) ? undefined : gensym___56990841.__options_has_chipAccessibilityLevel)})) {
      this.__backing_chipAccessibilityLevel!.update((initializers!.chipAccessibilityLevel as (string | undefined)));
    }
    if (({let gensym___11867906 = initializers;
    (((gensym___11867906) == (null)) ? undefined : gensym___11867906.__options_has_maxFontScale)})) {
      this.__backing_maxFontScale!.update((initializers!.maxFontScale as (number | Resource | undefined)));
    }
    if (({let gensym___57806455 = initializers;
    (((gensym___57806455) == (null)) ? undefined : gensym___57806455.__options_has_minFontScale)})) {
      this.__backing_minFontScale!.update((initializers!.minFontScale as (number | Resource | undefined)));
    }
    if (({let gensym___114479796 = initializers;
    (((gensym___114479796) == (null)) ? undefined : gensym___114479796.__options_has_chipPadding)})) {
      this.__backing_chipPadding!.update((initializers!.chipPadding as (LocalizedPadding | undefined)));
    }
    if (({let gensym___105304746 = initializers;
    (((gensym___105304746) == (null)) ? undefined : gensym___105304746.__options_has_chipFontSize)})) {
      this.__backing_chipFontSize!.update((initializers!.chipFontSize as (Dimension | undefined)));
    }
  }

  public resetStateVarsOnReuse(initializers: (__Options_ChipComponent | undefined)): void {
    this.__backing_chipSize!.resetOnReuse((initializers!.chipSize as (ChipSize | SizeOptions | undefined)));
    this.__backing_allowClose!.resetOnReuse((initializers!.allowClose as (boolean | undefined)));
    this.__backing_closeOptions!.resetOnReuse((initializers!.closeOptions as (CloseOptions | undefined)));
    this.__backing_prefixSymbol!.resetOnReuse((initializers!.prefixSymbol as (ChipSymbolGlyphOptions | undefined)));
    this.__backing_chipDirection!.resetOnReuse((initializers!.chipDirection as (Direction | undefined)));
    this.__backing_prefixIcon!.resetOnReuse((initializers!.prefixIcon as (PrefixIconOptions | undefined)));
    this.__backing_label!.resetOnReuse((initializers!.label as LabelOptions));
    this.__backing_suffixIcon!.resetOnReuse((initializers!.suffixIcon as (SuffixIconOptions | undefined)));
    this.__backing_suffixSymbol!.resetOnReuse((initializers!.suffixSymbol as (ChipSymbolGlyphOptions | undefined)));
    this.__backing_suffixSymbolOptions!.resetOnReuse((initializers!.suffixSymbolOptions as (ChipSuffixSymbolGlyphOptions | undefined)));
    this.__backing_chipNodeBackgroundColor!.resetOnReuse((initializers!.chipNodeBackgroundColor as (ResourceColor | undefined)));
    this.__backing_chipNodeActivatedBackgroundColor!.resetOnReuse((initializers!.chipNodeActivatedBackgroundColor as (ResourceColor | undefined)));
    this.__backing_backgroundSystemMaterial!.resetOnReuse((initializers!.backgroundSystemMaterial as (uiMaterial.Material | undefined)));
    this.__backing_activatedBackgroundSystemMaterial!.resetOnReuse((initializers!.activatedBackgroundSystemMaterial as (uiMaterial.Material | undefined)));
    this.__backing_chipNodeRadius!.resetOnReuse((initializers!.chipNodeRadius as (Dimension | undefined)));
    this.__backing_chipEnabled!.resetOnReuse((initializers!.chipEnabled as (boolean | undefined)));
    this.__backing_chipActivated!.resetOnReuse((initializers!.chipActivated as (boolean | undefined)));
    this.__backing_chipAccessibilitySelectedType!.resetOnReuse((initializers!.chipAccessibilitySelectedType as (AccessibilitySelectedType | undefined)));
    this.__backing_chipAccessibilityDescription!.resetOnReuse((initializers!.chipAccessibilityDescription as (ResourceStr | undefined)));
    this.__backing_chipAccessibilityLevel!.resetOnReuse((initializers!.chipAccessibilityLevel as (string | undefined)));
    this.__backing_maxFontScale!.resetOnReuse((initializers!.maxFontScale as (number | Resource | undefined)));
    this.__backing_minFontScale!.resetOnReuse((initializers!.minFontScale as (number | Resource | undefined)));
    this.__backing_chipPadding!.resetOnReuse((initializers!.chipPadding as (LocalizedPadding | undefined)));
    this.__backing_chipFontSize!.resetOnReuse((initializers!.chipFontSize as (Dimension | undefined)));
    this.__backing_isChipExist!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.isChipExist)})) ?? (true)) as boolean));
    this.__backing_chipScale!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.chipScale)})) ?? (({
      x: 1,
      y: 1,
    } as ScaleOptions))));
    this.__backing_chipOpacity!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.chipOpacity)})) ?? (1)) as number));
    this.__backing_suffixSymbolHeight!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.suffixSymbolHeight)})) ?? (0)) as number));
    this.__backing_suffixSymbolWidth!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.suffixSymbolWidth)})) ?? (0)) as number));
    this.__backing_breakPoint!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.breakPoint)})) ?? (BreakPointsType.SM)));
    this.__backing_fontSizeScale!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.fontSizeScale)})) ?? (1)) as number));
    this.__backing_useAdaptiveLineHeight!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.useAdaptiveLineHeight)})) ?? (false)) as boolean));
    this.__backing_chipNodeInFocus!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.chipNodeInFocus)})) ?? (false)) as boolean));
  }

  ${dumpAnnotation('MemoIntrinsic')}
  public static _invoke(style: (@Memo() ((instance: ChipComponent)=> void) | undefined), initializers: ((()=> __Options_ChipComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ChipComponent, __Options_ChipComponent>(style, ((): ChipComponent => {
      return new ChipComponent(false, ({let gensym___110946039 = storage;
      (((gensym___110946039) == (null)) ? undefined : gensym___110946039())}));
    }), initializers, reuseId, content);
  }

  ${dumpAnnotation('ComponentBuilder')}
  public static $_invoke(initializers?: __Options_ChipComponent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ChipComponent {
    throw new Error("Declare interface");
  }

  private __backing_theme?: ChipTheme;
  public get theme(): ChipTheme {
    return (this.__backing_theme as ChipTheme);
  }

  public set theme(value: ChipTheme) {
    this.__backing_theme = value;
  }

  private __backing_chipSize?: IPropRefDecoratedVariable<(ChipSize | SizeOptions | undefined)>;
  public get chipSize(): (ChipSize | SizeOptions | undefined) {
    return this.__backing_chipSize!.get();
  }

  public set chipSize(value: (ChipSize | SizeOptions | undefined)) {
    this.__backing_chipSize!.set(value);
  }

  private __backing_allowClose?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public get allowClose(): (boolean | undefined) {
    return this.__backing_allowClose!.get();
  }

  public set allowClose(value: (boolean | undefined)) {
    this.__backing_allowClose!.set(value);
  }

  private __backing_closeOptions?: IPropRefDecoratedVariable<(CloseOptions | undefined)>;
  public get closeOptions(): (CloseOptions | undefined) {
    return this.__backing_closeOptions!.get();
  }

  public set closeOptions(value: (CloseOptions | undefined)) {
    this.__backing_closeOptions!.set(value);
  }

  private __backing_prefixSymbol?: IPropRefDecoratedVariable<(ChipSymbolGlyphOptions | undefined)>;
  public get prefixSymbol(): (ChipSymbolGlyphOptions | undefined) {
    return this.__backing_prefixSymbol!.get();
  }

  public set prefixSymbol(value: (ChipSymbolGlyphOptions | undefined)) {
    this.__backing_prefixSymbol!.set(value);
  }

  private __backing_chipDirection?: IPropRefDecoratedVariable<(Direction | undefined)>;
  public get chipDirection(): (Direction | undefined) {
    return this.__backing_chipDirection!.get();
  }

  public set chipDirection(value: (Direction | undefined)) {
    this.__backing_chipDirection!.set(value);
  }

  private __backing_prefixIcon?: IPropRefDecoratedVariable<(PrefixIconOptions | undefined)>;
  public get prefixIcon(): (PrefixIconOptions | undefined) {
    return this.__backing_prefixIcon!.get();
  }

  public set prefixIcon(value: (PrefixIconOptions | undefined)) {
    this.__backing_prefixIcon!.set(value);
  }

  private __backing_label?: IPropRefDecoratedVariable<LabelOptions>;
  public get label(): LabelOptions {
    return this.__backing_label!.get();
  }

  public set label(value: LabelOptions) {
    this.__backing_label!.set(value);
  }

  private __backing_suffixIcon?: IPropRefDecoratedVariable<(SuffixIconOptions | undefined)>;
  public get suffixIcon(): (SuffixIconOptions | undefined) {
    return this.__backing_suffixIcon!.get();
  }

  public set suffixIcon(value: (SuffixIconOptions | undefined)) {
    this.__backing_suffixIcon!.set(value);
  }

  private __backing_suffixSymbol?: IPropRefDecoratedVariable<(ChipSymbolGlyphOptions | undefined)>;
  public get suffixSymbol(): (ChipSymbolGlyphOptions | undefined) {
    return this.__backing_suffixSymbol!.get();
  }

  public set suffixSymbol(value: (ChipSymbolGlyphOptions | undefined)) {
    this.__backing_suffixSymbol!.set(value);
  }

  private __backing_suffixSymbolOptions?: IPropRefDecoratedVariable<(ChipSuffixSymbolGlyphOptions | undefined)>;
  public get suffixSymbolOptions(): (ChipSuffixSymbolGlyphOptions | undefined) {
    return this.__backing_suffixSymbolOptions!.get();
  }

  public set suffixSymbolOptions(value: (ChipSuffixSymbolGlyphOptions | undefined)) {
    this.__backing_suffixSymbolOptions!.set(value);
  }

  private __backing_chipNodeBackgroundColor?: IPropRefDecoratedVariable<(ResourceColor | undefined)>;
  public get chipNodeBackgroundColor(): (ResourceColor | undefined) {
    return this.__backing_chipNodeBackgroundColor!.get();
  }

  public set chipNodeBackgroundColor(value: (ResourceColor | undefined)) {
    this.__backing_chipNodeBackgroundColor!.set(value);
  }

  private __backing_chipNodeActivatedBackgroundColor?: IPropRefDecoratedVariable<(ResourceColor | undefined)>;
  public get chipNodeActivatedBackgroundColor(): (ResourceColor | undefined) {
    return this.__backing_chipNodeActivatedBackgroundColor!.get();
  }

  public set chipNodeActivatedBackgroundColor(value: (ResourceColor | undefined)) {
    this.__backing_chipNodeActivatedBackgroundColor!.set(value);
  }

  private __backing_backgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get backgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_backgroundSystemMaterial!.get();
  }

  public set backgroundSystemMaterial(value: (uiMaterial.Material | undefined)) {
    this.__backing_backgroundSystemMaterial!.set(value);
  }

  private __backing_activatedBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public get activatedBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    return this.__backing_activatedBackgroundSystemMaterial!.get();
  }

  public set activatedBackgroundSystemMaterial(value: (uiMaterial.Material | undefined)) {
    this.__backing_activatedBackgroundSystemMaterial!.set(value);
  }

  private __backing_chipNodeRadius?: IPropRefDecoratedVariable<(Dimension | undefined)>;
  public get chipNodeRadius(): (Dimension | undefined) {
    return this.__backing_chipNodeRadius!.get();
  }

  public set chipNodeRadius(value: (Dimension | undefined)) {
    this.__backing_chipNodeRadius!.set(value);
  }

  private __backing_chipEnabled?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public get chipEnabled(): (boolean | undefined) {
    return this.__backing_chipEnabled!.get();
  }

  public set chipEnabled(value: (boolean | undefined)) {
    this.__backing_chipEnabled!.set(value);
  }

  private __backing_chipActivated?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public get chipActivated(): (boolean | undefined) {
    return this.__backing_chipActivated!.get();
  }

  public set chipActivated(value: (boolean | undefined)) {
    this.__backing_chipActivated!.set(value);
  }

  private __backing_chipAccessibilitySelectedType?: IPropRefDecoratedVariable<(AccessibilitySelectedType | undefined)>;
  public get chipAccessibilitySelectedType(): (AccessibilitySelectedType | undefined) {
    return this.__backing_chipAccessibilitySelectedType!.get();
  }

  public set chipAccessibilitySelectedType(value: (AccessibilitySelectedType | undefined)) {
    this.__backing_chipAccessibilitySelectedType!.set(value);
  }

  private __backing_chipAccessibilityDescription?: IPropRefDecoratedVariable<(ResourceStr | undefined)>;
  public get chipAccessibilityDescription(): (ResourceStr | undefined) {
    return this.__backing_chipAccessibilityDescription!.get();
  }

  public set chipAccessibilityDescription(value: (ResourceStr | undefined)) {
    this.__backing_chipAccessibilityDescription!.set(value);
  }

  private __backing_chipAccessibilityLevel?: IPropRefDecoratedVariable<(string | undefined)>;
  public get chipAccessibilityLevel(): (string | undefined) {
    return this.__backing_chipAccessibilityLevel!.get();
  }

  public set chipAccessibilityLevel(value: (string | undefined)) {
    this.__backing_chipAccessibilityLevel!.set(value);
  }

  private __backing_maxFontScale?: IPropRefDecoratedVariable<(number | Resource | undefined)>;
  public get maxFontScale(): (number | Resource | undefined) {
    return this.__backing_maxFontScale!.get();
  }

  public set maxFontScale(value: (number | Resource | undefined)) {
    this.__backing_maxFontScale!.set(value);
  }

  private __backing_minFontScale?: IPropRefDecoratedVariable<(number | Resource | undefined)>;
  public get minFontScale(): (number | Resource | undefined) {
    return this.__backing_minFontScale!.get();
  }

  public set minFontScale(value: (number | Resource | undefined)) {
    this.__backing_minFontScale!.set(value);
  }

  private __backing_chipPadding?: IPropRefDecoratedVariable<(LocalizedPadding | undefined)>;
  public get chipPadding(): (LocalizedPadding | undefined) {
    return this.__backing_chipPadding!.get();
  }

  public set chipPadding(value: (LocalizedPadding | undefined)) {
    this.__backing_chipPadding!.set(value);
  }

  private __backing_chipFontSize?: IPropRefDecoratedVariable<(Dimension | undefined)>;
  public get chipFontSize(): (Dimension | undefined) {
    return this.__backing_chipFontSize!.get();
  }

  public set chipFontSize(value: (Dimension | undefined)) {
    this.__backing_chipFontSize!.set(value);
  }

  private __backing_isChipExist?: IStateDecoratedVariable<boolean>;
  public get isChipExist(): boolean {
    return this.__backing_isChipExist!.get();
  }

  public set isChipExist(value: boolean) {
    this.__backing_isChipExist!.set(value);
  }

  private __backing_chipScale?: IStateDecoratedVariable<ScaleOptions>;
  public get chipScale(): ScaleOptions {
    return this.__backing_chipScale!.get();
  }

  public set chipScale(value: ScaleOptions) {
    this.__backing_chipScale!.set(value);
  }

  private __backing_chipOpacity?: IStateDecoratedVariable<number>;
  public get chipOpacity(): number {
    return this.__backing_chipOpacity!.get();
  }

  public set chipOpacity(value: number) {
    this.__backing_chipOpacity!.set(value);
  }

  private __backing_suffixSymbolHeight?: IStateDecoratedVariable<number>;
  public get suffixSymbolHeight(): number {
    return this.__backing_suffixSymbolHeight!.get();
  }

  public set suffixSymbolHeight(value: number) {
    this.__backing_suffixSymbolHeight!.set(value);
  }

  private __backing_suffixSymbolWidth?: IStateDecoratedVariable<number>;
  public get suffixSymbolWidth(): number {
    return this.__backing_suffixSymbolWidth!.get();
  }

  public set suffixSymbolWidth(value: number) {
    this.__backing_suffixSymbolWidth!.set(value);
  }

  private __backing_breakPoint?: IStateDecoratedVariable<BreakPointsType>;
  public get breakPoint(): BreakPointsType {
    return this.__backing_breakPoint!.get();
  }

  public set breakPoint(value: BreakPointsType) {
    this.__backing_breakPoint!.set(value);
  }

  private __backing_fontSizeScale?: IStateDecoratedVariable<number>;
  public get fontSizeScale(): number {
    return this.__backing_fontSizeScale!.get();
  }

  public set fontSizeScale(value: number) {
    this.__backing_fontSizeScale!.set(value);
  }

  private __backing_useAdaptiveLineHeight?: IStateDecoratedVariable<boolean>;
  public get useAdaptiveLineHeight(): boolean {
    return this.__backing_useAdaptiveLineHeight!.get();
  }

  public set useAdaptiveLineHeight(value: boolean) {
    this.__backing_useAdaptiveLineHeight!.set(value);
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

  private __backing_onClose?: (VoidCallback | undefined);
  public get onClose(): (VoidCallback | undefined) {
    return (this.__backing_onClose as (VoidCallback | undefined));
  }

  public set onClose(value: (VoidCallback | undefined)) {
    this.__backing_onClose = value;
  }

  private __backing_onClicked?: (VoidCallback | undefined);
  public get onClicked(): (VoidCallback | undefined) {
    return (this.__backing_onClicked as (VoidCallback | undefined));
  }

  public set onClicked(value: (VoidCallback | undefined)) {
    this.__backing_onClicked = value;
  }

  private __backing_chipNodeInFocus?: IStateDecoratedVariable<boolean>;
  public get chipNodeInFocus(): boolean {
    return this.__backing_chipNodeInFocus!.get();
  }

  public set chipNodeInFocus(value: boolean) {
    this.__backing_chipNodeInFocus!.set(value);
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

  private __backing_environmentCallback?: EnvironmentCallbackEntry;
  public get environmentCallback(): EnvironmentCallbackEntry {
    return (this.__backing_environmentCallback as EnvironmentCallbackEntry);
  }

  public set environmentCallback(value: EnvironmentCallbackEntry) {
    this.__backing_environmentCallback = value;
  }

  public updateLanguageLineHeight(): void {
    const resourceManager = ({let gensym%%_1 = this.getUIContext().getHostContext();
    (((gensym%%_1) == (null)) ? undefined : gensym%%_1.resourceManager)});
    if (!resourceManager) {
      console.error("[Chip] failed to get resourceManager");
      return;
    }
    try {
      this.useAdaptiveLineHeight = ((resourceManager!.getStringByNameSync("text_fallback_line_spacing")) === ("true"));
    } catch (e) {
      console.error("[Chip] failed to get text_fallback_line_spacing resource");
    }
  }

  public aboutToAppear(): void {
    if (((deviceInfo.sdkApiVersion) >= (26))) {
      this.updateLanguageLineHeight();
      let abilityContext = this.getUIContext().getHostContext();
      if (abilityContext) {
        this.environmentCallbackID = abilityContext.getApplicationContext().onEnvironment(this.environmentCallback);
      }
    }
  }

  public aboutToDisappear(): void {
    if (((((deviceInfo.sdkApiVersion) >= (26))) && (((this.environmentCallbackID) !== (undefined))))) {
      let abilityContext = this.getUIContext().getHostContext();
      if (abilityContext) {
        abilityContext.getApplicationContext().offEnvironment((this.environmentCallbackID as int));
      }
      this.environmentCallbackID = undefined;
    }
  }

  private isSetActiveChipBgColor(): boolean {
    if (this.chipNodeActivatedBackgroundColor) {
      return false;
    }
    try {
      return ((ColorMetrics.resourceColor((this.chipNodeActivatedBackgroundColor as ResourceColor)).color) !== (ColorMetrics.resourceColor((this.theme.chipNode.activatedBackgroundColor as ResourceColor)).color));
    } catch (error) {
      console.error("[Chip] failed to get ColorMetrics.resourceColor");
      return false;
    }
  }

  private isSetNormalChipBgColor(): boolean {
    if (this.chipNodeBackgroundColor) {
      return false;
    }
    try {
      return ((ColorMetrics.resourceColor((this.chipNodeBackgroundColor as ResourceColor)).color) !== (ColorMetrics.resourceColor((this.theme.chipNode.backgroundColor as ResourceColor)).color));
    } catch (error) {
      console.error("[Chip] failed to get resourceColor");
      return false;
    }
  }

  private getBackgroundSystemMaterial(): (uiMaterial.Material | undefined) {
    if (((deviceInfo.sdkApiVersion) < (26))) {
      return undefined;
    }
    if (this.isChipActivated()) {
      return this.activatedBackgroundSystemMaterial;
    }
    return this.backgroundSystemMaterial;
  }

  private getShadowStyles(): (ShadowStyle | undefined) {
    if (!(this.chipNodeInFocus)) {
      return undefined;
    }
    switch (this.resourceToNumber((this.isSmallChipSize() ? this.theme.chipNode.smallShadowStyle : this.theme.chipNode.normalShadowStyle), -1).toInt()) {
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

  ${dumpAnnotation('Memo')}
  public ChipBuilder(): void {
    ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
      instance.setButtonOptions(({
        type: ButtonType.Normal,
      } as ButtonOptions)).clip(false).shadow(this.getShadowStyles()).padding(0).focusable(true).size(this.getChipSize()).enabled(this.isChipEnabled()).direction(this.chipDirection).systemMaterial(this.getBackgroundSystemMaterial()).backgroundColor(this.getChipBackgroundColor()).borderWidth(this.getChipNodeBorderWidth()).borderColor(this.getChipNodeBorderColor()).borderRadius(this.getChipBorderRadius()).responseRegion(this.getChipResponseRegion()).accessibilityGroup(true).accessibilityDescription(this.getAccessibilityDescription()).accessibilityLevel(this.getAccessibilityLevel()).accessibilityChecked(this.getAccessibilityChecked()).accessibilitySelected(this.getAccessibilitySelected()).onClick(this.onClicked).scale(this.chipScale).opacity(this.chipOpacity).onKeyEvent(((event: KeyEvent) => {
        if (((((!event) || (((event.type) === (null))))) || (((event.type) !== (KeyType.Down))))) {
          return false;
        }
        let isDeleteChip = ((event.keyCode) === (KeyCode.KEYCODE_FORWARD_DEL));
        let isEnterDeleteChip = ((((((((event.keyCode) === (KeyCode.KEYCODE_ENTER))) && (((this.allowClose) !== (false))))) && (!(({let gensym%%_5 = this.suffixIcon;
        (((gensym%%_5) == (null)) ? undefined : gensym%%_5.src)}))))) && (this.isSuffixIconFocusStyleCustomized));
        if (((isDeleteChip) || (isEnterDeleteChip))) {
          this.deleteChip();
        }
        return true;
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
      }));
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      FlexImpl(@Memo() ((instance: FlexAttribute): void => {
        instance.setFlexOptions({
          justifyContent: FlexAlign.Center,
          alignItems: ItemAlign.Center,
        }).direction(this.chipDirection).padding(this.getChipPadding()).size(this.getChipSize()).constraintSize(this.getChipConstraintSize());
        instance.applyAttributesFinish();
        return;
      }), @Memo() (() => {
        if (this.hasPrefixSymbol()) {
          SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
            instance.setSymbolGlyphOptions(undefined).fontSize(this.getFontSizeForSymbol()).maxFontScale(this.maxFontScale).minFontScale(this.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.PREFIX_SYMBOL)).flexShrink(0).attributeModifier(this.getPrefixSymbolModifier()).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false);
            instance.applyAttributesFinish();
            return;
          }));
        } else {
          if (({let gensym%%_2 = this.prefixIcon;
          (((gensym%%_2) == (null)) ? undefined : gensym%%_2.src)})) {
            ImageImpl(@Memo() ((instance: ImageAttribute): void => {
              instance.setImageOptions(this.prefixIcon!.src, undefined).direction(this.chipDirection).size(this.getPrefixIconSize()).fillColor(this.getPrefixIconFilledColor()).objectFit(ImageFit.Cover).focusable(false).flexShrink(0).draggable(false);
              instance.applyAttributesFinish();
              return;
            }));
          }
        }
        TextImpl(@Memo() ((instance: TextAttribute): void => {
          instance.setTextOptions(this.getChipText(), undefined).draggable(false).flexShrink(1).focusable(true).maxLines(1).textOverflow({
            overflow: TextOverflow.Ellipsis,
          }).textAlign(TextAlign.Center).direction(this.chipDirection).fontSize(this.getLabelFontSize()).fontColor(this.getLabelFontColor()).fontFamily(this.getLabelFontFamily()).fontWeight(this.getLabelFontWeight()).maxFontScale(this.maxFontScale).minFontScale(this.minFontScale).margin(this.getLabelMargin()).includeFontPadding(this.useAdaptiveLineHeight).fallbackLineSpacing(this.useAdaptiveLineHeight);
          instance.applyAttributesFinish();
          return;
        }), undefined);
        if (this.hasSuffixSymbol()) {
          ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
            instance.setButtonOptions(({
              type: ButtonType.Normal,
            } as ButtonOptions)).onClick(this.getSuffixSymbolAction()).accessibilityText(this.getSuffixSymbolAccessibilityText()).accessibilityDescription(this.getSuffixSymbolAccessibilityDescription()).accessibilityLevel(this.getSuffixSymbolAccessibilityLevel()).flexShrink(0).backgroundColor(Color.Transparent).borderRadius(0).padding(0).stateEffect(false).hoverEffect(HoverEffect.None).focusable(this.isSuffixIconFocusable);
            instance.applyAttributesFinish();
            return;
          }), @Memo() (() => {
            SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
              instance.setSymbolGlyphOptions(undefined).fontSize(this.getFontSizeForSymbol()).maxFontScale(this.maxFontScale).minFontScale(this.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.SUFFIX_SYMBOL)).attributeModifier(this.getSuffixSymbolModifier()).effectStrategy(SymbolEffectStrategy.NONE).symbolEffect(this.symbolEffect, false).symbolEffect(this.symbolEffect, this.theme.defaultSymbol.defaultEffect);
              instance.applyAttributesFinish();
              return;
            }));
          }));
        } else {
          if (({let gensym%%_3 = this.suffixIcon;
          (((gensym%%_3) == (null)) ? undefined : gensym%%_3.src)})) {
            ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
              instance.setButtonOptions(({
                type: ButtonType.Normal,
              } as ButtonOptions)).backgroundColor(Color.Transparent).borderRadius(0).padding(0).flexShrink(0).stateEffect(false).hoverEffect(HoverEffect.None).size(this.getSuffixIconSize()).accessibilityText(this.getSuffixIconAccessibilityText()).accessibilityDescription(this.getSuffixIconAccessibilityDescription()).accessibilityLevel(this.getSuffixIconAccessibilityLevel()).onClick(this.getSuffixIconAction()).focusable(this.isSuffixIconFocusable);
              instance.applyAttributesFinish();
              return;
            }), @Memo() (() => {
              ImageImpl(@Memo() ((instance: ImageAttribute): void => {
                instance.setImageOptions(this.suffixIcon!.src, undefined).direction(this.chipDirection).size(this.getSuffixIconSize()).fillColor(this.getSuffixIconFilledColor()).objectFit(ImageFit.Cover).draggable(false);
                instance.applyAttributesFinish();
                return;
              }));
            }));
          } else {
            if (this.isClosable()) {
              ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
                instance.setButtonOptions(({
                  type: ButtonType.Normal,
                } as ButtonOptions)).backgroundColor(Color.Transparent).borderRadius(0).padding(0).flexShrink(0).stateEffect(false).hoverEffect(HoverEffect.None).accessibilityText(this.getCloseIconAccessibilityText()).accessibilityDescription(this.getCloseIconAccessibilityDescription()).accessibilityLevel(this.getCloseIconAccessibilityLevel()).responseRegion({
                  x: _r(16777216, 10003, "com.example.mock", "entry"),
                  y: _r(16777216, 10003, "com.example.mock", "entry"),
                  width: _r(16777216, 10003, "com.example.mock", "entry"),
                  height: _r(16777216, 10003, "com.example.mock", "entry"),
                }).onClick(((e: ClickEvent) => {
                  if (!(this.isChipEnabled())) {
                    return;
                  }
                  ({let gensym%%_4 = this.onClose;
                  (((gensym%%_4) == (null)) ? undefined : gensym%%_4())});
                  this.deleteChip();
                })).focusable(this.isSuffixIconFocusable);
                instance.applyAttributesFinish();
                return;
              }), @Memo() (() => {
                SymbolGlyphImpl(@Memo() ((instance: SymbolGlyphAttribute): void => {
                  instance.setSymbolGlyphOptions(_r(16777216, 10003, "com.example.mock", "entry")).fontSize(this.getCloseOptionsFontsize()).maxFontScale(this.maxFontScale).minFontScale(this.minFontScale).fontColor(this.getDefaultSymbolColor(IconType.SUFFIX_SYMBOL));
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

  private getSuffixIconAction(): (Callback<ClickEvent> | undefined) {
    if (({let gensym%%_6 = this.suffixIcon;
    (((gensym%%_6) == (null)) ? undefined : gensym%%_6.src)})) {
      if (!(({let gensym%%_7 = this.suffixIcon;
      (((gensym%%_7) == (null)) ? undefined : gensym%%_7.action)}))) {
        return undefined;
      }
      return (() => {
        if (this.isChipEnabled()) {
          ({let gensym%%_9 = ({let gensym%%_8 = this.suffixIcon;
          (((gensym%%_8) == (null)) ? undefined : gensym%%_8.action)});
          (((gensym%%_9) == (null)) ? undefined : gensym%%_9())});
        }
      });
    }
    return undefined;
  }

  private getSuffixIconFilledColor(): ResourceColor {
    if (this.isChipActivated()) {
      return ((({let gensym%%_10 = this.suffixIcon;
      (((gensym%%_10) == (null)) ? undefined : gensym%%_10.activatedFillColor)})) ?? (this.getDefaultActiveIconColor(IconType.PREFIX_ICON)));
    }
    return ((({let gensym%%_11 = this.suffixIcon;
    (((gensym%%_11) == (null)) ? undefined : gensym%%_11.fillColor)})) ?? (this.getDefaultFillIconColor(IconType.SUFFIX_ICON)));
  }

  private getSuffixIconSize(): SizeOptions {
    let suffixIconSize: SizeOptions = {
      width: 0,
      height: 0,
    };
    if ((((((typeof ({let gensym%%_13 = ({let gensym%%_12 = this.suffixIcon;
    (((gensym%%_12) == (null)) ? undefined : gensym%%_12.size)});
    (((gensym%%_13) == (null)) ? undefined : gensym%%_13.width)}))) !== ("undefined"))) && (this.isValidLength((this.suffixIcon!.size!.width as Length))))) {
      suffixIconSize.width = this.suffixIcon!.size!.width;
    } else {
      suffixIconSize.width = (this.isSmallChipSize() ? this.theme.suffixIcon.smallSize.width : this.theme.suffixIcon.normalSize.width);
    }
    if ((((((typeof ({let gensym%%_15 = ({let gensym%%_14 = this.suffixIcon;
    (((gensym%%_14) == (null)) ? undefined : gensym%%_14.size)});
    (((gensym%%_15) == (null)) ? undefined : gensym%%_15.height)}))) !== ("undefined"))) && (this.isValidLength((this.suffixIcon!.size!.height as Length))))) {
      suffixIconSize.height = this.suffixIcon!.size!.height;
    } else {
      suffixIconSize.height = (this.isSmallChipSize() ? this.theme.suffixIcon.smallSize.height : this.theme.suffixIcon.normalSize.height);
    }
    return suffixIconSize;
  }

  private isClosable(): boolean {
    return ((this.allowClose) ?? (true));
  }

  private getSuffixSymbolAction(): (Callback<ClickEvent> | undefined) {
    if ((((typeof ({let gensym%%_16 = this.suffixSymbolOptions;
    (((gensym%%_16) == (null)) ? undefined : gensym%%_16.action)}))) === ("undefined"))) {
      return (() => {
        0;
        return undefined;
      })();
    }
    return (() => {
      if (!(this.isChipEnabled())) {
        return;
      }
      ({let gensym%%_18 = ({let gensym%%_17 = this.suffixSymbolOptions;
      (((gensym%%_17) == (null)) ? undefined : gensym%%_17.action)});
      (((gensym%%_18) == (null)) ? undefined : gensym%%_18())});
    });
  }

  private hasSuffixSymbol(): boolean {
    return !(!(((({let gensym%%_19 = this.suffixSymbol;
    (((gensym%%_19) == (null)) ? undefined : gensym%%_19.normal)})) || (({let gensym%%_20 = this.suffixSymbol;
    (((gensym%%_20) == (null)) ? undefined : gensym%%_20.activated)})))));
  }

  private getPrefixIconFilledColor(): ResourceColor {
    if (this.isChipActivated()) {
      return ((({let gensym%%_21 = this.prefixIcon;
      (((gensym%%_21) == (null)) ? undefined : gensym%%_21.activatedFillColor)})) ?? (this.getDefaultActiveIconColor(IconType.PREFIX_ICON)));
    }
    return ((({let gensym%%_22 = this.prefixIcon;
    (((gensym%%_22) == (null)) ? undefined : gensym%%_22.fillColor)})) ?? (this.getDefaultFillIconColor(IconType.PREFIX_ICON)));
  }

  private getPrefixIconSize(): SizeOptions {
    let prefixIconSize: SizeOptions = {
      width: 0,
      height: 0,
    };
    if ((((((typeof ({let gensym%%_24 = ({let gensym%%_23 = this.prefixIcon;
    (((gensym%%_23) == (null)) ? undefined : gensym%%_23.size)});
    (((gensym%%_24) == (null)) ? undefined : gensym%%_24.width)}))) !== ("undefined"))) && (this.isValidLength((this.prefixIcon!.size!.width as Length))))) {
      prefixIconSize.width = this.prefixIcon!.size!.width;
    } else {
      prefixIconSize.width = (this.isSmallChipSize() ? this.theme.prefixIcon.smallSize.width : this.theme.prefixIcon.normalSize.width);
    }
    if ((((((typeof ({let gensym%%_26 = ({let gensym%%_25 = this.prefixIcon;
    (((gensym%%_25) == (null)) ? undefined : gensym%%_25.size)});
    (((gensym%%_26) == (null)) ? undefined : gensym%%_26.height)}))) !== ("undefined"))) && (this.isValidLength((this.prefixIcon!.size!.height as Length))))) {
      prefixIconSize.height = this.prefixIcon!.size!.height;
    } else {
      prefixIconSize.height = (this.isSmallChipSize() ? this.theme.prefixIcon.smallSize.height : this.theme.prefixIcon.normalSize.height);
    }
    return prefixIconSize;
  }

  private getDefaultSymbolColor(iconType: IconType): Array<ResourceColor> {
    return (this.isChipActivated() ? this.getSymbolActiveColor(iconType) : this.getSymbolFillColor(iconType));
  }

  private getCloseOptionsFontsize(): (Length | Dimension) {
    if (((!(!(({let gensym%%_27 = this.closeOptions;
    (((gensym%%_27) == (null)) ? undefined : gensym%%_27.fontSize)})))) && (this.isValidLength(({let gensym%%_28 = this.closeOptions;
    (((gensym%%_28) == (null)) ? undefined : gensym%%_28.fontSize)}))))) {
      return this.closeOptions!.fontSize!;
    }
    if (((!(!(this.chipFontSize))) && (this.isValidLength(this.chipFontSize)))) {
      return this.chipFontSize!;
    }
    return (this.isSmallChipSize() ? this.theme.defaultSymbol.smallSymbolFontSize : this.theme.defaultSymbol.normalSymbolFontSize);
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

  private hasPrefixSymbol(): boolean {
    return !(!(((({let gensym%%_29 = this.prefixSymbol;
    (((gensym%%_29) == (null)) ? undefined : gensym%%_29.normal)})) || (({let gensym%%_30 = this.prefixSymbol;
    (((gensym%%_30) == (null)) ? undefined : gensym%%_30.activated)})))));
  }

  private getChipConstraintSize(): (ConstraintSizeOptions | undefined) {
    const constraintSize: ConstraintSizeOptions = {};
    if ((((typeof this.chipSize)) === ("string"))) {
      constraintSize.maxWidth = this.getChipMaxWidth();
      constraintSize.minHeight = (((this.chipSize) === (ChipSize.SMALL)) ? this.theme.chipNode.smallHeight : this.theme.chipNode.normalHeight);
    } else {
      if ((((((typeof ({let gensym%%_31 = (this.chipSize as SizeOptions);
      (((gensym%%_31) == (null)) ? undefined : gensym%%_31.width)}))) === ("undefined"))) || (!(this.isValidLength(((this.chipSize as SizeOptions)!.width as Length)))))) {
        constraintSize.maxWidth = this.getChipMaxWidth();
      }
      if ((((((typeof ({let gensym%%_32 = (this.chipSize as SizeOptions);
      (((gensym%%_32) == (null)) ? undefined : gensym%%_32.height)}))) === ("undefined"))) || (!(this.isValidLength(((this.chipSize as SizeOptions)!.height as Length)))))) {
        constraintSize.minHeight = this.theme.chipNode.normalHeight;
      }
    }
    return constraintSize;
  }

  private getChipMaxWidth(): (Length | undefined) {
    if (((this.fontSizeScale) >= (this.theme.chipNode.suitAgeScale))) {
      return (() => {
        0;
        return undefined;
      })();
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
    return (() => {
      0;
      return undefined;
    })();
  }

  private getChipSize(): (SizeOptions | undefined) {
    const chipSize: SizeOptions = {
      width: "auto",
      height: "auto",
    };
    if ((((typeof this.chipSize)) !== ("string"))) {
      if ((((((typeof ({let gensym%%_33 = (this.chipSize as SizeOptions);
      (((gensym%%_33) == (null)) ? undefined : gensym%%_33.width)}))) !== ("undefined"))) && (this.isValidLength(((this.chipSize as SizeOptions)!.width as Length))))) {
        chipSize.width = (this.chipSize as SizeOptions)!.width;
      }
      if ((((((typeof ({let gensym%%_34 = (this.chipSize as SizeOptions);
      (((gensym%%_34) == (null)) ? undefined : gensym%%_34.height)}))) !== ("undefined"))) && (this.isValidLength(((this.chipSize as SizeOptions)!.height as Length))))) {
        chipSize.height = (this.chipSize as SizeOptions)!.height;
      }
    }
    return chipSize;
  }

  private copyPadding(src: LocalizedPadding): LocalizedPadding {
    return ({
      top: src.top,
      bottom: src.bottom,
      start: src.start,
      end: src.end,
    } as LocalizedPadding);
  }

  private getChipPadding(): (Length | Padding | LocalizedPadding) {
    let chipTheme = this.theme.chipNode;
    let res: LocalizedPadding;
    if (this.isSmallChipSize()) {
      res = this.copyPadding(chipTheme.localizedSmallPadding);
    } else {
      res = this.copyPadding(chipTheme.localizedNormalPadding);
    }
    if (((!(!(({let gensym%%_35 = this.chipPadding;
    (((gensym%%_35) == (null)) ? undefined : gensym%%_35.top)})))) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipPadding!.top!)))) {
      res.top = (this.chipPadding!.top! as LengthMetrics);
    }
    if (((({let gensym%%_36 = this.chipPadding;
    (((gensym%%_36) == (null)) ? undefined : gensym%%_36.bottom)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipPadding!.bottom!)))) {
      res.bottom = (this.chipPadding!.bottom! as LengthMetrics);
    }
    if (((({let gensym%%_37 = this.chipPadding;
    (((gensym%%_37) == (null)) ? undefined : gensym%%_37.start)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipPadding!.start!)))) {
      res.start = (this.chipPadding!.start! as LengthMetrics);
    }
    if (((({let gensym%%_38 = this.chipPadding;
    (((gensym%%_38) == (null)) ? undefined : gensym%%_38.end)})) && (LengthMetricsUtils.getInstance().isNaturalNumber(this.chipPadding!.end!)))) {
      res.end = (this.chipPadding!.end! as LengthMetrics);
    }
    return res;
  }

  private getPrefixSymbolModifier(): (SymbolGlyphModifier | undefined) {
      if (this.isChipActivated()) {
        return ({let gensym%%_39 = this.prefixSymbol;
        (((gensym%%_39) == (null)) ? undefined : gensym%%_39.activated)});
      }
      return ({let gensym%%_40 = this.prefixSymbol;
      (((gensym%%_40) == (null)) ? undefined : gensym%%_40.normal)});
    }

  private getLabelMargin(): (Length | Padding | LocalizedPadding) {
    const localizedLabelMargin: LocalizedMargin = {
      start: LengthMetrics.vp(0),
      end: LengthMetrics.vp(0),
    };
    const defaultLocalizedMargin = (this.isSmallChipSize() ? this.theme.label.localizedSmallMargin : this.theme.label.localizedNormalMargin);
    if ((((((typeof ({let gensym%%_42 = ({let gensym%%_41 = this.label;
    (((gensym%%_41) == (null)) ? undefined : gensym%%_41.localizedLabelMargin)});
    (((gensym%%_42) == (null)) ? undefined : gensym%%_42.start)}))) !== ("undefined"))) && (((this.label!.localizedLabelMargin!.start!.value) >= (0))))) {
      localizedLabelMargin.start = this.label!.localizedLabelMargin!.start;
    } else {
      if (this.hasPrefix()) {
        localizedLabelMargin.start = defaultLocalizedMargin.start;
      }
    }
    if ((((((typeof ({let gensym%%_44 = ({let gensym%%_43 = this.label;
    (((gensym%%_43) == (null)) ? undefined : gensym%%_43.localizedLabelMargin)});
    (((gensym%%_44) == (null)) ? undefined : gensym%%_44.end)}))) !== ("undefined"))) && (((this.label!.localizedLabelMargin!.end!.value) >= (0))))) {
      localizedLabelMargin.end = this.label!.localizedLabelMargin!.end;
    } else {
      if (this.hasSuffix()) {
        localizedLabelMargin.end = defaultLocalizedMargin.end;
      }
    }
    if ((((typeof ({let gensym%%_45 = this.label;
    (((gensym%%_45) == (null)) ? undefined : gensym%%_45.localizedLabelMargin)}))) === ("object"))) {
      return localizedLabelMargin;
    }
    if ((((typeof this.label.labelMargin)) === ("object"))) {
      const labelMargin: Margin = {
        left: 0,
        right: 0,
      };
      const defaultLabelMargin: Margin = (this.isSmallChipSize() ? this.theme.label.smallMargin : this.theme.label.normalMargin);
      if ((((((typeof ({let gensym%%_47 = ({let gensym%%_46 = this.label;
      (((gensym%%_46) == (null)) ? undefined : gensym%%_46.labelMargin)});
      (((gensym%%_47) == (null)) ? undefined : gensym%%_47.left)}))) !== ("undefined"))) && (this.isValidLength((this.label!.labelMargin!.left as Length))))) {
        labelMargin.left = this.label!.labelMargin!.left;
      } else {
        if (this.hasPrefix()) {
          labelMargin.left = defaultLabelMargin.left;
        }
      }
      if ((((((typeof ({let gensym%%_49 = ({let gensym%%_48 = this.label;
      (((gensym%%_48) == (null)) ? undefined : gensym%%_48.labelMargin)});
      (((gensym%%_49) == (null)) ? undefined : gensym%%_49.right)}))) !== ("undefined"))) && (this.isValidLength((this.label!.labelMargin!.right as Length))))) {
        labelMargin.right = this.label!.labelMargin!.right;
      } else {
        if (this.hasSuffix()) {
          labelMargin.right = defaultLabelMargin.right;
        }
      }
      return labelMargin;
    }
    return localizedLabelMargin;
  }

  private hasSuffix(): boolean {
    if (({let gensym%%_50 = this.suffixIcon;
    (((gensym%%_50) == (null)) ? undefined : gensym%%_50.src)})) {
      return true;
    }
    return (this.isChipActivated() ? !(!(({let gensym%%_51 = this.suffixSymbol;
    (((gensym%%_51) == (null)) ? undefined : gensym%%_51.activated)}))) : !(!(({let gensym%%_52 = this.suffixSymbol;
    (((gensym%%_52) == (null)) ? undefined : gensym%%_52.normal)}))));
  }

  private hasPrefix(): boolean {
    if (({let gensym%%_53 = this.prefixIcon;
    (((gensym%%_53) == (null)) ? undefined : gensym%%_53.src)})) {
      return true;
    }
    return (this.isChipActivated() ? !(!(({let gensym%%_54 = this.prefixSymbol;
    (((gensym%%_54) == (null)) ? undefined : gensym%%_54.activated)}))) : !(!(({let gensym%%_55 = this.prefixSymbol;
    (((gensym%%_55) == (null)) ? undefined : gensym%%_55.normal)}))));
  }

  private getLabelFontWeight(): (string | int | FontWeight) {
    if (this.isChipActivated()) {
      return FontWeight.Medium;
    }
    switch (this.resourceToNumber(this.theme.label.fontWeight, FontWeight.Regular).toInt()) {
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

  private getLabelFontFamily(): ResourceStr {
    return ((({let gensym%%_56 = this.label;
    (((gensym%%_56) == (null)) ? undefined : gensym%%_56.fontFamily)})) ?? (this.theme.label.fontFamily));
  }

  private getFontSizeForSymbol(): (Length | Dimension) {
    if (((!(!(this.chipFontSize))) && (this.isValidLength(this.chipFontSize)))) {
      return this.chipFontSize!;
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
    return this.theme.chipNode.defaultBorderWidth;
  }

  private getLabelFontColor(): ResourceColor {
    if (this.isChipActivated()) {
      return ((({let gensym%%_57 = this.label;
      (((gensym%%_57) == (null)) ? undefined : gensym%%_57.activatedFontColor)})) ?? (this.getActiveFontColor()));
    }
    return ((({let gensym%%_58 = this.label;
    (((gensym%%_58) == (null)) ? undefined : gensym%%_58.fontColor)})) ?? (this.getFontColor()));
  }

  private getLabelFontSize(): Dimension {
    if (((!(!(this.label.fontSize))) && (this.isValidLength(this.label!.fontSize!)))) {
      return (this.label!.fontSize! as Dimension);
    }
    if (((!(!(this.chipFontSize))) && (this.isValidLength(this.chipFontSize!)))) {
      return this.chipFontSize!;
    }
    if (this.isSmallChipSize()) {
      return (this.useAdaptiveLineHeight ? this.theme.label.adaptiveItemFontSize : this.theme.label.smallFontSize);
    }
    return (this.useAdaptiveLineHeight ? this.theme.label.adaptiveItemFontSize : this.theme.label.normalFontSize);
  }

  private getChipText(): ResourceStr {
    return ((({let gensym%%_59 = this.label;
    (((gensym%%_59) == (null)) ? undefined : gensym%%_59.text)})) ?? (""));
  }

  private deleteChip() {
    ({let gensym%%_60 = this.getUIContext();
    (((gensym%%_60) == (null)) ? undefined : gensym%%_60.animateTo({
      curve: Curve.Sharp,
      duration: 150,
    }, (() => {
      this.chipOpacity = 0;
    })))});
    ({let gensym%%_61 = this.getUIContext();
    (((gensym%%_61) == (null)) ? undefined : gensym%%_61.animateTo({
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
    })))});
  }

  private isChipEnabled(): boolean {
    return ((this.chipEnabled) ?? (true));
  }

  private getChipBorderRadius(): Dimension {
    if ((((typeof this.chipNodeRadius)) !== ("undefined"))) {
      return (this!.chipNodeRadius as Dimension);
    }
    return (this.isSmallChipSize() ? this.theme.chipNode.smallBorderRadius : this.theme.chipNode.normalBorderRadius);
  }

  private isSmallChipSize() {
    return (((((typeof this.chipSize)) === ("string"))) && (((this.chipSize) === (ChipSize.SMALL))));
  }

  private getChipBackgroundColor(): ResourceColor {
    let themeChipNode = this.theme.chipNode;
    if (this.isChipActivated()) {
      return (((this.chipNodeInFocus) && (!(this.isSetActiveChipBgColor()))) ? themeChipNode.focusActivatedBgColor : this.getColor(this.chipNodeActivatedBackgroundColor, themeChipNode.activatedBackgroundColor));
    }
    return (((this.chipNodeInFocus) && (!(this.isSetNormalChipBgColor()))) ? themeChipNode.focusBgColor : this.getColor(this.chipNodeBackgroundColor, this.theme.chipNode.backgroundColor));
  }

  private getColor(color: (ResourceColor | undefined), defaultColor: ResourceColor): ResourceColor {
    if (!color) {
      return defaultColor;
    }
    try {
      ColorMetrics.resourceColor(color).color;
      return color;
    } catch (e) {
      console.error("[Chip] failed to get color");
      return Color.Transparent;
    }
  }

  private getCloseIconAccessibilityLevel(): string {
    const level = ({let gensym%%_62 = this.closeOptions;
    (((gensym%%_62) == (null)) ? undefined : gensym%%_62.accessibilityLevel)});
    if (((((level) === ("no"))) || (((level) === ("no-hide-descendants"))))) {
      return level!;
    }
    return "yes";
  }

  private getCloseIconAccessibilityDescription(): string {
    return resolveResourceStr(({let gensym%%_63 = this.closeOptions;
    (((gensym%%_63) == (null)) ? undefined : gensym%%_63.accessibilityDescription)}));
  }

  private getCloseIconAccessibilityText(): string {
    if ((((typeof ({let gensym%%_64 = this.closeOptions;
    (((gensym%%_64) == (null)) ? undefined : gensym%%_64.accessibilityText)}))) === ("undefined"))) {
      return resolveResourceStr(_r(16777216, 10003, "com.example.mock", "entry"));
    }
    return resolveResourceStr(({let gensym%%_65 = this.closeOptions;
    (((gensym%%_65) == (null)) ? undefined : gensym%%_65.accessibilityText)}));
  }

  private getSuffixIconAccessibilityLevel(): string {
    const level = ({let gensym%%_66 = this.suffixIcon;
    (((gensym%%_66) == (null)) ? undefined : gensym%%_66.accessibilityLevel)});
    if (((((level) === ("no"))) || (((level) === ("no-hide-descendants"))))) {
      return level!;
    }
    return (({let gensym%%_67 = this.suffixIcon;
    (((gensym%%_67) == (null)) ? undefined : gensym%%_67.action)}) ? "yes" : "no");
  }

  private getSuffixIconAccessibilityDescription(): string {
    return resolveResourceStr(({let gensym%%_68 = this.suffixIcon;
    (((gensym%%_68) == (null)) ? undefined : gensym%%_68.accessibilityDescription)}));
  }

  private getSuffixIconAccessibilityText(): string {
    return resolveResourceStr(({let gensym%%_69 = this.suffixIcon;
    (((gensym%%_69) == (null)) ? undefined : gensym%%_69.accessibilityText)}));
  }

  private getSuffixSymbolAccessibilityLevel(): string {
    if (this.isChipActivated()) {
      const level = ({let gensym%%_71 = ({let gensym%%_70 = this.suffixSymbolOptions;
      (((gensym%%_70) == (null)) ? undefined : gensym%%_70.activatedAccessibility)});
      (((gensym%%_71) == (null)) ? undefined : gensym%%_71.accessibilityLevel)});
      if (((((level) === ("no"))) || (((level) === ("no-hide-descendants"))))) {
        return level!;
      }
      return (({let gensym%%_72 = this.suffixSymbolOptions;
      (((gensym%%_72) == (null)) ? undefined : gensym%%_72.action)}) ? "yes" : "no");
    }
    const level = ({let gensym%%_74 = ({let gensym%%_73 = this.suffixSymbolOptions;
    (((gensym%%_73) == (null)) ? undefined : gensym%%_73.normalAccessibility)});
    (((gensym%%_74) == (null)) ? undefined : gensym%%_74.accessibilityLevel)});
    if (((((level) === ("no"))) || (((level) === ("no-hide-descendants"))))) {
      return level!;
    }
    return (({let gensym%%_75 = this.suffixSymbolOptions;
    (((gensym%%_75) == (null)) ? undefined : gensym%%_75.action)}) ? "yes" : "no");
  }

  private getSuffixSymbolAccessibilityDescription(): string {
    if (this.isChipActivated()) {
      return resolveResourceStr(({let gensym%%_77 = ({let gensym%%_76 = this.suffixSymbolOptions;
      (((gensym%%_76) == (null)) ? undefined : gensym%%_76.activatedAccessibility)});
      (((gensym%%_77) == (null)) ? undefined : gensym%%_77.accessibilityDescription)}));
    }
    return resolveResourceStr(({let gensym%%_79 = ({let gensym%%_78 = this.suffixSymbolOptions;
    (((gensym%%_78) == (null)) ? undefined : gensym%%_78.normalAccessibility)});
    (((gensym%%_79) == (null)) ? undefined : gensym%%_79.accessibilityDescription)}));
  }

  private getSuffixSymbolAccessibilityText(): string {
    if (this.isChipActivated()) {
      return resolveResourceStr(({let gensym%%_81 = ({let gensym%%_80 = this.suffixSymbolOptions;
      (((gensym%%_80) == (null)) ? undefined : gensym%%_80.activatedAccessibility)});
      (((gensym%%_81) == (null)) ? undefined : gensym%%_81.accessibilityText)}));
    }
    return resolveResourceStr(({let gensym%%_83 = ({let gensym%%_82 = this.suffixSymbolOptions;
    (((gensym%%_82) == (null)) ? undefined : gensym%%_82.normalAccessibility)});
    (((gensym%%_83) == (null)) ? undefined : gensym%%_83.accessibilityText)}));
  }

  private getSuffixSymbolModifier(): (SymbolGlyphModifier | undefined) {
    if (this.isChipActivated()) {
      return ({let gensym%%_84 = this.suffixSymbol;
      (((gensym%%_84) == (null)) ? undefined : gensym%%_84.activated)});
    }
    return ({let gensym%%_85 = this.suffixSymbol;
    (((gensym%%_85) == (null)) ? undefined : gensym%%_85.normal)});
  }

  private getAccessibilityChecked(): (boolean | undefined) {
    if (((this.getChipAccessibilitySelectedType()) === (AccessibilitySelectedType.CHECKED))) {
      return this.isChipActivated();
    }
    return undefined;
  }

  private getAccessibilitySelected(): (boolean | undefined) {
    if (((this.getChipAccessibilitySelectedType()) === (AccessibilitySelectedType.SELECTED))) {
      return this.isChipActivated();
    }
    return undefined;
  }

  private getChipAccessibilitySelectedType(): AccessibilitySelectedType {
    if ((((typeof this.chipActivated)) === ("undefined"))) {
      return AccessibilitySelectedType.CLICKED;
    }
    return ((this.chipAccessibilitySelectedType) ?? (AccessibilitySelectedType.CHECKED));
  }

  private getAccessibilityLevel(): (string | undefined) {
    return this.chipAccessibilityLevel;
  }

  private getAccessibilityDescription(): string {
    return resolveResourceStr(this.chipAccessibilityDescription);
  }

  private isChipActivated() {
    return ((this.chipActivated) ?? (false));
  }

  private resourceToNumber(resource: Resource, defaultValue: number): number {
    if (((!resource) || (!(resource.type)))) {
      console.error("[Chip] failed: resource get fail");
      return defaultValue;
    }
    const resourceManager = ({let gensym%%_86 = this.getUIContext().getHostContext();
    (((gensym%%_86) == (null)) ? undefined : gensym%%_86.resourceManager)});
    if (!resourceManager) {
      console.error("[Chip] failed to get resourceManager");
      return defaultValue;
    }
    if (((((({let gensym%%_88 = ({let gensym%%_87 = resource;
    (((gensym%%_87) == (null)) ? undefined : gensym%%_87.type)});
    (((gensym%%_88) == (null)) ? undefined : gensym%%_88.toInt())})) === (RESOURCE_TYPE_FLOAT))) || (((({let gensym%%_90 = ({let gensym%%_89 = resource;
    (((gensym%%_89) == (null)) ? undefined : gensym%%_89.type)});
    (((gensym%%_90) == (null)) ? undefined : gensym%%_90.toInt())})) === (RESOURCE_TYPE_INTEGER))))) {
      try {
        if (((resource.id) !== (-1))) {
          return resourceManager.getDouble(resource.id);
        }
        return resourceManager.getDoubleByName((resource.params![0] as string).split(".")[2]);
      } catch (error) {
        console.error("[Chip] get resource error, return defaultValue");
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  }

  private isValidLength(length: (Length | Dimension | undefined)): boolean {
    if (((length) === (undefined))) {
      return false;
    }
    if ((((typeof length)) === ("number"))) {
      return (((length as number)) >= (0));
    } else {
      if ((((typeof length)) === ("string"))) {
        return this.isValidLengthString((length as string));
      } else {
        if ((((typeof length)) === ("object"))) {
          const resource = (length as Resource);
          const resourceManager = ({let gensym%%_91 = this.getUIContext().getHostContext();
          (((gensym%%_91) == (null)) ? undefined : gensym%%_91.resourceManager)});
          if (!resourceManager) {
            console.error("[Chip] failed to get resourceManager.");
            return false;
          }
          if (((((({let gensym%%_93 = ({let gensym%%_92 = resource;
          (((gensym%%_92) == (null)) ? undefined : gensym%%_92.type)});
          (((gensym%%_93) == (null)) ? undefined : gensym%%_93.toInt())})) === (RESOURCE_TYPE_FLOAT))) || (((({let gensym%%_95 = ({let gensym%%_94 = resource;
          (((gensym%%_94) == (null)) ? undefined : gensym%%_94.type)});
          (((gensym%%_95) == (null)) ? undefined : gensym%%_95.toInt())})) === (RESOURCE_TYPE_INTEGER))))) {
            return ((resourceManager.getDouble(resource.id)) >= (0));
          } else {
            if (((({let gensym%%_97 = ({let gensym%%_96 = resource;
            (((gensym%%_96) == (null)) ? undefined : gensym%%_96.type)});
            (((gensym%%_97) == (null)) ? undefined : gensym%%_97.toInt())})) === (RESOURCE_TYPE_STRING))) {
              let stringValue: string = "";
              try {
                stringValue = resourceManager.getStringSync(resource.id);
              } catch (err) {
                stringValue = "";
              }
              return this.isValidLengthString(stringValue);
            } else {
              return false;
            }
          }
        }
      }
    }
    return false;
  }

  private isValidLengthString(length: string): boolean {
    const matches = length.match(new RegExp("(-?\\d+(?:\\.\\d+)?)_?(fp|vp|px|lpx)?$", "i"));
    if (((!matches) || (((matches.length) < (3))))) {
      return false;
    }
    return ((parseInt((matches[1] as string))) >= (0));
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

  private getChipHeight(): double {
    let height: Length;
    if ((((typeof this.chipSize)) !== ("string"))) {
      const chipSize = (this.chipSize as SizeOptions);
      if ((((((typeof ({let gensym%%_98 = chipSize;
      (((gensym%%_98) == (null)) ? undefined : gensym%%_98.height)}))) !== ("undefined"))) && (this.isValidLength(chipSize.height)))) {
        height = chipSize.height!;
      } else {
        height = this.theme.chipNode.normalHeight;
      }
    } else {
      if (((this.chipSize) === (ChipSize.SMALL))) {
        height = this.theme.chipNode.smallHeight;
      } else {
        height = this.theme.chipNode.normalHeight;
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

  ${dumpAnnotation('Memo')}
  public build(): void {
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

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

  static {

  }
}

@Component() class __Options_ChipComponent {
  public theme?: ChipTheme;
  public __options_has_theme?: boolean;
  @PropRef() public chipSize?: (ChipSize | SizeOptions | undefined);
  public __backing_chipSize?: IPropRefDecoratedVariable<(ChipSize | SizeOptions | undefined)>;
  public __options_has_chipSize?: boolean;
  @PropRef() public allowClose?: (boolean | undefined);
  public __backing_allowClose?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public __options_has_allowClose?: boolean;
  @PropRef() public closeOptions?: (CloseOptions | undefined);
  public __backing_closeOptions?: IPropRefDecoratedVariable<(CloseOptions | undefined)>;
  public __options_has_closeOptions?: boolean;
  @PropRef() public prefixSymbol?: (ChipSymbolGlyphOptions | undefined);
  public __backing_prefixSymbol?: IPropRefDecoratedVariable<(ChipSymbolGlyphOptions | undefined)>;
  public __options_has_prefixSymbol?: boolean;
  @PropRef() public chipDirection?: (Direction | undefined);
  public __backing_chipDirection?: IPropRefDecoratedVariable<(Direction | undefined)>;
  public __options_has_chipDirection?: boolean;
  @PropRef() public prefixIcon?: (PrefixIconOptions | undefined);
  public __backing_prefixIcon?: IPropRefDecoratedVariable<(PrefixIconOptions | undefined)>;
  public __options_has_prefixIcon?: boolean;
  @Require() @PropRef() public label: LabelOptions;
  public __backing_label?: IPropRefDecoratedVariable<LabelOptions>;
  public __options_has_label?: boolean;
  @PropRef() public suffixIcon?: (SuffixIconOptions | undefined);
  public __backing_suffixIcon?: IPropRefDecoratedVariable<(SuffixIconOptions | undefined)>;
  public __options_has_suffixIcon?: boolean;
  @PropRef() public suffixSymbol?: (ChipSymbolGlyphOptions | undefined);
  public __backing_suffixSymbol?: IPropRefDecoratedVariable<(ChipSymbolGlyphOptions | undefined)>;
  public __options_has_suffixSymbol?: boolean;
  @PropRef() public suffixSymbolOptions?: (ChipSuffixSymbolGlyphOptions | undefined);
  public __backing_suffixSymbolOptions?: IPropRefDecoratedVariable<(ChipSuffixSymbolGlyphOptions | undefined)>;
  public __options_has_suffixSymbolOptions?: boolean;
  @PropRef() public chipNodeBackgroundColor?: (ResourceColor | undefined);
  public __backing_chipNodeBackgroundColor?: IPropRefDecoratedVariable<(ResourceColor | undefined)>;
  public __options_has_chipNodeBackgroundColor?: boolean;
  @PropRef() public chipNodeActivatedBackgroundColor?: (ResourceColor | undefined);
  public __backing_chipNodeActivatedBackgroundColor?: IPropRefDecoratedVariable<(ResourceColor | undefined)>;
  public __options_has_chipNodeActivatedBackgroundColor?: boolean;
  @PropRef() public backgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_backgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_backgroundSystemMaterial?: boolean;
  @PropRef() public activatedBackgroundSystemMaterial?: (uiMaterial.Material | undefined);
  public __backing_activatedBackgroundSystemMaterial?: IPropRefDecoratedVariable<(uiMaterial.Material | undefined)>;
  public __options_has_activatedBackgroundSystemMaterial?: boolean;
  @PropRef() public chipNodeRadius?: (Dimension | undefined);
  public __backing_chipNodeRadius?: IPropRefDecoratedVariable<(Dimension | undefined)>;
  public __options_has_chipNodeRadius?: boolean;
  @PropRef() public chipEnabled?: (boolean | undefined);
  public __backing_chipEnabled?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public __options_has_chipEnabled?: boolean;
  @PropRef() public chipActivated?: (boolean | undefined);
  public __backing_chipActivated?: IPropRefDecoratedVariable<(boolean | undefined)>;
  public __options_has_chipActivated?: boolean;
  @PropRef() public chipAccessibilitySelectedType?: (AccessibilitySelectedType | undefined);
  public __backing_chipAccessibilitySelectedType?: IPropRefDecoratedVariable<(AccessibilitySelectedType | undefined)>;
  public __options_has_chipAccessibilitySelectedType?: boolean;
  @PropRef() public chipAccessibilityDescription?: (ResourceStr | undefined);
  public __backing_chipAccessibilityDescription?: IPropRefDecoratedVariable<(ResourceStr | undefined)>;
  public __options_has_chipAccessibilityDescription?: boolean;
  @PropRef() public chipAccessibilityLevel?: (string | undefined);
  public __backing_chipAccessibilityLevel?: IPropRefDecoratedVariable<(string | undefined)>;
  public __options_has_chipAccessibilityLevel?: boolean;
  @PropRef() public maxFontScale?: (number | Resource | undefined);
  public __backing_maxFontScale?: IPropRefDecoratedVariable<(number | Resource | undefined)>;
  public __options_has_maxFontScale?: boolean;
  @PropRef() public minFontScale?: (number | Resource | undefined);
  public __backing_minFontScale?: IPropRefDecoratedVariable<(number | Resource | undefined)>;
  public __options_has_minFontScale?: boolean;
  @PropRef() public chipPadding?: (LocalizedPadding | undefined);
  public __backing_chipPadding?: IPropRefDecoratedVariable<(LocalizedPadding | undefined)>;
  public __options_has_chipPadding?: boolean;
  @PropRef() public chipFontSize?: (Dimension | undefined);
  public __backing_chipFontSize?: IPropRefDecoratedVariable<(Dimension | undefined)>;
  public __options_has_chipFontSize?: boolean;
  @State() public isChipExist?: boolean;
  public __backing_isChipExist?: IStateDecoratedVariable<boolean>;
  public __options_has_isChipExist?: boolean;
  @State() public chipScale?: ScaleOptions;
  public __backing_chipScale?: IStateDecoratedVariable<ScaleOptions>;
  public __options_has_chipScale?: boolean;
  @State() public chipOpacity?: number;
  public __backing_chipOpacity?: IStateDecoratedVariable<number>;
  public __options_has_chipOpacity?: boolean;
  @State() public suffixSymbolHeight?: number;
  public __backing_suffixSymbolHeight?: IStateDecoratedVariable<number>;
  public __options_has_suffixSymbolHeight?: boolean;
  @State() public suffixSymbolWidth?: number;
  public __backing_suffixSymbolWidth?: IStateDecoratedVariable<number>;
  public __options_has_suffixSymbolWidth?: boolean;
  @State() public breakPoint?: BreakPointsType;
  public __backing_breakPoint?: IStateDecoratedVariable<BreakPointsType>;
  public __options_has_breakPoint?: boolean;
  @State() public fontSizeScale?: number;
  public __backing_fontSizeScale?: IStateDecoratedVariable<number>;
  public __options_has_fontSizeScale?: boolean;
  @State() public useAdaptiveLineHeight?: boolean;
  public __backing_useAdaptiveLineHeight?: IStateDecoratedVariable<boolean>;
  public __options_has_useAdaptiveLineHeight?: boolean;
  public isSuffixIconFocusStyleCustomized?: boolean;
  public __options_has_isSuffixIconFocusStyleCustomized?: boolean;
  public isSuffixIconFocusable?: boolean;
  public __options_has_isSuffixIconFocusable?: boolean;
  public onClose?: (VoidCallback | undefined);
  public __options_has_onClose?: boolean;
  public onClicked?: (VoidCallback | undefined);
  public __options_has_onClicked?: boolean;
  @State() public chipNodeInFocus?: boolean;
  public __backing_chipNodeInFocus?: IStateDecoratedVariable<boolean>;
  public __options_has_chipNodeInFocus?: boolean;
  public symbolEffect?: SymbolEffect;
  public __options_has_symbolEffect?: boolean;
  public environmentCallbackID?: (int | undefined);
  public __options_has_environmentCallbackID?: boolean;
  public environmentCallback?: EnvironmentCallbackEntry;
  public __options_has_environmentCallback?: boolean;
  public constructor() {}

}


`;

function testChipUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform advanced-ui-components mock-chip',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testChipUITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
