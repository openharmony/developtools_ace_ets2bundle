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

import * as path from 'path';
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/link';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'link-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Link decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'link-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Link as Link } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct LinkParent extends CustomComponent<LinkParent, __Options_LinkParent> {
  public __initializeStruct(initializers: (__Options_LinkParent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___184416899 = initializers;
    (((gensym___184416899) == (null)) ? undefined : gensym___184416899.__options_has_linkVar1)})) {
      this.__backing_linkVar1 = STATE_MGMT_FACTORY.makeLink<string>(this, "linkVar1", initializers!.__backing_linkVar1!);
    };
    if (({let gensym___82966591 = initializers;
    (((gensym___82966591) == (null)) ? undefined : gensym___82966591.__options_has_linkVar2)})) {
      this.__backing_linkVar2 = STATE_MGMT_FACTORY.makeLink<number>(this, "linkVar2", initializers!.__backing_linkVar2!);
    };
    if (({let gensym___55498955 = initializers;
    (((gensym___55498955) == (null)) ? undefined : gensym___55498955.__options_has_linkVar3)})) {
      this.__backing_linkVar3 = STATE_MGMT_FACTORY.makeLink<boolean>(this, "linkVar3", initializers!.__backing_linkVar3!);
    };
    if (({let gensym___231322030 = initializers;
    (((gensym___231322030) == (null)) ? undefined : gensym___231322030.__options_has_linkVar4)})) {
      this.__backing_linkVar4 = STATE_MGMT_FACTORY.makeLink<undefined>(this, "linkVar4", initializers!.__backing_linkVar4!);
    };
    if (({let gensym___2576517 = initializers;
    (((gensym___2576517) == (null)) ? undefined : gensym___2576517.__options_has_linkVar5)})) {
      this.__backing_linkVar5 = STATE_MGMT_FACTORY.makeLink<null>(this, "linkVar5", initializers!.__backing_linkVar5!);
    };
  }

  public __updateStruct(initializers: (__Options_LinkParent | undefined)): void {}

  private __backing_linkVar1?: ILinkDecoratedVariable<string>;

  public get linkVar1(): string {
    return this.__backing_linkVar1!.get();
  }

  public set linkVar1(value: string) {
    this.__backing_linkVar1!.set(value);
  }

  private __backing_linkVar2?: ILinkDecoratedVariable<number>;

  public get linkVar2(): number {
    return this.__backing_linkVar2!.get();
  }

  public set linkVar2(value: number) {
    this.__backing_linkVar2!.set(value);
  }

  private __backing_linkVar3?: ILinkDecoratedVariable<boolean>;

  public get linkVar3(): boolean {
    return this.__backing_linkVar3!.get();
  }

  public set linkVar3(value: boolean) {
    this.__backing_linkVar3!.set(value);
  }

  private __backing_linkVar4?: ILinkDecoratedVariable<undefined>;

  public get linkVar4(): undefined {
    return this.__backing_linkVar4!.get();
  }

  public set linkVar4(value: undefined) {
    this.__backing_linkVar4!.set(value);
  }

  private __backing_linkVar5?: ILinkDecoratedVariable<null>;

  public get linkVar5(): null {
    return this.__backing_linkVar5!.get();
  }

  public set linkVar5(value: null) {
    this.__backing_linkVar5!.set(value);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: LinkParent)=> void), initializers: ((()=> __Options_LinkParent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<LinkParent, __Options_LinkParent>(style, ((): LinkParent => {
      return new LinkParent(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_LinkParent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): LinkParent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {}

  ${dumpConstructor()}

}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Component() export interface __Options_LinkParent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar1', '(string | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar1', '(LinkSourceType<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar2', '(number | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar2', '(LinkSourceType<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar3', '(boolean | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar3', '(LinkSourceType<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar4', '(undefined | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar4', '(LinkSourceType<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar5', '(null | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar5', '(LinkSourceType<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar5', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Link decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
