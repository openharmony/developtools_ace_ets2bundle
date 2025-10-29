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

const path = require('path');

const rootPath = path.resolve(__dirname, '../../../');
const sdkPath = path.resolve(rootPath, './out/sdk/ohos-sdk/linux/ets/static');
const pandaSdkPath = path.resolve(sdkPath, './build-tools/ets2panda');
const apiPath = path.resolve(sdkPath, './api');
const kitPath = path.resolve(sdkPath, './kits');

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest'],
    },
    testRegex: './test/ut/.+\\.test\\.ts$',
    testPathIgnorePatterns: [
        // Issue about method parameter initialization lowering are not visible
        './test/ut/memo-plugins/method-declarations/internal-calls.test.ts',
        './test/ut/memo-plugins/function-declarations/complex-memo-intrinsic.test.ts',

        // Issue about method parameter type changes are not visible
        './test/ut/ui-plugins/decorators/builder-param/builder-param-passing.test.ts',
        './test/ut/ui-plugins/decorators/builder-param/optional-builder-param.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/with-builder.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/block-in-switch-case.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/else-if-in-content.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/if-else-in-content.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/switch-case-in-content.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/if-in-switch-in-content.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/if-break-in-nested-content.test.ts',
        './test/ut/ui-plugins/builder-lambda/condition-scope/switch-in-if-in-content.test.ts',
        './test/ut/ui-plugins/wrap-builder/wrap-builder-in-generic.test.ts',
        './test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts',
        './test/ut/ui-plugins/wrap-builder/builder-in-generic.test.ts',
        './test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts',
        './test/ut/memo-plugins/method-declarations/argument-call.test.ts',
        './test/ut/memo-plugins/method-declarations/declare-and-call.test.ts',
        './test/ut/memo-plugins/method-declarations/non-void-method.test.ts',
        './test/ut/memo-plugins/method-declarations/callable.test.ts',
        './test/ut/memo-plugins/lambda-literals/with-receiver.test.ts',
        './test/ut/memo-plugins/lambda-literals/argument-call.test.ts',
        './test/ut/memo-plugins/lambda-literals/trailing-lambdas.test.ts',
        './test/ut/memo-plugins/function-declarations/internal-memo-arg.test.ts',
        './test/ut/memo-plugins/function-declarations/argument-call.test.ts',
        
        // Issue about interface setter's parameter type changes are not visible
        './test/ut/ui-plugins/decorators/storagelink/storagelink-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/storagelink/storagelink-primitive-type.test.ts',
        './test/ut/ui-plugins/decorators/local/local-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/local/local-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/local/static-local.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/provide-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/provide-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/provide-annotation-usage.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/consume-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/consume-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/provide-and-consume/provide-to-consume.test.ts',
        './test/ut/ui-plugins/decorators/provider-and-consumer/consumer-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/provider-and-consumer/provider-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/provider-and-consumer/provider-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/provider-and-consumer/consumer-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/provider-and-consumer/provider-to-consumer.test.ts',
        './test/ut/ui-plugins/decorators/state/state-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/state/state-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/state/state-to-state.test.ts',
        './test/ut/ui-plugins/decorators/prop-ref/prop-ref-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/prop-ref/prop-ref-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/prop-ref/prop-ref-without-initialization.test.ts',
        './test/ut/ui-plugins/decorators/prop-ref/state-to-propref.test.ts',
        './test/ut/ui-plugins/decorators/param/param-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/param/param-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/param/param-with-require.test.ts',
        './test/ut/ui-plugins/decorators/link/link-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/link/link-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/link/state-to-link.test.ts',
        './test/ut/ui-plugins/decorators/link/link-to-link-propref-state.test.ts',
        './test/ut/ui-plugins/decorators/custom-dialog/declare-custom-dialog.test.ts',
        './test/ut/ui-plugins/decorators/monitor/monitor-before-state-variable.test.ts',
        './test/ut/ui-plugins/decorators/monitor/enum-monitor-params.test.ts',
        './test/ut/ui-plugins/decorators/monitor/monitor-params.test.ts',
        './test/ut/ui-plugins/decorators/monitor/monitor-params.test.ts',
        './test/ut/ui-plugins/decorators/monitor/monitor-in-struct.test.ts',
        './test/ut/ui-plugins/decorators/localstoragelink/localstoragelink-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/localstoragelink/localstoragelink-primitive-type.test.ts',
        './test/ut/ui-plugins/decorators/computed/computed-no-return-type.test.ts',
        './test/ut/ui-plugins/decorators/computed/computed-in-struct.test.ts',
        './test/ut/ui-plugins/decorators/computed/static-computed.test.ts',
        './test/ut/ui-plugins/decorators/storagelink/storagelink-appstorage.test.ts',
        './test/ut/ui-plugins/decorators/storageprop-ref/storageprop-ref-primitive-type.test.ts',
        './test/ut/ui-plugins/decorators/storageprop-ref/storageprop-ref-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/localstorageprop-ref/localstorageprop-ref-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/localstorageprop-ref/localstorageprop-ref-primitive-type.test.ts',
        './test/ut/ui-plugins/decorators/decorator-no-type.test.ts',
        './test/ut/ui-plugins/decorators/reusable/reusable-basic.test.ts',
        './test/ut/ui-plugins/decorators/reusable/reusable-complex.test.ts',
        './test/ut/ui-plugins/decorators/objectlink/objectlink-observed.test.ts',
        './test/ut/ui-plugins/decorators/objectlink/objectlink-basic.test.ts',
        './test/ut/ui-plugins/decorators/once/once-basic-type.test.ts',
        './test/ut/ui-plugins/decorators/once/once-complex-type.test.ts',
        './test/ut/ui-plugins/decorators/once/once-only.test.ts',
        './test/ut/ui-plugins/decorators/once/once-with-require.test.ts',
        './test/ut/ui-plugins/decorators/custom-dialog/controller-in-build.test.ts',
        './test/ut/ui-plugins/decorators/custom-dialog/base-custom-dialog.test.ts',
        './test/ut/ui-plugins/decorators/require/basic-require.test.ts',
        './test/ut/ui-plugins/decorators/watch/watch-basic.test.ts',
        './test/ut/ui-plugins/decorators/event/event-initialize.test.ts',
        './test/ut/ui-plugins/decorators/builder-param/init-with-local-builder.test.ts',
        './test/ut/ui-plugins/component/declare-component.test.ts',
        './test/ut/ui-plugins/double-dollar/double-dollar-toggle.test.ts',
        './test/ut/ui-plugins/double-dollar/double-dollar-griditem.test.ts',
        './test/ut/ui-plugins/wrap-builder/wrap-builder-with-lambda.test.ts',
        './test/ut/ui-plugins/imports/kit-import.test.ts',
        './test/ut/memo-plugins/property-declarations/class-constructor.test.ts',
        './test/ut/memo-plugins/property-declarations/interfaces.test.ts',
        './test/ut/memo-plugins/function-declarations/declare-and-call.test.ts',
    ],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    coverageDirectory: './test/report',
    collectCoverageFrom: [
        'collectors/**',
        'common/**',
        'memo-plugins/**',
        'ui-plugins/**'
    ],
    coveragePathIgnorePatterns: [
        'common/debug.ts',
        'common/etsglobal-remover.ts',
        'common/print-visitor.ts',
        'common/plugin-context.ts',
        'memo-plugins/index.ts',
        'memo-plugins/import-transformer.ts',
        'memo-plugins/memo-transformer.ts',
        'ui-plugins/index.ts',
        'ui-plugins/printer-transformer.ts',
        'ui-plugins/builder-lambda-translators/builder-lambda-transformer.ts',
        'ui-plugins/entry-translators/entry-transformer.ts',
        'ui-plugins/struct-translators/struct-transformer.ts',
    ],
    verbose: true,
    globals: {
        SDK_PATH: sdkPath,
        PANDA_SDK_PATH: pandaSdkPath,
        API_PATH: apiPath,
        KIT_PATH: kitPath,
    },
};
