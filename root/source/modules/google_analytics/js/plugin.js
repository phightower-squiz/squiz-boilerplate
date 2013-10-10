// Google Analytics Click tracking
// Inspire By: http://www.blastam.com/blog/index.php/2013/03/how-to-track-downloads-in-google-analytics-v2/
// @author abarnes @ Squiz Australia
/*global _gaq:false, location:false*/
(function($, _gaq, undefined) {
    if ($ === undefined) {
        return false;
    }//end if

    // Any file types that should be tracked
    // This is a basic list and should be extended for any file types that need
    // to be tracked.
    var extensions = [
        'zip', 'tar', 'tar.gz', 'gz', 'zip', 'rar',
        'txt', 'xl.*', 'pp.*', 'dot', 'doc.*', 'pdf',
        'mov', 'avi', 'mp.*', 'wmv', 'wma', 'fl.*', 'wav',
        'srt', 'sub', 'js',
        'xslt',
        'jpeg', 'jpg', 'gif', 'png', 'svg',
        'exe', 'dmg', '.*box'];

    $(document).ready(function(){
        var fileReg = new RegExp("\\.(" + extensions.join('|') + ')$', 'i');
        var domainReg = new RegExp('//(' + location.host.replace('.','\\.') + ')/?', 'i');
        var protocolReg = new RegExp('^([a-z]+)\\:', 'i');

        // Delegate a click event to track
        $('body').on('click', 'a', function(e) {
            var $el           = $(this);
            var href          = (typeof($el.attr('href')) !== undefined) ? $el.attr('href') :"";
            var track         = true;

            // Remove any query strings from the url
            if (/\?/.test(href)) {
                href = href.split('?').shift();
            }//end if

            // Remove any anchors appearing after the first character
            if (/(.+)#/.test(href)) {
                href = href.split('#').shift();
            }//end if

            var fileMatch     = fileReg.exec(href);
            var domainMatch   = domainReg.exec(href);
            var protocolMatch = protocolReg.exec(href);

            // Handle missing host names by failing domainMatch
            if (location.host === '') {
                domainMatch = null;
            }//end if

            // Event data to send to GA
            var gaEvent = {
                category:        '',
                label:           '',
                non_interactive: false
            };

            if (protocolMatch !== null) {
                var protocol = protocolMatch.pop();
                switch (protocol) {
                    case 'mailto':
                        gaEvent.category = 'email';
                        gaEvent.label    = href.replace(/^mailto\:/i, '');
                    break;
                    case 'tel':
                        gaEvent.category = 'telephone';
                        gaEvent.label    = href.replace(/^tel\:/i, '');
                    break;
                    case 'http':
                    case 'https':
                    case 'ftp':
                        // External link clicks
                        if (domainMatch === null && fileMatch === null) {
                            gaEvent.category = 'external';
                            gaEvent.non_interactive = true;
                            gaEvent.label    = $el.attr('href');
                        } else if (fileMatch !== null) {
                            gaEvent.category = 'download';
                            gaEvent.label    = fileMatch.pop();
                        } else {
                            track = false;
                        }//end if
                    break;
                    default:
                        track = false;
                    break;
                }//end switch
            } else if (href.slice(0,1) === '#') {
                track = false;
            } else if (fileMatch !== null) {
                gaEvent.category = 'download';
                gaEvent.label    = fileMatch.pop();
            } else {
                track = false;
            }//end if

            if (track) {
                _gaq.push([
                    '_trackEvent',
                    gaEvent.category.toLowerCase(), // Category
                    'click', // Action
                    gaEvent.label.toLowerCase(), // Label
                    0, // Value
                    gaEvent.non_interactive // Non interactive flag
                ]);
            }//end if
        });
     });
}(jQuery, _gaq));