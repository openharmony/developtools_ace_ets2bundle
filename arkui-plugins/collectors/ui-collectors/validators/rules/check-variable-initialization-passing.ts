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
import { BaseValidator } from '../base';
import { CallInfo, RecordBuilder, StructPropertyInfo, StructPropertyRecord } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkVariableInitializationPassing = performanceLog(
    _checkVariableInitializationPassing,
    getPerfName([0, 0, 0, 0, 0], 'checkVariableInitializationPassing')
);

const notAllowInitDecorators: string[] = [
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.CONSUME,
    DecoratorNames.LOCAL_STORAGE_LINK,
];

/**
 * 校验规则：用于验证使用组件构造函数实现的参数初始化。
 * 1. `@Require`修饰的属性在组件构造时，必须赋值。
 * 2. 特定装饰器修饰的属性在组件构造时，禁止赋值
 *
 * 校验等级：error
 */
function _checkVariableInitializationPassing(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression,
    struct: arkts.ClassDefinition
): void {
    const metadata = this.context ?? {};
    // 如果非自定义组件调用，直接返回
    if (!metadata.structDeclInfo || !metadata.fromStructInfo?.name) {
        return;
    }
    const callName = metadata.callName!;
    // 收集必须初始化装饰器修饰的属性
    const mustInitProperty: string[] = [];
    struct.body.forEach((item) => {
        if (!arkts.isClassProperty(item)) {
            return;
        }
        const structPropertyRecord = RecordBuilder.build(StructPropertyRecord, item, { shouldIgnoreDecl: false });
        if (!structPropertyRecord.isCollected) {
            structPropertyRecord.collect(item);
        }
        const propertyInfo = structPropertyRecord.toRecord();
        if (!propertyInfo) {
            return;
        }
        if (checkPropertyMustInitFromInfo(propertyInfo)) {
            const propertyName = propertyInfo.name!;
            mustInitProperty.push(propertyName);
        }
    });
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo || !propertyInfo.name) {
            return;
        }
        // 如果已被初始化，移除出 mustInitProperty 数组
        if (mustInitProperty.includes(propertyInfo.name)) {
            mustInitProperty.splice(mustInitProperty.indexOf(propertyInfo.name), 1);
        }
        // 检查被初始化的属性是否由禁止组件初始化装饰器修饰
        const cannotInitAnnotation = notAllowInitDecorators.find((annotation) => {
            return propertyInfo.annotationInfo?.[`has${annotation}`];
        });
        if (!cannotInitAnnotation) {
            return;
        }
        // 特定装饰器修饰的属性在组件构造时，禁止赋值
        const property = arkts.classByPeer<arkts.ClassProperty>(propertyPtr);
        this.report({
            node: property,
            level: LogType.ERROR,
            message: `The '@${cannotInitAnnotation}' property '${propertyInfo.name}' in the custom component '${callName}' cannot be initialized here (forbidden to specify).`,
        });
    });
    // `@Require`修饰的属性在组件构造时，必须赋值。
    mustInitProperty.forEach((propertyName) => {
        this.report({
            node: node,
            level: LogType.ERROR,
            message: `'@Require' decorated '${propertyName}' must be initialized through the component constructor.`,
        });
    });
}

function checkPropertyMustInitFromInfo(metadata: StructPropertyInfo | undefined): boolean {
    if (!!metadata?.annotationInfo?.hasRequire && Object.keys(metadata.annotationInfo).length === 1) {
        return true;
    }
    if (!!metadata?.annotationInfo?.hasRequire && !!metadata?.annotationInfo?.hasState) {
        return true;
    }
    if (!!metadata?.annotationInfo?.hasRequire && !!metadata?.annotationInfo?.hasProvide) {
        return true;
    }
    if (!!metadata?.annotationInfo?.hasRequire && !!metadata?.annotationInfo?.hasPropRef) {
        return true;
    }
    if (!!metadata?.annotationInfo?.hasRequire && !!metadata?.annotationInfo?.hasBuilderParam) {
        return true;
    }
    if (!!metadata?.annotationInfo?.hasRequire && !!metadata?.annotationInfo?.hasParam) {
        return true;
    }
    return false;
}
