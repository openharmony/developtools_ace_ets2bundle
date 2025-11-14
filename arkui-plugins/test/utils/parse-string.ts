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

enum LookingFor {
    ERROR = 'Plugin error',
    WARNING = 'Plugin warning'
}

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

/**
 * Extracts error or warning blocks from build logs.
 * @param {string} logs - Raw build output logs
 * @param {LookingFor} lookingFor - Type of message to extract (LookingFor.ERROR or LookingFor.WARNING)
 * @returns {string[]} Array of extracted message blocks with file positions
 */
function extractErrorWarningBlocks(logs: string, lookingFor: LookingFor): string[] {
    const POSITION_PATTERN = /\[[^\]]*:\d+\s*[: ,]?\s*\d+\]/;

    const normalizeLine = (rawLine: string): string => {
        return rawLine
            .replace(/\r/g, '')
            .replace(/['']/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    };

    const hasPositionInfo = (line: string): boolean => {
        return POSITION_PATTERN.test(line);
    };

    const isBlockStart = (line: string): boolean => {
        return line.startsWith(`${lookingFor}:`);
    };

    const lines = logs.split(/\r?\n/);
    const blocks: string[] = [];
    let currentBlock: string[] = [];
    let isCollectingBlock = false;

    for (const rawLine of lines) {
        const line = normalizeLine(rawLine);

        if (isBlockStart(line)) {
            if (currentBlock.length > 0) {
                blocks.push(currentBlock.join(' '));
                currentBlock = [];
            }
            currentBlock.push(line);
            if (hasPositionInfo(line)) {
                blocks.push(currentBlock.join(' '));
                currentBlock = [];
                isCollectingBlock = false;
            } else {
                isCollectingBlock = true;
            }
            continue;
        }

        if (isCollectingBlock) {
            currentBlock.push(line);
            if (hasPositionInfo(line)) {
                blocks.push(currentBlock.join(' '));
                currentBlock = [];
                isCollectingBlock = false;
            }
        }
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join(' '));
    }
    return blocks.map(block => block.trim());
}

export { parseDumpSrc, filterSource, cleanCopyRight, removeSpaceAndReturn, replaceWithRandomNumber,
    extractErrorWarningBlocks, LookingFor
 };
