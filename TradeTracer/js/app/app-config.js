define(['lodash'],
function (_) {
    "use strict";

    function Settings(options) {

        // This initializes a new hash on purpose, to avoid adding parameters to
        // config.js without providing sane defaults
        var settings = {};
        _.each(Settings.defaults, function (value, key) {
            settings[key] = typeof options !== 'undefined' && typeof options[key] !== 'undefined' ? options[key] : Settings.defaults[key];
        });

        return settings;
    };
    Settings.defaults = {
        elasticsearch: "",
        esClient: {
            //host: { host: window.location.hostname, port: window.location.port},
            hosts: [
                'localhost:9200'
            ]
        },
        pluginUrlPrefix: "http://localhost:9200/",
        //pluginUrlPrefix: "/",
    };

    return new Settings();
});
