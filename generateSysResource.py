#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os
import argparse


class SysResource:
    def __init__(self):
        self.records = {}
        self.json_records = None

    def read_json_file(self, json_file):
        with open(os.path.join(json_file), 'r') as fp:
            self.json_records = json.load(fp)["record"]

    def process_ids(self):
        for item in self.json_records:
            if ("flags" in item) and item["flags"].find("private") > -1:
                continue

            item_type = item["type"]
            if item_type != "color" \
                and item_type != "float" \
                and item_type != "media" \
                and item_type != "string" \
                and item_type != "plural":
                continue

            item_name = item["name"]
            item_id = item["order"] + 0x7000000
            if item_type not in self.records:
                self.records[item_type] = dict()
            self.records[item_type][item_name] = item_id

    def write_to_file(self, js_file):
        context = "module.exports.sys = {\n"
        for (item_type, dataset) in self.records.items():
            context += "    " + item_type + ": {\n"
            for (res_name, res_id) in dataset.items():
                context += "        " + res_name + ": " + str(res_id) + ",\n"
            # 移除最后一个多余的","
            context = context[:-2] + "\n"
            context += "    },\n"
        # 移除最后一个多余的","
        context = context[:-2] + "\n"
        context += "}\n"
        with open(js_file, 'w+') as fp:
            fp.write(context)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-json', help='input path to id_defined.json')
    parser.add_argument('--output-js', help='output path to sysResource.js')
    options = parser.parse_args()

    processor = SysResource()
    processor.read_json_file(options.input_json)
    processor.process_ids()
    processor.write_to_file(options.output_js)

