/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { isBuilderLambda, isBuilderLambdaMethodDecl } from './utils';
import { factory } from './factory';
import { ImportCollector } from '../import-collector';
import { ProjectConfig } from '../../common/plugin-context';

export class BuilderLambdaTransformer extends AbstractVisitor {
    projectConfig: ProjectConfig | undefined;

    constructor(projectConfig: ProjectConfig | undefined) {
        super();
        this.projectConfig = projectConfig;
    }

    reset(): void {
        super.reset();
        ImportCollector.getInstance().reset();
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        if (arkts.isCallExpression(beforeChildren) && isBuilderLambda(beforeChildren)) {
            const lambda = factory.transformBuilderLambda(beforeChildren, this.projectConfig);
            return this.visitEachChild(lambda);
        }
        if (arkts.isMethodDefinition(beforeChildren) && isBuilderLambdaMethodDecl(beforeChildren)) {
            const lambda = factory.transformBuilderLambdaMethodDecl(beforeChildren);
            return this.visitEachChild(lambda);
        }
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isEtsScript(node) && ImportCollector.getInstance().importInfos.length > 0) {
            ImportCollector.getInstance().insertCurrentImports(this.program);
        }
        return node;
    }
}
