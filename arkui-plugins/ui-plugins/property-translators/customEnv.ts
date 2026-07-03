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

import { DecoratorNames, StateManagementTypes } from '../../common/predefines';
import {
    generateThisBacking,
} from './utils';
import {
    BasePropertyTranslator,
    InnerClassPropertyCachedTranslator,
    InnerClassPropertyTypes,
    PropertyCachedTranslator,
    PropertyCachedTranslatorOptions,
} from './base';
import { factory } from './factory';
import { CustomComponentInnerClassPropertyInfo } from '../../collectors/ui-collectors/records';
import { getValueInObjectAnnotation } from '../utils';

function getCustomEnvKey(property: arkts.ClassProperty): arkts.Expression | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = property.annotations;
    for (const anno of annotations) {
        if (
            anno.expr &&
            arkts.isIdentifier(anno.expr) &&
            anno.expr.name === DecoratorNames.CUSTOM_ENV
        ) {
            const envKeyExpr = getValueInObjectAnnotation(anno, DecoratorNames.CUSTOM_ENV, 'value');
            if (envKeyExpr && arkts.isStringLiteral(envKeyExpr)) {
                return arkts.factory.createIdentifier(envKeyExpr.str);
            }
            return undefined;
        }
    }
    return undefined;
}

function initializeStructWithCustomEnvProperty(
    this: BasePropertyTranslator,
    newName: string,
    originalName: string,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.Statement | undefined {
    if (!this.stateManagementType || !this.makeType) {
        return undefined;
    }
    const envKey: arkts.Expression | undefined = getCustomEnvKey(this.property);
    if (!envKey) {
        return undefined;
    }
    const args: arkts.Expression[] = [
        envKey,
        arkts.factory.createStringLiteral(originalName),
        this.property.value?.clone() ?? arkts.factory.createUndefinedLiteral(),
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

export class CustomEnvCachedTranslator extends PropertyCachedTranslator {
    protected stateManagementType: StateManagementTypes = StateManagementTypes.CUSTOM_ENV_DECORATED;
    protected makeType: StateManagementTypes = StateManagementTypes.MAKE_CUSTOM_ENV;
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
            isWatched
        };
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return initializeStructWithCustomEnvProperty.bind(this)(newName, originalName, metadata);
    }
}

export class CustomEnvCachedInnerClassTranslator<
    T extends InnerClassPropertyTypes,
> extends InnerClassPropertyCachedTranslator<T> {
    protected decorator: DecoratorNames = DecoratorNames.CUSTOM_ENV;

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInnerClassPropertyInfo
    ): node is InnerClassPropertyTypes {
        return !!metadata?.name?.startsWith(StateManagementTypes.BACKING) && !!metadata.annotationInfo?.hasCustomEnv;
    }
}
