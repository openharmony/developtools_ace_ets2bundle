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

import { DecoratorNames } from '../../common/predefines';
import { 
    BaseMethodTranslator, 
    MethodCacheTranslator, 
    MethodCacheTranslatorOptions, 
    MethodTranslator, 
    MethodTranslatorOptions 
} from './base';
import { hasDecorator } from './utils';
import {
    ComponentLifecycleCache,
    LifecycleMethodType,
    LifecycleMethodInfo
} from './cache/componentLifecycleCache';
import { StructMethodInfo } from '../../collectors/ui-collectors/records';

/**
 * Maps lifecycle decorators to their corresponding lifecycle method types.
 */
const LIFECYCLE_DECORATOR_TYPE = new Map<DecoratorNames, LifecycleMethodType>([
    [DecoratorNames.COMPONENT_INIT, LifecycleMethodType.ABOUT_TO_APPEAR],
    [DecoratorNames.COMPONENT_APPEAR, LifecycleMethodType.ABOUT_TO_APPEAR],
    [DecoratorNames.COMPONENT_BUILT, LifecycleMethodType.ON_DID_BUILD],
    [DecoratorNames.COMPONENT_DISAPPEAR, LifecycleMethodType.ABOUT_TO_DISAPPEAR],
    [DecoratorNames.COMPONENT_REUSE, LifecycleMethodType.ABOUT_TO_REUSE],
    [DecoratorNames.COMPONENT_RECYCLE, LifecycleMethodType.ABOUT_TO_RECYCLE],
]);

function collectLifecycleMethods(
    this: BaseMethodTranslator,
    structName: string,
    methodName: string,
    matchedDecorators: Map<DecoratorNames, LifecycleMethodType>
): void {
    if (matchedDecorators.has(DecoratorNames.COMPONENT_INIT)) {
        ComponentLifecycleCache.getInstance().collectInitMethod(structName, methodName);
    }

    for (const [decorator, lifecycleType] of matchedDecorators) {
        if (decorator !== DecoratorNames.COMPONENT_INIT && methodName !== lifecycleType) {
            // Standard lifecycle methods (e.g., aboutToAppear) are skipped - framework handles them
            collectLifecycleMethod.bind(this)(structName, methodName, lifecycleType);
        }
    }
}

function collectLifecycleMethod(
    this: BaseMethodTranslator,
    structName: string,
    methodName: string, 
    lifecycleType: LifecycleMethodType
): void {
    const params = this.method.scriptFunction.params as arkts.ETSParameterExpression[];
    const hasReuseParam =
        lifecycleType === LifecycleMethodType.ABOUT_TO_REUSE && params.length > 0;

    const methodInfo: LifecycleMethodInfo = {
        methodName,
        methodType: lifecycleType,
        hasReuseParam,
        reuseParams: hasReuseParam ? params : undefined,
    };

    ComponentLifecycleCache.getInstance().collectLifecycleMethod(structName, methodInfo);
}

export class ComponentLifecycleTranslator extends MethodTranslator {
    constructor(options: MethodTranslatorOptions) {
        super(options);
    }

    translateMember(): arkts.AstNode[] {
        if (this.isDecl) {
            return [this.method];
        }
        const methodName: string = this.method.name.name;
        if (this.classInfo.isFromStruct) {
            const structName: string = this.classInfo.className;
            // A method can have multiple lifecycle decorators - find all matches
            const matchedDecorators = this.findMatchingLifecycleDecorators();
            collectLifecycleMethods.bind(this)(structName, methodName, matchedDecorators);
        }
        return [this.method];
    }

    protected findMatchingLifecycleDecorators(): Map<DecoratorNames, LifecycleMethodType> {
        const matched = new Map<DecoratorNames, LifecycleMethodType>();
        for (const [decorator, lifecycleType] of LIFECYCLE_DECORATOR_TYPE) {
            if (hasDecorator(this.method, decorator)) {
                matched.set(decorator, lifecycleType);
            }
        }
        return matched;
    }
}

export interface ComponentLifecycleCacheTranslatorOptions extends MethodCacheTranslatorOptions {
    methodInfo: StructMethodInfo
}

export class ComponentLifecycleCacheTranslator extends MethodCacheTranslator {
    protected methodInfo: StructMethodInfo = {};

    constructor(options: ComponentLifecycleCacheTranslatorOptions) {
        super(options);
        this.methodInfo = options.methodInfo;
    }

    translateMember(): arkts.AstNode[] {
        if (this.isDecl) {
            return [this.method];
        }
        const methodName: string | undefined = this.methodInfo.name;
        if (methodName !== undefined && !!this.methodInfo.structInfo?.name) {
            const structName: string = this.methodInfo.structInfo.name;
            // A method can have multiple lifecycle decorators - find all matches
            const matchedDecorators = this.findMatchingLifecycleDecorators(this.methodInfo);
            collectLifecycleMethods.bind(this)(structName, methodName, matchedDecorators);
        }
        return [this.method];
    }
    
    protected findMatchingLifecycleDecorators(
        methodInfo: StructMethodInfo
    ): Map<DecoratorNames, LifecycleMethodType> {
        const matched = new Map<DecoratorNames, LifecycleMethodType>();
        if (methodInfo.annotationInfo === undefined) {
            return matched;
        }
        for (const [decorator, lifecycleType] of LIFECYCLE_DECORATOR_TYPE) {
            if (methodInfo.annotationInfo[`has${decorator}`]) {
                matched.set(decorator, lifecycleType);
            }
        }
        return matched;
    }
}