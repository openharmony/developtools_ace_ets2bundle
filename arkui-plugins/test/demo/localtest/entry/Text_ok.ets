/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement.runtime"
import { Resource } from "@ohos.arkui.external.resource"
import { StyledString } from "@ohos.arkui.component.styledString"
import { CommonMethod, ComponentBuilder } from "@ohos.arkui.component.common"
import { ResourceColor, Length } from "@ohos.arkui.component.units"

export declare class TextController {
    closeSelectionMenu(): void;
    setStyledString(value: StyledString): void;

    // getLayoutManager(): LayoutManager;
}

export declare interface TextOptions {
    controller: TextController;
}

export declare interface TextAttribute extends CommonMethod {
    // @memo
    // font(value: Font, options?: FontSettingOptions): this;
    @memo
    fontColor(value: ResourceColor): this;
    @memo
    fontSize(value: number | string | Resource): this;
    @memo
    minFontSize(value: number | string | Resource): this;
    @memo
    maxFontSize(value: number | string | Resource): this;
    @memo
    minFontScale(scale: number | Resource): this;
    @memo
    maxFontScale(scale: number | Resource): this;
    // @memo
    // fontStyle(value: FontStyle): this;
    // @memo
    // fontWeight(value: number | FontWeight | string): this;
    // @memo
    // fontWeight(weight: number | FontWeight | string, options?: FontSettingOptions): this;
    // @memo
    // lineSpacing(value: LengthMetrics): this;
    // @memo
    // textAlign(value: TextAlign): this;
    @memo
    lineHeight(value: number | string | Resource): this;
    // @memo
    // textOverflow(options: TextOverflowOptions): this;
    @memo
    fontFamily(value: string | Resource): this;
    @memo
    maxLines(value: number): this;
    // @memo
    // decoration(value: DecorationStyleInterface): this;
    @memo
    letterSpacing(value: number | string): this;
    // @memo
    // textCase(value: TextCase): this;
    @memo
    baselineOffset(value: number | string): this;
    // @memo
    // copyOption(value: CopyOptions): this;
    @memo
    draggable(value: boolean): this;
    // @memo
    // textShadow(value: ShadowOptions | Array<ShadowOptions>): this;
    // @memo
    // heightAdaptivePolicy(value: TextHeightAdaptivePolicy): this;
    @memo
    textIndent(value: Length): this;
    // @memo
    // wordBreak(value: WordBreak): this;
    // @memo
    // lineBreakStrategy(strategy: LineBreakStrategy): this;
    @memo
    onCopy(callback: (value: string) => void): this;
    @memo
    selection(selectionStart: number, selectionEnd: number): this;
    @memo
    caretColor(color: ResourceColor): this;
    @memo
    selectedBackgroundColor(color: ResourceColor): this;
    // @memo
    // ellipsisMode(value: EllipsisMode): this;
    @memo
    enableDataDetector(enable: boolean): this;
    // @memo
    // dataDetectorConfig(config: TextDataDetectorConfig): this;
    // @memo
    // bindSelectionMenu(spanType: TextSpanType, content: CustomBuilder, responseType: TextResponseType,
    //   options?: SelectionMenuOptions): this;
    @memo
    onTextSelectionChange(callback: (selectionStart: number, selectionEnd: number) => void): this;
    @memo
    fontFeature(value: string): this;
    // @memo
    // marqueeOptions(options: Optional<TextMarqueeOptions>): this;
    // @memo
    // onMarqueeStateChange(callback: Callback<MarqueeState>): this;
    @memo
    privacySensitive(supported: boolean): this;
    // @memo
    // textSelectable(mode: TextSelectableMode): this;
    // @memo
    // editMenuOptions(editMenu: EditMenuOptions): this;
    @memo
    halfLeading(halfLeading: boolean): this;
    @memo
    enableHapticFeedback(isEnabled: boolean): this;
}

@memo
@ComponentBuilder
export declare function Text (
    value?: string | Resource,
    options?: TextOptions,
    @memo
    content?: () => void
): TextAttribute;