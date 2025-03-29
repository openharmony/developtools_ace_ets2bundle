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

export declare class StyledString {
    constructor(value: string /*| ImageAttachment | CustomSpan, styles?: Array<StyleOptions>*/);

    readonly length: number;

    getString(): string;
    // getStyles(start: number, length: number, styledKey?: StyledStringKey): Array<SpanStyle>;
    equals(other: StyledString): boolean;
    subStyledString(start: number, length?: number): StyledString;

    static fromHtml(html: string): Promise<StyledString>;
    static toHtml(styledString: StyledString): string;
    // static marshalling(styledString: StyledString, callback: StyledStringMarshallCallback): ArrayBuffer;
    // static unmarshalling(buffer: ArrayBuffer, callback: StyledStringUnmarshallCallback): Promise<StyledString>;
    // static marshalling(styledString: StyledString): ArrayBuffer;
    // static unmarshalling(buffer: ArrayBuffer): Promise<StyledString>;
}