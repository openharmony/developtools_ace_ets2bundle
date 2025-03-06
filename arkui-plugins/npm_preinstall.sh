#!/bin/bash
# coding: utf-8
# Copyright (c) 2025 Huawei Device Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

if [ "$1" == "--init" ]; then
    cd ../koala-wrapper
    npm install
    npm run compile
    npm link

    cd ../ts_wrapper
    npm install
    npm run compile
    npm link

    cd ../arkui-plugins
    mkdir node_modules
    npm link @koalaui/libarkts
fi