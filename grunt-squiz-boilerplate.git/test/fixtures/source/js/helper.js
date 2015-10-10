if (!Handlebars && typeof(require) === 'function') {
    var Handlebars = require('handlebars');
}

Handlebars.registerHelper('Test', function(data) {
    return 'Hello World';
});