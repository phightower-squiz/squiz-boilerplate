(function($){
    'use strict';

    <% if (jqueryPlugin) { %>// Sample of how you might invoke your jQuery Plugin
    $('.<%= cssName %>').<%= pluginName %>({
        optionOne: '...',
        optionTwo: '...'
    });<% } %>
}(jQuery))