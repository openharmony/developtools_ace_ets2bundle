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
import { checkIsTrailingLambdaInLastParam, isNavigationOrNavDestination } from '../utils';
import {
    collectTypeRecordFromParameter,
    collectTypeRecordFromTypeParameterDeclaration,
    collectTypeRecordFromTypeParameterInstantiation,
    ParameterRecord,
    TypeParameterTypeRecord,
    TypeRecord,
} from '../../../collectors/utils/collect-types';
import { factory as builderLambdaFactory } from '../factory';


export interface ComponentRecord {
    name: string;
    attributeRecords: ParameterRecord[];
    typeParameters?: TypeParameterTypeRecord[];
    hasRestParameter?: boolean;
    hasReceiver?: boolean;
    hasLastTrailingLambda?: boolean;
}

export class ComponentAttributeCache {
    private _cache: Map<string, ComponentRecord>;
    private _attributeName: string | undefined;
    private _attributeTypeParams: TypeRecord[] | undefined;
    private _isCollected: boolean = false;
    private static instance: ComponentAttributeCache;

    private constructor() {
        this._cache = new Map<string, ComponentRecord>();
    }

    static getInstance(): ComponentAttributeCache {
        if (!this.instance) {
            this.instance = new ComponentAttributeCache();
        }
        return this.instance;
    }

    private collectAttributeName(type: arkts.TypeNode | undefined): string | undefined {
        if (
            !type ||
            !arkts.isETSTypeReference(type) ||
            !type.part ||
            !type.part.name ||
            !arkts.isIdentifier(type.part.name)
        ) {
            return;
        }
        this._attributeName = type.part.name.name;
        if (type.part.typeParams) {
            this._attributeTypeParams = collectTypeRecordFromTypeParameterInstantiation(type.part.typeParams);
        }
    }

    get attributeName(): string | undefined {
        return this._attributeName;
    }

    get attributeTypeParams(): TypeRecord[] | undefined {
        return this._attributeTypeParams;
    }

    reset(): void {
        this._cache.clear();
        this._attributeName = undefined;
        this._attributeTypeParams = undefined;
        this._isCollected = false;
    }

    isCollected(): boolean {
        return this._isCollected;
    }

    collect(node: arkts.MethodDefinition): void {
        this.collectAttributeName(node.scriptFunction.returnTypeAnnotation);
        if (!this._attributeName) {
            return;
        }
        const name: string = node.name.name;
        const hasRestParameter = node.scriptFunction.hasRestParameter;
        const hasReceiver = node.scriptFunction.hasReceiver;
        const typeParameters = collectTypeRecordFromTypeParameterDeclaration(node.scriptFunction.typeParams);
        const params = node.scriptFunction.params as arkts.ETSParameterExpression[];
        const attributeRecords: ParameterRecord[] = [];
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        params.forEach((p, index) => {
            if (isNavigationOrNavDestination(name) && index === params.length - 1) {
                const record = collectTypeRecordFromParameter(builderLambdaFactory.createModuleInfoParam(name));
                attributeRecords.push(record);
            }
            if (index === params.length - 1 && hasLastTrailingLambda) {
                return;
            }
            const record = collectTypeRecordFromParameter(p);
            attributeRecords.push(record);
        });
        const componentRecord: ComponentRecord = {
            name,
            attributeRecords,
            typeParameters,
            hasRestParameter,
            hasReceiver,
            hasLastTrailingLambda,
        };
        this._cache.set(name, componentRecord);
        this._isCollected = true;
    }

    getComponentRecord(name: string): ComponentRecord | undefined {
        return this._cache.get(name);
    }

    getAllComponentRecords(): ComponentRecord[] {
        return Array.from(this._cache.values());
    }
}