/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Observed, Track } from "@ohos.arkui.stateManagement"

class Person{
}

enum Status {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

@Observed
class mixed1 {
  @Track numA: number = 33;
  @Track stringA: string = 'AA';
  @Track booleanA: boolean = true;
  @Track arrayA: number[] = [1,2,3];
  @Track objectA: Object = {};
  @Track dateA: Date = new Date('2021-08-08');
  @Track setA: Set<number> = new Set<number>();
  @Track mapA: Map<number, string> = new Map<number, string>();
  @Track unionA: string | undefined = "";
  @Track classA: Person = new Person();
  @Track enumA: Status = Status.NotFound;

  numB: number = 33;
  stringB: string = 'AA';
  booleanB: boolean = true;
  arrayB: number[] = [1,2,3];
  objectB: Object = {};
  dateB: Date = new Date('2021-08-08');
  setB: Set<number> = new Set<number>();
  mapB: Map<number, string> = new Map<number, string>();
  unionB: string | undefined = "";
  classB: Person = new Person();
  enumB: Status = Status.NotFound;
}

@Observed
class mixed2 {
  numA: number = 33;
  stringA: string = 'AA';
  booleanA: boolean = true;
  arrayA: number[] = [1,2,3];
  objectA: Object = {};
  dateA: Date = new Date('2021-08-08');
  setA: Set<number> = new Set<number>();
  mapA: Map<number, string> = new Map<number, string>();
  unionA: string | undefined = "";
  classA: Person = new Person();
  enumA: Status = Status.NotFound;
}

class mixed3 {
  @Track numA: number = 33;
  @Track stringA: string = 'AA';
  @Track booleanA: boolean = true;
  @Track arrayA: number[] = [1,2,3];
  @Track objectA: Object = {};
  @Track dateA: Date = new Date('2021-08-08');
  @Track setA: Set<number> = new Set<number>();
  @Track mapA: Map<number, string> = new Map<number, string>();
  @Track unionA: string | undefined = "";
  @Track classA: Person = new Person();
  @Track enumA: Status = Status.NotFound;
}