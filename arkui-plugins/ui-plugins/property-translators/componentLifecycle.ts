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
import { ClassInfo } from '../utils';
import { MethodTranslator } from './base';
import { hasDecorator } from './utils';
import {
    ComponentLifecycleCache,
    LifecycleMethodType,
    LifecycleMethodInfo
} from './cache/componentLifecycleCache';

interface MethodCollectionHandler {
    handle(method: arkts.MethodDefinition, classInfo: ClassInfo, methodName: string): void;
}

class DecoratorMethodCollectionHandler implements MethodCollectionHandler {
    private readonly decoratorName: DecoratorNames;
    private readonly collector: (classInfo: ClassInfo, methodName: string, method: arkts.MethodDefinition) => void;

    constructor(
        decoratorName: DecoratorNames,
        collector: (classInfo: ClassInfo, methodName: string, method: arkts.MethodDefinition) => void
    ) {
        this.decoratorName = decoratorName;
        this.collector = collector;
    }

    handle(method: arkts.MethodDefinition, classInfo: ClassInfo, methodName: string): void {
        if (!classInfo.isFromStruct || !hasDecorator(method, this.decoratorName)) {
            return;
        }
        this.collector(classInfo, methodName, method);
    }
}

interface LifecycleMethodTypeHandler {
    handle(method: arkts.MethodDefinition): LifecycleMethodType | undefined;
}

abstract class DecoratorLifecycleMethodTypeHandlerBase implements LifecycleMethodTypeHandler {
    protected abstract readonly decoratorName: DecoratorNames;
    protected abstract readonly lifecycleType: LifecycleMethodType;

    handle(method: arkts.MethodDefinition): LifecycleMethodType | undefined {
        return hasDecorator(method, this.decoratorName) ? this.lifecycleType : undefined;
    }
}

class DecoratorLifecycleMethodTypeHandler extends DecoratorLifecycleMethodTypeHandlerBase {
    protected readonly decoratorName: DecoratorNames;
    protected readonly lifecycleType: LifecycleMethodType;

    constructor(decoratorName: DecoratorNames, lifecycleType: LifecycleMethodType) {
        super();
        this.decoratorName = decoratorName;
        this.lifecycleType = lifecycleType;
    }
}

export class ComponentLifecycleTranslator extends MethodTranslator {
    private static readonly methodCollectionHandlers: readonly MethodCollectionHandler[] = [
        new DecoratorMethodCollectionHandler(DecoratorNames.COMPONENT_INIT, (classInfo, methodName) => {
            ComponentLifecycleCache.getInstance().collectInitMethod(classInfo.className, methodName);
        }),
    ];

    private static readonly lifecycleMethodTypeHandlers: readonly LifecycleMethodTypeHandler[] = [
        new DecoratorLifecycleMethodTypeHandler(
            DecoratorNames.COMPONENT_APPEAR,
            LifecycleMethodType.ABOUT_TO_APPEAR
        ),
        new DecoratorLifecycleMethodTypeHandler(
            DecoratorNames.COMPONENT_BUILT,
            LifecycleMethodType.ON_DID_BUILD
        ),
        new DecoratorLifecycleMethodTypeHandler(
            DecoratorNames.COMPONENT_DISAPPEAR,
            LifecycleMethodType.ABOUT_TO_DISAPPEAR
        ),
        new DecoratorLifecycleMethodTypeHandler(
            DecoratorNames.COMPONENT_REUSE,
            LifecycleMethodType.ABOUT_TO_REUSE
        ),
        new DecoratorLifecycleMethodTypeHandler(
            DecoratorNames.COMPONENT_RECYCLE,
            LifecycleMethodType.ABOUT_TO_RECYCLE
        ),
    ];

    constructor(method: arkts.MethodDefinition, classInfo: ClassInfo) {
        super(method, classInfo);
    }

    translateMember(): arkts.AstNode[] {
        const methodName: string = this.method.name.name;

        this.collect(methodName);
        return [this.method];
    }

    private collect(methodName: string): void {
        for (const handler of ComponentLifecycleTranslator.methodCollectionHandlers) {
            handler.handle(this.method, this.classInfo, methodName);
        }

        if (!this.classInfo.isFromStruct) {
            return;
        }

        for (const lifecycleType of this.getLifecycleMethodTypes()) {
            if (this.shouldSkipLifecycleCollection(methodName, lifecycleType)) {
                continue;
            }

            const hasReuseParam =
                lifecycleType === LifecycleMethodType.ABOUT_TO_REUSE && this.method.scriptFunction.params.length > 0;
            const methodInfo: LifecycleMethodInfo = {
                methodName: methodName,
                methodType: lifecycleType,
                hasReuseParam: hasReuseParam,
                reuseParams: hasReuseParam
                    ? (this.method.scriptFunction.params as arkts.ETSParameterExpression[])
                    : undefined,
            };
            ComponentLifecycleCache.getInstance().collectLifecycleMethod(this.classInfo.className, methodInfo);
        }
    }

    private shouldSkipLifecycleCollection(
        methodName: string,
        lifecycleType: LifecycleMethodType | undefined
    ): boolean {
        return !!lifecycleType && methodName === lifecycleType;
    }

    private getLifecycleMethodTypes(): LifecycleMethodType[] {
        const lifecycleTypes: LifecycleMethodType[] = [];
        for (const handler of ComponentLifecycleTranslator.lifecycleMethodTypeHandlers) {
            const lifecycleType = handler.handle(this.method);
            if (lifecycleType) {
                lifecycleTypes.push(lifecycleType);
            }
        }
        return lifecycleTypes;
    }

}
