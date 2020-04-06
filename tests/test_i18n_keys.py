# -*- coding: utf-8 -*-

import os
import re
import glob
import json
import yaml
import subprocess

###############################################################################
#   Find used keys in python code                                             #
###############################################################################


def find_expected_string_keys():

    # Try to find :
    #    y18n.t("foo" +)   # (the real key is a concatenation of 'foo' with something else)
    #    y18n.t("foo") or y18n.t('foo', ...) # actual full key
    js_p1 = re.compile(r'y18n\.t\(\s*[\"\'](\w+)[\"\']\s*[\,\)]')
    js_p2 = re.compile(r'y18n\.t\(\s*[\"\'](\w+)[\"\']\s*\+')

    js_files = glob.glob("../src/js/yunohost/controllers/*.js")
    js_files.extend(glob.glob("../src/js/yunohost/*.js"))

    for js_file in js_files:
        content = open(js_file).read()
        for m in js_p1.findall(content):
            yield m
        for m in js_p2.findall(content):
            yield m

    # In views we have stuff like {{t 'foo' arg}}
    views_p1 = re.compile(r'{{t\s*[\"\'](\w+)[\"\']')
    # Somes are inside {{ (t 'foo')))
    views_p2 = re.compile(r'\(t\s*[\"\'](\w+)[\"\']\)')
    views_p3 = re.compile(r't \(concat\s*[\"\'](\w+)[\"\']')
    views_p4 = re.compile(r'data-y18n=[\"\'](\w+)[\"\']')

    view_files = glob.glob("../src/*.html")
    view_files.extend(glob.glob("../src/views/*.ms"))
    view_files.extend(glob.glob("../src/views/*/*.ms"))

    for view_file in view_files:
        content = open(view_file).read()
        for m in views_p1.findall(content):
            yield m
        for m in views_p2.findall(content):
            yield m
        for m in views_p3.findall(content):
            yield m
        for m in views_p4.findall(content):
            yield m

    # App maintenance state
    for state in ['maintained', 'orphaned', 'request_adoption', 'request_help','unmaintained']:
        yield state
        yield state + "_details"

    # Service states
    for state in ['active', 'disabled', 'enabled', 'inactive']:
        yield state

    yield "confirm_cert_"


###############################################################################
#   Load en locale json keys                                                  #
###############################################################################


def keys_defined_for_en():
    return json.loads(open("../src/locales/en.json").read()).keys()

###############################################################################
#   Compare keys used and keys defined                                        #
###############################################################################


expected_string_keys = set(find_expected_string_keys())
keys_defined = set(keys_defined_for_en())

def test_undefined_i18n_keys():
    undefined_keys = expected_string_keys.difference(keys_defined)
    undefined_keys = sorted(undefined_keys)

    undefined_keys = [k for k in undefined_keys if not k.endswith("_")]

    return undefined_keys

    if undefined_keys:
        raise Exception("Those i18n keys should be defined in en.json:\n"
                        "    - " + "\n    - ".join(undefined_keys))


def test_unused_i18n_keys():

    unused_keys = keys_defined.difference(expected_string_keys)
    unused_keys = sorted(unused_keys)

    partial_match = [k for k in unused_keys if any(k.startswith(m) for m in expected_string_keys if m.endswith("_")) ]

    unused_keys_2 = []
    for k in unused_keys:
        if not any(k.startswith(m) for m in expected_string_keys if m.endswith("_")):
            unused_keys_2.append(k)

    return unused_keys_2

    if unused_keys:
        raise Exception("Those i18n keys appears unused:\n"
                        "    - " + "\n    - ".join(unused_keys))


print("--------- undefined")
print()
print(test_undefined_i18n_keys())
print("--------- unused")
print()
print(test_unused_i18n_keys())
