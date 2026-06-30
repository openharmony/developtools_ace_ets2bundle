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
import * as path from 'path';
import { debugLog } from './debug';
import { AstNodePointer } from './safe-types';
import { LRUCache } from './lru-cache';
import { collect, matchPrefix } from './arkts-utils';
import { 
    ARKUI_BUILDER_SOURCE_NAME, 
    ARKUI_COMPONENT_COMMON_SOURCE_NAME, 
    ARKUI_IMPORT_PREFIX_NAMES, 
    BuilderLambdaNames, 
    CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, 
    CUSTOM_DIALOG_CONTROLLER_SOURCE_NAME, 
    CustomComponentNames, 
    DecoratorNames, 
    Dollars, 
    EntryWrapperNames 
} from './predefines';
import { MetaDataCollector } from './metadata-collector';

const LIB_SUFFIX = '.d.ets';
const ARKUI = 'arkui';

 class ImportSymbolFromArkUICache extends LRUCache<string, boolean> {
    protected static instance: LRUCache<string, boolean>;

    /**
     * Get the singleton instance of the cache
     * @param maxSize Maximum number of items to store (default: 100)
     * @returns The cache instance
     */
    public static getInstance(maxSize: number = 100): ImportSymbolFromArkUICache {
        if (!this.instance) {
            this.instance = new ImportSymbolFromArkUICache(maxSize);
        } else if (maxSize !== ImportSymbolFromArkUICache.instance.maxSize) {
            this.instance.resize(maxSize);
        }
        return this.instance as ImportSymbolFromArkUICache;
    }
}

interface IArkUISymbolValidator {
    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean;
}

abstract class ArkUISymbolValidator implements IArkUISymbolValidator {
    abstract checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean;
}

class ValidatorQueue extends ArkUISymbolValidator {
    protected static instance: ValidatorQueue;
    protected sourceAbsName: string;
    protected children: ArkUISymbolValidator[] = [];

    private constructor(sourceAbsName: string) {
        super();
        this.sourceAbsName = sourceAbsName;
    }

    static getInstance(sourceAbsName: string): ValidatorQueue {
        if (!this.instance) {
            this.instance = new ValidatorQueue(sourceAbsName);
        }
        return this.instance;
    }

    add(Validator: { new (): ArkUISymbolValidator }): this {
        this.children.push(new Validator());
        return this;
    }

    reset(): void {
        this.children = [];
    }

    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean {
        const key = `${this.sourceAbsName}-${name}`;
        if (ImportSymbolFromArkUICache.getInstance().has(key)) {
            return ImportSymbolFromArkUICache.getInstance().get(key)!;
        }
        const sourceName = arkts.getProgramFromAstNode(decl)?.moduleName;
        if (!sourceName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, sourceName)) {
            return false;
        }
        let isFromArkUI: boolean = false;
        for (const validator of this.children) {
            isFromArkUI ||= validator.checkIsFromArkUI(name, decl);
        }
        ImportSymbolFromArkUICache.getInstance().set(key, isFromArkUI);
        return isFromArkUI;
    }
}

class StructValidator extends ArkUISymbolValidator {
    protected symbolNames: string[] = [
        EntryWrapperNames.ENTRY_POINT_CLASS_NAME,
        CustomComponentNames.COMPONENT_CLASS_NAME,
        CustomComponentNames.COMPONENT_V2_CLASS_NAME,
        CustomComponentNames.BASE_CUSTOM_DIALOG_NAME,
    ];

    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean {
        if (!arkts.isClassDefinition(decl)) {
            return false;
        }
        return this.symbolNames.includes(name);
    }
}

class ArkUIAnnotationValidator extends ArkUISymbolValidator {
    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean {
        return arkts.isAnnotationDeclaration(decl);
    }
}

class BuilderValidator extends ArkUISymbolValidator {
    protected visitedNodes: Map<AstNodePointer, boolean> = new Map();
    protected symbolNames: string[] = [
        DecoratorNames.ANIMATABLE_EXTEND,
        DecoratorNames.BUILDER,
        BuilderLambdaNames.ANNOTATION_NAME,
        'Memo',
    ];

    protected checkIsFromArkUIFromAnnotation(anno: arkts.AnnotationUsage): boolean {
        const expr = anno.expr;
        if (!expr || !arkts.isIdentifier(expr)) {
            return false;
        }
        return this.checkIsFromArkUI(expr.name, anno);
    }

    protected checkIsFromArkUIFromType(decl: arkts.TypeNode | undefined): boolean {
        if (!decl) {
            return false;
        }
        let isBuilder: boolean = false;
        if (arkts.isETSFunctionType(decl)) {
            isBuilder = decl.annotations.some((anno) => {
                return this.checkIsFromArkUIFromAnnotation(anno);
            });
        } else if (arkts.isETSUnionType(decl)) {
            isBuilder = decl.types.some((t) => this.checkIsFromArkUIFromType(t));
        } else if (arkts.isETSTypeReference(decl) && !!decl.part && arkts.isETSTypeReferencePart(decl.part)) {
            const ident = decl.part.name;
            if (!!ident && arkts.isIdentifier(ident)) {
                const newName: string = ident.name;
                const newDecl: arkts.AstNode | undefined = arkts.getPeerIdentifierDecl(ident.peer);
                isBuilder = !!newDecl && this.checkIsFromArkUI(newName, newDecl);
            }
        }
        this.visitedNodes.set(decl.peer, isBuilder);
        return isBuilder;
    }

    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean {
        if (this.visitedNodes.has(decl.peer)) {
            return this.visitedNodes.get(decl.peer)!;
        }
        let isBuilder: boolean = false;
        if (arkts.isAnnotationDeclaration(decl)) {
            isBuilder = this.symbolNames.includes(name);
        } else if (arkts.isTSTypeAliasDeclaration(decl)) {
            isBuilder = this.checkIsFromArkUIFromType(decl.typeAnnotation);
        } else if (arkts.isMethodDefinition(decl)) {
            isBuilder = decl.function.annotations.some((anno) => {
                return this.checkIsFromArkUIFromAnnotation(anno);
            });
        }
        this.visitedNodes.set(decl.peer, isBuilder);
        return isBuilder;
    }
}

class ResourceValidator extends ArkUISymbolValidator {
    protected symbolNames: string[] = [Dollars.DOLLAR_RESOURCE, Dollars.DOLLAR_RAWFILE, Dollars.DOLLAR_DOLLAR];

    checkIsFromArkUI(name: string, decl: arkts.AstNode): boolean {
        if (!arkts.isMethodDefinition(decl)) {
            return false;
        }
        return this.symbolNames.includes(name);
    }
}

export class ProgramSkipper {
    static enableSkipBySymbol: boolean = true;
 	static enableSkipByPath: boolean = false;
    private static _absName2programs: Map<string, arkts.Program[]> = new Map();
    private static _uiPathProgramSet: Set<AstNodePointer> = new Set();
    private static _uiSymbolProgramSet: Set<AstNodePointer> = new Set();
    private static _intentSymbolProgramSet: Set<AstNodePointer> = new Set();
    private static _edges: Map<AstNodePointer, arkts.Program[]> = new Map();
    private static _initedCanSkip: boolean = false;

    private static _addUIPathProgramToSet(program: arkts.Program): void {
        if (this._uiPathProgramSet.has(program.peer)) {
            return;
        }
        this._uiPathProgramSet.add(program.peer);
        if (this._edges.has(program.peer)) {
            for (const to of this._edges.get(program.peer)!) {
                this._addUIPathProgramToSet(to);
            }
        }
    }

    private static _addUISymbolProgramToSet(
        program: arkts.Program,
        absName: string,
        specifiers: arkts.ImportSpecifier[]
    ): void {
        if (this._uiSymbolProgramSet.has(program.peer)) {
            return;
        }
        for (const specifier of specifiers) {
            const importSymbol = specifier.imported;
            if (!importSymbol) {
                continue;
            }
            const name = importSymbol.name;
            let decl: arkts.AstNode | undefined = arkts.getPeerIdentifierDecl(importSymbol.peer);
            if (!decl) {
                continue;
            }
            const validatorQueue = ValidatorQueue.getInstance(absName);
            validatorQueue.add(ArkUIAnnotationValidator);
            validatorQueue.add(StructValidator);
            validatorQueue.add(BuilderValidator);
            validatorQueue.add(ResourceValidator);
            const isFromArkUI: boolean = validatorQueue.checkIsFromArkUI(name, decl);
            validatorQueue.reset();
            if (isFromArkUI) {
                this._uiSymbolProgramSet.add(program.peer);
                return;
            }
        }
    }

    private static _addInsightIntentSymbolProgramToSet(
        program: arkts.Program,
        absName: string,
        specifiers: arkts.ImportSpecifier[]
    ): void {
        if (this._intentSymbolProgramSet.has(program.peer)) {
            return;
        }
        if (!absName.includes('@kit.AbilityKit') && !absName.includes('InsightIntentDecorator')) {
            return;
        }
        for (const specifier of specifiers) {
            const importSymbol = specifier.imported;
            if (!importSymbol) {
                continue;
            }
            const name = importSymbol.name;
            const isFromInsightIntent = name.includes('Intent') || name.includes('LinkParamCategory');
            if (isFromInsightIntent) {
                this._intentSymbolProgramSet.add(program.peer);
                return;
            }
        }
    }

    private static _addEdges(program: arkts.Program, absName: string): void {
        if (!absName || !this._absName2programs.has(absName)) {
            return;
        }
        for (const importProg of this._absName2programs.get(absName)!) {
            const edges = this._edges.get(importProg.peer) || [];
            edges.push(program);
            this._edges.set(importProg.peer, edges);
        }
    }

    private static _traverseImportStatements(program: arkts.Program): void {
        for (const statement of program.ast.statements) {
            if (arkts.isETSImportDeclaration(statement)) {
                const absName = statement.resolvedSource;
                if (this.enableSkipByPath) {
                    this._addEdges(program, absName);
                }
                if (this.enableSkipBySymbol) {
                    const specifiers = statement.specifiers as arkts.ImportSpecifier[];
                    this._addUISymbolProgramToSet(program, absName, specifiers);
                    if (
                        MetaDataCollector.getInstance().shouldHandleInsightIntent &&
                        !this._uiPathProgramSet.has(program.peer)
                    ) {
                        this._addInsightIntentSymbolProgramToSet(program, absName, specifiers);
                    }
                }
            }
        }
    }

    private static _addProgramToMap(program: arkts.Program): void {
        const absName = program.absoluteName;
        const name2programs = this._absName2programs.get(absName) || [];
        name2programs.push(program);
        this._absName2programs.set(absName, name2programs);

        const folder = path.dirname(absName);
        const folder2programs = this._absName2programs.get(folder) || [];
        folder2programs.push(program);
        this._absName2programs.set(folder, folder2programs);
    }

    private static _initCanSkip(programs: arkts.Program[] | undefined): void {
        if (!programs) {
            return;
        }
        if (this.enableSkipByPath) {
            programs.forEach((p) => this._addProgramToMap(p));
        }
        programs.forEach((p) => this._traverseImportStatements(p));
        if (this.enableSkipByPath) {
            programs.forEach((p) => {
                const name = p.absoluteName;
                if (name.endsWith(LIB_SUFFIX) && name.includes(ARKUI)) {
                    this._addUIPathProgramToSet(p);
                }
            });
        }
    }

    public static clear(): void {
        this._uiSymbolProgramSet.clear();
        this._uiPathProgramSet.clear();
        this._intentSymbolProgramSet.clear();
        this._initedCanSkip = false;
    }

    public static canSkipProgram(program: arkts.Program | undefined): boolean {
        if (!this.enableSkipBySymbol && !this.enableSkipByPath) {
            return false;
        }
        if (!this._initedCanSkip) {
            return false;
        }
        if (!program) {
            return false;
        }
        const cannotSkipModuleNames = [
            CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
            CUSTOM_DIALOG_CONTROLLER_SOURCE_NAME,
            ARKUI_COMPONENT_COMMON_SOURCE_NAME,
            ARKUI_BUILDER_SOURCE_NAME,
        ];
        if (cannotSkipModuleNames.includes(program.moduleName)) {
            return false;
        }
        const canSkipBySymbol = this.enableSkipBySymbol 
            ? !this._uiSymbolProgramSet.has(program.peer) && !this._intentSymbolProgramSet.has(program.peer)
            : false;
        const canSkipByPath = this.enableSkipByPath 
            ? !this._uiPathProgramSet.has(program.peer) 
            : false;
        return canSkipBySymbol || canSkipByPath;
    }
 	 
    public static initialize(sourceProgram: arkts.Program, externalPrograms: arkts.Program[]): void {
        if (this._initedCanSkip) {
            return;
        }
        const programs = collect(externalPrograms, sourceProgram);
        this._initCanSkip(programs);
        this._initedCanSkip = true;
        this._absName2programs.clear();
        this._edges.clear();
    }
}

export type PROGRAM_SKIPPER_FUNCTION_TYPE = (program: arkts.Program | undefined) => boolean;
export const PROGRAM_SKIPPER_FUNCTION_PARAMETER_NAME = "canSkipProgram";

export function captureProgramSkipperToPluginContext(context: arkts.PluginContext) {
    context.setParameter(PROGRAM_SKIPPER_FUNCTION_PARAMETER_NAME, (program: arkts.Program) => {
        return ProgramSkipper.canSkipProgram(program)
    })
}
