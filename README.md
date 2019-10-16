# YunoHost Admin

[YunoHost](https://yunohost.org) administration web interface (JS client for the API).

This client is a part of the YunoHost project, and can not be installed directly. Please visit the YunoHost website for [installation instructions](https://yunohost.org/install).

## Bug tracker

Please report issues on the [YunoHost bugtracker](https://github.com/YunoHost/issues).

## Translate

[![Translation status](https://translate.yunohost.org/widgets/yunohost/-/287x66-white.png)](https://translate.yunohost.org/engage/yunohost/?utm_source=widget)

## Contributing

Feel free to improve the plugin and send a pull request.

`gulp` is used to compile Less files and minify the JavaScript. Assuming [nodejs](http://nodejs.org/) is installed, you can install dependencies and run a build with:

```sh
cd src
npm install
npm run build
```

Alternatively you can run `npm run build-dev`, which improves building speed by bypassing compression tasks.

On a YunoHost instance, the web admin files are located at `/usr/share/yunohost/admin`.

**Note:** The `.ms` - moustache - files are cached by the browser. You have to
reach them manually, and sometimes you modify them. (e.g. go to
https://example.com/yunohost/admin/views/domain/domain_list.ms)

## Dependencies

* Bootstrap 3.3.6
* Font-Awesome 4.5.0
* Handlebars 1.3.0
* Sammy 0.7.6
* Jquery-Cookie 2.1.0
