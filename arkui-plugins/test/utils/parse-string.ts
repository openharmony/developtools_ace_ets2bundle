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

function parseDumpSrc(str: string): string {
    let _str: string = filterSource(str);
    _str = cleanCopyRight(_str);
    _str = removeSpaceAndReturn(_str);

    return _str;
}

function filterSource(text: string): string {
    const filtered: string = text.replaceAll(/%/g, '_').replaceAll(/#/g, '_').replaceAll('<cctor>', '_cctor_');

    return filtered;
}

function cleanCopyRight(str: string): string {
    const copyrightBlockRegex = /(?:\/\*.*Copyright \(c\) [- \d]+ Huawei Device Co\., Ltd\..*\*\/)/gs;

    return str.replace(copyrightBlockRegex, '');
}

function removeSpaceAndReturn(str: string): string {
    const spaceAndReturnRegex = /^[\s\r]+/gm;

    return str.replace(spaceAndReturnRegex, '');
}

export { parseDumpSrc, filterSource, cleanCopyRight, removeSpaceAndReturn };
