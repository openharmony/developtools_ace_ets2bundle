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
import { StructPropertyInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { isPrivateClassProperty, isProtectedClassProperty, isPublicClassProperty } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkPropertyModifiers = performanceLog(
    _checkPropertyModifiers,
    getPerfName([0, 0, 0, 0, 0], 'checkPropertyModifiers')
);

const noPublicDecorators: string[] = [
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_LINK,
];

const noPrivateDecorators: string[] = [DecoratorNames.LINK, DecoratorNames.OBJECT_LINK];

/**
 * 校验规则：用于约束属性访问修饰符的使用。
 * 1.`public`访问修饰符不能与`StorageLink`、`StorageProp`、`LocalStorageLink`、`LocalStorageProp`一起修饰属性。
 * 2.`private `访问修饰符不能与`Link `、`ObjectLink `一起修饰属性。
 * 3.`protected `访问修饰符不能修饰属性。
 *
 * 校验等级：warn
 */

function _checkPropertyModifiers(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    node: arkts.ClassProperty
): void {
    const metadata = this.context ?? {};
    if (!metadata.structInfo || node.isDefaultAccessModifier) {
        return;
    }
    const propertyName = metadata.name;
    if (!propertyName) {
        return;
    }
    checkInvalidPublic.bind(this)(propertyName, node);
    checkInvalidPrivate.bind(this)(propertyName, node);
    checkInvalidProtected.bind(this)(node);
}

function checkInvalidPublic(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    propertyName: string,
    member: arkts.ClassProperty
): void {
    if (!isPublicClassProperty(member)) {
        return;
    }
    let noPublicAnnotationName = '';
    const noPublicAnnotation = member.annotations.find((annotation) => {
        if (
            annotation.expr &&
            arkts.isIdentifier(annotation.expr) &&
            noPublicDecorators.includes(annotation.expr.name)
        ) {
            noPublicAnnotationName = annotation.expr.name;
            return true;
        }
    });
    if (!noPublicAnnotation || noPublicAnnotationName === '') {
        return;
    }
    // `public`访问修饰符不能与`StorageLink`、`StorageProp`、`LocalStorageLink`、`LocalStorageProp`一起修饰属性。
    this.report({
        node: member,
        level: LogType.WARN,
        message: `The @${noPublicAnnotationName} decorated '${propertyName}' cannot be declared as public.`,
    });
}

function checkInvalidPrivate(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    propertyName: string,
    member: arkts.ClassProperty
): void {
    if (!isPrivateClassProperty(member)) {
        return;
    }
    let noPrivateAnnotationName = '';
    const noPrivateAnnotation = member.annotations.find((annotation) => {
        if (
            annotation.expr &&
            arkts.isIdentifier(annotation.expr) &&
            noPrivateDecorators.includes(annotation.expr.name)
        ) {
            noPrivateAnnotationName = annotation.expr.name;
            return true;
        }
    });
    if (!noPrivateAnnotation || noPrivateAnnotationName === '') {
        return;
    }
    // `private `访问修饰符不能与`Link `、`ObjectLink `一起修饰属性。
    this.report({
        node: member,
        level: LogType.WARN,
        message: `The @${noPrivateAnnotationName} decorated '${propertyName}' cannot be declared as private.`,
    });
}

function checkInvalidProtected(
    this: BaseValidator<arkts.ClassProperty, StructPropertyInfo>,
    member: arkts.ClassProperty
): void {
    if (!isProtectedClassProperty(member)) {
        return;
    }
    // `protected `访问修饰符不能修饰属性。
    this.report({
        node: member,
        level: LogType.WARN,
        message: `The member attributes of a struct can not be protected.`,
    });
}
