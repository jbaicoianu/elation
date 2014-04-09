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
  //this.pageTracker = _gat._getTracker(this.trackingcode);
  //ga('create', this.trackingcode, 'thefind.com');
  ga('create', this.trackingcode, {'allowLinker': true});
  ga('require', 'linker');
  //ga('linker:autoLink', ['destination.com']);
  ga('require', 'ecommerce', 'ecommerce.js');   // Load the ecommerce plug-in.
  //this.pageTracker = ga;
  //this.pageTracker = ga('create', 'UA-6126393-1', 'thefind.com');
  //this.pageTracker._setCookieTimeout("172800"); // campaign tracking expiration 2 days //Can be
  //set from Dashboard

  //Ignored organics can be tracked form the GA Dashboard as per srilatha
  var self = this;
  //var ignoredOrganics=['www.thefind.com', 'thefind', 'thefind.com', 'the find', 'glimpse', 'glimpse.com', 'www.glimpse.com', 'local.thefind.com', 'green.thefind.com', 'ww1.glimpse.com', 'shoptrue.com', 'shoptrue', 'coupons.thefind.com', 'shop.glimpse.com', 'ww1.thefind.com', 'www.shoptrue.com', 'reviews.thefind.com', 'visual.thefind.com', 'prices.thefind.com'];
  //$TF.each(ignoredOrganics, function(key, value) {self.pageTracker._addIgnoredOrganic(value)});

  var domainName = document.domain.match(/(\.(.+)\.com$)/gi);
  if(domainName == null) {
    domainName = document.domain.match(/(\.(.+)\.co\.uk$)/gi);
  }
  domainName = domainName[0];

  if (this.cobrand=='local' || this.cobrand=='greenshopping' || this.cobrand=='visualbeta' || this.cobrand=='coupons' || this.cobrand=='thefind' || this.cobrand=='thefindww1' || this.cobrand=='reviews' || this.cobrand=='prices') {
    //this.pageTracker._setDomainName(domainName); // set to '.thefind.com' or '.dev.thefind.com'
    //this.pageTracker._setAllowLinker(true);
    //this.pageTracker._setAllowHash(false); //deprecated
    ga('linker:autoLink', [domainName]);
  }else if (this.cobrand=='glimpse' || this.cobrand=='glimpseww1' || this.cobrand=='glimpseshop') {
    //this.pageTracker._setDomainName(domainName); //set to '.glimpse.com'
    //this.pageTracker._setAllowLinker(true);
    //this.pageTracker._setAllowHash(false); //deprecated
    ga('linker:autoLink', [domainName]);
  }else if (this.cobrand=='shoptrue') {
    //this.pageTracker._setDomainName(domainName); //set to '.shoptrue.com'
    //this.pageTracker._setAllowLinker(true);
    //this.pageTracker._setAllowHash(false); //deprecated
    ga('linker:autoLink', [domainName]);
  }else if (this.cobrand=='thefinduk') {
    //this.pageTracker._setDomainName(domainName); //set to '.thefind.co.uk'
    //this.pageTracker._setAllowLinker(true);
    //this.pageTracker._setAllowHash(false); //deprecated
    ga('linker:autoLink', [domainName]);
  }else if (this.cobrand=='shoplike') {
    ga('linker:autoLink', [domainName]);
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
      '<div id="ga_tagbox" style="position:fixed;left:0;top:0;border:1px dotted black;padding:5px;background-color:#eef;text-align:left;display:none;z-index:10000;color:#000;"></div>'
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

  this.setCustomDim = function(index,value) {
    try {
       ga('set', 'dimension'+index, value);
       if (this.GAalerts) this.displayTag('setCustomDim(dimension'+index + ', ' + value + ')');
    } catch (err) {
       if (this.GAalerts) this.displayTag("setCustomDim Error: " + err.description);
    }
  };

  this.trackPageViewWrapper = function(pageurl) {
  //console.log('url:'+pageurl);
    try {
      //this.pageTracker._trackPageview(pageurl);
      ga('send', 'pageview', pageurl);
      
      if (this.GAalerts) {
        this.displayTag('trackPageview('+pageurl+')');
      }
    } catch (err) {if (this.GAalerts) this.displayTag("trackPageViewWrapper Error: " + err.message)}
  };

  this.trackPageview = function(args) {
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
      case 'info':
      case 'browse':
        pageurl += '/'+pagetype;
        pageurl += '/'+this.category
                + '/'+this.subcategory
                //+ '/?qry='+query
                + '?flt='+this.filters
                + '&pgn='+this.pagenum
                + '&ver='+this.version;
        break;
      case 'browse_homepage':
        //pageurl = "/virt_result"
                //+ "/glimpse"
                //+ "/node"
                //+ "/"+this.browse_nodename
                //+ "/"+this.browse_nodetype; 
        pageurl = "/virt_results"
                + "/glimpse"
                + "/node"
                + "/"+this.browse_nodename
                + "/"+this.browse_nodetype; 
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

    if(this.pagetype == 'browse_homepage' 
        || this.pagetype == 'browse_node' 
        || this.pagetype == 'browse_merchant' 
        || this.pagetype == 'browse_brand' 
        || this.pagetype == 'browse_profile'
        || this.pagetype == 'browse_sets'
        || this.pagetype == 'browse_catalogs'
        || this.pagetype == 'browse_catalogs_merchants'
        || this.pagetype == 'browse_catalogs_users'
        || this.pagetype == 'browse_mergelikes') {
      //var cobrand = 'glimpse';
      var cobrand = googleAnalytics.cobrand;
      var page = elation.browse.page(0).subpage;
      var browseby = elation.browse.page(0).args.browseby;
      var list = elation.browse.page(0).getCurrentNode();
      if(typeof browseby == 'undefined' && list.nodeid == '0' 
          && page != '/profile' && page != '/catalogs'
          && page != '/catalogs/merchants' && page != '/catalogs/users'
          && page != '/friends'
          && elation.browse.page(0).catalogissue == false) {
        var page = '/home';
      }
      if(   elation.browse.page(0).args.filter !== null 
	      && typeof elation.browse.page(0).args.filter.query != 'undefined' 
	      && elation.browse.page(0).args.filter.query != '' ) {
	      var page = '/search';
      }
      switch (page) {
	case '/search':
		this.pageURL = '/virt_results/'
				+ cobrand+'/search/?qry='
				+ elation.browse.page(0).args.filter.query;
	break;
        case '/merchant':
          //store page
          if(browseby == 'brands'){
            //brand facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/store/brand/'
                         + '?store='+list.merchant
            if(typeof list.brand != 'undefined'){
              this.pageURL += '&brand='+list.brand;
            }
          } else if(browseby == 'styles'){
            //style facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/store/style/'
                         + '?store='+list.merchant
                         + '&style=';
            if(typeof list.style == 'undefined'){
              this.pageURL += list.node;
            } else {
              this.pageURL += list.style;
            }
          } else if(browseby == 'nodes') {
            //node facet
              this.pageURL = 'virt_results/'+cobrand
                         + '/store/style/?store='+list.merchant
            if(typeof list.node != 'undefined') {
              this.pageURL += '&style='
                           + list.node;
            }
          }
          break;
        case '/brand':
          //brand page
          if(browseby == 'merchants'){
            //store facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/brand/store/?brand='+list.brand;
            if(typeof list.merchant != 'undefined') {
              this.pageURL += '&store='
                           + list.merchant;
            }
          } else if(browseby == 'styles'){
            //style facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/brand/style/?brand='+list.brand
                         + '&style=';
            if(typeof list.style == 'undefined'){
              this.pageURL += list.node;
            } else {
              this.pageURL += list.style;
            }
          } else if(browseby == 'nodes') {
            //node facet
              this.pageURL = 'virt_results/'+cobrand
                         + '/brand/style/?brand='+list.brand
            if(typeof list.node != 'undefined') {
              this.pageURL += '&style='
                           + list.node;
            }
          }
          break;
        case '/home':
            this.pageURL = 'virt_home/'+cobrand;
            var infobox = elation.ui.infobox.get("glimpsewelcomepopup");
            if(infobox){
              this.pageURL += '/welcome';
            }
        break;
        case '/profile':
            var browse_page = elation.browse.page(0);
            var datakey = browse_page.getDataKey();
            var loggedin_userid = browse_page.args.userid;
            var username = elation.user.user.nickname, userid, type = '/me', cat;
            if(typeof list.catalog != 'undefined'){
              cat = '/sets';
            } else {
              cat = '/likes';
            }
            if(browse_page.data[datakey] && browse_page.data[datakey].persons) {
              var persons_list = browse_page.data[datakey].persons;
              var friends_list = browse_page.data[datakey].friends_list;
              var trendsetters_list = browse_page.data[datakey].trendsetters_list;
            }
            if(friends_list){
              for(friend_key in friends_list) {
                key = friends_list[friend_key].key;
                if(loggedin_userid == persons_list[key].id) {
                  username = persons_list[key].name;
                  userid = persons_list[key].id;
                  type = '/friend';
                }
              }
            }
            if(trendsetters_list){
              for(trendsetters_key in trendsetters_list) {
                key = trendsetters_list[trendsetters_key].key;
                if(loggedin_userid == persons_list[key].id) {
                  username = persons_list[key].name;
                  userid = persons_list[key].id;
                  type = '/trendsetter';
                }
              }
              key = trendsetters_list;
            }
            this.pageURL = 'virt_profile/'+cobrand
                         + cat
                         + type
            if(typeof list.catalog != 'undefined'){
              //this.pageURL += '/?set='+list.catalog;
              this.pageURL = undefined;
            }
          break;
        case '/catalogs/users':
          this.pageURL = 'virt_results/'+cobrand;
          this.pageURL += '/catalogs/users';
        break;
        case '/catalogs/merchants':
          this.pageURL = 'virt_results/'+cobrand;
          this.pageURL += '/catalogs/merchants';
        break;
        case '/catalogs':
            this.pageURL = 'virt_results/'+cobrand;
            this.pageURL += '/catalogs/all';
        break;
        case '/friends':
            this.pageURL = 'virt_results/'+cobrand;
            this.pageURL += '/browse_mergelikes';
        break;
        default:
          //node page
          if(browseby == 'brands') {
            //brand facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/node/brand/?node='+list.node
            if(typeof list.brand != 'undefined'){
              this.pageURL += '&brand='+list.brand;
            }
          } else if(browseby == 'merchants') {
            //store facet
            this.pageURL = 'virt_results/'+cobrand
                         + '/node/store/';
            if(typeof list.node != 'undefined'){
              this.pageURL += '?node='+list.node;
            }
            if(typeof list.merchant != 'undefined'){
              this.pageURL += '&store='+list.merchant;
            }
          } else if(browseby == 'styles') {
            //style facet
            this.pageURL = 'virt_results/'
                         +cobrand+'/node/style/?node='+list.node
            if(typeof list.style != 'undefined') {
              this.pageURL += '&style='+list.style;
            }
          }
          break;
      }
      var pageurl = this.pageURL;
    }
    if(typeof pageurl != 'undefined') {
      if (this.GAalerts) this.displayTag('trackPageview('+pageurl+')');

      try {
        if(typeof args != 'undefined' && args.metric) {
          var metricObj = {};
          for(i in args.metric){
            metricObj[args.metric[i]['key']] = args.metric[i]['value'];
          }
          ga('send', 'pageview', pageurl, metricObj);
          if (this.GAalerts){
            for(i in args.metric){
              this.displayTag('setCustomMetric('+args.metric[i]['key']+','+args.metric[i]['value']+')');
            }
          }
        } else {
          ga('send', 'pageview', pageurl);
        }
      } catch (err) {if (this.GAalerts) this.displayTag("trackPageview Error: "+err.message)}
    }
    var data = {};
    if(typeof elation.browse != 'undefined'){
      var browsepage = elation.browse.page(0); 
      if(browsepage.args.traffic_src == 'glimpselink'){
        if(browsepage.currentnode.merchant && browsepage.currentnode.node){
          data.impression_name = browsepage.currentnode.merchant+'-'+browsepage.currentnode.node;
          data.impression_type = 'store_node';
        } else if(browsepage.currentnode.merchant){
          data.impression_name = browsepage.currentnode.merchant;
          data.impression_type = 'store';
        } else if(browsepage.currentnode.node){
          data.impression_name = browsepage.currentnode.node;
          data.impression_type = 'node';
        }
      data.cat = 'glimpse final landing';
      elation.events.fire('glimpse_with_facebook_popup',data);
      }
    }
  };

  this.trackEvent = function(args) {
    switch (args.length) {
      case 2:
        try {
          //var ga_status = this.pageTracker._trackEvent(args[0], args[1]);
           ga('send', 'event', args[0], args[1]);
           if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+')');
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.message)}
        break;
      case 3:
        try {
          //var ga_status = this.pageTracker._trackEvent(args[0], args[1], args[2]);
           ga('send', 'event', args[0], args[1], args[2]);
           if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+','+args[2]+')');
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.message)}
        break;
      case 4:
        try {
          //var ga_status = this.pageTracker._trackEvent(args[0], args[1], args[2], args[3]);
           ga('send', 'event', args[0], args[1], args[2], args[3]);
           if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+','+args[2]+','+args[3]+')');
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.message)}
        break;
      case 5:
        try {
          //var ga_status = this.pageTracker._trackEvent(args[0], args[1], args[2], args[3], args[4]);
           ga('send', 'event', args[0], args[1], args[2], args[3], args[4]);
           if (this.GAalerts) this.displayTag('trackEvent('+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+')');
        } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.message)}
        break;
    }
  };

  this.trackClickout = function(args) {
    if (args.event.length == 5) {
      if(args.metric) {
        var metricObj = {};
        for(i in args.metric){
          metricObj[args.metric[i]['key']] = args.metric[i]['value'];
        }
        ga('send', 'event', args.event[0], args.event[1], args.event[2], args.event[3], metricObj);
      } else {
        ga('send', 'event', args.event[0], args.event[1], args.event[2], args.event[3], args.event[4]);
      }
      if (this.GAalerts){
        this.displayTag('trackEvent('+args.event[0]+','+args.event[1]+','+args.event[2]+','+args.event[3]+','+args.event[4]+')');
        if(args.metric){
          for(i in args.metric){
            this.displayTag('setcustomMetric(set,'+args.metric[i]['key']+','+args.metric[i]['value']+')');
          }
        }
      }
   }
    //else  
      //this.trackEvent([args.event[0], args.event[1], args.event[2] + args.event[3] ]);
    this.clickoutsource=0;
    this.myfindspanel='';
    var orderID = Math.floor(Math.random()*1000000000000);
    if (this.GAalerts) {
      this.displayTag('addTrans('+orderID+','+args.trans[0]+','+args.trans[1]+')');
      this.displayTag('addItem('+orderID+','+args.item[0]+','+args.item[1]+','+args.item[2]+','+args.item[3]+','+args.item[4]+')');
    }
    try {
      //this.pageTracker._addTrans(orderID, args.trans[0], args.trans[1], "", "", this.city, this.state, this.country);
      //this.pageTracker._addItem(orderID, args.item[0], args.item[1], args.item[2], args.item[3], args.item[4]);
      //this.pageTracker._trackTrans();
      ga('ecommerce:addTransaction', {
        'id': orderID,                     // Transaction ID. Required
        'affiliation': args.trans[0],   // Affiliation or store name
        'revenue': args.trans[1],               // Grand Total
        'shipping': '',                  // Shipping
        'tax': ''                     // Tax
      });
      ga('ecommerce:addItem', {
        'id': orderID,                     // Transaction ID. Required
        'sku': args.item[0],               // SKU/Code
        'name': args.item[1],   // Product name required 
        'category': args.item[2],                  // Category or variation
        'price': args.item[3],                     // Unit Price
        'quantity': args.item[4]                     // Quantity
      });
      ga('ecommerce:send');
    } catch (err) {if (this.GAalerts) this.displayTag("trackTrans Error: "+err.message)}
  };

  this.trackEventMetric = function(args) {
    if(args.event.length == 5){
      try {
           if(args.metric) {
             var metricObj = {};
             for(i in args.metric){
               metricObj[args.metric[i]['key']] = args.metric[i]['value'];
             }
             ga('send', 'event', args.event[0], args.event[1], args.event[2], args.event[3], metricObj);
             if (this.GAalerts){
               this.displayTag('trackEvent('+args.event[0]+','+args.event[1]+','+args.event[2]+','+args.event[3]+','+args.event[4]+')');
              for(i in args.metric){
                this.displayTag('customMetric(set,'+args.metric[i]['key']+','+args.metric[i]['value']+')');
              }
           }
         }
      } catch (err) {if (this.GAalerts) this.displayTag("trackEvent Error: "+err.message)}
    }
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

elation.extend('autotrack', new function() {
  this.events = [];
  
  this.add = function(name, item) {
    var events = this.events;
    
    $TF(document).ready(function() {
      events.push(new elation.autotrack.event(name, item));
    });
  }
});

elation.extend('autotrack.event', function(name, item) {
  this.name = name;
  this.item = item;
  
  this.init = function() {
    //console.log('Registered: event('+name+') '+item.parm1+', '+ item.parm2+', '+ item.parm3);
    elation.events.add(null, name, this);
  }
  
  this.handleEvent = function(event) {
    var _data = event.data,
        _ga = typeof googleAnalytics != "undefined" ? googleAnalytics : { pagetype: 'unknown' },
        name = this.name,
        item = this.item;
    
    if (item.condition) {
      try { 
        var condition = eval(item.condition); 
      } catch(e) { 
        console.log('Warning: ga_tracking CONDITION could not evaluate: ',e); 
      };
    } else
      var condition = true;
    
    if ((item.enabled == 1 || item.enabled == 'true') && condition) {
      var do_eval = function(parm) { 
            try { 
              return eval(parm); 
            } catch(e) { 
              console.log('Warning: ga_tracking PARAMETER could not evaluate: ' + parm, e);
              return "err:eval_failed";
            };
          },
          parm1 = item.parm1 ? do_eval(item.parm1) : '',
          parm2 = item.parm2 ? do_eval(item.parm2) : '',
          parm3 = item.parm3 ? do_eval(item.parm3) : '',
          parm4 = item.parm4 ? do_eval(item.parm4) : '',
          parm5 = item.parm5 ? do_eval(item.parm5) : '';
      
      if (parm2 || parm3 || parm4 || parm5) {
        //console.log('Fired: ', condition, name, parm1, parm2, parm3, parm4, parm5, item, _data);
        
        if (typeof googleAnalytics == 'object') {
          if (parm5) googleAnalytics.trackEvent([ parm1, parm2, parm3, parm4, parm5 ]);
          else if (parm4) googleAnalytics.trackEvent([ parm1, parm2, parm3, parm4 ]);
          else if (parm3) googleAnalytics.trackEvent([ parm1, parm2, parm3 ]);
          else if (parm2) googleAnalytics.trackEvent([ parm1, parm2 ]);
        }
      }
    }
  }
  
  this.init();
  
  return this;
});
