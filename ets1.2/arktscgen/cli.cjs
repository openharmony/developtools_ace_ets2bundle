#!/usr/bin/env node
/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../node_modules/json5/lib/unicode.js
var require_unicode = __commonJS({
  "../node_modules/json5/lib/unicode.js"(exports2, module2) {
    module2.exports.Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    module2.exports.ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
    module2.exports.ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;
  }
});

// ../node_modules/json5/lib/util.js
var require_util = __commonJS({
  "../node_modules/json5/lib/util.js"(exports2, module2) {
    var unicode = require_unicode();
    module2.exports = {
      isSpaceSeparator(c) {
        return typeof c === "string" && unicode.Space_Separator.test(c);
      },
      isIdStartChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "$" || c === "_" || unicode.ID_Start.test(c));
      },
      isIdContinueChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "$" || c === "_" || c === "\u200C" || c === "\u200D" || unicode.ID_Continue.test(c));
      },
      isDigit(c) {
        return typeof c === "string" && /[0-9]/.test(c);
      },
      isHexDigit(c) {
        return typeof c === "string" && /[0-9A-Fa-f]/.test(c);
      }
    };
  }
});

// ../node_modules/json5/lib/parse.js
var require_parse = __commonJS({
  "../node_modules/json5/lib/parse.js"(exports2, module2) {
    var util = require_util();
    var source;
    var parseState;
    var stack;
    var pos;
    var line;
    var column;
    var token;
    var key;
    var root;
    module2.exports = function parse(text, reviver) {
      source = String(text);
      parseState = "start";
      stack = [];
      pos = 0;
      line = 1;
      column = 0;
      token = void 0;
      key = void 0;
      root = void 0;
      do {
        token = lex();
        parseStates[parseState]();
      } while (token.type !== "eof");
      if (typeof reviver === "function") {
        return internalize({ "": root }, "", reviver);
      }
      return root;
    };
    function internalize(holder, name, reviver) {
      const value = holder[name];
      if (value != null && typeof value === "object") {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const key2 = String(i);
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        } else {
          for (const key2 in value) {
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        }
      }
      return reviver.call(holder, name, value);
    }
    var lexState;
    var buffer;
    var doubleQuote;
    var sign;
    var c;
    function lex() {
      lexState = "default";
      buffer = "";
      doubleQuote = false;
      sign = 1;
      for (; ; ) {
        c = peek();
        const token2 = lexStates[lexState]();
        if (token2) {
          return token2;
        }
      }
    }
    function peek() {
      if (source[pos]) {
        return String.fromCodePoint(source.codePointAt(pos));
      }
    }
    function read() {
      const c2 = peek();
      if (c2 === "\n") {
        line++;
        column = 0;
      } else if (c2) {
        column += c2.length;
      } else {
        column++;
      }
      if (c2) {
        pos += c2.length;
      }
      return c2;
    }
    var lexStates = {
      default() {
        switch (c) {
          case "	":
          case "\v":
          case "\f":
          case " ":
          case "\xA0":
          case "\uFEFF":
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            return;
          case "/":
            read();
            lexState = "comment";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        if (util.isSpaceSeparator(c)) {
          read();
          return;
        }
        return lexStates[parseState]();
      },
      comment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineComment";
            return;
          case "/":
            read();
            lexState = "singleLineComment";
            return;
        }
        throw invalidChar(read());
      },
      multiLineComment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineCommentAsterisk";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
      },
      multiLineCommentAsterisk() {
        switch (c) {
          case "*":
            read();
            return;
          case "/":
            read();
            lexState = "default";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
        lexState = "multiLineComment";
      },
      singleLineComment() {
        switch (c) {
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            lexState = "default";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        read();
      },
      value() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
          case "n":
            read();
            literal("ull");
            return newToken("null", null);
          case "t":
            read();
            literal("rue");
            return newToken("boolean", true);
          case "f":
            read();
            literal("alse");
            return newToken("boolean", false);
          case "-":
          case "+":
            if (read() === "-") {
              sign = -1;
            }
            lexState = "sign";
            return;
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
          case '"':
          case "'":
            doubleQuote = read() === '"';
            buffer = "";
            lexState = "string";
            return;
        }
        throw invalidChar(read());
      },
      identifierNameStartEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
            break;
          default:
            if (!util.isIdStartChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      identifierName() {
        switch (c) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            buffer += read();
            return;
          case "\\":
            read();
            lexState = "identifierNameEscape";
            return;
        }
        if (util.isIdContinueChar(c)) {
          buffer += read();
          return;
        }
        return newToken("identifier", buffer);
      },
      identifierNameEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            break;
          default:
            if (!util.isIdContinueChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      sign() {
        switch (c) {
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", sign * Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
        }
        throw invalidChar(read());
      },
      zero() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
          case "x":
          case "X":
            buffer += read();
            lexState = "hexadecimal";
            return;
        }
        return newToken("numeric", sign * 0);
      },
      decimalInteger() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalPointLeading() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        throw invalidChar(read());
      },
      decimalPoint() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalFraction() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalExponent() {
        switch (c) {
          case "+":
          case "-":
            buffer += read();
            lexState = "decimalExponentSign";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentSign() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentInteger() {
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      hexadecimal() {
        if (util.isHexDigit(c)) {
          buffer += read();
          lexState = "hexadecimalInteger";
          return;
        }
        throw invalidChar(read());
      },
      hexadecimalInteger() {
        if (util.isHexDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      string() {
        switch (c) {
          case "\\":
            read();
            buffer += escape();
            return;
          case '"':
            if (doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "'":
            if (!doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "\n":
          case "\r":
            throw invalidChar(read());
          case "\u2028":
          case "\u2029":
            separatorChar(c);
            break;
          case void 0:
            throw invalidChar(read());
        }
        buffer += read();
      },
      start() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
        }
        lexState = "value";
      },
      beforePropertyName() {
        switch (c) {
          case "$":
          case "_":
            buffer = read();
            lexState = "identifierName";
            return;
          case "\\":
            read();
            lexState = "identifierNameStartEscape";
            return;
          case "}":
            return newToken("punctuator", read());
          case '"':
          case "'":
            doubleQuote = read() === '"';
            lexState = "string";
            return;
        }
        if (util.isIdStartChar(c)) {
          buffer += read();
          lexState = "identifierName";
          return;
        }
        throw invalidChar(read());
      },
      afterPropertyName() {
        if (c === ":") {
          return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforePropertyValue() {
        lexState = "value";
      },
      afterPropertyValue() {
        switch (c) {
          case ",":
          case "}":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforeArrayValue() {
        if (c === "]") {
          return newToken("punctuator", read());
        }
        lexState = "value";
      },
      afterArrayValue() {
        switch (c) {
          case ",":
          case "]":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      end() {
        throw invalidChar(read());
      }
    };
    function newToken(type, value) {
      return {
        type,
        value,
        line,
        column
      };
    }
    function literal(s) {
      for (const c2 of s) {
        const p = peek();
        if (p !== c2) {
          throw invalidChar(read());
        }
        read();
      }
    }
    function escape() {
      const c2 = peek();
      switch (c2) {
        case "b":
          read();
          return "\b";
        case "f":
          read();
          return "\f";
        case "n":
          read();
          return "\n";
        case "r":
          read();
          return "\r";
        case "t":
          read();
          return "	";
        case "v":
          read();
          return "\v";
        case "0":
          read();
          if (util.isDigit(peek())) {
            throw invalidChar(read());
          }
          return "\0";
        case "x":
          read();
          return hexEscape();
        case "u":
          read();
          return unicodeEscape();
        case "\n":
        case "\u2028":
        case "\u2029":
          read();
          return "";
        case "\r":
          read();
          if (peek() === "\n") {
            read();
          }
          return "";
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          throw invalidChar(read());
        case void 0:
          throw invalidChar(read());
      }
      return read();
    }
    function hexEscape() {
      let buffer2 = "";
      let c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    function unicodeEscape() {
      let buffer2 = "";
      let count = 4;
      while (count-- > 0) {
        const c2 = peek();
        if (!util.isHexDigit(c2)) {
          throw invalidChar(read());
        }
        buffer2 += read();
      }
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    var parseStates = {
      start() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push();
      },
      beforePropertyName() {
        switch (token.type) {
          case "identifier":
          case "string":
            key = token.value;
            parseState = "afterPropertyName";
            return;
          case "punctuator":
            pop();
            return;
          case "eof":
            throw invalidEOF();
        }
      },
      afterPropertyName() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        parseState = "beforePropertyValue";
      },
      beforePropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push();
      },
      beforeArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        if (token.type === "punctuator" && token.value === "]") {
          pop();
          return;
        }
        push();
      },
      afterPropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforePropertyName";
            return;
          case "}":
            pop();
        }
      },
      afterArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforeArrayValue";
            return;
          case "]":
            pop();
        }
      },
      end() {
      }
    };
    function push() {
      let value;
      switch (token.type) {
        case "punctuator":
          switch (token.value) {
            case "{":
              value = {};
              break;
            case "[":
              value = [];
              break;
          }
          break;
        case "null":
        case "boolean":
        case "numeric":
        case "string":
          value = token.value;
          break;
      }
      if (root === void 0) {
        root = value;
      } else {
        const parent2 = stack[stack.length - 1];
        if (Array.isArray(parent2)) {
          parent2.push(value);
        } else {
          Object.defineProperty(parent2, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      if (value !== null && typeof value === "object") {
        stack.push(value);
        if (Array.isArray(value)) {
          parseState = "beforeArrayValue";
        } else {
          parseState = "beforePropertyName";
        }
      } else {
        const current = stack[stack.length - 1];
        if (current == null) {
          parseState = "end";
        } else if (Array.isArray(current)) {
          parseState = "afterArrayValue";
        } else {
          parseState = "afterPropertyValue";
        }
      }
    }
    function pop() {
      stack.pop();
      const current = stack[stack.length - 1];
      if (current == null) {
        parseState = "end";
      } else if (Array.isArray(current)) {
        parseState = "afterArrayValue";
      } else {
        parseState = "afterPropertyValue";
      }
    }
    function invalidChar(c2) {
      if (c2 === void 0) {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
      }
      return syntaxError(`JSON5: invalid character '${formatChar(c2)}' at ${line}:${column}`);
    }
    function invalidEOF() {
      return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
    }
    function invalidIdentifier() {
      column -= 5;
      return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`);
    }
    function separatorChar(c2) {
      console.warn(`JSON5: '${formatChar(c2)}' in strings is not valid ECMAScript; consider escaping`);
    }
    function formatChar(c2) {
      const replacements = {
        "'": "\\'",
        '"': '\\"',
        "\\": "\\\\",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "	": "\\t",
        "\v": "\\v",
        "\0": "\\0",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029"
      };
      if (replacements[c2]) {
        return replacements[c2];
      }
      if (c2 < " ") {
        const hexString = c2.charCodeAt(0).toString(16);
        return "\\x" + ("00" + hexString).substring(hexString.length);
      }
      return c2;
    }
    function syntaxError(message) {
      const err = new SyntaxError(message);
      err.lineNumber = line;
      err.columnNumber = column;
      return err;
    }
  }
});

// ../node_modules/json5/lib/stringify.js
var require_stringify = __commonJS({
  "../node_modules/json5/lib/stringify.js"(exports2, module2) {
    var util = require_util();
    module2.exports = function stringify(value, replacer, space) {
      const stack = [];
      let indent = "";
      let propertyList;
      let replacerFunc;
      let gap = "";
      let quote;
      if (replacer != null && typeof replacer === "object" && !Array.isArray(replacer)) {
        space = replacer.space;
        quote = replacer.quote;
        replacer = replacer.replacer;
      }
      if (typeof replacer === "function") {
        replacerFunc = replacer;
      } else if (Array.isArray(replacer)) {
        propertyList = [];
        for (const v of replacer) {
          let item;
          if (typeof v === "string") {
            item = v;
          } else if (typeof v === "number" || v instanceof String || v instanceof Number) {
            item = String(v);
          }
          if (item !== void 0 && propertyList.indexOf(item) < 0) {
            propertyList.push(item);
          }
        }
      }
      if (space instanceof Number) {
        space = Number(space);
      } else if (space instanceof String) {
        space = String(space);
      }
      if (typeof space === "number") {
        if (space > 0) {
          space = Math.min(10, Math.floor(space));
          gap = "          ".substr(0, space);
        }
      } else if (typeof space === "string") {
        gap = space.substr(0, 10);
      }
      return serializeProperty("", { "": value });
      function serializeProperty(key, holder) {
        let value2 = holder[key];
        if (value2 != null) {
          if (typeof value2.toJSON5 === "function") {
            value2 = value2.toJSON5(key);
          } else if (typeof value2.toJSON === "function") {
            value2 = value2.toJSON(key);
          }
        }
        if (replacerFunc) {
          value2 = replacerFunc.call(holder, key, value2);
        }
        if (value2 instanceof Number) {
          value2 = Number(value2);
        } else if (value2 instanceof String) {
          value2 = String(value2);
        } else if (value2 instanceof Boolean) {
          value2 = value2.valueOf();
        }
        switch (value2) {
          case null:
            return "null";
          case true:
            return "true";
          case false:
            return "false";
        }
        if (typeof value2 === "string") {
          return quoteString(value2, false);
        }
        if (typeof value2 === "number") {
          return String(value2);
        }
        if (typeof value2 === "object") {
          return Array.isArray(value2) ? serializeArray(value2) : serializeObject(value2);
        }
        return void 0;
      }
      function quoteString(value2) {
        const quotes = {
          "'": 0.1,
          '"': 0.2
        };
        const replacements = {
          "'": "\\'",
          '"': '\\"',
          "\\": "\\\\",
          "\b": "\\b",
          "\f": "\\f",
          "\n": "\\n",
          "\r": "\\r",
          "	": "\\t",
          "\v": "\\v",
          "\0": "\\0",
          "\u2028": "\\u2028",
          "\u2029": "\\u2029"
        };
        let product = "";
        for (let i = 0; i < value2.length; i++) {
          const c = value2[i];
          switch (c) {
            case "'":
            case '"':
              quotes[c]++;
              product += c;
              continue;
            case "\0":
              if (util.isDigit(value2[i + 1])) {
                product += "\\x00";
                continue;
              }
          }
          if (replacements[c]) {
            product += replacements[c];
            continue;
          }
          if (c < " ") {
            let hexString = c.charCodeAt(0).toString(16);
            product += "\\x" + ("00" + hexString).substring(hexString.length);
            continue;
          }
          product += c;
        }
        const quoteChar = quote || Object.keys(quotes).reduce((a, b) => quotes[a] < quotes[b] ? a : b);
        product = product.replace(new RegExp(quoteChar, "g"), replacements[quoteChar]);
        return quoteChar + product + quoteChar;
      }
      function serializeObject(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let keys = propertyList || Object.keys(value2);
        let partial = [];
        for (const key of keys) {
          const propertyString = serializeProperty(key, value2);
          if (propertyString !== void 0) {
            let member = serializeKey(key) + ":";
            if (gap !== "") {
              member += " ";
            }
            member += propertyString;
            partial.push(member);
          }
        }
        let final;
        if (partial.length === 0) {
          final = "{}";
        } else {
          let properties;
          if (gap === "") {
            properties = partial.join(",");
            final = "{" + properties + "}";
          } else {
            let separator = ",\n" + indent;
            properties = partial.join(separator);
            final = "{\n" + indent + properties + ",\n" + stepback + "}";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
      function serializeKey(key) {
        if (key.length === 0) {
          return quoteString(key, true);
        }
        const firstChar = String.fromCodePoint(key.codePointAt(0));
        if (!util.isIdStartChar(firstChar)) {
          return quoteString(key, true);
        }
        for (let i = firstChar.length; i < key.length; i++) {
          if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
            return quoteString(key, true);
          }
        }
        return key;
      }
      function serializeArray(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let partial = [];
        for (let i = 0; i < value2.length; i++) {
          const propertyString = serializeProperty(String(i), value2);
          partial.push(propertyString !== void 0 ? propertyString : "null");
        }
        let final;
        if (partial.length === 0) {
          final = "[]";
        } else {
          if (gap === "") {
            let properties = partial.join(",");
            final = "[" + properties + "]";
          } else {
            let separator = ",\n" + indent;
            let properties = partial.join(separator);
            final = "[\n" + indent + properties + ",\n" + stepback + "]";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
    };
  }
});

// ../node_modules/json5/lib/index.js
var require_lib = __commonJS({
  "../node_modules/json5/lib/index.js"(exports2, module2) {
    var parse = require_parse();
    var stringify = require_stringify();
    var JSON57 = {
      parse,
      stringify
    };
    module2.exports = JSON57;
  }
});

// ../node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @constructor
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       * @constructor
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// ../node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @api private
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {any} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// ../node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        if (cmd._hasImplicitHelpCommand()) {
          const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
          const helpCommand = cmd.createCommand(helpName).helpOption(false);
          helpCommand.description(cmd._helpCommandDescription);
          if (helpArgs) helpCommand.arguments(helpArgs);
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns number
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
        const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
        if (showShortHelpFlag || showLongHelpFlag) {
          let helpOption;
          if (!showShortHelpFlag) {
            helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
          } else if (!showLongHelpFlag) {
            helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
          } else {
            helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
          }
          visibleOptions.push(helpOption);
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
          const visibleOptions = parentCmd.options.filter((option) => !option.hidden);
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd._args.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd._args.find((argument) => argument.description)) {
          return cmd._args;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd._args.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let parentCmdNames = "";
        for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
          parentCmdNames = parentCmd.name() + " " + parentCmdNames;
        }
        return parentCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([helper.wrap(commandDescription, helpWidth, 0), ""]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(helper.optionTerm(option), helper.optionDescription(option));
          });
          if (globalOptionList.length > 0) {
            output = output.concat(["Global Options:", formatList(globalOptionList), ""]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent)) return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth) return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(`
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, "g");
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n") return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// ../node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {any} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {any} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {string | string[]} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {Object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @api private
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       * @api private
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @api private
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @api private
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {any} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.splitOptionFlags = splitOptionFlags;
    exports2.DualOptions = DualOptions;
  }
});

// ../node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance) return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// ../node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("events").EventEmitter;
    var childProcess = require("child_process");
    var path7 = require("path");
    var fs11 = require("fs");
    var process2 = require("process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, splitOptionFlags, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this._args = [];
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._hasHelpOption = true;
        this._helpFlags = "-h, --help";
        this._helpDescription = "display help for command";
        this._helpShortFlag = "-h";
        this._helpLongFlag = "--help";
        this._addImplicitHelpCommand = void 0;
        this._helpCommandName = "help";
        this._helpCommandnameAndArgs = "help [command]";
        this._helpCommandDescription = "display help for command";
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._hasHelpOption = sourceCommand._hasHelpOption;
        this._helpFlags = sourceCommand._helpFlags;
        this._helpDescription = sourceCommand._helpDescription;
        this._helpShortFlag = sourceCommand._helpShortFlag;
        this._helpLongFlag = sourceCommand._helpLongFlag;
        this._helpCommandName = sourceCommand._helpCommandName;
        this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
        this._helpCommandDescription = sourceCommand._helpCommandDescription;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {Object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this.commands.push(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {Object} [configuration] - configuration options
       * @return {Command|Object} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {Object} [configuration] - configuration options
       * @return {Command|Object} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {boolean|string} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {Object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this.commands.push(cmd);
        cmd.parent = this;
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {Function|*} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this._args.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
        }
        this._args.push(argument);
        return this;
      }
      /**
       * Override default decision whether to add implicit help command.
       *
       *    addHelpCommand() // force on
       *    addHelpCommand(false); // force off
       *    addHelpCommand('help [cmd]', 'display help for [cmd]'); // force on with custom details
       *
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(enableOrNameAndArgs, description) {
        if (enableOrNameAndArgs === false) {
          this._addImplicitHelpCommand = false;
        } else {
          this._addImplicitHelpCommand = true;
          if (typeof enableOrNameAndArgs === "string") {
            this._helpCommandName = enableOrNameAndArgs.split(" ")[0];
            this._helpCommandnameAndArgs = enableOrNameAndArgs;
          }
          this._helpCommandDescription = description || this._helpCommandDescription;
        }
        return this;
      }
      /**
       * @return {boolean}
       * @api private
       */
      _hasImplicitHelpCommand() {
        if (this._addImplicitHelpCommand === void 0) {
          return this.commands.length && !this._actionHandler && !this._findCommand("help");
        }
        return this._addImplicitHelpCommand;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @api private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this._args.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(name, option.defaultValue === void 0 ? true : option.defaultValue, "default");
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        this.options.push(option);
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            try {
              val = option.parseArg(val, oldValue);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `${invalidValueMessage} ${err.message}`;
                this.error(message, { exitCode: err.exitCode, code: err.code });
              }
              throw err;
            }
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @api private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description` and optional
       * coercion `fn`.
       *
       * The `flags` string contains the short and/or long flags,
       * separated by comma, a pipe or space. The following are all valid
       * all will output this way when `--help` is used.
       *
       *     "-p, --pepper"
       *     "-p|--pepper"
       *     "-p --pepper"
       *
       * @example
       * // simple boolean defaulting to undefined
       * program.option('-p, --pepper', 'add pepper');
       *
       * program.pepper
       * // => undefined
       *
       * --pepper
       * program.pepper
       * // => true
       *
       * // simple boolean defaulting to true (unless non-negated option is also defined)
       * program.option('-C, --no-cheese', 'remove cheese');
       *
       * program.cheese
       * // => true
       *
       * --no-cheese
       * program.cheese
       * // => false
       *
       * // required argument
       * program.option('-C, --chdir <path>', 'change the working directory');
       *
       * --chdir /tmp
       * program.chdir
       * // => "/tmp"
       *
       * // optional argument
       * program.option('-c, --cheese [type]', 'add cheese [marble]');
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {Function|*} [fn] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, fn, defaultValue) {
        return this._optionEx({}, flags, description, fn, defaultValue);
      }
      /**
      * Add a required option which must have a value after parsing. This usually means
      * the option must be specified on the command line. (Otherwise the same as .option().)
      *
      * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
      *
      * @param {string} flags
      * @param {string} [description]
      * @param {Function|*} [fn] - custom option processing function or default value
      * @param {*} [defaultValue]
      * @return {Command} `this` command for chaining
      */
      requiredOption(flags, description, fn, defaultValue) {
        return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {Boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {Boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
       * for unknown options.
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {Boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
       * for excess arguments.
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {Boolean} [positional=true]
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {Boolean} [passThrough=true]
       * for unknown options.
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
          throw new Error("passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)");
        }
        return this;
      }
      /**
        * Whether to store option values as properties on command object,
        * or store separately (specify false). In both cases the option values can be accessed using .opts().
        *
        * @param {boolean} [storeAsProperties=true]
        * @return {Command} `this` command for chaining
        */
      storeOptionsAsProperties(storeAsProperties = true) {
        this._storeOptionsAsProperties = !!storeAsProperties;
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {Object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {Object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
        * Store option value and where the value came from.
        *
        * @param {string} key
        * @param {Object} value
        * @param {string} source - expected values are default/config/env/cli/implied
        * @return {Command} `this` command for chaining
        */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
        * Get source of option value.
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
        * Get source of option value. See also .optsWithGlobals().
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSourceWithGlobals(key) {
        let source;
        getCommandAndParents(this).forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @api private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0) {
          argv = process2.argv;
          if (process2.versions && process2.versions.electron) {
            parseOptions.from = "electron";
          }
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          default:
            throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
        }
        if (!this._name && this._scriptPath) this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * program.parse(process.argv);
       * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * await program.parseAsync(process.argv);
       * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {Object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @api private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName2) {
          const localBin = path7.resolve(baseDir, baseName2);
          if (fs11.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path7.extname(baseName2))) return void 0;
          const foundExt = sourceExt.find((ext) => fs11.existsSync(`${localBin}${ext}`));
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs11.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path7.resolve(path7.dirname(resolvedScriptPath), executableDir);
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path7.basename(this._scriptPath, path7.extname(this._scriptPath));
            if (legacyName !== this._name) {
              localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path7.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        if (!exitCallback) {
          proc.on("close", process2.exit.bind(process2));
        } else {
          proc.on("close", () => {
            exitCallback(new CommanderError2(process2.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
          });
        }
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(1, "commander.executeSubCommandAsync", "(error)");
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @api private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        let hookResult;
        hookResult = this._chainOrCallSubCommandHook(hookResult, subCommand, "preSubcommand");
        hookResult = this._chainOrCall(hookResult, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return hookResult;
      }
      /**
       * Check this.args against expected this._args.
       *
       * @api private
       */
      _checkNumberOfArguments() {
        this._args.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this._args.length > 0 && this._args[this._args.length - 1].variadic) {
          return;
        }
        if (this.args.length > this._args.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this._args and save as this.processedArgs!
       *
       * @api private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            try {
              parsedValue = argument.parseArg(value, previous);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'. ${err.message}`;
                this.error(message, { exitCode: err.exitCode, code: err.code });
              }
              throw err;
            }
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this._args.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {Promise|undefined} promise
       * @param {Function} fn
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {Promise|undefined} promise
       * @param {string} event
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        getCommandAndParents(this).reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {Promise|undefined} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @api private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
          if (operands.length === 1) {
            this.help();
          }
          return this._dispatchSubcommand(operands[1], [], [this._helpLongFlag]);
        }
        if (this._defaultCommandName) {
          outputHelpIfRequested(this, unknown);
          return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        outputHelpIfRequested(this, parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let actionResult;
          actionResult = this._chainOrCallHooks(actionResult, "preAction");
          actionResult = this._chainOrCall(actionResult, () => this._actionHandler(this.processedArgs));
          if (this.parent) {
            actionResult = this._chainOrCall(actionResult, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          actionResult = this._chainOrCallHooks(actionResult, "postAction");
          return actionResult;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @api private
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @api private
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @api private
       */
      _checkForMissingMandatoryOptions() {
        for (let cmd = this; cmd; cmd = cmd.parent) {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        }
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @api private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter(
          (option) => {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0) {
              return false;
            }
            return this.getOptionValueSource(optionKey) !== "default";
          }
        );
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @api private
       */
      _checkForConflictingOptions() {
        for (let cmd = this; cmd; cmd = cmd.parent) {
          cmd._checkForConflictingLocalOptions();
        }
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {String[]} argv
       * @return {{operands: String[], unknown: String[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {Object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {Object}
       */
      optsWithGlobals() {
        return getCommandAndParents(this).reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {Object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @api private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @api private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter((option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @api private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @api private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @api private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @api private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
          const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @api private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @api private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this._args.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @api private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Set the program version to `str`.
       *
       * This method auto-registers the "-V, --version" flag
       * which will print the version number when passed.
       *
       * You can optionally supply the  flags and description to override the defaults.
       *
       * @param {string} str
       * @param {string} [flags]
       * @param {string} [description]
       * @return {this | string} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this.options.push(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {Object} [argsDescription]
       * @return {string|Command}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0) return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {string|Command}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {string|Command}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name) throw new Error("Command alias can't be the same as its name");
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {string[]|Command}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {String|Command}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this._args.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._hasHelpOption ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this._args.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {string|Command}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path7.basename(filename, path7.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {string|Command}
       */
      executableDir(path8) {
        if (path8 === void 0) return this._executableDir;
        this._executableDir = path8;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @api private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        getCommandAndParents(this).reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        this.emit(this._helpLongFlag);
        this.emit("afterHelp", context);
        getCommandAndParents(this).forEach((command) => command.emit("afterAllHelp", context));
      }
      /**
       * You can pass in flags and a description to override the help
       * flags and help description for your command. Pass in false to
       * disable the built-in help option.
       *
       * @param {string | boolean} [flags]
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          this._hasHelpOption = flags;
          return this;
        }
        this._helpFlags = flags || this._helpFlags;
        this._helpDescription = description || this._helpDescription;
        const helpFlags = splitOptionFlags(this._helpFlags);
        this._helpShortFlag = helpFlags.shortFlag;
        this._helpLongFlag = helpFlags.longFlag;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process2.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {string | Function} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
    };
    function outputHelpIfRequested(cmd, args) {
      const helpOption = cmd._hasHelpOption && args.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
      if (helpOption) {
        cmd.outputHelp();
        cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function getCommandAndParents(startCommand) {
      const result = [];
      for (let command = startCommand; command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    exports2.Command = Command2;
  }
});

// ../node_modules/commander/index.js
var require_commander = __commonJS({
  "../node_modules/commander/index.js"(exports2, module2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2 = module2.exports = new Command2();
    exports2.program = exports2;
    exports2.Argument = Argument2;
    exports2.Command = Command2;
    exports2.CommanderError = CommanderError2;
    exports2.Help = Help2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
    exports2.Option = Option2;
  }
});

// src/main.ts
var path6 = __toESM(require("node:path"), 1);

// ../core/build/lib/src/util.js
var path = __toESM(require("node:path"), 1);
var fs = __toESM(require("node:fs"), 1);
function isDefined(value) {
  return !!value;
}
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function dropLast(text, chars) {
  return text.substring(0, text.length - chars);
}
function dropSuffix(text, suffix) {
  if (!text.endsWith(suffix))
    return text;
  return dropLast(text, suffix.length);
}
function getOrPut(map, key, create) {
  const gotten = map.get(key);
  if (gotten) {
    return gotten;
  }
  const created = create(key);
  map.set(key, created);
  return created;
}
function indentedBy(input, indent) {
  if (input.length > 0 || input.endsWith("\n")) {
    let space = "";
    for (let i = 0; i < indent; i++)
      space += "    ";
    return `${space}${input}`;
  } else {
    return "";
  }
}
function zip(left, right) {
  if (left.length != right.length)
    throw new Error("Arrays of different length");
  return left.map((_, i) => [left[i], right[i]]);
}
function throwException(message) {
  throw new Error(message);
}
function forceWriteFile(filePath, content) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}
function rightmostIndexOf(array, predicate) {
  let result = -1;
  array.forEach((it, index) => {
    if (predicate(it)) {
      result = index;
    }
  });
  return result;
}
function removePoints(s) {
  return s.split(/[\.\-]/g).join("_");
}

// ../core/build/lib/src/configDescriber.js
var ValidationBox = class _ValidationBox {
  constructor(box) {
    this.box = box;
  }
  static fail(errorMessage) {
    return new _ValidationBox({ success: false, errorMessage });
  }
  static ok(value) {
    return new _ValidationBox({ success: true, value });
  }
  success() {
    return this.box.success;
  }
  unwrap(message) {
    if (this.box.success) {
      return this.box.value;
    }
    throw new Error(message !== null && message !== void 0 ? message : "panic");
  }
  error() {
    if (!this.box.success) {
      return this.box.errorMessage;
    }
    throw new Error("");
  }
  get() {
    return this.box;
  }
  or(x) {
    if (this.box.success) {
      return new _ValidationBox(this.box);
    }
    return new _ValidationBox({
      success: true,
      value: x
    });
  }
};
var ConfigDescriberBase = class {
  constructor() {
    this.$ = {
      mergeStrategy: "merge"
    };
  }
  onMerge(strategy) {
    this.$.mergeStrategy = strategy;
    return this;
  }
};
var ConfigDescriberLeaf = class extends ConfigDescriberBase {
  constructor(validate, printSchema) {
    super();
    this.validate = validate;
    this.printSchema = printSchema;
  }
};
var ConfigDescriberOptionalLeaf = class extends ConfigDescriberLeaf {
  constructor(validate, printSchema) {
    super(validate, printSchema);
  }
};
var ConfigDescriberObjectLeaf = class extends ConfigDescriberLeaf {
  constructor(validate, printSchema, schema) {
    super(validate, printSchema);
    this.schema = schema;
  }
};
function mk(typeName, check, config) {
  return new ConfigDescriberLeaf((x) => {
    if (check(x)) {
      return new ValidationBox({
        success: true,
        value: x
      });
    }
    if (config !== void 0 && "default" in config) {
      return new ValidationBox({
        success: true,
        value: config.default
      });
    }
    return new ValidationBox({
      success: false,
      errorMessage: `Expected "${typeName}" but got "${typeof x}"`
    });
  }, () => {
    const base = {
      type: typeName
    };
    if (config === null || config === void 0 ? void 0 : config.description) {
      base.description = config === null || config === void 0 ? void 0 : config.description;
    }
    return base;
  });
}
var D = {
  ////////////////////////////////////////
  // Basics
  number(config) {
    return mk("number", (x) => typeof x === "number", config);
  },
  string(config) {
    return mk("string", (x) => typeof x === "string", config);
  },
  boolean(config) {
    return mk("boolean", (x) => typeof x === "boolean", config);
  },
  bigint(config) {
    return mk("bigint", (x) => typeof x === "bigint", config);
  },
  null(config) {
    return mk("null", (x) => x === null, config);
  },
  undefined(config) {
    return mk("undefined", (x) => x === void 0, config);
  },
  object(schema) {
    return new ConfigDescriberObjectLeaf((x) => {
      if (x !== void 0) {
        if (typeof x !== "object") {
          return ValidationBox.fail(`Expected object, but got "${typeof x}"`);
        }
        if (x === null) {
          return ValidationBox.fail(`Expected object, but got "null"`);
        }
      }
      const obj = x;
      const sh = schema;
      const result = {};
      const errors = [];
      for (const key in schema) {
        const box = sh[key].validate(obj === void 0 ? void 0 : obj[key]);
        if (box.success()) {
          const val = box.unwrap();
          if (val === void 0 && obj !== void 0 && !(key in obj)) {
            continue;
          }
          result[key] = val;
        } else {
          errors.push(`"${key}":
${box.error().split("\n").map((s) => "	" + s).join("\n")}`);
        }
      }
      if (errors.length) {
        return ValidationBox.fail(errors.join("\n"));
      }
      return new ValidationBox({
        success: true,
        value: result
      });
    }, () => {
      const properties = {};
      const required = [];
      for (const key in schema) {
        const leaf = schema[key];
        properties[key] = leaf.printSchema();
        if (!(leaf instanceof ConfigDescriberOptionalLeaf)) {
          required.push(key);
        }
      }
      return {
        additionalProperties: false,
        properties,
        required,
        type: "object"
      };
    }, schema);
  },
  ////////////////////////////////////////
  // Advanced
  maybe(type) {
    return new ConfigDescriberOptionalLeaf((x) => {
      if (x === void 0) {
        return ValidationBox.ok(void 0);
      }
      return type.validate(x);
    }, () => {
      return type.printSchema();
    });
  },
  default(type, def) {
    return new ConfigDescriberOptionalLeaf((x) => {
      return type.validate(x).or(def);
    }, () => {
      return type.printSchema();
    });
  },
  array(type, initAsEmpty = true) {
    return new ConfigDescriberLeaf((xs) => {
      if ((xs === void 0 || xs === null) && initAsEmpty) {
        return ValidationBox.ok([]);
      }
      if (!Array.isArray(xs)) {
        return ValidationBox.fail("Expected array");
      }
      const result = [];
      for (const x of xs) {
        const box = type.validate(x);
        if (!box.success()) {
          return ValidationBox.fail("Array item: " + box.error());
        }
        result.push(box.unwrap());
      }
      return ValidationBox.ok(result);
    }, () => {
      return {
        type: "array",
        items: type.printSchema()
      };
    });
  },
  map(keySchema, valSchema) {
    return new ConfigDescriberLeaf((x) => {
      if (x === void 0) {
        return ValidationBox.fail(`Expected Map, but got "undefined"`);
      }
      if (typeof x !== "object" || x === null) {
        return ValidationBox.fail(`Expected Map, but got "${x === null ? "null" : typeof x}"`);
      }
      const result = /* @__PURE__ */ new Map();
      const iterable = x instanceof Map ? x : Object.entries(x);
      for (const [key, val] of iterable) {
        const keyResult = keySchema.validate(key);
        if (!keyResult.success()) {
          return ValidationBox.fail("Map key: " + keyResult.error());
        }
        const valResult = valSchema.validate(val);
        if (!valResult.success()) {
          return ValidationBox.fail("Map value: " + valResult.error());
        }
        result.set(keyResult.unwrap(), valResult.unwrap());
      }
      return ValidationBox.ok(result);
    }, () => {
      return {
        type: "object",
        additionalProperties: valSchema.printSchema()
      };
    });
  },
  tuple(...items) {
    return new ConfigDescriberLeaf((xs) => {
      if (!Array.isArray(xs)) {
        return ValidationBox.fail("Expected tuple");
      }
      if (xs.length !== items.length) {
        return ValidationBox.fail(`Expected tuple of size ${items.length}, but size was ${xs.length}`);
      }
      const result = [];
      zip(xs, items).forEach(([val, leaf], i) => {
        const r = leaf.validate(val);
        if (!r.success()) {
          return ValidationBox.fail(`Tuple position ${i}: ${r.error()}`);
        }
        result.push(r.unwrap());
      });
      return ValidationBox.ok(result);
    }, () => {
      return {
        items: items.map((it) => it.printSchema())
      };
    });
  },
  union(...items) {
    return new ConfigDescriberLeaf((xs) => {
      for (const item of items) {
        const r = item.validate(xs);
        if (r.success()) {
          return r;
        }
      }
      return ValidationBox.fail("Not matched");
    }, () => {
      return {
        oneOf: items.map((it) => it.printSchema())
      };
    });
  },
  literal: {
    string(x) {
      return new ConfigDescriberLeaf((xs) => {
        if (typeof xs === "string" && x === xs) {
          return ValidationBox.ok(xs);
        }
        return ValidationBox.fail("Not matched");
      }, () => {
        return {
          "const": x
        };
      });
    },
    number(x) {
      return new ConfigDescriberLeaf((xs) => {
        if (typeof xs === "number" && x === xs) {
          return ValidationBox.ok(xs);
        }
        return ValidationBox.fail("Not matched");
      }, () => {
        return {
          "const": x
        };
      });
    },
    boolean(x) {
      return new ConfigDescriberLeaf((xs) => {
        if (typeof xs === "boolean" && x === xs) {
          return ValidationBox.ok(xs);
        }
        return ValidationBox.fail("Not matched");
      }, () => {
        return {
          "const": x
        };
      });
    },
    null() {
      return new ConfigDescriberLeaf((xs) => {
        if (typeof xs === "object" && xs === null) {
          return ValidationBox.ok(null);
        }
        return ValidationBox.fail("Expected null");
      }, () => {
        return {
          "const": null
        };
      });
    }
  },
  ////////////////////////////////////////
  // Utils
  combine(a, b) {
    const keysA = new Set(Object.keys(a.schema));
    const keysB = Object.keys(b.schema);
    for (const key of keysB) {
      if (keysA.has(key)) {
        throw new Error(`Can not combine objects with same keys. Key: "${key}"`);
      }
    }
    return D.object(Object.assign(Object.assign({}, a.schema), b.schema));
  },
  ////////////////////////////////////////
  // Helpers
  printJSONSchema(schema) {
    const configSchema = schema.printSchema();
    if ("properties" in configSchema) {
      configSchema.properties.$schema = {
        type: "string",
        description: "The schema to verify this document against."
      };
    }
    const json = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/configSchema",
      definitions: {
        configSchema
      }
    };
    return JSON.stringify(json, null, 4);
  }
};

// ../core/build/lib/src/config.js
var T = {
  stringArray: () => D.array(D.string())
};
var ModuleConfigurationSchema = D.object({
  name: D.string(),
  external: D.maybe(D.boolean()),
  packages: T.stringArray(),
  useFoldersLayout: D.maybe(D.boolean()),
  tsLikePackage: D.maybe(D.string())
});
var CoreConfigurationSchema = D.object({
  ApiKind: D.number(),
  TypePrefix: D.string(),
  LibraryPrefix: D.string(),
  OptionalPrefix: D.string(),
  rootComponents: T.stringArray(),
  parameterized: T.stringArray(),
  ignoreMaterialized: T.stringArray(),
  builderClasses: T.stringArray(),
  forceMaterialized: T.stringArray(),
  forceCallback: D.map(D.string(), T.stringArray()).onMerge("replace"),
  forceResource: T.stringArray(),
  moduleName: D.string(),
  modules: D.map(D.string(), ModuleConfigurationSchema).onMerge("replace"),
  globalPackages: T.stringArray(),
  extendableComponents: T.stringArray()
});
var defaultCoreConfiguration = {
  ApiKind: 0,
  TypePrefix: "",
  LibraryPrefix: "",
  OptionalPrefix: "",
  rootComponents: [],
  parameterized: [],
  ignoreMaterialized: [],
  builderClasses: [],
  forceMaterialized: [],
  forceCallback: /* @__PURE__ */ new Map(),
  forceResource: [],
  moduleName: "",
  modules: /* @__PURE__ */ new Map(),
  globalPackages: [],
  extendableComponents: []
};
var currentConfig = defaultCoreConfiguration;
function generatorConfiguration() {
  return currentConfig;
}

// ../core/build/lib/src/idl/node.js
var IDLKind;
(function(IDLKind2) {
  IDLKind2["Interface"] = "Interface";
  IDLKind2["Import"] = "Import";
  IDLKind2["Callback"] = "Callback";
  IDLKind2["Const"] = "Const";
  IDLKind2["Property"] = "Property";
  IDLKind2["Parameter"] = "Parameter";
  IDLKind2["Method"] = "Method";
  IDLKind2["Callable"] = "Callable";
  IDLKind2["Constructor"] = "Constructor";
  IDLKind2["Enum"] = "Enum";
  IDLKind2["EnumMember"] = "EnumMember";
  IDLKind2["Typedef"] = "Typedef";
  IDLKind2["PrimitiveType"] = "PrimitiveType";
  IDLKind2["ContainerType"] = "ContainerType";
  IDLKind2["ReferenceType"] = "ReferenceType";
  IDLKind2["UnionType"] = "UnionType";
  IDLKind2["TypeParameterType"] = "TypeParameterType";
  IDLKind2["OptionalType"] = "OptionalType";
  IDLKind2["Version"] = "Version";
  IDLKind2["Namespace"] = "Namespace";
  IDLKind2["File"] = "File";
})(IDLKind = IDLKind || (IDLKind = {}));
var IDLEntity;
(function(IDLEntity2) {
  IDLEntity2["Class"] = "Class";
  IDLEntity2["Interface"] = "Interface";
  IDLEntity2["Import"] = "Import";
  IDLEntity2["Intersection"] = "Intersection";
  IDLEntity2["Literal"] = "Literal";
  IDLEntity2["NamedTuple"] = "NamedTuple";
  IDLEntity2["Tuple"] = "Tuple";
})(IDLEntity = IDLEntity || (IDLEntity = {}));
var IDLExtendedAttributes;
(function(IDLExtendedAttributes2) {
  IDLExtendedAttributes2["Accessor"] = "Accessor";
  IDLExtendedAttributes2["Annotations"] = "Annotations";
  IDLExtendedAttributes2["Async"] = "Async";
  IDLExtendedAttributes2["AsRecord"] = "AsRecord";
  IDLExtendedAttributes2["CallSignature"] = "CallSignature";
  IDLExtendedAttributes2["CommonMethod"] = "CommonMethod";
  IDLExtendedAttributes2["Component"] = "Component";
  IDLExtendedAttributes2["ComponentInterface"] = "ComponentInterface";
  IDLExtendedAttributes2["ComponentModifier"] = "ComponentModifier";
  IDLExtendedAttributes2["DataClass"] = "DataClass";
  IDLExtendedAttributes2["Deprecated"] = "Deprecated";
  IDLExtendedAttributes2["Documentation"] = "Documentation";
  IDLExtendedAttributes2["DtsName"] = "DtsName";
  IDLExtendedAttributes2["DtsTag"] = "DtsTag";
  IDLExtendedAttributes2["Entity"] = "Entity";
  IDLExtendedAttributes2["Extends"] = "Extends";
  IDLExtendedAttributes2["ExtensionMethod"] = "ExtensionMethod";
  IDLExtendedAttributes2["Import"] = "Import";
  IDLExtendedAttributes2["DefaultExport"] = "DefaultExport";
  IDLExtendedAttributes2["IndexSignature"] = "IndexSignature";
  IDLExtendedAttributes2["Interfaces"] = "Interfaces";
  IDLExtendedAttributes2["NativeModule"] = "NativeModule";
  IDLExtendedAttributes2["Optional"] = "Optional";
  IDLExtendedAttributes2["UnionOnlyNull"] = "OptionalOnlyNull";
  IDLExtendedAttributes2["UnionWithNull"] = "OptionalWithNull";
  IDLExtendedAttributes2["OriginalEnumMemberName"] = "OriginalEnumMemberName";
  IDLExtendedAttributes2["OriginalGenericName"] = "OriginalGenericName";
  IDLExtendedAttributes2["Predefined"] = "Predefined";
  IDLExtendedAttributes2["Protected"] = "Protected";
  IDLExtendedAttributes2["Abstract"] = "Abstract";
  IDLExtendedAttributes2["Synthetic"] = "Synthetic";
  IDLExtendedAttributes2["Throws"] = "Throws";
  IDLExtendedAttributes2["TraceKey"] = "TraceKey";
  IDLExtendedAttributes2["TypeAnnotations"] = "TypeAnnotations";
  IDLExtendedAttributes2["TypeParametersDefaults"] = "TypeParametersDefaults";
  IDLExtendedAttributes2["VerbatimDts"] = "VerbatimDts";
  IDLExtendedAttributes2["HandWrittenImplementation"] = "HandWrittenImplementation";
  IDLExtendedAttributes2["ExtraMethod"] = "ExtraMethod";
  IDLExtendedAttributes2["OverloadAlias"] = "OverloadAlias";
  IDLExtendedAttributes2["OverloadPriority"] = "OverloadPriority";
  IDLExtendedAttributes2["TransformOnSerialize"] = "TransformOnSerialize";
  IDLExtendedAttributes2["NativeOnly"] = "NativeOnly";
})(IDLExtendedAttributes = IDLExtendedAttributes || (IDLExtendedAttributes = {}));
var IDLAccessorAttribute;
(function(IDLAccessorAttribute2) {
  IDLAccessorAttribute2["Getter"] = "Getter";
  IDLAccessorAttribute2["Setter"] = "Setter";
})(IDLAccessorAttribute = IDLAccessorAttribute || (IDLAccessorAttribute = {}));
var IDLPrimitiveTypeNames = ["pointer", "void", "boolean", "i8", "u8", "i16", "u16", "i32", "u32", "i64", "u64", "f16", "f32", "f64", "bigint", "number", "String", "any", "undefined", "unknown", "Object", "this", "date", "buffer", "SerializerBuffer", "Function", "CustomObject", "InteropReturnBuffer", "Exception"];
var IDLInterfaceSubkind;
(function(IDLInterfaceSubkind2) {
  IDLInterfaceSubkind2[IDLInterfaceSubkind2["Interface"] = 0] = "Interface";
  IDLInterfaceSubkind2[IDLInterfaceSubkind2["Class"] = 1] = "Class";
  IDLInterfaceSubkind2[IDLInterfaceSubkind2["AnonymousInterface"] = 2] = "AnonymousInterface";
  IDLInterfaceSubkind2[IDLInterfaceSubkind2["Tuple"] = 3] = "Tuple";
})(IDLInterfaceSubkind = IDLInterfaceSubkind || (IDLInterfaceSubkind = {}));

// ../core/build/lib/src/idl/discriminators.js
function isFile(node) {
  return node.kind === IDLKind.File;
}
function isPrimitiveType(type, name) {
  return type.kind == IDLKind.PrimitiveType && (name === void 0 || type.name === name);
}
function isContainerType(type) {
  return type.kind == IDLKind.ContainerType;
}
function isReferenceType(type) {
  return type.kind == IDLKind.ReferenceType;
}
function isEnum(type) {
  return type.kind == IDLKind.Enum;
}
function isEnumMember(type) {
  return type.kind == IDLKind.EnumMember;
}
function isUnionType(type) {
  return type.kind == IDLKind.UnionType;
}
function isTypeParameterType(type) {
  return type.kind == IDLKind.TypeParameterType;
}
function isInterface(node) {
  return node.kind === IDLKind.Interface;
}
function isImport(type) {
  return type.kind == IDLKind.Import;
}
function isCallable(node) {
  return node.kind === IDLKind.Callable;
}
function isMethod(node) {
  return node.kind === IDLKind.Method;
}
function isParameter(node) {
  return node.kind === IDLKind.Parameter;
}
function isConstructor(node) {
  return node.kind === IDLKind.Constructor;
}
function isProperty(node) {
  return node.kind === IDLKind.Property;
}
function isCallback(node) {
  return node.kind === IDLKind.Callback;
}
function isInterfaceSubkind(idl) {
  return idl.subkind === IDLInterfaceSubkind.Interface;
}
function isClassSubkind(idl) {
  return idl.subkind === IDLInterfaceSubkind.Class;
}
function isConstant(node) {
  return node.kind === IDLKind.Const;
}
function isTypedef(node) {
  return node.kind === IDLKind.Typedef;
}
function isType(node) {
  return "_idlTypeBrand" in node;
}
function isEntry(node) {
  return "_idlEntryBrand" in node;
}
function isNamespace(node) {
  return node.kind === IDLKind.Namespace;
}
function isOptionalType(type) {
  return type.kind === IDLKind.OptionalType;
}
function isNamedNode(type) {
  return "_idlNamedNodeBrand" in type;
}
var IDLContainerUtils = {
  isRecord: (x) => isContainerType(x) && x.containerKind === "record",
  isSequence: (x) => isContainerType(x) && x.containerKind === "sequence",
  isPromise: (x) => isContainerType(x) && x.containerKind === "Promise"
};
function hasExtAttribute(node, attribute) {
  var _a;
  return ((_a = node.extendedAttributes) === null || _a === void 0 ? void 0 : _a.find((it) => it.name == attribute)) != void 0;
}
function getExtAttribute(node, name) {
  var _a, _b;
  return (_b = (_a = node.extendedAttributes) === null || _a === void 0 ? void 0 : _a.find((it) => it.name === name)) === null || _b === void 0 ? void 0 : _b.value;
}
function getNamespacesPathFor(node) {
  let iterator = node.parent;
  const result = [];
  while (iterator) {
    if (isNamespace(iterator))
      result.unshift(iterator);
    iterator = iterator.parent;
  }
  return result;
}
var nodesWithoutIDLFiles = /* @__PURE__ */ new Set();
function getFileFor(node) {
  let iterator = node;
  while (iterator) {
    if (isFile(iterator))
      return iterator;
    iterator = iterator.parent;
  }
  const name = getQualifiedName(node, "namespace.name");
  if (!nodesWithoutIDLFiles.has(name)) {
    console.warn(`Node ${name} does not have IDLFile in parents`);
    nodesWithoutIDLFiles.add(name);
  }
  return void 0;
}
function getPackageClause(node) {
  var _a;
  const file = getFileFor(node);
  if (!file)
    throw new Error(`Can not find parent file for node ${node.kind}`);
  return (_a = file === null || file === void 0 ? void 0 : file.packageClause) !== null && _a !== void 0 ? _a : [];
}
function getPackageName(node) {
  return getPackageClause(node).join(".");
}
function getQualifiedName(a, pattern) {
  const result = [];
  if ("package.namespace.name" === pattern)
    result.push(...getPackageClause(a), ...getNamespacesPathFor(a).map((it) => it.name));
  else if ("namespace.name" === pattern)
    result.push(...getNamespacesPathFor(a).map((it) => it.name));
  const ownName = (node) => {
    if (!node || isFile(node))
      return [];
    if (isNamespace(node))
      return node === a ? [node.name] : [];
    if (isInterface(node) || isTypedef(node) || isCallback(node) || isEnum(node))
      return [node.name];
    if (isProperty(node) || isMethod(node) || isConstant(node))
      return [...ownName(node.parent), node.name];
    if (isCallable(node))
      return [...ownName(node.parent), "invoke"];
    if (isConstructor(node))
      return [...ownName(node.parent), "constructor"];
    throw new Error(`Can not calculate own name for node ${node.kind}`);
  };
  result.push(...ownName(a));
  return result.join(".");
}
function getFQName(a) {
  return getQualifiedName(a, "package.namespace.name");
}

// ../core/build/lib/src/idl/builders.js
var innerIdlSymbol = /* @__PURE__ */ Symbol("innerIdlSymbol");
function createPrimitiveType(name, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.PrimitiveType, name }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createOptionalType(element, nodeInitializer) {
  var _a, _b;
  if (isOptionalType(element) && hasExtAttribute(element, IDLExtendedAttributes.UnionOnlyNull)) {
    if (!((_a = nodeInitializer === null || nodeInitializer === void 0 ? void 0 : nodeInitializer.extendedAttributes) === null || _a === void 0 ? void 0 : _a.some((it) => it.name === IDLExtendedAttributes.UnionWithNull))) {
      nodeInitializer = Object.assign(Object.assign({}, nodeInitializer), { extendedAttributes: [...(_b = nodeInitializer === null || nodeInitializer === void 0 ? void 0 : nodeInitializer.extendedAttributes) !== null && _b !== void 0 ? _b : [], { name: IDLExtendedAttributes.UnionWithNull }] });
    }
  }
  if (isOptionalType(element) && !nodeInitializer) {
    return element;
  }
  if (isOptionalType(element)) {
    return Object.assign(Object.assign({ kind: IDLKind.OptionalType, type: element.type }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol });
  }
  return Object.assign(Object.assign({ kind: IDLKind.OptionalType, type: element }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol });
}
function createNamespace(name, members, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.Namespace, members: members !== null && members !== void 0 ? members : [], name }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createVersion(value, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.Version, value, name: "version" }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createReferenceType(nameOrSource, typeArguments, nodeInitializer) {
  let name;
  if (typeof nameOrSource === "string") {
    name = nameOrSource;
  } else {
    name = getFQName(nameOrSource);
  }
  return Object.assign(Object.assign({
    kind: IDLKind.ReferenceType,
    name,
    typeArguments
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createContainerType(container, element, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.ContainerType, containerKind: container, elementType: element }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol });
}
function createUnionType(types, name, nodeInitializer) {
  if (types.length < 2)
    throw new Error("IDLUnionType should contain at least 2 types");
  return Object.assign(Object.assign({ kind: IDLKind.UnionType, name: name !== null && name !== void 0 ? name : "Union_" + types.map((it) => generateSyntheticIdlNodeName(it)).join("_"), types }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createFile(entries, fileName, packageClause = [], nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.File, packageClause, entries, fileName }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol });
}
function createImport(clause, name, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.Import, name: name !== null && name !== void 0 ? name : "", clause }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createEnum(name, elements, nodeInitializer) {
  const result = Object.assign(Object.assign({ kind: IDLKind.Enum, name, elements }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
  elements.forEach((it) => it.parent = result);
  return result;
}
function createEnumMember(name, parent2, type, initializer, initializerDecimalType = void 0, nodeInitializer = {}) {
  return Object.assign(Object.assign({
    kind: IDLKind.EnumMember,
    name,
    parent: parent2,
    type,
    initializer,
    initializerDecimalType
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createInterface(name, subkind, inheritance = [], constructors = [], constants = [], properties = [], methods = [], callables = [], typeParameters = [], nodeInitializer = {}) {
  return Object.assign(Object.assign({
    kind: IDLKind.Interface,
    name,
    subkind,
    typeParameters,
    inheritance,
    constructors,
    constants,
    properties,
    methods,
    callables
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createProperty(name, type, isReadonly = false, isStatic = false, isOptional = false, nodeInitializer = {}) {
  return Object.assign(Object.assign({
    name,
    kind: IDLKind.Property,
    type,
    isReadonly,
    isStatic,
    isOptional
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createParameter(name, type, isOptional = false, isVariadic = false, nodeInitializer = {}) {
  return Object.assign(Object.assign({
    kind: IDLKind.Parameter,
    name,
    type,
    isOptional,
    isVariadic
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createMethod(name, parameters, returnType, methodInitializer = {
  isAsync: false,
  isStatic: false,
  isOptional: false,
  isFree: false
}, nodeInitializer = {}, typeParameters = []) {
  return Object.assign(Object.assign(Object.assign({
    kind: IDLKind.Method,
    name,
    parameters,
    returnType,
    typeParameters
  }, methodInitializer), nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createCallable(name, parameters, returnType, callableInitializer, nodeInitializer, typeParameters = []) {
  return Object.assign(Object.assign(Object.assign({
    kind: IDLKind.Callable,
    name,
    parameters,
    returnType
  }, callableInitializer), nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createConstructor(parameters, returnType, nodeInitializer = {}) {
  return Object.assign(Object.assign({
    kind: IDLKind.Constructor,
    name: "$CONSTRUCTOR%",
    parameters,
    returnType
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createCallback(name, parameters, returnType, nodeInitializer = {}, typeParameters = []) {
  return Object.assign(Object.assign({ kind: IDLKind.Callback, name, parameters, returnType, typeParameters }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createTypeParameterReference(name, nodeInitializer) {
  return Object.assign(Object.assign({ kind: IDLKind.TypeParameterType, name }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlTypeBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createTypedef(name, type, typeParameters = [], nodeInitializer = {}) {
  return Object.assign(Object.assign({ name, type, typeParameters, kind: IDLKind.Typedef }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function createConstant(name, type, value, nodeInitializer = {}) {
  return Object.assign(Object.assign({
    kind: IDLKind.Const,
    name,
    type,
    value
  }, nodeInitializer), { _idlNodeBrand: innerIdlSymbol, _idlEntryBrand: innerIdlSymbol, _idlNamedNodeBrand: innerIdlSymbol });
}
function generateSyntheticIdlNodeName(type) {
  if (isPrimitiveType(type))
    return capitalize(type.name);
  if (isContainerType(type)) {
    const typeArgs = type.elementType.map((it) => generateSyntheticIdlNodeName(it)).join("_").replaceAll(".", "_");
    switch (type.containerKind) {
      case "sequence":
        return "Array_" + typeArgs;
      case "record":
        return "Map_" + typeArgs;
      case "Promise":
        return "Promise_" + typeArgs;
      default:
        throw new Error(`Unknown container type ${type.containerKind}`);
    }
  }
  if (isNamedNode(type))
    return type.name.split(".").map(capitalize).join("_");
  if (isOptionalType(type))
    return `Opt_${generateSyntheticIdlNodeName(type.type)}`;
  throw `Can not compute type name of ${IDLKind[type.kind]}`;
}
var IDLNullTypeName = "idlize.stdlib.Null";
function isUndefinedType(type) {
  return isPrimitiveType(type) && type.name === "undefined";
}
function isVoidType(type) {
  return isPrimitiveType(type) && type.name === "void";
}

// ../core/build/lib/src/IndentedPrinter.js
var fs2 = __toESM(require("node:fs"), 1);
var path2 = __toESM(require("node:path"), 1);
var IndentedPrinter = class {
  constructor(output = [], indent = 0) {
    this.output = output;
    this.indent = indent;
  }
  print(value) {
    if (value != void 0)
      this.output.push(this.indented(value));
  }
  pushIndent(level = 1) {
    this.indent += level;
  }
  popIndent(level = 1) {
    this.indent -= level;
  }
  indentDepth() {
    return this.indent;
  }
  append(printer) {
    this.output = [...this.output, ...printer.output];
  }
  appendLastString(value) {
    if (value != void 0) {
      let last = this.output.pop();
      last = last ? last.concat(value) : value;
      this.output.push(last);
    }
  }
  indented(input) {
    return indentedBy(input, this.indent);
  }
  getOutput() {
    return this.output;
  }
  printTo(file) {
    fs2.mkdirSync(path2.dirname(file), { recursive: true });
    fs2.writeFileSync(file, this.getOutput().join("\n"));
  }
  withIndent(prints) {
    this.pushIndent();
    prints(this);
    this.popIndent();
  }
};

// ../core/build/lib/src/idl/keywords.js
var IDLKeywords = /* @__PURE__ */ new Set([
  "attribute",
  "callback",
  "object",
  "toString",
  "sequence",
  "record",
  "or",
  "Int8Array",
  "interface",
  "number",
  "undefined"
]);

// ../core/build/lib/src/idl/dump.js
function escapeIDLKeyword(name) {
  return name + (IDLKeywords.has(name) ? "_" : "");
}
function printType(type, options) {
  if (!type)
    throw new Error("Missing type");
  if (isInterface(type))
    return type.name;
  if (isOptionalType(type)) {
    if (hasExtAttribute(type, IDLExtendedAttributes.UnionOnlyNull))
      return `(${printType(type.type)} or ${IDLNullTypeName})`;
    else if (hasExtAttribute(type, IDLExtendedAttributes.UnionWithNull))
      return `(${printType(type.type)} or undefined or ${IDLNullTypeName})`;
    else
      return `(${printType(type.type)} or undefined)`;
  }
  if (isPrimitiveType(type)) {
    const maybeExtendedAttributes = type.extendedAttributes && type.extendedAttributes.length ? `[${quoteAttributeValues(type.extendedAttributes)}] ` : "";
    if (maybeExtendedAttributes.length) {
      return `(${maybeExtendedAttributes}${type.name})`;
    }
    return type.name;
  }
  if (isContainerType(type)) {
    const maybeExtendedAttributes = type.extendedAttributes && type.extendedAttributes.length ? `[${quoteAttributeValues(type.extendedAttributes)}] ` : "";
    const res = `${maybeExtendedAttributes}${type.containerKind}<${type.elementType.map((it) => printType(it)).join(", ")}>`;
    if (maybeExtendedAttributes.length) {
      return `(${res})`;
    }
    return res;
  }
  if (isReferenceType(type)) {
    const maybeExtendedAttributes = type.extendedAttributes && type.extendedAttributes.length ? `[${quoteAttributeValues(type.extendedAttributes)}] ` : "";
    const maybeTypeArguments = type.typeArguments && type.typeArguments.length ? "<" + type.typeArguments.map((t) => printType(t)).join(", ") + ">" : "";
    let res = `${maybeExtendedAttributes}${type.name}${maybeTypeArguments}`;
    if (maybeExtendedAttributes.length && (options === null || options === void 0 ? void 0 : options.bracketsAroundReferenceTypeWithExtAttrs))
      return `(${res})`;
    return res;
  }
  if (isUnionType(type))
    return `(${type.types.map((it) => printType(it)).join(" or ")})`;
  if (isTypeParameterType(type))
    return type.name;
  throw new Error(`Cannot map type: ${IDLKind[type.kind]}`);
}
function nameWithType(idl, isVariadic = false, isOptional = false) {
  const type = printType(idl.type);
  const variadic = isVariadic ? "..." : "";
  const optional = isOptional ? "optional " : "";
  return `${optional}${type}${variadic} ${escapeIDLKeyword(idl.name)}`;
}
var attributesToQuote = /* @__PURE__ */ new Set([
  IDLExtendedAttributes.Documentation,
  IDLExtendedAttributes.DtsName,
  IDLExtendedAttributes.DtsTag,
  IDLExtendedAttributes.Import,
  IDLExtendedAttributes.Interfaces,
  IDLExtendedAttributes.TraceKey,
  IDLExtendedAttributes.TypeParametersDefaults
]);
function quoteAttributeValues(attributes) {
  return attributes === null || attributes === void 0 ? void 0 : attributes.map((it) => {
    let attr = it.name;
    if (it.value) {
      let value = it.value;
      if (value.includes('"') && !value.includes("'"))
        value = value.replaceAll('"', "'");
      value = value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
      attr += `=${attributesToQuote.has(it.name) ? `"${value}"` : it.value}`;
    }
    return attr;
  }).join(", ");
}
var IDLWriter = class {
  constructor(printer) {
    this.printer = printer;
  }
  print(line) {
    this.printer.print(line);
    return this;
  }
  pushIndent() {
    this.printer.pushIndent();
    return this;
  }
  popIndent() {
    this.printer.popIndent();
    return this;
  }
  getOutput() {
    return this.printer.getOutput();
  }
  printReturnType(type) {
    return printType(type, { bracketsAroundReferenceTypeWithExtAttrs: true });
  }
  printParameters(parameters) {
    var _a, _b;
    return (_b = (_a = parameters === null || parameters === void 0 ? void 0 : parameters.map((it) => nameWithType(it, it.isVariadic, it.isOptional))) === null || _a === void 0 ? void 0 : _a.join(", ")) !== null && _b !== void 0 ? _b : "";
  }
  printConstructor(idl) {
    return this.printExtendedAttributes(idl).print(`constructor(${this.printParameters(idl.parameters)});`);
  }
  printConstant(idl) {
    return this.printExtendedAttributes(idl).print(`const ${nameWithType(idl)}${idl.value ? ` = ${idl.value}` : ``};`);
  }
  printProperty(idl) {
    const staticMod = idl.isStatic ? "static " : "";
    const readonlyMod = idl.isReadonly ? "readonly " : "";
    const optional = idl.isOptional ? "optional " : "";
    return this.printExtendedAttributes(idl).print(`${staticMod}${readonlyMod}${optional}attribute ${nameWithType(idl)};`);
  }
  printExtendedAttributes(idl) {
    var _a;
    let typeParameters;
    let typeArguments;
    switch (idl.kind) {
      case IDLKind.Interface:
        typeParameters = idl.typeParameters;
        break;
      case IDLKind.Callback:
      case IDLKind.Method:
      case IDLKind.Callable:
      case IDLKind.Constructor:
        typeParameters = idl.typeParameters;
        break;
      case IDLKind.Typedef:
        typeParameters = idl.typeParameters;
        break;
      case IDLKind.ReferenceType:
        typeArguments = idl.typeArguments;
        break;
    }
    const attributes = Array.from((_a = idl.extendedAttributes) !== null && _a !== void 0 ? _a : []);
    if (idl.documentation) {
      let docs = {
        name: IDLExtendedAttributes.Documentation,
        value: idl.documentation
      };
      attributes.unshift(docs);
    }
    const names = /* @__PURE__ */ new Set();
    const actualAttributes = [];
    for (const attr of attributes) {
      if (names.has(attr.name)) {
        continue;
      }
      names.add(attr.name);
      actualAttributes.push(attr);
    }
    if (actualAttributes.length == 0) {
      return this;
    }
    const attrSpec = quoteAttributeValues(actualAttributes);
    if (attrSpec)
      this.print(`[${attrSpec}]`);
    return this;
  }
  printSpacedTypeParameters(params) {
    return params && params.length ? "<" + params.join(", ") + "> " : "";
  }
  printFunction(idl) {
    var _a;
    if ((_a = idl.name) === null || _a === void 0 ? void 0 : _a.startsWith("__")) {
      console.log(`Ignore ${idl.name}`);
      return this;
    }
    return this.printExtendedAttributes(idl).print(`${idl.isAsync ? "async " : ""}${this.printReturnType(idl.returnType)} ${idl.name}(${this.printParameters(idl.parameters)});`);
  }
  printMethod(idl) {
    var _a;
    if ((_a = idl.name) === null || _a === void 0 ? void 0 : _a.startsWith("__")) {
      console.log(`Ignore ${idl.name}`);
      return this;
    }
    return this.printExtendedAttributes(idl).print(`${idl.isStatic ? "static " : ""}${idl.isAsync ? "async " : ""}${this.printSpacedTypeParameters(idl.typeParameters)}${this.printReturnType(idl.returnType)} ${idl.name}(${this.printParameters(idl.parameters)});`);
  }
  printPackage(idl) {
    const effectiveClause = idl.packageClause.filter((it) => !!it);
    if (!effectiveClause.length) {
      return this;
    }
    return this.print(`package ${effectiveClause.join(".")};`);
  }
  printImport(idl) {
    const effectiveClause = idl.clause.filter((it) => !!it);
    return this.print(`import ${effectiveClause.join(".") || "NULL_IMPORT"}${idl.name ? " as " : ""}${idl.name};`);
  }
  printNamespace(idl) {
    this.printExtendedAttributes(idl).print(`namespace ${idl.name} {`).pushIndent();
    idl.members.forEach((member) => this.printIDL(member));
    return this.popIndent().print("};");
  }
  printCallback(idl) {
    return this.printExtendedAttributes(idl).print(`callback ${this.printSpacedTypeParameters(idl.typeParameters)}${idl.name} = ${this.printReturnType(idl.returnType)} (${this.printParameters(idl.parameters)});`);
  }
  printScoped(idl) {
    if (idl.kind == IDLKind.Callback)
      return this.printCallback(idl);
    if (idl.kind === IDLKind.Interface)
      return this.printInterface(idl);
    throw new Error(`Unexpected scoped: ${idl.kind} ${idl.name}`);
  }
  printInterfaceInherit(idl) {
    if (idl.inheritance.length === 0) {
      return "";
    }
    const types = idl.inheritance.map((type) => printType(type));
    return ": " + types.join(", ");
  }
  printInterfaceHead(decl) {
    return this.print("interface " + this.printSpacedTypeParameters(decl.typeParameters) + `${decl.name}${this.printInterfaceInherit(decl)} {`);
  }
  printInterface(idl) {
    this.printExtendedAttributes(idl).printInterfaceHead(idl).pushIndent();
    idl.constructors.forEach((it) => this.printConstructor(it));
    idl.constants.forEach((it) => this.printConstant(it));
    idl.properties.forEach((it) => this.printProperty(it));
    idl.methods.forEach((it) => this.printMethod(it));
    idl.callables.forEach((it) => this.printFunction(it));
    return this.popIndent().print("};");
  }
  getInitializerValue(type, initializer, decimalType) {
    if (type.name == "String")
      return `"${String(initializer).replaceAll('"', "'")}"`;
    if (decimalType == void 0)
      throw new Error(`Expected defined enum initializer decimal type for value: ${initializer}`);
    switch (decimalType) {
      case 2:
        return `0b${initializer.toString(2)}`;
      case 16:
        return `0x${initializer.toString(16).toUpperCase()}`;
      default:
        return `${initializer}`;
    }
  }
  printEnumMember(idl) {
    const type = printType(idl.type);
    const initializer = idl.initializer === void 0 ? "" : ` = ${this.getInitializerValue(idl.type, idl.initializer, idl.initializerDecimalType)}`;
    return this.print(idl.documentation).printExtendedAttributes(idl).print(`${type} ${idl.name}${initializer};`);
  }
  printEnum(idl, skipInitializers) {
    this.print(idl.documentation).printExtendedAttributes(idl);
    if (skipInitializers) {
      this.print(`enum ${idl.name} {`).pushIndent();
      idl.elements.forEach((it) => this.print(`${it.name} ${it.initializer !== void 0 ? " /* " + it.initializer + " */" : ""}`));
      return this.popIndent().print("};");
    } else {
      this.print(`enum ${idl.name} {`).pushIndent();
      idl.elements.forEach((it) => this.printEnumMember(it));
      return this.popIndent().print("};");
    }
  }
  printTypedef(idl) {
    return this.print(idl.documentation).printExtendedAttributes(idl).print(`typedef ${this.printSpacedTypeParameters(idl.typeParameters)}${idl.name} = ${printType(idl.type)};`);
  }
  printIDL(idl, options) {
    var _a;
    if (idl.kind == IDLKind.Interface)
      return this.printInterface(idl);
    if (idl.kind == IDLKind.Enum)
      return this.printEnum(idl, (_a = options === null || options === void 0 ? void 0 : options.disableEnumInitializers) !== null && _a !== void 0 ? _a : false);
    if (idl.kind == IDLKind.Typedef)
      return this.printTypedef(idl);
    if (idl.kind == IDLKind.Callback)
      return this.printCallback(idl);
    if (idl.kind == IDLKind.Import)
      return this.printImport(idl);
    if (idl.kind == IDLKind.Namespace)
      return this.printNamespace(idl);
    if (idl.kind == IDLKind.Method)
      return this.printMethod(idl);
    if (idl.kind == IDLKind.Const)
      return this.printConstant(idl);
    if (idl.kind == IDLKind.Property)
      return this.printProperty(idl);
    if (options === null || options === void 0 ? void 0 : options.allowUnknownKinds) {
      return this.print(`${IDLKind[idl.kind]} ${"name" in idl ? idl.name : ""}`);
    } else {
      throw new Error(`unexpected kind: ${idl.kind}`);
    }
  }
};
function toIDLString(node, options) {
  const writer = new IDLWriter(new IndentedPrinter());
  if (isFile(node)) {
    writer.printPackage(node);
    node.entries.forEach((it) => writer.printIDL(it, options));
  } else {
    writer.printIDL(node, options);
  }
  return writer.getOutput().join(options.oneLine ? " " : "\n");
}

// ../core/build/lib/src/idl/visitors.js
function forEachChild(node, cbEnter, cbLeave) {
  var _a, _b, _c;
  const cleanup = cbEnter(node);
  switch (node.kind) {
    case IDLKind.File:
      node.entries.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    case IDLKind.Namespace:
      node.members.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    case IDLKind.Interface: {
      let concrete = node;
      concrete.inheritance.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      concrete.constructors.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      concrete.properties.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      concrete.methods.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      concrete.callables.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    }
    case IDLKind.Method:
    case IDLKind.Callable:
    case IDLKind.Callback:
    case IDLKind.Constructor: {
      let concrete = node;
      (_a = concrete.parameters) === null || _a === void 0 ? void 0 : _a.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      if (concrete.returnType)
        forEachChild(concrete.returnType, cbEnter, cbLeave);
      break;
    }
    case IDLKind.UnionType: {
      let concrete = node;
      (_b = concrete.types) === null || _b === void 0 ? void 0 : _b.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    }
    case IDLKind.OptionalType: {
      let concrete = node;
      forEachChild(concrete.type, cbEnter, cbLeave);
      break;
    }
    case IDLKind.Const: {
      forEachChild(node.type, cbEnter, cbLeave);
      break;
    }
    case IDLKind.Enum: {
      node.elements.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    }
    case IDLKind.Property: {
      forEachChild(node.type, cbEnter, cbLeave);
      break;
    }
    case IDLKind.Parameter: {
      const concrete = node;
      if (concrete.type)
        forEachChild(concrete.type, cbEnter, cbLeave);
      break;
    }
    case IDLKind.Typedef: {
      forEachChild(node.type, cbEnter, cbLeave);
      break;
    }
    case IDLKind.ContainerType: {
      node.elementType.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    }
    case IDLKind.ReferenceType: {
      (_c = node.typeArguments) === null || _c === void 0 ? void 0 : _c.forEach((value) => forEachChild(value, cbEnter, cbLeave));
      break;
    }
    case IDLKind.TypeParameterType:
    case IDLKind.EnumMember:
    case IDLKind.Import:
    case IDLKind.PrimitiveType:
    case IDLKind.Version:
      break;
    default: {
      throw new Error(`Unhandled ${node.kind}`);
    }
  }
  cbLeave === null || cbLeave === void 0 ? void 0 : cbLeave(node);
  cleanup === null || cleanup === void 0 ? void 0 : cleanup();
}
function updateEachChild(node, op, cbLeave) {
  var _a;
  const old = node;
  node = op(old);
  if (node.kind !== old.kind && !(isType(old) && isType(node))) {
    throw new Error("Kinds must be the same!");
  }
  switch (node.kind) {
    case IDLKind.File: {
      const concrete = node;
      concrete.entries = concrete.entries.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.Namespace: {
      const concrete = node;
      concrete.members = concrete.members.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.Interface: {
      const concrete = node;
      concrete.inheritance = concrete.inheritance.map((it) => updateEachChild(it, op, cbLeave));
      concrete.constructors = concrete.constructors.map((it) => updateEachChild(it, op, cbLeave));
      concrete.properties = concrete.properties.map((it) => updateEachChild(it, op, cbLeave));
      concrete.methods = concrete.methods.map((it) => updateEachChild(it, op, cbLeave));
      concrete.callables = concrete.callables.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.Method:
    case IDLKind.Callable:
    case IDLKind.Callback:
    case IDLKind.Constructor: {
      const concrete = node;
      concrete.parameters = concrete.parameters.map((it) => updateEachChild(it, op, cbLeave));
      if (concrete.returnType) {
        concrete.returnType = updateEachChild(concrete.returnType, op, cbLeave);
      }
      break;
    }
    case IDLKind.UnionType: {
      const concrete = node;
      concrete.types = concrete.types.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.OptionalType: {
      const concrete = node;
      concrete.type = updateEachChild(concrete.type, op, cbLeave);
      break;
    }
    case IDLKind.Const: {
      const concrete = node;
      concrete.type = updateEachChild(concrete.type, op, cbLeave);
      break;
    }
    case IDLKind.Enum: {
      const concrete = node;
      concrete.elements = concrete.elements.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.Property: {
      const concrete = node;
      concrete.type = updateEachChild(concrete.type, op, cbLeave);
      break;
    }
    case IDLKind.Parameter: {
      const concrete = node;
      if (concrete.type)
        concrete.type = updateEachChild(concrete.type, op, cbLeave);
      break;
    }
    case IDLKind.Typedef: {
      const concrete = node;
      concrete.type = updateEachChild(concrete.type, op, cbLeave);
      break;
    }
    case IDLKind.ContainerType: {
      const concrete = node;
      concrete.elementType = concrete.elementType.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.ReferenceType: {
      const concrete = node;
      concrete.typeArguments = (_a = concrete.typeArguments) === null || _a === void 0 ? void 0 : _a.map((it) => updateEachChild(it, op, cbLeave));
      break;
    }
    case IDLKind.TypeParameterType:
    case IDLKind.EnumMember:
    case IDLKind.Import:
    case IDLKind.PrimitiveType:
    case IDLKind.Version:
      break;
    default: {
      throw new Error(`Unhandled ${node.kind}`);
    }
  }
  if (cbLeave) {
    cbLeave === null || cbLeave === void 0 ? void 0 : cbLeave(node);
  }
  return node;
}
function cloneNodeInitializer(other) {
  var _a;
  return {
    documentation: other.documentation,
    extendedAttributes: (_a = other.extendedAttributes) === null || _a === void 0 ? void 0 : _a.map((it) => {
      return Object.assign({}, it);
    }),
    fileName: other.fileName,
    nameLocation: other.nameLocation,
    nodeLocation: other.nodeLocation,
    valueLocation: other.valueLocation
  };
}
function linkParentBack(node) {
  const parentStack = [];
  updateEachChild(node, (node2) => {
    if (parentStack.length) {
      const top = parentStack[parentStack.length - 1];
      if (node2.parent !== void 0 && node2.parent !== top) {
        node2 = clone(node2);
      }
      node2.parent = top;
    }
    parentStack.push(node2);
    return node2;
  }, () => {
    parentStack.pop();
  });
  return node;
}
function clone(node) {
  var _a, _b, _c, _d;
  const make = (newnode) => {
    if (node.nodeLocation) {
      newnode.nodeLocation = node.nodeLocation;
    }
    if (node.nameLocation) {
      newnode.nameLocation = node.nameLocation;
    }
    if (node.valueLocation) {
      newnode.valueLocation = node.valueLocation;
    }
    return newnode;
  };
  const get = (node2) => node2;
  switch (node.kind) {
    case IDLKind.Interface: {
      const entry = get(node);
      return make(createInterface(entry.name, entry.subkind, (_a = entry.inheritance) === null || _a === void 0 ? void 0 : _a.map(clone), (_b = entry.constructors) === null || _b === void 0 ? void 0 : _b.map(clone), entry.constants.map(clone), entry.properties.map(clone), entry.methods.map(clone), entry.callables.map(clone), (_c = entry.typeParameters) === null || _c === void 0 ? void 0 : _c.map((it) => it), cloneNodeInitializer(node)));
    }
    case IDLKind.Import: {
      const entry = get(node);
      return make(createImport(entry.clause, entry.name, cloneNodeInitializer(entry)));
    }
    case IDLKind.Callback: {
      const entry = get(node);
      return make(createCallback(entry.name, entry.parameters.map(clone), clone(entry.returnType), cloneNodeInitializer(entry), entry.typeParameters));
    }
    case IDLKind.Const: {
      const entry = get(node);
      return make(createConstant(entry.name, clone(entry.type), entry.value, cloneNodeInitializer(entry)));
    }
    case IDLKind.Property: {
      const entry = get(node);
      return make(createProperty(entry.name, clone(entry.type), entry.isReadonly, entry.isStatic, entry.isOptional, cloneNodeInitializer(entry)));
    }
    case IDLKind.Parameter: {
      const entry = get(node);
      return make(createParameter(entry.name, clone(entry.type), entry.isOptional, entry.isVariadic, cloneNodeInitializer(entry)));
    }
    case IDLKind.Method: {
      const entry = get(node);
      return make(createMethod(entry.name, entry.parameters.map(clone), clone(entry.returnType), {
        isAsync: entry.isAsync,
        isFree: entry.isFree,
        isOptional: entry.isOptional,
        isStatic: entry.isStatic
      }, cloneNodeInitializer(entry), entry.typeParameters));
    }
    case IDLKind.Callable: {
      const entry = get(node);
      return make(createCallable(entry.name, entry.parameters.map(clone), clone(entry.returnType), {
        isAsync: entry.isAsync,
        isStatic: entry.isStatic
      }, cloneNodeInitializer(entry), entry.typeParameters));
    }
    case IDLKind.Constructor: {
      const entry = get(node);
      return make(createConstructor(entry.parameters.map(clone), entry.returnType ? clone(entry.returnType) : void 0, cloneNodeInitializer(entry)));
    }
    case IDLKind.Enum: {
      const entry = get(node);
      const cloned = createEnum(entry.name, entry.elements.map(clone), cloneNodeInitializer(entry));
      cloned.elements.forEach((it) => {
        it.parent = cloned;
      });
      return make(cloned);
    }
    case IDLKind.EnumMember: {
      const entry = get(node);
      return make(createEnumMember(entry.name, entry.parent, clone(entry.type), entry.initializer, entry.initializerDecimalType, cloneNodeInitializer(entry)));
    }
    case IDLKind.Typedef: {
      const entry = get(node);
      return make(createTypedef(entry.name, clone(entry.type), entry.typeParameters, cloneNodeInitializer(entry)));
    }
    case IDLKind.PrimitiveType: {
      return node;
    }
    case IDLKind.ContainerType: {
      const type = get(node);
      return make(createContainerType(type.containerKind, type.elementType.map(clone), cloneNodeInitializer(type)));
    }
    case IDLKind.ReferenceType: {
      const type = get(node);
      return make(createReferenceType(type.name, (_d = type.typeArguments) === null || _d === void 0 ? void 0 : _d.map(clone), cloneNodeInitializer(type)));
    }
    case IDLKind.UnionType: {
      const type = get(node);
      return make(createUnionType(type.types.map(clone), type.name, cloneNodeInitializer(type)));
    }
    case IDLKind.TypeParameterType: {
      const type = get(node);
      return make(createTypeParameterReference(type.name, cloneNodeInitializer(type)));
    }
    case IDLKind.OptionalType: {
      const type = get(node);
      return make(createOptionalType(clone(type.type), cloneNodeInitializer(type)));
    }
    case IDLKind.Version: {
      const entry = get(node);
      return make(createVersion(entry.value, cloneNodeInitializer(entry)));
    }
    case IDLKind.Namespace: {
      const ns = get(node);
      return make(createNamespace(ns.name, ns.members.map(clone), cloneNodeInitializer(ns)));
    }
    case IDLKind.File: {
      const file = get(node);
      return make(createFile(file.entries.map(clone), file.fileName, file.packageClause, cloneNodeInitializer(file)));
    }
  }
}

// ../core/build/lib/src/idl/utils.js
function forceAsNamedNode(type) {
  if (!isNamedNode(type)) {
    throw new Error(`Expected to be an IDLNamedNode, but got '${IDLKind[type.kind]}'`);
  }
  return type;
}
function maybeUnwrapOptionalType(type) {
  if (isOptionalType(type)) {
    return type.type;
  }
  return type;
}
function isStringEnum(decl) {
  return decl.elements.some((e) => isPrimitiveType(e.type, "String"));
}
function linearizeNamespaceMembers(entries) {
  const linearized = [];
  for (const entry of entries) {
    linearized.push(entry);
    if (isNamespace(entry))
      linearized.push(...linearizeNamespaceMembers(entry.members));
  }
  return linearized;
}
function extremumOfOrdinals(enumEntry) {
  if (enumEntry.elements.length == 0)
    return { low: 0, high: 0 };
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;
  enumEntry.elements.forEach((member, index) => {
    let value = index;
    if (typeof member.initializer === "number" && !isStringEnum(enumEntry)) {
      value = member.initializer;
    }
    if (low > value)
      low = value;
    if (high < value)
      high = value;
  });
  return { low, high };
}
function enumBinaryRepresentation(enumEntry, compact = false) {
  const { low, high } = extremumOfOrdinals(enumEntry);
  if (compact) {
    if (0 <= low && high <= 255)
      return createPrimitiveType("u8");
    if (-128 <= low && high <= 127)
      return createPrimitiveType("i8");
  }
  if (low < -2147483648 || high > 2147483647)
    return createPrimitiveType("i64");
  return createPrimitiveType("i32");
}

// ../core/build/lib/src/resolveNamedNode.js
function resolveNamedNode(target, pov, corpus) {
  let result;
  let povScope = [];
  while (pov) {
    if (isFile(pov)) {
      if (result = resolveDownFromFile(target, pov, corpus))
        return result;
      const importUsings = pov.entries.filter((it) => isImport(it) && !it.name).map((it) => it);
      for (const importUsing of importUsings)
        if (result = resolveDownFromRoot([...importUsing.clause, ...target], corpus))
          return result;
      povScope = pov.packageClause.slice();
      break;
    } else {
      if (result = resolveDownFromNode(target, pov, false, corpus))
        return result;
    }
    pov = pov.parent;
  }
  for (; ; ) {
    if (result = resolveDownFromRoot([...povScope, ...target], corpus))
      return result;
    if (povScope.length)
      povScope.pop();
    else
      break;
  }
  return void 0;
}
function resolveDownFromNode(target, pov, withSelf, corpus) {
  if (withSelf && isNamedNode(pov)) {
    if (isReferenceType(pov) || !pov.name.length)
      return void 0;
    let nameMatched = target[0] === pov.name;
    if (!nameMatched)
      nameMatched = target[0] === "default" && hasExtAttribute(pov, IDLExtendedAttributes.DefaultExport);
    if (!nameMatched)
      return void 0;
    target = target.slice(1);
    if (isImport(pov)) {
      return resolveDownFromRoot([...pov.clause, ...target], corpus);
    }
    if (!target.length)
      return pov;
  }
  let candidates;
  if (isNamespace(pov))
    candidates = pov.members;
  else if (isEnum(pov))
    candidates = pov.elements;
  else if (isInterface(pov))
    candidates = pov.constants;
  else
    return void 0;
  let result;
  for (const candidate of candidates) {
    if (result = resolveDownFromNode(target, candidate, true, corpus))
      return result;
  }
  return void 0;
}
function resolveDownFromFile(target, pov, corpus) {
  let result;
  for (const candidate of pov.entries) {
    if (result = resolveDownFromNode(target, candidate, true, corpus))
      return result;
  }
  return void 0;
}
function resolveDownFromRoot(target, corpus) {
  let result;
  for (const file of corpus) {
    if (file.packageClause.length >= target.length)
      continue;
    let match = true;
    for (let index = 0; index < file.packageClause.length; ++index)
      if (file.packageClause[index] !== target[index]) {
        match = false;
        break;
      }
    if (!match)
      continue;
    if (result = resolveDownFromFile(target.slice(file.packageClause.length), file, corpus))
      return result;
  }
  return void 0;
}

// ../core/build/lib/src/library.js
function createLibrary(files) {
  return {
    files
  };
}
function toLibrary(ii) {
  return {
    files: Array.from(ii)
  };
}
function serializeParam(params) {
  if (typeof params === "undefined") {
    return "undefined";
  }
  if (typeof params === "boolean") {
    return params ? "true" : "false";
  }
  if (typeof params === "string") {
    return `"${params}"`;
  }
  if (typeof params === "number") {
    return params.toString();
  }
  if (typeof params === "object") {
    if (params === null) {
      return "null";
    }
    if (Array.isArray(params)) {
      return "[" + params.map(serializeParam).join(", ") + "]";
    }
    const keys = Object.keys(params);
    keys.sort();
    return "{" + keys.map((key) => {
      if (typeof key !== "string") {
        throw new Error(`Unsupported key! "${typeof key}"`);
      }
      const objectKey = key;
      return `${key}=${serializeParam(params[objectKey])}`;
    }).join(",") + "}";
  }
  throw new Error(`Unsupported type! "${typeof params}"`);
}
var queryCache = /* @__PURE__ */ new Map();
function cached(key, f) {
  return (x) => {
    if (queryCache.has(key)) {
      return queryCache.get(key);
    }
    const v = f(x);
    queryCache.set(key, v);
    return v;
  };
}
function reduce(key, f) {
  return {
    fn: cached(key, f),
    key,
    _redBrand: {}
  };
}
function req(key, fn) {
  return {
    fn,
    key,
    _reqBrand: {}
  };
}
function compose(base, next) {
  const key = base.key + "." + next.key;
  return {
    fn: cached(key, (x) => next.fn(base.fn(x))),
    key,
    _redBrand: {}
  };
}
function concat(f, g) {
  const key = `$pair{${f.key},${g.key}}`;
  return {
    fn: cached(key, (x) => {
      const r1 = f.fn(x);
      const r2 = g.fn(x);
      return [r1, r2];
    }),
    key,
    _reqBrand: {}
  };
}
var LensBuilder = class _LensBuilder {
  constructor(req2) {
    this.req = req2;
  }
  static make(r) {
    return new _LensBuilder(r);
  }
  pipe(r) {
    return new _LensBuilder(compose(this.req, r));
  }
  row(key, f) {
    return this.pipe(req(key, f));
  }
  query() {
    return this.req;
  }
};
function lens(r) {
  return LensBuilder.make(r);
}
function query(lib2, input) {
  const request = input instanceof LensBuilder ? input.query() : input;
  return request.fn(lib2);
}
var utils = {
  idx: (x) => req("idx", (xs) => xs.at(x)),
  fst: () => req("fst", (xs) => xs.at(0)),
  lst: () => req("lst", (xs) => xs.at(-1))
};
var select = {
  files() {
    return reduce("files", (x) => x.files);
  },
  nodes(params) {
    const key = "entities" + serializeParam(params);
    function go(node) {
      if (isNamespace(node) && (params === null || params === void 0 ? void 0 : params.expandNamespaces)) {
        return node.members.flatMap(go);
      }
      return [node];
    }
    return req(key, (xs) => {
      return xs.flatMap((x) => x.entries).flatMap(go);
    });
  },
  entries() {
    return req("entries", (xs) => xs.filter(isEntry));
  },
  interfaces() {
    return req("interfaces", (it) => it.filter(isInterface));
  },
  hasExt(attr) {
    return req("with_attr=" + serializeParam(attr), (it) => it.filter((x) => hasExtAttribute(x, attr)));
  },
  names() {
    return req("names", (xs) => xs.flatMap((x) => isNamedNode(x) ? [x.name] : []));
  },
  name(name) {
    return reduce(`select.by.name.${name}`, (lib2) => {
      return lib2.files.flatMap((it) => {
        return it.entries.flatMap((it2) => {
          if (isNamedNode(it2) && it2.name === name) {
            return [it2];
          }
          return [];
        });
      });
    });
  }
};
var lib = {
  createLibrary,
  toLibrary,
  lens,
  query,
  select,
  utils,
  req,
  compose,
  concat,
  other: {
    serializeParam
  }
};

// ../core/build/lib/src/Language.js
var Language = class _Language {
  constructor(name, extension) {
    this.name = name;
    this.extension = extension;
  }
  toString() {
    return this.name;
  }
  get directory() {
    return this.name.toLowerCase();
  }
  static fromString(name) {
    switch (name) {
      case "arkts":
        return _Language.ARKTS;
      case "ts":
        return _Language.TS;
      case "cangjie":
        return _Language.CJ;
      case "cpp":
        return _Language.CPP;
      case "kotlin":
        return _Language.KOTLIN;
      default:
        throw new Error(`Unsupported language ${name}`);
    }
  }
  static supportNS(lang) {
    switch (lang.name) {
      case "ArkTS":
        return true;
      case "TS":
        return true;
      case "Kotlin":
        return true;
      case "C++":
        return true;
      default:
        return false;
    }
  }
};
Language.TS = new Language("TS", ".ts");
Language.ARKTS = new Language("ArkTS", ".ts");
Language.CPP = new Language("C++", ".cpp");
Language.CJ = new Language("CangJie", ".cj");
Language.KOTLIN = new Language("Kotlin", ".kt");

// ../core/build/lib/src/languageSpecificKeywords.js
var cppKeywords = /* @__PURE__ */ new Set([
  `alignas`,
  `alignof`,
  `and`,
  `and_eq`,
  `asm`,
  `atomic_cancel`,
  `atomic_commit`,
  `atomic_noexcept`,
  `auto`,
  `bitand`,
  `bitor`,
  `bool`,
  `break`,
  `case`,
  `catch`,
  `char`,
  `char8_t`,
  `char16_t`,
  `char32_t`,
  `class`,
  `compl`,
  `concept`,
  `const`,
  `consteval`,
  `constexpr`,
  `constinit`,
  `const_cast`,
  `continue`,
  `co_await`,
  `co_return`,
  `co_yield`,
  `decltype`,
  `default`,
  `delete`,
  `do`,
  `double`,
  `dynamic_cast`,
  `else`,
  `enum`,
  `explicit`,
  `export`,
  `extern`,
  `false`,
  `float`,
  `for`,
  `friend`,
  `goto`,
  `if`,
  `inline`,
  `int`,
  `long`,
  `mutable`,
  `namespace`,
  `new`,
  `noexcept`,
  `not`,
  `not_eq`,
  `nullptr`,
  `operator`,
  `or`,
  `or_eq`,
  `private`,
  `protected`,
  `public`,
  `reflexpr`,
  `register`,
  `reinterpret_cast`,
  `requires`,
  `return`,
  `short`,
  `signed`,
  `sizeof`,
  `static`,
  `static_assert`,
  `static_cast`,
  `struct`,
  `switch`,
  `synchronized`,
  `template`,
  `this`,
  `thread_local`,
  `throw`,
  `true`,
  `try`,
  `typedef`,
  `typeid`,
  `typename`,
  `union`,
  `unsigned`,
  `using`,
  `virtual`,
  `void`,
  `volatile`,
  `wchar_t`,
  `while`,
  `xor`,
  `xor_eq`
]);
var TSKeywords = /* @__PURE__ */ new Set([
  "namespace"
]);

// ../core/build/lib/src/peer-generation/modules.js
var stdlibModule = {
  name: "__stdlib",
  packages: [""],
  useFoldersLayout: false,
  external: true,
  tsLikePackage: "__stdlib"
};
var modulesCache = /* @__PURE__ */ new Map();
function isSubmodule(source, target) {
  return source === target || target === "" || source.startsWith(target + ".");
}
function isInModule(nodeOrPackage, module2) {
  if (typeof nodeOrPackage === "object")
    return isInModule(getPackageName(nodeOrPackage), module2);
  return module2.packages.some((modulePackage) => isSubmodule(nodeOrPackage, modulePackage));
}
function getModuleFor(nodeOrPackage) {
  if (typeof nodeOrPackage === "object")
    return getModuleFor(getPackageName(nodeOrPackage));
  const packageName = nodeOrPackage;
  let module2 = modulesCache.get(packageName);
  if (module2)
    return module2;
  module2 = getApplicableModuleFor(packageName);
  modulesCache.set(packageName, module2);
  return module2;
}
function getApplicableModuleFor(packageName) {
  const config = generatorConfiguration();
  const applicableModules = [...config.modules.values()].filter((module2) => isInModule(packageName, module2));
  if (applicableModules.length === 0) {
    if (packageName === "") {
      console.error("WARNING: use current module for empty package");
      return stdlibModule;
    }
    if (packageName.startsWith(`idlize.stdlib`)) {
      return stdlibModule;
    }
    if (packageName.startsWith(`idlize.`)) {
      return currentModule();
    }
    if (packageName === `synthetic`)
      return currentModule();
    const modules = [...config.modules.keys()].map((it) => `"${it}"`).join(", ");
    throw new Error(`Package "${packageName}" is not listed in any module. Add the "${packageName}" to the existed list of modules [${modules}] or new one in the configuration file`);
  }
  if (applicableModules.length > 1)
    throw new Error(`Package ${packageName} listed in ${applicableModules.length} packages: ${applicableModules.map((it) => it.name).join(", ")}`);
  return applicableModules[0];
}
function currentModule() {
  const conf = generatorConfiguration();
  const result = conf.modules.get(conf.moduleName);
  if (!result)
    throw new Error(`Can not determine current module configuration ${conf.moduleName}`);
  return result;
}
function isInCurrentModule(nodeOrPackage) {
  const module2 = typeof nodeOrPackage === "string" ? getModuleFor(nodeOrPackage) : getModuleFor(nodeOrPackage);
  return generatorConfiguration().moduleName == module2.name;
}

// ../core/build/lib/src/diagnostictypes.js
var MessageSeverityList = ["fatal", "error", "warning", "information", "hint"];
var DiagnosticResults = class {
  constructor() {
    this.entries = [];
    this.totals = { "fatal": 0, "error": 0, "warning": 0, "information": 0, "hint": 0 };
  }
  push(message) {
    this.entries.push(message);
    this.totals[message.severity] += 1;
  }
  get hasErrors() {
    return this.totals.fatal != 0 || this.totals.error != 0;
  }
};
var DiagnosticException = class extends Error {
  constructor(diagnosticMessage, cause) {
    super();
    this.message = diagnosticMessage.parts[0].message;
    this.diagnosticMessage = diagnosticMessage;
    this.cause = cause;
  }
};

// ../core/build/lib/src/diagnosticmessages.js
var DiagnosticMessageGroup = class _DiagnosticMessageGroup {
  /**
   * Generated diagnostic messages belonging to _any_ group
   */
  static get allGroupsEntries() {
    return _DiagnosticMessageGroup.collectedResults.entries;
  }
  constructor(severity, code, codeDescription, mainMessageTemplate, additionalMessageTemplate) {
    this.severity = severity;
    this.code = code;
    this.codeDescription = codeDescription;
    this.mainMessageTemplate = mainMessageTemplate !== null && mainMessageTemplate !== void 0 ? mainMessageTemplate : codeDescription;
    this.additionalMessageTemplate = additionalMessageTemplate !== null && additionalMessageTemplate !== void 0 ? additionalMessageTemplate : "See";
    if (_DiagnosticMessageGroup.diagnosticMessageByCode.has(code)) {
      throw new Error(`Duplicate message code ${code}`);
    }
    _DiagnosticMessageGroup.diagnosticMessageByCode.set(code, this);
  }
  generateDiagnosticMessage(locations, mainMessage, additionalMessage) {
    let msg = {
      severity: this.severity,
      code: this.code,
      codeDescription: this.codeDescription,
      codeURI: this.codeURI,
      parts: []
    };
    let first = true;
    for (const l of locations) {
      msg.parts.push({ location: l, message: first ? mainMessage !== null && mainMessage !== void 0 ? mainMessage : this.mainMessageTemplate : additionalMessage !== null && additionalMessage !== void 0 ? additionalMessage : this.additionalMessageTemplate });
      first = false;
    }
    return msg;
  }
  reportDiagnosticMessage(locations, mainMessage, additionalMessage) {
    const msg = this.generateDiagnosticMessage(locations, mainMessage, additionalMessage);
    _DiagnosticMessageGroup.collectedResults.push(msg);
    return msg;
  }
  throwDiagnosticMessage(locations, mainMessage, additionalMessage) {
    throw new DiagnosticException(this.reportDiagnosticMessage(locations, mainMessage, additionalMessage));
  }
};
DiagnosticMessageGroup.diagnosticMessageByCode = /* @__PURE__ */ new Map();
DiagnosticMessageGroup.collectedResults = new DiagnosticResults();
var InternalFatal = new DiagnosticMessageGroup("fatal", "InternalFatal", "Unknown error");
var LoadingFatal = new DiagnosticMessageGroup("fatal", "LoadingFatal", "Loading error");
var ParsingFatal = new DiagnosticMessageGroup("fatal", "ParsingFatal", "Parsing error");
var ProcessingFatal = new DiagnosticMessageGroup("fatal", "ProcessingFatal", "Processing error");

// ../core/build/lib/src/formatter.js
var logger = (_, ...msg) => console.log(...msg);
function lineDigitCount(message) {
  let count = 0;
  for (let part of message.parts) {
    let range = part.location.range;
    if (range == null) {
      continue;
    }
    count = Math.max(count, range.start.line.toString().length, range.end.line.toString().length);
  }
  return count;
}
function paddedLineNo(digits, line) {
  let s = line.toString();
  if (s.length < digits) {
    return " ".repeat(digits - s.length) + s;
  }
  return s;
}
function formatLine(digits, lines, lineNo) {
  return `${paddedLineNo(digits, lineNo)} | ${lines[lineNo - 1]}`;
}
function formatUnderline(indent, lines, lineNo, range, edgeChar, midChar, message) {
  if (lineNo == range.start.line && lineNo == range.end.line) {
    let len = range.end.character - range.start.character + 1;
    return `${indent} | ${" ".repeat(range.start.character - 1)}${edgeChar}${len > 2 ? midChar.repeat(len - 2) : ""}${len > 1 ? edgeChar : ""} ${message}`;
  }
  if (lineNo == range.start.line) {
    let len = lines[lineNo - 1].length - range.start.character;
    return `${indent} | ${" ".repeat(range.start.character - 1)}${edgeChar}${len > 1 ? midChar.repeat(len - 1) : ""}`;
  }
  if (lineNo == range.end.line) {
    let len = range.end.character;
    return `${indent} | ${len > 1 ? midChar.repeat(len - 1) : ""}${edgeChar} ${message}`;
  }
  return `${indent} | ${midChar.repeat(lines[lineNo - 1].length)}`;
}
function outputDiagnosticMessageFormatted(message) {
  if (message.parts.length == 0) {
    return;
  }
  logger(message.severity, `${message.severity}[${message.code}]: ${message.codeDescription}`);
  let digits = lineDigitCount(message);
  let indent = " ".repeat(digits);
  let first = true;
  let lastPath = "";
  for (let part of message.parts) {
    const location = part.location;
    if (location.range != null && location.lines != null) {
      let range = location.range;
      let lines = location.lines;
      logger(message.severity, `${indent}${lastPath != part.location.documentPath ? "-->" : ":::"} ${part.location.documentPath}:${range.start.line}:${range.start.character}`);
      logger(message.severity, `${indent} |`);
      const last = Math.min(range.end.line + 1, lines.length - 1);
      for (let i = Math.max(range.start.line - 1, 1); i <= last; ++i) {
        logger(message.severity, formatLine(digits, lines, i));
        if (i >= range.start.line && i <= range.end.line) {
          logger(message.severity, formatUnderline(indent, lines, i, range, "^", first ? "-" : "~", part.message));
        }
      }
    } else {
      logger(message.severity, `${indent}--> ${part.location.documentPath}`);
      if (message.parts.length > 1) {
        logger(message.severity, `${indent} # ${part.message}`);
      }
    }
    first = false;
    lastPath = part.location.documentPath;
  }
  logger(message.severity, `${indent} = ${message.parts[0].message}`);
  logger(message.severity);
}

// ../core/build/lib/src/LanguageWriters/LanguageWriter.js
var fs3 = __toESM(require("node:fs"), 1);

// ../core/build/lib/src/LanguageWriters/common.js
var RuntimeType;
(function(RuntimeType2) {
  RuntimeType2[RuntimeType2["UNEXPECTED"] = -1] = "UNEXPECTED";
  RuntimeType2[RuntimeType2["NUMBER"] = 1] = "NUMBER";
  RuntimeType2[RuntimeType2["STRING"] = 2] = "STRING";
  RuntimeType2[RuntimeType2["OBJECT"] = 3] = "OBJECT";
  RuntimeType2[RuntimeType2["BOOLEAN"] = 4] = "BOOLEAN";
  RuntimeType2[RuntimeType2["UNDEFINED"] = 5] = "UNDEFINED";
  RuntimeType2[RuntimeType2["BIGINT"] = 6] = "BIGINT";
  RuntimeType2[RuntimeType2["FUNCTION"] = 7] = "FUNCTION";
  RuntimeType2[RuntimeType2["SYMBOL"] = 8] = "SYMBOL";
  RuntimeType2[RuntimeType2["MATERIALIZED"] = 9] = "MATERIALIZED";
})(RuntimeType = RuntimeType || (RuntimeType = {}));
var NativeModuleType = class {
  constructor(name) {
    this.name = name;
  }
};
var InteropModuleType = new NativeModuleType("InteropNativeModule");

// ../core/build/lib/src/LanguageWriters/nameConvertor.js
function convertType(convertor, type) {
  if (isOptionalType(type))
    return convertor.convertOptional(type);
  if (isUnionType(type))
    return convertor.convertUnion(type);
  if (isContainerType(type))
    return convertor.convertContainer(type);
  if (isImport(type))
    return convertor.convertImport(type);
  if (isReferenceType(type)) {
    const importAttr = getExtAttribute(type, IDLExtendedAttributes.Import);
    return importAttr ? convertor.convertTypeReferenceAsImport(type, importAttr) : convertor.convertTypeReference(type);
  }
  if (isTypeParameterType(type))
    return convertor.convertTypeParameter(type);
  if (isPrimitiveType(type))
    return convertor.convertPrimitiveType(type);
  throw new Error(`Unknown type ${IDLKind[type.kind]}`);
}
function convertDeclaration(convertor, decl) {
  if (isImport(decl))
    return convertor.convertImport(decl);
  if (isNamespace(decl))
    return convertor.convertNamespace(decl);
  if (isInterface(decl))
    return convertor.convertInterface(decl);
  if (isEnum(decl))
    return convertor.convertEnum(decl);
  if (isEnumMember(decl))
    return convertor.convertEnum(decl.parent);
  if (isTypedef(decl))
    return convertor.convertTypedef(decl);
  if (isCallback(decl))
    return convertor.convertCallback(decl);
  if (isMethod(decl))
    return convertor.convertMethod(decl);
  if (isConstant(decl))
    return convertor.convertConstant(decl);
  throw new Error(`Unknown declaration type ${decl.kind ? IDLKind[decl.kind] : "(undefined kind)"}`);
}
var _isInsideInstanceof = false;
function withInsideInstanceof(isInsideInstanceof2, op) {
  const prevIsInsideInstanceof = _isInsideInstanceof;
  _isInsideInstanceof = isInsideInstanceof2;
  const result = op();
  _isInsideInstanceof = prevIsInsideInstanceof;
  return result;
}

// ../core/build/lib/src/peer-generation/idl/IdlNameConvertor.js
var DeclarationNameConvertor = class {
  convertImport(decl) {
    console.warn("Imports are not implemented yet");
    return decl.name;
  }
  convertInterface(decl) {
    return decl.name;
  }
  convertEnum(decl) {
    return `${getNamespacesPathFor(decl).join("")}${decl.name}`;
  }
  convertTypedef(decl) {
    return decl.name;
  }
  convertCallback(decl) {
    var _a;
    return (_a = decl.name) !== null && _a !== void 0 ? _a : "MISSING CALLBACK NAME";
  }
  convertNamespace(node) {
    return node.name;
  }
  convertMethod(node) {
    return node.name;
  }
  convertConstant(node) {
    return node.name;
  }
};
DeclarationNameConvertor.I = new DeclarationNameConvertor();
var TSFeatureNameConvertor = class extends DeclarationNameConvertor {
  convertEnum(decl) {
    const namespace = getNamespacesPathFor(decl).map((it) => it.name);
    if (namespace.length > 0)
      return namespace[0];
    return decl.name;
  }
};
TSFeatureNameConvertor.I = new TSFeatureNameConvertor();
var ETSDeclarationNameConvertor = class extends DeclarationNameConvertor {
  convertInterface(decl) {
    return getQualifiedName(decl, "namespace.name");
  }
  convertEnum(decl) {
    return getQualifiedName(decl, "namespace.name");
  }
};
ETSDeclarationNameConvertor.I = new ETSDeclarationNameConvertor();
var CJDeclarationNameConvertor = class extends DeclarationNameConvertor {
  convertInterface(decl) {
    return decl.name;
  }
  convertEnum(decl) {
    return decl.name;
  }
};
CJDeclarationNameConvertor.I = new CJDeclarationNameConvertor();
var KotlinDeclarationNameConvertor = class extends DeclarationNameConvertor {
  convertInterface(decl) {
    return removePoints(getQualifiedName(decl, "namespace.name"));
  }
  convertEnum(decl) {
    return removePoints(getQualifiedName(decl, "namespace.name"));
  }
};
KotlinDeclarationNameConvertor.I = new KotlinDeclarationNameConvertor();
var ETSFeatureNameConvertor = class extends DeclarationNameConvertor {
  convertEnum(decl) {
    const namespace = getNamespacesPathFor(decl).map((it) => it.name);
    if (namespace.length > 0)
      return namespace[0];
    return decl.name;
  }
};
ETSFeatureNameConvertor.I = new ETSFeatureNameConvertor();
var CJFeatureNameConvertor = class extends DeclarationNameConvertor {
  convertEnum(decl) {
    return decl.name;
  }
};
CJFeatureNameConvertor.I = new CJFeatureNameConvertor();
var KotlinFeatureNameConvertor = class extends DeclarationNameConvertor {
  convertInterface(decl) {
    return removePoints(getQualifiedName(decl, "namespace.name"));
  }
  convertEnum(decl) {
    return removePoints(getQualifiedName(decl, "namespace.name"));
  }
};
KotlinFeatureNameConvertor.I = new KotlinFeatureNameConvertor();
function createDeclarationNameConvertor(language) {
  switch (language) {
    case Language.ARKTS:
      return ETSDeclarationNameConvertor.I;
    case Language.CPP:
    case Language.TS:
      return DeclarationNameConvertor.I;
    case Language.CJ:
      CJDeclarationNameConvertor.I;
    case Language.KOTLIN:
      KotlinDeclarationNameConvertor.I;
    default:
      throw new Error(`Language ${language.toString()} is not supported`);
  }
}

// ../core/build/lib/src/LanguageWriters/LanguageWriter.js
var TernaryExpression = class {
  constructor(condition, trueExpression, falseExpression) {
    this.condition = condition;
    this.trueExpression = trueExpression;
    this.falseExpression = falseExpression;
  }
  asString() {
    return `(${this.condition.asString()}) ? (${this.trueExpression.asString()}) : (${this.falseExpression.asString()})`;
  }
};
var NaryOpExpression = class {
  constructor(op, args) {
    this.op = op;
    this.args = args;
  }
  asString() {
    if (this.args.length === 1)
      return this.args[0].asString();
    return `${this.args.map((arg) => `(${arg.asString()})`).join(` ${this.op} `)}`;
  }
};
var StringExpression = class {
  constructor(value) {
    this.value = value;
  }
  asString() {
    return this.value;
  }
};
var NewObjectExpression = class {
  constructor(objectName, params) {
    this.objectName = objectName;
    this.params = params;
  }
  asString() {
    return `new ${this.objectName}(${this.params.map((it) => it.asString()).join(", ")})`;
  }
};
var FunctionCallExpression = class {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
  asString() {
    return `${this.name}(${this.params.map((it) => it.asString()).join(", ")})`;
  }
};
var MethodCallExpression = class extends FunctionCallExpression {
  constructor(receiver, method, params, nullable = false) {
    super(method, params);
    this.receiver = receiver;
    this.nullable = nullable;
  }
  asString() {
    return `${this.receiver}${this.nullable ? "?" : ""}.${super.asString()}`;
  }
};
var MethodStaticCallExpression = class extends MethodCallExpression {
  constructor(receiver, method, params, nullable = false) {
    super(receiver, method, params, nullable);
    this.receiver = receiver;
    this.nullable = nullable;
  }
};
var ThisCallExpression = class extends FunctionCallExpression {
  constructor(params) {
    super("this", params);
  }
};
var FieldAccessExpression = class {
  constructor(receiver, field, nullable = false) {
    this.receiver = receiver;
    this.field = field;
    this.nullable = nullable;
  }
  asString() {
    return `${this.receiver}${this.nullable ? "?" : ""}.${this.field}`;
  }
};
var AssignStatement = class {
  constructor(variableName, type, expression, isDeclared = true, isConst = true, options) {
    this.variableName = variableName;
    this.type = type;
    this.expression = expression;
    this.isDeclared = isDeclared;
    this.isConst = isConst;
    this.options = options;
  }
  write(writer) {
    var _a, _b, _c;
    if (this.isDeclared) {
      const typeSpec = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideTypeName) ? `: ${this.options.overrideTypeName}` : this.type ? `: ${writer.getNodeName(this.type)}${/*SHOULD BE REMOVED*/
      isOptionalType(this.type) ? "|undefined" : ""}` : "";
      const initValue = this.expression ? `= ${this.expression.asString()}` : "";
      const constSpec = this.isConst ? "const" : "let";
      writer.print(`${constSpec} ${this.variableName}${typeSpec} ${initValue}`);
    } else {
      const receiver = (_b = this.options) === null || _b === void 0 ? void 0 : _b.receiver;
      const withReceiver = receiver ? `${receiver}.` : "";
      writer.print(`${withReceiver}${this.variableName} = ${(_c = this.expression) === null || _c === void 0 ? void 0 : _c.asString()}`);
    }
  }
};
var ExpressionStatement = class {
  constructor(expression) {
    this.expression = expression;
  }
  write(writer) {
    const text = this.expression.asString();
    if (text.length > 0) {
      writer.print(`${this.expression.asString()}${writer.maybeSemicolon()}`);
    }
  }
};
var BlockStatement = class {
  constructor(statements, inScope = true, newLine = true) {
    this.statements = statements;
    this.inScope = inScope;
    this.newLine = newLine;
  }
  write(writer) {
    if (this.inScope) {
      this.newLine ? writer.print("{") : writer.printer.appendLastString(" {");
      writer.pushIndent();
    }
    this.statements.forEach((s) => s.write(writer));
    if (this.inScope) {
      writer.popIndent();
      writer.print("}");
    }
  }
};
var IfStatement = class {
  constructor(condition, thenStatement, elseStatement, insideIfOp, insideElseOp) {
    this.condition = condition;
    this.thenStatement = thenStatement;
    this.elseStatement = elseStatement;
    this.insideIfOp = insideIfOp;
    this.insideElseOp = insideElseOp;
  }
  write(writer) {
    writer.print(`if (${this.condition.asString()})`);
    this.writeBody(writer, this.thenStatement, () => {
      if (this.insideIfOp) {
        this.insideIfOp();
      }
    });
    if (this.elseStatement !== void 0) {
      if (this.thenStatement instanceof BlockStatement && this.thenStatement.inScope) {
        writer.printer.appendLastString(" else");
      } else {
        writer.print("else");
      }
      this.writeBody(writer, this.elseStatement, () => {
        if (this.insideElseOp) {
          this.insideElseOp();
        }
      });
    }
  }
  writeBody(writer, body, op) {
    if (!(body instanceof BlockStatement)) {
      writer.pushIndent();
    }
    body.write(writer);
    op();
    if (!(body instanceof BlockStatement)) {
      writer.popIndent();
    }
  }
};
var TryCatchStatement = class _TryCatchStatement {
  constructor(tryStatement, catchStatement, finallyStatement, options) {
    this.options = options;
    if (catchStatement === void 0 && finallyStatement === void 0)
      throw new Error("Either catch or finally statement must be defined");
    this.tryStatement = _TryCatchStatement.wrapBlockStatement(tryStatement);
    if (catchStatement)
      this.catchStatement = _TryCatchStatement.wrapBlockStatement(catchStatement);
    if (finallyStatement)
      this.finallyStatement = _TryCatchStatement.wrapBlockStatement(finallyStatement);
  }
  write(writer) {
    writer.print(`try`);
    this.tryStatement.write(writer);
    const errType = this.options.errorType ? `: ${this.options.errorType}` : ``;
    if (this.catchStatement) {
      writer.printer.appendLastString(` catch (${this.options.catchName}${errType}) `);
      this.catchStatement.write(writer);
    }
    if (this.finallyStatement) {
      writer.printer.appendLastString(` finally `);
      this.finallyStatement.write(writer);
    }
  }
  static wrapBlockStatement(statement) {
    if (statement instanceof BlockStatement && statement.inScope)
      return statement;
    return new BlockStatement([statement], true, false);
  }
};
var MultiBranchIfStatement = class {
  constructor(statements, elseStatement) {
    this.statements = statements;
    this.elseStatement = elseStatement;
  }
  write(writer) {
    this.statements.forEach((value, index) => {
      const { expr, stmt } = value;
      if (index == 0) {
        writer.print(`if (${expr.asString()}) {`);
      } else {
        writer.printer.appendLastString(` else if (${expr.asString()}) {`);
      }
      writer.pushIndent();
      stmt.write(writer);
      writer.popIndent();
      writer.print("}");
    });
    if (this.statements.length > 0 && this.elseStatement !== void 0) {
      writer.printer.appendLastString(" else {");
      writer.pushIndent();
      this.elseStatement.write(writer);
      writer.popIndent();
      writer.print("}");
    }
  }
};
var TsEnumEntityStatement = class {
  constructor(enumEntity, options) {
    this.enumEntity = enumEntity;
    this.options = options;
  }
  write(writer) {
    let enumName = convertDeclaration(createDeclarationNameConvertor(Language.ARKTS), this.enumEntity);
    enumName = enumName.split(".").at(-1);
    const members = this.getMembers();
    writer.writeEnum(enumName, members, { isExport: this.options.isExport, isDeclare: this.options.isDeclare });
  }
  getMembers() {
    const originalStyleNames = [];
    this.enumEntity.elements.forEach((member, index) => {
      var _a;
      const initText = (_a = member.initializer) !== null && _a !== void 0 ? _a : index;
      const isTypeString = typeof initText !== "number";
      const originalName = getExtAttribute(member, IDLExtendedAttributes.OriginalEnumMemberName);
      originalStyleNames.push({
        name: originalName !== null && originalName !== void 0 ? originalName : member.name,
        alias: void 0,
        stringId: isTypeString ? initText : void 0,
        numberId: isTypeString ? index : initText
      });
    });
    let members = originalStyleNames;
    return members;
  }
};
var ReturnStatement = class {
  constructor(expression) {
    this.expression = expression;
  }
  write(writer) {
    writer.print(this.expression ? `return ${this.expression.asString()}` : "return");
  }
};
var LambdaExpression = class {
  constructor(originalWriter, signature, resolver, body) {
    this.originalWriter = originalWriter;
    this.signature = signature;
    this.resolver = resolver;
    this.body = body;
  }
  bodyAsString(isScoped = false) {
    const writer = this.originalWriter.fork();
    if (this.body) {
      writer.writeStatement(new BlockStatement(this.body, isScoped, false));
    }
    writer.features.forEach((feature) => {
      if (feature.type === "raw")
        this.originalWriter.addFeature(feature.feature, feature.module);
      else
        this.originalWriter.addFeature(feature.node);
    });
    return writer.getOutput().map((line) => {
      if (!this.statementHasSemicolon) {
        return line;
      }
      return line.endsWith("{") || line.endsWith("}") || line.endsWith(";") ? line : `${line};`;
    }).join("\n");
  }
};
var ArgumentModifier;
(function(ArgumentModifier3) {
  ArgumentModifier3[ArgumentModifier3["OPTIONAL"] = 0] = "OPTIONAL";
})(ArgumentModifier = ArgumentModifier || (ArgumentModifier = {}));
var FieldModifier;
(function(FieldModifier2) {
  FieldModifier2[FieldModifier2["READONLY"] = 0] = "READONLY";
  FieldModifier2[FieldModifier2["PRIVATE"] = 1] = "PRIVATE";
  FieldModifier2[FieldModifier2["PUBLIC"] = 2] = "PUBLIC";
  FieldModifier2[FieldModifier2["STATIC"] = 3] = "STATIC";
  FieldModifier2[FieldModifier2["PROTECTED"] = 4] = "PROTECTED";
  FieldModifier2[FieldModifier2["FINAL"] = 5] = "FINAL";
  FieldModifier2[FieldModifier2["VOLATILE"] = 6] = "VOLATILE";
  FieldModifier2[FieldModifier2["INTERNAL"] = 7] = "INTERNAL";
  FieldModifier2[FieldModifier2["OVERRIDE"] = 8] = "OVERRIDE";
  FieldModifier2[FieldModifier2["GET"] = 9] = "GET";
  FieldModifier2[FieldModifier2["SET"] = 10] = "SET";
})(FieldModifier = FieldModifier || (FieldModifier = {}));
var ACCESS_MODIFIERS_SET = /* @__PURE__ */ new Set([
  FieldModifier.PRIVATE,
  FieldModifier.PROTECTED,
  FieldModifier.PUBLIC
]);
var MethodModifier;
(function(MethodModifier4) {
  MethodModifier4[MethodModifier4["PUBLIC"] = 0] = "PUBLIC";
  MethodModifier4[MethodModifier4["PRIVATE"] = 1] = "PRIVATE";
  MethodModifier4[MethodModifier4["PROTECTED"] = 2] = "PROTECTED";
  MethodModifier4[MethodModifier4["STATIC"] = 3] = "STATIC";
  MethodModifier4[MethodModifier4["NATIVE"] = 4] = "NATIVE";
  MethodModifier4[MethodModifier4["INLINE"] = 5] = "INLINE";
  MethodModifier4[MethodModifier4["GETTER"] = 6] = "GETTER";
  MethodModifier4[MethodModifier4["SETTER"] = 7] = "SETTER";
  MethodModifier4[MethodModifier4["THROWS"] = 8] = "THROWS";
  MethodModifier4[MethodModifier4["FREE"] = 9] = "FREE";
  MethodModifier4[MethodModifier4["FORCE_CONTEXT"] = 10] = "FORCE_CONTEXT";
  MethodModifier4[MethodModifier4["OVERRIDE"] = 11] = "OVERRIDE";
  MethodModifier4[MethodModifier4["OPEN"] = 12] = "OPEN";
  MethodModifier4[MethodModifier4["ABSTRACT"] = 13] = "ABSTRACT";
})(MethodModifier = MethodModifier || (MethodModifier = {}));
var METHOD_ACCESS_MODIFIERS = /* @__PURE__ */ new Set([
  MethodModifier.PUBLIC,
  MethodModifier.PRIVATE,
  MethodModifier.PROTECTED
]);
var ClassModifier;
(function(ClassModifier2) {
  ClassModifier2[ClassModifier2["PUBLIC"] = 0] = "PUBLIC";
  ClassModifier2[ClassModifier2["PRIVATE"] = 1] = "PRIVATE";
  ClassModifier2[ClassModifier2["PROTECTED"] = 2] = "PROTECTED";
})(ClassModifier = ClassModifier || (ClassModifier = {}));
var DelegationType;
(function(DelegationType2) {
  DelegationType2[DelegationType2["THIS"] = 0] = "THIS";
  DelegationType2[DelegationType2["SUPER"] = 1] = "SUPER";
})(DelegationType = DelegationType || (DelegationType = {}));
var Method = class {
  constructor(name, signature, modifiers = void 0, generics) {
    this.name = name;
    this.signature = signature;
    this.modifiers = modifiers;
    this.generics = generics;
  }
};
Method.knownReferenceTypes = [
  "KInt",
  "KPointer",
  "undefined"
  /* This one looks like a bug */
];
var PrintHint = class {
  constructor(hint) {
    this.hint = hint;
  }
};
PrintHint.AsPointer = new PrintHint("AsPointer");
PrintHint.AsConstPointer = new PrintHint("AsConstPointer");
PrintHint.AsValue = new PrintHint("AsValue");
PrintHint.AsConstReference = new PrintHint("AsConstReference");
PrintHint.AsReference = new PrintHint("AsReference");
var MethodSignature = class {
  constructor(returnType, args, defaults = void 0, argsModifiers = void 0, printHints) {
    this.returnType = returnType;
    this.args = args;
    this.defaults = defaults;
    this.printHints = printHints;
    this.argsModifiers = argsModifiers === null || argsModifiers === void 0 ? void 0 : argsModifiers.map((it) => it === void 0 ? [] : Array.isArray(it) ? it : [it]);
  }
  argName(index) {
    return `arg${index}`;
  }
  argDefault(index) {
    var _a;
    return (_a = this.defaults) === null || _a === void 0 ? void 0 : _a[index];
  }
  isArgOptional(index) {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.argsModifiers) === null || _a === void 0 ? void 0 : _a[index]) === null || _b === void 0 ? void 0 : _b.includes(ArgumentModifier.OPTIONAL)) !== null && _c !== void 0 ? _c : false;
  }
  retHint() {
    var _a;
    return (_a = this.printHints) === null || _a === void 0 ? void 0 : _a[0];
  }
  argHint(index) {
    var _a;
    return (_a = this.printHints) === null || _a === void 0 ? void 0 : _a[index + 1];
  }
  toString() {
    return `${this.args.map((it) => forceAsNamedNode(it).name)} => ${this.returnType}`;
  }
};
var NamedMethodSignature = class _NamedMethodSignature extends MethodSignature {
  constructor(returnType, args = [], argsNames = [], defaults = void 0, argsModifiers = void 0, printHints) {
    super(returnType, args, defaults, argsModifiers, printHints);
    this.argsNames = argsNames;
  }
  static make(returnType, args) {
    return new _NamedMethodSignature(returnType, args.map((it) => it.type), args.map((it) => it.name));
  }
  argName(index) {
    return this.argsNames[index];
  }
};
var LanguageWriter = class {
  constructor(printer, resolver, language) {
    this.printer = printer;
    this.resolver = resolver;
    this.language = language;
    this.namespaceStack = [];
    this.features = [];
  }
  indentDepth() {
    return this.printer.indentDepth();
  }
  maybeSemicolon() {
    return ";";
  }
  addFeature(featureOrNode, module2) {
    if (typeof featureOrNode === "string")
      this.features.push({ type: "raw", feature: featureOrNode, module: module2 });
    else
      this.features.push({ type: "idl", node: featureOrNode });
  }
  // version of makeCast which uses TypeCheck.typeCast<T>(value) call for ETS language writer
  // Use it only if TypeChecker class is added as import to the generated file
  makeTypeCast(value, type, options) {
    return this.makeCast(value, type, options);
  }
  makeUnwrapOptional(expression) {
    return expression;
  }
  concat(other) {
    other.getOutput().forEach((it) => this.print(it));
    return this;
  }
  printTo(file) {
    fs3.writeFileSync(file, this.getOutput().join("\n"));
  }
  writeLines(lines) {
    if (typeof lines === "string")
      lines = lines.split("\n");
    lines.forEach((it) => this.print(it));
  }
  writeGetterImplementation(method, op) {
    var _a;
    this.writeMethodImplementation(new Method(method.name, method.signature, [MethodModifier.GETTER].concat((_a = method.modifiers) !== null && _a !== void 0 ? _a : [])), op);
  }
  writeSetterImplementation(method, op) {
    var _a;
    this.writeMethodImplementation(new Method(method.name, method.signature, [MethodModifier.SETTER].concat((_a = method.modifiers) !== null && _a !== void 0 ? _a : [])), op);
  }
  // Deprecated
  // Use instead declarationCall parameter in writeConstructorImplementation(...)
  writeSuperCall(params) {
    this.printer.print(`super(${params.join(", ")})${this.maybeSemicolon()}`);
  }
  writeMethodCall(receiver, method, params, nullable = false) {
    this.printer.print(`${receiver}${nullable ? "?" : ""}.${method}(${params.join(", ")})`);
  }
  writeStaticMethodCall(receiver, method, params, nullable = false) {
    this.writeMethodCall(receiver, method, params, nullable);
  }
  writeStatement(stmt) {
    stmt.write(this);
  }
  writeStatements(...statements) {
    statements.forEach((it) => this.writeStatement(it));
  }
  writeExpressionStatement(smth) {
    this.writeStatement(new ExpressionStatement(smth));
  }
  writeExpressionStatements(...statements) {
    statements.forEach((it) => this.writeExpressionStatement(it));
  }
  writePrefixedBlock(prefix, op) {
    this.print(`${prefix} {`);
    this.pushIndent();
    op(this);
    this.popIndent();
    this.print("}");
  }
  writeStaticInitBlock(op) {
    this.writePrefixedBlock("static", op);
  }
  makeRef(type, _options) {
    return type;
  }
  makeThis() {
    return new StringExpression("this");
  }
  makeNull(type) {
    return new StringExpression("null");
  }
  makeVoid() {
    return this.makeUndefined();
  }
  makeLambdaReturn(expr) {
    return this.makeReturn(expr);
  }
  makeRuntimeTypeCondition(typeVarName, equals, type, varName) {
    const op = equals ? "==" : "!=";
    return this.makeNaryOp(op, [this.makeString(typeVarName), this.makeRuntimeType(type)]);
  }
  makeValueFromOption(value, destinationConvertor) {
    return this.makeString(`${value}!`);
  }
  makeNewObject(objectName, params = []) {
    return new NewObjectExpression(objectName, params);
  }
  makeFunctionCall(name, params) {
    if (typeof name === "string") {
      return new FunctionCallExpression(name, params);
    }
    return new FunctionCallExpression(name.asString(), params);
  }
  makeMethodCall(receiver, method, params, nullable) {
    return new MethodCallExpression(receiver, method, params, nullable);
  }
  makeFunctionReference(name) {
    return this.makeString(name);
  }
  makeMethodReference(receiver, method) {
    return this.makeString(`${receiver}.${method}`);
  }
  // Deprecated
  // Use instead declarationCall parameter in writeConstructorImplementation(...) with DelegationType.THIS
  makeThisCall(params) {
    return new ThisCallExpression(params);
  }
  makeStaticMethodCall(receiver, method, params, nullable) {
    return new MethodStaticCallExpression(receiver, method, params, nullable);
  }
  makeFieldAccess(receiver, method, nullable) {
    return new FieldAccessExpression(receiver, method, nullable);
  }
  makeNativeCall(nativeModule, method, params, nullable) {
    return new MethodCallExpression(this.nativeReceiver(nativeModule), method, params, nullable);
  }
  makeBlock(statements, inScope = true, newLine = true) {
    return new BlockStatement(statements, inScope, newLine);
  }
  nativeReceiver(nativeModule) {
    return nativeModule.name;
  }
  makeRuntimeTypeDefinedCheck(runtimeType) {
    return this.makeRuntimeTypeCondition(runtimeType, false, RuntimeType.UNDEFINED);
  }
  makeTryCatch(tryStatement, catchStatement, finallyStatement, options) {
    var _a;
    return new TryCatchStatement(tryStatement, catchStatement, finallyStatement, {
      catchName: (_a = options === null || options === void 0 ? void 0 : options.catchName) !== null && _a !== void 0 ? _a : "error"
    });
  }
  makeCondition(condition, thenStatement, elseStatement, insideIfOp, insideElseOp) {
    return new IfStatement(condition, thenStatement, elseStatement, insideIfOp, insideElseOp);
  }
  makeMultiBranchCondition(conditions, elseStatement) {
    return new MultiBranchIfStatement(conditions, elseStatement);
  }
  makeTernary(condition, trueExpression, falseExpression) {
    return new TernaryExpression(condition, trueExpression, falseExpression);
  }
  makeArrayLength(array, length) {
    return this.makeString(`${array}.length`);
  }
  makeArrayAccess(value, indexVar) {
    return this.makeString(`${value}[${indexVar}]`);
  }
  makeTupleAccess(value, index) {
    return this.makeString(`${value}[${index}]`);
  }
  makeUnionSelector(value, valueType) {
    return this.makeAssign(valueType, void 0, this.makeString(`runtimeType(${value})`), false);
  }
  makeUnionVariantCast(value, type, convertor, index) {
    return this.makeString(`unsafeCast<${type}>(${value})`);
  }
  makeUnionTypeDefaultInitializer() {
    return this.makeRuntimeType(RuntimeType.UNDEFINED);
  }
  makeArrayResize(array, arrayType, length, deserializer) {
    return new ExpressionStatement(new StringExpression(""));
  }
  makeMapResize(mapTypeName, keyType, valueType, map, size, deserializer) {
    return new ExpressionStatement(new StringExpression("// Improve: TS map resize"));
  }
  makeMapSize(map) {
    return this.makeString(`${map}.size`);
  }
  makeTupleAlloc(option) {
    return new ExpressionStatement(new StringExpression(""));
  }
  makeSetUnionSelector(value, index) {
    return new ExpressionStatement(new StringExpression(""));
  }
  makeSetOptionTag(value, tag) {
    return new ExpressionStatement(new StringExpression(""));
  }
  makeString(value) {
    return new StringExpression(value);
  }
  makeNaryOp(op, args) {
    return new NaryOpExpression(op, args);
  }
  makeStatement(expr) {
    return new ExpressionStatement(expr);
  }
  writeNativeMethodDeclaration(method) {
    this.writeMethodDeclaration(method.name, method.signature);
  }
  pushIndent() {
    this.printer.pushIndent();
  }
  popIndent() {
    this.printer.popIndent();
  }
  print(string) {
    this.printer.print(string);
  }
  getOutput() {
    return this.printer.getOutput();
  }
  makeSignature(returnType, parameters) {
    return new MethodSignature(returnType, parameters.map((it) => it.type));
  }
  mapFieldModifier(modifier) {
    return `${FieldModifier[modifier].toLowerCase()}`;
  }
  mapMethodModifier(modifier) {
    return `${MethodModifier[modifier].toLowerCase()}`;
  }
  /**
   * Improve: replace me with {@link makeUnsafeCast_}
   */
  makeUnsafeCast(param) {
    return `unsafeCast<int32>(${param})`;
  }
  makeUnsafeCast_(value, type, typeOptions) {
    return `(${value.asString()} as ${this.getNodeName(type)})`;
  }
  runtimeType(param, valueType, value) {
    this.writeStatement(this.makeAssign(valueType, createPrimitiveType("i32"), this.makeFunctionCall("runtimeType", [this.makeString(value)]), false));
  }
  makeEnumEntity(enumEntity, options) {
    return new TsEnumEntityStatement(enumEntity, { isExport: options.isExport, isDeclare: !!options.isDeclare });
  }
  makeFieldModifiersList(modifiers, customFieldFilter) {
    let allowedModifiers = this.supportedFieldModifiers;
    let modifierFilter = customFieldFilter ? customFieldFilter : function(field) {
      return allowedModifiers.includes(field);
    };
    let prefix = modifiers === null || modifiers === void 0 ? void 0 : modifiers.filter(modifierFilter).map((it) => this.mapFieldModifier(it)).join(" ");
    return prefix ? prefix : "";
  }
  escapeKeyword(keyword) {
    return keyword;
  }
  makeCastCustomObject(customName, _isGenericType) {
    return this.makeString(customName);
  }
  makeHasOwnProperty(value, property, propertyTypeName) {
    const expressions = [this.makeString(`${value}.hasOwnProperty("${property}")`)];
    if (propertyTypeName) {
      expressions.push(this.makeString(`isInstanceOf("${propertyTypeName}", ${value}.${property})`));
    }
    return this.makeNaryOp("&&", expressions);
  }
  discriminate(value, index, type, runtimeTypes) {
    return `${value}.getSelector() == ${index}`;
  }
  makeNot(expr) {
    return this.makeString(`!(${expr.asString()})`);
  }
  makeAnd(...args) {
    return this.makeNaryOp("&&", args);
  }
  makeOr(...args) {
    return this.makeNaryOp("||", args);
  }
  makeSerializedBufferGetter(serializer) {
    return this.makeMethodCall(serializer, `asBuffer`, []);
  }
  makeEquals(args) {
    return this.makeNaryOp("===", args);
  }
  castToInt(value, bitness) {
    return value;
  }
  castToBoolean(value) {
    return value;
  }
  makeCallIsObject(value) {
    return this.makeString(`typeof ${value} === "object"`);
  }
  writeStaticEntitiesBlock(op) {
    op(this);
  }
  instanceOf(value, type) {
    return this.makeString(`${value} instanceof ${withInsideInstanceof(true, () => this.getNodeName(type))}`);
  }
  // The version of instanceOf() which does not use ArgConvertors
  typeInstanceOf(type, value, members) {
    return this.makeString(`${value} instanceof ${withInsideInstanceof(true, () => this.getNodeName(type))}`);
  }
  /**
   * Writes `namespace <namespace> {` and adds extra indent
   * @param namespace Namespace to begin
   */
  pushNamespace(namespace, options) {
    this.print(`namespace ${namespace} {`);
    if (options.indent)
      this.pushIndent();
  }
  /**
   * Writes closing brace of namespace block and removes one level of indent
   */
  popNamespace(options) {
    this.namespaceStack.pop();
    if (options.indent)
      this.popIndent();
    this.print(`}`);
  }
  static get isReferenceRelativeToNamespaces() {
    return this._isReferenceRelativeToNamespaces;
  }
  static relativeReferences(isRelative, op) {
    const prevIsRelative = this.isReferenceRelativeToNamespaces;
    this._isReferenceRelativeToNamespaces = isRelative;
    const result = op();
    this._isReferenceRelativeToNamespaces = prevIsRelative;
    return result;
  }
  static get isManagedThrowsTypeUnwrapped() {
    return this._isManagedThrowsTypeUnwrapped;
  }
  static managedThrowsTypeUnwrapped(isUnwrapped, op) {
    const prevIsGenerated = this._isManagedThrowsTypeUnwrapped;
    this._isManagedThrowsTypeUnwrapped = isUnwrapped;
    const result = op();
    this._isManagedThrowsTypeUnwrapped = prevIsGenerated;
    return result;
  }
};
LanguageWriter._isReferenceRelativeToNamespaces = false;
LanguageWriter._isManagedThrowsTypeUnwrapped = true;

// ../core/build/lib/src/peer-generation/PrimitiveType.js
var PrimitiveType = class {
  constructor(name, isPointer = false) {
    this.name = name;
    this.isPointer = isPointer;
  }
  getText() {
    return generatorConfiguration().TypePrefix + this.name;
  }
  getInterop() {
    return "Interop" + this.name;
  }
  toString() {
    return this.getText();
  }
};
var PrimitiveTypeList = class {
  constructor() {
    this.Int32 = new PrimitiveType(`Int32`);
    this.Int64 = new PrimitiveType(`Int64`);
    this.Number = new PrimitiveType(`Number`);
    this.Boolean = new PrimitiveType(`Boolean`);
    this.Function = new PrimitiveType(`Function`);
    this.Undefined = new PrimitiveType(`Undefined`);
    this.Void = new PrimitiveType(`Void`);
    this.NativePointer = new PrimitiveType(`NativePointer`);
    this.Tag = new PrimitiveType(`Tag`);
    this.Materialized = new PrimitiveType(`Materialized`, true);
    this.CustomObject = new PrimitiveType(`CustomObject`, true);
    this.String = new PrimitiveType(`String`);
  }
  static get UndefinedTag() {
    return "INTEROP_TAG_UNDEFINED";
  }
  static get UndefinedRuntime() {
    return "INTEROP_RUNTIME_UNDEFINED";
  }
  static get ObjectTag() {
    return "INTEROP_TAG_OBJECT";
  }
};
var PrimitiveTypesInstance = new PrimitiveTypeList();

// ../core/build/lib/src/LanguageWriters/convertors/InteropConvertors.js
var InteropArgConvertor = class {
  convert(type) {
    return convertType(this, type);
  }
  convertContainer(type) {
    throw new Error(`Cannot pass container types through interop`);
  }
  convertImport(type) {
    throw new Error(`Cannot pass import types through interop`);
  }
  convertTypeReferenceAsImport(type, importClause) {
    throw new Error(`Cannot pass import types through interop`);
  }
  convertOptional(type) {
    return "KNativePointer";
  }
  convertPrimitiveType(type) {
    switch (type.name) {
      case "i8":
      case "u8":
      case "i16":
      case "u16":
      case "i32":
      case "u32":
        return "KInt";
      case "i64":
      case "u64":
        return "KLong";
      case "f16":
      case "f32":
        return "KFloat";
      case "f64":
        return "KDouble";
      case "number":
        return "KInteropNumber";
      case "bigint":
        return "KLong";
      case "SerializerBuffer":
        return "KSerializerBuffer";
      case "boolean":
      case "Function":
        return "KInt";
      case "String":
        return "KStringPtr";
      case "buffer":
        return `KInteropBuffer`;
      case "date":
        return "KLong";
      case "undefined":
      case "void":
      case "pointer":
        return "KPointer";
    }
    throw new Error(`Cannot pass primitive type ${type.name} through interop`);
  }
  convertTypeParameter(type) {
    throw new Error("Cannot pass type parameters through interop");
  }
  convertTypeReference(type) {
    throw new Error(`Cannot pass type references through interop`);
  }
  convertUnion(type) {
    throw new Error("Cannot pass union types through interop");
  }
};

// ../core/build/lib/src/LanguageWriters/convertors/CppConvertors.js
var CppInteropArgConvertor = class extends InteropArgConvertor {
  convertOptional(type) {
    return PrimitiveTypesInstance.NativePointer.getText();
  }
  convertPrimitiveType(type) {
    switch (type.name) {
      case "boolean":
        return PrimitiveTypesInstance.Boolean.getText();
      case "i32":
        return PrimitiveTypesInstance.Int32.getText();
      case "number":
        return "KInteropNumber";
      case "SerializerBuffer":
        return "KSerializerBuffer";
      case "buffer":
        return "KInteropBuffer";
      case "Function":
        return PrimitiveTypesInstance.Int32.getText();
      case "date":
        return PrimitiveTypesInstance.Int64.getText();
      case "pointer":
        return PrimitiveTypesInstance.NativePointer.getText();
    }
    return super.convertPrimitiveType(type);
  }
};
CppInteropArgConvertor.INSTANCE = new CppInteropArgConvertor();

// ../core/build/lib/src/peer-generation/LayoutManager.js
var LayoutNodeRole;
(function(LayoutNodeRole2) {
  LayoutNodeRole2[LayoutNodeRole2["PEER"] = 0] = "PEER";
  LayoutNodeRole2[LayoutNodeRole2["INTERFACE"] = 1] = "INTERFACE";
  LayoutNodeRole2[LayoutNodeRole2["GLOBAL"] = 2] = "GLOBAL";
  LayoutNodeRole2[LayoutNodeRole2["COMPONENT"] = 3] = "COMPONENT";
  LayoutNodeRole2[LayoutNodeRole2["SERIALIZER"] = 4] = "SERIALIZER";
  LayoutNodeRole2[LayoutNodeRole2["MODIFIER_FUNCTIONS"] = 5] = "MODIFIER_FUNCTIONS";
})(LayoutNodeRole = LayoutNodeRole || (LayoutNodeRole = {}));

// ../core/build/lib/src/LanguageWriters/writers/TsLanguageWriter.js
var TSLambdaExpression = class extends LambdaExpression {
  constructor(writer, convertor, signature, resolver, body) {
    super(writer, signature, resolver, body);
    this.convertor = convertor;
  }
  get statementHasSemicolon() {
    return false;
  }
  asString() {
    const params = this.signature.args.map((it, i) => {
      const maybeOptional2 = isOptionalType(it) ? "?" : "";
      return `${this.signature.argName(i)}${maybeOptional2}: ${this.convertor.convert(it)}`;
    });
    return `(${params.join(", ")}): ${this.convertor.convert(this.signature.returnType)} =>${this.bodyAsString(true)}`;
  }
};
var TSCastExpression = class {
  constructor(value, type, unsafe = false) {
    this.value = value;
    this.type = type;
    this.unsafe = unsafe;
  }
  asString() {
    return this.unsafe ? `unsafeCast<${this.type}>(${this.value.asString()})` : `(${this.value.asString()} as ${this.type})`;
  }
};
var TSUnwrapOptionalExpression = class {
  constructor(value) {
    this.value = value;
  }
  asString() {
    return `(${this.value.asString()})!`;
  }
};
var TSThrowErrorStatement = class {
  constructor(exception) {
    this.exception = exception;
  }
  write(writer) {
    writer.print(`throw ${this.exception.asString()}`);
  }
};
var TSReturnStatement = class extends ReturnStatement {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }
};
var TSLoopStatement = class {
  constructor(counter, limit, statement) {
    this.counter = counter;
    this.limit = limit;
    this.statement = statement;
  }
  write(writer) {
    writer.print(`for (let ${this.counter} = 0; ${this.counter} < ${this.limit}; ${this.counter}++) {`);
    if (this.statement) {
      writer.pushIndent();
      this.statement.write(writer);
      writer.popIndent();
      writer.print("}");
    }
  }
};
var TSSetForEachStatement = class {
  constructor(setAccessor, elementName, body) {
    this.setAccessor = setAccessor;
    this.elementName = elementName;
    this.body = body;
  }
  write(writer) {
    writer.print(`for (let ${this.elementName} of ${this.setAccessor}) {`);
    writer.pushIndent();
    this.body.forEach((statement) => {
      statement.write(writer);
    });
    writer.popIndent();
    writer.print("}");
  }
};
var TSMapForEachStatement = class {
  constructor(map, key, value, body) {
    this.map = map;
    this.key = key;
    this.value = value;
    this.body = body;
  }
  write(writer) {
    writer.print(`for (const [${this.key}, ${this.value}] of ${this.map}) {`);
    writer.pushIndent();
    writer.writeStatement(new BlockStatement(this.body, false));
    writer.popIndent();
    writer.print(`}`);
  }
};
var TsTupleAllocStatement = class {
  constructor(tuple) {
    this.tuple = tuple;
  }
  write(writer) {
    writer.writeStatement(writer.makeAssign(this.tuple, void 0, writer.makeString("[]"), false, false));
  }
};
var TSLanguageWriter = class _TSLanguageWriter extends LanguageWriter {
  constructor(printer, resolver, typeConvertor, language = Language.TS) {
    super(printer, resolver, language);
    this.writingClassBody = false;
    this.typeConvertor = typeConvertor;
  }
  maybeSemicolon() {
    return "";
  }
  pushNamespace(namespace, options) {
    this.namespaceStack.push(namespace);
    const declaredPrefix = options.isDeclared ? "declare " : "";
    if (options.isDefault) {
      this.print(`export default ${namespace}`);
    }
    this.print(`export ${declaredPrefix}namespace ${namespace} {`);
    if (options.indent)
      this.pushIndent();
  }
  fork(options) {
    var _a;
    return new _TSLanguageWriter(new IndentedPrinter([], this.indentDepth()), (_a = options === null || options === void 0 ? void 0 : options.resolver) !== null && _a !== void 0 ? _a : this.resolver, this.typeConvertor, this.language);
  }
  getNodeName(type) {
    if (isType(type) && isReferenceType(type)) {
      if (type.name.startsWith("%TEXT%:")) {
        return type.name.substring(7);
      }
    }
    return this.typeConvertor.convert(type);
  }
  get interopModule() {
    return "@koalaui/interop";
  }
  writeClass(name, op, superClass, interfaces, generics, isDeclared, isAbstract2) {
    let extendsClause = superClass ? ` extends ${superClass}` : "";
    let implementsClause = interfaces ? ` implements ${interfaces.join(", ")}` : "";
    let genericsClause = (generics === null || generics === void 0 ? void 0 : generics.length) ? `<${generics.join(", ")}>` : "";
    let declaredClause = isDeclared ? ` declare` : "";
    let abstractClause = isAbstract2 ? ` abstract` : "";
    this.printer.print(`export${declaredClause}${abstractClause} class ${name}${genericsClause}${extendsClause}${implementsClause} {`);
    this.pushIndent();
    this.classOp(() => op(this));
    this.popIndent();
    this.printer.print(`}`);
  }
  writeInterface(name, op, superInterfaces, generics, isDeclared) {
    const genericsClause = (generics === null || generics === void 0 ? void 0 : generics.length) ? `<${generics.join(", ")}>` : "";
    let extendsClause = (superInterfaces === null || superInterfaces === void 0 ? void 0 : superInterfaces.length) ? ` extends ${superInterfaces.join(",")}` : "";
    this.printer.print(`export ${isDeclared ? "declare " : ""}interface ${name}${genericsClause}${extendsClause} {`);
    this.pushIndent();
    op(this);
    this.popIndent();
    this.printer.print(`}`);
  }
  writeFunctionDeclaration(name, signature, generics) {
    this.printer.print(this.generateFunctionDeclaration(name, signature, generics));
  }
  writeFunctionImplementation(name, signature, op, generics) {
    this.printer.print(`${this.generateFunctionDeclaration(name, signature, generics)} {`);
    this.printer.pushIndent();
    op(this);
    this.printer.popIndent();
    this.printer.print("}");
  }
  generateFunctionDeclaration(name, signature, generics) {
    const rightmostRegularParameterIndex = rightmostIndexOf(signature.args, (it) => !isOptionalType(it));
    const args = signature.args.map((it, index) => {
      const optionalToken = isOptionalType(it) && index > rightmostRegularParameterIndex ? "?" : "";
      return `${signature.argName(index)}${optionalToken}: ${this.getNodeName(it)}`;
    });
    const returnType = this.getNodeName(signature.returnType);
    const typeParams = generics && generics.length ? "<" + (generics === null || generics === void 0 ? void 0 : generics.join(", ")) + ">" : "";
    return `export function ${name}${typeParams}(${args.join(", ")}): ${returnType}`;
  }
  writeEnum(name, members, options) {
    this.printer.print(`${options.isExport ? "export " : ""}${options.isDeclare ? "declare " : ""}enum ${name} {`);
    this.printer.pushIndent();
    for (const [index, member] of members.entries()) {
      let value;
      if (member.alias !== void 0) {
        value = member.alias;
      } else {
        value = `${member.stringId != void 0 ? `'${member.stringId}'` : `${member.numberId}`}`;
      }
      const maybeComma = index < members.length - 1 ? "," : "";
      this.printer.print(`${member.name} = ${value}${maybeComma}`);
    }
    this.printer.popIndent();
    this.printer.print("}");
  }
  writeFieldDeclaration(name, type, modifiers, optional, initExpr) {
    var _a;
    if (this.writingClassBody && !(modifiers === null || modifiers === void 0 ? void 0 : modifiers.some((m) => ACCESS_MODIFIERS_SET.has(m)))) {
      modifiers = (_a = modifiers === null || modifiers === void 0 ? void 0 : modifiers.slice()) !== null && _a !== void 0 ? _a : [];
      modifiers.unshift(FieldModifier.PUBLIC);
    }
    let prefix = this.makeFieldModifiersList(modifiers);
    if (prefix)
      prefix += " ";
    const typeName = this.getNodeName(type);
    const isGetter2 = modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(FieldModifier.GET);
    const isSetter = modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(FieldModifier.SET);
    if (isGetter2) {
      this.printer.print(`${prefix}get ${name}(): ${typeName}`);
    }
    if (isSetter) {
      this.printer.print(`${prefix}set ${name}(value: ${typeName})`);
    }
    if (isGetter2 || isSetter)
      return;
    const init = initExpr != void 0 ? ` = ${initExpr.asString()}` : ``;
    this.printer.print(`${prefix}${name}${optional ? "?" : ""}: ${typeName}${init}`);
  }
  writeNativeMethodDeclaration(method) {
    let name = method.name;
    let signature = method.signature;
    this.writeMethodImplementation(new Method(name, signature, [MethodModifier.STATIC]), (writer) => {
      const selfCallExpression = writer.makeFunctionCall(`this.${name}`, signature.args.map((_, i) => writer.makeString(this.escapeKeyword(signature.argName(i)))));
      writer.writeStatement(new IfStatement(new NaryOpExpression("==", [writer.makeFunctionCall("this._LoadOnce", []), writer.makeString("true")]), new BlockStatement([
        writer.makeReturn(selfCallExpression)
      ]), void 0, void 0, void 0));
      writer.writeStatement(writer.makeThrowError("Not implemented"));
    });
  }
  writeMethodDeclaration(name, signature, modifiers) {
    this.writeDeclaration(name, signature, true, false, modifiers);
  }
  writeConstructorImplementation(className, signature, op, delegationCall, modifiers) {
    var _a;
    this.writeDeclaration(`${modifiers ? modifiers.map((it) => MethodModifier[it].toLowerCase()).join(" ") + " " : ""}constructor`, signature, false, true);
    this.pushIndent();
    if (delegationCall) {
      const delegationType = (delegationCall === null || delegationCall === void 0 ? void 0 : delegationCall.delegationType) == DelegationType.THIS ? "this" : "super";
      this.print(`${delegationType}(${(_a = delegationCall.delegationArgs) === null || _a === void 0 ? void 0 : _a.map((it) => it.asString()).join(", ")})`);
    }
    op(this);
    this.popIndent();
    this.printer.print(`}`);
  }
  writeMethodImplementation(method, op) {
    this.writeDeclaration(method.name, method.signature, true, true, method.modifiers, method.generics);
    this.pushIndent();
    op(this);
    this.popIndent();
    this.printer.print(`}`);
  }
  writeProperty(propName, propType, modifiers, getter, setter, initExpr) {
    let isStatic = modifiers.includes(FieldModifier.STATIC);
    let containerName = propName.concat("_container");
    if (getter) {
      if (!getter.op) {
        this.print(`private var ${this.getNodeName(propType)} ${containerName}`);
      }
      this.writeGetterImplementation(new Method(propName, new MethodSignature(propType, []), isStatic ? [MethodModifier.STATIC] : []), getter ? getter.op : (writer) => {
        writer.print(`return ${containerName}`);
      });
    }
    if (setter) {
      const setSignature = new NamedMethodSignature(createPrimitiveType("void"), [propType], [propName]);
      this.writeSetterImplementation(new Method(propName, setSignature, isStatic ? [MethodModifier.STATIC] : []), setter ? setter.op : (writer) => {
        writer.print(`${containerName} = ${propName}`);
      });
    }
    if (getter || setter)
      return;
    this.writeFieldDeclaration(propName, propType, modifiers, isOptionalType(propType), initExpr);
  }
  writeTypeDeclaration(decl) {
    var _a;
    const type = this.getNodeName(decl.type);
    const typeParams = ((_a = decl.typeParameters) === null || _a === void 0 ? void 0 : _a.length) ? `<${decl.typeParameters.join(",").replace("[]", "")}>` : "";
    this.print(`export type ${decl.name}${typeParams} = ${type};`);
  }
  writeConstant(constName, constType, constVal) {
    this.print(`export const ${constName}: ${this.getNodeName(constType)}${constVal ? " = " + constVal : ""}`);
  }
  writeImports(moduleName, importedFeatures, aliases) {
    if (importedFeatures.length !== aliases.length) {
      throw new Error(`Inconsistent imports from ${moduleName}`);
    }
    const importNodes = [];
    for (let i = 0; i < importedFeatures.length; i++) {
      importNodes.push(importedFeatures[i] + (aliases[i] ? ` as ${aliases[i]}` : ``));
    }
    this.writeExpressionStatement(this.makeString(`import { ${importNodes.join(", ")} } from '${moduleName}'`));
  }
  writeDeclaration(name, signature, needReturn, needBracket, modifiers, generics) {
    let prefix = !modifiers ? void 0 : this.supportedModifiers.filter((it) => modifiers.includes(it)).map((it) => this.mapMethodModifier(it)).join(" ");
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(MethodModifier.GETTER)) {
      prefix = `${prefix} get`;
    } else if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(MethodModifier.SETTER)) {
      prefix = `${prefix} set`;
      needReturn = false;
    } else if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(MethodModifier.FREE)) {
      prefix = `${needBracket ? "" : "declare "}function ${prefix}`;
    }
    prefix = prefix ? prefix.trim() + " " : "";
    const typeParams = (generics === null || generics === void 0 ? void 0 : generics.length) ? `<${generics.join(", ")}>` : "";
    const normalizedArgs = signature.args.map((it, i) => isOptionalType(it) && signature.isArgOptional(i) ? maybeUnwrapOptionalType(it) : it);
    this.printer.print(`${prefix}${name}${typeParams}(${normalizedArgs.map((it, index) => `${this.escapeKeyword(signature.argName(index))}${signature.isArgOptional(index) ? "?" : ``}: ${this.getNodeName(it)}${signature.argDefault(index) ? " = " + signature.argDefault(index) : ""}`).join(", ")})${needReturn ? ": " + this.getNodeName(signature.returnType) : ""}${needBracket ? " {" : ""}`);
  }
  makeNull(type) {
    if (type && hasExtAttribute(type, IDLExtendedAttributes.UnionOnlyNull))
      return new StringExpression("null");
    return new StringExpression("undefined");
  }
  makeAssign(variableName, type, expr, isDeclared = true, isConst = true, options) {
    return new AssignStatement(variableName, type, expr, isDeclared, isConst, options);
  }
  makeLambda(signature, body) {
    return new TSLambdaExpression(this, this.typeConvertor, signature, this.resolver, body);
  }
  makeThrowError(message) {
    if (typeof message === "string")
      message = this.makeString(`new Error('${message}')`);
    return new TSThrowErrorStatement(message);
  }
  makeReturn(expr) {
    return new TSReturnStatement(expr);
  }
  makeStatement(expr) {
    return new ExpressionStatement(expr);
  }
  makeLoop(counter, limit, statement) {
    return new TSLoopStatement(counter, limit, statement);
  }
  makeMapForEach(map, key, value, body) {
    return new TSMapForEachStatement(map, key, value, body);
  }
  writePrintLog(message) {
    this.print(`console.log("${message}")`);
  }
  makeCast(value, node, options) {
    var _a;
    return new TSCastExpression(value, this.getNodeName(node), (_a = options === null || options === void 0 ? void 0 : options.unsafe) !== null && _a !== void 0 ? _a : false);
  }
  instanceOf(value, type) {
    return IDLContainerUtils.isSequence(type) ? this.makeString(`Array.isArray(${value})`) : super.instanceOf(value, type);
  }
  typeInstanceOf(type, value, members) {
    if (isInterface(type)) {
      if (isInterfaceSubkind(type)) {
        if (!members) {
          throw new Error("Members must be defined for interface type recognition!");
        }
        return this.makeString(members.map((it) => `${value}.hasOwnProperty("${it}")`).join("&&"));
      }
      if (isClassSubkind(type)) {
        return super.typeInstanceOf(type, value, members);
      }
    }
    throw new Error(`typeInstanceOf fails: not class or interface: ${this.getNodeName(type)}`);
  }
  getObjectAccessor(convertor, value, args) {
    if (convertor.useArray && (args === null || args === void 0 ? void 0 : args.index) != void 0) {
      return `${value}[${args.index}]`;
    }
    return `${value}`;
  }
  makeUndefined() {
    return this.makeString("undefined");
  }
  makeRuntimeType(rt) {
    return this.makeString(`RuntimeType.${RuntimeType[rt]}`);
  }
  makeDefinedCheck(value, type) {
    if (type) {
      if (hasExtAttribute(type, IDLExtendedAttributes.UnionWithNull)) {
        return this.makeString(`${value} !== undefined && ${value} !== null`);
      } else if (hasExtAttribute(type, IDLExtendedAttributes.UnionOnlyNull)) {
        return this.makeString(`${value} !== null`);
      }
    }
    return this.makeString(`${value} !== undefined`);
  }
  makeTupleAlloc(option) {
    return new TsTupleAllocStatement(option);
  }
  makeArrayInit(type, size) {
    var _a;
    return this.makeString(`new Array<${this.getNodeName(type.elementType[0])}>(${(_a = size === null || size === void 0 ? void 0 : size.toString()) !== null && _a !== void 0 ? _a : ""})`);
  }
  makeClassInit(type, paramenters) {
    return this.makeString(`new ${this.getNodeName(type)}(${paramenters.map((it) => it.asString()).join(", ")})`);
  }
  makeSetInit(type) {
    return this.makeString(`new Set<${this.getNodeName(type)}>()`);
  }
  makeSetSize(setAccessor) {
    return this.makeFieldAccess(setAccessor, "size");
  }
  makeSetAdd(setAccessor, element) {
    return this.makeStatement(this.makeMethodCall(setAccessor, "add", [element]));
  }
  makeSetForEach(set, element, body) {
    return new TSSetForEachStatement(set, element, body);
  }
  makeMapInit(type) {
    return this.makeString(`new ${this.getNodeName(type)}()`);
  }
  makeMapInsert(keyAccessor, key, valueAccessor, value) {
    return this.makeStatement(this.makeMethodCall(keyAccessor, "set", [this.makeString(key), this.makeString(value)]));
  }
  makeUnwrapOptional(expression) {
    return new TSUnwrapOptionalExpression(expression);
  }
  getTagType() {
    return createReferenceType("Tags");
  }
  getRuntimeType() {
    return createPrimitiveType("i32");
  }
  makeTupleAssign(receiver, fields) {
    return this.makeAssign(receiver, void 0, this.makeString(`[${fields.map((it) => `${it}!`).join(",")}]`), false);
  }
  get supportedModifiers() {
    return [
      MethodModifier.PUBLIC,
      MethodModifier.PRIVATE,
      MethodModifier.PROTECTED,
      MethodModifier.STATIC,
      MethodModifier.ABSTRACT
    ];
  }
  get supportedFieldModifiers() {
    return [FieldModifier.PUBLIC, FieldModifier.PRIVATE, FieldModifier.PROTECTED, FieldModifier.READONLY, FieldModifier.STATIC];
  }
  enumFromI32(value, enumEntry) {
    const enumName = enumEntry.name;
    const ordinal = value.asString();
    return isStringEnum(enumEntry) ? this.makeString(`Object.values(${enumName})[${ordinal}]`) : this.makeString(ordinal);
  }
  i32FromEnum(value, enumEntry) {
    const enumName = this.getNodeName(enumEntry);
    if (isStringEnum(enumEntry)) {
      let extractorStatement = this.makeString(`Object.values(${enumName}).indexOf(${value.asString()})`);
      if (enumEntry.elements.some((it) => hasExtAttribute(it, IDLExtendedAttributes.OriginalEnumMemberName))) {
        extractorStatement = this.makeNaryOp("%", [
          extractorStatement,
          this.makeString(enumEntry.elements.length.toString())
        ]);
      }
      return extractorStatement;
    }
    return this.makeString(`${value.asString()}.valueOf()`);
  }
  castToBoolean(value) {
    return `!!${value}`;
  }
  makeCallIsObject(value) {
    return this.makeString(`${value} instanceof Object`);
  }
  escapeKeyword(keyword) {
    return TSKeywords.has(keyword) ? keyword + "Val" : keyword;
  }
  discriminate(value, index, type, runtimeTypes) {
    const runtimeTypeList = runtimeTypes.map((ty) => "RuntimeType." + RuntimeType[ty]).join(", ");
    return `[${runtimeTypeList}].includes(runtimeType(${value}))`;
  }
  classOp(op) {
    const old = this.writingClassBody;
    this.writingClassBody = true;
    op();
    this.writingClassBody = old;
  }
};

// ../core/build/lib/src/LanguageWriters/writers/CLikeLanguageWriter.js
var CLikeReturnStatement = class extends ReturnStatement {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }
  write(writer) {
    writer.print(this.expression ? `return ${this.expression.asString()};` : "return;");
  }
};
var CLikeLoopStatement = class {
  constructor(counter, limit, statement) {
    this.counter = counter;
    this.limit = limit;
    this.statement = statement;
  }
  write(writer) {
    writer.print(`for (int ${this.counter} = 0; ${this.counter} < ${this.limit}; ${this.counter}++) {`);
    if (this.statement) {
      writer.pushIndent();
      this.statement.write(writer);
      writer.popIndent();
      writer.print("}");
    }
  }
};
var CLikeExpressionStatement = class extends ExpressionStatement {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }
  write(writer) {
    const text = this.expression.asString();
    if (text.length > 0) {
      writer.print(`${this.expression.asString()};`);
    }
  }
};
var CLikeThrowErrorStatement = class {
  constructor(exception) {
    this.exception = exception;
  }
  write(writer) {
    writer.print(`throw ${this.exception.asString()};`);
  }
};
var CLikeLanguageWriter = class extends LanguageWriter {
  constructor(printer, resolver, language) {
    super(printer, resolver, language);
  }
  writeFunctionDeclaration(name, signature) {
    this.writeMethodDeclaration(name, signature);
  }
  writeFunctionImplementation(name, signature, op) {
    this.writeMethodImplementation(new Method(name, signature), op);
  }
  makeThrowError(message) {
    if (typeof message === "string")
      message = this.makeString(`new Error("${message}")`);
    return new CLikeThrowErrorStatement(message);
  }
  makeEquals(args) {
    return this.makeNaryOp("==", args);
  }
  writeMethodCall(receiver, method, params, nullable = false) {
    this.printer.print(`${receiver}.${method}(${params.join(", ")});`);
  }
  writeMethodDeclaration(name, signature, modifiers) {
    this.writeDeclaration(name, signature, modifiers, ";");
  }
  writeEnum(name, members, options, op) {
    throw new Error("WriteEnum for C-family languages is not implemented");
  }
  writeMethodImplementation(method, op) {
    this.writeDeclaration(method.name, method.signature, method.modifiers);
    this.printer.print(`{`);
    this.pushIndent();
    op(this);
    this.popIndent();
    this.printer.print(`}`);
  }
  writeDeclaration(name, signature, modifiers, postfix) {
    let prefix = modifiers === null || modifiers === void 0 ? void 0 : modifiers.filter((it) => this.supportedModifiers.includes(it)).map((it) => this.mapMethodModifier(it)).join(" ");
    prefix = prefix ? prefix + " " : "";
    this.print(`${prefix}${this.stringifyMethodReturnType(signature.returnType, signature.retHint())} ${name}(${signature.args.map((it, index) => `${this.stringifyMethodArgType(it, signature.argHint(index))} ${signature.argName(index)}`).join(", ")})${postfix !== null && postfix !== void 0 ? postfix : ""}`);
  }
  stringifyMethodReturnType(type, _) {
    return this.getNodeName(type);
  }
  stringifyMethodArgType(type, _) {
    return this.getNodeName(type);
  }
};

// ../core/build/lib/src/LanguageWriters/writers/CppLanguageWriter.js
var CppCastExpression = class {
  constructor(convertor, value, node, options) {
    this.convertor = convertor;
    this.value = value;
    this.node = node;
    this.options = options;
  }
  asString() {
    var _a, _b, _c, _d;
    if (forceAsNamedNode(this.node).name === "Tag") {
      return `${this.value.asString()} == ${PrimitiveTypeList.UndefinedRuntime} ? ${PrimitiveTypeList.UndefinedTag} : ${PrimitiveTypeList.ObjectTag}`;
    }
    let resultName = "";
    if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideTypeName) {
      resultName = this.options.overrideTypeName;
    } else {
      const pureName = this.mapTypeWithReceiver((_b = this.options) === null || _b === void 0 ? void 0 : _b.receiver);
      const qualifiedName2 = ((_c = this.options) === null || _c === void 0 ? void 0 : _c.toRef) ? `${pureName}&` : pureName;
      resultName = qualifiedName2;
    }
    return ((_d = this.options) === null || _d === void 0 ? void 0 : _d.unsafe) ? `reinterpret_cast<${resultName}>(${this.value.asString()})` : `static_cast<${resultName}>(${this.value.asString()})`;
  }
  mapTypeWithReceiver(receiver) {
    if (receiver !== void 0) {
      return `std::decay<decltype(${receiver})>::type`;
    }
    return this.convertor.convert(this.node);
  }
};
var CppPointerPropertyAccessExpression = class {
  constructor(expression, name) {
    this.expression = expression;
    this.name = name;
  }
  asString() {
    return `${this.expression}->${this.name}`;
  }
};
var CPPMethodStaticCallExpression = class extends MethodStaticCallExpression {
  asString() {
    return `${this.receiver}::${this.name}(${this.params.map((it) => it.asString()).join(", ")})`;
  }
};
var CppAssignStatement = class extends AssignStatement {
  constructor(variableName, type, expression, isDeclared = true, isConst = true, options) {
    super(variableName, type, expression, isDeclared, isConst, options);
    this.variableName = variableName;
    this.type = type;
    this.expression = expression;
    this.isDeclared = isDeclared;
    this.isConst = isConst;
    this.options = options;
  }
  write(writer) {
    var _a, _b;
    if (this.isDeclared) {
      const typeName = this.type ? writer.stringifyTypeWithReceiver(this.type, (_a = this.options) === null || _a === void 0 ? void 0 : _a.receiver) : "auto";
      const typeSpec = ((_b = this.options) === null || _b === void 0 ? void 0 : _b.assignRef) ? `${typeName}&` : typeName;
      const initValue = this.expression ? this.expression.asString() : "{}";
      const constSpec = this.isConst ? "const " : "";
      writer.print(`${constSpec}${typeSpec} ${this.variableName} = ${initValue};`);
    } else {
      writer.print(`${this.variableName} = ${this.expression.asString()};`);
    }
  }
};
var CppArrayResizeStatement = class {
  constructor(array, length, deserializer) {
    this.array = array;
    this.length = length;
    this.deserializer = deserializer;
  }
  write(writer) {
    writer.print(`${this.deserializer}.resizeArray<std::decay<decltype(${this.array})>::type,
        std::decay<decltype(*${this.array}.array)>::type>(&${this.array}, ${this.length});`);
  }
};
var CppMapResizeStatement = class {
  constructor(mapTypeName, keyType, valueType, map, size, deserializer) {
    this.mapTypeName = mapTypeName;
    this.keyType = keyType;
    this.valueType = valueType;
    this.map = map;
    this.size = size;
    this.deserializer = deserializer;
  }
  write(writer) {
    writer.print(`${this.deserializer}.resizeMap<${this.mapTypeName}, ${writer.getNodeName(this.keyType)}, ${writer.getNodeName(this.valueType)}>(&${this.map}, ${this.size});`);
  }
};
var CppMapForEachStatement = class {
  constructor(map, key, value, body) {
    this.map = map;
    this.key = key;
    this.value = value;
    this.body = body;
  }
  write(writer) {
    writer.print(`for (int32_t i = 0; i < ${this.map}.size; i++) {`);
    writer.pushIndent();
    writer.print(`auto ${this.key} = ${this.map}.keys[i];`);
    writer.print(`auto ${this.value} = ${this.map}.values[i];`);
    writer.writeStatement(new BlockStatement(this.body, false));
    writer.popIndent();
    writer.print(`}`);
  }
};
var CppEnumEntityStatement = class {
  constructor(_enum) {
    this._enum = _enum;
  }
  write(writer) {
    writer.print(`typedef enum ${this._enum.name} {`);
    writer.pushIndent();
    this._enum.elements.forEach((member, index) => {
      var _a;
      return writer.print(`${member.name} = ${(_a = member.initializer) !== null && _a !== void 0 ? _a : index},`);
    });
    writer.popIndent();
    writer.print(`} ${this._enum.name};`);
  }
};
var CPPThrowErrorStatement = class {
  constructor(exception) {
    this.exception = exception;
  }
  write(writer) {
    writer.print(`${this.exception.asString()};`);
  }
};
var CppLanguageWriter = class _CppLanguageWriter extends CLikeLanguageWriter {
  constructor(printer, resolver, typeConvertor, primitivesTypes) {
    super(printer, resolver, Language.CPP);
    this.primitivesTypes = primitivesTypes;
    this.classMode = "normal";
    this.currentClass = [];
    this.typeConvertor = typeConvertor;
  }
  changeModeTo(mode) {
    this.classMode = mode;
  }
  getNodeName(type) {
    return this.typeConvertor.convert(type);
  }
  fork(options) {
    var _a;
    return new _CppLanguageWriter(new IndentedPrinter([], this.indentDepth()), (_a = options === null || options === void 0 ? void 0 : options.resolver) !== null && _a !== void 0 ? _a : this.resolver, this.typeConvertor, this.primitivesTypes);
  }
  get interopModule() {
    throw new Error(`Modules are not supported in C++`);
  }
  writeDeclaration(name, signature, modifiers, postfix) {
    const realName = this.classMode === "normal" ? name : `${this.currentClass.at(0)}::${name}`;
    const newModifiers = this.classMode === "normal" ? modifiers : (modifiers !== null && modifiers !== void 0 ? modifiers : []).filter((it) => it !== MethodModifier.STATIC).concat(MethodModifier.INLINE);
    super.writeDeclaration(realName, signature, newModifiers, postfix);
  }
  writeClass(name, op, superClass, interfaces) {
    if (this.classMode === "normal") {
      const superClasses = (superClass ? [superClass] : []).concat(interfaces !== null && interfaces !== void 0 ? interfaces : []);
      const extendsClause = superClasses.length > 0 ? ` : ${superClasses.map((c) => `public ${c}`).join(", ")}` : "";
      this.printer.print(`class ${name}${extendsClause} {`);
      this.pushIndent();
    }
    if (this.classMode === "detached") {
      this.currentClass.push(name);
    }
    op(this);
    if (this.classMode === "normal") {
      this.popIndent();
      this.printer.print(`};`);
    }
  }
  writeInterface(name, op, superInterfaces, generics) {
    throw new Error("Method not implemented.");
  }
  writeMethodCall(receiver, method, params, nullable = false) {
    if (nullable) {
      this.printer.print(`if (${receiver}) ${receiver}.${method}(${params.join(", ")});`);
    } else {
      super.writeMethodCall(receiver, method, params, nullable);
    }
  }
  writeStaticMethodCall(receiver, method, params, nullable) {
    this.printer.print(`${receiver}::${method}(${params.join(", ")});`);
  }
  writeFieldDeclaration(name, type, modifiers, optional, initExpr) {
    let filter = function(modifier_name) {
      return modifier_name !== FieldModifier.STATIC;
    };
    let prefix = this.makeFieldModifiersList(modifiers, filter);
    this.printer.print(`${prefix}:`);
    this.printer.pushIndent();
    this.printer.print(`${forceAsNamedNode(type).name} ${name};`);
    this.printer.popIndent();
  }
  writeConstructorImplementation(className, signature, op, delegationCall, modifiers) {
    const superInvocation = delegationCall ? ` : ${delegationCall.delegationName}(${delegationCall.delegationArgs.map((it) => it.asString()).join(", ")})` : "";
    const argList = signature.args.map((it, index) => {
      var _a;
      const maybeDefault = ((_a = signature.defaults) === null || _a === void 0 ? void 0 : _a[index]) ? ` = ${signature.defaults[index]}` : "";
      return `${this.stringifyMethodArgType(it, signature.argHint(index))} ${signature.argName(index)}${maybeDefault}`;
    }).join(", ");
    this.print("public:");
    this.print(`${className}(${argList})${superInvocation} {`);
    this.pushIndent();
    op(this);
    this.popIndent();
    this.print(`}`);
  }
  writeProperty(propName, propType, modifiers, getter, setter) {
    throw new Error("writeProperty for c++ is not implemented yet.");
  }
  writeTypeDeclaration(decl) {
    throw new Error(`writeTypeDeclaration not implemented`);
  }
  writeConstant(constName, constType, constVal) {
    this.print(`${this.getNodeName(constType)} ${constName}${constVal ? " = " + constVal : ""};`);
  }
  writeImports(moduleName, importedFeatures, aliases) {
    throw new Error(`Imports are not supported in C++`);
  }
  /**
   * Writes multiline comments decorated with stars
   */
  writeMultilineCommentBlock(lines) {
    this.print("/*");
    lines.split("\n").forEach((it) => this.print(" * " + it));
    this.print(" */");
  }
  /**
   * Writes `#include "path"`
   * @param path File path to be included
   */
  writeInclude(path7) {
    this.print(`#include "${path7}"`);
  }
  /**
   * Writes `#include <path>`
   * @param path File path to be included
   */
  writeGlobalInclude(path7) {
    this.print(`#include <${path7}>`);
  }
  makeRef(type, options) {
    return createReferenceType(`${this.stringifyTypeWithReceiver(type, options === null || options === void 0 ? void 0 : options.receiver)}&`);
  }
  makeThis() {
    return new StringExpression("*this");
  }
  makeNull() {
    return new StringExpression("nullptr");
  }
  makeValueFromOption(value) {
    return this.makeString(`${value}.value`);
  }
  makeThrowError(message) {
    if (typeof message === "string")
      message = this.makeString(`INTEROP_FATAL("${message}")`);
    return new CPPThrowErrorStatement(message);
  }
  makeAssign(variableName, type, expr, isDeclared = true, isConst = true, options) {
    return new CppAssignStatement(variableName, type, expr, isDeclared, isConst, options);
  }
  makeLambda(signature, body) {
    throw new Error(`Improve`);
  }
  makeReturn(expr) {
    return new CLikeReturnStatement(expr);
  }
  makeStatement(expr) {
    return new CLikeExpressionStatement(expr);
  }
  makeArrayAccess(value, indexVar) {
    return this.makeString(`${value}.array[${indexVar}]`);
  }
  makeTupleAccess(value, index) {
    return this.makeString(`${value}.value${index}`);
  }
  makeUnionSelector(value, valueType) {
    return this.makeAssign(valueType, void 0, this.makeString(`${value}.selector`), false);
  }
  makeUnionVariantCast(value, type, convertor, index) {
    return this.makeString(`${value}.value${index}`);
  }
  makeStaticMethodCall(receiver, method, params, nullable) {
    return new CPPMethodStaticCallExpression(receiver, method, params, nullable);
  }
  makeLoop(counter, limit, statement) {
    return new CLikeLoopStatement(counter, limit, statement);
  }
  makeMapForEach(map, key, value, body) {
    return new CppMapForEachStatement(map, key, value, body);
  }
  makeArrayInit(type) {
    return this.makeString(`{}`);
  }
  makeClassInit(type, paramenters) {
    return this.makeString(`${this.getNodeName(type)}(${paramenters.map((it) => it.asString()).join(", ")})`);
  }
  makeSetInit(type) {
    throw new Error("Sets in CPP are just arrays.");
  }
  makeSetSize(setAccessor) {
    throw new Error("Sets in CPP are just arrays.");
  }
  makeSetAdd(setAccessor, element) {
    throw new Error("Sets in CPP are just arrays.");
  }
  makeSetForEach(set, element, body) {
    throw new Error("Sets in CPP are just arrays.");
  }
  makeMapInit(type) {
    return this.makeString(`{}`);
  }
  makeArrayResize(array, arrayType, length, deserializer) {
    return new CppArrayResizeStatement(array, length, deserializer);
  }
  makeMapResize(mapTypeName, keyType, valueType, map, size, deserializer) {
    return new CppMapResizeStatement(mapTypeName, keyType, valueType, map, size, deserializer);
  }
  makeCast(expr, node, options) {
    return new CppCastExpression(this.typeConvertor, expr, node, options);
  }
  makePointerPropertyAccessExpression(expression, name) {
    return new CppPointerPropertyAccessExpression(expression, name);
  }
  writePrintLog(message) {
    this.print(`printf("${message}\\n");`);
  }
  makeDefinedCheck(value, type, isTag) {
    return this.makeString(isTag ? `${value} != ${PrimitiveTypeList.UndefinedTag}` : `runtimeType(${value}) != ${PrimitiveTypeList.UndefinedRuntime}`);
  }
  makeSetUnionSelector(value, index) {
    return this.makeAssign(`${value}.selector`, void 0, this.makeString(index), false);
  }
  makeSetOptionTag(value, tag) {
    return this.makeAssign(`${value}.tag`, void 0, tag, false);
  }
  getObjectAccessor(convertor, value, args) {
    return value;
  }
  makeUndefined() {
    return this.makeString(`${this.primitivesTypes.Undefined.getText()}()`);
  }
  makeVoid() {
    return this.makeString(`${this.primitivesTypes.Void.getText()}()`);
  }
  makeRuntimeType(rt) {
    return this.makeString(`INTEROP_RUNTIME_${RuntimeType[rt]}`);
  }
  makeMapInsert(keyAccessor, key, valueAccessor, value) {
    return new BlockStatement([
      this.makeAssign(keyAccessor, void 0, this.makeString(key), false),
      this.makeAssign(valueAccessor, void 0, this.makeString(value), false)
    ], false);
  }
  getTagType() {
    return createReferenceType("Tag");
  }
  getRuntimeType() {
    return createReferenceType(`idlize.stdlib.RuntimeType`);
  }
  makeTupleAssign(receiver, tupleFields) {
    const statements = tupleFields.map((field, index) => {
      return this.makeAssign(`${receiver}.value${index}`, void 0, this.makeString(field), false);
    });
    return new BlockStatement(statements, false);
  }
  get supportedModifiers() {
    return [MethodModifier.INLINE, MethodModifier.STATIC];
  }
  get supportedFieldModifiers() {
    return [];
  }
  enumFromI32(value, enumEntry) {
    return this.makeString(`static_cast<${this.typeConvertor.convert(enumEntry)}>(` + value.asString() + `)`);
  }
  makeUnsafeCast(param) {
    return param;
  }
  makeUnsafeCast_(value, type, typeOptions) {
    let typeName = this.getNodeName(type);
    switch (typeOptions) {
      case PrintHint.AsPointer:
        typeName = `${typeName}*`;
        break;
      case PrintHint.AsConstPointer:
        typeName = `const ${typeName}*`;
        break;
      case PrintHint.AsConstReference:
        typeName = `const ${typeName}&`;
        break;
      default:
        break;
    }
    return `(${typeName}) (${value.asString()})`;
  }
  i32FromEnum(value, enumEntry) {
    return this.makeString(`static_cast<${this.typeConvertor.convert(createReferenceType(enumEntry))}>(${value.asString()})`);
  }
  escapeKeyword(name) {
    return cppKeywords.has(name) ? name + "_" : name;
  }
  makeEnumEntity(enumEntity, options) {
    return new CppEnumEntityStatement(enumEntity);
  }
  decayTypeName(typeName) {
    if (typeName.endsWith("*") || typeName.endsWith("&")) {
      typeName = typeName.substring(0, typeName.length - 1);
    }
    if (typeName.startsWith("const ")) {
      typeName = typeName.substring(6);
    }
    return typeName;
  }
  stringifyMethodReturnType(type, hint) {
    const name = this.getNodeName(type);
    let postfix = "";
    if (hint === PrintHint.AsPointer || hint === PrintHint.AsConstPointer) {
      postfix = "*";
    }
    let constModifier = "";
    if (hint === PrintHint.AsConstPointer) {
      constModifier = "const ";
    }
    return `${constModifier}${name}${postfix}`;
  }
  stringifyMethodArgType(type, hint) {
    const name = this.getNodeName(type);
    let constModifier = "";
    let postfix = "";
    switch (hint) {
      case void 0:
      case PrintHint.AsValue:
        break;
      case PrintHint.AsPointer:
        postfix = "*";
        break;
      case PrintHint.AsReference:
        postfix = "&";
        break;
      case PrintHint.AsConstPointer:
        constModifier = "const ";
        postfix = "*";
        break;
      case PrintHint.AsConstReference:
        constModifier = "const ";
        postfix = "&";
        break;
      default:
        throw new Error(`Unknown hint ${hint}`);
    }
    return `${constModifier}${name}${postfix}`;
  }
  stringifyTypeWithReceiver(type, receiver) {
    if (receiver !== void 0) {
      return `std::decay<decltype(${receiver})>::type`;
    }
    return this.getNodeName(type);
  }
  makeMethodReference(receiver, method) {
    return this.makeString(`${receiver}::${method}`);
  }
  discriminate(value, index, type, runtimeTypes) {
    return `${value}.selector == ${index}`;
  }
};

// ../core/build/lib/src/LanguageWriters/writers/KotlinLanguageWriter.js
var KotlinEnumWithGetter = class _KotlinEnumWithGetter extends TsEnumEntityStatement {
  constructor(enumEntity) {
    super(enumEntity, { isExport: false, isDeclare: false });
  }
  write(writer) {
    const members = this.getMembers();
    const realCount = this.enumEntity.elements.length;
    if (members.length !== realCount && members.length !== realCount * 2) {
      throw new Error(`Unexpected member count for enum ${this.enumEntity.name}`);
    }
    const isStringEnum2 = this.enumEntity.elements.some((it) => typeof it.initializer == "string");
    writer.writeLines(`class ${this.enumEntity.name} ${this.getMainConstructor(writer, isStringEnum2)} {`);
    writer.pushIndent();
    writer.writeStaticEntitiesBlock(() => {
      const mapping = /* @__PURE__ */ new Map();
      this.writeEnumMembers(writer, members, isStringEnum2, mapping);
      this.writeValuesMap(writer, mapping);
    });
    writer.popIndent();
    writer.writeLines(`}`);
  }
  writeEnumMembers(writer, members, isStringEnum2, mapping) {
    for (let i = 0; i < members.length; i++) {
      const it = members[i];
      let initializer;
      if (mapping.has(it.numberId)) {
        initializer = mapping.get(it.numberId);
      } else {
        const enumValue = this.convertEnumValue(it.numberId, writer);
        initializer = isStringEnum2 ? `${this.enumEntity.name}(${enumValue}, "${it.stringId}")` : `${this.enumEntity.name}(${enumValue})`;
        mapping.set(it.numberId, it.name);
      }
      writer.writeLines(`val ${it.name}: ${this.enumEntity.name} = ${initializer}`);
    }
  }
  writeValuesMap(writer, mapping) {
    const mapType = `Map<${writer.getNodeName(this.getEnumBinaryType())}, ${this.enumEntity.name}>`;
    const mappingStr = Array.from(mapping).map((it) => `${this.convertEnumValue(it[0], writer)} to ${it[1]}`);
    const initExpr = `mapOf(${mappingStr.join(", ")})`;
    writer.writeLines(`val ${_KotlinEnumWithGetter.values}: ${mapType} = ${initExpr}`);
  }
  getMainConstructor(writer, isStringEnum2) {
    let params;
    if (isStringEnum2) {
      params = `public val ${_KotlinEnumWithGetter.ordinal}: ${writer.getNodeName(this.getEnumBinaryType())}, public val ${_KotlinEnumWithGetter.value}: ${writer.getNodeName(createPrimitiveType("String"))}`;
    } else {
      params = `public val ${_KotlinEnumWithGetter.value}: ${writer.getNodeName(this.getEnumBinaryType())}`;
    }
    return `private constructor(${params})`;
  }
  getEnumBinaryType() {
    return enumBinaryRepresentation(this.enumEntity);
  }
  convertEnumValue(value, writer) {
    const type = this.getEnumBinaryType();
    return type.name === "i32" ? `${value}` : `(${value}).to${writer.getNodeName(type)}()`;
  }
};
KotlinEnumWithGetter.value = "value";
KotlinEnumWithGetter.values = "values";
KotlinEnumWithGetter.ordinal = "ordinal";

// ../core/build/lib/src/from-idl/parser.js
var fs4 = __toESM(require("node:fs"), 1);
var DeprecatedTypeArguments = new DiagnosticMessageGroup("warning", "DeprecatedTypeArguments", "TypeArguments is deprecated", "TypeArguments extended attribute is deprecated");
var DeprecatedTypeParameters = new DiagnosticMessageGroup("warning", "DeprecatedTypeParameters", "TypeParameters is deprecated", "TypeParameters extended attribute is deprecated");
var DeprecatedDictionaryKeyword = new DiagnosticMessageGroup("warning", "DeprecatedDictionaryKeyword", "Dictionary is deprecated.", "Dictionary keyword is deprecated.");
var DeprecatedTypedefSyntax = new DiagnosticMessageGroup("warning", "DeprecatedTypedefSyntax", "C-Style typedef syntax is deprecated", "C-Style typedef syntax is deprecated");
var DuplicateModifier = new DiagnosticMessageGroup("error", "DuplicateModifier", "Duplicate modifier", "Duplicate of");
var NotApplicableModifier = new DiagnosticMessageGroup("error", "NotApplicableModifier", "Not applicable modifier");
var DuplicatePackageDeclaration = new DiagnosticMessageGroup("error", "DuplicatePackageDeclaration", "Duplicate package declaration", "Duplicate of");
var DuplicateExtendedAttribute = new DiagnosticMessageGroup("error", "DuplicateExtendedAttribute", "Duplicate extended attribute", "Duplicate of");
var DuplicateArgumentName = new DiagnosticMessageGroup("error", "DuplicateArgumentName", "Duplicate argument name", "Duplicate of");
var IncorrectLiteral = new DiagnosticMessageGroup("error", "IncorrectLiteral", "Incorrect literal");
var IncorrectIdentifier = new DiagnosticMessageGroup("error", "IncorrectIdentifier", "Incorrect identifier");
var UnexpectedToken = new DiagnosticMessageGroup("error", "UnexpectedToken", "Unexpected token");
var UnexpectedEndOfFile = new DiagnosticMessageGroup("fatal", "UnexpectedEndOfFile", "Unexpected end of file");
var UnrecognizedSymbols = new DiagnosticMessageGroup("fatal", "UnrecognizedSymbols", "Unrecognized symbols");
var UnsupportedSyntax = new DiagnosticMessageGroup("error", "UnsupportedSyntax", "Unsupported syntax");
var WrongDeclarationPlacement = new DiagnosticMessageGroup("error", "WrongDeclarationPlacement", "Wrong declaration placement");
var ExpectedPrimitiveType = new DiagnosticMessageGroup("error", "ExpectedPrimitiveType", "Expected primitive type");
var ExpectedReferenceType = new DiagnosticMessageGroup("error", "ExpectedReferenceType", "Expected reference type");
var ExpectedGenericArguments = new DiagnosticMessageGroup("error", "ExpectedGenericArguments", "Expected generic arguments");
var UnexpectedGenericArguments = new DiagnosticMessageGroup("error", "UnexpectedGenericArguments", "Unexpected generic arguments");
var InlineParsingDepthExceeded = new DiagnosticMessageGroup("fatal", "InlineParsingDepthExceeded", "Inline parsing depth exceeded");
var ParseResult = {
  ok: (result) => ({ ok: true, result }),
  fail: (message) => ({ ok: false, message }),
  unwrap: (result) => {
    if (result.ok) {
      return result.result;
    }
    DiagnosticMessageGroup.collectedResults.push(result.message);
    throw new DiagnosticException(result.message);
  }
};
var FatalParserException = class extends Error {
  constructor(diagnosticMessages) {
    super();
    this.diagnosticMessages = diagnosticMessages;
  }
};
var TokenKind;
(function(TokenKind2) {
  TokenKind2[TokenKind2["Words"] = 0] = "Words";
  TokenKind2[TokenKind2["Literal"] = 1] = "Literal";
  TokenKind2[TokenKind2["Symbol"] = 2] = "Symbol";
  TokenKind2[TokenKind2["Comment"] = 3] = "Comment";
  TokenKind2[TokenKind2["Whitespace"] = 4] = "Whitespace";
  TokenKind2[TokenKind2["End"] = 5] = "End";
})(TokenKind || (TokenKind = {}));
var supportedDeclarations = /* @__PURE__ */ new Set([
  "attribute",
  "callback",
  "const",
  "constructor",
  "dictionary",
  "enum",
  "import",
  "interface",
  "namespace",
  "package",
  "typedef",
  "version"
]);
var unsupportedDeclarations = /* @__PURE__ */ new Set([
  "deleter",
  "getter",
  "includes",
  "inherit",
  "iterable",
  "maplike",
  "mixin",
  "partial",
  "required",
  "setlike",
  "setter",
  "stringifier",
  "unrestricted"
]);
var interfaceContent = /* @__PURE__ */ new Set([IDLKind.Constructor, IDLKind.Const, IDLKind.Property, IDLKind.Method, IDLKind.Callable]);
var globalContent = /* @__PURE__ */ new Set([IDLKind.Namespace, IDLKind.Interface, IDLKind.Enum, IDLKind.Method, IDLKind.Typedef, IDLKind.Callback, IDLKind.Import, IDLKind.Version, IDLKind.Const]);
var havingBlocks = /* @__PURE__ */ new Set([IDLKind.Namespace, IDLKind.Interface, IDLKind.Enum]);
var modifierTokens = /* @__PURE__ */ new Set(["static", "readonly", "async", "optional"]);
function trac(s) {
}
var Parser = class {
  constructor(fileName, content) {
    var _a, _b;
    this._curOffset = 0;
    this._curLine = 0;
    this._generics = [];
    this._inLiteralParsingLevel = 0;
    this._reDecimal = /-?(?=[0-9]*\.|[0-9]+[eE])(([0-9]+\.[0-9]*|[0-9]*\.[0-9]+)([Ee][-+]?[0-9]+)?|[0-9]+[Ee][-+]?[0-9]+)/y;
    this._reInteger = /-?(0([Xx|Bb][0-9A-Fa-f]+|[0-7]*)|[1-9][0-9]*)/y;
    this._reString = /"[^"]*"/y;
    this._reWords = /[-]?[_$A-Za-z][_$0-9A-Za-z]*([.][_$A-Za-z][_$0-9A-Za-z]*)*/y;
    this._reSymbol = /\.\.\.|[()[\]{},:;<=>?]/y;
    this._reWhitespace = /[\t\n\r ]+/y;
    this._reComment = /\/\/.*|\/\*[\s\S]*?\*\//y;
    this._reIsDocComment = /\/\/\/.*|\/\*\*[\s\S]*?\*\//;
    this.currentModifiers = {};
    trac("constructor");
    this.fileName = fileName;
    if (void 0 === content) {
      try {
        content = fs4.readFileSync(fileName).toString();
      } catch (e) {
        content = "";
        throw new FatalParserException([LoadingFatal.reportDiagnosticMessage([{ documentPath: fileName }], (_a = e.message) !== null && _a !== void 0 ? _a : "")]);
      }
    }
    this.content = content;
    const lines = (_b = content.match(/[^\r\n]*(\n|\r\n)?/g)) !== null && _b !== void 0 ? _b : [];
    this.offsets = prepareOffsets(lines);
    this.lines = lines.map((s) => s.replace(/(\n|\r\n)$/, ""));
  }
  parseIDL(parser) {
    var _a;
    const previousDiagnosticsCount = DiagnosticMessageGroup.allGroupsEntries.length;
    try {
      this._lexerNext();
      this._prevToken = this._curToken;
      let result = parser();
      if (DiagnosticMessageGroup.allGroupsEntries.length != previousDiagnosticsCount) {
        if (DiagnosticMessageGroup.allGroupsEntries.slice(previousDiagnosticsCount).some((msg) => MessageSeverityList.indexOf(msg.severity) <= MessageSeverityList.indexOf("error"))) {
          throw new FatalParserException();
        }
      }
      return result;
    } catch (e) {
      if (!(e instanceof DiagnosticException) && !(e instanceof FatalParserException)) {
        InternalFatal.reportDiagnosticMessage([{ documentPath: this.fileName }], (_a = e.message) !== null && _a !== void 0 ? _a : "");
      }
      throw new FatalParserException(DiagnosticMessageGroup.allGroupsEntries.slice(previousDiagnosticsCount));
    }
  }
  parseIDLFile() {
    trac("parseIDLFile");
    return this.parseIDL(() => {
      const file = this.parseFile();
      file.text = this.content;
      return file;
    });
  }
  parseIDLType() {
    trac("parseIDLType");
    return this.parseIDL(() => this.parseType());
  }
  parseIDLTypeList() {
    trac("parseIDLTypeList");
    return this.parseIDL(() => this.parseTypeList());
  }
  _match(re, kind) {
    re.lastIndex = this._curOffset;
    const res = re.exec(this.content);
    if (!res) {
      return void 0;
    }
    const value = res[0];
    const startLine = this._curLine + 1;
    const startCharacter = this._curOffset - this.offsets[this._curLine] + 1;
    this._curOffset = re.lastIndex;
    this._curLine += (value.match(/\n/g) || []).length;
    const endLine = this._curLine + 1;
    const endCharacter = this._curOffset - this.offsets[this._curLine];
    const location = { documentPath: this.fileName, lines: this.lines, range: { start: { line: startLine, character: startCharacter }, end: { line: endLine, character: endCharacter } } };
    this._curToken = { kind, value, location };
    return this._curToken;
  }
  _matchComment() {
    const token = this._match(this._reComment, TokenKind.Comment);
    if (token) {
      this.precedingComment = token;
    }
    return token;
  }
  _lexerNext() {
    var _a, _b, _c, _d;
    trac("_advance");
    this._prevToken = this._curToken;
    this._match(this._reWhitespace, TokenKind.Whitespace);
    this.precedingComment = void 0;
    while (this._matchComment()) {
      this._match(this._reWhitespace, TokenKind.Whitespace);
    }
    if (this._curOffset == this.content.length) {
      const pos = { line: this._curLine + 1, character: this._curOffset - this.offsets[this._curLine] + 1 };
      this._curToken = { kind: TokenKind.End, value: "", location: { documentPath: this.fileName, lines: this.lines, range: { start: pos, end: pos } } };
      return;
    }
    if (this._inLiteralParsingLevel && (this.content[this._curOffset] == '"' || this.content[this._curOffset] == "'")) {
      const pos = { line: this._curLine + 1, character: this._curOffset - this.offsets[this._curLine] + 1 };
      this._curToken = { kind: TokenKind.Symbol, value: this.content[this._curOffset], location: { documentPath: this.fileName, lines: this.lines, range: { start: pos, end: pos } } };
      this._curOffset += 1;
      return;
    }
    const token = (_d = (_c = (_b = (_a = this._match(this._reDecimal, TokenKind.Literal)) !== null && _a !== void 0 ? _a : this._match(this._reInteger, TokenKind.Literal)) !== null && _b !== void 0 ? _b : this._match(this._reString, TokenKind.Literal)) !== null && _c !== void 0 ? _c : this._match(this._reWords, TokenKind.Words)) !== null && _d !== void 0 ? _d : this._match(this._reSymbol, TokenKind.Symbol);
    if (!token) {
      const pos = { line: this._curLine + 1, character: this._curOffset - this.offsets[this._curLine] + 1 };
      UnrecognizedSymbols.throwDiagnosticMessage([{ documentPath: this.fileName, lines: this.lines, range: { start: pos, end: pos } }]);
    }
  }
  get curToken() {
    return this._curToken;
  }
  get curKind() {
    return this._curToken.kind;
  }
  get curValue() {
    return this._curToken.value;
  }
  get curLocation() {
    return this.curToken.location;
  }
  see(tok) {
    return this.curValue == tok;
  }
  seeAndSkip(tok) {
    if (this.curValue == tok) {
      this._lexerNext();
      return true;
    }
    return false;
  }
  seeEof() {
    return this.curToken.kind == TokenKind.End;
  }
  skip(tok) {
    if (this.curValue != tok) {
      if (this.curKind == TokenKind.End) {
        UnexpectedEndOfFile.throwDiagnosticMessage([this.curLocation], `Unexpected end of file, expected "${tok}"`);
      }
      UnexpectedToken.throwDiagnosticMessage([this.curLocation], `Unexpected token, expected "${tok}"`);
    }
    this._lexerNext();
  }
  skipToAfter(tok) {
    trac("skipToAfter");
    while (!this.see(tok) && !this.seeEof()) {
      this._lexerNext();
    }
    if (!this.seeEof()) {
      this._lexerNext();
    }
  }
  trackLocation() {
    trac("trackLocation");
    const start = this.curLocation;
    return () => {
      const end = this._prevToken.location;
      return {
        documentPath: this.fileName,
        range: { start: start.range.start, end: end.range.end },
        lines: this.lines
      };
    };
  }
  consumeCurrentExtended() {
    const ext = this._internalCurrentExtended;
    this._internalCurrentExtended = void 0;
    return ext;
  }
  assertPossibleModifiers(...mods) {
    for (const k of Object.keys(this.currentModifiers)) {
      if (!mods.includes(k)) {
        NotApplicableModifier.reportDiagnosticMessage([this.currentModifiers[k].location]);
      }
    }
  }
  parseSingleIdentifier() {
    trac("parseSingleIdentifier");
    return ParseResult.unwrap(this.parseIdentifierSafe(true));
  }
  parseFullIdentifier() {
    trac("parseFullIdentifier");
    return ParseResult.unwrap(this.parseIdentifierSafe(false));
  }
  parseIdentifierSafe(single = false) {
    trac("parseIdentifierSafe");
    if (this.curKind != TokenKind.Words || literalTypes.has(this.curValue) && this.curValue != "undefined") {
      return ParseResult.fail(UnexpectedToken.generateDiagnosticMessage([this.curLocation], "Unexpected token, expected identifier"));
    }
    if (single && this.curValue.includes(".")) {
      return ParseResult.fail(IncorrectIdentifier.generateDiagnosticMessage([this.curLocation]));
    }
    if (this.curValue.startsWith("-")) {
      return ParseResult.fail(IncorrectIdentifier.generateDiagnosticMessage([this.curLocation]));
    }
    const token = this.curToken;
    this._lexerNext();
    return ParseResult.ok(token);
  }
  parseFullIdentifierOrLiteral() {
    trac("parseFullIdentifierOrLiteral");
    if (this.curKind != TokenKind.Words && this.curKind != TokenKind.Literal) {
      UnexpectedToken.throwDiagnosticMessage([this.curLocation], "Unexpected token, expected identifier or literal");
    }
    const token = this.curToken;
    this._lexerNext();
    return token;
  }
  parseLiteral() {
    trac("parseLiteral");
    if (this.curKind != TokenKind.Literal && !literalTypes.has(this.curValue)) {
      UnexpectedToken.throwDiagnosticMessage([this.curLocation], "Unexpected token, expected literal");
    }
    const token = this.curToken;
    this._lexerNext();
    return token;
  }
  parseAndPushGenerics(ext) {
    var _a;
    const gen = (_a = extractTypeParameters(ext)) !== null && _a !== void 0 ? _a : [];
    const found = ext === null || ext === void 0 ? void 0 : ext.find((e) => e.name === LEGACY_TYPE_PARAMETERS_ATTRIBUTE);
    if (found && found.nameLocation) {
      DeprecatedTypeParameters.reportDiagnosticMessage([found.nameLocation], 'TypeParameters attribute is deprecated, use "<..>" syntax');
      ext === null || ext === void 0 ? void 0 : ext.splice(ext.indexOf(found), 1);
    }
    if (this.seeAndSkip("<")) {
      let next = false;
      while (!this.seeAndSkip(">")) {
        if (next) {
          this.skip(",");
        }
        next = true;
        gen.push(this.parseSingleIdentifier().value);
      }
    }
    this._generics.push(gen);
    return gen.length === 0 ? void 0 : gen;
  }
  hasGeneric(name) {
    return this._generics.some((x) => x.includes(name));
  }
  parseFile() {
    var _a;
    trac("parseFile");
    const entries = [];
    while (!this.seeEof()) {
      const entry = this.parseDeclaration(IDLKind.File);
      if (entry) {
        entries.push(entry);
      }
    }
    return createFile(entries, this.fileName, (_a = this.currentPackage) === null || _a === void 0 ? void 0 : _a.split("."), { nodeLocation: { documentPath: this.fileName, lines: this.lines } });
  }
  parseDeclaration(scopeKind) {
    trac("parseDeclaration");
    const genericsLevel = this._generics.length;
    try {
      const decl = this.parseDeclarationUnsafe(scopeKind);
      if (!decl) {
        return;
      }
      if (scopeKind == IDLKind.Interface ? !interfaceContent.has(decl.kind) : !globalContent.has(decl.kind)) {
        const location = havingBlocks.has(decl.kind) ? decl.nameLocation : decl.nodeLocation;
        WrongDeclarationPlacement.reportDiagnosticMessage([location], `Wrong declaration placement: ${decl.kind} not allowed in ${scopeKind}`);
      }
      return decl;
    } catch (e) {
      if (e instanceof DiagnosticException && e.diagnosticMessage.severity != "fatal") {
        this.skipToAfter(";");
        return;
      }
      throw e;
    } finally {
      while (this._generics.length > genericsLevel) {
        this._generics.pop();
      }
    }
  }
  parseDeclarationUnsafe(scopeKind) {
    trac("parseDeclarationUnsafe");
    if (this.seeEof()) {
      UnexpectedEndOfFile.throwDiagnosticMessage([this.curLocation], "Unexpected end of file");
    }
    this._internalCurrentExtended = this.parseExtendedAttributes();
    this.currentModifiers = {};
    while (modifierTokens.has(this.curValue)) {
      if (this.currentModifiers[this.curValue]) {
        DuplicateModifier.reportDiagnosticMessage([this.curLocation]);
      }
      this.currentModifiers[this.curValue] = this.curToken;
      this._lexerNext();
    }
    if (unsupportedDeclarations.has(this.curValue)) {
      UnsupportedSyntax.throwDiagnosticMessage([this.curLocation]);
      return;
    }
    if (supportedDeclarations.has(this.curValue)) {
      if (this.curValue != "attribute") {
        this.assertPossibleModifiers();
      }
      switch (this.curValue) {
        case "attribute":
          this.assertPossibleModifiers("static", "readonly", "optional");
          return this.parseAttribute();
        case "callback":
          return this.parseCallback();
        case "const":
          return this.parseConst();
        case "constructor":
          return this.parseConstructor();
        case "dictionary":
          return this.parseDictionary();
        case "enum":
          return this.parseEnum();
        case "import":
          return this.parseImport();
        case "interface":
          return this.parseInterface();
        case "namespace":
          return this.parseNamespace();
        case "package": {
          const pack = this.parsePackage();
          if (this.currentPackage) {
            DuplicatePackageDeclaration.reportDiagnosticMessage([pack.location]);
          }
          this.currentPackage = pack.name;
          if (scopeKind != IDLKind.File) {
            WrongDeclarationPlacement.reportDiagnosticMessage([pack.location], `Wrong declaration placement: package is not allowed in ${scopeKind}`);
          }
          return;
        }
        case "typedef":
          return this.parseTypedef();
        case "version":
          return this.parseVersion();
      }
    } else {
      this.assertPossibleModifiers("static", "async");
      return this.parseOperation();
    }
  }
  parseNamespace() {
    trac("parseNamespace");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("namespace");
    const name = this.parseSingleIdentifier();
    const entries = [];
    this.skip("{");
    while (!this.seeAndSkip("}")) {
      const entry = this.parseDeclaration(IDLKind.Namespace);
      if (entry) {
        entries.push(entry);
      }
    }
    this.skip(";");
    return createNamespace(name.value, entries, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
  }
  parseInterface() {
    trac("parseInterface");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("interface");
    const typeParameters = this.parseAndPushGenerics(ext);
    const name = this.parseSingleIdentifier();
    let bases = [];
    if (this.seeAndSkip(":")) {
      const typeList = this.parseTypeList();
      for (const type of typeList) {
        if (isReferenceType(type)) {
          bases.push(type);
        } else {
          ExpectedReferenceType.reportDiagnosticMessage([type.nodeLocation]);
        }
      }
    }
    const entries = [];
    this.skip("{");
    while (!this.seeAndSkip("}")) {
      const entry = this.parseDeclaration(IDLKind.Interface);
      if (entry) {
        if (isMethod(entry)) {
          entry.isFree = false;
        }
        entries.push(entry);
      }
    }
    this.skip(";");
    return createInterface(name.value, extractInterfaceSubkind(ext), bases, entries.filter(isConstructor), entries.filter(isConstant), entries.filter(isProperty), entries.filter(isMethod), entries.filter(isCallable), typeParameters, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location });
  }
  parseExtendedAttributes() {
    trac("parseExtendedAttributes");
    if (!this.seeAndSkip("[")) {
      return;
    }
    const ext = [];
    const names = /* @__PURE__ */ new Set();
    const duplicates = /* @__PURE__ */ new Set();
    let next = false;
    while (!this.seeAndSkip("]")) {
      if (next) {
        this.skip(",");
      }
      next = true;
      const name = this.parseSingleIdentifier();
      if (names.has(name.value)) {
        duplicates.add(name.value);
      }
      names.add(name.value);
      if (name.value === LEGACY_TYPE_ARGUMENTS_ATTRIBUTE || name.value === IDLExtendedAttributes.TypeParametersDefaults) {
        try {
          this._inLiteralParsingLevel += 1;
          if (this._inLiteralParsingLevel > 2) {
            InlineParsingDepthExceeded.throwDiagnosticMessage([this.curLocation]);
          }
          this.skip("=");
          const vloc = this.trackLocation();
          const start = this._curOffset;
          this.skip(this._inLiteralParsingLevel == 2 ? "'" : '"');
          const types = this.parseTypeList();
          const end = this._curOffset - 1;
          this._inLiteralParsingLevel -= 1;
          this.skip(this._inLiteralParsingLevel == 1 ? "'" : '"');
          const stringValue = this.content.slice(start, end);
          ext.push({ name: name.value, value: stringValue, typesValue: types, nameLocation: name.location, valueLocation: vloc() });
        } catch (e) {
          if (e instanceof DiagnosticException && e.diagnosticMessage.severity != "fatal") {
            this.skipToAfter('"');
          }
          this._inLiteralParsingLevel = 0;
          throw e;
        }
      } else {
        let value;
        if (this.seeAndSkip("=")) {
          value = this.parseFullIdentifierOrLiteral();
        }
        const converted = value ? valueFromIdentifierOrLiteral(value) : void 0;
        ext.push({ name: name.value, value: converted, nameLocation: name.location, valueLocation: value === null || value === void 0 ? void 0 : value.location });
      }
    }
    for (const dup of duplicates) {
      DuplicateExtendedAttribute.reportDiagnosticMessage(ext.filter((x) => x.name == dup).map((x) => x.nameLocation));
    }
    return ext;
  }
  parseTypeList() {
    trac("parseTypeList");
    const types = [this.parseType()];
    while (this.seeAndSkip(",")) {
      types.push(this.parseType());
    }
    return types;
  }
  parseType(outerExt) {
    var _a;
    trac("parseType");
    const parsedExt = this.parseExtendedAttributes();
    const ext = parsedExt ? outerExt ? parsedExt.concat(outerExt) : parsedExt : outerExt ? [...outerExt] : void 0;
    const sloc = this.trackLocation();
    if (this.seeAndSkip("(")) {
      let combinedTypes = [];
      let next = false;
      while (!this.seeAndSkip(")")) {
        if (next) {
          this.skip("or");
        }
        next = true;
        combinedTypes.push(this.parseType());
      }
      const isNullable2 = this.seeAndSkip("?") || combinedTypes.some((x) => isUndefinedType(x));
      combinedTypes = combinedTypes.filter((x) => !isUndefinedType(x));
      const distilledType = combinedTypes.length == 1 ? combinedTypes[0] : createUnionType(combinedTypes, void 0, { extendedAttributes: ext, nodeLocation: sloc() });
      if (isNullable2) {
        return createOptionalType(distilledType, { extendedAttributes: ext, nodeLocation: sloc() });
      }
      return distilledType;
    }
    const name = this.parseFullIdentifier();
    const genArgs = (_a = extractTypeArguments(ext)) !== null && _a !== void 0 ? _a : [];
    const foundArgAttr = ext === null || ext === void 0 ? void 0 : ext.find((it) => it.name === LEGACY_TYPE_ARGUMENTS_ATTRIBUTE);
    if (foundArgAttr && foundArgAttr.nameLocation) {
      DeprecatedTypeArguments.reportDiagnosticMessage([foundArgAttr.nameLocation], 'TypeArgument is deprecated extended attribute, use "<..>" syntax');
      ext === null || ext === void 0 ? void 0 : ext.splice(ext.indexOf(foundArgAttr), 1);
    }
    if (this.seeAndSkip("<")) {
      let next = false;
      while (!this.seeAndSkip(">")) {
        if (next) {
          this.skip(",");
        }
        next = true;
        genArgs.push(this.parseType());
      }
    }
    let type;
    if (this.hasGeneric(name.value)) {
      if (genArgs.length > 0) {
        UnexpectedGenericArguments.reportDiagnosticMessage([name.location]);
      }
      type = createTypeParameterReference(name.value, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
    } else if (builtinTypes.has(name.value)) {
      if (genArgs.length > 0) {
        UnexpectedGenericArguments.reportDiagnosticMessage([name.location]);
      }
      type = createPrimitiveType(name.value, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
    } else if (builtinGenericTypeNames.has(name.value)) {
      if (genArgs.length == 0) {
        ExpectedGenericArguments.reportDiagnosticMessage([name.location]);
      }
      type = createContainerType(name.value, genArgs, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
    } else {
      type = createReferenceType(name.value, genArgs.length > 0 ? genArgs : void 0, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
    }
    const isNullable = this.seeAndSkip("?");
    if (isNullable) {
      return createOptionalType(type, { extendedAttributes: ext, nodeLocation: sloc() });
    } else {
      return type;
    }
  }
  parseReferenceType() {
    trac("parseReferenceType");
    const type = this.parseType();
    if (!isReferenceType(type)) {
      ExpectedReferenceType.reportDiagnosticMessage([type.nodeLocation]);
    }
    return type;
  }
  parsePrimitiveType() {
    trac("parsePrimitiveType");
    const type = this.parseType();
    if (!isPrimitiveType(type)) {
      ExpectedPrimitiveType.reportDiagnosticMessage([type.nodeLocation]);
    }
    return type;
  }
  parseArgTuple() {
    trac("parseArgTuple");
    const args = [];
    const names = /* @__PURE__ */ new Set();
    const duplicates = /* @__PURE__ */ new Set();
    this.skip("(");
    let next = false;
    while (!this.seeAndSkip(")")) {
      if (next) {
        this.skip(",");
      }
      next = true;
      const arg = this.parseArg();
      if (names.has(arg.name)) {
        duplicates.add(arg.name);
      }
      names.add(arg.name);
      args.push(arg);
    }
    for (const dup of duplicates) {
      DuplicateArgumentName.reportDiagnosticMessage(args.filter((x) => x.name == dup).map((x) => x.nameLocation));
    }
    return args;
  }
  parseArg() {
    trac("parseArg");
    const ext = this.parseExtendedAttributes();
    const sloc = this.trackLocation();
    const optional = this.seeAndSkip("optional");
    const type = this.parseType(ext);
    const spread = this.seeAndSkip("...");
    const name = this.parseSingleIdentifier();
    return createParameter(name.value, type, optional, spread, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location });
  }
  parseOperation() {
    trac("parseOperation");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    const isStatic = !!this.currentModifiers.static;
    const isAsync = !!this.currentModifiers.async;
    const isOptional = extractOptional(ext);
    const isFree = true;
    const typeParameters = this.parseAndPushGenerics(ext);
    const retType = this.parseType(ext);
    const name = this.parseSingleIdentifier();
    const args = this.parseArgTuple();
    this.skip(";");
    if (ext === null || ext === void 0 ? void 0 : ext.some((x) => x.name == IDLExtendedAttributes.CallSignature)) {
      return createCallable(name.value, args, retType, { isStatic, isAsync }, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location }, typeParameters);
    }
    return createMethod(name.value, args, retType, { isStatic, isAsync, isOptional, isFree }, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location }, typeParameters);
  }
  parseConstructor() {
    trac("parseConstructor");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("constructor");
    const args = this.parseArgTuple();
    this.skip(";");
    return createConstructor(args, void 0, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc() });
  }
  parseConst() {
    trac("parseConst");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("const");
    const type = this.parseType();
    const name = this.parseSingleIdentifier();
    let value;
    if (this.seeAndSkip("=")) {
      value = this.parseLiteral();
    }
    this.skip(";");
    return createConstant(name.value, type, value === null || value === void 0 ? void 0 : value.value, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location, valueLocation: value === null || value === void 0 ? void 0 : value.location });
  }
  parseAttribute() {
    trac("parseAttribute");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    const isReadonly = !!this.currentModifiers.readonly;
    const isStatic = !!this.currentModifiers.static;
    let isOptional = !!this.currentModifiers.optional || extractOptional(ext);
    this.skip("attribute");
    const type = this.parseType();
    const name = this.parseSingleIdentifier();
    this.skip(";");
    return createProperty(name.value, type, isReadonly, isStatic, isOptional, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location });
  }
  parseTypedef() {
    trac("parseTypedef");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("typedef");
    const typeParameters = this.parseAndPushGenerics(ext);
    const maybeName = this.parseIdentifierSafe(true);
    let name;
    let type;
    let deprecatedSyntax = false;
    if (!maybeName.ok) {
      type = this.parseType();
      name = this.parseSingleIdentifier();
      deprecatedSyntax = true;
    } else if (this.seeAndSkip("=")) {
      type = this.parseType();
      name = maybeName.result;
    } else {
      type = builtinTypes.has(maybeName.result.value) ? createPrimitiveType(maybeName.result.value, { extendedAttributes: [], nodeLocation: maybeName.result.location }) : createReferenceType(maybeName.result.value, void 0, { extendedAttributes: [], nodeLocation: maybeName.result.location });
      name = this.parseSingleIdentifier();
      deprecatedSyntax = true;
    }
    this.skip(";");
    if (isUnionType(type)) {
      type.name = name.value;
      type.extendedAttributes = ext;
    }
    if (deprecatedSyntax) {
      DeprecatedTypedefSyntax.reportDiagnosticMessage([sloc()], "C-Style typedef syntax is deprecated");
    }
    return createTypedef(name.value, type, typeParameters, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location });
  }
  parseCallback() {
    trac("parseCallback");
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip("callback");
    if (this.see("interface")) {
      UnsupportedSyntax.throwDiagnosticMessage([this.curLocation], "Unsupported syntax: callback interface");
    }
    const typeParameters = this.parseAndPushGenerics(ext);
    const name = this.parseSingleIdentifier();
    this.skip("=");
    const retType = this.parseType();
    const args = this.parseArgTuple();
    this.skip(";");
    return createCallback(name.value, args, retType, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location }, typeParameters);
  }
  parseEnum() {
    return this.parseEnumOrDictionary("enum");
  }
  parseDictionary() {
    DeprecatedDictionaryKeyword.reportDiagnosticMessage([this.curLocation], "Dictionary keyword is deprecated, use enum keyword.");
    return this.parseEnumOrDictionary("dictionary");
  }
  parseEnumOrDictionary(token) {
    trac(`parse${capitalize(token)}`);
    const sloc = this.trackLocation();
    const ext = this.consumeCurrentExtended();
    this.skip(token);
    const name = this.parseSingleIdentifier();
    const items = [];
    this.skip("{");
    while (!this.seeAndSkip("}")) {
      items.push(this.parseEnumOrDictionaryEntry(token));
    }
    this.skip(";");
    return createEnum(name.value, items, { extendedAttributes: ext, documentation: extractDocumentation(ext), nodeLocation: sloc(), nameLocation: name.location });
  }
  parseEnumOrDictionaryEntry(token) {
    trac(`parse${capitalize(token)}Entry`);
    const ext = this.parseExtendedAttributes();
    const sloc = this.trackLocation();
    const type = this.parsePrimitiveType();
    const name = this.parseSingleIdentifier();
    let value;
    let extracted;
    if (this.seeAndSkip("=")) {
      value = this.parseLiteral();
      extracted = extractLiteral(value);
    }
    this.skip(";");
    return createEnumMember(name.value, void 0, type, extracted === null || extracted === void 0 ? void 0 : extracted.extractedValue, extracted === null || extracted === void 0 ? void 0 : extracted.decimalType, { extendedAttributes: ext, nodeLocation: sloc(), nameLocation: name.location, valueLocation: value === null || value === void 0 ? void 0 : value.location });
  }
  parsePackage() {
    trac("parsePackage");
    const sloc = this.trackLocation();
    this.skip("package");
    const packagePath = this.parseFullIdentifierOrLiteral();
    this.skip(";");
    return { location: sloc(), name: valueFromIdentifierOrLiteral(packagePath) };
  }
  parseImport() {
    trac("parseImport");
    const sloc = this.trackLocation();
    this.skip("import");
    const importPath = this.parseFullIdentifierOrLiteral();
    let alias;
    if (this.seeAndSkip("as")) {
      alias = this.parseSingleIdentifier();
    }
    this.skip(";");
    return createImport(valueFromIdentifierOrLiteral(importPath).split("."), alias === null || alias === void 0 ? void 0 : alias.value, { nodeLocation: sloc(), nameLocation: alias === null || alias === void 0 ? void 0 : alias.location, valueLocation: importPath.location });
  }
  parseVersion() {
    trac("parseVersion");
    const sloc = this.trackLocation();
    this.skip("version");
    const versionLiteral = this.parseLiteral();
    this.skip(";");
    return createVersion(versionLiteral.value.split("."), { nodeLocation: sloc(), valueLocation: versionLiteral.location });
  }
};
function prepareOffsets(lines) {
  let offsets = [];
  let offset = 0;
  for (let line of lines) {
    let plus = line.length;
    offsets.push(offset);
    offset += plus;
  }
  return offsets;
}
function valueFromIdentifierOrLiteral(token) {
  if (token.kind == TokenKind.Words && !literalTypes.has(token.value)) {
    return token.value;
  }
  return extractLiteral(token).extractedString;
}
var literalTypes = /* @__PURE__ */ new Map([
  ["true", "boolean"],
  ["false", "boolean"],
  ["Infinity", "number"],
  ["-Infinity", "number"],
  ["NaN", "number"],
  ["null", "null"],
  ["undefined", "undefined"]
]);
var extractedUndefined = { type: "undefined", extractedString: "undefined", extractedValue: "undefined", decimalType: void 0 };
function getDecimalType(value) {
  if (value.startsWith("0b") || value.startsWith("0B"))
    return 2;
  if (value.startsWith("0x") || value.startsWith("0X"))
    return 16;
  return 0;
}
function extractNumber(value) {
  switch (getDecimalType(value)) {
    case 2:
      return parseInt(value.substring(2), 2);
    case 16:
      return parseInt(value);
    default:
      return parseFloat(value);
  }
}
function extractLiteral(token) {
  if (token.kind == TokenKind.Words) {
    if (!literalTypes.has(token.value)) {
      IncorrectLiteral.reportDiagnosticMessage([token.location]);
      return extractedUndefined;
    }
    const type = literalTypes.get(token.value);
    const extractedString = token.value;
    const extractedValue2 = type == "number" ? extractNumber(extractedString) : extractedString;
    const decimalType2 = type == "number" ? getDecimalType(extractedString) : void 0;
    return { type, extractedString, extractedValue: extractedValue2, decimalType: decimalType2 };
  }
  if (token.kind != TokenKind.Literal) {
    IncorrectLiteral.reportDiagnosticMessage([token.location]);
    return extractedUndefined;
  }
  if (token.value[0] == '"') {
    try {
      const extractedString = unescapeString(token.value);
      return { type: "string", extractedString, extractedValue: extractedString, decimalType: void 0 };
    } catch (e) {
      IncorrectLiteral.reportDiagnosticMessage([token.location], `Incorrect literal: ${e.message}`);
      return extractedUndefined;
    }
  }
  const extractedValue = extractNumber(token.value);
  const decimalType = getDecimalType(token.value);
  if (Number.isNaN(extractedValue)) {
    IncorrectLiteral.reportDiagnosticMessage([token.location]);
  }
  return { type: "number", extractedString: token.value, extractedValue, decimalType };
}
function unescapeString(value) {
  if (!value.length || value[0] !== '"')
    return value;
  value = value.slice(1, -1);
  value = value.replace(/\\((['"\\bfnrtv])|([0-7]{1-3})|x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4}))/g, (_, all, c, oct, h2, u4) => {
    if (c !== void 0) {
      switch (c) {
        case "'":
          return "'";
        case '"':
          return '"';
        case "\\":
          return "\\";
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "	";
        case "v":
          return "\v";
      }
    } else if (oct !== void 0) {
      return String.fromCharCode(parseInt(oct, 8));
    } else if (h2 !== void 0) {
      return String.fromCharCode(parseInt(h2, 16));
    } else if (u4 !== void 0) {
      return String.fromCharCode(parseInt(u4, 16));
    }
    throw new Error(`unknown escape sequence: ${_}`);
  });
  return value;
}
function extractInterfaceSubkind(ext) {
  var _a;
  const ent = (_a = ext === null || ext === void 0 ? void 0 : ext.find((x) => x.name == "Entity")) === null || _a === void 0 ? void 0 : _a.value;
  switch (ent) {
    case IDLEntity.Class:
      return IDLInterfaceSubkind.Class;
    case IDLEntity.Literal:
      return IDLInterfaceSubkind.AnonymousInterface;
    case IDLEntity.Tuple:
      return IDLInterfaceSubkind.Tuple;
    default:
      return IDLInterfaceSubkind.Interface;
  }
}
function extractDocumentation(ext) {
  var _a;
  return (_a = ext === null || ext === void 0 ? void 0 : ext.find((x) => x.name == "Documentation")) === null || _a === void 0 ? void 0 : _a.value;
}
function extractOptional(ext) {
  var _a;
  return (_a = ext === null || ext === void 0 ? void 0 : ext.some((x) => x.name.toLowerCase() == "optional")) !== null && _a !== void 0 ? _a : false;
}
function sanitizeTypeParameter(param) {
  const extendsIdx = param.indexOf("extends");
  if (extendsIdx !== -1) {
    return param.substring(0, extendsIdx).trim();
  }
  const eqIdx = param.indexOf("=");
  if (eqIdx !== -1) {
    return param.substring(0, eqIdx).trim();
  }
  return param;
}
var LEGACY_TYPE_PARAMETERS_ATTRIBUTE = "TypeParameters";
var LEGACY_TYPE_ARGUMENTS_ATTRIBUTE = "TypeArguments";
function extractTypeArguments(ext) {
  var _a;
  return (_a = ext === null || ext === void 0 ? void 0 : ext.find((x) => x.name === LEGACY_TYPE_ARGUMENTS_ATTRIBUTE)) === null || _a === void 0 ? void 0 : _a.typesValue;
}
function extractTypeParameters(ext) {
  var _a, _b, _c;
  return (_c = (_b = (_a = ext === null || ext === void 0 ? void 0 : ext.find((x) => x.name === LEGACY_TYPE_PARAMETERS_ATTRIBUTE)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.split(",")) === null || _c === void 0 ? void 0 : _c.map(sanitizeTypeParameter);
}
var builtinTypes = new Set(IDLPrimitiveTypeNames);
var builtinGenericTypeNames = /* @__PURE__ */ new Set(["sequence", "record", "Promise"]);

// ../core/build/lib/src/from-idl/deserialize.js
var DifferenceFound = new DiagnosticMessageGroup("error", "DifferenceFound", "Difference found");
function parseIDLFile(fileName, content, quiet) {
  const previousDiagnosticsCount = DiagnosticMessageGroup.allGroupsEntries.length;
  try {
    return parseIDLFileNew(fileName, content);
  } finally {
    if (!quiet && DiagnosticMessageGroup.allGroupsEntries.length != previousDiagnosticsCount) {
      DiagnosticMessageGroup.allGroupsEntries.slice(previousDiagnosticsCount).forEach((it) => outputDiagnosticMessageFormatted(it));
    }
  }
}
function parseIDLFileNew(fileName, content) {
  let file = new Parser(fileName, content).parseIDLFile();
  const ancestors = [];
  const namespaces = [];
  forEachChild(file, (node) => {
    if (isPrimitiveType(node)) {
      return;
    }
    node.fileName = fileName;
    if (ancestors.length) {
      node.parent = ancestors[ancestors.length - 1];
    }
    if (isNamespace(node)) {
      namespaces.push(node.name);
    }
    ancestors.push(node);
  }, (node) => {
    if (isPrimitiveType(node)) {
      return;
    }
    if (isNamespace(node)) {
      namespaces.pop();
    }
    ancestors.pop();
  });
  return file;
}

// ../core/build/lib/src/peer-generation/ReferenceResolver.js
function createEmptyReferenceResolver() {
  return {
    resolveTypeReference() {
      return void 0;
    },
    toDeclaration(type) {
      return type;
    }
  };
}

// ../core/build/lib/src/peer-generation/PeerLibrary.js
var lenses = {
  globals: lib.lens(lib.select.files()).pipe(lib.select.nodes()).pipe(lib.req("globals", (nodes) => {
    const result = [];
    const queue = [nodes];
    while (queue.length) {
      const line = {
        constants: [],
        methods: []
      };
      const next = queue.pop();
      next.forEach((node) => {
        if (!isInCurrentModule(node))
          return;
        if (isNamespace(node)) {
          queue.push(node.members);
        }
        if (isConstant(node)) {
          line.constants.push(node);
        }
        if (isMethod(node)) {
          line.methods.push(node);
        }
      });
      if (line.constants.length || line.methods.length) {
        result.push(line);
      }
    }
    return result;
  }))
};

// ../core/build/lib/src/from-idl/IDLLinter.js
var IDLValidationDiagnosticsCode;
(function(IDLValidationDiagnosticsCode2) {
  IDLValidationDiagnosticsCode2[IDLValidationDiagnosticsCode2["INVALID_EXTENDED_ATTRIBUTE"] = 1e3] = "INVALID_EXTENDED_ATTRIBUTE";
  IDLValidationDiagnosticsCode2[IDLValidationDiagnosticsCode2["ENUM_IS_NOT_CONSISTENT"] = 1001] = "ENUM_IS_NOT_CONSISTENT";
  IDLValidationDiagnosticsCode2[IDLValidationDiagnosticsCode2["REFERENCE_IS_NOT_RESOLVED"] = 1002] = "REFERENCE_IS_NOT_RESOLVED";
})(IDLValidationDiagnosticsCode = IDLValidationDiagnosticsCode || (IDLValidationDiagnosticsCode = {}));
var ENG_ErrorDescription = {
  [IDLValidationDiagnosticsCode.INVALID_EXTENDED_ATTRIBUTE]: "Invalid extended attribute",
  [IDLValidationDiagnosticsCode.ENUM_IS_NOT_CONSISTENT]: "Enum includes both string and number values",
  [IDLValidationDiagnosticsCode.REFERENCE_IS_NOT_RESOLVED]: "Can not resolve reference"
};
var DefaultIDLLinterOptions = {
  validEntryAttributes: /* @__PURE__ */ new Map([
    [IDLKind.Import, ["Deprecated", "Documentation"]],
    [IDLKind.Namespace, ["DefaultExport", "Deprecated", "Documentation", "VerbatimDts"]],
    [IDLKind.Const, ["DefaultExport", "Deprecated", "Documentation"]],
    [IDLKind.Property, ["DefaultExport", "Optional", "Accessor", "Deprecated", "CommonMethod", "Protected", "DtsName", "Documentation"]],
    [IDLKind.Interface, ["DefaultExport", "Predefined", "TSType", "CPPType", "Entity", "Interfaces", "ParentTypeArguments", "Component", "Synthetic", "Deprecated", "HandWrittenImplementation", "NativeOnly", "Documentation", "TypeParameters", "ComponentInterface"]],
    [IDLKind.Callback, ["DefaultExport", "Deprecated", "Async", "Synthetic", "Documentation", "TypeParameters"]],
    [IDLKind.Method, ["DefaultExport", "Optional", "DtsTag", "DtsName", "Throws", "Deprecated", "IndexSignature", "Protected", "Documentation", "CallSignature", "TypeParameters"]],
    [IDLKind.Callable, ["DefaultExport", "CallSignature", "Deprecated", "Documentation", "CallSignature"]],
    [IDLKind.Typedef, ["DefaultExport", "Deprecated", "Import", "Documentation", "TypeParameters"]],
    [IDLKind.Enum, ["DefaultExport", "Deprecated", "Documentation"]],
    [IDLKind.EnumMember, ["OriginalEnumMemberName", "Deprecated", "Documentation"]],
    [IDLKind.Constructor, ["Deprecated", "Documentation"]]
  ]),
  checkEnumsConsistency: true,
  checkReferencesResolved: false
};

// src/emitters/DynamicEmitter.ts
var path5 = __toESM(require("node:path"), 1);
var fs5 = __toESM(require("node:fs"), 1);
var ps = __toESM(require("node:child_process"), 1);
var import_json5 = __toESM(require_lib(), 1);

// src/general/Config.ts
var Config = class {
  constructor(ignore, nonNullable, irHack, fragments, parameters, aliases) {
    this.ignore = ignore;
    this.nonNullable = nonNullable;
    this.irHack = irHack;
    this.fragments = fragments;
    this.parameters = parameters;
    this.aliases = aliases;
  }
  static get createPrefix() {
    return `Create`;
  }
  static get updatePrefix() {
    return `Update`;
  }
  static get constPostfix() {
    return `Const`;
  }
  static get ptrPostfix() {
    return `Ptr`;
  }
  static get nodeTypeAttribute() {
    return `Es2pandaAstNodeType`;
  }
  static get nodeNamespaceAttribute() {
    return `cpp_namespace`;
  }
  static get uselessPrefix() {
    return `Get`;
  }
  static get astNodeCommonAncestor() {
    return `AstNode`;
  }
  static get astTypeAncestor() {
    return `Type`;
  }
  static get context() {
    return `Context`;
  }
  static get dataClassPrefix() {
    return `es2panda_`;
  }
  static get defaultAncestor() {
    return `ArktsObject`;
  }
  static get irNamespace() {
    return `ir`;
  }
};

// src/constuctions/BridgesConstructions.ts
var BridgesConstructions = class {
  static castedParameter(name) {
    return `_${name}`;
  }
  static interopMacro(isVoid, parametersCount) {
    return `KOALA_INTEROP_${isVoid ? `V` : ``}${parametersCount}`;
  }
  static implFunction(name) {
    return `impl_${name}`;
  }
  static referenceType(name) {
    const addPrefix = (n) => n.startsWith(Config.dataClassPrefix) ? n : `${Config.dataClassPrefix}${n}`;
    return `${addPrefix(name)}*`;
  }
  static get sequenceLengthDeclaration() {
    return `std::size_t length`;
  }
  static get sequenceLengthPass() {
    return `&length`;
  }
  static get sequenceLengthUsage() {
    return `length`;
  }
  static get result() {
    return `result`;
  }
  static stringConstructor(name) {
    return `StageArena::Strdup(${name})`;
  }
  static sequenceConstructor(first, length) {
    return `StageArena::CloneVector(${first}, ${length})`;
  }
  static referenceTypeCast(type) {
    return `reinterpret_cast<${type}>`;
  }
  static primitiveTypeCast(type) {
    return `static_cast<${type}>`;
  }
  static enumCast(type) {
    return `static_cast<${type}>`;
  }
  static callMethod(name) {
    return `GetImpl()->${name}`;
  }
  static get stringType() {
    return `KStringPtr`;
  }
  static get pointerType() {
    return `KNativePointer`;
  }
  static get stringCast() {
    return `getStringCopy`;
  }
  static get stringArrayCast() {
    return `getStringArray`;
  }
  static dropConstCast(value) {
    return `(void*)${value}`;
  }
  static get astNode() {
    return `es2panda_AstNode*`;
  }
  static arrayOf(type) {
    return `${type}*`;
  }
  static pointer(type) {
    return `${type}*`;
  }
};

// src/constuctions/InteropConstructions.ts
var InteropConstructions = class {
  static get receiver() {
    return `receiver`;
  }
  static get sequencePointerType() {
    return createPrimitiveType("pointer");
  }
  static get sequenceLengthType() {
    return createPrimitiveType("u32");
  }
  static sequenceParameterPointer(parameter) {
    return `${parameter}SequencePointer`;
  }
  static sequenceParameterLength(parameter) {
    return `${parameter}SequenceLength`;
  }
  static method(interfaceName, methodName, namespaceName = "") {
    if (isCreateOrUpdate(methodName)) {
      const { createOrUpdate, rest } = splitCreateOrUpdate(methodName);
      return `${createOrUpdate}${interfaceName}${rest}`;
    }
    return `${interfaceName}${methodName}`;
  }
  static get keywords() {
    return [
      `extends`,
      `var`,
      `function`,
      `super`,
      `arguments`,
      `implements`,
      `interface`,
      `global`
    ];
  }
};
InteropConstructions.context = {
  type: createReferenceType(`Context`),
  name: `context`
};

// src/utils/string.ts
function pascalToCamel(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
function dropPostfix(value, toDrop) {
  if (value.endsWith(toDrop)) {
    return value.slice(0, -toDrop.length);
  }
  return value;
}
function dropPrefix(value, toDrop) {
  if (value.startsWith(toDrop)) {
    return value.slice(toDrop.length);
  }
  return value;
}

// src/general/common.ts
function peerMethod(name) {
  name = dropPostfix(name, Config.constPostfix);
  name = dropPostfix(name, Config.ptrPostfix);
  name = dropPrefix(name, Config.uselessPrefix);
  name = pascalToCamel(name);
  return name;
}
function makeMethodName(name) {
  return peerMethod(name);
}
function splitCreateOrUpdate(fullName) {
  if (fullName.startsWith(Config.createPrefix)) {
    const createOrUpdate = Config.createPrefix;
    const rest = dropPrefix(fullName, Config.createPrefix);
    return { createOrUpdate, rest };
  }
  if (fullName.startsWith(Config.updatePrefix)) {
    const createOrUpdate = Config.updatePrefix;
    const rest = dropPrefix(fullName, Config.updatePrefix);
    return { createOrUpdate, rest };
  }
  throwException(`method name doesn't start neither with ${Config.createPrefix} nor with ${Config.updatePrefix}`);
}
function mangleIfKeyword(name) {
  if (InteropConstructions.keywords.includes(name)) {
    return `_${name}_`;
  }
  return name;
}
function isContext(param) {
  const inner = innerTypeCommon(param.type);
  return isReferenceType(inner) && inner.name === `${Config.dataClassPrefix}${Config.context}`;
}
function isGetter(node) {
  const params = node.parameters;
  if (params.length > 1 || params.length === 1 && !isContext(params.at(0))) {
    return false;
  }
  if (isVoidType(node.returnType)) {
    return false;
  }
  return true;
}
function isRegular(node) {
  if (!isVoidType(node.returnType)) {
    return false;
  }
  return true;
}
function isAbstract(node) {
  if (isDataClass(node)) {
    return false;
  }
  if (isReal(node)) {
    return false;
  }
  return true;
}
function isReal(node) {
  return nodeType(node) !== void 0;
}
function isDataClass(node) {
  return node.name.startsWith(Config.dataClassPrefix) || parent(node) === Config.defaultAncestor;
}
function isCreate(name) {
  return isCreateOrUpdate(name) && name.startsWith(Config.createPrefix);
}
function isCreateOrUpdate(sourceMethodName) {
  if (!sourceMethodName.startsWith(Config.createPrefix) && !sourceMethodName.startsWith(Config.updatePrefix)) {
    return false;
  }
  const { rest } = splitCreateOrUpdate(sourceMethodName);
  return rest.length <= 1;
}
function isImplInterface(name) {
  return dropPrefix(name, Config.dataClassPrefix) === "Impl";
}
function fixEnumPrefix(name) {
  if (name.startsWith(`es2panda_`)) {
    name = dropPrefix(name, `es2panda_`);
    name = `Es2panda${capitalize(name)}`;
  }
  return name;
}

// src/utils/idl.ts
function isString(node) {
  return isPrimitiveType(node) && node.name === `String`;
}
function isSequence(node) {
  return IDLContainerUtils.isSequence(node);
}
function createUpdatedInterface(node, methods, name, inheritance, extendedAttributes, properties) {
  return createInterface(
    name != null ? name : node.name,
    node.subkind,
    inheritance != null ? inheritance : node.inheritance,
    node.constructors,
    node.constants,
    properties != null ? properties : node.properties,
    methods != null ? methods : node.methods,
    node.callables,
    node.typeParameters,
    {
      extendedAttributes: extendedAttributes != null ? extendedAttributes : node.extendedAttributes,
      fileName: node.fileName,
      documentation: node.documentation
    }
  );
}
function baseName(type) {
  return baseNameString(type.name);
}
function baseNameString(name) {
  if (name.indexOf(".") > 0) {
    return name.substring(name.lastIndexOf(".") + 1);
  } else {
    return name;
  }
}
function nodeType(node) {
  var _a, _b;
  return (_b = (_a = node.extendedAttributes) == null ? void 0 : _a.find((it) => it.name === Config.nodeTypeAttribute)) == null ? void 0 : _b.value;
}
function nativeType(node) {
  var _a, _b;
  return (_b = (_a = node.extendedAttributes) == null ? void 0 : _a.find((it) => it.name === "c_type")) == null ? void 0 : _b.value;
}
function nodeNamespace(node) {
  var _a;
  return (_a = getNamespacesPathFor(node)[0]) == null ? void 0 : _a.name;
}
function fqName(node) {
  return getQualifiedName(node, "namespace.name");
}
function parent(node) {
  var _a;
  return (_a = node.inheritance[0]) == null ? void 0 : _a.name;
}
function createDefaultTypescriptWriter() {
  return new TSLanguageWriter(
    new IndentedPrinter(),
    createEmptyReferenceResolver(),
    { convert: (node) => throwException(`unexpected type conversion`) }
  );
}
function innerType(node) {
  return node.elementType[0];
}
function innerTypeIfContainer(node) {
  if (isContainerType(node)) {
    return innerType(node);
  }
  return node;
}
function innerTypeCommon(type) {
  if (isContainerType(type)) {
    if (IDLContainerUtils.isSequence(type)) {
      return type.elementType[0];
    }
  } else if (isOptionalType(type)) {
    return type.type;
  }
  return type;
}
function makeMethod(name, parameters, returnType, modifiers) {
  return new Method(
    name,
    makeSignature(parameters, returnType),
    modifiers != null ? modifiers : []
  );
}
function makeSignature(parameters, returnType) {
  let parameterModifiers = parameters.map((it) => it.isOptional || isOptionalType(it.type) ? ArgumentModifier.OPTIONAL : void 0);
  let lastNonOptional = -1;
  for (let i = 0; i < parameterModifiers.length; i++) {
    if (parameterModifiers[i] == void 0) lastNonOptional = i;
  }
  if (lastNonOptional != -1) {
    for (let i = 0; i < lastNonOptional; i++) parameterModifiers[i] = void 0;
  }
  return new NamedMethodSignature(
    returnType,
    parameters.map((it) => it.type),
    parameters.map((it) => it.name).map(mangleIfKeyword),
    void 0,
    parameterModifiers
  );
}
function makeExpression(writer, arg) {
  return typeof arg === "string" ? writer.makeString(arg) : arg;
}
function makeStatement(writer, arg) {
  return typeof arg !== "string" && "write" in arg ? arg : writer.makeStatement(makeExpression(writer, arg));
}
function flatParentsImpl(ref, resolveReference) {
  if (isReferenceType(ref)) {
    const type = resolveReference(ref);
    if (!type || !isInterface(type)) {
      return [];
    }
    ref = type;
  }
  const result = [];
  const queue = [ref];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    if (result.length > 1 && baseNameString(ref.name) === node.name) {
      break;
    }
    node.inheritance.map((p) => resolveReference(p, ref)).filter((p) => p !== void 0 && isInterface(p)).forEach((p) => queue.push(p));
  }
  return result;
}
function makeFullyQualifiedName(node, resolveReference) {
  if (isReferenceType(node)) {
    const decl = resolveReference(node);
    return decl ? makeFullyQualifiedName(decl) : node.name;
  }
  return getNamespacesPathFor(node).filter((n) => n.name !== Config.irNamespace).map((n) => n.name).concat(dropPrefix(node.name, Config.dataClassPrefix)).join(".");
}
function makeEnoughQualifiedName(ref, resolveReference) {
  const decl = resolveReference(ref);
  if (!decl) {
    return ref.name;
  }
  const declNs = getNamespacesPathFor(decl).map((n) => n.name).join(".");
  const contextNs = getNamespacesPathFor(ref).map((n) => n.name).join(".");
  if (declNs === contextNs || declNs === "" || declNs === Config.irNamespace) {
    const name = declNs != "" && ref.name.startsWith(declNs) ? ref.name.slice(declNs.length + 1) : dropPrefix(ref.name, Config.dataClassPrefix);
    return name;
  }
  return fqName(decl);
}

// src/general/Typechecker.ts
var Typechecker = class {
  constructor(file) {
    this.file = file;
    this.namespaces = this.file.entries.filter((e) => isNamespace(e));
  }
  resolveReference(ref) {
    const prefix = Config.dataClassPrefix;
    if (ref.name.startsWith(prefix)) {
      const entry = this.resolveReference2(createReferenceType(ref.name.slice(prefix.length)));
      if (entry) {
        return entry;
      }
    }
    return this.resolveReference2(ref);
  }
  resolveReference2(ref, debugPrefix = "") {
    const target = ref.name.split(".");
    let entry = void 0;
    if (target.length > 1) {
      entry = resolveNamedNode(target, void 0, [this.file]);
    } else {
      if (ref.parent) {
        entry = resolveNamedNode(target, ref.parent, [this.file]);
      }
      if (!entry) {
        for (const pov of this.namespaces) {
          entry = resolveNamedNode(target, pov, [this.file]);
          if (entry) break;
        }
      }
    }
    if (debugPrefix.length) {
      console.log(`RESOLVER: ${ref.name} => ${entry ? fqName(entry) : entry}`);
    }
    return entry;
  }
  resolveRecursive(ref) {
    const decl = this.resolveReference(ref);
    return decl && isTypedef(decl) && isReferenceType(decl.type) ? this.resolveRecursive(decl.type) : decl;
  }
  flatParents(ref) {
    const resolveReference = (ref2, pov) => (
      // Improve: idlize/core version, change to ours after testing
      resolveNamedNode(ref2.name.split("."), pov, [this.file])
    );
    return flatParentsImpl(ref, resolveReference);
  }
  // All classes are consideres heirs of ArktsObject now
  isHeir(ref, ancestor) {
    const resolveReference = (r, _) => this.resolveReference(r);
    const iface = isReferenceType(ref) ? resolveReference(ref) : ref;
    if (!iface || !isInterface(iface)) {
      return false;
    }
    const parents = flatParentsImpl(iface, resolveReference);
    if (parents.map((p) => p.name).includes(ancestor)) {
      return true;
    }
    return ancestor === Config.defaultAncestor;
  }
  hasDescendants(ref) {
    const iface = isReferenceType(ref) ? this.resolveReference(ref) : ref;
    if (!iface || !isInterface(iface)) {
      return false;
    }
    const lookupScopes = [];
    const parent2 = iface.parent;
    if (parent2 && isNamespace(parent2)) {
      lookupScopes.push(...this.namespaces.filter((ns) => ns.name === parent2.name));
    } else {
      lookupScopes.push(this.file);
    }
    const visitInterfaces = (node, cb) => {
      switch (node.kind) {
        case IDLKind.File:
          return node.entries.some((value) => visitInterfaces(value, cb));
        case IDLKind.Namespace:
          return node.members.some((value) => visitInterfaces(value, cb));
        case IDLKind.Interface:
          return cb(node);
      }
      return false;
    };
    return lookupScopes.some((scope) => visitInterfaces(
      scope,
      (node) => node.name !== iface.name && this.isHeir(node, iface.name)
    ));
  }
  isPeer(node) {
    if (node.name === Config.astNodeCommonAncestor) return false;
    if (node.name === Config.context) return false;
    if (this.isHeir(node, Config.astNodeCommonAncestor)) return true;
    if (this.isHeir(node, Config.defaultAncestor)) return true;
    return false;
  }
  isReferenceTo(type, isTarget) {
    if (!isReferenceType(type)) {
      return false;
    }
    const declaration = this.resolveReference(type);
    return declaration !== void 0 && isTarget(declaration);
  }
  isConstReturnValue(node) {
    const isPrimitive = (returnType) => {
      var _a;
      const type = isReferenceType(returnType) ? (_a = this.resolveReference(returnType)) != null ? _a : throwException(`Unresolved type ${returnType.name}`) : returnType;
      return isPrimitiveType(type) || isEnum(type) || isTypedef(type) && isPrimitive(type.type);
    };
    if (isPrimitive(node.returnType)) {
      return false;
    }
    return node.name.endsWith(Config.constPostfix);
  }
  nodeTypeName(node) {
    var _a;
    const value = nodeType(node);
    const entry = this.resolveReference(createReferenceType(Config.nodeTypeAttribute));
    const name = entry && isEnum(entry) ? (_a = entry.elements.find((e) => {
      var _a2;
      return ((_a2 = e.initializer) == null ? void 0 : _a2.toString()) === value;
    })) == null ? void 0 : _a.name : void 0;
    return name ? `${Config.nodeTypeAttribute}.${name}` : void 0;
  }
};

// src/printers/SingleFilePrinter.ts
var AbstractVisitor = class {
  visitChildren(entry) {
    if (isFile(entry)) {
      entry.entries.forEach((it) => this.visit(it));
    }
    if (isNamespace(entry)) {
      entry.members.forEach((it) => this.visit(it));
    }
  }
};
var SingleFilePrinter = class extends AbstractVisitor {
  constructor(idl) {
    super();
    this.idl = idl;
    this.typechecker = new Typechecker(this.idl);
  }
  printEnum(node) {
  }
  printTypedef(node) {
  }
  visit(node) {
    if (isInterface(node) && !this.filterInterface(node)) {
      this.printInterface(node);
    }
    if (isEnum(node)) {
      this.printEnum(node);
    }
    if (isTypedef(node)) {
      this.printTypedef(node);
    }
    this.visitChildren(node);
  }
  prologue() {
  }
  epilogue() {
  }
  print() {
    var _a, _b;
    this.prologue();
    this.visit(this.idl);
    this.epilogue();
    return [
      (_b = (_a = this.importer) == null ? void 0 : _a.getOutput()) != null ? _b : [],
      [""],
      // empty line
      this.writer.getOutput()
    ].flat().join(`
`);
  }
};

// src/printers/Filter.ts
var Filter = class _Filter {
  static makeMethod(name, returnType, parameters, modifiers, isNullable) {
    const params = _Filter.filterParameters(parameters);
    return makeMethod(
      name,
      params.map((p) => ({
        name: p.name,
        type: this.makeOptionalType(p, isNullable),
        isOptional: p.isOptional
      })),
      this.makeOptionalType(returnType, isNullable),
      modifiers
    );
  }
  static makeOptionalType(param, isNullable) {
    const type = isParameter(param) ? param.type : param;
    return isNullable(param) ? createOptionalType(type) : type;
  }
  static isNullableType(type, typechecker) {
    return isReferenceType(type) && (typechecker.isPeer(type) || type.name === Config.astNodeCommonAncestor);
  }
  static filterMoreSpecific(methods) {
    const ifaceName = methods.length && methods[0].parent && isInterface(methods[0].parent) ? methods[0].parent.name : "";
    const compat = ["ETSTuple", "ExportNamedDeclaration"];
    const noCopyCtor = methods.filter((m) => !(m.parameters.length === 2 && isContext(m.parameters[0]) && m.parameters[1].name === "other"));
    if (compat.includes(ifaceName)) {
      return methods;
    }
    return noCopyCtor.length ? [
      noCopyCtor.reduce(
        (prev, curr) => curr.parameters.length > prev.parameters.length ? curr : prev,
        noCopyCtor[0]
      )
    ] : noCopyCtor;
  }
  static filterParameters(params) {
    return _Filter.removeArrayLengthParam(_Filter.removeContextParam(params));
  }
  static filterMethods(methods) {
    const names = new Set(methods.map((m) => m.name));
    const others = methods.filter((method) => {
      const bareName = dropSuffix(
        dropSuffix(method.name, Config.constPostfix),
        Config.ptrPostfix
      );
      return bareName === method.name || method.name.endsWith(Config.ptrPostfix) && !names.has(bareName) || method.name.endsWith(Config.constPostfix) && !names.has(bareName) && !names.has(`${bareName}${Config.ptrPostfix}`);
    });
    return others;
  }
  static isOptional(param, typechecker) {
    return isReferenceType(param.type) && (typechecker.isPeer(param.type) || param.type.name === Config.astNodeCommonAncestor);
  }
  static isArrayLengthParam(param) {
    return isPrimitiveType(param.type) && ["u32", "i32", "u64", "i64"].includes(param.type.name) && ["Len", "Count", "Num", "argc"].some((m) => param.name.endsWith(m));
  }
  static findArrayLengthParam(parameters, startIndex = 0) {
    let seqInd = parameters.findIndex((p, index) => index >= startIndex && isSequence(p.type));
    while (seqInd !== -1) {
      if (seqInd > 0 && this.isArrayLengthParam(parameters[seqInd - 1])) {
        return seqInd - 1;
      }
      if (seqInd + 1 < parameters.length && this.isArrayLengthParam(parameters[seqInd + 1])) {
        return seqInd + 1;
      }
      seqInd = parameters.findIndex((p, index) => index >= startIndex + seqInd + 1 && isSequence(p.type));
    }
    return -1;
  }
  static removeArrayLengthParam(parameters) {
    const params = [...parameters];
    let index = this.findArrayLengthParam(params);
    while (index !== -1) {
      params.splice(index, 1);
      index = this.findArrayLengthParam(params, index);
    }
    return params;
  }
  static removeContextParam(parameters) {
    const first = parameters.at(0);
    return first && isContext(first) ? parameters.slice(1) : [...parameters];
  }
};

// src/printers/interop/InteropPrinter.ts
var InteropPrinter = class extends AbstractVisitor {
  constructor(file) {
    super();
    this.file = file;
    this.typechecker = new Typechecker(this.file);
  }
  print() {
    this.file.entries.forEach((it) => this.visit(it));
    return this.writer.getOutput().join("\n");
  }
  visit(node) {
    if (isInterface(node)) {
      this.visitInterface(node);
    }
    this.visitChildren(node);
  }
  visitInterface(node) {
    Filter.filterMethods(node.methods).forEach((it) => this.visitMethod(node, it));
  }
  visitMethod(iface, node) {
    this.printMethod(iface, node);
  }
  printMethod(iface, node) {
  }
};

// src/type-convertors/BaseTypeConvertor.ts
var BaseTypeConvertor = class {
  constructor(typechecker, conversions) {
    this.typechecker = typechecker;
    this.conversions = conversions;
  }
  convertContainer(type) {
    if (isSequence(type)) {
      return this.conversions.sequence(type);
    }
    throwException(`only sequence container type is supported`);
  }
  convertPrimitiveType(type) {
    switch (type.name) {
      case "i8":
        return this.conversions.i8(type);
      case "u8":
        return this.conversions.iu8(type);
      case "i16":
        return this.conversions.i16(type);
      case "i32":
        return this.conversions.i32(type);
      case "u32":
        return this.conversions.iu32(type);
      case "u64":
        return this.conversions.iu64(type);
      case "i64":
        return this.conversions.i64(type);
      case "f32":
        return this.conversions.f32(type);
      case "f64":
        return this.conversions.f64(type);
      case "boolean":
        return this.conversions.boolean(type);
      case "String":
        return this.conversions.string(type);
      case "void":
        return this.conversions.void(type);
      case "pointer":
        return this.conversions.pointer(type);
      case "undefined":
        return this.conversions.undefined(type);
    }
    throwException(`unsupported primitive type: ${JSON.stringify(type)}`);
  }
  convertTypeReferenceAsImport(type, importClause) {
    return this.convertTypeReference(type);
  }
  convertTypeReference(type) {
    const declaration = this.typechecker.resolveReference(type);
    if (declaration && isEnum(declaration)) {
      return this.conversions.enum(type);
    } else if (declaration && isTypedef(declaration)) {
      return this.convertType(declaration.type);
    }
    return this.conversions.reference(type);
  }
  convertOptional(type) {
    return this.conversions.optional(type);
  }
  convertUnion(type) {
    throwException("union type is not supported");
  }
  convertImport(type) {
    throw new Error("Import is not supported");
  }
  convertTypeParameter(type) {
    throw new Error("type parameters are not supported");
  }
  convertType(type) {
    return convertType(this, type);
  }
};

// src/type-convertors/interop/bridges/ReturnTypeConvertor.ts
var ReturnTypeConvertor = class extends BaseTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => createPrimitiveType("pointer"),
      string: (type) => createPrimitiveType("pointer"),
      enum: (type) => type,
      reference: (type) => type,
      optional: (type) => type,
      i8: (type) => type,
      iu8: (type) => type,
      i16: (type) => type,
      i32: (type) => type,
      iu32: (type) => type,
      i64: (type) => type,
      iu64: (type) => type,
      f32: (type) => type,
      f64: (type) => type,
      boolean: (type) => type,
      void: (type) => type,
      pointer: (type) => type,
      undefined: (type) => type
    });
  }
};

// src/type-convertors/interop/InteropTypeConvertor.ts
var InteropTypeConvertor = class extends BaseTypeConvertor {
  constructor(typechecker, heirConversions) {
    super(typechecker, __spreadValues({
      enum: (type) => `KInt`,
      reference: (type) => `KNativePointer`,
      optional: (type) => throwException(`no nullable allowed at interop level`),
      undefined: (type) => throwException(`no nullable allowed at interop level`),
      i8: (type) => `KBoolean`,
      iu8: (type) => "KInt",
      i16: (type) => `KInt`,
      i32: (type) => `KInt`,
      iu32: (type) => `KUInt`,
      i64: (type) => `KLong`,
      iu64: (type) => `KULong`,
      f32: (type) => `KFloat`,
      f64: (type) => `KDouble`,
      boolean: (type) => `KBoolean`,
      void: (type) => `void`,
      pointer: (type) => `KNativePointer`
    }, heirConversions));
  }
};

// src/type-convertors/interop/bridges/InteropMacroTypeConvertor.ts
var InteropMacroTypeConvertor = class extends InteropTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => isString(type.elementType[0]) ? `KStringArray` : `KNativePointerArray`,
      string: (type) => `KStringPtr`
    });
  }
};

// src/type-convertors/interop/bridges/NativeTypeConvertor.ts
var NativeTypeConvertor = class extends InteropTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => isString(type.elementType[0]) ? `KStringArray&` : `KNativePointerArray`,
      string: (type) => `KStringPtr&`
    });
  }
};

// src/type-convertors/interop/bridges/CastTypeConvertor.ts
var CastTypeConvertor = class extends BaseTypeConvertor {
  constructor(typechecker) {
    const primitive = (type) => BridgesConstructions.primitiveTypeCast(
      this.castToTypeConvertor.convertType(type)
    );
    super(typechecker, {
      sequence: (type) => isString(type.elementType[0]) ? BridgesConstructions.stringArrayCast : BridgesConstructions.referenceTypeCast(this.castToTypeConvertor.convertType(type)),
      enum: (type) => BridgesConstructions.enumCast(
        this.castToTypeConvertor.convertType(type)
      ),
      reference: (type) => BridgesConstructions.referenceTypeCast(
        this.castToTypeConvertor.convertType(type)
      ),
      i8: primitive,
      iu8: primitive,
      i16: primitive,
      i32: primitive,
      iu32: primitive,
      i64: primitive,
      iu64: primitive,
      f32: primitive,
      f64: primitive,
      boolean: primitive,
      string: (type) => BridgesConstructions.stringCast,
      optional: (type) => throwException(`no optional type allowed at interop level conversion`),
      void: (type) => throwException(`no void typed parameters allowed`),
      pointer: (type) => throwException(`no pointer typed parameters allowed`),
      undefined: (type) => throwException(`no undefined typed parameters allowed`)
    });
    this.castToTypeConvertor = new CastToTypeConvertor(this.typechecker);
  }
};
var CastToTypeConvertor = class extends BaseTypeConvertor {
  constructor(typechecker) {
    const primitive = (type) => this.nativeTypeConvertor.convertType(type);
    super(typechecker, {
      sequence: (type) => BridgesConstructions.arrayOf(
        this.convertType(innerType(type))
      ),
      enum: (type) => type.name,
      reference: (type) => {
        var _a, _b;
        const iface = (_a = typechecker.resolveReference(type)) != null ? _a : throwException(`Unresolved reference: ${type.name}`);
        const castType = isInterface(iface) ? (_b = nativeType(iface)) != null ? _b : typechecker.isHeir(iface, Config.astNodeCommonAncestor) ? Config.astNodeCommonAncestor : baseName(type) : baseName(type);
        return BridgesConstructions.referenceType(castType);
      },
      i8: primitive,
      iu8: primitive,
      i16: primitive,
      i32: primitive,
      iu32: primitive,
      i64: primitive,
      iu64: primitive,
      f32: primitive,
      f64: primitive,
      boolean: primitive,
      optional: (type) => throwException(`no optional type allowed at interop level conversion`),
      string: (type) => "const char*",
      void: (type) => throwException(`no void typed parameters allowed`),
      pointer: (type) => throwException(`no pointer typed parameters allowed`),
      undefined: (type) => throwException(`no undefined typed parameters allowed`)
    });
    this.nativeTypeConvertor = new NativeTypeConvertor(this.typechecker);
  }
};

// src/printers/interop/BridgesPrinter.ts
var BridgesPrinter = class _BridgesPrinter extends InteropPrinter {
  constructor(config, file) {
    super(file);
    this.config = config;
    this.castTypeConvertor = new CastTypeConvertor(this.typechecker);
    this.nativeTypeConvertor = new NativeTypeConvertor(this.typechecker);
    this.returnTypeConvertor = new ReturnTypeConvertor(this.typechecker);
    this.interopMacroConvertor = new InteropMacroTypeConvertor(this.typechecker);
    this.writer = new CppLanguageWriter(
      new IndentedPrinter(),
      createEmptyReferenceResolver(),
      { convert: (node) => this.nativeTypeConvertor.convertType(node) },
      new class extends PrimitiveTypeList {
        constructor() {
          super(...arguments);
          this.Undefined = new PrimitiveType(`undefined`);
          this.Void = new PrimitiveType(`void`);
        }
      }()
    );
  }
  printMethod(iface, node) {
    if (this.config.ignore.isIgnoredMethod(iface.name, node.name)) return;
    const [methodName, signature] = _BridgesPrinter.makeFunctionDeclaration(iface, node, this.returnTypeConvertor);
    this.writer.writeFunctionImplementation(
      BridgesConstructions.implFunction(methodName),
      signature,
      (_) => {
        var _a;
        let pandaMethodName = BridgesConstructions.callMethod(methodName);
        if (this.config.irHack.isIrHackInterface(iface.name)) {
          const nsName = (_a = nodeNamespace(iface)) != null ? _a : "ir";
          pandaMethodName = pandaMethodName.replace(iface.name, `${iface.name}${capitalize(nsName)}`);
        }
        this.printBody(node, signature, pandaMethodName);
      }
    );
    this.printInteropMacro(methodName, signature);
    this.writer.writeLines(``);
  }
  printInteropMacro(methodName, signature) {
    const isVoid = isVoidType(signature.returnType);
    const args = (isVoid ? [] : [signature.returnType]).concat(signature.args).map((a) => this.interopMacroConvertor.convertType(a));
    args.splice(0, 0, methodName);
    this.writer.writeExpressionStatement(
      this.writer.makeFunctionCall(
        BridgesConstructions.interopMacro(isVoid, signature.args.length),
        args.map((it) => this.writer.makeString(it))
      )
    );
  }
  static makeFunctionDeclaration(iface, node, converter) {
    const signature = makeSignature(
      node.parameters.map((p) => ({
        name: mangleIfKeyword(p.name),
        type: p.type,
        isOptional: p.isOptional
      })),
      converter.convertType(node.returnType)
    );
    if (!isCreateOrUpdate(node.name) && !isImplInterface(iface.name)) {
      signature.args.splice(1, 0, createReferenceType(iface.name));
      signature.argsNames.splice(1, 0, "receiver");
    }
    const fixArgName = (name, prev) => name.endsWith("Len") ? (prev != null ? prev : name.slice(0, -3)) + "SequenceLength" : name === "ctx" ? "context" : name;
    signature.argsNames = signature.argsNames.map((v, i) => fixArgName(v, i === 0 ? void 0 : signature.argsNames[i - 1]));
    const methodName = isImplInterface(iface.name) ? node.name : InteropConstructions.method(iface.name, node.name);
    return [methodName, signature];
  }
  printBody(node, signature, pandaMethodName) {
    const writer = this.writer;
    const argNames = signature.argsNames.map(BridgesConstructions.castedParameter);
    const statements = signature.args.map((type, index) => this.writer.makeAssign(
      BridgesConstructions.castedParameter(signature.argName(index)),
      void 0,
      writer.makeFunctionCall(
        this.castTypeConvertor.convertType(type),
        [writer.makeString(signature.argName(index))]
      )
    ));
    if (isSequence(node.returnType)) {
      argNames.push(BridgesConstructions.sequenceLengthPass);
      statements.push(makeStatement(writer, BridgesConstructions.sequenceLengthDeclaration));
    }
    const nativeCall = writer.makeFunctionCall(
      pandaMethodName,
      argNames.map((a) => writer.makeString(a))
    );
    writer.writeStatements(...statements);
    if (isVoidType(node.returnType)) {
      writer.writeStatements(
        writer.makeStatement(nativeCall),
        writer.makeReturn(writer.makeString(""))
      );
    } else {
      writer.writeStatements(
        writer.makeAssign(BridgesConstructions.result, void 0, nativeCall, true, false),
        writer.makeReturn(this.makeReturnExpression(node))
      );
    }
  }
  makeReturnExpression(node) {
    const makeStringCtor = () => BridgesConstructions.stringConstructor(BridgesConstructions.result);
    const makeSequenceCtor = () => BridgesConstructions.sequenceConstructor(
      BridgesConstructions.result,
      BridgesConstructions.sequenceLengthUsage
    );
    const expr = this.maybeDropConst(
      node,
      isSequence(node.returnType) ? makeSequenceCtor() : isString(node.returnType) ? makeStringCtor() : BridgesConstructions.result
    );
    if (isSequence(node.returnType)) {
      return this.writer.makeString(`${BridgesConstructions.sequenceLengthUsage} ? ${expr} : nullptr`);
    }
    return this.writer.makeString(expr);
  }
  maybeDropConst(node, value) {
    if (this.typechecker.isConstReturnValue(node)) {
      return BridgesConstructions.dropConstCast(value);
    }
    return value;
  }
};

// src/utils/types.ts
function isNumber(value) {
  return typeof value === `number`;
}
function id(value) {
  return value;
}

// src/type-convertors/top-level/TopLevelTypeConvertor.ts
var TopLevelTypeConvertor = class extends BaseTypeConvertor {
  constructor(typechecker, heirConversions) {
    super(typechecker, __spreadValues(__spreadValues({}, heirConversions), {
      i8: heirConversions.number,
      iu8: heirConversions.number,
      i16: heirConversions.number,
      i32: heirConversions.number,
      iu32: heirConversions.number,
      i64: heirConversions.number,
      iu64: heirConversions.number,
      f32: heirConversions.number,
      f64: heirConversions.number,
      void: heirConversions.void,
      boolean: heirConversions.boolean,
      pointer: heirConversions.pointer,
      undefined: heirConversions.undefined
    }));
  }
};

// src/type-convertors/top-level/LibraryTypeConvertor.ts
var _LibraryTypeConvertor = class extends TopLevelTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      enum: (type) => type.name,
      reference: (type) => type.name,
      sequence: (type) => `readonly ${this.convertType(innerType(type))}[]`,
      optional: (type) => `${this.convertType(type.type)} | undefined`,
      string: (type) => `string`,
      number: (type) => `number`,
      void: (type) => `void`,
      boolean: (type) => `boolean`,
      pointer: (type) => `KNativePointer`,
      undefined: (type) => `undefined`
    });
  }
};
var LibraryTypeConvertor = class extends _LibraryTypeConvertor {
  constructor(typechecker, fullQualified = false) {
    super(typechecker);
    this.fullQualified = fullQualified;
  }
  convertTypeReference(type) {
    const node = this.typechecker.resolveReference(type);
    if (node && (isEnum(node) || isTypedef(node))) {
      if (node.name.startsWith(Config.dataClassPrefix)) {
        return fixEnumPrefix(node.name);
      }
    }
    const resolver = this.typechecker.resolveReference.bind(this.typechecker);
    return this.fullQualified ? makeFullyQualifiedName(type, resolver) : makeEnoughQualifiedName(type, resolver);
  }
};

// src/printers/enums/EnumsPrinter.ts
var EnumsPrinter = class extends SingleFilePrinter {
  constructor() {
    super(...arguments);
    this.converter = new LibraryTypeConvertor(this.typechecker);
    this.writer = new TSLanguageWriter(
      new IndentedPrinter(),
      createEmptyReferenceResolver(),
      {
        convert: (node) => {
          if (isUnionType(node)) {
            return node.types.map(
              (type) => this.converter.convertType(type)
            ).join(" | ");
          }
          return this.converter.convertType(node);
        }
      }
    );
  }
  printInterface(node) {
  }
  filterInterface(node) {
    return true;
  }
  printEnum(node) {
    this.writer.writeEnum(
      fixEnumPrefix(node.name),
      node.elements.map((it) => {
        if (!isNumber(it.initializer)) {
          throwException(`unexpected initializer value: ${it.initializer}`);
        }
        return {
          name: it.name,
          stringId: void 0,
          numberId: it.initializer
        };
      }),
      { isExport: true }
    );
  }
  printTypedef(node) {
    this.writer.writeTypeDeclaration(
      createTypedef(fixEnumPrefix(node.name), node.type, node.typeParameters)
    );
  }
};

// src/printers/library/IndexPrinter.ts
var IndexPrinter = class extends SingleFilePrinter {
  constructor(config, idl) {
    super(idl);
    this.config = config;
    this.writer = createDefaultTypescriptWriter();
  }
  filterInterface(node) {
    return !this.typechecker.isPeer(node) || this.config.ignore.isIgnoredPeer(fqName(node));
  }
  printInterface(node) {
    this.writer.writeExpressionStatement(
      this.writer.makeString(`export * from "./peers/${dropPrefix(node.name, Config.dataClassPrefix)}"`)
    );
  }
};

// src/constuctions/BindingsConstructions.ts
var BindingsConstructions = class {
  static method(name) {
    return `_${name}`;
  }
  static get unimplemented() {
    return `throw new Error("This methods was not overloaded by native module initialization")`;
  }
  static get class() {
    return `Es2pandaNativeModule`;
  }
};

// src/type-convertors/interop/bindings/BindingsTypeConvertor.ts
var BindingsTypeConvertor = class extends InteropTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => isString(type.elementType[0]) ? `KStringArrayPtr` : `BigUint64Array`,
      string: (type) => `KStringPtr`
    });
  }
};

// src/type-convertors/interop/bindings/ReturnTypeConvertor.ts
var ReturnTypeConvertor2 = class extends BaseTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => createPrimitiveType("pointer"),
      enum: (type) => type,
      reference: (type) => type,
      optional: (type) => type,
      i8: (type) => type,
      iu8: (type) => type,
      i16: (type) => type,
      i32: (type) => type,
      iu32: (type) => type,
      i64: (type) => type,
      iu64: (type) => type,
      f32: (type) => type,
      f64: (type) => type,
      boolean: (type) => type,
      string: (type) => type,
      void: (type) => type,
      pointer: (type) => type,
      undefined: (type) => throwException(`undefined type is not allowed`)
    });
  }
};

// src/printers/interop/BindingsPrinter.ts
var BindingsPrinter = class extends InteropPrinter {
  constructor(idl) {
    super(idl);
    this.writer = new TSLanguageWriter(
      new IndentedPrinter(),
      createEmptyReferenceResolver(),
      { convert: (node) => this.convertor.convertType(node) }
    );
    this.convertor = new BindingsTypeConvertor(this.typechecker);
    this.returnConvertor = new ReturnTypeConvertor2(this.typechecker);
    this.writer.pushIndent();
  }
  printMethod(iface, node) {
    const [methodName, signature] = BridgesPrinter.makeFunctionDeclaration(iface, node, this.returnConvertor);
    this.writer.writeMethodImplementation(
      new Method(
        BindingsConstructions.method(methodName),
        signature
      ),
      (writer) => {
        writer.writeExpressionStatement(
          writer.makeString(BindingsConstructions.unimplemented)
        );
      }
    );
  }
};

// src/printers/MultiFilePrinter.ts
var MultiFilePrinter = class extends AbstractVisitor {
  constructor(idl) {
    super();
    this.idl = idl;
    //protected typechecker = new Typechecker(this.idl)
    this.output = [];
  }
  visit(node) {
    if (isInterface(node) && !this.filterInterface(node)) {
      this.output.push(this.printInterface(node));
    }
    this.visitChildren(node);
  }
  print() {
    this.visit(this.idl);
    return this.output;
  }
};

// src/constuctions/PeersConstructions.ts
var PeersConstructions = class _PeersConstructions {
  static peerName(name) {
    return dropPrefix(name, Config.dataClassPrefix);
  }
  static fileName(node) {
    return `${this.peerName(node)}.ts`;
  }
  static get pointerParameter() {
    return `pointer`;
  }
  static get super() {
    return `super`;
  }
  static get this() {
    const name = `this`;
    return {
      type: createReferenceType(name),
      name
    };
  }
  static get typeGuard() {
    const parameter = `node`;
    return {
      name: (type) => `is${type}`,
      parameter: {
        name: parameter,
        type: `object | undefined`
      },
      returnType: (type) => `${parameter} is ${_PeersConstructions.peerName(type)}`,
      body: (type) => `${parameter} instanceof ${_PeersConstructions.peerName(type)}`
    };
  }
  static get unpackNullableNode() {
    return `unpackNode`;
  }
  static get unpackNullableConstructable() {
    return `unpackConstructable`;
  }
  static get unpackNonNullable() {
    return `unpackNonNullableNode`;
  }
  static get arrayOfPointersToArrayOfPeers() {
    return `unpackNodeArray`;
  }
  static get arrayOfPointersToArrayOfObjects() {
    return `unpackNativeObjectArray`;
  }
  static get receiveString() {
    return `unpackString`;
  }
  static passNode(name) {
    return `passNode(${name})`;
  }
  static passStringArray(name) {
    return `passStringArray(${name})`;
  }
  static passNodeArray(name) {
    return `passNodeArray(${name})`;
  }
  static arrayLength(name) {
    return `${name}.length`;
  }
  static get context() {
    return `global.context`;
  }
  static get pointerUsage() {
    return `this.peer`;
  }
  static callBinding(iface, method) {
    return `global.generatedEs2panda.${BindingsConstructions.method(
      InteropConstructions.method(iface, method)
    )}`;
  }
  static get warn() {
    return `console.warn`;
  }
  static stubNodeMessage(node) {
    return `"Warning: stub node ${node}"`;
  }
  static import(what, from) {
    return `import { ${what} } from "./${from}"`;
  }
  static createOrUpdate(iface, method) {
    return peerMethod(`${method}${iface}`);
  }
  static universalCreate(iface) {
    return peerMethod(`create${iface}`);
  }
  static universalUpdate(iface) {
    return peerMethod(`update${iface}`);
  }
  static get setChildrenParentPtrMethod() {
    return `setChildrenParentPtr`;
  }
  static newOf(iface) {
    return `new ${this.peerName(iface)}`;
  }
  static callPeerMethod(iface, method) {
    return `${iface}.${method}`;
  }
  static brand(iface) {
    return `brand${capitalize(this.peerName(iface))}`;
  }
};

// src/printers/library/Importer.ts
var path3 = __toESM(require("node:path"), 1);
var Importer = class {
  constructor(dir, self) {
    this.dir = dir;
    this.writer = createDefaultTypescriptWriter();
    this.seen = /* @__PURE__ */ new Set([
      Config.astNodeCommonAncestor,
      Config.defaultAncestor
      // Improve: handwritten
    ]);
    if (self !== void 0) {
      this.seen.add(self);
    }
  }
  withPeerImport(name) {
    const fq = name.split(".");
    this.withPeerImport2(fq.length > 1 ? fq.slice(0, -1).join(".") : name);
    return name;
  }
  withPeerImport2(it) {
    if (this.seen.has(it)) {
      return it;
    }
    this.seen.add(it);
    this.import(it, it);
    return it;
  }
  withEnumImport(it) {
    if (this.seen.has(it)) {
      return it;
    }
    this.seen.add(it);
    this.import(it, `../Es2pandaEnums`);
    return it;
  }
  withReexportImport(it) {
    if (this.seen.has(it)) {
      return it;
    }
    this.seen.add(it);
    this.import(it, "../../src/reexport-for-generated");
    return it;
  }
  addSeen(it) {
    this.seen.add(it);
  }
  import(name, from) {
    this.writer.writeExpressionStatement(
      this.writer.makeString(
        PeersConstructions.import(
          name,
          path3.normalize(
            path3.join(this.dir, from)
          ).replaceAll("\\", "/")
        )
      )
    );
  }
  getOutput() {
    return this.writer.getOutput().sort();
  }
};

// src/type-convertors/top-level/peers/BindingParameterTypeConvertor.ts
var BindingParameterTypeConvertor = class extends TopLevelTypeConvertor {
  constructor(typechecker) {
    super(typechecker, {
      sequence: (type) => (parameter) => [
        isString(type.elementType[0]) ? PeersConstructions.passStringArray(parameter) : PeersConstructions.passNodeArray(parameter),
        PeersConstructions.arrayLength(parameter)
      ],
      string: (type) => (parameter) => parameter,
      enum: (type) => (parameter) => parameter,
      reference: (type) => (parameter) => {
        if (type.name === `${Config.dataClassPrefix}${Config.context}`) {
          return PeersConstructions.context;
        }
        return PeersConstructions.passNode(parameter);
      },
      optional: (type) => this.convertType(type.type),
      number: (type) => (parameter) => parameter,
      void: (type) => (parameter) => parameter,
      pointer: (type) => (parameter) => parameter,
      boolean: (type) => (parameter) => parameter,
      undefined: (type) => (parameter) => parameter
    });
  }
};

// src/type-convertors/top-level/peers/BindingReturnValueTypeConvertor.ts
function unpackWrapper(type, typechecker) {
  const isAstNode = (ref) => (isReferenceType(ref) || isInterface(ref)) && typechecker.isHeir(ref, Config.astNodeCommonAncestor);
  const isAstType = (ref) => (isReferenceType(ref) || isInterface(ref)) && typechecker.isHeir(ref, Config.astTypeAncestor);
  if (isContainerType(type)) {
    if (IDLContainerUtils.isSequence(type) && isReferenceType(type.elementType[0])) {
      return isAstNode(type.elementType[0]) ? PeersConstructions.arrayOfPointersToArrayOfPeers : PeersConstructions.arrayOfPointersToArrayOfObjects;
    }
    throwException(`unexpected container of non-sequence type`);
  } else if (isString(type)) {
    return PeersConstructions.receiveString;
  } else if (isReferenceType(type)) {
    if (isAstNode(type)) {
      return PeersConstructions.unpackNonNullable;
    }
  } else if (isOptionalType(type)) {
    const innerType2 = type.type;
    if (isReferenceType(innerType2)) {
      if (isAstNode(innerType2)) {
        return PeersConstructions.unpackNullableNode;
      }
      if (isAstType(innerType2)) {
        return PeersConstructions.unpackNullableConstructable;
      }
      return void 0;
    }
    throwException(`unexpected optional of non-reference type`);
  }
  return void 0;
}
function hasTypeHintArgument(wrapper) {
  return [
    PeersConstructions.arrayOfPointersToArrayOfPeers,
    PeersConstructions.unpackNonNullable,
    PeersConstructions.unpackNullableNode,
    PeersConstructions.unpackNullableConstructable
  ].includes(wrapper);
}
function typeHintArgument(type, typechecker, importer) {
  const isAstNode = (ref) => isInterface(ref) && typechecker.isHeir(ref, Config.astNodeCommonAncestor);
  const isAstType = (ref) => isInterface(ref) && typechecker.isHeir(ref, Config.astTypeAncestor);
  const iface = isReferenceType(type) ? typechecker.resolveReference(type) : void 0;
  if (iface && isAstNode(iface) && !typechecker.hasDescendants(iface)) {
    const astNodeTypeName = typechecker.nodeTypeName(iface);
    if (astNodeTypeName) {
      importer.withEnumImport(Config.nodeTypeAttribute);
      return astNodeTypeName;
    }
  }
  if (iface && isAstType(iface)) {
    return makeEnoughQualifiedName(type, typechecker.resolveReference.bind(typechecker));
  }
  return void 0;
}
function hasFactoryArgument(wrapper) {
  return [
    PeersConstructions.arrayOfPointersToArrayOfObjects
  ].includes(wrapper);
}

// src/printers/Generator.ts
var import_assert = __toESM(require("assert"), 1);
var CommonGenerator = class {
  static resolveProperty(property, iface, typechecker) {
    var _a, _b;
    const parents = typechecker.flatParents(iface);
    const methods = parents.flatMap((p) => p.methods);
    const props = parents.flatMap((p) => p.properties);
    const getters = methods.filter(isGetter);
    const regulars = methods.filter(isRegular);
    if (property.name === "modifierFlags") {
      const method = createProperty(property.name, createReferenceType("Es2pandaModifierFlags"));
      return [method, method];
    }
    const removePrefix = (name) => {
      for (const prefix of ["is", "can", "get"]) {
        if (name.startsWith(prefix)) {
          return name.slice(prefix.length);
        }
      }
      return name;
    };
    const getterName = (_a = property.getter) != null ? _a : property.name;
    const setterName = (_b = property.setter) != null ? _b : `set${capitalize(removePrefix(property.name))}`;
    const index0 = props.findIndex((value, index) => peerMethod(value.name) === getterName);
    const index1 = getters.findIndex((value, index) => peerMethod(value.name) === getterName);
    const index2 = regulars.findIndex((value, index) => peerMethod(value.name) === setterName);
    (0, import_assert.default)(index0 >= 0 || index1 >= 0, `Cannot find getter '${getterName}' for parameter ${property.name}!`);
    (0, import_assert.default)(index2 >= 0, `Cannot find setter '${setterName}' for parameter ${property.name}!`);
    return [
      index0 >= 0 ? props.at(index0) : getters.at(index1),
      regulars.at(index2)
    ];
  }
  static makeExtraParameter(param, iface, typechecker) {
    const type = (m) => "type" in m ? m.type : m.returnType;
    const [getter, setter] = this.resolveProperty(param, iface, typechecker);
    return createParameter(param.name, type(getter), param.optional);
  }
  static makeExtraParameters(iface, config, typechecker) {
    return config.parameters.getParameters(iface.name).map((param) => this.makeExtraParameter(param, iface, typechecker));
  }
  static makeExtraStatement(prop, methods, varNames, writer) {
    var _a;
    const [getter, setter] = methods;
    const str = (n) => writer.makeString(n);
    const type = "parameters" in setter ? (_a = setter.parameters.at(0)) == null ? void 0 : _a.type : void 0;
    const isParam = "optional" in prop;
    const [src, dst] = varNames;
    const getExpr = str(isParam ? prop.name : `${src}.${peerMethod(getter.name)}`);
    const assignStmt = isProperty(setter) ? writer.makeAssign(`${dst}.${peerMethod(setter.name)}`, void 0, getExpr, false) : writer.makeStatement(
      writer.makeMethodCall(dst, peerMethod(setter.name), type !== void 0 ? [getExpr] : [])
    );
    const needCondition = isParam && prop.optional || // is optional parameter
    //(type !== undefined && !isOptionalType(type)) || // setter has non-nullable type
    type === void 0 && !isProperty(setter);
    return needCondition ? writer.makeCondition(getExpr, writer.makeBlock([assignStmt])) : assignStmt;
  }
};

// src/printers/library/PeerPrinter.ts
var PeerPrinter = class {
  constructor(config, typechecker, importer) {
    this.config = config;
    this.typechecker = typechecker;
    this.importer = importer;
    this.bindingParameterTypeConvertor = new BindingParameterTypeConvertor(this.typechecker);
  }
  printInterface(iface, writer) {
    this.printPeer(iface, writer);
    if (!isDataClass(iface)) {
      this.printTypeGuard(iface, writer);
    }
    if (isReal(iface)) {
      this.printAddToNodeMap(iface, writer);
    }
  }
  printPeer(iface, writer) {
    var _a;
    const _parent = (_a = iface.inheritance[0]) != null ? _a : createReferenceType(Config.defaultAncestor);
    const parentName = makeEnoughQualifiedName(_parent, this.typechecker.resolveReference.bind(this.typechecker));
    this.importer.addSeen(PeersConstructions.peerName(iface.name));
    writer.writeClass(
      PeersConstructions.peerName(iface.name),
      // XXX: Change peer name to iface.name
      (writer2) => this.printBody(iface, writer2),
      this.importer.withPeerImport(parentName)
    );
  }
  printBody(iface, writer) {
    this.printConstructor(iface, writer);
    this.printMethods(iface, writer);
    this.printFragment(iface, writer);
    this.printBrand(iface, writer);
  }
  printConstructor(iface, writer) {
    const isAstNodeDescendant = this.typechecker.isHeir(iface, Config.astNodeCommonAncestor);
    const args = [createPrimitiveType("pointer")];
    const argNames = [PeersConstructions.pointerParameter];
    if (isAstNodeDescendant) {
      args.push(createReferenceType(Config.nodeTypeAttribute));
      argNames.push("astNodeType");
    }
    writer.writeConstructorImplementation(
      iface.name,
      new NamedMethodSignature(createPrimitiveType("void"), args, argNames),
      () => {
        writer.writeExpressionStatements(
          writer.makeFunctionCall(
            PeersConstructions.super,
            argNames.map((n) => writer.makeString(n))
          )
        );
      }
    );
  }
  printTypeGuard(iface, writer) {
    writer.writeFunctionImplementation(
      PeersConstructions.typeGuard.name(iface.name),
      new NamedMethodSignature(
        createReferenceType(
          PeersConstructions.typeGuard.returnType(iface.name)
        ),
        [createReferenceType(PeersConstructions.typeGuard.parameter.type)],
        [PeersConstructions.typeGuard.parameter.name]
      ),
      () => {
        writer.writeStatement(
          writer.makeReturn(
            writer.makeString(
              PeersConstructions.typeGuard.body(iface.name)
            )
          )
        );
      }
    );
  }
  printMethods(iface, writer) {
    const methods = iface.methods.reduce((out, m) => {
      !isCreateOrUpdate(m.name) ? out.other.push(m) : isCreate(m.name) ? out.creates.push(m) : out.updates.push(m);
      return out;
    }, { creates: [], updates: [], other: [] });
    if (isAbstract(iface) && nativeType(iface) === void 0) {
      console.log(`Skipped ${iface.name}.create/update methods`);
    } else {
      const isCompat = ["ETSTuple", "ExportNamedDeclaration", "ETSParameterExpression"].includes(iface.name);
      const toPrint = isCompat ? methods.creates.concat(methods.updates).sort((a, b) => iface.methods.indexOf(a) - iface.methods.indexOf(b)) : Filter.filterMoreSpecific(methods.creates).concat(methods.updates);
      toPrint.forEach(
        (m) => this.printCreateOrUpdate(iface, m, writer)
      );
    }
    Filter.filterMethods(methods.other).forEach((method) => {
      if (isGetter(method)) {
        return this.printGetter(iface, method, writer);
      }
      if (isRegular(method)) {
        return this.printRegular(iface, method, writer);
      }
    });
  }
  printFragment(iface, writer) {
    const methods = this.config.fragments.getCodeFragment(iface.name);
    if (methods !== void 0) {
      methods.forEach((it) => {
        this.importer.withReexportImport(it.definition);
        writer.writeLines(`${it.name} = ${it.definition}`);
      });
    }
  }
  printGetter(iface, node, writer) {
    writer.writeMethodImplementation(
      Filter.makeMethod(
        peerMethod(node.name),
        node.returnType,
        [],
        [MethodModifier.GETTER],
        this.isNullable.bind(this, iface, node)
      ),
      () => {
        writer.writeStatement(
          writer.makeReturn(
            this.makeReturnBindingCall(iface, node, writer)
          )
        );
      }
    );
  }
  printFunction(iface, node, writer) {
    const makeOptional = this.makeOptional.bind(this, iface, node);
    const returnTypeInner = innerTypeCommon(node.returnType);
    const nativeCall = this.wrapBindingCall(
      this.makeStaticBindingCall(void 0, node, writer),
      makeOptional(node.returnType),
      writer
    );
    writer.writeFunctionImplementation(
      pascalToCamel(node.name),
      makeSignature(
        Filter.removeArrayLengthParam(Filter.removeContextParam(node.parameters)).map((p) => ({
          name: p.name,
          type: makeOptional(p),
          isOptional: p.isOptional
        })),
        makeOptional(node.returnType)
      ),
      () => {
        writer.writeStatement(
          isVoidType(node.returnType) ? writer.makeStatement(nativeCall) : writer.makeReturn(nativeCall)
        );
      }
    );
  }
  printRegular(iface, node, writer) {
    writer.writeExpressionStatement(
      writer.makeString(`/** @deprecated */`)
    );
    writer.writeMethodImplementation(
      Filter.makeMethod(
        peerMethod(node.name),
        PeersConstructions.this.type,
        node.parameters.map((it) => createParameter(it.name, it.type)),
        [],
        this.isNullable.bind(this, iface, node)
      ),
      () => {
        writer.writeExpressionStatement(
          this.makeReturnBindingCall(iface, node, writer)
        );
        writer.writeStatement(
          writer.makeReturn(
            writer.makeString(
              PeersConstructions.this.name
            )
          )
        );
      }
    );
  }
  makeStaticBindingCall(iface, node, writer) {
    var _a;
    return writer.makeFunctionCall(
      PeersConstructions.callBinding((_a = iface == null ? void 0 : iface.name) != null ? _a : "", node.name),
      this.makeBindingArguments(node.parameters, writer)
    );
  }
  makePeerBindingCall(iface, node, writer) {
    const params = node.parameters.slice(0);
    params.splice(1, 0, createParameter(PeersConstructions.pointerUsage, createPrimitiveType("pointer")));
    return writer.makeFunctionCall(
      PeersConstructions.callBinding(iface.name, node.name),
      this.makeBindingArguments(params, writer)
    );
  }
  makeReturnBindingCall(iface, node, writer) {
    const makeOptional = this.makeOptional.bind(this, iface, node);
    return this.wrapBindingCall(
      this.makePeerBindingCall(iface, node, writer),
      makeOptional(node.returnType),
      writer
    );
  }
  wrapBindingCall(nativeCall, returnType, writer) {
    const wrapper = unpackWrapper(returnType, this.typechecker);
    const innerType2 = innerTypeCommon(returnType);
    if (wrapper) {
      const args = [nativeCall];
      if (hasFactoryArgument(wrapper) && isReferenceType(innerType2)) {
        args.push(this.makeNativeObjectFactory(innerType2, writer));
      }
      if (hasTypeHintArgument(wrapper)) {
        const hint = typeHintArgument(innerType2, this.typechecker, this.importer);
        if (hint) {
          args.push(writer.makeString(hint));
        }
      }
      return writer.makeFunctionCall(wrapper, args);
    }
    const convertName = (ref) => makeEnoughQualifiedName(ref, this.typechecker.resolveReference.bind(this.typechecker));
    const resolvedType = isReferenceType(innerType2) ? this.typechecker.resolveRecursive(innerType2) : innerType2;
    return isReferenceType(innerType2) && resolvedType && isInterface(resolvedType) ? writer.makeNewObject(convertName(innerType2), [nativeCall]) : nativeCall;
  }
  makeNativeObjectFactory(type, writer) {
    const args = [{ name: "peer", type: createPrimitiveType("pointer") }];
    const stmts = [
      writer.makeReturn(
        writer.makeNewObject(
          makeEnoughQualifiedName(type, this.typechecker.resolveReference.bind(this.typechecker)),
          args.map((a) => writer.makeString(a.name))
        )
      )
    ];
    return writer.makeLambda(NamedMethodSignature.make(type, args), stmts);
  }
  printCreateOrUpdate(iface, node, writer) {
    const extraParameters = CommonGenerator.makeExtraParameters(iface, this.config, this.typechecker);
    writer.writeMethodImplementation(
      Filter.makeMethod(
        `${makeMethodName(node.name)}${iface.name}`,
        node.returnType,
        node.parameters.concat(extraParameters),
        [MethodModifier.STATIC],
        this.isNullable.bind(this, iface, node)
      ),
      (writer2) => {
        var _a;
        const nativeCall = this.makeStaticBindingCall(iface, node, writer2);
        const varName = "result";
        const makeStmt = (property) => CommonGenerator.makeExtraStatement(
          property,
          CommonGenerator.resolveProperty(property, iface, this.typechecker),
          ["should_not_be_here", varName],
          writer2
        );
        const extraStatements = this.config.parameters.getParameters(iface.name).map(makeStmt);
        if (isReal(iface)) {
          const astNodeType = (_a = this.typechecker.nodeTypeName(iface)) != null ? _a : throwException(`missing attribute node type: ${iface.name}`);
          const newExpr = writer2.makeNewObject(
            iface.name,
            [nativeCall, writer2.makeString(astNodeType)]
          );
          writer2.writeStatements(
            writer2.makeAssign(
              varName,
              createReferenceType(iface.name),
              newExpr,
              true
            ),
            ...extraStatements,
            writer2.makeStatement(
              writer2.makeMethodCall(varName, PeersConstructions.setChildrenParentPtrMethod, [])
            ),
            writer2.makeReturn(
              writer2.makeString(varName)
            )
          );
        } else {
          writer2.writeStatement(writer2.makeReturn(
            writer2.makeNewObject(iface.name, [nativeCall])
          ));
        }
      }
    );
  }
  makeBindingArguments(parameters, writer) {
    return parameters.map((it) => createParameter(mangleIfKeyword(it.name), it.type)).reduce((prev, param, index, arr) => {
      if (Filter.isArrayLengthParam(param)) {
        const seqInd = index > 0 && isSequence(arr[index - 1].type) ? index - 1 : index < arr.length && isSequence(arr[index + 1].type) ? index + 1 : -1;
        if (seqInd !== -1) {
          return [...prev, PeersConstructions.arrayLength(arr[seqInd].name)];
        }
        console.warn(`Parameter ${param.name} at index ${index}                                  matches array length heuristic but has no sequnce parameter!`);
      } else if (isSequence(param.type)) {
        return [...prev, isString(param.type.elementType[0]) ? PeersConstructions.passStringArray(param.name) : PeersConstructions.passNodeArray(param.name)];
      }
      return [...prev, this.bindingParameterTypeConvertor.convertType(param.type)(param.name)].flat();
    }, []).map((it) => writer.makeString(it));
  }
  makeOptional(iface, method, param) {
    return Filter.makeOptionalType(param, this.isNullable.bind(this, iface, method));
  }
  isNullable(iface, method, param) {
    const isParam = isParameter(param);
    const type = isParam ? param.type : param;
    if (!isParam && isCreateOrUpdate(method.name)) return false;
    if (!isParam && this.config.nonNullable.isNonNullableReturnType(iface.name, method.name)) return false;
    if (isParam && this.config.nonNullable.isNonNullableParameter(iface.name, method.name, param.name)) return false;
    return Filter.isNullableType(type, this.typechecker);
  }
  printAddToNodeMap(iface, writer) {
    const enumValue = this.typechecker.nodeTypeName(iface);
    if (enumValue === void 0) {
      return;
    }
    this.importer.withEnumImport(Config.nodeTypeAttribute);
    writer.writeExpressionStatements(
      writer.makeString(`if (!nodeByType.has(${enumValue})) {`),
      writer.makeString(`    nodeByType.set(${enumValue}, (peer: KNativePointer) => new ${iface.name}(peer, ${enumValue}))`),
      writer.makeString(`}`)
    );
  }
  printBrand(iface, writer) {
    writer.writeProperty(
      PeersConstructions.brand(iface.name),
      createPrimitiveType("undefined"),
      [FieldModifier.PROTECTED, FieldModifier.READONLY]
    );
  }
};

// src/type-convertors/top-level/ImporterTypeConvertor.ts
function convertAndImport(importer, converter, type, config) {
  const result = converter.convertType(type);
  if (isOptionalType(type)) {
    const _ = convertAndImport(importer, converter, type.type, config);
  } else if (isContainerType(type) && IDLContainerUtils.isSequence(type)) {
    const _ = convertAndImport(importer, converter, type.elementType[0], config);
  } else if (isReferenceType(type)) {
    const node = converter.typechecker.resolveReference(type);
    if (node && isEnum(node)) {
      importer.withEnumImport(result);
    } else if (node && isTypedef(node)) {
      importer.withEnumImport(result);
    } else if (node && isInterface(node) && converter.typechecker.isPeer(node)) {
      if (config.ignore.hasReexportReplacement(fqName(node))) {
        importer.withReexportImport(dropPrefix(type.name, Config.dataClassPrefix));
      } else {
        importer.withPeerImport(result);
      }
    }
  }
  return result;
}

// src/printers/library/AllPeersPrinter.ts
var _AllPeersPrinter = class _AllPeersPrinter extends MultiFilePrinter {
  constructor(config, idl) {
    super(idl);
    this.config = config;
    this.typechecker = new Typechecker(this.idl);
  }
  filterInterface(node) {
    throw "deprecated!";
    return !this.isAllowed(node);
  }
  printNamespace(ns) {
    const members = ns.members.filter(isInterface).filter(this.isAllowed.bind(this));
    if (members.length === 0) {
      return [];
    }
    return [this.printFile(ns.name, [ns.name], (printer, writer, importer) => {
      ns.members.filter(isInterface).forEach((iface) => importer.addSeen(iface.name));
      writer.pushNamespace(ns.name, { indent: false });
      this.sortInterfaces(members).forEach((m) => printer.printInterface(m, writer));
      writer.popNamespace({ indent: false });
    })];
  }
  printInterface(iface) {
    if (isImplInterface(iface.name)) {
      const ns = "compiler";
      return this.printFile("public", [ns], (printer, writer) => {
        writer.pushNamespace(ns, { indent: false });
        iface.methods.filter(this.isAllowedMethod.bind(this, iface)).forEach((m) => printer.printFunction(iface, m, writer));
        writer.popNamespace({ indent: false });
      });
    }
    return this.printFile(iface.name, ["*"], (printer, writer, importer) => {
      importer.addSeen(PeersConstructions.peerName(iface.name));
      printer.printInterface(iface, writer);
    });
  }
  printFile(name, exports2, cb) {
    const importer = new Importer(".", name);
    const writer = this.makeWriter(importer);
    const printer = new PeerPrinter(this.config, this.typechecker, importer);
    cb(printer, writer, importer);
    return {
      exports: exports2,
      fileName: PeersConstructions.fileName(name),
      output: [...importer.getOutput(), "", ...writer.getOutput()].join(`
`)
    };
  }
  print() {
    const visitInterfaces = (node) => {
      switch (node.kind) {
        case IDLKind.File:
          return node.entries.flatMap((value) => visitInterfaces(value));
        case IDLKind.Namespace: {
          const ns = node;
          if (_AllPeersPrinter.FlattenNamespaces.includes(ns.name)) {
            return ns.members.flatMap((value) => visitInterfaces(value));
          }
          return this.printNamespace(ns);
        }
        case IDLKind.Interface: {
          const iface = node;
          return this.isAllowed(iface) ? [this.printInterface(iface)] : [];
        }
      }
      return [];
    };
    return visitInterfaces(this.idl);
  }
  /**
   * Sort interfaces in order of inheritance.
   */
  sortInterfaces(ifaces) {
    const sorted = [];
    ifaces.forEach((iface) => {
      const parents = this.typechecker.flatParents(iface);
      parents.reverse().forEach((p) => {
        const index = sorted.findIndex((ps2) => p.name === ps2.name);
        if (index === -1) {
          sorted.push(p);
        }
      });
    });
    return sorted;
  }
  makeWriter(importer) {
    const converter = {
      convert: (node) => convertAndImport(
        importer,
        new LibraryTypeConvertor(this.typechecker),
        node,
        this.config
      )
    };
    return new TSLanguageWriter(new IndentedPrinter(), createEmptyReferenceResolver(), converter);
  }
  isAllowed(node) {
    return this.typechecker.isPeer(node) && !this.config.ignore.isIgnoredPeer(fqName(node));
  }
  isAllowedMethod(iface, node) {
    return !this.config.ignore.isIgnoredMethod(fqName(iface), node.name);
  }
  static printIndexFile(out, config, idl) {
    const writer = createDefaultTypescriptWriter();
    const dropExt = (file) => file.substring(0, file.lastIndexOf("."));
    for (const { exports: exports2, fileName, output } of out) {
      const specs = exports2.length === 1 && exports2.at(0) === "*" ? exports2.at(0) : `{ ${exports2.join(", ")} }`;
      writer.writeExpressionStatement(
        writer.makeString(`export ${specs} from "./peers/${dropExt(fileName)}"`)
      );
    }
    const groupByNamespace = (names) => {
      const grouped = /* @__PURE__ */ new Map();
      names.forEach((fqName3) => {
        const parts = fqName3.split(".");
        const [ns, entity] = [parts.slice(0, -1).join("."), parts.at(-1)];
        getOrPut(grouped, ns, (k) => []).push(entity);
      });
      return grouped;
    };
    const resolveNames = (fqNames, idl2) => {
      var _a;
      const grouped = groupByNamespace(fqNames);
      const result = /* @__PURE__ */ new Map();
      for (const [ns, names] of grouped) {
        const entities = /* @__PURE__ */ new Set();
        if (ns === "compiler") {
          const impl = (_a = idl2.entries.find((e) => isInterface(e) && isImplInterface(e.name))) != null ? _a : throwException("Cannot find es2panda_Impl");
          impl.methods.filter((m) => !config.ignore.isIgnoredMethod(impl.name, m.name)).forEach((m) => entities.add(m.name));
        } else {
          const nss = idl2.entries.filter((e) => isNamespace(e) && e.name === ns);
          nss.flatMap((ns2) => ns2.members).filter((e) => isInterface(e) && !config.ignore.isIgnoredInterface(e.name, ns)).forEach((e) => entities.add(e.name));
        }
        const included = names.includes("*") ? entities : /* @__PURE__ */ new Set();
        const globNames = names.filter((n) => n.includes("*") && n.length > 1);
        const regularNames = names.filter((n) => !n.includes("*"));
        globNames.forEach((p) => {
          const exclude = p.at(-1) === "!";
          const pattern = p.slice(0, exclude ? -2 : -1);
          if (exclude) {
            for (const s of included.values()) {
              if (s.startsWith(pattern)) {
                included.delete(s);
              }
            }
          } else {
            for (const s of entities.values()) {
              if (s.startsWith(pattern)) {
                included.add(s);
              }
            }
          }
        });
        regularNames.forEach((n) => {
          const exclude = n.at(-1) === "!";
          const name = exclude ? n.slice(0, -1) : n;
          if (n !== name) {
            included.delete(name);
          } else {
            if (entities.has(name)) {
              included.add(name);
            } else {
              console.log(`WARN: no entity ${name} in scope ${ns}!`);
            }
          }
        });
        result.set(ns, [...included.values()]);
      }
      return result;
    };
    const classes = resolveNames(config.aliases.classes, idl);
    const functions = resolveNames(config.aliases.functions, idl);
    writer.writeLines("\n// Aliases\n");
    [...classes.keys()].concat(...functions.keys()).forEach((ns) => {
      const file = ns === "compiler" ? "public" : ns;
      writer.writeImports(`./peers/${file}`, [ns], [""]);
    });
    classes.forEach(
      (clss, ns) => clss.forEach(
        (cls) => writer.writeLines(
          `export class ${cls} extends ${ns}.${cls} {}`
        )
      )
    );
    functions.forEach(
      (funcs, ns) => funcs.forEach((name) => {
        const func = pascalToCamel(name);
        writer.writeLines(
          `export const ${func} = ${ns}.${func}`
        );
      })
    );
    return writer.getOutput().join("\n");
  }
};
_AllPeersPrinter.FlattenNamespaces = [Config.irNamespace];
var AllPeersPrinter = _AllPeersPrinter;

// src/constuctions/FactoryConstructions.ts
var FactoryConstructions = class {
  static isSame(first, second) {
    return `isSameNativeObject(${first}, original.${second})`;
  }
  static all(checks) {
    return checks.join(` && `);
  }
  static get original() {
    return `original`;
  }
  static get updateNodeByNode() {
    return `updateNodeByNode`;
  }
  static get prologue() {
    return `export const factory = {`;
  }
  static get epilogue() {
    return `}`;
  }
};

// src/printers/library/FactoryPrinter.ts
var FactoryPrinter = class extends SingleFilePrinter {
  constructor(config, idl) {
    super(idl);
    this.config = config;
    this.importer = new Importer(`peers`);
    this.converter = new LibraryTypeConvertor(
      this.typechecker,
      true
      /* fq names */
    );
    this.writer = new TSLanguageWriter(
      new IndentedPrinter(),
      createEmptyReferenceResolver(),
      {
        convert: (node) => convertAndImport(
          this.importer,
          this.converter,
          node,
          this.config
        )
      }
    );
  }
  prologue() {
    this.writer.writeExpressionStatements(
      this.writer.makeString(FactoryConstructions.prologue)
    );
    this.writer.pushIndent();
  }
  epilogue() {
    this.writer.popIndent();
    this.writer.writeExpressionStatements(
      this.writer.makeString(FactoryConstructions.epilogue)
    );
  }
  filterInterface(node) {
    return !this.typechecker.isPeer(node);
  }
  printInterface(node) {
    const filtered = Filter.filterMoreSpecific(
      node.methods.filter((m) => isCreate(m.name))
    );
    const universal = filtered.at(0);
    if (!universal || filtered.length > 1) {
      return;
    }
    const params = Filter.filterParameters(universal.parameters);
    const methods = Filter.filterMethods(node.methods);
    const getters = this.gettersForParams(params, methods);
    if (!getters) {
      return;
    }
    const parameters = params.map((p, i) => createParameter(peerMethod(getters[i].name), p.type, p.isOptional));
    this.printCreate(node, universal.name, parameters);
    this.writer.print(",");
    this.printUpdate(node, universal.name, parameters, getters);
    this.writer.print(",");
  }
  printCreate(node, universalName, parameters) {
    const isNullable = (type) => Filter.isNullableType(isParameter(type) ? type.type : type, this.typechecker);
    const extraParameters = CommonGenerator.makeExtraParameters(node, this.config, this.typechecker);
    const signature = makeSignature(
      parameters.concat(extraParameters).map((p) => ({
        name: p.name,
        type: Filter.makeOptionalType(p.type, isNullable),
        isOptional: p.isOptional
      })),
      createReferenceType(node.name)
    );
    this.writer.writeMethodImplementation(
      new Method(
        PeersConstructions.universalCreate(node.name),
        signature
      ),
      () => this.writer.writeStatement(
        this.writer.makeReturn(
          this.writer.makeStaticMethodCall(
            makeFullyQualifiedName(node),
            PeersConstructions.createOrUpdate(node.name, universalName),
            signature.argsNames.map(mangleIfKeyword).map((it) => this.writer.makeString(it))
          )
        )
      )
    );
  }
  printUpdate(node, universalName, parameters, getters) {
    const isNullable = (type) => Filter.isNullableType(type, this.typechecker);
    const extraParameters = this.config.parameters.getParameters(node.name);
    const signature = makeSignature(
      [{
        name: FactoryConstructions.original,
        type: id(createReferenceType(node.name)),
        isOptional: false
      }].concat(parameters).concat(
        extraParameters.map((p) => CommonGenerator.makeExtraParameter(p, node, this.typechecker))
      ).map((p, i) => ({
        name: p.name,
        type: i && isNullable(p.type) ? createOptionalType(p.type) : p.type,
        isOptional: p.isOptional
      })),
      createReferenceType(node.name)
    );
    this.writer.writeMethodImplementation(
      new Method(
        PeersConstructions.universalUpdate(node.name),
        signature
      ),
      (writer) => {
        const expr = (value) => writer.makeString(value);
        const same = (lhs, rhs) => FactoryConstructions.isSame(mangleIfKeyword(lhs), rhs);
        const isSameAll = FactoryConstructions.all(
          parameters.map((param) => same(param.name, param.name)).concat(
            extraParameters.map(
              (param) => {
                const [get, _] = CommonGenerator.resolveProperty(param, node, this.typechecker);
                return same(param.name, peerMethod(get.name));
              }
            )
          )
        );
        if (parameters.length) {
          writer.writeStatement(
            writer.makeCondition(
              expr(isSameAll),
              writer.makeReturn(expr(FactoryConstructions.original))
            )
          );
        }
        const createCall = writer.makeStaticMethodCall(
          makeFullyQualifiedName(node),
          PeersConstructions.createOrUpdate(node.name, universalName),
          parameters.concat(extraParameters).map((p) => expr(mangleIfKeyword(p.name)))
        );
        writer.writeStatement(writer.makeReturn(
          writer.makeFunctionCall(FactoryConstructions.updateNodeByNode, [
            createCall,
            writer.makeString(FactoryConstructions.original)
          ])
        ));
      }
    );
  }
  gettersForParams(params, methods) {
    const toTypeName = (type) => {
      const rawType = isOptionalType(type) ? type.type : type;
      return `${this.converter.convertType(rawType)}`;
    };
    const mappedMethods = methods.map((m) => [toTypeName(m.returnType), m]);
    const getters = params.map((param) => {
      const paramTypeName = toTypeName(param.type);
      const sameTypeMethods = mappedMethods.filter((tuple) => tuple[0] === paramTypeName).map((tuple) => tuple[1]);
      const sameNameMethods = sameTypeMethods.length > 1 ? sameTypeMethods.filter((m) => peerMethod(m.name) === param.name) : sameTypeMethods;
      if (sameNameMethods.length === 1) {
        mappedMethods.splice(
          mappedMethods.findIndex(([_, m]) => m === sameNameMethods[0]),
          1
        );
        return sameNameMethods[0];
      }
      return void 0;
    });
    const defined = getters.filter(isDefined);
    return defined.length === getters.length ? defined : void 0;
  }
};

// src/transformers/Transformer.ts
var Transformer = class {
  constructor(file, removeNamespaces = false) {
    this.file = file;
    this.removeNamespaces = removeNamespaces;
  }
  transformFile(input) {
    let entries = this.removeNamespaces ? linearizeNamespaceMembers(input.entries).filter((it) => !isNamespace(it)) : input.entries;
    let file = createFile(
      entries.map((it) => this.transformDeep(it)).filter(isDefined),
      input.fileName
    );
    linkParentBack(file);
    return file;
  }
  transformDeep(entry) {
    if (isNamespace(entry)) {
      return createNamespace(
        entry.name,
        entry.members.map((it) => this.transformDeep(it)).filter(isDefined)
      );
    }
    return this.transform(entry);
  }
  transform(entry) {
    if (isInterface(entry))
      return this.transformInterface(entry);
    else
      return entry;
  }
  transformed() {
    return this.transformFile(this.file);
  }
};

// src/general/Coverage.ts
var CoverageStat = class {
  constructor() {
    this.stats = /* @__PURE__ */ new Map();
  }
  total(iface) {
    const ns = this.makeEntry(iface);
    this.stats.get(ns).interfaceNumberTotal += 1;
  }
  ignored(iface) {
    const ns = this.makeEntry(iface);
    this.stats.get(ns).interfaceNumberIgnored += 1;
  }
  funcTotal(iface, num = 1) {
    const ns = this.makeEntry(iface);
    this.stats.get(ns).functionNumberTotal += num;
  }
  funcIgnored(iface, num = 1) {
    const ns = this.makeEntry(iface);
    this.stats.get(ns).functionNumberIgnored += num;
  }
  dump() {
    const overall = {
      interfaceNumberTotal: 0,
      interfaceNumberIgnored: 0,
      functionNumberTotal: 0,
      functionNumberIgnored: 0
    };
    console.log(`
   === API Coverage ===`);
    this.stats.forEach((value, key) => {
      const ifaceNum2 = value.interfaceNumberTotal - value.interfaceNumberIgnored;
      const funcNum2 = value.functionNumberTotal - value.functionNumberIgnored;
      const ident = " ".repeat(12 - key.length + 2);
      console.log(`${key}:${ident}${ifaceNum2}/${value.interfaceNumberTotal} ${funcNum2}/${value.functionNumberTotal}`);
      overall.interfaceNumberTotal += value.interfaceNumberTotal;
      overall.interfaceNumberIgnored += value.interfaceNumberIgnored;
      overall.functionNumberTotal += value.functionNumberTotal;
      overall.functionNumberIgnored += value.functionNumberIgnored;
    });
    const ifaceNum = overall.interfaceNumberTotal - overall.interfaceNumberIgnored;
    const funcNum = overall.functionNumberTotal - overall.functionNumberIgnored;
    const ifacePercentage = ifaceNum / overall.interfaceNumberTotal * 100;
    const funcPercentage = funcNum / overall.functionNumberTotal * 100;
    console.log(`
Overall:
  interfaces: ${ifaceNum} of ${overall.interfaceNumberTotal}(${ifacePercentage.toPrecision(3)}%)`);
    console.log(`  functions: ${funcNum} of ${overall.functionNumberTotal}(${funcPercentage.toPrecision(3)}%)`);
  }
  makeEntry(node) {
    var _a;
    const ns = (_a = nodeNamespace(node)) != null ? _a : "global";
    if (!this.stats.has(ns)) {
      this.stats.set(ns, {
        interfaceNumberTotal: 0,
        interfaceNumberIgnored: 0,
        functionNumberTotal: 0,
        functionNumberIgnored: 0
      });
    }
    return ns;
  }
};
var gCoverage = new CoverageStat();

// src/transformers/common/filter/BaseInterfaceFilterTransformer.ts
var BaseInterfaceFilterTransformer = class extends Transformer {
  constructor(file, removeNamespaces = false) {
    super(file, removeNamespaces);
    this.typechecker = new Typechecker(this.file);
  }
  transformInterface(entry) {
    gCoverage.total(entry);
    if (this.shouldFilterOutInterface(entry)) {
      gCoverage.ignored(entry);
      return void 0;
    }
    const filtered = entry.methods.filter((it) => !this.shouldFilterOutMethod(entry.name, it.name)).filter((it) => !this.isReferringForbiddenOrMissing(it, (iface) => this.shouldFilterOutInterface(iface)));
    gCoverage.funcTotal(entry, entry.methods.length);
    gCoverage.funcIgnored(entry, entry.methods.length - filtered.length);
    return createUpdatedInterface(
      entry,
      filtered,
      entry.name,
      entry.inheritance,
      entry.extendedAttributes,
      entry.properties.filter((it) => !this.shouldFilterOutProperty(entry.name, it.name))
    );
  }
  isReferringForbiddenOrMissing(node, predicate) {
    return node.parameters.map((it) => it.type).concat(node.returnType).map(innerTypeIfContainer).filter((it) => {
      if (isReferenceType(it)) {
        const decl = this.typechecker.resolveReference(it);
        if (!decl || isInterface(decl) && predicate(decl)) {
          return true;
        }
      }
      return false;
    }).length !== 0;
  }
};

// src/transformers/common/filter/OptionsFilterTransformer.ts
var OptionsFilterTransformer = class extends BaseInterfaceFilterTransformer {
  constructor(config, file) {
    super(file);
    this.config = config;
  }
  shouldFilterOutInterface(entry) {
    var _a;
    const ns = (_a = nodeNamespace(entry)) != null ? _a : "";
    return this.config.ignore.isIgnoredInterface(entry.name, ns);
  }
  shouldFilterOutMethod(node, name) {
    return this.config.ignore.isIgnoredMethod(node, name);
  }
  shouldFilterOutProperty(node, name) {
    return this.config.ignore.isIgnoredProperty(node, name);
  }
};

// src/utils/utils.ts
var import_node_module = require("node:module");
var import_node_path = __toESM(require("node:path"), 1);
var import_meta = {};
var baseUrl = typeof __filename !== "undefined" ? __filename : import_meta.url;
var packageJsonPath = (0, import_node_module.createRequire)(baseUrl).resolve("@idlizer/arktscgen/package.json");
var DIR_NAME = import_node_path.default.dirname(packageJsonPath);

// src/emitters/DynamicEmitter.ts
var SingleFileEmitter = class {
  constructor(print, path7, template, enabled) {
    this.print = print;
    this.path = path7;
    this.template = template;
    this.enabled = enabled;
  }
};
var MultiFileEmitter = class {
  constructor(print, dir, template, enabled) {
    this.print = print;
    this.dir = dir;
    this.template = template;
    this.enabled = enabled;
  }
};
var DynamicEmitter = class {
  constructor(outDir, sdkDir, file, config, shouldLog) {
    this.outDir = outDir;
    this.sdkDir = sdkDir;
    this.file = file;
    this.config = config;
    this.shouldLog = shouldLog;
    this.pandaSdkVersion = `Unknown`;
    this.generatorVersion = `Unknown`;
    this.logDir = `./out/log-idl`;
    this.logCount = 0;
    this.bridgesPrinter = new SingleFileEmitter(
      (idl) => new BridgesPrinter(this.config, idl).print(),
      `libarkts/generated/native/bridges.cpp`,
      `bridges.cpp`,
      true
    );
    this.bindingsPrinter = new SingleFileEmitter(
      (idl) => new BindingsPrinter(idl).print(),
      `libarkts/generated/Es2pandaNativeModule.ts`,
      `Es2pandaNativeModule.ts`,
      true
    );
    this.enumsPrinter = new SingleFileEmitter(
      (idl) => new EnumsPrinter(idl).print(),
      `libarkts/generated/Es2pandaEnums.ts`,
      `Es2pandaEnums.ts`,
      true
    );
    this.indexPrinter = new SingleFileEmitter(
      (idl) => new IndexPrinter(this.config, idl).print(),
      // overriden below
      `libarkts/generated/index.ts`,
      `index.ts`,
      true
    );
    this.peersPrinter = new MultiFileEmitter(
      (idl) => new AllPeersPrinter(this.config, idl).print(),
      `libarkts/generated/peers`,
      `peer.ts`,
      true
    );
    this.factoryPrinter = new SingleFileEmitter(
      (idl) => new FactoryPrinter(this.config, idl).print(),
      `libarkts/generated/factory.ts`,
      `factory.ts`,
      true
    );
    var _a, _b, _c, _d;
    const myJson = path5.join(DIR_NAME, "package.json");
    if (fs5.existsSync(myJson)) {
      this.generatorVersion = (_b = (_a = import_json5.default.parse(
        fs5.readFileSync(myJson).toString()
      )) == null ? void 0 : _a.version) != null ? _b : `Unknown`;
    }
    const pandaJson = path5.join(sdkDir, "package.json");
    if (fs5.existsSync(pandaJson)) {
      this.pandaSdkVersion = (_d = (_c = import_json5.default.parse(
        fs5.readFileSync(pandaJson).toString()
      )) == null ? void 0 : _c.version) != null ? _d : `Unknown`;
    }
    const host = process.platform;
    const pandaBinary = path5.join(sdkDir, `${host}_host_tools/bin/es2panda`);
    if (fs5.existsSync(pandaBinary)) {
      const result = ps.spawnSync(pandaBinary, ["--version"], { encoding: "utf-8" });
      const [date, hash] = result.output.slice(1).join("\n").split("\n").filter((str) => str.length).slice(-2).map((str) => {
        var _a2, _b2;
        return (_b2 = (_a2 = str.split(": ")) == null ? void 0 : _a2.at(1)) != null ? _b2 : "";
      });
      this.pandaSdkVersion = `${hash}(${date == null ? void 0 : date.split("_")[0]}) sdk v${this.pandaSdkVersion}`;
    }
  }
  emit() {
    this.cleanLogDir();
    let idl = this.file;
    this.printFile(this.enumsPrinter, idl);
    idl = this.withLog(new OptionsFilterTransformer(this.config, idl));
    this.printPeers(idl);
    this.printInterop(idl);
  }
  printPeers(idl) {
    const out = this.printFiles(this.peersPrinter, idl);
    this.indexPrinter.print = AllPeersPrinter.printIndexFile.bind(void 0, out, this.config);
    this.printFile(this.indexPrinter, idl);
    this.printFile(this.factoryPrinter, idl);
  }
  printInterop(idl) {
    this.printFile(this.bindingsPrinter, idl);
    this.printFile(this.bridgesPrinter, idl);
  }
  printFile(filePrinter, idl) {
    if (!filePrinter.enabled) {
      return;
    }
    console.log(`emit to ${filePrinter.path}`);
    forceWriteFile(
      path5.join(this.outDir, filePrinter.path),
      this.readTemplate(filePrinter.template).replaceAll(
        `%GEN_VERSION%`,
        this.generatorVersion
      ).replaceAll(
        `%SDK_VERSION%`,
        this.pandaSdkVersion
      ).replaceAll(
        `%GENERATED_PART%`,
        filePrinter.print(idl)
      )
    );
  }
  printFiles(multiFilePrinter, idl) {
    if (!multiFilePrinter.enabled) {
      return [];
    }
    console.log(`emit to ${multiFilePrinter.dir}`);
    const output = multiFilePrinter.print(idl);
    output.forEach(({ fileName, output: output2 }) => {
      forceWriteFile(
        path5.join(this.outDir, multiFilePrinter.dir, fileName),
        this.readTemplate(multiFilePrinter.template).replaceAll(
          `%GENERATED_PART%`,
          output2
        )
      );
    });
    return output;
  }
  readTemplate(name) {
    return fs5.readFileSync(path5.join(DIR_NAME, `templates`, name), `utf8`);
  }
  withLog(transformer) {
    const idl = transformer.transformed();
    if (this.shouldLog) {
      const name = Reflect.get(transformer, `constructor`).name;
      forceWriteFile(
        path5.join(this.logDir, `${this.logCount}-after-${name}.idl`),
        toIDLString(idl, {})
      );
      this.logCount += 1;
    }
    return idl;
  }
  cleanLogDir() {
    if (this.shouldLog) {
      if (fs5.existsSync(this.logDir)) {
        fs5.rmSync(this.logDir, { recursive: true });
      }
    }
  }
};

// src/options/IgnoreOptions.ts
var import_json52 = __toESM(require_lib(), 1);
var fs6 = __toESM(require("node:fs"), 1);
var IgnoreOptions = class {
  constructor(filePath) {
    this.peers = [];
    this.partial = [];
    this.ignored = /* @__PURE__ */ new Map();
    var _a, _b, _c;
    if (filePath === void 0) {
      return;
    }
    const ignore = import_json52.default.parse(fs6.readFileSync(filePath).toString()).ignore;
    this.partial = (_a = ignore == null ? void 0 : ignore.partial) != null ? _a : [];
    this.peers = (_b = ignore == null ? void 0 : ignore.peers) != null ? _b : ["es2panda_Context"];
    const full = (_c = ignore == null ? void 0 : ignore.full) != null ? _c : [];
    full.forEach((fqName3) => {
      const parts = fqName3.split(".");
      const [ns, name] = parts.length === 1 ? ["", parts.at(0)] : parts;
      if (!this.ignored.has(ns)) {
        this.ignored.set(ns, /* @__PURE__ */ new Map());
      }
      const last = name.at(-1);
      const key = last === "!" ? name.slice(0, -last.length) : name;
      this.ignored.get(ns).set(key, last !== "!");
    });
  }
  // A different method as the signature and implementation may change
  hasReexportReplacement(name) {
    return this.isIgnoredPeer(name);
  }
  isIgnoredPeer(name) {
    return this.peers.includes(name);
  }
  isIgnoredMethod(iface, method) {
    var _a;
    return (_a = this.partial) == null ? void 0 : _a.some((it) => {
      var _a2;
      return it.interface === iface && ((_a2 = it.methods) == null ? void 0 : _a2.includes(method));
    });
  }
  isIgnoredProperty(iface, name) {
    var _a;
    return (_a = this.partial) == null ? void 0 : _a.some((it) => {
      var _a2;
      return it.interface === iface && ((_a2 = it.properties) == null ? void 0 : _a2.includes(name));
    });
  }
  isIgnoredInterface(name, namespace = "") {
    var _a, _b;
    const ns = this.ignored.get(namespace);
    if (ns && ((_b = (_a = ns.get(name)) != null ? _a : ns.get("*")) != null ? _b : false)) {
      return true;
    }
    return false;
  }
};
var IrHackOptions = class {
  constructor(filePath) {
    this.irHack = [];
    var _a;
    if (filePath === void 0) {
      return;
    }
    const json = import_json52.default.parse(fs6.readFileSync(filePath).toString());
    this.irHack = (_a = json == null ? void 0 : json.irHack) != null ? _a : [];
  }
  isIrHackInterface(name) {
    return this.irHack.includes(name);
  }
};

// ../node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/options/cli-options.ts
function cliOptions() {
  var _a, _b, _c;
  const cliOptions2 = program.option("--panda-sdk-path <path>", "Path to panda sdk").option("--output-dir <path>", "Path to output dir").requiredOption("--options-file <path>", "Path to file which determines what to generate").option("--debug", "Generate intermediate versions of IDL IR").parse().opts();
  return {
    pandaSdkPath: (_a = cliOptions2.pandaSdkPath) != null ? _a : throwException(`panda-sdk-path is mandatory parameter`),
    outputDir: (_b = cliOptions2.outputDir) != null ? _b : throwException(`output-dir is mandatory parameter`),
    optionsFile: cliOptions2.optionsFile,
    debug: (_c = cliOptions2.debug) != null ? _c : false
  };
}

// src/options/NonNullableOptions.ts
var import_json53 = __toESM(require_lib(), 1);
var fs7 = __toESM(require("node:fs"), 1);
var NonNullableOptions = class {
  constructor(filePath) {
    this.interfaces = [];
    var _a, _b;
    if (filePath === void 0) {
      return;
    }
    this.interfaces = (_b = (_a = import_json53.default.parse(fs7.readFileSync(filePath).toString())) == null ? void 0 : _a.nonNullable) != null ? _b : [];
  }
  isNonNullableParameter(iface, method, parameter) {
    return this.isNonNullable(iface, method, parameter);
  }
  isNonNullableReturnType(iface, method) {
    return this.isNonNullable(iface, method, `returnType`);
  }
  isNonNullable(iface, method, type) {
    var _a, _b, _c, _d;
    return ((_d = (_c = (_b = (_a = this.interfaces.find((it) => it.name === iface)) == null ? void 0 : _a.methods) == null ? void 0 : _b.find((it) => it.name === method)) == null ? void 0 : _c.types) == null ? void 0 : _d.find((it) => it === type)) !== void 0;
  }
};

// src/options/CodeFragmentOptions.ts
var import_json54 = __toESM(require_lib(), 1);
var fs8 = __toESM(require("node:fs"), 1);
var CodeFragmentOptions = class {
  constructor(filePath) {
    this.fragments = [];
    var _a;
    if (filePath === void 0) {
      return;
    }
    this.fragments = (_a = import_json54.default.parse(fs8.readFileSync(filePath).toString()).fragments) != null ? _a : [];
  }
  getCodeFragment(name) {
    var _a;
    return (_a = this.fragments.find((it) => it.interface === name)) == null ? void 0 : _a.methods;
  }
};

// src/options/ExtraParameters.ts
var import_json55 = __toESM(require_lib(), 1);
var fs9 = __toESM(require("node:fs"), 1);
var ExtraParameter = class {
  constructor(param) {
    this.param = param;
  }
  get name() {
    return this.param.name;
  }
  get getter() {
    return this.param.getter;
  }
  get setter() {
    return this.param.setter;
  }
  get optional() {
    var _a;
    return (_a = this.param.optional) != null ? _a : true;
  }
};
var ExtraParameters = class {
  constructor(filePath) {
    this.parameters = /* @__PURE__ */ new Map();
    var _a, _b;
    if (filePath === void 0) {
      return;
    }
    const parameters = (_b = (_a = import_json55.default.parse(fs9.readFileSync(filePath).toString())) == null ? void 0 : _a.parameters) != null ? _b : [];
    for (const param of parameters) {
      if ("parameters" in param) {
        this.parameters.set(
          param.interface,
          param.parameters.map((p) => new ExtraParameter(p))
        );
      }
    }
  }
  hasParameters(iface) {
    return this.parameters.has(iface);
  }
  getParameters(iface) {
    var _a;
    return (_a = this.parameters.get(iface)) != null ? _a : [];
  }
};

// src/options/Aliases.ts
var import_json56 = __toESM(require_lib(), 1);
var fs10 = __toESM(require("node:fs"), 1);
var Aliases = class {
  constructor(filePath) {
    this.classes = [];
    this.functions = [];
    var _a, _b, _c;
    if (filePath === void 0) {
      return;
    }
    const tmp = (_a = import_json56.default.parse(fs10.readFileSync(filePath).toString())) == null ? void 0 : _a.globalAliases;
    this.classes = (_b = tmp == null ? void 0 : tmp.classes) != null ? _b : [];
    this.functions = (_c = tmp == null ? void 0 : tmp.functions) != null ? _c : [];
  }
};

// src/main.ts
var pandaSdkIdlFilePath = `ohos_arm64/include/tools/es2panda/generated/es2panda_lib/es2panda_lib.idl`;
function main() {
  const options = cliOptions();
  new DynamicEmitter(
    options.outputDir,
    options.pandaSdkPath,
    parseIDLFile(
      path6.join(
        options.pandaSdkPath,
        pandaSdkIdlFilePath
      )
    ),
    new Config(
      new IgnoreOptions(options.optionsFile),
      new NonNullableOptions(options.optionsFile),
      new IrHackOptions(options.optionsFile),
      new CodeFragmentOptions(options.optionsFile),
      new ExtraParameters(options.optionsFile),
      new Aliases(options.optionsFile)
    ),
    options.debug
  ).emit();
  gCoverage.dump();
}
main();
//# sourceMappingURL=cli.cjs.map
