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


export enum InteroperAbilityNames {
    ARKTS_1_1 = '1.1',
    ARKTS_1_2 = '1.2',
    ARKUICOMPATIBLE = 'compatibleComponent',
    INVOKE = '$_invoke',
    FACTORY = 'factory',
    INITIALIZERS = 'initializers',
    REUSEID = 'reuseId',
    CONTENT = 'content',
    CONSTRUCTOR = 'constructor',
    GETCOMPATIBLESTATE = 'getCompatibleState',
    INTEROP = 'arkui.component.interop',
    STORAGE = 'storage',
}

export enum InteropInternalNames {
    PARENT = '__Interop_Parent_Internal',
    INSTANCE = '__Interop_Instance_Internal',
    PARAM = '__Interop_Param_Internal',
    EXTRAINFO = '__Interop_ExtraInfo_Internal',
    COMPONENT = '__Interop_Component_Internal',
    GLOBAL = '__Interop_Global_Internal',
    PARAMSLAMBDA = '__Interop_Paramslambda_Internal',
    ELMTID = '__Interop_ElmtId_Internal',
}


export enum ESValueMethodNames {
    ESVALUE = 'ESValue',
    INITEMPTYOBJECT = 'instantiateEmptyObject',
    SETPROPERTY = 'setProperty',
    GETPROPERTY = 'getProperty',
    INSTANTIATE = 'instantiate',
    INVOKE = 'invoke',
    INVOKEMETHOD = 'invokeMethod',
    LOAD = 'load',
    WRAP = 'wrap',
    WRAPINT = 'wrapInt',
    WRAPSTRING = 'wrapString',
    UNWRAP = 'unwrap',
}

export enum BuilderMethodNames {
    RUNPENDINGJOBS = 'runPendingJobs',
    CREATECOMPATIBLENODE = 'createCompatibleNode',
    TRANSFERCOMPATIBLEBUILDER = 'transferCompatibleBuilder',
    TRANSFERCOMPATIBLEUPDATABLEBUILDER = 'transferCompatibleUpdatableBuilder',
}

export enum BuilderParams {
    PARAM_WRAPPED_KEY = 'param_wrapped_key',
    INSTANCEPARAM = 'instanceParam',
    PARAM_WRAPPED = 'param_wrapped',
    PARAM_WRAPPED_IT = 'param_wrapped_it'
}

export const GLOBAL_ANNOTATION_MODULE = 'dynamic/@ohos.arkui.GlobalAnnotation';
