/**
 * Google analytics tracking class and object
 */
elation.extend('googleanalytics', function(args) {
  this.GAalerts = Number(args.GAalerts);
  this.trackingcode = args.trackingcode;
  this.cobrand = args.cobrand;
  this.query = args.query;
  this.pagegroup = args.pagegroup;
  this.pagetype = args.pagetype;
  this.status = args.status;
  this.total = args.total;
  this.category = args.category;
  this.subcategory = args.subcategory;
  this.city = args.city;
  this.state = args.state;
  this.country = args.country;
  this.pagenum = args.pagenum;
  this.filters = args.filters;
  this.version = args.version;
  this.store_name = args.store_name;
  this.alpha = args.alpha;
  this.browse_nodename = args.browse_nodename;
  this.browse_nodetype = args.browse_nodetype;
  this.clickoutsource = 0;
  this.myfindspanel = '';
  this.mouseovertype = '';
  this.mouseovereventenable = 1;
  this.pageTracker = _gat._getTracker(this.trackingcode);
  this.pageTracker._setCookieTimeout("172800"); // campaign tracking expiration 2 days

  var self = this;
  var ignoredOrganics=['www.thefind.com', 'thefind', 'thefind.com', 'the find', 'glimpse', 'glimpse.com', 'www.glimpse.com', 'local.thefind.com', 'green.thefind.com', 'ww1.glimpse.com', 'shoptrue.com', 'shoptrue', 'coupons.thefind.com', 'shop.glimpse.com', 'ww1.thefind.com', 'www.shoptrue.com', 'reviews.thefind.com', 'visual.thefind.com', 'prices.thefind.com'];
  $TF.each(ignoredOrganics, function() {self.pageTracker._addIgnoredOrganic(this)});

  var domainName = document.domain.match(/(\.(.+)\.com$)/gi);
  if(domainName == null) {
    domainName = document.domain.match(/(\.(.+)\.co\.uk$)/gi);
  }
  domainName = domainName[0];

  if (this.cobrand=='local' || this.cobrand=='greenshopping' || this.cobrand=='visualbeta' || this.cobrand=='coupons' || this.cobrand=='thefind' || this.cobrand=='thefindww1' || this.cobrand=='reviews' || this.cobrand=='prices') {
    this.pageTracker._setDomainName(domainName); // set to '.thefind.com' or '.dev.thefind.com'
    this.pageTracker._setAllowLinker(true);
    this.pageTracker._setAllowHash(false);
  }else if (this.cobrand=='glimpse' || this.cobrand=='glimpseww1' || this.cobrand=='glimpseshop') {
    this.pageTracker._setDomainName(domainName); //set to '.glimpse.com'
    this.pageTracker._setAllowLinker(true);
    this.pageTracker._setAllowHash(false);
  }else if (this.cobrand=='shoptrue') {
    this.pageTracker._setDomainName(domainName); //set to '.shoptrue.com'
    this.pageTracker._setAllowLinker(true);
    this.pageTracker._setAllowHash(false);
  }else if (this.cobrand=='thefinduk') {
    this.pageTracker._setDomainName(domainName); //set to '.thefind.co.uk'
    this.pageTracker._setAllowLinker(true);
    this.pageTracker._setAllowHash(false);
  }

  // attach event handlers to various static links
  $TF("a.tf_search_item_link.tf_search_item_productimage_link").click(function () {if (!self.clickoutsource) self.clickoutsource = 1}); // product image
  $TF("a.tf_search_item_link.tf_seeit strong img").click(function () {if (!self.clickoutsource) self.clickoutsource = 2}); // merchant logo
  $TF("a.tf_search_item_link.tf_seeit").click(function () {if (!self.clickoutsource) self.clickoutsource = 3}); // VisitSite button
  $TF("a.tf_search_item_link.tf_seeit strong").click(function () {if (!self.clickoutsource) self.clickoutsource = 4}); // intervening blankspace
  $TF(".search_anchor_relatedqueries").each(function(n) {$TF(this).click(function() {self.trackEvent(['search', 'related_search', n+1])})});
  $TF(".search_anchor_hotsearches").each(function(n) {$TF(this).click(function() {self.trackEvent(['links', self.pagetype, 'hot_searches', n+1])})});
  $TF(".tf_info_iphonedownload").click(function() {self.trackEvent(['promo', 'bottom', 'iPhoneApp'])});
  $TF(".tf_user_feedback_link").each(function(n) {$TF(this).click(function() {self.trackEvent(['links', self.pagetype, 'user_feedback', n+1])})});
  $TF(".tf_about_results_link").each(function(n) {$TF(this).click(function() {self.trackEvent(['links', self.pagetype, 'about_these_search_results', n+1])})});
  $TF(".link_icon_discover_same_product").each(function(n) {$TF(this).click(function() {self.trackEvent(['discover', 'same_product', self.category])})});
  $TF(".link_icon_discover_similar_product").each(function(n) {$TF(this).click(function() {self.trackEvent(['discover', 'similar_product', self.category])})});
  $TF(".search_anchor_suggestqueries").each(function(n) {$TF(this).click(function() {self.trackEvent(['links', 'recommendedSearches', this.innerHTML])})});
  $TF("#tf_shoplikefriends_tellmorefriends").click(function() {self.trackEvent(['facebook', 'invite_friends'])});
  $TF("#tf_shoplikefriends_becomefeaturedshopper").click(function() {self.trackEvent(['shoplike', 'become_featured_shopper'])});

  //Links above first searchbox for products, coupons, reviews
  $TF("#tf_search_links_products").click(function() {self.trackEvent(['links', 'theWeb', 'products'])});
  $TF("#tf_search_links_coupons").click(function() {self.trackEvent(['links', 'theWeb', 'coupons'])});
  $TF("#tf_search_links_reviews").click(function() {self.trackEvent(['links', 'theWeb', 'reviews'])});

  //Don't know if the below ever gets fired ... 
  $TF('#tf_middle_bottom_merchantcenter').click(function() {
    self.trackEvent(['merchant_center', self.cobrand, self.pagetype]);
    self.trackEvent(['merchant_center', 'home_retailer', self.cobrand]);
  });

	delete self;

	if (this.GAalerts) {
    $TF('body').append(
      '<div id="ga_tagbox" style="position:fixed;left:0;top:0;border:1px dotted black;padding:5px;background-color:#eef;text-align:left;display:none;z-index:10000"></div>'
    );
    $TF('#ga_tagbox').css('opacity', 0.9).click(function() {$TF(this).css('display', 'none')});
  }

  this.displayTag = function(content) {
    $TF('#ga_tagbox').append(content+'<br \/>').css('display', 'block');
  };

  this.updatePageParameters = function(args) {
    this.pagenum = (args['filter[pagenum]'] || args['page'] || "1");
    this.filters = args['brand']?'1':'0';
    this.filters += args['color']?'1':'0';
    this.filters += Number(args['coupons'])?'1':'0';
    this.filters += Number(args['local'])?'1':'0';
    this.filters += Number(args['green'])?'1':'0';
    this.filters += Number(args['marketplaces'])?'1':'0';
    this.filters += (args['filter[price][min]']||args['filter[price][max]']||args['price'])?'1':'0';
    this.filters += Number(args['sale'])?'1':'0';
    this.filters += args['store']?'1':'0';
    this.filters += args['freeshipping']?'1':'0';
  };

  this.setCustomVar = function(index, name, value, opt_scope) {
    try {
       this.pageTracker._setCustomVar(index, name, value, opt_scope);
       if (this.GAalerts) this.displayTag('setCustomVar(' + index + ', ' + name + ', ' + value + ', ' + opt_scope + ')');
    } catch (err) {
       if (this.GAalerts) this.displayTag("setCustomVar Error: " + err.description);
    }
  };

  this.trackPageViewWrapper = function(pageurl) {
    try {
      this.pageTracker._trackPageview(pageurl);
      if (this.GAalerts) {
        this.displayTag('trackPageview('+pageurl+')');
      }
    } catch (err) {if (this.GAalerts) this.displayTag("trackPageViewWrapper Error: " + err.description)}
  };

  this.trackPageview = function() {
    var status = this.status;
    var total = this.total;
    var pagegroup = this.pagegroup;
    var pagetype = this.pagetype;
    var query = this.query.replace(/&/g, "+");
    var errorPages = {
      'B1':'noresults',
      'B2':'noorganicresults',
      'B3':'noresults',
      'B4':'noresultscurrentmall',
      'B5':'partialresults',
      'S1':'serverexception',
      '404':'error_404'};

    //console.log(this.pagetype);
    //special cases for myfinds and shoplikeme / shoplikefriends
    if(this.pagetype == 'myfinds') {
      return;
    }

    $TF.each(errorPages, function(k,v) {
      if (k==status && (status!='B3' || total=='0')) {
        query = pagetype+"-"+query;
        pagegroup = "error";
        pagetype = v;
      }
    });

    if (this.pagetype=='error_404') this.query = '?page='+document.location.href  + '&from=' + document.referrer;

    //TODO!!: check above format with Srilatha -- does not report properly
    var pageurl = 'virt_'+pagegroup
                + '/'+this.cobrand;

    //console.log(this.pagetype);

    switch (this.pagetype) {
      case 'coupons_index':
        pageurl += '/'+pagetype;
        break;
      case 'coupons_browsemap':
        pageurl += '/'+pagetype;
        pageurl += '/'+this.alpha;
        break;
      case 'coupons_store':
      case 'store':
        pageurl += '/'+pagetype;
        pageurl += '/'+this.store_name;
      	if (document.referrer && document.referrer.search('=') == -1) {
                pageurl += '/?qry='+this.store_name;
              } else {
      	  pageurl += '/?qry='+query;
      	}
        pageurl += '&flt='+this.filters
                + '&pgn='+this.pagenum
                + '&ver='+this.version;
        break;
      case 'coupons_tag':
        pageurl += '/coupons'; // pagetype in GA should be 'coupons'
        pageurl += '/'+this.category
                + '/'+this.subcategory
                + '/?qry='+query
                + '&flt='+this.filters
                + '&pgn='+this.pagenum
                + '&ver='+this.version;
        break;
      case 'merchant-register':
        pageurl += '/upfront/email/';
        break;
      case 'browse_homepage':
        pageurl = "/virt_result"
                + "/glimpse"
                + "/node"
                + "/"+this.browse_nodename
                + "/"+this.browse_nodetype; 
console.log(this);
      break;
      default:
        pageurl += '/'+pagetype;
        pageurl += '/'+this.category
                + '/'+this.subcategory
                + '/?qry='+query
                + '&flt='+this.filters
                + '&pgn='+this.pagenum
                + '&ver='+this.version;
        break;
    }
    if (this.GAalerts) this.displayTag('trackPageview('+pageurl+')');

    try {
      this.pageTracker._trackPageview(pageurl);
    } catch (err) {if (this.GAalerts) this.displayTag("trackPageview Error: "+err.description)}
  };

  this.trackEvent = function(args) {
    switch (args.length) {
      case 2:
        if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+')');
        try {
          this.pageTracker._trackEvent(args[0], args[1]);
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.description)}
        break;
      case 3:
        if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+','+args[2]+')');
        try {
          this.pageTracker._trackEvent(args[0], args[1], args[2]);
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.description)}
        break;
      case 4:
        if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+','+args[2]+','+args[3]+')');
        try {
          this.pageTracker._trackEvent(args[0], args[1], args[2], Number(args[3]));
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.description)}
        break;
    }
  };

  this.trackClickout = function(args) {
    this.trackEvent([args.event[0], args.event[1], args.event[2] + args.event[3]]);
    this.clickoutsource=0;
    this.myfindspanel='';
    var orderID = Math.floor(Math.random()*1000000000000);
    if (this.GAalerts) {
      this.displayTag('addTrans('+orderID+','+args.trans[0]+','+args.trans[1]+',"","",'+this.city+','+this.state+','+this.country+')');
      this.displayTag('addItem('+orderID+','+args.item[0]+','+args.item[1]+','+args.item[2]+','+args.item[3]+','+args.item[4]+')');
    }
    try {
      this.pageTracker._addTrans(orderID, args.trans[0], args.trans[1], "", "", this.city, this.state, this.country);
      this.pageTracker._addItem(orderID, args.item[0], args.item[1], args.item[2], args.item[3], args.item[4]);
      this.pageTracker._trackTrans();
    } catch (err) {if (this.GAalerts) this.displayTag("trackTrans Error: "+err.description)}
  };

  this.trackPrivacySettings = function() {
    var perm = $TF('#user_privacy').val();
    var permTxt = '';

    switch (perm) {
      case '0':
        permTxt = 'everyone';
        break;
      case '1':
        permTxt = 'friendsonly';
        break;
      case '2':
        permTxt = 'justme';
        break;
    }

    if (permTxt) {
      this.trackEvent(['permissions', 'shoplikeme', permTxt]);
    }
  };
});

TFHtmlUtilsGoogleAnalytics = elation.googleanalytics;

/**
 * This is used for something apparently
 */
function TFHtmlUtilsPandoraLog() {
  this.mouseovertype = "";
}

