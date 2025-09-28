/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import path from 'path';
import { PluginTester } from '../../utils/plugin-tester';
import { BuildConfig, PluginTestContext } from '../../utils/shared-types';
import { mockBuildConfig } from '../../utils/artkts-config';
import { parseDumpSrc } from '../../utils/parse-string';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../utils/simplify-dump';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../utils/path-config';
import { annotation } from '../../../common/arkts-utils';
import { PluginContext, Plugins } from '../../../common/plugin-context';
import { AbstractVisitor } from '../../../common/abstract-visitor';
import { ProgramVisitor } from '../../../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../../../common/predefines';

const COMMON_UTILS_DIR_PATH: string = 'common-utils';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMMON_UTILS_DIR_PATH, 'annotation.ets')];

const pluginTester = new PluginTester('test arkts-utils', buildConfig);

type AnnotationAstNode =
    | arkts.ClassDefinition
    | arkts.ClassProperty
    | arkts.ETSParameterExpression
    | arkts.ArrowFunctionExpression
    | arkts.MethodDefinition
    | arkts.VariableDeclaration
    | arkts.TSInterfaceDeclaration
    | arkts.TSTypeAliasDeclaration;

class AnnotationVisitor extends AbstractVisitor {
    isRemover: boolean;

    constructor(isRemover?: boolean) {
        super();
        this.isRemover = !!isRemover;
    }

    private testAnnotation(): arkts.AnnotationUsage {
        return annotation('TestAnno');
    }

    addTestAnnotation(node: AnnotationAstNode): void {
        if (arkts.isEtsParameterExpression(node)) {
            node.annotations = [this.testAnnotation()];
        } else if (arkts.isMethodDefinition(node)) {
            node.scriptFunction.setAnnotations([this.testAnnotation()]);
        } else {
            node.setAnnotations([this.testAnnotation()]);
        }
    }

    removeTestAnnotation(node: AnnotationAstNode): void {
        if (arkts.isEtsParameterExpression(node)) {
            node.annotations = [];
        } else if (arkts.isMethodDefinition(node)) {
            node.scriptFunction.setAnnotations([]);
        } else {
            node.setAnnotations([]);
        }
    }

    isAnnotationNode(node: arkts.AstNode): node is AnnotationAstNode {
        return (
            arkts.isClassDefinition(node) ||
            arkts.isClassProperty(node) ||
            arkts.isMethodDefinition(node) ||
            arkts.isEtsParameterExpression(node) ||
            arkts.isArrowFunctionExpression(node) ||
            arkts.isMethodDefinition(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        );
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (this.isAnnotationNode(node)) {
            if (this.isRemover) {
                this.removeTestAnnotation(node);
            } else {
                this.addTestAnnotation(node);
            }
        }
        return this.visitEachChild(node);
    }
}

function addAnnotationTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        const annotationAdder = new AnnotationVisitor();
        const programVisitor = new ProgramVisitor({
            pluginName: addAnnotationTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_ERROR, // ignored
            visitors: [annotationAdder],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: this,
        });
        program = programVisitor.programVisitor(program);
        script = program.astNode;
        return script;
    }
    return script;
}

function removeAnnotationTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        const annotationAdder = new AnnotationVisitor(true);
        const programVisitor = new ProgramVisitor({
            pluginName: addAnnotationTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_ERROR, // ignored
            visitors: [annotationAdder],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: this,
        });
        program = programVisitor.programVisitor(program);
        script = program.astNode;
        return script;
    }
    return script;
}

const addAnnotation: Plugins = {
    name: 'add-annotation',
    parsed: addAnnotationTransform,
    checked: addAnnotationTransform,
};

const removeAnnotation: Plugins = {
    name: 'remove-annotation',
    parsed: removeAnnotationTransform,
    checked: removeAnnotationTransform,
};

const expectedParseSnapshot: string = `
import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";
@Retention({policy:\"SOURCE\"}) @interface TestAnno {}
@TestAnno() type TestType = number;
@TestAnno() (() => {})
@TestAnno() class A {
    @TestAnno() public prop: number = 1;
    @TestAnno() public method(@TestAnno() arg1: number): void {
        @TestAnno() const a: number = arg1;
    }
    @TestAnno() public constructor() {}
}
@TestAnno() interface __A {
    @TestAnno() prop: number;
}
`;

function testParseAnnotation(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParseSnapshot));
}

const expectedCheckSnapshot: string = `
import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";
@TestAnno() function main() {}
@TestAnno() (() => {});
@Retention({policy:\"SOURCE\"}) @interface TestAnno {}
@TestAnno() type TestType = number;
@TestAnno() class A {
    @TestAnno() public prop: number = 1;
    @TestAnno() public method(@TestAnno() arg1: number): void {
        @TestAnno() const a: number = arg1;
    }
    @TestAnno() public constructor() {}
}
@TestAnno() interface __A {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'prop', 'number', [dumpAnnotation('TestAnno')], [dumpAnnotation('TestAnno')], false)}
}
`;

function testCheckAnnotation(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckSnapshot));
}

pluginTester.run(
    'annotation',
    [addAnnotation, removeAnnotation],
    {
        'parsed:add-annotation': [testParseAnnotation],
        'checked:add-annotation': [testCheckAnnotation],
    },
    {
        stopAfter: 'checked',
    }
);
