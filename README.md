# YunoHost Admin

JS client for YunoHost API

**Please report issues here** (no registration needed):    
https://dev.yunohost.org/projects/yunohost/issues


## Installation

This client is a part of the YunoHost projet, and can not be installed
directly. Please visit [YunoHost website](https://yunohost.org) for
more information.

## Contributing

Feel free to improve the plugin and send us a pull request.

We use gulp to compile Less files and minify the JavaScript.
Assuming [nodejs](http://nodejs.org/) is installed, you can run a
build with:

```sh
cd src
npm install
npm install -g bower
bower install
npm install -g gulp
gulp build
```
Alternatively you can pas the `--dev` option to gulp which improve building
speed by bypassing compression tasks.

On a YunoHost instance, the web admin files are located at 
`/usr/share/yunohost/admin`.

**Note:** The `.ms` - moustache - files are cached by the browser. You have to
reach them manually some times you modify them. (e.g. go to
https://example.com/yunohost/admin/views/domain/domain_list.ms)



## Dependencies

* Bootstrap 3.3.6
* Font-Awesome 4.5.0
* Handlebars 1.3.0
* Sammy 0.7.6
* Jquery-Cookie 2.1.0
