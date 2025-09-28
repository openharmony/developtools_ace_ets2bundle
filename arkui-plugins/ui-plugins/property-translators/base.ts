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
import { collectStateManagementTypeImport, createGetter, createSetter } from './utils';
import { CustomComponentInfo, ClassInfo } from '../utils';
import { StateManagementTypes } from '../../common/predefines';
import { ClassScopeInfo } from '../struct-translators/utils';
import { logDiagnostic, getPropertyType } from '../interop/initstatevar';
import { getHasAnnotationObserved } from '../interop/interop';

export interface PropertyTranslatorOptions {
    property: arkts.ClassProperty;
    structInfo: CustomComponentInfo;
}

export abstract class PropertyTranslator {
    protected property: arkts.ClassProperty;
    protected structInfo: CustomComponentInfo;
    protected propertyType: arkts.TypeNode | undefined;
    protected isMemoCached?: boolean;

    constructor(options: PropertyTranslatorOptions) {
        this.property = options.property;
        this.structInfo = options.structInfo;
        this.checkObservedWhenInterop(options.property, options.structInfo);
        this.propertyType = options.property.typeAnnotation;
        this.isMemoCached = arkts.NodeCache.getInstance().has(options.property);
    }

    checkObservedWhenInterop(property: arkts.ClassProperty, structInfo: CustomComponentInfo): void {
        if (structInfo.annotations.component) {
            const isObservedV2From1_1 = getHasAnnotationObserved(property, 'ObservedV2');
            if (isObservedV2From1_1) {
                let decoratorType = 'regular';
                property?.annotations?.some((annotations) => (decoratorType = getPropertyType(annotations)));
                const errorMessage = `The type of the ${decoratorType} property can not be a class decorated with @ObservedV2 when interop`;
                logDiagnostic(errorMessage, property);
            }
        }
        if (structInfo.annotations.componentV2) {
            const isObservedFrom1_1 = getHasAnnotationObserved(property, 'Observed');
            if (isObservedFrom1_1) {
                let decoratorType = 'regular';
                property?.annotations?.some((annotations) => (decoratorType = getPropertyType(annotations)));
                const errorMessage = `The type of the ${decoratorType} property can not be a class decorated with @Observed when interop`;
                logDiagnostic(errorMessage, property);
            }
        }
    }

    abstract translateMember(): arkts.AstNode[];

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.MemberExpression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        left: arkts.MemberExpression
    ): arkts.MethodDefinition {
        const right: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(StateManagementTypes.OBSERVABLE_PROXY),
            undefined,
            [arkts.factory.createIdentifier('value')]
        );
        collectStateManagementTypeImport(StateManagementTypes.OBSERVABLE_PROXY);
        return createSetter(originalName, typeAnnotation, left, right);
    }
}

export abstract class MethodTranslator {
    protected method: arkts.MethodDefinition;
    protected classInfo: ClassInfo;
    protected returnType: arkts.TypeNode | undefined;

    constructor(method: arkts.MethodDefinition, classInfo: ClassInfo) {
        this.method = method;
        this.classInfo = classInfo;
        this.returnType = this.method.scriptFunction.returnTypeAnnotation?.clone();
    }

    abstract translateMember(): arkts.AstNode[];
}

export abstract class ObservedPropertyTranslator {
    protected property: arkts.ClassProperty;
    protected classScopeInfo: ClassScopeInfo;
    protected propertyType: arkts.TypeNode | undefined;

    constructor(property: arkts.ClassProperty, classScopeInfo: ClassScopeInfo) {
        this.property = property;
        this.classScopeInfo = classScopeInfo;
        this.propertyType = property.typeAnnotation;
    }

    abstract translateMember(): arkts.AstNode[];
    abstract createField(originalName: string, newName: string): arkts.ClassProperty[];
}

export type InterfacePropertyTypes = arkts.MethodDefinition | arkts.ClassProperty;

export interface InterfacePropertyTranslatorOptions<T extends InterfacePropertyTypes> {
    property: T;
}

export abstract class InterfacePropertyTranslator<T extends InterfacePropertyTypes = InterfacePropertyTypes>
    implements InterfacePropertyTranslatorOptions<T>
{
    property: T;

    modified: boolean;

    constructor(options: InterfacePropertyTranslatorOptions<T>) {
        this.property = options.property;
        this.modified = false;
    }

    abstract translateProperty(): T;

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        return false;
    }
}
