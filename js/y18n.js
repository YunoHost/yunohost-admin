;(function(y18n){
    "use strict";

    // Default options
    var defaultOptions = {
        defaultLocale: "en",
        locale: "en",
        placeholder: /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm,
        translations: {},
    }

    /**
     * Initialization
     */
    y18n.init = function() {
        // Merge options with defaults.
        for (var key in defaultOptions) {
            y18n[key] = (typeof y18n[key] !== 'undefined') ? y18n[key] : defaultOptions[key];
        }
    }
    y18n.init();


    /**
     * Translation
     */
    y18n.translate = function(key, options) {
        options = options || {'locale' : y18n.locale};
        options.locale = options.locale || y18n.locale;

        // Get translation
        var translation = this.lookup(key, options);

        // Translation fallback
        if ((typeof translation === 'undefined' || translation === key) && options.locale !== y18n.defaultLocale) {
            options.locale = y18n.defaultLocale;
            return this.translate(key, options);
        }

        // Variables remplacement
        return (translation) ? translation.printf(options) : key;
    }

    y18n.lookup = function(key, options) {
        // Default locale
        if (typeof options.locale === 'undefined') {
            options.locale = y18n.locale;
        }

        // Get translation string
        if (typeof y18n.translations[options.locale] !== 'undefined') {
            if (typeof y18n.translations[options.locale][key] !== 'undefined') {
                return y18n.translations[options.locale][key];
            }
        }
    }

    // Save some typing
    y18n.t = y18n.translate;

})(typeof(exports) === 'undefined' ? (this.y18n || (this.y18n = {})) : exports);

// http://monocleglobe.wordpress.com/2010/01/12/everybody-needs-a-little-printf-in-their-javascript/
String.prototype.printf = function (obj) {
  var useArguments = false;
  var _arguments = arguments;
  var i = -1;
  if (typeof _arguments[0] == "string") {
    useArguments = true;
  }
  if (obj instanceof Array || useArguments) {
    return this.replace(/\%s/g,
    function (a, b) {
      i++;
      if (useArguments) {
        if (typeof _arguments[i] == 'string') {
          return _arguments[i];
        }
        else {
          throw new Error("Arguments element is an invalid type");
        }
      }
      return obj[i];
    });
  }
  else {
    return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = obj[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  }
};
