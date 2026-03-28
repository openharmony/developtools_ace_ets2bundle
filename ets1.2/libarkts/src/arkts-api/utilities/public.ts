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
    unpackString,
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
    AnnotationAllowed,
    DiagnosticInfo,
    DiagnosticKind,
    Identifier,
    isConditionalExpression,
    SourcePosition,
    SourceRange,
    SuggestionInfo,
    VariableDeclarator,
} from '../../../generated';
import {
    AnnotationUsage,
    compiler,
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

/**
 * Improve: Replace or remove with better naming
 *
 * @deprecated
 */
export function createETSModuleFromContext(): ETSModule {
    const program = compiler.contextProgram();
    return program.getAstCasted();
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
    const program = compiler.contextProgram();
    return program.getAstCasted();
}

export function metaDatabase(fileName: string): string {
    if (fileName.endsWith('.meta.json')) throw new Error(`Must pass source, not database: ${fileName}`);
    return `${fileName}.meta.json`;
}

export function checkErrors(proceedTo?: string) {
    if (compiler.contextState() === Es2pandaContextState.ES2PANDA_STATE_ERROR) {
        traceGlobal(() => `Terminated due to compilation errors occured`);

        const errorMessage = compiler.contextErrorMessage();
        if (errorMessage === undefined) {
            throwError(`Could not get ContextErrorMessage`);
        }
        const allErrorMessages = compiler.getAllErrorMessages();
        if (allErrorMessages === undefined) {
            throwError(`Could not get AllErrorMessages`);
        }
        const actionMsg = proceedTo ? " to " + proceedTo : ""
        throwError([`Failed to proceed${actionMsg}`, errorMessage, allErrorMessages].join(`\n`));
    }
}

export function proceedToState(state: Es2pandaContextState, _contextPtr?: KNativePointer, ignoreErrors = false): void {
    if (compiler.contextState() === Es2pandaContextState.ES2PANDA_STATE_ERROR) {
        NodeCache.clear();
        if (!ignoreErrors) {
            checkErrors(Es2pandaContextState[state]);
        }
    }
    if (state <= compiler.contextState()) {
        return;
    }
    NodeCache.clear();
    const before = Date.now();
    traceGlobal(() => `Proceeding to state ${Es2pandaContextState[state]}: start`);
    global.es2panda._ProceedToState(global.context, state);
    traceGlobal(() => `Proceeding to state ${Es2pandaContextState[state]}: done`);
    const after = Date.now();
    global.profiler.proceededToState(after - before);
    if (!ignoreErrors) {
        checkErrors(Es2pandaContextState[state]);
    }
}

/** @deprecated Use {@link rebindContext} instead */
export function rebindSubtree(node: AstNode): void {
    NodeCache.clear();
    traceGlobal(() => `Rebind: start`);
    compiler.astNodeRebind(node);
    traceGlobal(() => `Rebind: done`);
    checkErrors();
}

/** @deprecated Use {@link recheckSubtree} instead */
export function recheckSubtree(node: AstNode): void {
    NodeCache.clear();
    traceGlobal(() => `Recheck: start`);
    compiler.astNodeRecheck(node);
    traceGlobal(() => `Recheck: done`);
}

export function rebindContext(context: KNativePointer = global.context): void {
    NodeCache.clear();
    traceGlobal(() => `Rebind: start`);
    compiler.astNodeRebind(compiler.contextProgram().getAstCasted());
    traceGlobal(() => `Rebind: done`);
    checkErrors();
}

export function recheckContext(context: KNativePointer = global.context): void {
    NodeCache.clear();
    traceGlobal(() => `Recheck: start`);
    compiler.astNodeRecheck(compiler.contextProgram().getAstCasted());
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

export function getPeerIdentifierDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.generatedEs2panda._DeclarationFromIdentifier(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}

export function getPeerObjectDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.es2panda._ClassVariableDeclaration(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}

export function getPeerMemberDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.es2panda._DeclarationFromMemberExpression(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}

export function getPeerPropertyDecl(peer: KNativePointer): AstNode | undefined {
    const decl = global.es2panda._DeclarationFromProperty(global.context, peer);
    if (decl === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(decl);
}


export function getAnnotations(node: AstNode): readonly AnnotationUsage[] {
    if (!isFunctionDeclaration(node) && !isScriptFunction(node) && !isClassDefinition(node)) {
        throwError('for now annotations allowed only for: functionDeclaration, scriptFunction, classDefinition');
    }
    return new AnnotationAllowed(node.peer).annotations
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
    return node.modifierFlags
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

export function setAllParents(ast: AstNode): void {
    global.es2panda._AstNodeUpdateAll(global.context, ast.peer);
}

export function getProgramFromAstNode(node: AstNode): Program {
    return new Program(global.es2panda._AstNodeProgram(global.context, node.peer));
}

export function importDeclarationInsert(node: ETSImportDeclaration, program: Program): void {
    compiler.insertETSImportDeclarationAndParse(program, node);
}

export function signatureReturnType(signature: KNativePointer): KNativePointer {
    if (!signature) {
        return nullptr;
    }
    return global.generatedEs2panda._SignatureReturnType(global.context, signature);
}

export function convertCheckerTypeToTypeNode(typePeer: KNativePointer | undefined): TypeNode | undefined {
    if (!typePeer) {
        return undefined;
    }
    return factory.createOpaqueTypeNode(global.generatedEs2panda._TypeClone(global.context, typePeer));
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

export function createTypeNodeFromTsType(node: AstNode): AstNode | undefined {
    const typeAnnotation = global.es2panda._CreateTypeNodeFromTsType(global.context, node.peer);
    if (typeAnnotation === nullptr) {
        return undefined;
    }
    return unpackNonNullableNode(typeAnnotation);
}

export function createDiagnosticInfo(
    kind: DiagnosticKind,
    position: SourcePosition,
    ...args: string[]
): DiagnosticInfo {
    return compiler.createDiagnosticInfo(
        kind,
        args,
        position
    );
}

export function createSuggestionInfo(
    kind: DiagnosticKind,
    substitutionCode: string,
    title: string,
    range: SourceRange,
    ...args: string[]
): SuggestionInfo {
    return compiler.createSuggestionInfo(
        kind,
        args,
        substitutionCode,
        title,
        range
    );
}

export function createDiagnosticKind(message: string, type: Es2pandaPluginDiagnosticType): DiagnosticKind {
    return new DiagnosticKind(global.es2panda._CreateDiagnosticKind(global.context, message, type));
}

export function logDiagnostic(kind: DiagnosticKind, pos: SourcePosition, ...args: string[]): void {
    compiler.logDiagnostic(kind, args, pos);
}

export function filterNodes(node: AstNode, filter: string, deeperAfterMatch: boolean): AstNode[] {
    return unpackNodeArray(global.es2panda._FilterNodes(global.context, passNode(node), filter, deeperAfterMatch));
}

export function filterNodesByType<T extends AstNode = AstNode>(node: AstNode, type: Es2pandaAstNodeType): T[] {
    return unpackNodeArray(global.es2panda._FilterNodes2(global.context, passNode(node), type), type);
}

export function filterNodesByTypes(node: AstNode, types: Es2pandaAstNodeType[]): AstNode[] {
    const typesArray = new Int32Array(types.length)
    for (let i = 0; i < types.length; i++) {
        typesArray[i] = types[i]
    }
    return unpackNodeArray(global.es2panda._FilterNodes3(global.context, passNode(node), typesArray, types.length));
}

export function jumpFromETSTypeReferenceToTSTypeAliasDeclarationTypeAnnotation(node: AstNode): AstNode | undefined {
    return unpackNode(
        global.es2panda._JumpFromETSTypeReferenceToTSTypeAliasDeclarationTypeAnnotation(global.context, passNode(node))
    );
}
