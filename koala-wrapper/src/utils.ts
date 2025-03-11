/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function throwError(error: string): never {
    throw new Error(error)
}

export function withWarning<T>(value: T, message: string): T {
    console.warn(message)
    return value
}

export function isNumber(value: any): value is number {
    return typeof value === `number`
}

function replacePercentOutsideStrings(code: string): string  {
    const stringPattern = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const percentPattern = /(?<!["'`])(%)(?![\d\s])/g;
    const strings = code.match(stringPattern) || [];

    let placeholderCounter = 0;
    const placeholderMap = new Map<string, string>();
    strings.forEach((string) => {
        const placeholder = `__STRING_PLACEHOLDER_${placeholderCounter++}__`;
        placeholderMap.set(placeholder, string);
        code = code.replace(string, placeholder);
    });

    code = code.replace(percentPattern, '_');

    placeholderMap.forEach((originalString, placeholder) => {
        code = code.replace(new RegExp(placeholder, 'g'), originalString);
    });
  
    return code;
}
  
function replaceIllegalHashes(code: string): string {
    const stringPattern = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const strings = code.match(stringPattern) || [];

    let placeholderCounter = 0;
    const placeholderMap = new Map<string, string>();
    strings.forEach((string) => {
        const placeholder = `__STRING_PLACEHOLDER_${placeholderCounter++}__`;
        placeholderMap.set(placeholder, string);
        code = code.replace(string, placeholder);
    });

    code = code.replace(/#/g, '_');

    placeholderMap.forEach((originalString, placeholder) => {
        code = code.replace(new RegExp(placeholder, 'g'), originalString);
    });

    return code;
}

/*
    TODO:
     The lowerings insert %% and other special symbols into names of temporary variables.
     Until we keep feeding ast dumps back to the parser this function is needed.
 */
export function filterSource(text: string): string {
    const filtered = replaceIllegalHashes(replacePercentOutsideStrings(text))
        .replaceAll("<cctor>", "_cctor_")

    return filtered
}
