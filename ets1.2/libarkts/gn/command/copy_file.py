#!/usr/bin/env python
# -*- coding: utf-8 -*-
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

import argparse
import os
import sys
from pathlib import Path

from copy import copy_files


def write_depfile(depfile_abs, output_path, dep_abs, build_dir):
    # Write a depfile so ninja can detect when source-tree outputs are deleted
    # (e.g. by `git clean -fdx`). Paths are converted to relative form using
    # build_dir so they match ninja's working directory. Only files that
    # actually exist are listed; missing files are omitted to avoid spurious
    # rebuilds on configurations that don't produce them.
    if not depfile_abs or not output_path:
        return
    dep_entries = []
    for f in dep_abs or []:
        if os.path.exists(f):
            dep_entries.append(os.path.relpath(f, build_dir))
    depfile = Path(depfile_abs)
    depfile.parent.mkdir(parents=True, exist_ok=True)
    depfile.write_text(f"{output_path}: {' '.join(dep_entries)}\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--depfile", help="path to write a depfile listing source-tree outputs as dependencies")
    parser.add_argument("files", nargs="+", help="srcs... dst (last positional is destination)")
    args = parser.parse_args()

    build_dir = os.getcwd()
    dst = args.files[-1]
    srcs = args.files[:-1]

    for src in srcs:
        copy_files(src, dst, not os.path.isdir(src))

    if args.depfile:
        write_depfile(os.path.abspath(args.depfile), dst,
                      [os.path.abspath(s) for s in srcs], build_dir)


if __name__ == "__main__":
    sys.exit(main())
