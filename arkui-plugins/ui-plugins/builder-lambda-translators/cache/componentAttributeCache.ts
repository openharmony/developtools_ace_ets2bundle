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
import {
    collectTypeRecordFromParameter,
    collectTypeRecordFromTypeParameterDeclaration,
    collectTypeRecordFromTypeParameterInstantiation,
    ParameterRecord,
    TypeParameterTypeRecord,
    TypeRecord,
} from '../../../collectors/utils/collect-types';
import { factory as BuilderLambdaFactory } from '../factory';
import { checkIsTrailingLambdaInLastParam, isNavigationOrNavDestination } from '../utils';
import { expectNameInTypeReference } from '../../utils';

export interface ComponentRecord {
    name: string;
    paramRecords: ParameterRecord[];
    typeParameters?: TypeParameterTypeRecord[];
    hasRestParameter?: boolean;
    hasReceiver?: boolean;
    hasLastTrailingLambda?: boolean;
}

interface ComponentAttributeInfo {
    name: string;
    typeParams?: TypeRecord[];
}

/**
 * find attribute info from component method
 */
function findAttributeInfoFromComponentMethod(component: arkts.MethodDefinition): ComponentAttributeInfo | undefined {
    const type = component.scriptFunction.returnTypeAnnotation;
    const name = expectNameInTypeReference(type);
    if (!name) {
        return;
    }
    return {
        name: name.name,
        typeParams: collectTypeRecordFromTypeParameterInstantiation(
            (name.parent as arkts.ETSTypeReferencePart).typeParams
        ),
    };
}

export class ComponentAttributeCache {
    private _cache: Map<string, ComponentRecord[]>;
    private _componentNames: Set<string>;
    private _attributeNameMap: Record<string, string>;
    private _attributeTypeParamsMap: Record<string, TypeRecord[]>;
    private _isCollected: boolean = false;
    private static instance: ComponentAttributeCache;

    private constructor() {
        this._cache = new Map<string, ComponentRecord[]>();
        this._componentNames = new Set();
        this._attributeNameMap = {};
        this._attributeTypeParamsMap = {};
    }

    static getInstance(): ComponentAttributeCache {
        if (!this.instance) {
            this.instance = new ComponentAttributeCache();
        }
        return this.instance;
    }

    private collectComponentRecord(name: string, record: ComponentRecord): void {
        const colelctedRecords: ComponentRecord[] = this._cache.get(name) ?? [];
        colelctedRecords.push(record);
        this._cache.set(name, colelctedRecords);
    }

    private collectAttributeName(name: string, attributeName: string): void {
        const collectedNames: string = this._attributeNameMap[name] ?? attributeName;
        this._attributeNameMap[name] = collectedNames;
    }

    private collectAttributeTypeParams(name: string, attributeTypeParams: TypeRecord[] | undefined): void {
        if (!attributeTypeParams) {
            return;
        }
        const collectedTypeParams: TypeRecord[] = this._attributeTypeParamsMap[name] ?? attributeTypeParams;
        this._attributeTypeParamsMap[name] = collectedTypeParams;
    }

    reset(): void {
        this._cache.clear();
        this._componentNames.clear();
        this._attributeNameMap = {};
        this._attributeTypeParamsMap = {};
        this._isCollected = false;
    }

    isCollected(): boolean {
        return this._isCollected;
    }

    hasComponentName(name: string): boolean {
        return this._componentNames.has(name);
    }

    collect(node: arkts.MethodDefinition): void {
        const attributeInfo = findAttributeInfoFromComponentMethod(node);
        if (!attributeInfo) {
            return;
        }
        const name: string = node.name.name;
        const func = node.scriptFunction;
        const hasRestParameter = func.hasRestParameter;
        const hasReceiver = func.hasReceiver;
        const typeParameters = collectTypeRecordFromTypeParameterDeclaration(func.typeParams);
        const params = func.params as arkts.ETSParameterExpression[];
        const paramRecords: ParameterRecord[] = [];
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        params.forEach((p, index) => {
            if (isNavigationOrNavDestination(name) && index === params.length - 1) {
                const record = collectTypeRecordFromParameter(BuilderLambdaFactory.createModuleInfoParam(name));
                paramRecords.push(record);
            }
            if (index === params.length - 1 && hasLastTrailingLambda) {
                return;
            }
            const record = collectTypeRecordFromParameter(p);
            paramRecords.push(record);
        });
        const componentRecord: ComponentRecord = {
            name,
            paramRecords,
            typeParameters,
            hasRestParameter,
            hasReceiver,
            hasLastTrailingLambda,
        };
        this.collectComponentRecord(name, componentRecord);
        this.collectAttributeName(name, attributeInfo.name);
        this.collectAttributeTypeParams(name, attributeInfo.typeParams);
        this._componentNames.add(name);
        this._isCollected = true;
    }

    getComponentRecord(name: string): ComponentRecord[] | undefined {
        return this._cache.get(name);
    }

    getAttributeName(name: string): string | undefined {
        return this._attributeNameMap[name];
    }

    getAttributeTypeParams(name: string): TypeRecord[] | undefined {
        return this._attributeTypeParamsMap[name];
    }

    getAllComponentNames(): string[] {
        return Array.from(this._componentNames.values());
    }
}
