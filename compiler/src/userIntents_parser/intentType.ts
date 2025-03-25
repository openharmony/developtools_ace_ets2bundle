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

import ts from 'typescript';
import parseUserIntents from './parseUserIntents';
import Ajv from 'ajv';

const ajv = new Ajv({allErrors: true});

export interface IntentInfo {
  intentName: string;
  domain: string;
  intentVersion: string;
  displayName: string;
  displayDescription: string;
  schema: string;
  icon: Function;
  llmDescription: string;
  keywords: string[];
  parameters: object;
}

interface LinkIntentParamMapping {
  paramName: string;
  paramMappingName: string;
  paramCategory: string;
}

export interface IntentLinkInfo extends IntentInfo {
  uri: string;
  paramMapping: LinkIntentParamMapping[]
}

export class ParamChecker<T> {
  private _requiredFields: (keyof T)[];
  private _allowFields: Set<keyof T>;
  private _paramValidators: Record<keyof T, (v: ts.Expression) => boolean>;
  private _nestedCheckers: Map<string, ParamChecker<any>>;

  get requiredFields(): (keyof T)[] {
    return this._requiredFields;
  }

  get allowFields(): Set<keyof T> {
    return this._allowFields;
  }

  get paramValidators(): Record<keyof T, (v: ts.Expression) => boolean> {
    return this._paramValidators;
  }

  get nestedCheckers(): Map<string, ParamChecker<any>> {
    return this._nestedCheckers;
  }

  set nestedCheckers(value: Map<string, ParamChecker<any>>) {
    this._nestedCheckers = value;
  }

  set requiredFields(value: (keyof T)[]) {
    this._requiredFields = value;
  }

  set allowFields(value: Set<keyof T>) {
    this._allowFields = value;
  }

  set paramValidators(value: Record<keyof T, (v: ts.Expression) => boolean>) {
    this._paramValidators = value;
  }

  clean(): void {
    this._requiredFields = [];

    this._allowFields = new Set<keyof T>();

    this._paramValidators = {} as Record<keyof T, (v: ts.Expression) => boolean>;

    this._nestedCheckers = new Map<string, ParamChecker<any>>();
  }
}

const IntentLinkParamsChecker: ParamChecker<LinkIntentParamMapping> = new ParamChecker<LinkIntentParamMapping>();
IntentLinkParamsChecker.requiredFields = ['paramName'];
IntentLinkParamsChecker.allowFields = new Set<keyof LinkIntentParamMapping>([
  'paramName', 'paramMappingName', 'paramCategory'
]);
IntentLinkParamsChecker.paramValidators = {
  paramCategory(v: ts.Expression): boolean {
    return v !== null && v !== undefined && ts.isStringLiteral(v);
  },
  paramMappingName(v: ts.Expression): boolean {
    return v !== null && v !== undefined && ts.isStringLiteral(v);
  },
  paramName(v: ts.Expression): boolean {
    return v !== null && v !== undefined && ts.isStringLiteral(v) && v.text.trim() !== '';
  }
};
export const IntentLinkInfoChecker: ParamChecker<IntentLinkInfo> = new ParamChecker<IntentLinkInfo>();
IntentLinkInfoChecker.requiredFields = ['intentName', 'domain', 'intentVersion', 'displayName', 'llmDescription', 'uri'];
IntentLinkInfoChecker.allowFields = new Set<keyof IntentLinkInfo>([
  'intentName', 'domain', 'intentVersion', 'displayName', 'displayDescription', 'schema', 'icon', 'keywords', 'llmDescription', 'uri',
  'parameters', 'paramMapping'
]);

IntentLinkInfoChecker.paramValidators = {
  parameters(v: ts.Expression): boolean {
    try {
      let initializer: object = {};
      if (ts.isIdentifier(v)) {
        const symbol = parseUserIntents.checker.getSymbolAtLocation(v);
        const declaration = symbol?.valueDeclaration;
        initializer = declaration.initializer;
      } else {
        initializer = v;
      }
      if (ts.isObjectLiteralExpression(initializer)) {
        ajv.compile(JSON.parse(initializer.getText()));
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  },
  paramMapping(v: ts.Expression): boolean {
    return v !== null &&
      v !== undefined && ts.isArrayLiteralExpression(v);
  },
  keywords(v: ts.Expression): boolean {
    if (ts.isArrayLiteralExpression(v)) {
      return v.elements.every(ele => {
        if (ts.isIdentifier(ele)) {
          const symbol = parseUserIntents.checker.getSymbolAtLocation(ele);
          const declaration = symbol?.valueDeclaration;
          return ts.isStringLiteral(declaration.initializer) || ts.isNoSubstitutionTemplateLiteral(declaration.initializer);
        } else {
          return ts.isStringLiteral(ele) || ts.isNoSubstitutionTemplateLiteral(ele);
        }
      });
    } else {
      return false;
    }
  },
  intentName: (v: ts.Expression): boolean =>
    v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  domain: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  intentVersion: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  displayName: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  displayDescription: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v),
  schema: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  icon: (v: ts.Expression): boolean => ts.isCallExpression(v) && v !== null &&
    v !== undefined && v.expression.getText() === '$r',
  llmDescription: (v: ts.Expression): boolean => v !== null &&
    v !== undefined &&
    ts.isStringLiteral(v) &&
    v.text.trim() !== '',
  uri: (v: ts.Expression): boolean => v !== null &&
    v !== undefined && ts.isStringLiteral(v)

};
IntentLinkInfoChecker.nestedCheckers = new Map([['paramsMapping', IntentLinkParamsChecker]]);
