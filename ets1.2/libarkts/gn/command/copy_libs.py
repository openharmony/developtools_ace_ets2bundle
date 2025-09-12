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
import shutil
import subprocess
import sys

def get_compiler_name(os_name, cpu_name):
    if (os_name == 'mingw' and cpu_name == 'x86_64'):
        return 'mingw_x86_64'
    return 'clang_x64'

def library_ext(os_name, cpu_name):
    if (os_name == 'mingw' and cpu_name == 'x86_64'):
        return 'dll'
    return 'node'


def copy_files(source_path, dest_path, is_file=False, throw_if_error=True):
    if not os.path.exists(source_path):
        if throw_if_error:
            raise Exception(f"The path '{source_path}' does not exist.")
        else:
            print(f"The path '{source_path}' does not exist.")
        return

    try:
        if is_file:
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy(source_path, dest_path)
        else:
            shutil.copytree(source_path, dest_path, dirs_exist_ok=True,
                symlinks=True)
    except Exception as err:
        raise Exception("Copy files failed. Error: " + str(err)) from err


def run_cmd(cmd, execution_path=None):
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                           stdin=subprocess.PIPE,
                           stderr=subprocess.PIPE,
                           cwd=execution_path)
    stdout, stderr = proc.communicate(timeout=1000)
    if proc.returncode != 0:
        raise Exception(stderr.decode())



def copy_output(options):

    compiler = get_compiler_name(options.current_os, options.current_cpu)
    library_extention = library_ext(options.current_os, options.current_cpu)

    from_path = options.root_out_dir
    to_path = options.output_path

    head_dir, tail_dir = os.path.split(from_path)
    if (tail_dir == compiler):
        from_path = head_dir

    if os.path.exists(to_path):
        shutil.rmtree(to_path)

    copy_files(os.path.join(options.source_path, 'lib'),
               os.path.join(to_path, 'lib'))
    
    copy_files(os.path.join(from_path, f'{compiler}/libes2panda.{library_extention}'),
               os.path.join(to_path, 'build/native/es2panda.node'), True)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source_path', help='path to build system source')
    parser.add_argument('--output_path', help='path to output')
    parser.add_argument('--root_out_dir', help='path to root out')
    parser.add_argument('--current-os', help='current OS')
    parser.add_argument('--current-cpu', help='current CPU')

    options = parser.parse_args()
    return options


def main():
    options = parse_args()
    copy_output(options)


if __name__ == '__main__':
    sys.exit(main())