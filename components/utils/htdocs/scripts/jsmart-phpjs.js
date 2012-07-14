/* 
 * More info at: http://phpjs.org
 * 
 * This is version: 3.26
 * php.js is copyright 2011 Kevin van Zonneveld.
 * 
 * Portions copyright Brett Zamir (http://brett-zamir.me), Kevin van Zonneveld
 * (http://kevin.vanzonneveld.net), Onno Marsman, Theriault, Michael White
 * (http://getsprink.com), Waldo Malqui Silva, Paulo Freitas, Jack, Jonas
 * Raoni Soares Silva (http://www.jsfromhell.com), Philip Peterson, Legaev
 * Andrey, Ates Goral (http://magnetiq.com), Alex, Ratheous, Martijn Wieringa,
 * Rafał Kukawski (http://blog.kukawski.pl), lmeyrick
 * (https://sourceforge.net/projects/bcmath-js/), Nate, Philippe Baumann,
 * Enrique Gonzalez, Webtoolkit.info (http://www.webtoolkit.info/), Carlos R.
 * L. Rodrigues (http://www.jsfromhell.com), Ash Searle
 * (http://hexmen.com/blog/), Jani Hartikainen, travc, Ole Vrijenhoek,
 * Erkekjetter, Michael Grier, Rafał Kukawski (http://kukawski.pl), Johnny
 * Mast (http://www.phpvrouwen.nl), T.Wild, d3x,
 * http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript,
 * Rafał Kukawski (http://blog.kukawski.pl/), stag019, pilus, WebDevHobo
 * (http://webdevhobo.blogspot.com/), marrtins, GeekFG
 * (http://geekfg.blogspot.com), Andrea Giammarchi
 * (http://webreflection.blogspot.com), Arpad Ray (mailto:arpad@php.net),
 * gorthaur, Paul Smith, Tim de Koning (http://www.kingsquare.nl), Joris, Oleg
 * Eremeev, Steve Hilder, majak, gettimeofday, KELAN, Josh Fraser
 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
 * Marc Palau, Kevin van Zonneveld (http://kevin.vanzonneveld.net/), Martin
 * (http://www.erlenwiese.de/), Breaking Par Consulting Inc
 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
 * Chris, Mirek Slugen, saulius, Alfonso Jimenez
 * (http://www.alfonsojimenez.com), Diplom@t (http://difane.com/), felix,
 * Mailfaker (http://www.weedem.fr/), Tyler Akins (http://rumkin.com), Caio
 * Ariede (http://caioariede.com), Robin, Kankrelune
 * (http://www.webfaktory.info/), Karol Kowalski, Imgen Tata
 * (http://www.myipdf.com/), mdsjack (http://www.mdsjack.bo.it), Dreamer,
 * Felix Geisendoerfer (http://www.debuggable.com/felix), Lars Fischer, AJ,
 * David, Aman Gupta, Michael White, Public Domain
 * (http://www.json.org/json2.js), Steven Levithan
 * (http://blog.stevenlevithan.com), Sakimori, Pellentesque Malesuada,
 * Thunder.m, Dj (http://phpjs.org/functions/htmlentities:425#comment_134018),
 * Steve Clay, David James, Francois, class_exists, nobbler, T. Wild, Itsacon
 * (http://www.itsacon.net/), date, Ole Vrijenhoek (http://www.nervous.nl/),
 * Fox, Raphael (Ao RUDLER), Marco, noname, Mateusz "loonquawl" Zalega, Frank
 * Forte, Arno, ger, mktime, john (http://www.jd-tech.net), Nick Kolosov
 * (http://sammy.ru), marc andreu, Scott Cariss, Douglas Crockford
 * (http://javascript.crockford.com), madipta, Slawomir Kaniecki,
 * ReverseSyntax, Nathan, Alex Wilson, kenneth, Bayron Guevara, Adam Wallner
 * (http://web2.bitbaro.hu/), paulo kuong, jmweb, Lincoln Ramsay, djmix,
 * Pyerre, Jon Hohle, Thiago Mata (http://thiagomata.blog.com), lmeyrick
 * (https://sourceforge.net/projects/bcmath-js/this.), Linuxworld, duncan,
 * Gilbert, Sanjoy Roy, Shingo, sankai, Oskar Larsson Högfeldt
 * (http://oskar-lh.name/), Denny Wardhana, 0m3r, Everlasto, Subhasis Deb,
 * josh, jd, Pier Paolo Ramon (http://www.mastersoup.com/), P, merabi, Soren
 * Hansen, Eugene Bulkin (http://doubleaw.com/), Der Simon
 * (http://innerdom.sourceforge.net/), echo is bad, Ozh, XoraX
 * (http://www.xorax.info), EdorFaus, JB, J A R, Marc Jansen, Francesco, LH,
 * Stoyan Kyosev (http://www.svest.org/), nord_ua, omid
 * (http://phpjs.org/functions/380:380#comment_137122), Brad Touesnard, MeEtc
 * (http://yass.meetcweb.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Olivier Louvignes
 * (http://mg-crea.com/), T0bsn, Tim Wiel, Bryan Elliott, Jalal Berrami,
 * Martin, JT, David Randall, Thomas Beaucourt (http://www.webapp.fr), taith,
 * vlado houba, Pierre-Luc Paour, Kristof Coomans (SCK-CEN Belgian Nucleair
 * Research Centre), Martin Pool, Kirk Strobeck, Rick Waldron, Brant Messenger
 * (http://www.brantmessenger.com/), Devan Penner-Woelk, Saulo Vallory, Wagner
 * B. Soares, Artur Tchernychev, Valentina De Rosa, Jason Wong
 * (http://carrot.org/), Christoph, Daniel Esteban, strftime, Mick@el, rezna,
 * Simon Willison (http://simonwillison.net), Anton Ongson, Gabriel Paderni,
 * Marco van Oort, penutbutterjelly, Philipp Lenssen, Bjorn Roesbeke
 * (http://www.bjornroesbeke.be/), Bug?, Eric Nagel, Tomasz Wesolowski,
 * Evertjan Garretsen, Bobby Drake, Blues (http://tech.bluesmoon.info/), Luke
 * Godfrey, Pul, uestla, Alan C, Ulrich, Rafal Kukawski, Yves Sucaet,
 * sowberry, Norman "zEh" Fuchs, hitwork, Zahlii, johnrembo, Nick Callen,
 * Steven Levithan (stevenlevithan.com), ejsanders, Scott Baker, Brian Tafoya
 * (http://www.premasolutions.com/), Philippe Jausions
 * (http://pear.php.net/user/jausions), Aidan Lister
 * (http://aidanlister.com/), Rob, e-mike, HKM, ChaosNo1, metjay, strcasecmp,
 * strcmp, Taras Bogach, jpfle, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), DxGx, kilops, Orlando,
 * dptr1988, Le Torbi, James (http://www.james-bell.co.uk/), Pedro Tainha
 * (http://www.pedrotainha.com), James, Arnout Kazemier
 * (http://www.3rd-Eden.com), Chris McMacken, gabriel paderni, Yannoo,
 * FGFEmperor, baris ozdil, Tod Gentille, Greg Frazier, jakes, 3D-GRAF, Allan
 * Jensen (http://www.winternet.no), Howard Yeend, Benjamin Lupton, davook,
 * daniel airton wermann (http://wermann.com.br), Atli Þór, Maximusya, Ryan
 * W Tenney (http://ryan.10e.us), Alexander M Beedie, fearphage
 * (http://http/my.opera.com/fearphage/), Nathan Sepulveda, Victor, Matteo,
 * Billy, stensi, Cord, Manish, T.J. Leahy, Riddler
 * (http://www.frontierwebdev.com/), Rafał Kukawski, FremyCompany, Matt
 * Bradley, Tim de Koning, Luis Salazar (http://www.freaky-media.com/), Diogo
 * Resende, Rival, Andrej Pavlovic, Garagoth, Le Torbi
 * (http://www.letorbi.de/), Dino, Josep Sanz (http://www.ws3.es/), rem,
 * Russell Walker (http://www.nbill.co.uk/), Jamie Beck
 * (http://www.terabit.ca/), setcookie, Michael, YUI Library:
 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Blues at
 * http://hacks.bluesmoon.info/strftime/strftime.js, Ben
 * (http://benblume.co.uk/), DtTvB
 * (http://dt.in.th/2008-09-16.string-length-in-bytes.html), Andreas, William,
 * meo, incidence, Cagri Ekin, Amirouche, Amir Habibi
 * (http://www.residence-mixte.com/), Luke Smith (http://lucassmith.name),
 * Kheang Hok Chin (http://www.distantia.ca/), Jay Klehr, Lorenzo Pisani,
 * Tony, Yen-Wei Liu, Greenseed, mk.keck, Leslie Hoare, dude, booeyOH, Ben
 * Bryan
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ 


// jslint.com configuration options. See: http://wiki.github.com/kvz/phpjs/jslint-options
/* global window */
/* jslint adsafe: false, bitwise: false, browser: false, cap: false, css: false, debug: false, devel: false, eqeqeq: true, evil: false, forin: false, fragment: false, immed: true, indent: 4, laxbreak: false, maxerr: 100, maxlen: 80, newcap: true, nomen: false, on: true, onevar: false, passfail: false, plusplus: false, regexp: false, rhino: false, safe: false, sidebar: false, strict: false, sub: false, undef: true, white: false, widget: false */
(function() {
    if(typeof(this.PHP_JS) === "undefined"){ 
        // This references at top of namespace allows PHP_JS class to
        // be included directly inside an object (unusual use)
        var PHP_JS = function(cfgObj) {
            if(!(this instanceof PHP_JS)) {
                // Allow invokation without "new"
                return new PHP_JS(cfgObj);
            }
            // Allow user to pass in window, e.g., if in context
            // without access to window but need to pass in, like
            // a Mozilla JavaScript module
            this.window = cfgObj && cfgObj.window ? cfgObj.window : window;

            // Allow user to pass in object representing initial ini values
            this.php_js = {};
            this.php_js.ini = {};
            if (cfgObj) {
                for (var ini in cfgObj.ini) {
                    this.php_js.ini[ini] = {};
                    this.php_js.ini[ini].local_value = cfgObj.ini[ini]; // changeable by ini_set()
                    this.php_js.ini[ini].global_value = cfgObj.ini[ini]; // usable by ini_restore()
                }
            }
        };
    }
    // Private static holder across all instances; we usually use
    // instance variables, but this is necessary for a very few
    // like require_once()/include_once()
    var php_js_shared = {};

    PHP_JS.prototype = {
        constructor: PHP_JS,
        bin2hex: function (s) {
            // Converts the binary representation of data to hex  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/bin2hex
            // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Onno Marsman
            // +   bugfixed by: Linuxworld
            // *     example 1: $P.bin2hex('Kev');
            // *     returns 1: '4b6576'
            // *     example 2: $P.bin2hex(String.fromCharCode(0x00));
            // *     returns 2: '00'
            var i, f = 0,
                a = [];
        
            s += '';
            f = s.length;
        
            for (i = 0; i < f; i++) {
                a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/, "0$1");
            }
        
            return a.join('');
        }
        ,
        get_html_translation_table: function (table, quote_style) {
            // Returns the internal translation table used by htmlspecialchars and htmlentities  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/get_html_translation_table
            // +   original by: Philip Peterson
            // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: noname
            // +   bugfixed by: Alex
            // +   bugfixed by: Marco
            // +   bugfixed by: madipta
            // +   improved by: KELAN
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Frank Forte
            // +   bugfixed by: T.Wild
            // +      input by: Ratheous
            // %          note: It has been decided that we're not going to add global
            // %          note: dependencies to php.js, meaning the constants are not
            // %          note: real constants, but strings instead. Integers are also supported if someone
            // %          note: chooses to create the constants themselves.
            // *     example 1: $P.get_html_translation_table('HTML_SPECIALCHARS');
            // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
            var entities = {},
                hash_map = {},
                decimal;
            var constMappingTable = {},
                constMappingQuoteStyle = {};
            var useTable = {},
                useQuoteStyle = {};
        
            // Translate arguments
            constMappingTable[0] = 'HTML_SPECIALCHARS';
            constMappingTable[1] = 'HTML_ENTITIES';
            constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
            constMappingQuoteStyle[2] = 'ENT_COMPAT';
            constMappingQuoteStyle[3] = 'ENT_QUOTES';
        
            useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
            useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';
        
            if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
                throw new Error("Table: " + useTable + ' not supported');
                // return false;
            }
        
            entities['38'] = '&amp;';
            if (useTable === 'HTML_ENTITIES') {
                entities['160'] = '&nbsp;';
                entities['161'] = '&iexcl;';
                entities['162'] = '&cent;';
                entities['163'] = '&pound;';
                entities['164'] = '&curren;';
                entities['165'] = '&yen;';
                entities['166'] = '&brvbar;';
                entities['167'] = '&sect;';
                entities['168'] = '&uml;';
                entities['169'] = '&copy;';
                entities['170'] = '&ordf;';
                entities['171'] = '&laquo;';
                entities['172'] = '&not;';
                entities['173'] = '&shy;';
                entities['174'] = '&reg;';
                entities['175'] = '&macr;';
                entities['176'] = '&deg;';
                entities['177'] = '&plusmn;';
                entities['178'] = '&sup2;';
                entities['179'] = '&sup3;';
                entities['180'] = '&acute;';
                entities['181'] = '&micro;';
                entities['182'] = '&para;';
                entities['183'] = '&middot;';
                entities['184'] = '&cedil;';
                entities['185'] = '&sup1;';
                entities['186'] = '&ordm;';
                entities['187'] = '&raquo;';
                entities['188'] = '&frac14;';
                entities['189'] = '&frac12;';
                entities['190'] = '&frac34;';
                entities['191'] = '&iquest;';
                entities['192'] = '&Agrave;';
                entities['193'] = '&Aacute;';
                entities['194'] = '&Acirc;';
                entities['195'] = '&Atilde;';
                entities['196'] = '&Auml;';
                entities['197'] = '&Aring;';
                entities['198'] = '&AElig;';
                entities['199'] = '&Ccedil;';
                entities['200'] = '&Egrave;';
                entities['201'] = '&Eacute;';
                entities['202'] = '&Ecirc;';
                entities['203'] = '&Euml;';
                entities['204'] = '&Igrave;';
                entities['205'] = '&Iacute;';
                entities['206'] = '&Icirc;';
                entities['207'] = '&Iuml;';
                entities['208'] = '&ETH;';
                entities['209'] = '&Ntilde;';
                entities['210'] = '&Ograve;';
                entities['211'] = '&Oacute;';
                entities['212'] = '&Ocirc;';
                entities['213'] = '&Otilde;';
                entities['214'] = '&Ouml;';
                entities['215'] = '&times;';
                entities['216'] = '&Oslash;';
                entities['217'] = '&Ugrave;';
                entities['218'] = '&Uacute;';
                entities['219'] = '&Ucirc;';
                entities['220'] = '&Uuml;';
                entities['221'] = '&Yacute;';
                entities['222'] = '&THORN;';
                entities['223'] = '&szlig;';
                entities['224'] = '&agrave;';
                entities['225'] = '&aacute;';
                entities['226'] = '&acirc;';
                entities['227'] = '&atilde;';
                entities['228'] = '&auml;';
                entities['229'] = '&aring;';
                entities['230'] = '&aelig;';
                entities['231'] = '&ccedil;';
                entities['232'] = '&egrave;';
                entities['233'] = '&eacute;';
                entities['234'] = '&ecirc;';
                entities['235'] = '&euml;';
                entities['236'] = '&igrave;';
                entities['237'] = '&iacute;';
                entities['238'] = '&icirc;';
                entities['239'] = '&iuml;';
                entities['240'] = '&eth;';
                entities['241'] = '&ntilde;';
                entities['242'] = '&ograve;';
                entities['243'] = '&oacute;';
                entities['244'] = '&ocirc;';
                entities['245'] = '&otilde;';
                entities['246'] = '&ouml;';
                entities['247'] = '&divide;';
                entities['248'] = '&oslash;';
                entities['249'] = '&ugrave;';
                entities['250'] = '&uacute;';
                entities['251'] = '&ucirc;';
                entities['252'] = '&uuml;';
                entities['253'] = '&yacute;';
                entities['254'] = '&thorn;';
                entities['255'] = '&yuml;';
            }
        
            if (useQuoteStyle !== 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle === 'ENT_QUOTES') {
                entities['39'] = '&#39;';
            }
            entities['60'] = '&lt;';
            entities['62'] = '&gt;';
        
        
            // ascii decimals to real symbols
            for (decimal in entities) {
                if (entities.hasOwnProperty(decimal)) {
                    hash_map[String.fromCharCode(decimal)] = entities[decimal];
                }
            }
        
            return hash_map;
        }
        ,
        getenv: function (varname) {
            // Get the value of an environment variable  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/getenv
            // +   original by: Brett Zamir (http://brett-zamir.me)
            // %        note 1: We are not using $_ENV as in PHP, you could define
            // %        note 1: "$_ENV = this.php_js.ENV;" and get/set accordingly
            // %        note 2: Returns e.g. 'en-US' when set global this.php_js.ENV is set
            // %        note 3: Uses global: php_js to store environment info
            // *     example 1: $P.getenv('LC_ALL');
            // *     returns 1: false
            if (!this.php_js || !this.php_js.ENV || !this.php_js.ENV[varname]) {
                return false;
            }
        
            return this.php_js.ENV[varname];
        }
        ,
        htmlentities: function (string, quote_style, charset, double_encode) {
            // Convert all applicable characters to HTML entities  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/htmlentities
            // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   improved by: nobbler
            // +    tweaked by: Jack
            // +   bugfixed by: Onno Marsman
            // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Ratheous
            // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
            // +   improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
            // -    depends on: get_html_translation_table
            // *     example 1: $P.htmlentities('Kevin & van Zonneveld');
            // *     returns 1: 'Kevin &amp; van Zonneveld'
            // *     example 2: $P.htmlentities("foo'bar","ENT_QUOTES");
            // *     returns 2: 'foo&#039;bar'
            var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
                symbol = '';
            string = string == null ? '' : string + '';
        
            if (!hash_map) {
                return false;
            }
            
            if (quote_style && quote_style === 'ENT_QUOTES') {
                hash_map["'"] = '&#039;';
            }
            
            if (!!double_encode || double_encode == null) {
                for (symbol in hash_map) {
                    if (hash_map.hasOwnProperty(symbol)) {
                        string = string.split(symbol).join(hash_map[symbol]);
                    }
                }
            } else {
                string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
                    for (symbol in hash_map) {
                        if (hash_map.hasOwnProperty(symbol)) {
                            text = text.split(symbol).join(hash_map[symbol]);
                        }
                    }
                    
                    return text + entity;
                });
            }
        
            return string;
        }
        ,
        htmlspecialchars: function (string, quote_style, charset, double_encode) {
            // Convert special characters to HTML entities  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/htmlspecialchars
            // +   original by: Mirek Slugen
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Nathan
            // +   bugfixed by: Arno
            // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Ratheous
            // +      input by: Mailfaker (http://www.weedem.fr/)
            // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
            // +      input by: felix
            // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
            // %        note 1: charset argument not supported
            // *     example 1: $P.htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
            // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
            // *     example 2: $P.htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
            // *     returns 2: 'ab"c&#039;d'
            // *     example 3: $P.htmlspecialchars("my "&entity;" is still here", null, null, false);
            // *     returns 3: 'my &quot;&entity;&quot; is still here'
            var optTemp = 0,
                i = 0,
                noquotes = false;
            if (typeof quote_style === 'undefined' || quote_style === null) {
                quote_style = 2;
            }
            string = string.toString();
            if (double_encode !== false) { // Put this first to avoid double-encoding
                string = string.replace(/&/g, '&amp;');
            }
            string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
            var OPTS = {
                'ENT_NOQUOTES': 0,
                'ENT_HTML_QUOTE_SINGLE': 1,
                'ENT_HTML_QUOTE_DOUBLE': 2,
                'ENT_COMPAT': 2,
                'ENT_QUOTES': 3,
                'ENT_IGNORE': 4
            };
            if (quote_style === 0) {
                noquotes = true;
            }
            if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
                quote_style = [].concat(quote_style);
                for (i = 0; i < quote_style.length; i++) {
                    // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
                    if (OPTS[quote_style[i]] === 0) {
                        noquotes = true;
                    }
                    else if (OPTS[quote_style[i]]) {
                        optTemp = optTemp | OPTS[quote_style[i]];
                    }
                }
                quote_style = optTemp;
            }
            if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
                string = string.replace(/'/g, '&#039;');
            }
            if (!noquotes) {
                string = string.replace(/"/g, '&quot;');
            }
        
            return string;
        }
        ,
        htmlspecialchars_decode: function (string, quote_style) {
            // Convert special HTML entities back to characters  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/htmlspecialchars_decode
            // +   original by: Mirek Slugen
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Mateusz "loonquawl" Zalega
            // +      input by: ReverseSyntax
            // +      input by: Slawomir Kaniecki
            // +      input by: Scott Cariss
            // +      input by: Francois
            // +   bugfixed by: Onno Marsman
            // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Ratheous
            // +      input by: Mailfaker (http://www.weedem.fr/)
            // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
            // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
            // *     example 1: $P.htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
            // *     returns 1: '<p>this -> &quot;</p>'
            // *     example 2: $P.htmlspecialchars_decode("&amp;quot;");
            // *     returns 2: '&quot;'
            var optTemp = 0,
                i = 0,
                noquotes = false;
            if (typeof quote_style === 'undefined') {
                quote_style = 2;
            }
            string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            var OPTS = {
                'ENT_NOQUOTES': 0,
                'ENT_HTML_QUOTE_SINGLE': 1,
                'ENT_HTML_QUOTE_DOUBLE': 2,
                'ENT_COMPAT': 2,
                'ENT_QUOTES': 3,
                'ENT_IGNORE': 4
            };
            if (quote_style === 0) {
                noquotes = true;
            }
            if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
                quote_style = [].concat(quote_style);
                for (i = 0; i < quote_style.length; i++) {
                    // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
                    if (OPTS[quote_style[i]] === 0) {
                        noquotes = true;
                    } else if (OPTS[quote_style[i]]) {
                        optTemp = optTemp | OPTS[quote_style[i]];
                    }
                }
                quote_style = optTemp;
            }
            if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
                string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
                // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
            }
            if (!noquotes) {
                string = string.replace(/&quot;/g, '"');
            }
            // Put this in last place to avoid escape being double-decoded
            string = string.replace(/&amp;/g, '&');
        
            return string;
        }
        ,
        ord: function (string) {
            // Returns the codepoint value of a character  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/ord
            // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Onno Marsman
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +   input by: incidence
            // *     example 1: $P.ord('K');
            // *     returns 1: 75
            // *     example 2: $P.ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
            // *     returns 2: 65536
            var str = string + '',
                code = str.charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
                var hi = code;
                if (str.length === 1) {
                    return code; // This is just a high surrogate with no following low surrogate, so we return its value;
                    // we could also throw an error as it is not a complete character, but someone may want to know
                }
                var low = str.charCodeAt(1);
                return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
            }
            if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
                return code; // This is just a low surrogate with no preceding high surrogate, so we return its value;
                // we could also throw an error as it is not a complete character, but someone may want to know
            }
            return code;
        }
        ,
        rawurldecode: function (str) {
            // Decodes URL-encodes string  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/rawurldecode
            // +   original by: Brett Zamir (http://brett-zamir.me)
            // +      input by: travc
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: Ratheous
            // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
            // %        note 1: Please be aware that this function expects to decode from UTF-8 encoded strings, as found on
            // %        note 1: pages served as UTF-8
            // *     example 1: $P.rawurldecode('Kevin+van+Zonneveld%21');
            // *     returns 1: 'Kevin+van+Zonneveld!'
            // *     example 2: $P.rawurldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
            // *     returns 2: 'http://kevin.vanzonneveld.net/'
            // *     example 3: $P.rawurldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
            // *     returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
            // *     example 4: $P.rawurldecode('-22%97bc%2Fbc');
            // *     returns 4: '-22—bc/bc'
            return decodeURIComponent(str + '');
        }
        ,
        rawurlencode: function (str) {
            // URL-encodes string  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/rawurlencode
            // +   original by: Brett Zamir (http://brett-zamir.me)
            // +      input by: travc
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: Michael Grier
            // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Ratheous
            // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Joris
            // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
            // %          note 1: This reflects PHP 5.3/6.0+ behavior
            // %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
            // %        note 2: pages served as UTF-8
            // *     example 1: $P.rawurlencode('Kevin van Zonneveld!');
            // *     returns 1: 'Kevin%20van%20Zonneveld%21'
            // *     example 2: $P.rawurlencode('http://kevin.vanzonneveld.net/');
            // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
            // *     example 3: $P.rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
            // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
            str = (str + '').toString();
        
            // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
            // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
            return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
            replace(/\)/g, '%29').replace(/\*/g, '%2A');
        }
        ,
        setlocale: function (category, locale) {
            // Set locale information  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/setlocale
            // +   original by: Brett Zamir (http://brett-zamir.me)
            // +   derived from: Blues at http://hacks.bluesmoon.info/strftime/strftime.js
            // +   derived from: YUI Library: http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html
            // -    depends on: getenv
            // %          note 1: Is extensible, but currently only implements locales en,
            // %          note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
            // %          note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
            // %          note 2: Uses global: php_js to store locale info
            // %          note 3: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
            // *     example 1: $P.setlocale('LC_ALL', 'en_US');
            // *     returns 1: 'en_US'
            var categ = '',
                cats = [],
                i = 0,
                d = this.window.document;
        
            // BEGIN STATIC
            var _copy = function _copy(orig) {
                if (orig instanceof RegExp) {
                    return new RegExp(orig);
                } else if (orig instanceof Date) {
                    return new Date(orig);
                }
                var newObj = {};
                for (var i in orig) {
                    if (typeof orig[i] === 'object') {
                        newObj[i] = _copy(orig[i]);
                    } else {
                        newObj[i] = orig[i];
                    }
                }
                return newObj;
            };
        
            // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
            // See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
            // https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
            // not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
            // The function name indicates the number of plural forms (nplural)
            // Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
            // including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
            // and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
            var _nplurals1 = function (n) { // e.g., Japanese
                return 0;
            };
            var _nplurals2a = function (n) { // e.g., English
                return n !== 1 ? 1 : 0;
            };
            var _nplurals2b = function (n) { // e.g., French
                return n > 1 ? 1 : 0;
            };
            var _nplurals2c = function (n) { // e.g., Icelandic (MDC)
                return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
            };
            var _nplurals3a = function (n) { // e.g., Latvian (MDC has a different order from gettext)
                return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
            };
            var _nplurals3b = function (n) { // e.g., Scottish Gaelic
                return n === 1 ? 0 : n === 2 ? 1 : 2;
            };
            var _nplurals3c = function (n) { // e.g., Romanian
                return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
            };
            var _nplurals3d = function (n) { // e.g., Lithuanian (MDC has a different order from gettext)
                return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            };
            var _nplurals3e = function (n) { // e.g., Croatian
                return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            };
            var _nplurals3f = function (n) { // e.g., Slovak
                return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
            };
            var _nplurals3g = function (n) { // e.g., Polish
                return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            };
            var _nplurals3h = function (n) { // e.g., Macedonian (MDC)
                return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
            };
            var _nplurals4a = function (n) { // e.g., Slovenian
                return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
            };
            var _nplurals4b = function (n) { // e.g., Maltese (MDC)
                return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
            };
            var _nplurals5 = function (n) { // e.g., Irish Gaeilge (MDC)
                return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
            };
            var _nplurals6 = function (n) { // e.g., Arabic (MDC) - Per MDC puts 0 as last group
                return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <= 99 ? 3 : 4;
            };
            // END STATIC
            // BEGIN REDUNDANT
            this.php_js = this.php_js || {};
        
            var phpjs = this.php_js;
        
            // Reconcile Windows vs. *nix locale names?
            // Allow different priority orders of languages, esp. if implement gettext as in
            //     LANGUAGE env. var.? (e.g., show German if French is not available)
            if (!phpjs.locales) {
                // Can add to the locales
                phpjs.locales = {};
        
                phpjs.locales.en = {
                    'LC_COLLATE': // For strcoll
        
        
                    function (str1, str2) { // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
                        return (str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1);
                    },
                    'LC_CTYPE': { // Need to change any of these for English as opposed to C?
                        an: /^[A-Za-z\d]+$/g,
                        al: /^[A-Za-z]+$/g,
                        ct: /^[\u0000-\u001F\u007F]+$/g,
                        dg: /^[\d]+$/g,
                        gr: /^[\u0021-\u007E]+$/g,
                        lw: /^[a-z]+$/g,
                        pr: /^[\u0020-\u007E]+$/g,
                        pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
                        sp: /^[\f\n\r\t\v ]+$/g,
                        up: /^[A-Z]+$/g,
                        xd: /^[A-Fa-f\d]+$/g,
                        CODESET: 'UTF-8',
                        // Used by sql_regcase
                        lower: 'abcdefghijklmnopqrstuvwxyz',
                        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                    },
                    'LC_TIME': { // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
                        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        // ABDAY_
                        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        // DAY_
                        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        // ABMON_
                        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        // MON_
                        c: '%a %d %b %Y %r %Z',
                        // D_T_FMT // changed %T to %r per results
                        p: ['AM', 'PM'],
                        // AM_STR/PM_STR
                        P: ['am', 'pm'],
                        // Not available in nl_langinfo()
                        r: '%I:%M:%S %p',
                        // T_FMT_AMPM (Fixed for all locales)
                        x: '%m/%d/%Y',
                        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
                        X: '%r',
                        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
                        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
                        alt_digits: '',
                        // e.g., ordinal
                        ERA: '',
                        ERA_YEAR: '',
                        ERA_D_T_FMT: '',
                        ERA_D_FMT: '',
                        ERA_T_FMT: ''
                    },
                    // Assuming distinction between numeric and monetary is thus:
                    // See below for C locale
                    'LC_MONETARY': { // Based on Windows "english" (English_United States.1252) locale
                        int_curr_symbol: 'USD',
                        currency_symbol: '$',
                        mon_decimal_point: '.',
                        mon_thousands_sep: ',',
                        mon_grouping: [3],
                        // use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
                        positive_sign: '',
                        negative_sign: '-',
                        int_frac_digits: 2,
                        // Fractional digits only for money defaults?
                        frac_digits: 2,
                        p_cs_precedes: 1,
                        // positive currency symbol follows value = 0; precedes value = 1
                        p_sep_by_space: 0,
                        // 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
                        n_cs_precedes: 1,
                        // see p_cs_precedes
                        n_sep_by_space: 0,
                        // see p_sep_by_space
                        p_sign_posn: 3,
                        // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
                        n_sign_posn: 0 // see p_sign_posn
                    },
                    'LC_NUMERIC': { // Based on Windows "english" (English_United States.1252) locale
                        decimal_point: '.',
                        thousands_sep: ',',
                        grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
                    },
                    'LC_MESSAGES': {
                        YESEXPR: '^[yY].*',
                        NOEXPR: '^[nN].*',
                        YESSTR: '',
                        NOSTR: ''
                    },
                    nplurals: _nplurals2a
                };
                phpjs.locales.en_US = _copy(phpjs.locales.en);
                phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
                phpjs.locales.en_US.LC_TIME.x = '%D';
                phpjs.locales.en_US.LC_TIME.X = '%r';
                // The following are based on *nix settings
                phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
                phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
                phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
                phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
                phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
                phpjs.locales.en_US.LC_NUMERIC.grouping = [];
        
                phpjs.locales.en_GB = _copy(phpjs.locales.en);
                phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';
        
                phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
                phpjs.locales.C = _copy(phpjs.locales.en); // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
                phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
                phpjs.locales.C.LC_MONETARY = {
                    int_curr_symbol: '',
                    currency_symbol: '',
                    mon_decimal_point: '',
                    mon_thousands_sep: '',
                    mon_grouping: [],
                    p_cs_precedes: 127,
                    p_sep_by_space: 127,
                    n_cs_precedes: 127,
                    n_sep_by_space: 127,
                    p_sign_posn: 127,
                    n_sign_posn: 127,
                    positive_sign: '',
                    negative_sign: '',
                    int_frac_digits: 127,
                    frac_digits: 127
                };
                phpjs.locales.C.LC_NUMERIC = {
                    decimal_point: '.',
                    thousands_sep: '',
                    grouping: []
                };
                phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'; // D_T_FMT
                phpjs.locales.C.LC_TIME.x = '%m/%d/%y'; // D_FMT
                phpjs.locales.C.LC_TIME.X = '%H:%M:%S'; // T_FMT
                phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
                phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';
        
                phpjs.locales.fr = _copy(phpjs.locales.en);
                phpjs.locales.fr.nplurals = _nplurals2b;
                phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
                phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
                phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct', 'nov', 'd\u00E9c'];
                phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre'];
                phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
                phpjs.locales.fr.LC_TIME.p = ['', ''];
                phpjs.locales.fr.LC_TIME.P = ['', ''];
                phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
                phpjs.locales.fr.LC_TIME.X = '%T';
        
                phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
                phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
            }
            if (!phpjs.locale) {
                phpjs.locale = 'en_US';
                var NS_XHTML = 'http://www.w3.org/1999/xhtml';
                var NS_XML = 'http://www.w3.org/XML/1998/namespace';
                if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
                    if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
                        phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
                    } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) { // XHTML 1.0 only
                        phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
                    }
                } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
                    phpjs.locale = d.getElementsByTagName('html')[0].lang;
                }
            }
            phpjs.locale = phpjs.locale.replace('-', '_'); // PHP-style
            // Fix locale if declared locale hasn't been defined
            if (!(phpjs.locale in phpjs.locales)) {
                if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
                    phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
                }
            }
        
            if (!phpjs.localeCategories) {
                phpjs.localeCategories = {
                    'LC_COLLATE': phpjs.locale,
                    // for string comparison, see strcoll()
                    'LC_CTYPE': phpjs.locale,
                    // for character classification and conversion, for example strtoupper()
                    'LC_MONETARY': phpjs.locale,
                    // for localeconv()
                    'LC_NUMERIC': phpjs.locale,
                    // for decimal separator (See also localeconv())
                    'LC_TIME': phpjs.locale,
                    // for date and time formatting with strftime()
                    'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
                };
            }
            // END REDUNDANT
            if (locale === null || locale === '') {
                locale = this.getenv(category) || this.getenv('LANG');
            } else if (Object.prototype.toString.call(locale) === '[object Array]') {
                for (i = 0; i < locale.length; i++) {
                    if (!(locale[i] in this.php_js.locales)) {
                        if (i === locale.length - 1) {
                            return false; // none found
                        }
                        continue;
                    }
                    locale = locale[i];
                    break;
                }
            }
        
            // Just get the locale
            if (locale === '0' || locale === 0) {
                if (category === 'LC_ALL') {
                    for (categ in this.php_js.localeCategories) {
                        cats.push(categ + '=' + this.php_js.localeCategories[categ]); // Add ".UTF-8" or allow ".@latint", etc. to the end?
                    }
                    return cats.join(';');
                }
                return this.php_js.localeCategories[category];
            }
        
            if (!(locale in this.php_js.locales)) {
                return false; // Locale not found
            }
        
            // Set and get locale
            if (category === 'LC_ALL') {
                for (categ in this.php_js.localeCategories) {
                    this.php_js.localeCategories[categ] = locale;
                }
            } else {
                this.php_js.localeCategories[category] = locale;
            }
            return locale;
        }
        ,
        sprintf: function () {
            // Return a formatted string  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/sprintf
            // +   original by: Ash Searle (http://hexmen.com/blog/)
            // + namespaced by: Michael White (http://getsprink.com)
            // +    tweaked by: Jack
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: Paulo Freitas
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // *     example 1: $P.sprintf("%01.2f", 123.1);
            // *     returns 1: 123.10
            // *     example 2: $P.sprintf("[%10s]", 'monkey');
            // *     returns 2: '[    monkey]'
            // *     example 3: $P.sprintf("[%'#10s]", 'monkey');
            // *     returns 3: '[####monkey]'
            var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
            var a = arguments,
                i = 0,
                format = a[i++];
        
            // pad()
            var pad = function (str, len, chr, leftJustify) {
                if (!chr) {
                    chr = ' ';
                }
                var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
                return leftJustify ? str + padding : padding + str;
            };
        
            // justify()
            var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
                var diff = minWidth - value.length;
                if (diff > 0) {
                    if (leftJustify || !zeroPad) {
                        value = pad(value, minWidth, customPadChar, leftJustify);
                    } else {
                        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                    }
                }
                return value;
            };
        
            // formatBaseX()
            var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
                // Note: casts negative numbers to positive ones
                var number = value >>> 0;
                prefix = prefix && number && {
                    '2': '0b',
                    '8': '0',
                    '16': '0x'
                }[base] || '';
                value = prefix + pad(number.toString(base), precision || 0, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            };
        
            // formatString()
            var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
                if (precision != null) {
                    value = value.slice(0, precision);
                }
                return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
            };
        
            // doFormat()
            var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
                var number;
                var prefix;
                var method;
                var textTransform;
                var value;
        
                if (substring == '%%') {
                    return '%';
                }
        
                // parse flags
                var leftJustify = false,
                    positivePrefix = '',
                    zeroPad = false,
                    prefixBaseX = false,
                    customPadChar = ' ';
                var flagsl = flags.length;
                for (var j = 0; flags && j < flagsl; j++) {
                    switch (flags.charAt(j)) {
                    case ' ':
                        positivePrefix = ' ';
                        break;
                    case '+':
                        positivePrefix = '+';
                        break;
                    case '-':
                        leftJustify = true;
                        break;
                    case "'":
                        customPadChar = flags.charAt(j + 1);
                        break;
                    case '0':
                        zeroPad = true;
                        break;
                    case '#':
                        prefixBaseX = true;
                        break;
                    }
                }
        
                // parameters may be null, undefined, empty-string or real valued
                // we want to ignore null, undefined and empty-string values
                if (!minWidth) {
                    minWidth = 0;
                } else if (minWidth == '*') {
                    minWidth = +a[i++];
                } else if (minWidth.charAt(0) == '*') {
                    minWidth = +a[minWidth.slice(1, -1)];
                } else {
                    minWidth = +minWidth;
                }
        
                // Note: undocumented perl feature:
                if (minWidth < 0) {
                    minWidth = -minWidth;
                    leftJustify = true;
                }
        
                if (!isFinite(minWidth)) {
                    throw new Error('sprintf: (minimum-)width must be finite');
                }
        
                if (!precision) {
                    precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
                } else if (precision == '*') {
                    precision = +a[i++];
                } else if (precision.charAt(0) == '*') {
                    precision = +a[precision.slice(1, -1)];
                } else {
                    precision = +precision;
                }
        
                // grab value using valueIndex if required?
                value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
        
                switch (type) {
                case 's':
                    return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                case 'c':
                    return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b':
                    return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o':
                    return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                case 'u':
                    return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd':
                    number = (+value) | 0;
                    prefix = number < 0 ? '-' : positivePrefix;
                    value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad);
                case 'e':
                case 'E':
                case 'f':
                case 'F':
                case 'g':
                case 'G':
                    number = +value;
                    prefix = number < 0 ? '-' : positivePrefix;
                    method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                default:
                    return substring;
                }
            };
        
            return format.replace(regex, doFormat);
        }
        ,
        strftime: function (fmt, timestamp) {
            // Format a local time/date according to locale settings  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/strftime
            // +      original by: Blues (http://tech.bluesmoon.info/)
            // + reimplemented by: Brett Zamir (http://brett-zamir.me)
            // +   input by: Alex
            // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // -       depends on: setlocale
            // %        note 1: Uses global: php_js to store locale info
            // *        example 1: $P.strftime("%A", 1062462400); // Return value will depend on date and locale
            // *        returns 1: 'Tuesday'
            // BEGIN REDUNDANT
            this.php_js = this.php_js || {};
            this.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
            // END REDUNDANT
            var phpjs = this.php_js;
        
            // BEGIN STATIC
            var _xPad = function (x, pad, r) {
                if (typeof r === 'undefined') {
                    r = 10;
                }
                for (; parseInt(x, 10) < r && r > 1; r /= 10) {
                    x = pad.toString() + x;
                }
                return x.toString();
            };
        
            var locale = phpjs.localeCategories.LC_TIME;
            var locales = phpjs.locales;
            var lc_time = locales[locale].LC_TIME;
        
            var _formats = {
                a: function (d) {
                    return lc_time.a[d.getDay()];
                },
                A: function (d) {
                    return lc_time.A[d.getDay()];
                },
                b: function (d) {
                    return lc_time.b[d.getMonth()];
                },
                B: function (d) {
                    return lc_time.B[d.getMonth()];
                },
                C: function (d) {
                    return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
                },
                d: ['getDate', '0'],
                e: ['getDate', ' '],
                g: function (d) {
                    return _xPad(parseInt(this.G(d) / 100, 10), 0);
                },
                G: function (d) {
                    var y = d.getFullYear();
                    var V = parseInt(_formats.V(d), 10);
                    var W = parseInt(_formats.W(d), 10);
        
                    if (W > V) {
                        y++;
                    } else if (W === 0 && V >= 52) {
                        y--;
                    }
        
                    return y;
                },
                H: ['getHours', '0'],
                I: function (d) {
                    var I = d.getHours() % 12;
                    return _xPad(I === 0 ? 12 : I, 0);
                },
                j: function (d) {
                    var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
                    ms += d.getTimezoneOffset() * 60000; // Line differs from Yahoo implementation which would be equivalent to replacing it here with:
                    // ms = new Date('' + d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' GMT') - ms;
                    var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
                    return _xPad(doy, 0, 100);
                },
                k: ['getHours', '0'],
                // not in PHP, but implemented here (as in Yahoo)
                l: function (d) {
                    var l = d.getHours() % 12;
                    return _xPad(l === 0 ? 12 : l, ' ');
                },
                m: function (d) {
                    return _xPad(d.getMonth() + 1, 0);
                },
                M: ['getMinutes', '0'],
                p: function (d) {
                    return lc_time.p[d.getHours() >= 12 ? 1 : 0];
                },
                P: function (d) {
                    return lc_time.P[d.getHours() >= 12 ? 1 : 0];
                },
                s: function (d) { // Yahoo uses return parseInt(d.getTime()/1000, 10);
                    return Date.parse(d) / 1000;
                },
                S: ['getSeconds', '0'],
                u: function (d) {
                    var dow = d.getDay();
                    return ((dow === 0) ? 7 : dow);
                },
                U: function (d) {
                    var doy = parseInt(_formats.j(d), 10);
                    var rdow = 6 - d.getDay();
                    var woy = parseInt((doy + rdow) / 7, 10);
                    return _xPad(woy, 0);
                },
                V: function (d) {
                    var woy = parseInt(_formats.W(d), 10);
                    var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
                    // First week is 01 and not 00 as in the case of %U and %W,
                    // so we add 1 to the final result except if day 1 of the year
                    // is a Monday (then %W returns 01).
                    // We also need to subtract 1 if the day 1 of the year is
                    // Friday-Sunday, so the resulting equation becomes:
                    var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
                    if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
                        idow = 1;
                    } else if (idow === 0) {
                        idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
                    }
                    return _xPad(idow, 0);
                },
                w: 'getDay',
                W: function (d) {
                    var doy = parseInt(_formats.j(d), 10);
                    var rdow = 7 - _formats.u(d);
                    var woy = parseInt((doy + rdow) / 7, 10);
                    return _xPad(woy, 0, 10);
                },
                y: function (d) {
                    return _xPad(d.getFullYear() % 100, 0);
                },
                Y: 'getFullYear',
                z: function (d) {
                    var o = d.getTimezoneOffset();
                    var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
                    var M = _xPad(o % 60, 0);
                    return (o > 0 ? '-' : '+') + H + M;
                },
                Z: function (d) {
                    return d.toString().replace(/^.*\(([^)]+)\)$/, '$1');
        /*
                    // Yahoo's: Better?
                    var tz = d.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, '$2').replace(/[a-z ]/g, '');
                    if(tz.length > 4) {
                        tz = Dt.formats.z(d);
                    }
                    return tz;
                    */
                },
                '%': function (d) {
                    return '%';
                }
            };
            // END STATIC
        /* Fix: Locale alternatives are supported though not documented in PHP; see http://linux.die.net/man/3/strptime
        Ec
        EC
        Ex
        EX
        Ey
        EY
        Od or Oe
        OH
        OI
        Om
        OM
        OS
        OU
        Ow
        OW
        Oy
        */
        
            var _date = ((typeof(timestamp) == 'undefined') ? new Date() : // Not provided
            (typeof(timestamp) == 'object') ? new Date(timestamp) : // Javascript Date()
            new Date(timestamp * 1000) // PHP API expects UNIX timestamp (auto-convert to int)
            );
        
            var _aggregates = {
                c: 'locale',
                D: '%m/%d/%y',
                F: '%y-%m-%d',
                h: '%b',
                n: '\n',
                r: 'locale',
                R: '%H:%M',
                t: '\t',
                T: '%H:%M:%S',
                x: 'locale',
                X: 'locale'
            };
        
        
            // First replace aggregates (run in a loop because an agg may be made up of other aggs)
            while (fmt.match(/%[cDFhnrRtTxX]/)) {
                fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
                    var f = _aggregates[m1];
                    return (f === 'locale' ? lc_time[m1] : f);
                });
            }
        
            // Now replace formats - we need a closure so that the date object gets passed through
            var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
                var f = _formats[m1];
                if (typeof f === 'string') {
                    return _date[f]();
                } else if (typeof f === 'function') {
                    return f(_date);
                } else if (typeof f === 'object' && typeof(f[0]) === 'string') {
                    return _xPad(_date[f[0]](), f[1]);
                } else { // Shouldn't reach here
                    return m1;
                }
            });
            return str;
        }
        ,
        strtotime: function (str, now) {
            // Convert string representation of date and time to a timestamp  
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/strtotime
            // +   original by: Caio Ariede (http://caioariede.com)
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: David
            // +   improved by: Caio Ariede (http://caioariede.com)
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Wagner B. Soares
            // +   bugfixed by: Artur Tchernychev
            // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
            // *     example 1: $P.strtotime('+1 day', 1129633200);
            // *     returns 1: 1129719600
            // *     example 2: $P.strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
            // *     returns 2: 1130425202
            // *     example 3: $P.strtotime('last month', 1129633200);
            // *     returns 3: 1127041200
            // *     example 4: $P.strtotime('2009-05-04 08:30:00');
            // *     returns 4: 1241418600
            var i, match, s, strTmp = '',
                parse = '';
        
            strTmp = str;
            strTmp = strTmp.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
            strTmp = strTmp.replace(/[\t\r\n]/g, ''); // unecessary chars
            if (strTmp == 'now') {
                return (new Date()).getTime() / 1000; // Return seconds, not milli-seconds
            } else if (!isNaN(parse = Date.parse(strTmp))) {
                return (parse / 1000);
            } else if (now) {
                now = new Date(now * 1000); // Accept PHP-style seconds
            } else {
                now = new Date();
            }
        
            strTmp = strTmp.toLowerCase();
        
            var __is = {
                day: {
                    'sun': 0,
                    'mon': 1,
                    'tue': 2,
                    'wed': 3,
                    'thu': 4,
                    'fri': 5,
                    'sat': 6
                },
                mon: {
                    'jan': 0,
                    'feb': 1,
                    'mar': 2,
                    'apr': 3,
                    'may': 4,
                    'jun': 5,
                    'jul': 6,
                    'aug': 7,
                    'sep': 8,
                    'oct': 9,
                    'nov': 10,
                    'dec': 11
                }
            };
        
            var process = function (m) {
                var ago = (m[2] && m[2] == 'ago');
                var num = (num = m[0] == 'last' ? -1 : 1) * (ago ? -1 : 1);
        
                switch (m[0]) {
                case 'last':
                case 'next':
                    switch (m[1].substring(0, 3)) {
                    case 'yea':
                        now.setFullYear(now.getFullYear() + num);
                        break;
                    case 'mon':
                        now.setMonth(now.getMonth() + num);
                        break;
                    case 'wee':
                        now.setDate(now.getDate() + (num * 7));
                        break;
                    case 'day':
                        now.setDate(now.getDate() + num);
                        break;
                    case 'hou':
                        now.setHours(now.getHours() + num);
                        break;
                    case 'min':
                        now.setMinutes(now.getMinutes() + num);
                        break;
                    case 'sec':
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    default:
                        var day;
                        if (typeof(day = __is.day[m[1].substring(0, 3)]) != 'undefined') {
                            var diff = day - now.getDay();
                            if (diff == 0) {
                                diff = 7 * num;
                            } else if (diff > 0) {
                                if (m[0] == 'last') {
                                    diff -= 7;
                                }
                            } else {
                                if (m[0] == 'next') {
                                    diff += 7;
                                }
                            }
                            now.setDate(now.getDate() + diff);
                        }
                    }
                    break;
        
                default:
                    if (/\d+/.test(m[0])) {
                        num *= parseInt(m[0], 10);
        
                        switch (m[1].substring(0, 3)) {
                        case 'yea':
                            now.setFullYear(now.getFullYear() + num);
                            break;
                        case 'mon':
                            now.setMonth(now.getMonth() + num);
                            break;
                        case 'wee':
                            now.setDate(now.getDate() + (num * 7));
                            break;
                        case 'day':
                            now.setDate(now.getDate() + num);
                            break;
                        case 'hou':
                            now.setHours(now.getHours() + num);
                            break;
                        case 'min':
                            now.setMinutes(now.getMinutes() + num);
                            break;
                        case 'sec':
                            now.setSeconds(now.getSeconds() + num);
                            break;
                        }
                    } else {
                        return false;
                    }
                    break;
                }
                return true;
            };
        
            match = strTmp.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
            if (match != null) {
                if (!match[2]) {
                    match[2] = '00:00:00';
                } else if (!match[3]) {
                    match[2] += ':00';
                }
        
                s = match[1].split(/-/g);
        
                for (i in __is.mon) {
                    if (__is.mon[i] == s[1] - 1) {
                        s[1] = i;
                    }
                }
                s[0] = parseInt(s[0], 10);
        
                s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
                return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
            }
        
            var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';
        
            match = strTmp.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
            if (match == null) {
                return false;
            }
        
            for (i = 0; i < match.length; i++) {
                if (!process(match[i].split(' '))) {
                    return false;
                }
            }
        
            return (now.getTime() / 1000);
        },

        empty: function (mixed_var) {
            // !No description available for empty. @php.js developers: Please update the function summary text file.
            // 
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/empty
            // +   original by: Philippe Baumann
            // +      input by: Onno Marsman
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: LH
            // +   improved by: Onno Marsman
            // +   improved by: Francesco
            // +   improved by: Marc Jansen
            // +   input by: Stoyan Kyosev (http://www.svest.org/)
            // *     example 1: $P.empty(null);
            // *     returns 1: true
            // *     example 2: $P.empty(undefined);
            // *     returns 2: true
            // *     example 3: $P.empty([]);
            // *     returns 3: true
            // *     example 4: $P.empty({});
            // *     returns 4: true
            // *     example 5: $P.empty({'aFunc' : function () { alert('humpty'); } });
            // *     returns 5: false
            var key;
        
            if (mixed_var === "" || mixed_var === 0 || mixed_var === "0" || mixed_var === null || mixed_var === false || typeof mixed_var === 'undefined') {
                return true;
            }
        
            if (typeof mixed_var == 'object') {
                for (key in mixed_var) {
                    return false;
                }
                return true;
            }
        
            return false;
        }
    }; // end PHP_JS.prototype

    this.PHP_JS = PHP_JS;
}());
