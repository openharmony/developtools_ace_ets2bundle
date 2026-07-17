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

import { backingField, expectName, flatVisitMethodWithOverloads } from '../../common/arkts-utils';
import { DecoratorNames, GetSetTypes, StateManagementTypes, NodeCacheNames, ARKUI_STATE_MANAGEMENT_DECORATOR_SOURCE_NAME, ENV_KEY_STRING_PATTERN } from '../../common/predefines';
import {
    generateToRecord,
    createGetter,
    generateThisBacking,
    generateGetOrSetCall,
    getValueInAnnotation,
    hasDecorator,
    findCachedMemoMetadata,
    getValueInEnvAnnotation,
    EnvOptions,
    checkIsNameStartWithBackingField,
    checkIsPropertyCanBeNonNull
} from './utils';
import { 
    BasePropertyTranslator, 
    InnerClassPropertyCachedTranslator, 
    InnerClassPropertyTranslator, 
    InnerClassPropertyTypes, 
    PropertyCachedTranslator, 
    PropertyCachedTranslatorOptions, 
    PropertyTranslator, 
    PropertyTranslatorOptions 
} from './base';
// import { GetterSetter, InitializerConstructor } from './types';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { CustomComponentInnerClassPropertyInfo } from 'collectors/ui-collectors/records';
import { ImportCollector } from '../../common/import-collector';
import { AstNodeCacheValueMetadata } from '../../common/node-cache';

function initializeStructWithEnvProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const options: EnvOptions | undefined = getValueInEnvAnnotation(this.property);
    if (!options) {
        return undefined;
    }
    let envValue = options.envValue;
    if (envValue && arkts.isStringLiteral(envValue)) {
        if (!ENV_KEY_STRING_PATTERN.test(envValue.str)) {
            return undefined;
        }
        const parts: string[] = envValue.str.split('.');
        envValue = factory.stringLiteralToMemberExpression(envValue);
        ImportCollector.getInstance().collectSource(parts[0], ARKUI_STATE_MANAGEMENT_DECORATOR_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(parts[0]);
    }
    const args: arkts.Expression[] = [
        envValue!,
        arkts.factory.createStringLiteral(originalName)
    ];
    if (this.initializeOptions?.isWatched) {
        const watchFuncProperty = factory.addWatchFuncProperty('watchFunc', this.property);
        if (watchFuncProperty) {
            args.push(arkts.factory.createObjectExpression([watchFuncProperty]));
        }
    }
    const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
        generateThisBacking(newName),
        factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
    );
    return arkts.factory.createExpressionStatement(assign);
}

/**
 * @deprecated
 */
export class EnvTranslator extends PropertyTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.ENV_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_ENV;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = false;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.initializeOptions = {
            shouldCheckNonNull: false
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithEnvProperty.bind(this)(newName, originalName, metadata);
    }
}

export class EnvCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.ENV_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_ENV;
    protected shouldWrapPropertyType: boolean = true;
    protected hasInitializeStruct: boolean = true;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = true;
    protected hasSetter: boolean = false;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        const isWatched = this.propertyInfo.annotationInfo?.hasWatch;
        this.initializeOptions = {
            shouldCheckNonNull: false,
            isWatched
        };
        this.initializeOptions.canDefinitelyBeNonNull = checkIsPropertyCanBeNonNull(
            this.property,
            this.initializeOptions
        );
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithEnvProperty.bind(this)(newName, originalName, metadata);
    }
}

/**
 * @deprecated
 */
export class EnvInnerClassTranslator<T extends InnerClassPropertyTypes> extends InnerClassPropertyTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.ENV;

    /**
     * @deprecated
     */
    static canBeTranslated(node: arkts.AstNode): node is InnerClassPropertyTypes {
        if (arkts.isMethodDefinition(node)) {
            return checkIsNameStartWithBackingField(node.id) && hasDecorator(node, DecoratorNames.ENV);
        } else if (arkts.isClassProperty(node)) {
            return checkIsNameStartWithBackingField(node.key) && hasDecorator(node, DecoratorNames.ENV);
        }
        return false;
    }
}

export class EnvCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.ENV;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasEnv;
    }
}
