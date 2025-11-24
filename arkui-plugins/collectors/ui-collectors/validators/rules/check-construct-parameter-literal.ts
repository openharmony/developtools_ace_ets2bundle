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
import { CallInfo, RecordBuilder, StructPropertyRecord } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkConstructParameterLiteral = performanceLog(
    _checkConstructParameterLiteral,
    getPerfName([0, 0, 0, 0, 0], 'checkConstructParameterLiteral')
);

/**
 * 校验规则：用于验证自定义组件初始化属性时使用的装饰器类型。
 * 1.`@ObjectLink`与`@Link`修饰的变量，禁止使用常量初始化。
 *
 * 校验等级：error
 */
function _checkConstructParameterLiteral(
    this: BaseValidator<arkts.CallExpression, CallInfo>,
    node: arkts.CallExpression
): void {
    const metadata = this.context ?? {};
    // If a non-custom component is called and is not in the custom component, it returns directly
    if (!metadata.structDeclInfo || !metadata.fromStructInfo) {
        return;
    }
    metadata.structPropertyInfos?.forEach(([propertyPtr, propertyInfo]) => {
        if (!propertyPtr || !propertyInfo) {
            return;
        }
        if (!propertyInfo.annotationInfo?.hasLink && !propertyInfo.annotationInfo?.hasObjectLink) {
            return;
        }
        const annotationName = propertyInfo.annotationInfo?.hasLink ? DecoratorNames.LINK : DecoratorNames.OBJECT_LINK;
        const property = arkts.classByPeer<arkts.Property>(propertyPtr);

        const errorNode = verifyRegularInitialization(property);
        if (!errorNode) {
            return;
        }
        // `@ObjectLink`与`@Link`修饰的变量，禁止使用常量初始化。
        this.report({
            node: property,
            level: LogType.WARN,
            message: `The 'regular' property '${errorNode.dumpSrc()}' cannot be assigned to the '@${annotationName}' property '${propertyInfo.name}'.`,
        });
    });
}

function verifyRegularInitialization(property: arkts.Property): arkts.AstNode | undefined {
    const key = property.key;
    const value = property.value;
    if (!key || !arkts.isIdentifier(key) || !value) {
        return undefined;
    }
    // Skip checks when assigning this.xxx attributes and global variables
    if (arkts.isMemberExpression(value)) {
        return verifyRegularInitializationInMemberExpression(value);
    }
    if (!arkts.isMethodDefinition(value) && !arkts.isIdentifier(value)) {
        return value;
    }
    return undefined;
}

function verifyRegularInitializationInMemberExpression(member: arkts.MemberExpression): arkts.AstNode | undefined {
    const object = member.object;
    if (arkts.isThisExpression(object)) {
        return undefined;
    }
    const property = member.property;
    if (!arkts.isIdentifier(property)) {
        return undefined;
    }
    const decl = arkts.getPeerIdentifierDecl(property.peer);
    if (!decl || !arkts.isClassProperty(decl)) {
        return undefined;
    }
    const structPropertyRecord = RecordBuilder.build(StructPropertyRecord, decl, { shouldIgnoreDecl: false });
    if (!structPropertyRecord.isCollected) {
        structPropertyRecord.collect(decl);
    }
    const structPropertyInfo = structPropertyRecord.toRecord();
    const info = { ...structPropertyInfo?.annotationInfo, ...structPropertyInfo?.ignoredAnnotationInfo };
    if (Object.keys(info).length > 0) {
        return undefined;
    }
    return property;
}
