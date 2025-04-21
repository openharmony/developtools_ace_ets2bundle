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

import { PluginTestContext, PluginTester } from '../../utils/plugin-tester';
import { annotation } from '../../../common/arkts-utils';
import * as arkts from '@koalaui/libarkts';

const pluginTester = new PluginTester('test arkts-utils');

function testAnnotation(this: PluginTestContext): void {
    const anno: arkts.AnnotationUsage = annotation('State');
    expect(arkts.isAnnotationUsage(anno)).toBeTruthy();
    expect(anno.dumpSrc()).toBe('@State() ');
}

pluginTester.run(
    'annotation',
    [],
    {
        parsed: [testAnnotation],
        checked: [testAnnotation],
    },
    {
        stopAfter: 'checked',
    },
    {
        beforeEach: [
            () => {
                jest.spyOn(console, 'warn').mockImplementation(() => {});
            },
        ],
        afterEach: [
            () => {
                jest.spyOn(console, 'warn').mockRestore();
            },
        ],
    }
);
