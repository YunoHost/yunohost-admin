# YunoHost Web Admin

This is a JavaScript client to the YunoHost [moulinette API](https://github.com/YunoHost/yunohost).


### Hack

On a YunoHost instance, the web admin files are located on `/usr/share/yunohost/admin`. In order to fetch the latest development version and hack it, you will roughly have to:

```bash
# Fetch sources
cd /usr/share/yunohost/
mv admin admin.back
git clone https://github.com/YunoHost/yunohost-admin
ln -s /usr/share/yunohost/yunohost-admin/src admin

# Install Gulp
apt-get install nodejs nodejs-legacy npm -y
cd admin
npm install
node_modules/.bin/gulp build
```

You are now ready to modify the interface. Do not hesitate to run `node_modules/.bin/gulp watch` when you modify `.js` and `.css` files, since they need to be rebuilt.

**Note:** The `.ms` - moustache - files are cached by the browser. You have to reach them manually every time you change them. (e.g. go to https://example.com/yunohost/admin/views/domain/domain_list.ms)
