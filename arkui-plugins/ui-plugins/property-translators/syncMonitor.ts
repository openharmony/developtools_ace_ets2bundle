/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { checkIsStructMethodFromInfo } from '../../collectors/ui-collectors/utils';
import { syncMonitorField } from '../utils';
import { collectStateManagementTypeImport, getValueInSyncMonitorAnnotation } from './utils';
import { BaseMethodTranslator, MethodCacheTranslator, MethodTranslator } from './base';
import { factory as UIFactory } from '../ui-factory';
import { SyncMonitorCache, SyncMonitorInfo } from './cache/syncMonitorCache';
import { PropertyCache } from './cache/propertyCache';
import { factory } from './factory';

function fieldWithSyncMonitorMethod(
    this: BaseMethodTranslator,
    newName: string,
    originalName?: string
): arkts.ClassProperty {
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
    return field;
}

function syncMonitorInfo(
    this: BaseMethodTranslator,
    newName: string,
    originalName: string,
    isFromStruct: boolean,
    paramsLength: number
): SyncMonitorInfo {
    const monitorItem: string[] | undefined = getValueInSyncMonitorAnnotation(this.method.scriptFunction.annotations);
    const syncMonitorInfo: SyncMonitorInfo = {
        monitorItem: monitorItem,
        originalName: originalName,
        newName: newName,
        isFromStruct,
        paramsLength
    };
    return syncMonitorInfo;
}

function resetOnReuseWithSyncMonitorMethod(
    this: BaseMethodTranslator,
    newName: string
): arkts.ExpressionStatement {
    return factory.createResetOnReuseStmt(newName);
}

export interface ISyncMonitorTranslator {
    field(newName: string, originalName?: string): arkts.ClassProperty;
    resetOnReuse(newName: string): arkts.ExpressionStatement;
    syncMonitorInfo(newName: string, originalName: string): SyncMonitorInfo;
}

export class SyncMonitorTranslator extends MethodTranslator implements ISyncMonitorTranslator {
    field(newName: string, originalName?: string): arkts.ClassProperty {
        return fieldWithSyncMonitorMethod.bind(this)(newName, originalName);
    }

    resetOnReuse(newName: string): arkts.ExpressionStatement {
        return resetOnReuseWithSyncMonitorMethod.bind(this)(newName);
    }

    syncMonitorInfo(newName: string, originalName: string): SyncMonitorInfo {
        return syncMonitorInfo.bind(this)(
            newName,
            originalName,
            this.classInfo.isFromStruct,
            this.method.scriptFunction.params.length
        );
    }

    translateMember(): arkts.AstNode[] {
        if (this.isDecl) {
            return [this.method];
        }
        const originalName: string = expectName(this.method.name);
        const newName: string = syncMonitorField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const info: SyncMonitorInfo = this.syncMonitorInfo(newName, originalName);
        const monitorPathsStr: string = !!info.monitorItem ? info.monitorItem.join(',') : '';
        SyncMonitorCache.getInstance().collectSyncMonitors(this.classInfo.className, monitorPathsStr, info);
        const resetStateVars: arkts.AstNode = this.resetOnReuse(newName);
        PropertyCache.getInstance().collectResetStateVars(this.classInfo.className, [resetStateVars]);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = this.field(newName, originalName);
        return [field];
    }
}

export class SyncMonitorCacheTranslator extends MethodCacheTranslator implements ISyncMonitorTranslator {
    field(newName: string, originalName?: string): arkts.ClassProperty {
        return fieldWithSyncMonitorMethod.bind(this)(newName, originalName);
    }

    resetOnReuse(newName: string): arkts.ExpressionStatement {
        return resetOnReuseWithSyncMonitorMethod.bind(this)(newName);
    }

    syncMonitorInfo(newName: string, originalName: string): SyncMonitorInfo {
        const isFromStruct = checkIsStructMethodFromInfo(this.methodInfo);
        return syncMonitorInfo.bind(this)(newName, originalName, isFromStruct, this.method.scriptFunction.params.length);
    }

    translateMember(): arkts.AstNode[] {
        if (this.isDecl) {
            return [this.method];
        }
        const originalName: string = this.methodInfo.name!;
        const newName: string = syncMonitorField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const info: SyncMonitorInfo = this.syncMonitorInfo(newName, originalName);
        const monitorPathsStr: string = !!info.monitorItem ? info.monitorItem.join(',') : '';
        let className: string;
        if (checkIsStructMethodFromInfo(this.methodInfo)) {
            className = this.methodInfo.structInfo?.name!;
        } else {
            className = this.methodInfo.classInfo?.name!;
        }
        SyncMonitorCache.getInstance().collectSyncMonitors(className, monitorPathsStr, info);
        const resetStateVars: arkts.AstNode = this.resetOnReuse(newName);
        PropertyCache.getInstance().collectResetStateVars(className, [resetStateVars]);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = this.field(newName, originalName);
        return [field, this.method];
    }
}
