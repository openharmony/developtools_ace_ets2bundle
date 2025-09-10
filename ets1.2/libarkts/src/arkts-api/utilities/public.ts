/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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

import { global } from '../static/global';
import { isNumber, throwError, withWarning } from '../../utils';
import { KNativePointer, nullptr, KInt, KUInt } from '@koalaui/interop';
import {
    passNode,
    unpackNodeArray,
    unpackNonNullableNode,
    passString,
    unpackString,
    passStringArray,
    unpackNode,
} from './private';
import {
    Es2pandaContextState,
    Es2pandaModifierFlags,
    Es2pandaMethodDefinitionKind,
    Es2pandaAstNodeType,
    Es2pandaPluginDiagnosticType,
} from '../../../generated/Es2pandaEnums';
import type { AstNode } from '../peers/AstNode';
import {
    DiagnosticInfo,
    Identifier,
    isConditionalExpression,
    SourcePosition,
    SourceRange,
    SuggestionInfo,
    VariableDeclarator,
} from '../../../generated';
import {
    type AnnotationUsage,
    ClassDefinition,
    ClassProperty,
    ETSModule,
    isClassDefinition,
    isFunctionDeclaration,
    isMemberExpression,
    isScriptFunction,
    isIdentifier,
    isETSModule,
    Program,
    isObjectExpression,
    ETSImportDeclaration,
    isProperty,
    isTSInterfaceDeclaration,
    isNumberLiteral,
    Property,
    MemberExpression,
    isMethodDefinition,
    TypeNode,
} from '../../../generated';
import { Config } from '../peers/Config';
import { Context } from '../peers/Context';
import { NodeCache } from '../node-cache';
import { factory } from '../factory/nodeFactory';
import { traceGlobal } from '../../tracer';
import { DiagnosticKind } from '../peers/DiagnosticKind';

/**
 * Improve: Replace or remove with better naming
 *
 * @deprecated
 */
export function createETSModuleFromContext(): ETSModule {
    let program = global.generatedEs2panda._ContextProgram(global.context);
    if (program == nullptr) {
        throw new Error(`Program is null for context ${global.context.toString(16)}`);
    }
    const ast = global.generatedEs2panda._ProgramAst(global.context, program);
    if (ast == nullptr) {
        throw new Error(`AST is null for program ${program.toString(16)}`);
    }
    return new ETSModule(ast, Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE);
}

/**
 * Now used only in tests
 * Improve: Remove or replace with better method
 *
 * @deprecated
 */
export function createETSModuleFromSource(
    source: string,
    state: Es2pandaContextState = Es2pandaContextState.ES2PANDA_STATE_PARSED
): ETSModule {
    if (!global.configIsInitialized()) {
        global.config = Config.createDefault().peer;
    }
    global.compilerContext = Context.createFromString(source);
    proceedToState(state);
    let program = global.generatedEs2panda._ContextProgram(global.compilerContext.peer);
    if (program === nullptr)
        throw new Error(`Program is null for ${source} 0x${global.compilerContext.peer.toString(16)}`);
    return new ETSModule(
        global.generatedEs2panda._ProgramAst(global.context, program),
        Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE
    );
}

export function metaDatabase(fileName: string): string {
    if (fileName.endsWith('.meta.json')) throw new Error(`Must pass source, not database: ${fileName}`);
    return `${fileName}.meta.json`;
}

export function checkErrors() {
    if (global.es2panda._ContextState(global.context) === Es2pandaContextState.ES2PANDA_STATE_ERROR) {
        traceGlobal(() => `Terminated due to compilation errors occured`);
        console.log(unpackString(global.generatedEs2panda._GetAllErrorMessages(global.context)));
        // global.es2panda._DestroyConfig(global.config)
        process.exit(1);
    }
}

export function proceedToState(state: Es2pandaContextState): void {
    if (state <= global.es2panda._ContextState(global.context)) {
        return;
    }
    NodeCache.clear();
    const before = Date.now();
    traceGlobal(() => `Proceeding to state ${Es2pandaContextState[state]}: start`);
    global.es2panda._ProceedToState(global.context, state);
    traceGlobal(() => `Proceeding to state ${Es2pandaContextState[state]}: done`);
    const after = Date.now();
    global.profiler.proceededToState(after - before);
    checkErrors();
}

/** @deprecated Use {@link rebindContext} instead */
export function rebindSubtree(node: AstNode): void {
    NodeCache.clear();
    traceGlobal(() => `Rebind: start`);
    global.es2panda._AstNodeRebind(global.context, node.peer);
    traceGlobal(() => `Rebind: done`);
    checkErrors();
}

/** @deprecated Use {@link recheckSubtree} instead */
export function recheckSubtree(node: AstNode): void {
    NodeCache.clear();
    traceGlobal(() => `Recheck: start`);
    global.generatedEs2panda._AstNodeRecheck(global.context, node.peer);
    traceGlobal(() => `Recheck: done`);
    checkErrors();
}

export function rebindContext(context: KNativePointer = global.context): void {
    NodeCache.clear();
    traceGlobal(() => `Rebind: start`);
    global.es2panda._AstNodeRebind(
        context,
        global.generatedEs2panda._ProgramAst(context, global.generatedEs2panda._ContextProgram(context))
    );
    traceGlobal(() => `Rebind: done`);
    checkErrors();
}

export function recheckContext(context: KNativePointer = global.context): void {
    NodeCache.clear();
    traceGlobal(() => `Recheck: start`);
    global.generatedEs2panda._AstNodeRecheck(
        context,
        global.generatedEs2panda._ProgramAst(context, global.generatedEs2panda._ContextProgram(context))
    );
    traceGlobal(() => `Recheck: done`);
    checkErrors();
}

export function getDecl(node: AstNode): AstNode | undefined {
    if (isMemberExpression(node)) {
        return getDeclFromArrayOrObjectMember(node);
    }
    if (isObjectExpression(node)) {
        return getPeerObjectDecl(passNode(node));
    }
    const decl = getPeerDecl(passNode(node));
    if (!!decl) {
        return decl;
    }
    if (!!node.parent && isProperty(node.parent)) {
        return getDeclFromProperty(node.parent);
    }
    return undefined;
}

function getDeclFromProperty(node: Property): AstNode | undefined {
    if (!node.key) {
        return undefined;
    }
    if (!!node.parent && !isObjectExpression(node.parent)) {
        return getPeerDecl(passNode(node.key));
    }
    return getDeclFromObjectExpressionProperty(node);
}

function getDeclFromObjectExpressionProperty(node: Property): AstNode | undefined {
    const declNode = getPeerObjectDecl(passNode(node.parent));
    if (!declNode || !node.key || !isIdentifier(node.key)) {
        return undefined;
    }
    let body: readonly AstNode[] = [];
    if (isClassDefinition(declNode)) {
        body = declNode.body;
    } else if (isTSInterfaceDeclaration(declNode)) {
        body = declNode.body?.body ?? [];
    }
    return body.find(
        (statement) =>
            isMethodDefinition(statement) &&
            statement.kind === Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
            !!statement.id &&
            !!node.key &&
            isIdentifier(node.key) &&
            statement.id.name === node.key.name
    );
}

function getDeclFromArrayOrObjectMember(node: MemberExpression): AstNode | undefined {
    if (isNumberLiteral(node.property)) {
        return node.object ? getDecl(node.object) : undefined;
    }
    return node.property ? getDecl(node.property) : undefined;
}

export function getPeerDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.generatedEs2panda._DeclarationFromIdentifier(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}

export function declarationFromIdentifier(node: Identifier): AstNode | undefined {
    return unpackNode(global.generatedEs2panda._DeclarationFromIdentifier(global.context, node.peer));
}

export function resolveGensymVariableDeclaratorForDefaultParam(node: VariableDeclarator): Identifier | undefined {
    const init = node.init;
    if (
        isConditionalExpression(init) &&
        isIdentifier(init.consequent) &&
        init.consequent.name.startsWith('gensym%%_')
    ) {
        return init.consequent;
    }
    return undefined;
}

export function resolveGensymVariableDeclaratorForOptionalCall(node: VariableDeclarator): Identifier | undefined {
    const init = node.init;
    if (isIdentifier(node.id) && node.id.name.startsWith('gensym%%_') && isIdentifier(init)) {
        return init;
    }
    return undefined;
}

export function getPeerObjectDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.es2panda._ClassVariableDeclaration(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}

export function getAnnotations(node: AstNode): readonly AnnotationUsage[] {
    if (!isFunctionDeclaration(node) && !isScriptFunction(node) && !isClassDefinition(node)) {
        throwError('for now annotations allowed only for: functionDeclaration, scriptFunction, classDefinition');
    }
    return unpackNodeArray(global.es2panda._AnnotationAllowedAnnotations(global.context, node.peer, nullptr));
}

export function getOriginalNode(node: AstNode): AstNode {
    if (node === undefined) {
        // Improve: fix this
        throwError('there is no arkts pair of ts node (unable to getOriginalNode)');
    }
    if (node.originalPeer === nullptr) {
        return node;
    }
    return unpackNonNullableNode(node.originalPeer);
}

export function getFileName(): string {
    return global.filePath;
}

export function getJsDoc(node: AstNode): string | undefined {
    const result = unpackString(global.generatedEs2panda._JsdocStringFromDeclaration(global.context, node.peer));
    return result === 'Empty Jsdoc' ? undefined : result;
}

// Improve: It seems like Definition overrides AstNode  modifiers
// with it's own modifiers which is completely unrelated set of flags.
// Use this function if you need
// the language level modifiers: public, declare, export, etc.
export function classDefinitionFlags(node: ClassDefinition): Es2pandaModifierFlags {
    return global.generatedEs2panda._AstNodeModifiers(global.context, node.peer);
}

// Improve: ClassProperty's optional flag is set by AstNode's modifiers flags.
export function classPropertySetOptional(node: ClassProperty, value: boolean): ClassProperty {
    if (value) {
        node.modifierFlags |= Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
    } else {
        node.modifierFlags &= Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
    }
    return node;
}

export function hasModifierFlag(node: AstNode, flag: Es2pandaModifierFlags): boolean {
    if (!node) return false;

    let modifiers;
    if (isClassDefinition(node)) {
        modifiers = classDefinitionFlags(node);
    } else {
        modifiers = node.modifierFlags;
    }
    return (modifiers & flag) === flag;
}

export function modifiersToString(modifiers: Es2pandaModifierFlags): string {
    return Object.values(Es2pandaModifierFlags)
        .filter(isNumber)
        .map((it) => {
            console.log(it.valueOf(), Es2pandaModifierFlags[it], modifiers.valueOf() & it);
            return (modifiers.valueOf() & it) === it ? Es2pandaModifierFlags[it] : '';
        })
        .join(' ');
}

export function nameIfIdentifier(node: AstNode): string {
    return isIdentifier(node) ? `'${node.name}'` : '';
}

export function nameIfETSModule(node: AstNode): string {
    return isETSModule(node) ? `'${node.ident?.name}'` : '';
}

export function asString(node: AstNode | undefined): string {
    return `${node?.constructor.name} ${node ? nameIfIdentifier(node) : undefined}`;
}

const defaultPandaSdk = '../../../incremental/tools/panda/node_modules/@panda/sdk';

export function findStdlib(): string {
    const sdk =
        process.env.PANDA_SDK_PATH ??
        withWarning(defaultPandaSdk, `PANDA_SDK_PATH not set, assuming ${defaultPandaSdk}`);
    return `${sdk}/ets/stdlib`;
}

export function generateTsDeclarationsFromContext(
    outputDeclEts: string,
    outputEts: string,
    exportAll: boolean,
    isolated: boolean,
    recordFile: string,
    genAnnotations: boolean
): KInt {
    return global.es2panda._GenerateTsDeclarationsFromContext(
        global.context,
        passString(outputDeclEts),
        passString(outputEts),
        exportAll,
        isolated,
        recordFile,
        genAnnotations
    );
}

export function setAllParents(ast: AstNode): void {
    global.es2panda._AstNodeUpdateAll(global.context, ast.peer);
}

export function getProgramFromAstNode(node: AstNode): Program {
    return new Program(global.es2panda._AstNodeProgram(global.context, node.peer));
}

export function importDeclarationInsert(node: ETSImportDeclaration, program: Program): void {
    global.generatedEs2panda._InsertETSImportDeclarationAndParse(global.context, program.peer, node.peer);
}

export function signatureReturnType(signature: KNativePointer): KNativePointer {
    if (!signature) {
        return nullptr;
    }
    return global.es2panda._Checker_SignatureReturnType(global.context, signature);
}

export function convertCheckerTypeToTypeNode(typePeer: KNativePointer | undefined): TypeNode | undefined {
    if (!typePeer) {
        return undefined;
    }
    return factory.createOpaqueTypeNode(global.es2panda._Checker_TypeClone(global.context, typePeer));
}

export function originalSourcePositionString(node: AstNode | undefined) {
    if (!node) {
        return `[undefined]`;
    }
    const originalPeer = node.originalPeer;
    const sourcePosition = new SourcePosition(
        global.generatedEs2panda._AstNodeStartConst(global.context, originalPeer)
    );
    const program = new Program(global.es2panda._AstNodeProgram(global.context, originalPeer));
    if (!program.peer) {
        // This can happen if we are calling this method on node that is in update now and parent chain does not lead to program
        return `[${global.filePath}${sourcePosition.toString()}]`;
    }
    return `[${program.absoluteName}${sourcePosition.toString()}]`;
}

export function generateStaticDeclarationsFromContext(outputPath: string): KInt {
    return global.generatedEs2panda._GenerateStaticDeclarationsFromContext(global.context, passString(outputPath));
}

export function createTypeNodeFromTsType(node: AstNode): AstNode | undefined {
    const typeAnnotation = global.es2panda._CreateTypeNodeFromTsType(global.context, node.peer);
    if (typeAnnotation === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(typeAnnotation);
}

export function createSourcePosition(index: KUInt, line: KUInt): SourcePosition {
    return new SourcePosition(global.generatedEs2panda._CreateSourcePosition(global.context, index, line));
}

export function createSourceRange(start: SourcePosition, end: SourcePosition): SourceRange {
    return new SourceRange(global.generatedEs2panda._CreateSourceRange(global.context, start.peer, end.peer));
}

export function createDiagnosticInfo(
    kind: DiagnosticKind,
    position: SourcePosition,
    ...args: string[]
): DiagnosticInfo {
    return new DiagnosticInfo(
        global.es2panda._CreateDiagnosticInfo(
            global.context,
            kind.peer,
            passStringArray(args),
            args.length,
            position.peer
        )
    );
}

export function createSuggestionInfo(
    kind: DiagnosticKind,
    substitutionCode: string,
    title: string,
    range: SourceRange,
    ...args: string[]
): SuggestionInfo {
    return new SuggestionInfo(
        global.es2panda._CreateSuggestionInfo(
            global.context,
            kind.peer,
            passStringArray(args),
            args.length,
            substitutionCode,
            title,
            range.peer
        )
    );
}

export function createDiagnosticKind(message: string, type: Es2pandaPluginDiagnosticType): DiagnosticKind {
    return new DiagnosticKind(global.es2panda._CreateDiagnosticKind(global.context, message, type));
}

export function logDiagnostic(kind: DiagnosticKind, pos: SourcePosition, ...args: string[]): void {
    global.es2panda._LogDiagnostic(global.context, kind.peer, passStringArray(args), args.length, pos.peer);
}

export function logDiagnosticWithSuggestion(diagnosticInfo: DiagnosticInfo, suggestionInfo: SuggestionInfo): void {
    global.generatedEs2panda._LogDiagnosticWithSuggestion(global.context, diagnosticInfo.peer, suggestionInfo.peer);
}

export function filterNodes(node: AstNode, filter: string): AstNode[] {
    return unpackNodeArray(global.es2panda._FilterNodes(global.context, passNode(node), filter));
}
