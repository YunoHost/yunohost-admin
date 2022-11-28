import os
import glob
import json
from collections import OrderedDict


ROOT_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCALES_FOLDER = os.path.join(ROOT_FOLDER, "app", "src", "i18n", "locales")
LOCALE_FILES = {
    path.split("/")[-1].replace(".json", ""): path
    for path in glob.glob(LOCALES_FOLDER + "/*.json")
}
ALL_LOCALES = set(LOCALE_FILES.keys())


def get_locale_json(locale):
    with open(LOCALE_FILES[locale], "r") as fp:
        return json.load(fp, object_pairs_hook=OrderedDict)


def save_locale_json(locale, data, sort=False):
    with open(LOCALE_FILES[locale], "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, sort_keys=sort, indent=4)
        fp.write("\n")


def get_flatten_keys(d, parent_key=""):
    items = set()

    for k, v in d.items():
        key = f"{parent_key}.{k}" if parent_key else k
        items.add(key)

        if isinstance(v, dict):
            items |= get_flatten_keys(v, key)

    return items


def filter_data(data, stale_keys):
    filtered = OrderedDict()

    for k, v in data.items():
        if k not in stale_keys:
            value = v

            if isinstance(v, OrderedDict):
                nested_stale_keys = [
                    key.replace(f"{k}.", "")
                    for key in stale_keys
                    if key.startswith(f"{k}.")
                ]
                if nested_stale_keys:
                    value = filter_data(v, nested_stale_keys)

            filtered[k] = value

    return filtered


def remove_stale_translations(ref="en", locales=None):
    locales = set(locales) if locales else ALL_LOCALES
    locales.discard(ref)

    ref_data = get_locale_json(ref)
    ref_keys = get_flatten_keys(ref_data)

    for locale in locales:
        data = get_locale_json(locale)
        keys = get_flatten_keys(data)
        stale_keys = sorted(keys - ref_keys)
        filtered_data = filter_data(data, stale_keys)
        save_locale_json(locale, filtered_data)

    # Resave ref file to sort and indent
    save_locale_json(ref, ref_data, sort=True)


if __name__ == "__main__":
    remove_stale_translations()
