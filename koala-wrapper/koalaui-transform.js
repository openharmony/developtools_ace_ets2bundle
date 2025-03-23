/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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


module.exports = function (babel) {
    const { types: t } = babel;

    function replacePath(source) {
        if (source) {
            const sourceValue = source.value;
            const prefix = '@koalaui/';
            if (sourceValue.startsWith(prefix)) {
                source.value = '#koalaui/' + sourceValue.slice(prefix.length);
            }
        }
    }

    return {
        visitor: {
            ImportDeclaration(path) {
                const source = path.node.source;
                replacePath(source);
            },
            ExportNamedDeclaration(path) {
                const source = path.node.source;
                replacePath(source);
            },
            ExportAllDeclaration(path) {
                const source = path.node.source;
                replacePath(source);
            }
        }
    };
};    