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
    let _str: string = str;
    _str = cleanCopyRight(_str);
    _str = removeSpaceAndReturn(_str);
    _str = replaceWithRandomNumber(_str);

    return _str;
}

function filterSource(text: string): string {
    const filtered: string = text.replaceAll(/%/g, '_').replaceAll(/#/g, '_').replaceAll('<cctor>', '_cctor_');

    return filtered;
}

function cleanCopyRight(str: string): string {
    const copyrightBlockRegex = /(?:\/\*.*Copyright \([c|C]\) [- \d]+ [\w ]+\., Ltd\..*\*\/)/gs;

    return str.replace(copyrightBlockRegex, '');
}

function removeSpaceAndReturn(str: string): string {
    const spaceAndReturnRegex = /^[\s\r]+/gm;

    return str.replace(spaceAndReturnRegex, '').trim();
}

function replaceWithRandomNumber(text: string): string {
    return text
        .replace(/(?<=__memo_id[\)+]?\s?\+\s?[\(+]?)\d+/g, () => '<some_random_number>')
        .replace(/(?<=gensym[_%]+)\d+/g, () => '<some_random_number>');
}

export { parseDumpSrc, filterSource, cleanCopyRight, removeSpaceAndReturn, replaceWithRandomNumber };
