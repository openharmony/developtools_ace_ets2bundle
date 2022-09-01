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

exports.source = `
import { router1, router2 } from "@system.router";
import { app } from "@system.router";
import { fetch } from "@system.fetch";

import { router1, router2, router3 } = require('@system.router');
import { app1, app2 } = require('@system.app');
import { fetch } = require('@system.fetch');

import router from "@system.router"
import app from "@system.router"
import fetch from "@system.fetch"

import router = require('@system.router')
import app = require('@system.app')
import fetch = require('@system.fetch')

import fetch from '@ohos.net.http'

import hello from 'libhello.so'
import world = require('libworld.so')`

exports.expectResult =
`"use strict";
let __generate__Id = 0;
function generateId() {
    return "importSystemApi_" + ++__generate__Id;
}
var { router1, router2 } = globalThis.requireNativeModule('system.router');
var { app } = globalThis.requireNativeModule('system.router');
var { fetch } = isSystemplugin('fetch', 'system') ? globalThis.systemplugin.fetch : globalThis.requireNapi('fetch');
var { router1, router2, router3 } = globalThis.requireNativeModule('system.router');
var { app1, app2 } = globalThis.requireNativeModule('system.app');
var { fetch } = isSystemplugin('fetch', 'system') ? globalThis.systemplugin.fetch : globalThis.requireNapi('fetch');
var router = globalThis.requireNativeModule('system.router');
var app = globalThis.requireNativeModule('system.router');
var fetch = isSystemplugin('fetch', 'system') ? globalThis.systemplugin.fetch : globalThis.requireNapi('fetch');
var router = globalThis.requireNativeModule('system.router');
var app = globalThis.requireNativeModule('system.app');
var fetch = isSystemplugin('fetch', 'system') ? globalThis.systemplugin.fetch : globalThis.requireNapi('fetch');
var fetch = globalThis.requireNapi('net.http') || (isSystemplugin('net.http', 'ohos') ? globalThis.ohosplugin.net.http : isSystemplugin('net.http', 'system') ? globalThis.systemplugin.net.http : undefined);
var hello = globalThis.requireNapi("hello", true);
var world = globalThis.requireNapi("world", true);
`
