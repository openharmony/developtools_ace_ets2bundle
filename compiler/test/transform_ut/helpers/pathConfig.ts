/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
export const UT_PAGES: string[] = [
  'import/import@CustomDialog',
  'import/import@Observed',
  'import/importAllEts',
  'import/importEts',
  'import/importExportEts',
  'import/importExportNest',
  'import/importSystemApi',
  'import/importTs',

  'inner_commponent_transform/$$_component/$$_component',
  'inner_commponent_transform/custom_component/custom_component',
  'inner_commponent_transform/gesture_component/longPressGesture',
  'inner_commponent_transform/gesture_component/panGestrue',
  'inner_commponent_transform/gesture_component/pinchGesture',
  'inner_commponent_transform/gesture_component/rotationGesture',
  'inner_commponent_transform/gesture_component/swipeGesture',
  'inner_commponent_transform/gesture_component/tapGesture',
  'inner_commponent_transform/render_component/forEach/forEach',
  'inner_commponent_transform/render_component/forEach/forEachSecondFunction',
  'inner_commponent_transform/render_component/forEach/forEachTwo',
  'inner_commponent_transform/render_component/if/if',
  'inner_commponent_transform/render_component/lazyForEach/lazyForEach',
  'inner_commponent_transform/simple_component/button/button',
  'inner_commponent_transform/transition_component/animateTo/animateTo',
  'inner_commponent_transform/transition_component/pageTransition/pageTransition',

  'render_decorator/@builder/@builder',
  'render_decorator/@builder/@builderWithForEach',
  'render_decorator/@builder/@builderWithLinkData',
  'render_decorator/@builderParam/@builderParam',
  'render_decorator/@customDialog/@customDialog',
  'render_decorator/@extend/@extend',
  'render_decorator/@preview/@preview',
  'render_decorator/@styles/@styles',
  'render_decorator/@styles/@stylesExport',

  'ui_state_management/application_state_management/@storageLink/@storageLink',
  'ui_state_management/application_state_management/@storageProp/@storageProp',
  'ui_state_management/application_state_management/appStorage/appStorage',
  'ui_state_management/application_state_management/localStorage/localStorage',
  'ui_state_management/inner_struct_state_management/@link/@link',
  'ui_state_management/inner_struct_state_management/@prop/@prop',
  'ui_state_management/others/@consume_@provide/@consume_@provide',
  'ui_state_management/others/@observed_@objectLink/@observed_@objectLink',
  'ui_state_management/others/@watch/@watch'
];

export const UT_PARTIAL_UPFATE_PAGES: string[] = [
  'import/import@CustomDialog',
  'import/import@Observed',
  'import/importAllEts',
  'import/importEts',
  'import/importExportEts',
  'import/importExportNest',
  'import/importTs',

  'inner_component_transform/$$_component/$$_component',
  'inner_component_transform/$$_component/$$_componentCheck1',
  'inner_component_transform/$$_component/$$_componentCheck2',
  'inner_component_transform/$$_component/$$_componentCheck3',
  'inner_component_transform/$$_component/$$_componentCheck4',
  'inner_component_transform/$$_component/$$_componentCheck5',
  'inner_component_transform/$$_component/$$_componentCheck6',
  'inner_component_transform/$$_component/$$_componentCheck7',
  'inner_component_transform/$$_component/$$_componentCheck8',
  'inner_component_transform/$$_component/$$_componentCheck9',
  'inner_component_transform/$$_component/$$_if_elseIf_else',
  'inner_component_transform/custom_component/component_object',
  'inner_component_transform/custom_component/custom_component',
  'inner_component_transform/gesture_component/GestureModeParallel',
  'inner_component_transform/gesture_component/longPressGesture',
  'inner_component_transform/gesture_component/panGestrue',
  'inner_component_transform/gesture_component/pinchGesture',
  'inner_component_transform/gesture_component/rotationGesture',
  'inner_component_transform/gesture_component/swipeGesture',
  'inner_component_transform/gesture_component/tapGesture',
  'inner_component_transform/render_component/foreach/foreach',
  'inner_component_transform/render_component/foreach/forEachSecondFunction',
  'inner_component_transform/render_component/foreach/forEachThreeParam',
  'inner_component_transform/render_component/foreach/forEachTwo',
  'inner_component_transform/render_component/if/id_if',
  'inner_component_transform/render_component/if/if',
  'inner_component_transform/render_component/item/GridItem',
  'inner_component_transform/render_component/item/ListItem',
  'inner_component_transform/render_component/lazyforeach/lazyforeach',
  'inner_component_transform/render_component/lazyforeach/lazyforEachThreeParam',
  'inner_component_transform/render_component/repeat/repeat',
  'inner_component_transform/render_component/repeat/repeatAttr',
  'inner_component_transform/render_component/repeat/repeatVirtualScroll',
  'inner_component_transform/render_component/tab/tab',
  'inner_component_transform/simple_component/button/button',
  'inner_component_transform/simple_component/xcomponent/XComponentContainer',
  'inner_component_transform/transition_component/animateTo/animateTo',
  'inner_component_transform/transition_component/navDestination_component/navDestination_component',
  'inner_component_transform/transition_component/navigation/navigation_component',
  'inner_component_transform/transition_component/pageTransition/pageTransition',

  'render_decorator/@AnimatableExtend/animatableExtend',
  'render_decorator/@builder/@builder',
  'render_decorator/@builder/@builderDynamicUsage$$',
  'render_decorator/@builder/@builderOrComponentAsName',
  'render_decorator/@builder/@builderSimplifyAfferent',
  'render_decorator/@builder/@builderTransFormFirst',
  'render_decorator/@builder/@builderTransFormFourth',
  'render_decorator/@builder/@builderTransFormSecond',
  'render_decorator/@builder/@builderTransFormThird',
  'render_decorator/@builder/@builderVisilibity$$',
  'render_decorator/@builder/@builderWithComponent',
  'render_decorator/@builder/@builderWithForEach',
  'render_decorator/@builder/@builderWithLinkData',
  'render_decorator/@builder/handleCustomBuilder',
  'render_decorator/@builderParam/@builderParam',
  'render_decorator/@builderParam/@builderParamQuestionMark',
  'render_decorator/@builderParam/@BuilderParamReturnType',
  'render_decorator/@componentParent/@componentParent',
  'render_decorator/@customDialog/@customDialog',
  'render_decorator/@extend/@extend',
  'render_decorator/@localBuilder/@localBuilder',
  'render_decorator/@preview/@preview',
  'render_decorator/@recycle/recycle_$$component',
  'render_decorator/@recycle/recycle_extend_styles',
  'render_decorator/@recycle/recycle_function_array',
  'render_decorator/@recycle/recycle_gesture',
  'render_decorator/@recycle/recycle_reuseId',
  'render_decorator/@recycle/recycle',
  'render_decorator/@styles/@styles',
  'render_decorator/@styles/@stylesExport',
  'render_decorator/@styles/@stylesOrComponentAsName',

  'ui_context/build_ui_in_correct_place',

  'ui_state_management/application_state_management/@storageLink/@storageLink',
  'ui_state_management/application_state_management/@storageProp/@storageProp',
  'ui_state_management/application_state_management/appStorage/appStorage',
  'ui_state_management/application_state_management/localStorage/localStorage',
  'ui_state_management/application_state_management/localStorage/localStorageForBoth',
  'ui_state_management/application_state_management/localStorage/localStorageForChainCall',
  'ui_state_management/application_state_management/localStorage/localStorageForRoute',
  'ui_state_management/application_state_management/localStorage/localStorageForStorage',
  'ui_state_management/application_state_management/localStorage/localStorageForThree',
  'ui_state_management/application_state_management/localStorage/localStorageForThreeParam',
  'ui_state_management/application_state_management/localStorage/localStorageParam',
  'ui_state_management/inner_struct_state_management/@link/@link',
  'ui_state_management/inner_struct_state_management/@objectLink/@objectLink',
  'ui_state_management/inner_struct_state_management/@prop/@prop',
  'ui_state_management/inner_struct_state_management/@prop/@propComplexType',
  'ui_state_management/inner_struct_state_management/@state/@state',
  'ui_state_management/others/@consume_@provide/@consume_@provide',
  'ui_state_management/others/@observed_@objectLink/@observed_@objectLink',
  'ui_state_management/others/@watch/@watch',
  'ui_state_management/others/decoratorKeyCheck/decoratorKeyCheck',

  'v2_component_decorator/builderParamStyles',
  'v2_component_decorator/param_event_twoway_binding',
  'v2_component_decorator/staticComponentMember'
];

export const UT_VALIDATE_PAGES_PREVIEW: string[] = [];

export const UT_VALIDATE_PAGES: string[] = [
  'Decorators/process_component_build/@BuilderParam',
  'Decorators/process_component_build/arkUIComponent',
  'Decorators/process_component_build/arkUIStandard',
  'Decorators/process_component_build/attributeCheck',
  'Decorators/process_component_build/buttonCheck',
  'Decorators/process_component_build/checkNonspecificParents',
  'Decorators/process_component_build/foreachParamCheck',
  'Decorators/process_component_build/idCheck',
  'Decorators/process_component_build/ifComponent',
  'Decorators/process_component_build/rootContainerCheck',
  'Decorators/process_component_build/stateStyles',

  'Decorators/process_component_class/@StylesParamChack',
  'Decorators/process_component_class/processComponentMethod',
  'Decorators/process_component_class/updateHeritageClauses',
  'Decorators/process_component_class/validateBuildMethodCount',
  'Decorators/process_component_class/validateDecorators',
  'Decorators/process_component_class/validateHasController',

  'Decorators/process_component_member/@linkInitialize',
  'Decorators/process_component_member/@objectLinkInitialize',
  'Decorators/process_component_member/processWatch',
  'Decorators/process_component_member/updateBuilderParamProperty',
  'Decorators/process_component_member/validateCustomDecorator',
  'Decorators/process_component_member/validateDuplicateDecorator',
  'Decorators/process_component_member/validateForbiddenUseStateType',
  'Decorators/process_component_member/validateHasIllegalDecoratorInEntry',
  'Decorators/process_component_member/validateHasIllegalQuestionToken',
  'Decorators/process_component_member/validateMultiDecorators',
  'Decorators/process_component_member/validateNonObservedClassType',
  'Decorators/process_component_member/validatePropertyDefaultValue',
  'Decorators/process_component_member/validatePropertyNonDefaultValue',
  'Decorators/process_component_member/validatePropertyNonType',
  'Decorators/process_component_member/validateWatchDecorator',
  'Decorators/process_component_member/validateWatchParam',

  'Decorators/process_custom_component/checkBuilder$$',
  'Decorators/process_custom_component/v2DecoratorInitFromParent',
  'Decorators/process_custom_component/validateForbiddenToInitViaParam',
  'Decorators/process_custom_component/validateIllegalInitFromParent',
  'Decorators/process_custom_component/validateInitDecorator',
  'Decorators/process_custom_component/validateMandatoryToInitViaParam',
  'Decorators/process_custom_component/validateNonLinkWithDollar',
  'Decorators/process_custom_component/validateParamTwoWayBind',

  'Decorators/process_struct_componentV2/param_require_once_check',
  'Decorators/process_struct_componentV2/v2Component_member_type_check',

  'Decorators/process_ui_syntax/EntryDecoParam',
  'Decorators/process_ui_syntax/ExtendOneChild',
  'Decorators/process_ui_syntax/NoSrc',
  'Decorators/process_ui_syntax/NotSupportResrcParam',
  'Decorators/process_ui_syntax/NotSupportResrcType',
  'Decorators/process_ui_syntax/StylesNoParam',
  'Decorators/process_ui_syntax/UnknownSrc',
  'Decorators/process_ui_syntax/UnknownSrcName',
  'Decorators/process_ui_syntax/UnknownSrcType',

  'Decorators/v1AndV2ComponentDecorators/property_observe_validate',
  'Decorators/v1AndV2ComponentDecorators/v1ToV2Component',
  'Decorators/v1AndV2ComponentDecorators/v1ToV2ComponentValidate',
  'Decorators/v1AndV2ComponentDecorators/v2ToV1ComponentValidate',
  'Decorators/v1AndV2ComponentDecorators/v2ToV1Link',

  'Decorators/vaildate_ui_syntax/@localBuilder',
  'Decorators/vaildate_ui_syntax/@Monitor',
  'Decorators/vaildate_ui_syntax/@Trace',
  'Decorators/vaildate_ui_syntax/@Type',
  'Decorators/vaildate_ui_syntax/componentV2BothWithComponent',
  'Decorators/vaildate_ui_syntax/ExceededEntry',
  'Decorators/vaildate_ui_syntax/ExceededPreview',
  'Decorators/vaildate_ui_syntax/MethodNoExtend',
  'Decorators/vaildate_ui_syntax/mutiDecoratorInComponentV2',
  'Decorators/vaildate_ui_syntax/NoChild',
  'Decorators/vaildate_ui_syntax/NoStructDeco',
  'Decorators/vaildate_ui_syntax/notComponent',
  'Decorators/vaildate_ui_syntax/notConcurrent',
  'Decorators/vaildate_ui_syntax/notConcurrentFun',
  'Decorators/vaildate_ui_syntax/notConcurrentFunAster',
  'Decorators/vaildate_ui_syntax/notDecorator',
  'Decorators/vaildate_ui_syntax/notMethodDeco',
  'Decorators/vaildate_ui_syntax/OneChild',
  'Decorators/vaildate_ui_syntax/OneEntry',
  'Decorators/vaildate_ui_syntax/OnlyStructDeco',
  'Decorators/vaildate_ui_syntax/state',
  'Decorators/vaildate_ui_syntax/StructNameInvalid',
  'Decorators/vaildate_ui_syntax/StylesDuplicate',
  'Decorators/vaildate_ui_syntax/v1DecoratorInComponentV2',
  'Decorators/vaildate_ui_syntax/v2DecoratorInClass',
  'Decorators/vaildate_ui_syntax/v2DecoratorInComponent',
  'Decorators/vaildate_ui_syntax/v2MemberDecorator',
  'Decorators/vaildate_ui_syntax/vaildateDecorator',
  'Decorators/vaildate_ui_syntax/validate_track_observed',
  'Decorators/vaildate_ui_syntax/validateAccessQualifier',
  'Decorators/vaildate_ui_syntax/validateDifferentMethod',
  'Decorators/vaildate_ui_syntax/validateDuplicateMethod'
]

export const UT_VALIDATE_PAGES_JSBUNDLE: string[] = [
  'Decorators/process_import/validateModuleName',
]

export const CACHE_PATH: string = 'default/cache/default/default@CompileArkTS/esmodule/debug';
export const AN_BUILD_OUTPUT_PATH: string = 'default/intermediates/loader_out/default/an/arm64-v8a';
export const MODULE_ID_ROLLUP_PLACEHOLDER: string = "\x00rollup_plugin_ignore_empty_module_placeholder";
export const NODE_MODULES_PATH: string = "default/intermediates/loader_out/default/node_modules";
export const ACE_PROFILE_PATH: string = 'default/intermediates/res/default/resources/base/profile';
export const LOADER_PATH: string = 'default/intermediates/loader/default';
export const MAIN_PATH: string = 'default/intermediates/loader_out/default/ets'; 
export const PREVIEW_CACHE_PATH: string = 'default/cache/default/default@PreviewArkTS/esmodule/debug'; 
export const PREVIEW_MAIN_PATH: string = 'default/intermediates/assets/default/ets'; 
export const PROJECT_PATH_HASH_DEFAULT: string = 'this_is_a_project_path_hash'; 
export const RES_PATH: string = 'default/intermediates/res/default';
export const OH_MODULES_OHPM_HYPIUM: string = 'oh_modules/.ohpm/@ohos+hypium@1.0.6/oh_modules/@ohos/hypium';
export const OH_MODULES_OHOS_HYPIUM: string = 'oh_modules/@ohos/hypium';