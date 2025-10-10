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

import * as arkts from '@koalaui/libarkts';

import { expectName } from '../../common/arkts-utils';
import { StateManagementTypes } from '../../common/predefines';
import { monitorField } from '../utils';
import { collectStateManagementTypeImport, getValueInMonitorAnnotation } from './utils';
import { MethodTranslator } from './base';
import { InitializerConstructor } from './types';
import { factory as UIFactory } from '../ui-factory';
import { MonitorCache, MonitorInfo } from './cache/monitorCache';

export class MonitorTranslator extends MethodTranslator implements InitializerConstructor {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.method.name);
        const newName: string = monitorField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const monitorItem: string[] | undefined = getValueInMonitorAnnotation(
            this.method.scriptFunction.annotations
        );
        const monitorPathsStr: string = !!monitorItem ? monitorItem.join(',') : '';
        const monitorInfo: MonitorInfo = {
            monitorItem: monitorItem,
            originalName: originalName,
            newName: newName,
            isFromStruct: this.classInfo.isFromStruct
        };
        MonitorCache.getInstance().collectMonitors(this.classInfo.className, monitorPathsStr, monitorInfo);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        collectStateManagementTypeImport(StateManagementTypes.MONITOR_DECORATED);
        const field: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            undefined,
            arkts.factory.createUnionType([
                UIFactory.createTypeReferenceFromString(StateManagementTypes.MONITOR_DECORATED),
                arkts.factory.createETSUndefinedType(),
            ]),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );

        return [field];
    }
}
