(function() {
    with( ZendeskApps.AppScope.create() ) {

  var source = (function(){
  return {
    PROJECT_TO_USE: '1',
    TRACKERS: [],
    PROJECTS: [],
    appID:  'RedmineAPP_IntegrationV2',
    requests: {
      getAudit: function(id)
      {
        return {
          url: '/api/v2/tickets/'+id+'/audits.json',
          type: 'GET',
          contentType: 'application/json',
          dataType: 'json'
        };
      },
      updateTicket: function(id, data)
      {
        return {
          url: '/api/v2/tickets/'+id+'.json',
          type: 'PUT',
          data: data,
          dataType: 'json',
          contentType: 'application/json'
        };
      },
      postRedmine: function(project, redmine_url, data)
      {
        return {
          url: redmine_url+'/issues.json?key={{setting.apiKey}}',
          type: 'POST',
          dataType: 'json',
          data: data,
          secure: true
        };
      },
      getProjects: function(redmine_url){
        return {
          url: redmine_url+'/projects.json?key={{setting.apiKey}}',
          type:'GET',
          dataType: 'json',
          secure: true
        };
      },
      getIssue: function(redmine_url, issue_id){
        return {
          url: redmine_url+'/issues/'+issue_id+'.json?key={{setting.apiKey}}',
          type:'GET',
          dataType: 'json',
          secure: true
        };
      },
      getTrackers: function(redmine_url)
      {
        return {
          url: redmine_url+'/projects/'+this.PROJECT_TO_USE+'.json?key={{setting.apiKey}}&include=trackers',
          type: 'GET',
          dataType: 'json',
          secure: true
        };
      }
   },
    events: {
      'app.activated'           : 'onActivated',
      'postRedmine.done'        : 'fn_result',
      'click #submitToRedmine'  : 'fn_prep_to_post',
      'getProjects.done'        : 'fn_listProjects',
      'getTrackers.done'        : 'fn_saveTrackers',
      'getAudit.done'           : 'fn_listMeta',
      'click .project'          : 'fn_projectSelect',
      'updateTicket.done'       : 'fn_reset',
      'click .issue'            : 'fn_get_issue',
      'getIssue.done'           : 'fn_show_issue',
      'click .back_button'      : 'onActivated'
    },
    fn_renderError: function(error_text)
    {
      services.notify(error_text, 'error');
      this.switchTo('error', {error: error_text});
    },
    onActivated: function(){
      console.log('app: 1.0');
      this.doneLoading = false;
      this.loadIfDataReady();
    },
    loadIfDataReady: function(){
      if ( !this.doneLoading && this.ticket().status() != null && this.ticket().requester().id()) {
        this.doneLoading = true;
        if(this.settings.redmine_url.search('\/$') != -1){
          this.fn_renderError('Your Redmine URL has a "/" at the end. Remove it and try again.<p>' + this.settings.redmine_url + '</p>', 'error');
        }else{
          this.ajax('getProjects', this.settings.redmine_url);
        }
      }
    },
    fn_result: function(result){
      services.notify(this.I18n.t('issue.posted'));
      var id = result.issue.id;
      var data = {"ticket":{"comment":{"public":false, "value":"This ticket was pushed to Redmine\n\n"+this.settings.redmine_url+"/issues/"+id+"\n\n"}, "metadata":{"pushed_to_redmine":true, "redmine_id": id}}};
      data = JSON.stringify(data);
      this.ajax('updateTicket', this.ticket().id(), data);
    },
    fn_listProjects: function(data)
    {
      if(data == null){
        this.fn_renderError("No data returned. Please check your API key.");
      }else{
        this.PROJECTS = data;
        this.switchTo('projectList', {project_data: data});
        this.ajax('getAudit', this.ticket().id());
      }
    },
    fn_prep_to_post: function(){
      var subject = this.$('#rm_subject').val();
      var tracker = this.$('#rm_tracker').val();
      var priority = this.$('#rm_priority').val();
      if(subject.length < 1){
        services.notify('You must include a subject.', 'error');
      }else{
        var ticket_desc = this.ticket().description();
        ticket_desc = ticket_desc.replace( /&/gim, '' ).replace( /</gim, '').replace( />/gim, '').replace(/:/gim, '');
        var data = {"issue": {"subject": subject, "project_id": this.PROJECT_TO_USE, "tracker_id": tracker, "description": "This issue was pushed from Zendesk to Redmine.\n---\n\nDescription:\n"+ticket_desc+"\n---\n\nAdditional Message from Zendesk\n---\n"+this.$('#rm_note').val()+"\n\nTicket URL: https://"+this.currentAccount().subdomain()+".zendesk.com/tickets/"+this.ticket().id()+"\n\n"}};
        this.ajax('postRedmine', this.settings.project, this.settings.redmine_url, data);
      }
    },
    fn_projectSelect: function(e)
    {
      this.PROJECT_TO_USE = e.target.id;
      this.ajax('getTrackers', this.settings.redmine_url);
    },
    fn_saveTrackers: function(data)
    {
      this.TRACKERS = data.project;
      this.switchTo('index', {track: this.TRACKERS});
    },
    fn_listMeta: function(data)
    {
      var pushed_to_redmine = false;
      var redmine_id = 0;
      var redmine = false;
      var issue_list = [];
      for(var i=0; i<=data.count; i++)
      {
        try{
          var redmine_meta = data.audits[i].metadata.custom;
          if(redmine_meta.pushed_to_redmine){
            redmine=true;
            issue_list.push(redmine_meta.redmine_id);
          }
        }catch(err){
        }
      }
      if(redmine){
        this.switchTo('projectList', {project_data: this.PROJECTS, issue: issue_list});
      }else{
        this.switchTo('projectList', {project_data: this.PROJECTS, issue: []});
      }
    },
    fn_reset: function(){
      this.ajax('getProjects', this.settings.redmine_url);
    },
    fn_get_issue: function(e){
      var issue_id = e.target.classList[1].replace("id_", "");
      this.ajax('getIssue', this.settings.redmine_url, issue_id);
    },
    fn_show_issue: function(data){
      this.switchTo('show_issue', {issue: data.issue, url: this.settings.redmine_url+"/issues/"+data.issue.id });
    }
  };
}());    ;

  var app = ZendeskApps.defineApp(source)
    .reopenClass({
      location: "ticket_sidebar",
      noTemplate: false
    })
    .reopen({
      assetUrlPrefix: "/api/v2/apps/41140/assets/",
      appClassName: "app-41140",
      author: {
        name: "Zendesk Labs",
        email: "zendesklabs@zendesk.com"
      },
      translations: {"app":{},"issue":{"posted":"Issue created!"}},
      templates: {"error":"<div>\nThere was an error with the Redmine Integration. The error message was:\n</div>\n<div>\n{{error}}\n</div>","index":"<div id=\"newIssue\">\n<p>Subject: </p>\n<p><input type=\"text\" id=\"rm_subject\"></p>\n<p>Tracker: </p>\n<p><select id=\"rm_tracker\">\n{{#each track.trackers}}\n<option value=\"{{this.id}}\">{{this.name}}</option>\n{{/each}}\n</select></p>\n<p>Additional Comments: </p>\n<p><textarea id=\"rm_note\" /></p>\n<p><a class=\"btn\" id=\"submitToRedmine\">Submit</a></p>\n</div>","issue_list":"<p><h3> Issue List</h3></p>\n{{#each issue}}\n<a class=\"issue id_{{id}} btn btn-mini\">Issue {{id}}</a>\n{{/each}}","layout":"<style>\n.app-41140 header .logo {\n  background-image: url(\"/api/v2/apps/41140/assets/logo-small.png\"); }\n.app-41140 li + li {\n  margin-top: 0.4em; }\n.app-41140 li .project_list_li {\n  visibility: hidden; }\n.app-41140 li:hover .project_list_li {\n  visibility: visible; }\n.app-41140 textarea {\n  width: 280px;\n  height: 100px; }\n.app-41140 input {\n  width: 280px; }\n.app-41140 #newIssue {\n  font-size: 12px; }\n.app-41140 #newIssue > p {\n  margin-top: 5px; }\n.app-41140 .caption {\n  font-weight: bold; }\n.app-41140 .progress {\n  width: 100px; }\n</style>\n<head>\n\t <h3>{{setting \"name\"}}</h3>\n</head>\n<section data-main />\n<footer>\n</footer>","projectList":"<div id=\"projectList_div\">\n<p><h3>Current Projects:</h3></p>\n<ul>\n{{#each project_data.projects}}\n<li><i class=\"icon-arrow-right project_list_li\"></i> <a id=\"{{this.id}}\" class=\"project\">{{this.id}} - {{this.name}}</a></li>\n{{/each}}\n</ul>\n</div>\n<p><h3> Issue List: </h3></p>\n{{#each issue}}\n<a class=\"issue id_{{this}} btn btn-mini\">Issue {{this}}</a>\n{{/each}}","show_issue":"<div>\n<p class=\"caption subject\">Subject:</p>\n<p>{{issue.subject}}</p>\n<br />\n<p class=\"caption\">Project Name:</p>\n<p>{{issue.project.name}}</p>\n<br />\n<p class=\"caption\">Tracker/Status/Priority:</p>\n<p>\n  <span class=\"label\">{{issue.tracker.name}}</span> /\n  <span class=\"label\">{{issue.status.name}}</span> /\n  <span class=\"label\">{{issue.priority.name}}</span>\n</p>\n<br />\n<p class=\"caption\">Author:</p>\n<p>{{issue.author.name}}</p>\n<br />\n<p class=\"caption\">Description</p>\n<p>{{issue.description}}</p>\n<br />\n<p class=\"caption\">{{issue.done_ratio}}% Done\n<div class=\"progress\">\n  <div class=\"bar\" style=\"width: {{issue.done_ratio}}%;\"></div>\n</div></p>\n<br />\n<p><span class=\"caption\">Time Spent:</span> {{issue.spent_hours}}</p>\n<br />\n<a class=\"back_button\">Back</a> - <a href=\"{{url}}\" target=\"_new\">Open In Redmine <i class=\"icon-share-alt\"> </i></a>\n</div>"},
      frameworkVersion: "1.0"
    });

  ZendeskApps["Redmine"] = app;
}

    with( ZendeskApps.AppScope.create() ) {

  var source = (function() {

  return {
    yammer_baseUrl : 'https://www.yammer.com',

    defaultState: 'loading',

    requests: {
      yammerSearch: function(email) {
        var requrl = this.yammer_baseUrl + '/api/v1/users/by_email.json?email=' + email;
        return {
          headers: {
            Authorization: "Bearer " + this.setting('yammer_token')
          },
          url: requrl,
          type: 'GET',
          proxy_v2: true,
          contentType: 'application/json',
          dataType: 'json'
        };
      },

      ticketRequester: function(userid) {
        return {
          url: '/api/v2/users/' + userid + '.json',
          type: 'GET',
          proxy_v2: true
        };
      }

    },

    events: {
      'ticket.requester.id.changed': 'requesterChanged',

      'app.activated': function(data) {
        if (this.setting('yammer_token') === '') {
          this.switchTo('fetch_fail', { displayMsg: 'You must configure a Yammer auth token' });
        }
        else {
          if (data.firstLoad) {
            this.requestYammerData();
          }
        }
      }

    },

    requesterChanged: function() {
      this.requestYammerData();
    },

    requestYammerData: function() {
      // Get additional info about the ticket requester
      if (this.ticket().requester()) {
        this.ajax('ticketRequester', this.ticket().requester().id())
          .done(function(data) {
            if (data.user.email) {
              var email = data.user.email;

              // Search Yammer for an email address match
              this.ajax('yammerSearch', email)
                .done(function(data) {
                  this.yammerData = data[0];

                  // Strip the time from the datetime string
                  if (this.yammerData && this.yammerData.activated_at) {
                    // "activated_at": "2013/11/11 23:01:44 +0000",
                    this.yammerJoinDate = this.yammerData.activated_at.substring(0, this.yammerData.activated_at.search(' '));
                  }

                  // Set the photo size
                  if (this.yammerData && this.yammerData.mugshot_url_template) {
                    // https://mug0.assets-yammer.com/mugshot/images/{width}x{height}/gplVxp-hrsvZj6V4Xxk-GG08k4g-92Tc
                    this.yammerPhoto = this.yammerData.mugshot_url_template.replace('{width}x{height}', '70x70');
                  }

                  // Render the results
                  this.switchTo('yammerresults', {
                    yammerData: this.yammerData,
                    yammerJoinDate: this.yammerJoinDate,
                    yammerPhoto: this.yammerPhoto
                  });

                })
                .fail(function(data) {
                  this.switchTo('fetch_fail', { displayMsg: email + ' ' + data.statusText });
                });
            }
            else {
              this.switchTo('fetch_fail', { displayMsg: 'User has no email address' });
            }

          })
          .fail(function(data) {
            this.switchTo('fetch_fail', { displayMsg: 'Error retrieving user info' });
          });
      }
      else {
        this.switchTo('fetch_fail', { displayMsg: 'No ticket requester' });
      }
    }

  };

}());
;

  var app = ZendeskApps.defineApp(source)
    .reopenClass({"location":["ticket_sidebar","new_ticket_sidebar"],"noTemplate":false,"singleInstall":false})
    .reopen({
      assetUrlPrefix: "/api/v2/apps/66783/assets/",
      appClassName: "app-66783",
      author: {
        name: "Zendesk Labs",
        email: "zendesklabs@zendesk.com"
      },
      translations: {"app":{},"loading":"Loading"},
      templates: {"fetch_fail":"\u003cp\u003e{{displayMsg}}\u003c/p\u003e","loading":"\u003cdiv class=\"loading\"\u003e\n {{t \"loading\"}}\u0026hellip;  {{spinner \"dotted\"}}\n\u003c/div\u003e","yammerresults":"\u003cdiv class=\"media\"\u003e\n    \u003ca class=\"pull-right\" href=\"#\"\u003e\n        \u003cimg class=\"media-object\" src=\"{{yammerPhoto}}\"\u003e\n    \u003c/a\u003e\n  \n    \u003cdiv class=\"pull-left\"\u003e\n        \u003ch4 class=\"media-heading\"\u003e{{yammerData.full_name}}\u003c/h4\u003e\n        {{#if yammerData.job_title }} {{ yammerData.job_title}}  \u003cbr/\u003e {{/if}}\n        \u003cbr/\u003e\n        {{#if yammerData.department }} Department: {{ yammerData.department}}  \u003cbr/\u003e {{/if}}\n        {{#if yammerData.location }} Location: {{ yammerData.location}}  \u003cbr/\u003e {{/if}}\n        {{#if yammerJoinDate }} Joined: {{ yammerJoinDate}}  \u003cbr/\u003e {{/if}}\n        {{#if yammerData.birth_date }} Birthday: {{ yammerData.birth_date}}  \u003cbr/\u003e {{/if}}\n    \u003c/div\u003e\n\u003c/div\u003e","layout":"\u003cstyle\u003e\n.app-66783 header .logo {\n  background-image: url(\"/api/v2/apps/66783/assets/logo-small.png\"); }\n.app-66783 ul {\n  margin-left: 0; }\n.app-66783 footer {\n  display: none; }\n.app-66783 li + li {\n  margin-top: 0.4em; }\n.app-66783 li .destroy {\n  visibility: hidden; }\n.app-66783 li:hover .destroy {\n  visibility: visible; }\n.app-66783 .btn.search {\n  margin-top: 10px; }\n\u003c/style\u003e\n\u003cheader\u003e\n  \u003cspan class=\"logo\"\u003e\u003c/span\u003e\n  \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n\u003c/header\u003e\n\u003csection data-main\u003e\u003c/section\u003e\n\u003cfooter\u003e\n  \u003ca href=\"mailto:{{author.email}}\"\u003e\n    {{author.name}}\n  \u003c/a\u003e\n\u003c/footer\u003e\n"},
      frameworkVersion: "1.0"
    });

  ZendeskApps["Yammer App"] = app;
}

    with( ZendeskApps.AppScope.create() ) {

  var source = (function() {

  return {
    requests: {
      search: function(params) {
        return {
          url: '/api/v2/search.json?query=' + params,
          type: 'GET'
        };
      }
    },

    events: {
      'app.created'             : 'onTicketSubjectChanged',
      'ticket.subject.changed'  : 'onTicketSubjectChanged',
      'keydown #search-input'   : 'onSearchKeyPressed',
      'click .search'           : 'onSearchClicked',
      'search.done'             : 'onSearchDone',
      'search.fail'             : 'onSearchFailed'
    },

    onTicketSubjectChanged: _.debounce(function() {
      if (_.isEmpty(this.ticket().subject())) { return; }

      var keywords = this.extractKeywords(this.ticket().subject()).join(" ");

      this.$('.search-input').val(keywords);

      this.searchTickets(keywords);
    }, 400),

    onSearchKeyPressed: function(e) {
      var query = this.$(e.target).val();

      if (e.which === 13 && !_.isEmpty(query)) {
        e.preventDefault();

        this.searchTickets(query);
      }
    },

    onSearchClicked: function(e) {
      e.preventDefault();

      var query = this.$('.search-input').val();

      if (!_.isEmpty(query)) {
        this.searchTickets(query);
      }
    },

    onSearchDone: function(data) {
      var currentTicketId = this.ticket().id(),
          tickets = data.results.slice(0,10);

      if (currentTicketId) {
        // remove current ticket from results
        tickets = _.reject(tickets, function(ticket) {
          return ticket.id === currentTicketId;
        });
      }

      _.each(tickets, function(ticket) {
        ticket.description = ticket.description.substr(0,300).concat("...");
      });

      this.switchTo('results', {
        tickets: tickets,
        tooltip_enabled: !this.setting('disable_tooltip')
      });
    },

    onSearchFailed: function() {
      this.showError();
    },

    searchTickets: function(keywords){
      this.switchTo('searching');

      // parameters to search tickets that have been solved
      var params = keywords + " type:ticket status>pending";

      this.ajax('search', params);
    },

    extractKeywords: function(text) {
      // strip punctuation and extra spaces
      text = text.toLowerCase().replace(/[\.,-\/#!$?%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

      // split by spaces
      var words = text.split(" ");

      var exclusions = this.I18n.t('stopwords.exclusions').split(",");

      var keywords = _.difference(words, exclusions);

      return keywords;
    },

    showError: function(title, msg) {
      this.switchTo('error', {
        title: title || this.I18n.t('global.error.title'),
        message: msg || this.I18n.t('global.error.message')
      });
    }

  };

}());
;
}
var app = ZendeskApps.defineApp(source)
  .reopenClass({"location":{"zendesk":{"ticket_sidebar":"_legacy","new_ticket_sidebar":"_legacy"}},"noTemplate":false,"singleInstall":true})
  .reopen({
    appName: "Show Related Tickets",
    appVersion: "1.0.1",
    assetUrlPrefix: "/api/v2/apps/5131/assets/",
    appClassName: "app-5131",
    author: {
      name: "Zendesk",
      email: "support@zendesk.com"
    },
    translations: {"app":{"title":"Tickets associés","parameters":{"disable_tooltip":{"label":"Désactiver l’info-bulle"}}},"global":{"error":{"title":"Une erreur est survenue.","message":"Veuillez réessayer l’action précédente.","data":"Impossible de lire les données de ticket."},"loading":"Initialisation de l’application…","searching":"Recherche dans les tickets associés…","no_results":"Pas de résultats trouvés."},"ticket":{"id":"ID","subject":"SUJET"},"search":{"keywords":"Tapez des mots-clés…"},"error":{"back":"Retour"},"stopwords":{"exclusions":"zendesk,a,is,about,above,after,again,against,all,am,an,and,any,are,aren't,as,at,be,because,been,before,being,below,between,both,but,by,can't,cannot,could,couldn't,did,didn't,do,does,doesn't,doing,don't,down,during,each,few,for,from,further,had,hadn't,has,hasn't,have,haven't,having,he,he'd,he'll,he's,her,here,here's,hers,herself,him,himself,his,how,how's,i,i'd,i'll,i'm,i've,if,in,into,is,isn't,it,it's,its,itself,let's,me,more,most,mustn't,my,myself,no,nor,not,of,off,on,once,only,or,other,ought,our,ours,ourselves,out,over,own,same,shan't,she,she'd,she'll,she's,should,shouldn't,so,some,such,than,that,that's,the,their,theirs,them,themselves,then,there,there's,these,they,they'd,they'll,they're,they've,this,those,through,to,too,under,until,up,very,was,wasn't,we,we'd,we'll,we're,we've,were,weren't,what,what's,when,when's,where,where's,which,while,who,who's,whom,why,why's,with,won't,would,wouldn't,you,you'd,you'll,you're,you've,your,yours,yourself,yourselves"}},
    templates: {"error":"\u003cdiv class=\"alert\"\u003e\n  \u003ch4\u003e{{title}}\u003c/h4\u003e\n  \u003cp\u003e{{message}}\u003c/p\u003e\n  \u003c!--a href=\"#\" class=\"btn btn-inverse error-back-btn\"\u003e{{t \"error.back\"}}\u003c/a--\u003e\n\u003c/div\u003e","layout":"\u003cstyle\u003e\n.app-5131 header .logo {\n  background-image: url(\"/api/v2/apps/5131/assets/logo-small.png\"); }\n.app-5131 .search-wrapper {\n  position: relative;\n  width: 309px;\n  margin: 10px 0 5px 0; }\n.app-5131 .table tr:first-child td {\n  border-top: none !important; }\n\u003c/style\u003e\n\u003cheader\u003e\n  \u003cspan class=\"logo\"/\u003e\n  \u003ch3\u003e{{setting \"title\"}}\u003c/h3\u003e\n\u003c/header\u003e\n\u003cform class=\"search-wrapper\"\u003e\n  \u003cdiv class=\"row-fluid\"\u003e\n    \u003cdiv class=\"span11\"\u003e\n      \u003cinput type=\"text\" placeholder=\"{{t \"search.keywords\"}}\" class=\"search-input\" name=\"search-input\"\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"span1\"\u003e\n      \u003cbutton class=\"btn search\"\u003e\u003ci class=\"icon-search\"\u003e\u003c/i\u003e\u003c/button\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/form\u003e\n\u003csection data-main\u003e\u003c/section\u003e","results":"\u003cdiv\u003e\n  {{#if tickets}}\n    \u003ctable class=\"table table-condensed\"\u003e\n      \u003ctbody\u003e\n        {{#each tickets}}\n          \u003ctr{{#if ../tooltip_enabled}} class=\"_tooltip\" data-title=\"{{description}}\" data-placement=\"left\" {{/if}}\u003e\n            \u003ctd\u003e#{{id}}\u003c/td\u003e\n            \u003ctd\u003e\u003ca href=\"/agent/#/tickets/{{id}}\"\u003e{{subject}}\u003c/a\u003e\u003c/td\u003e\n          \u003c/tr\u003e\n        {{/each}}\n      \u003c/tbody\u003e\n    \u003c/table\u003e\n  {{else}}\n    \u003cp\u003e{{t \"global.no_results\"}}\u003c/p\u003e\n  {{/if}}\n\u003c/div\u003e","searching":"\u003cdiv class=\"loading\"\u003e{{t \"global.searching\"}}\u003c/div\u003e"},
    frameworkVersion: "1.0"
  });

ZendeskApps["Show Related Tickets"] = app;

    with( ZendeskApps.AppScope.create() ) {

  var source = (function () {

	return {
		defaultState : 'loading',
		tvApiBaseUrl : 'https://webapi.teamviewer.com/api/v1/',
		tvConsoleUrl : 'https://login.teamviewer.com/',
		clientId : '6094-SVAwdUIh4mZ56vKJzzcc',

		requests : {
			getAccessToken : function (authCode, clientId) {
				return {
					proxy_v2 : true,
					contentType : 'application/x-www-form-urlencoded',
					url : this.tvApiBaseUrl + 'oauth2/token',
					type : 'POST',
					data : 'grant_type=authorization_code&code=' + authCode + '&client_id=' + clientId
				};
			},

			refreshToken : function (rToken) {
				return {
					proxy_v2 : true,
					contentType : 'application/x-www-form-urlencoded',
					url : this.tvApiBaseUrl + 'oauth2/token',
					type : 'POST',
					data : 'grant_type=refresh_token&refresh_token=' + rToken
				};
			},

			pingApi : function (token, cb) {
				return {
					proxy_v2 : true,
					url : this.tvApiBaseUrl + 'ping',
					type : 'GET',
					headers : {
						"Authorization" : "Bearer " + token
					},
					success : function (data) {
						if (typeof cb === 'function') {
							cb(data.token_valid || false);
						}
					}
				};
			},

			createNewSession : function (token, payload, cb) {
				return {
					proxy_v2 : true,
					url : this.tvApiBaseUrl + 'sessions',
					type : 'POST',
					contentType : 'application/json',
					headers : {
						"Authorization" : "Bearer " + token
					},
					data : JSON.stringify(payload),
					success : function (data) {
						if (typeof cb === 'function') {
							cb(data || null);
						}
					}
				};
			}
		},

		events : {
			'app.activated' : function (data) {
				this.init(data);
			},

			'app.deactivated' : function () {
				this.tvLog('app deactivated!');
				if (this.iFrameTimer) {
					clearTimeout(this.iFrameTimer);
				}
			},

			'getAccessToken.done' : function (data) {
				this.newTokenReceived(data);
			},

			'getAccessToken.fail' : function (data) {
				services.notify(this.I18n.t('main.msg_loginError'), 'error');
				this.logout(true);
			},

			'refreshToken.done' : function (data) {
				this.newTokenReceived(data);
			},

			'refreshToken.fail' : function (data) {
				services.notify(this.I18n.t('main.msg_loginError'), 'error');
				this.logout(true);
			},

			'pingApi.fail' : function (data) {
				this.logout(true);
			},

			'createNewSession.fail' : function (data) {
				services.notify(this.I18n.t('main.msg_createSessionFailed'), 'error');
				this.tvLog(data);
				this.logout(true);
			},

			'click .btnLogin' : function (event) {
				event.preventDefault();
				this.login();
			},

			'click .btnCreateSession' : function (event) {
				event.preventDefault();
				this.createSession();
			},

			'click .btnRefreshSession' : function (event) {
				event.preventDefault();
				//$('.tooltip').hide();
				this.createSession();
			},

			'click .btnPasteCustomerLink' : function (event) {
				event.preventDefault();
				this.pasteToComment('customerHttp');
			}
		},

		newTokenReceived : function (data) {
			var that = this;
			//calc dateTime when token will be invalid
			var expireDate = new Date().getTime() + (data.expires_in * 1000);

			this.store({
				"t" : data.access_token,
				"r" : data.refresh_token,
				"exp" : expireDate
			});

			this.tvLog(this.store('t'));
			services.notify(this.I18n.t('main.msg_loginSuccess'));

			this.checkState();
		},

		createSession : function () {
			var that = this;
			that.switchTo('loading', {
				"customLoadingMessage" : that.I18n.t('loading_creatingSession')
			});

			//session create parameters
			var payload = {};

			//waiting message --> app setting or omit?
			if (that.setting('tv_waitingMessage') && that.setting('tv_waitingMessage').length > 0) {
				payload.waiting_message = that.setting('tv_waitingMessage');
			}

			//note --> ticket title
			payload.note = that.ticket().subject();

			//ticket creator
			var requester = that.ticket().requester();
			if (requester && requester.name() && requester.email()) {
				payload.end_customer = {
					name : requester.name(),
					email : requester.email()
				};
			}

			//ticket id of zendesk
			payload.custom_api = that.ticket().id();

			//Session Codes are created in group Zendesk
			payload.groupname = 'Zendesk';

			that.ajax('createNewSession', that.store('t'), payload, function (response) {
				that.tvLog('CreateSession response was:');
				that.tvLog(response);

				if (response !== null) {
					that.sessionInfos(response);
					that.renderMain();
				} else {
					//fail --> something went wrong
					services.notify(that.I18n.t('main.msg_createSessionFailed'), 'error');
				}
			});
		},

		removeSession : function () {
			var that = this;
			var customFieldId = that.setting("tv_CustomFieldId");
			var customField = that.ticketFields("custom_field_" + customFieldId);

			if (customField) {
				that.ticket().customField("custom_field_" + customFieldId, "");
			} else {
				services.notify(that.I18n.t('main.msg_customFieldWrongOrMissing'), 'error');
				that.switchTo('error', {
					"errorMsg" : that.I18n.t('main.msg_customFieldWrongOrMissing')
				});
				return;
			}

			that.renderMain();
		},

		sessionInfos : function (sessionObj) {
			var that = this;
			var customFieldId = that.setting("tv_CustomFieldId");
			var customField = that.ticketFields("custom_field_" + customFieldId);

			if (!customField) {
				services.notify(that.I18n.t('main.msg_customFieldWrongOrMissing'), 'error');
				return null;
			}

			if (sessionObj !== null && typeof sessionObj === 'object') { //setter
				that.ticket().customField("custom_field_" + customFieldId, JSON.stringify(sessionObj));
			} else { //getter
				try {
					return JSON.parse(that.ticket().customField("custom_field_" + customFieldId)) || null;
				} catch (err) {
					return null;
				}
			}
		},

		login : function () {
			services.notify(this.I18n.t('login.msg_connectingToTeamviewer'));

			var redirectUrl = encodeURIComponent('https://' + this.currentAccount().subdomain() + '.zendesk.com/agent/');
			var oAuthUrl = this.tvConsoleUrl + 'oauth2/authorize?response_type=code&client_id=' + this.clientId + '&redirect_uri=' + redirectUrl + '&display=iframe';
			this.tvLog(oAuthUrl);

			this.switchTo('iframe', {
				url : oAuthUrl
			});

			var frame = this.$('#tv-frame')[0];
			this.waitForIFrame(frame);
		},

		logout : function (silent) {
			this.store({
				"t" : null,
				"r" : null,
				"exp" : null
			});

			if (silent !== true) {
				services.notify(this.I18n.t('main.msg_logoutSuccess'));
			}
			this.checkState();
		},

		renderMain : function () {
			var that = this,
			//get TeamViewer specific data from tickets custom field
			tvSession = that.sessionInfos(),
			sessionValidDate = null,
			//sessionValidUntilString = '',
			sessionIsValid = false;

			that.tvLog("retrieved tv custom field for this ticket:");
			that.tvLog(tvSession);

			//do we have a tvSession attached to this ticket?
			if (tvSession && typeof tvSession === 'object') {
				//check if this tvSession is still valid
				sessionValidDate = that.parseISO8601(tvSession.valid_until); //return value is represented in local timezone
				var now = new Date();
				sessionIsValid = sessionValidDate > now;
				//sessionValidUntilString = sessionValidDate.toLocaleString();
			}

			//render main template
			that.switchTo('main', {
				"tvValues" : tvSession,
				//"sessionValidUntilString" : sessionValidUntilString,
				"sessionIsValid" : sessionIsValid
			});
		},

		pasteToComment : function (linkType) {
			var that = this,
			sessionObj = that.sessionInfos(),
			comment = that.comment(),
			linkText = "",
			currentCommentText = comment.text();

			if (linkType === 'customerHttp') {
				linkText = that.setting("tv_customerLinkPrefix") || that.I18n.t('defaultCustomerLinkPrefix');
				linkText = linkText.replace("@@URL@@", sessionObj.end_customer_link);
				comment.text(currentCommentText + linkText);
				comment.type('publicReply');
				return;
			}
		},

		init : function (data) {
			var that = this;
			var customField = that.ticketFields("custom_field_" + that.setting("tv_CustomFieldId"));

			//always hide custom field in ticket view
			if (customField) {
				customField.hide();
			} else {
				services.notify(that.I18n.t('main.msg_customFieldWrongOrMissing'), 'error');
				that.switchTo('error', {
					"errorMsg" : that.I18n.t('main.msg_customFieldWrongOrMissing')
				});
				return;
			}

			that.tvLog("Firstload : " + data.firstLoad);
			that.checkState(data.firstLoad);
		},

		checkState : function (firstLoad) {
			var that = this;

			//existing token
			if (that.store('t') !== null) {

				that.tvLog('Current token lifetime ' + ((that.store('exp') - new Date().getTime()) / 3600000) + ' hours');

				if (firstLoad === true) {
					that.tvLog('Existing token: ping api');

					//check if token is still valid (ping etc.)
					that.ajax('pingApi', that.store('t'), function (isTokenValid) {

						if (isTokenValid === true) {
							that.renderMain();
						} else {
							//fail --> the token is not longer valid, timed out, etc.
							if (that.store('r') !== null) {
								//use refresh_token to get an new one.
								that.tvLog('Refreshing token...');
								that.ajax('refreshToken', that.store('r'));
							} else {
								services.notify(that.I18n.t('login.msg_loginToOld'));

								//silent logout
								that.logout(true);
							}
						}
					});

					return;
				}

				//we have a token and it should be still usable
				if (that.store('exp') > new Date().getTime()) {
					that.tvLog('Current token still valid --> render main');
					that.renderMain();
				}

				//token timed out
				else if (that.store('exp') <= new Date().getTime()) {
					that.tvLog('Current token timed out');

					if (that.store('r') !== null) {
						that.tvLog('Refreshing token...');
						that.ajax('refreshToken', that.store('r'));
						return;
					} else {
						services.notify(that.I18n.t('login.msg_loginToOld'));

						//silent logout
						that.logout(true);
					}
				}

			} else //no token in storage -> get a new token
			{
				that.tvLog('no token --> switch to login');
				that.switchTo('login');
			}
		},

		iFrameTimer : null,
		waitForIFrame : function (frame) {
			this.tvLog('Waiting for oAuth response...');

			if (this.canAccessIFrame(frame)) {
				//try to get code
				var authCode = this.getURLParameter('code', frame.contentWindow.location.href);
				if (authCode !== null) {
					this.tvLog('auth code is: ' + authCode);
					this.switchTo('loading');
					this.ajax('getAccessToken', authCode, this.clientId);
				} else {
					services.notify(this.I18n.t('login.msg_connectionFailed'), 'error');
				}
			} else {
				var that = this;
				this.iFrameTimer = setTimeout(function () {
						that.waitForIFrame(frame);
					}, 250);
				return;
			}
		},

		canAccessIFrame : function (frame) {
			try {
				return (frame.contentWindow.location.href !== 'about:blank' && typeof frame.contentWindow.location.href !== "undefined" && frame.contentWindow.document.body.innerHTML !== null);
			} catch (err) {
				return false;
			}
		},

		getURLParameter : function (parameterName, searchUrl) {
			var results = new RegExp('[\\?#&]' + parameterName + '=([^&#]*)').exec(searchUrl);
			return results[1] || null;
		},

		tvLog : function (data) {
			//do not log debug messages to the console
			return;
			/*
			if (this.setting('tv_Debug') !== true) {
			return;
			}

			try {
			console.info(data);
			} catch (err) {}
			 */
		},

		parseISO8601 : function (strDateUTC) {

			//Times are always in UTC.
			//					YYYY-MM-DDTHH:MM:SSZ
			//Example			2013-02-21T13:42:55Z

			if (!strDateUTC || typeof strDateUTC !== 'string') {
				return null;
			}

			var result = null;

			try {
				// assume strDateUTC is a UTC date ending in 'Z'
				var parts = strDateUTC.split('T'),
				dateParts = parts[0].split('-'),
				timeParts = parts[1].split('Z'),
				timeSubParts = timeParts[0].split(':'),
				timeSecParts = timeSubParts[2].split('.'),
				timeHours = Number(timeSubParts[0]);

				result = new Date();

				result.setUTCFullYear(Number(dateParts[0]));
				result.setUTCDate(1);
				result.setUTCMonth(Number(dateParts[1]) - 1);
				result.setUTCDate(Number(dateParts[2]));
				result.setUTCHours(Number(timeHours));
				result.setUTCMinutes(Number(timeSubParts[1]));
				result.setUTCSeconds(Number(timeSecParts[0]));

			} catch (exp) {
				this.tvLog('error parsing "session valid until" date :' + exp);
				result = null;
			}

			// by using setUTC methods the date object has already been converted to local time
			return result;
		}
	};

}
	());
;

  var app = ZendeskApps.defineApp(source)
    .reopenClass({
      location: ["ticket_sidebar","new_ticket_sidebar"],
      noTemplate: false
    })
    .reopen({
      assetUrlPrefix: "/api/v2/apps/23614/assets/",
      appClassName: "app-23614",
      author: {
        name: "TeamViewer GmbH",
        email: "support@teamviewer.com"
      },
      translations: {"app":{"parameters":{"tv_CustomFieldId":{"label":"TeamViewer Custom Ticket Field","helpText":"The ID of your custom ticket field created for this app. The field will contain TeamViewer session information."},"tv_ShowCustomFieldInTicketView":{"label":"Show custom ticket field in ticket view."},"tv_waitingMessage":{"label":"Customer waiting message","helpText":"The message your customer will see while waiting for the supporter."},"tv_customerLinkPrefix":{"label":"Customer link text","helpText":"Use @@URL@@ in your text as placeholder for the customer link."},"tv_Debug":{"label":"Show debug messages in browser console."}}},"login":{"msg_connectingToTeamviewer":"Signing in to TeamViewer...","msg_connectionFailed":"Signing in to TeamViewer failed. Please try again.","msg_loginToOld":"Signing in to TeamViewer timed out. Please try again.","authRequired":"Please sign in to your TeamViewer account.","btn_login":"Sign In"},"main":{"msg_loginSuccess":"Successfully signed in to TeamViewer","msg_loginError":"Signing in to TeamViewer failed","msg_logoutSuccess":"Successfully signed out of TeamViewer","msg_createSessionFailed":"Error while creating a new session code","msg_customFieldWrongOrMissing":"TeamViewer field is missing, please consult the app installation instructions.","btn_createSession":"Create new session code","btn_pasteCustomerLink":"Insert link into ticket","btn_tvconnect":"Connect to session","tt_refreshSession":"Get a new session code","cpt_sessionCode":"Session Code","sessionTimedOut":"This session code timed out."},"loading":"Loading","loading_creatingSession":"Creating new session...","defaultCustomerLinkPrefix":"\n@@URL@@\n","appName":"TeamViewer"},
      templates: {"error":"<div>{{errorMsg}}</div>","iframe":"<div class=\"tv-frame-container\"><iframe id=\"tv-frame\" src=\"{{url}}\" /></div>","layout":"<style>\n.app-23614 {\n  /*Global*/\n  /*Buttons*/\n  /*Session*/\n  /*\n  .tv-session-status{\n  \tborder-radius: 5px;\n  \topacity: 0.7;\n  \tpadding: 3px 10px 3px 10px;\n  \tborder: 1px solid #999;\t\n  \tdisplay: block;\n  \tcolor: #fff;\n      font-size: 0.9em;\n  }\n  \n  .tv-session-status.timeout{\n  \tbackground-color: #a20055;\n  }\n  \n  .tv-session-status.valid{\t\n  \tbackground-color: #77b800;\t\n  }\n  */\n  /*Misc*/ }\n  .app-23614 header .logo {\n    background-image: url(\"/api/v2/apps/23614/assets/logo-small.png\"); }\n  .app-23614 ul {\n    margin-left: 0; }\n  .app-23614 footer {\n    display: none; }\n  .app-23614 li + li {\n    margin-top: 0.4em; }\n  .app-23614 li .destroy {\n    visibility: hidden; }\n  .app-23614 li:hover .destroy {\n    visibility: visible; }\n  .app-23614 .tv-wrapper {\n    position: relative; }\n  .app-23614 .tv-loading {\n    background-image: url(\"/api/v2/apps/23614/assets/ajax-loader.gif\");\n    background-repeat: no-repeat;\n    background-position: center center;\n    min-height: 75px; }\n  .app-23614 #tv-frame {\n    width: 100%;\n    height: 450px;\n    overflow: hidden; }\n  .app-23614 .btn-group.tv-group-connect {\n    padding-top: 20px; }\n  .app-23614 .btn-tvblue {\n    text-shadow: 0px 0px 1px #fff;\n    color: #fff !important;\n    border-color: #0e8ee9;\n    background: #0e8ee9;\n    background: -moz-linear-gradient(top, #0e8ee9 0%, #0c79c7 44%, #0c79c7 100%);\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #0c79c7), color-stop(44%, #0e8ee9), color-stop(100%, #0c79c7));\n    background: -webkit-linear-gradient(top, #0e8ee9 0%, #0c79c7 44%, #0c79c7 100%);\n    background: -o-linear-gradient(top, #0e8ee9 0%, #0c79c7 44%, #0c79c7 100%);\n    background: -ms-linear-gradient(top, #0e8ee9 0%, #0c79c7 44%, #0c79c7 100%);\n    background: linear-gradient(to bottom, #0e8ee9 0%, #0c79c7 44%, #0c79c7 100%);\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#0e8ee9,endColorstr=#0c79c7,GradientType=0); }\n  .app-23614 .btn-tvblue:hover {\n    background: #1f9af2;\n    background: -moz-linear-gradient(top, #1f9af2 0%, #0d88df 44%, #0d88df 100%);\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #0d88df), color-stop(44%, #1f9af2), color-stop(100%, #0d88df));\n    background: -webkit-linear-gradient(top, #1f9af2 0%, #0d88df 44%, #0d88df 100%);\n    background: -o-linear-gradient(top, #1f9af2 0%, #0d88df 44%, #0d88df 100%);\n    background: -ms-linear-gradient(top, #1f9af2 0%, #0d88df 44%, #0d88df 100%);\n    background: linear-gradient(to bottom, #1f9af2 0%, #0d88df 44%, #0d88df 100%);\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#1f9af2,endColorstr=#0d88df,GradientType=0); }\n  .app-23614 .btnLogin {\n    width: 100%;\n    margin-top: 0.4em; }\n  .app-23614 .btn.btnCreateSession {\n    display: block;\n    width: 100%; }\n  .app-23614 .btn.btnCreateSession.existingSession {\n    margin-top: 20px; }\n  .app-23614 .btn.btnRefreshSession {\n    border: none;\n    box-shadow: none;\n    background: none;\n    position: absolute;\n    top: -2px;\n    right: 0px; }\n  .app-23614 .btn.btnPasteCustomerLink {\n    width: 100%; }\n  .app-23614 .btn.btnPasteCustomerLink > span {\n    margin-left: -14px; }\n  .app-23614 .btn-tvconnect {\n    display: block; }\n  .app-23614 .tv-session-current {\n    position: relative; }\n  .app-23614 span.tv-session-code {\n    display: block;\n    text-align: left;\n    margin-bottom: 12px;\n    font-size: 13px; }\n  .app-23614 .tv-session-current .btn {\n    opacity: 1.0 !important; }\n  .app-23614 .tv-session-overlay {\n    width: 100%;\n    height: 80px;\n    background-color: #5e5e5e;\n    position: absolute;\n    opacity: 0.80;\n    border-radius: 4px;\n    padding: 4px;\n    margin-left: -4px;\n    margin-top: -4px;\n    text-align: center;\n    z-index: 1; }\n  .app-23614 .overlay-message {\n    top: 42%;\n    line-height: 0em;\n    position: relative;\n    color: #e1e1e1;\n    font-weight: bold;\n    font-size: 1.3em;\n    text-shadow: 0px 0px 1px #fff; }\n  .app-23614 .tv-session-link {\n    width: 82%; }\n  .app-23614 .tv-session-current .btn-group {\n    margin-left: 0px !important; }\n  .app-23614 .icon-tv {\n    background-image: url(\"/api/v2/apps/23614/assets/icon_refresh_normal_hover.png\");\n    background-repeat: no-repeat;\n    background-position: center center;\n    width: 14px;\n    height: 14px; }\n  .app-23614 .icon-tvrefresh {\n    background-position: 0px -15px; }\n  .app-23614 .btnRefreshSession:hover .icon-tvrefresh {\n    background-position: 0px 0px; }\n  .app-23614 .tv-debug {\n    background-color: #efefef;\n    padding: 15px;\n    margin-top: 20px;\n    margin-bottom: 20px;\n    border-radius: 5px; }\n</style>\n<header>\n  <span class=\"logo\"/>\n  <h3>{{t \"appName\"}}</h3>\n</header>\n<section data-main class=\"tv-wrapper\" />","loading":"<div class=\"tv-loading\">\n\t{{#if customLoadingMessage}}\n\t\t{{customLoadingMessage}}\n\t{{else}}\n\t\t{{t \"loading\"}}&hellip;\n\t{{/if}} \n</div>","login":"<div>\n\t<p>{{t \"login.authRequired\"}}</p>\n\t<button class=\"btn btn-tvblue btnLogin\">{{t \"login.btn_login\"}}</button>\t\n</div>","main":"{{#if tvValues}} {{! session attached }}\n\t<span class=\"tv-session-code\">{{t \"main.cpt_sessionCode\" }}: {{tvValues.code}}\n\t\t<button class=\"btn btnRefreshSession btn-mini _tooltip\" title=\"{{t \"main.tt_refreshSession\"}}\">\n\t\t\t<i class=\"icon-tvrefresh icon-tv\"></i>\n\t\t</button>\n\t</span>\n\t\n\t<div class=\"tv-session-current\">\n\t\t{{#unless sessionIsValid}} {{! session has timed out -> show overlay }}\n\t\t\t<div class=\"tv-session-overlay\"><span class=\"overlay-message\">{{t \"main.sessionTimedOut\"}}</span></div>\n\t\t{{/unless}}\n\t\t<ul>\t\t\t\t\n\t\t\t<li class=\"btn-group\">\n\t\t\t\t<button class=\"btn btnPasteCustomerLink _tooltip\" {{#unless sessionIsValid}}disabled{{/unless}}>\n\t\t\t\t\t<i class=\"icon-chevron-left icon-black\" style=\"float: left;\"></i>\n\t\t\t\t\t<span>{{t \"main.btn_pasteCustomerLink\"}}</span>\n\t\t\t\t</button>\n\t\t\t</li>\t\t\t\t\n\t\t\t<li class=\"btn-group tv-group-connect\">\n\t\t\t\t<span>\n\t\t\t\t{{#if sessionIsValid}}\n\t\t\t\t\t<a class=\"btn btn-tvconnect btn-tvblue\" href=\"{{tvValues.supporter_link}}\" target=\"_blank\">\t\t\t\t\t\t\t\n\t\t\t\t\t\t<span>{{t \"main.btn_tvconnect\"}}</span>\n\t\t\t\t\t</a>\t\t\t\t\t\t\n\t\t\t\t{{else}}\n\t\t\t\t\t<span class=\"btn btn-tvconnect\" href=\"{{tvValues.supporter_link}}\" target=\"_blank\" disabled>\n\t\t\t\t\t\t{{!<i class=\"icon-chevron-left icon-black\"></i>}}\n\t\t\t\t\t\t<span>{{t \"main.btn_tvconnect\"}}</span>\n\t\t\t\t\t</span>\t\t\t\t\t\t\n\t\t\t\t{{/if}}\n\t\t\t\t</span>\n\t\t\t</li>\t\t\t\t\n\t\t</ul>\n\t</div>\t\t\n\n\t{{#unless sessionIsValid}} {{!session has timed out}}\n\t\t<button class=\"btn btn-tvblue btnCreateSession existingSession\">{{t \"main.btn_createSession\"}}</button>\n\t{{/unless}}\n\n{{else}} {{! no session attached}}\n\t\t<button class=\"btn btn-tvblue btnCreateSession\">{{t \"main.btn_createSession\"}}</button>\n{{/if}}\n\n<div class=\"clear\"/>"},
      frameworkVersion: "1.0"
    });

  ZendeskApps["TeamViewer"] = app;
}

    with( ZendeskApps.AppScope.create() ) {
  require.modules = {
      "boolean_state.js": function(exports, require, module) {
        // Boolean state with observers
function BooleanState(app, trueCallback, falseCallback) {
  this.app = app;
  this.trueCallback = trueCallback;
  this.falseCallback = falseCallback;
  this.value = false;
}

BooleanState.prototype = {
  set: function() {
    this.app.trigger(this.trueCallback);
  },

  clear: function() {
    this.app.trigger(this.falseCallback);
  }
};

module.exports = BooleanState;

      },
      "change_event.js": function(exports, require, module) {
        module.exports = function dispatchChangeEvent(el) {
  var event;
  if (document.createEvent) {
    event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    el.dispatchEvent(event);
  } else {
    event = document.createEventObject();
    event.eventType = 'change';
    el.fireEvent('on' + event.eventType, event);
  }
};

      },
      "condition_checker.js": function(exports, require, module) {
        module.exports = function(_) {
    // satisfiesTargetCondition(Condition, [Field]) -> boolean
  function satisfiesTargetCondition(targetCondition, fields) {
    return !!_.findWhere(fields, {
      field: targetCondition.field,
      value: targetCondition.value
    });
  }

  // findParentCondition(Condition, [Condition]) -> Condition
  function findParentCondition(targetCondition, conditions) {
    return _.find(conditions, function(condition) {
      return _.contains(condition.select, targetCondition.field);
    });
  }

  // findAllParentConditions(Condition, [Condition]) -> [Condition]
  function findAllParentConditions(targetCondition, conditions) {
    return _.filter(conditions, function(condition) {
      return _.contains(condition.select, targetCondition.field);
    });
  }

  return {
    // type Id = number
    // type Field = { id: Id, value: any }
    // type Condition = {
    //   id: Id,
    //   expectedValue: any,
    //   children: [Id],
    //   requireds: [Id]
    // }

    // satisfiesCondition(Condition, [Condition], [Field]) -> boolean
    // A child can only ever be assigned to a single parent field
    // This means other parents cannot use the assigned child in a condition
    // However a parent is able to have multiple children that are not already assigned
    satisfiesCondition: function(targetCondition, conditions, fields) {
      var parentConditions = findAllParentConditions(targetCondition, conditions),
          satisfiesParentCondition = true;

      if (parentConditions.length) {
        var matchingParentCondition = _.find(parentConditions, function(condition) {
          return satisfiesTargetCondition(condition, fields);
        });
        
        if (!matchingParentCondition) { return false; }

        satisfiesParentCondition = this.satisfiesCondition(matchingParentCondition, conditions, fields);
      }

      return satisfiesParentCondition &&
        satisfiesTargetCondition(targetCondition, fields);
    },

    // allSatisfiedConditions([Condition], [Field]) -> [Condition]
    allSatisfiedConditions: function(conditions, fields) {
      return _.filter(conditions, function(condition) {
        return this.satisfiesCondition(condition, conditions, fields);
      }, this);
    },

    // requiredFieldIds([Condition]) -> [Id]
    requiredFieldIds: function(conditions) {
      return _.uniq(_.flatten(_.map(conditions, function(cond) {
        return cond.requireds;
      })));
    },

    // fieldIdsToShow([Condition], [Field]) -> [Id]
    fieldIdsToShow: function(conditions, fields) {
      return _.uniq(_.flatten(_.pluck(
        this.allSatisfiedConditions(conditions, fields), 'select')));
    },

    // allRequiredConditions([Condition]) -> [Condition]
    allRequiredConditions: function(conditions) {
      return _.filter(conditions, function(cond) {
        return cond.requireds.length > 0;
      });
    },

    // isFieldAssignedAsParent(Id, Condition, [Condition]) -> boolean
    isFieldAssignedAsParent: function(fieldId, fieldCondition, conditions) {
      var parentCondition = findParentCondition(fieldCondition, conditions);

      if (!parentCondition) { return false; }

      if (parentCondition.field === fieldId) { return true; }

      return this.isFieldAssignedAsParent(fieldId, parentCondition, conditions);
    },

    getValidConditions: function(conditions) {
      for (var i = 0; i < conditions.length; i++) {
        if (this.isFieldAssignedAsParent(conditions[i].field, conditions[i], conditions)) {
          // Reset for isFieldAssignedAsParent()
          // Performed to allow the last conflicting condition to be valid
          console.warn("Conditional fields app: rule conflict on field id " + conditions[i].field);
          conditions.splice(i, 1);
          i--; // Reduce index due to splicing, otherwise it will process undefined data
        }
      }
      return conditions;
    },

    getAllValidConditions: function(conditions) {
      if (!conditions || !conditions.length) { return []; }
      var conditionsByFormId = _.groupBy(conditions, 'formId');

      _.each(conditionsByFormId, function(conditions) {
        this.getValidConditions(conditions);
      }, this);
      return _.flatten(_.toArray(conditionsByFormId));
    }
  };
};

      },
      "partial_renderer.js": function(exports, require, module) {
        // Partial renderer
module.exports = function(renderingFunction, jqSelector, defaultState, app) {
  var func = _.bind(renderingFunction, app),
      data,
      state;

  var SpecializedPartialRenderer = function() {
    this.data = null;
    this.state = null;
  };

  SpecializedPartialRenderer.prototype.render = function(data, state) {
    this.state = this.state || defaultState;
    if (typeof data !== "undefined") {
      this.data = data;
    }
    if (typeof state !== "undefined") {
      this.state = state;
    }
    var html = func(this.data, this.state);
    app.$(jqSelector).html(html);
  };

  return new SpecializedPartialRenderer();
};

      },
      "redrawer.js": function(exports, require, module) {
        var ConditionChecker = require("condition_checker")(_);

function Redrawer() {}

Redrawer.prototype = {
  fields: function(app) {
    var fields = app.getRestrictedFields();
    var originalFields = fields;
    if (app.SELECTION.field !== null) {
      fields[app.SELECTION.field].selected = true;
    }

    _.each(app.getRestrictedRules(), function(rule) {
      fields[rule.field].assigned = true;
    });

    // filter out fields with no defined possible values
    var TYPES_BLACKLIST = ['regexp', 'decimal', 'integer'];
    fields = _.toArray(_.reject(fields, function(field) {
      return _.contains(TYPES_BLACKLIST, field.type);
    }));

    var usedFields = _.select(fields, function(field) {
      return field.assigned;
    });
    var freeFields = _.reject(fields, function(field) {
      return field.assigned;
    });

    var html = app.renderTemplate('fields', {
      usedFields: usedFields,
      freeFields: freeFields
    });
    app.$('.fields').html(html);

    // revert the state
    app.cleanUpAttributes(originalFields, ['selected', 'assigned']);
  },

  selection: function(app) {
    var fields = [];
    var originalFields = [];

    if (app.SELECTION.field && app.SELECTION.value) {
      fields = _.toArray(app.getRestrictedFields());
      fields = _.reject(fields, function(field) {
        return field.type === 'group';
      });
      originalFields = fields;

      // map each target field to the field it depends on.
      var fieldsUses = {};
      _.each(app.getRestrictedRules(), function(rule) {
        _.each(rule.select, function(target) {
          fieldsUses[target] = rule.field;
        });
      });

      var currentRule = app.getCurrentRule();

      fields = _.map(fields, (function(field) {
        // mark selected fields
        field.selected = _.contains(app.SELECTION.select, field.id);

        // mark un-selectable fields, so as they are not used to create faulty rules.
        field.unselectable = !app.setting('disable_conflicts_prevention') && !(typeof fieldsUses[field.id] === "undefined" ||
        fieldsUses[field.id] === app.SELECTION.field);

        field.required = field.systemRequired;
        if (currentRule) {
          field.required = field.systemRequired || _.contains(currentRule.requireds, field.id);
        }

        if (field.unselectable) { return field; }
        var allRules = app.allRulesForCurrentForm();
        if (!allRules.length) { return field; }

        var fieldCondition = { field: app.SELECTION.field };
        var conditions = allRules;

        if (ConditionChecker.isFieldAssignedAsParent(field.id, fieldCondition, conditions)) {
          field.unselectable = true;
        }

        return field;
      }));
    }

    var selectedCount = app.countByAttr(fields, 'selected');

    // hide the base field, so as it can't interact on itself
    fields = _.reject(fields, function(field) {
      return field.id === app.SELECTION.field;
    });

    var selectableFields = _.filter(fields, function(field) {
      return !field.unselectable;
    });
    var unselectableFields = _.filter(fields, function(field) {
      return field.unselectable;
    });

    var html = app.renderTemplate('select_fields', {
      selectableFields: selectableFields,
      unselectableFields: unselectableFields,
      total: selectableFields.length + unselectableFields.length,
      hasSelected: selectedCount > 0
    });
    app.$('.selected').html(html);

    app.$('.selected_count').html(selectedCount);

    // enable tooltips
    app.$('.selected span[data-toggle="tooltip"]').tooltip({
      placement: 'left'
    });

    // revert the state
    app.cleanUpAttributes(originalFields, ['selected']);
  },

  values: function(app) {
    var values = [];
    var originalValues = [];

    if (app.SELECTION.field) {
      values = app.storage.fields[app.SELECTION.field].values;
      originalValues = values;
      var rvalues = _.pluck(_.groupBy(app.getRestrictedRules(), 'field')[app.SELECTION.field], 'value');
      if (app.isFieldText(app.SELECTION.field)) {
        values = _.map(rvalues, function(rv) {
          return {name: rv, value: rv};
        });
      }
      values = _.map(values, (function(value) {
        value.selected = (value.value === app.SELECTION.value);
        value.assigned = _.contains(rvalues, value.value);
        return value;
      }).bind(app));
    }

    values = _.map(values, function(value) {
      value.name = app.removeDoubleColon(value.name);
      return value;
    });

    var html = app.renderTemplate('values', {values: values});
    app.$('.values').html(html);
    app.$('.values-text-input').toggle(app.isFieldText(app.SELECTION.field));

    // revert the state
    app.cleanUpAttributes(originalValues, ['selected', 'assigned']);
  }
};

module.exports = Redrawer;

      },
      "selection.js": function(exports, require, module) {
        // Object builder to provide a wrapper around the current selection.
// The 'app' parameter is the app itself. It is used to propagate changes
// and fire events.
function Selection(app) {
  this.app = app;
  this.initialize();
}

Selection.prototype = {
  initialize: function() {
    this.field = null;
    this.value = null;
    this.select = [];
  },

  _trigger: function(name, trigger) {
    if (trigger || trigger === trigger) {
      this.app.trigger(name);
    }
  },

  setField: function(field, trigger) {
    this.field = parseInt(field, 10);
    this._trigger('fieldChanged', trigger);
  },

  setValue: function(value, trigger) {
    this.value = value;
    this._trigger('valueChanged', trigger);
  },

  toggleSelect: function(id, trigger) {
    if (_.contains(this.select, id)) {
      this.select = _.reject(this.select,
        function(fid) {
          return fid === id;
        });
    }
    else {
      this.select = _.uniq(this.select.concat([id]));
    }
    this._trigger('selectionChanged', trigger);
  },

  setSelect: function(select, trigger) {
    this.select = select;
    this._trigger('selectionChanged', trigger);
  },

  getRule: function() {
    return {
      field: this.field,
      value: this.value,
      select: this.select
    };
  },

  setFromRule: function(rule) {
    this.setField(rule.field);
    this.setValue(rule.value);
    this.setSelect(rule.select);
  }
};

module.exports = Selection;

      },
    eom: undefined
  };

  var source = (function() {
  var ConditionChecker = require("condition_checker")(_),
       partialRenderer = require("partial_renderer"),
          BooleanState = require("boolean_state"),
              Redrawer = require("redrawer"),
             Selection = require("selection");

  return {
    // Used instead of browser's local stroage for performance reasons.
    storage: null,

    // Store the current mode (agent or endUser)
    currentMode: "agent",

    // Events that should be ignored
    ignoredEvents: {},

    // Store the ID of the current ticket form.
    // This variable is initialized during app activation.
    currentTicketForm: undefined,

    // Store the original labels of ticket fields.
    originalLabels: null,

    // Store the state of the current rule selection.
    // This variable is initialized during app activation.
    SELECTION: null,

    // Has any change made to the rules?
    // This is a BooleanState, initialized during app activation.
    DIRTY: null,

    // Initial copy of the rules, to allow undo / canceling.
    OLD_RULES: null,

    // New rule fields blacklist.
    // Those fields types are listed by ticket Ticket Fields API, but should not
    // be used as a trigger or target for a new rule.
    BLACKLIST: ["assignee", "subject", "description", "ccs", "ticketsharing"],

    // Protected fields blacklist.
    // Those fields must not be impacted by CFA because they have a defined
    // behaviour in Zendesk.
    PROTECTED_FIELDS: ['due_date', 'problem', 'ticket_form_id'],

    // Rules are splitted in several settings fields to allow users with a large
    // rule set to use CFA.
    RULES_FIELDS_SIZE: 63000,
    RULES_FIELDS_NUMBER: 2,

    defaultState: 'loading',

    events: {
      // App
      'app.created': 'onAppCreated',
      'app.activated': 'onAppActivation',
      'app.deactivated': 'onAppDeactivation',
      'pane.activated': 'onPaneActivation',
      '*.changed': 'fieldsChanged',

      // Requests

      // UI
      'click .main .field': 'onFieldClick',
      'click .main .value': 'onValueClick',
      'click .selectedField': 'onSelectedFieldClick',
      'click .cancel': 'onCancelClick',
      'click .save': 'onSaveClick',
      'click .deleteRule': 'onRuleDeleteClick',
      'click .deleteAll': 'onDeleteAllClick',
      'click #deleteAllModal .yes': 'onConfirmDeleteAllClick',
      'click #deleteOneModal .yes': 'onRuleDeleteConfirmClick',
      'click #requiredWarningModal .yes': 'onConfirmRulesSave',
      'click .generateSnippet': 'onGenerateSnippetClick',
      'zd_ui_change .formSelect': 'onTicketFormChange',
      'click .collapse_menu': 'onCollapseMenuClick',
      'click .ruleItem': 'onRuleItemClick',
      'click .clearSearch': 'onClearSearchClick',
      'hover .rule .value': 'onRuleMouseHover',
      'zd_ui_change .modeSwitch': 'onModeSwitchChange',
      'click .copyRules': 'onCopyRulesClick',
      'click .newSetRules': 'onNewSetRulesClick',
      'keyup .values-text-input': 'onTextValueInput',
      'click .enableRequired': 'onEnableRequired',
      'click .cancelRequired': 'onCancelRequired',
      'click .disableRequired': 'onDisableRequired',

      // Data binding
      'fieldChanged': 'onFieldChange',
      'selectionChanged': 'onSelectionChanged',
      'valueChanged': 'onValueChanged',
      'rulesDirty': 'onRulesDirty',
      'rulesClean': 'onRulesClean',
      'rulesChanged': 'onRulesChanged'
    },

    requests: {
      getPage: function(page) {
        return {
          type: 'GET',
          url: page
        };
      },

      getGroups: {
        type: 'GET',
        url: '/api/v2/groups/assignable.json'
      },

      getTicketFields: {
        type: 'GET',
        url: '/api/v2/ticket_fields.json'
      },

      getTicketForms: {
        type: 'GET',
        url: '/api/v2/ticket_forms.json'
      },

      saveRules: function(rulesString, notify) {
        if (notify || typeof notify === "undefined") {
          services.notify(this.I18n.t("notices.saved"));
        }
        var data = {
          'enabled': true,
          'settings': {}
        };
        for (var i = 0; i < this.RULES_FIELDS_NUMBER; i++) {
          // In order to upgrade smoothly, the first field does not have a suffix
          var key = (i === 0 ? this.rulesField : [this.rulesField, i].join('_'));
          data.settings[key] = rulesString.slice(i * this.RULES_FIELDS_SIZE, (i + 1) * this.RULES_FIELDS_SIZE);
          this.settings[key] = data.settings[key];
        }
        return {
          type: 'PUT',
          url: "/api/v2/apps/installations/%@.json".fmt(this.installationId()),
          dataType: 'json',
          data: data
        };
      }
    },


    // RENDERERS ===============================================================

    rulesRendering: function(rules, state) {
      var index = this.findIndexForSelection();
      // attach textual label to rules
      rules = _.map(this.getRestrictedRules(), (function(rule) {
        rule.valueText = this.removeDoubleColon(this.valueNameForRule(rule));
        rule.fieldsText = _.map(rule.select, this.nameForFieldId.bind(this)).join(', ');
        rule.selected = rule.index === index;
        return rule;
      }).bind(this));

      // group rules by fields
      var fields = _.map(this.toPairs(_.groupBy(rules, 'field')), (function(item) {
        return {
          id: item[0],
          name: this.storage.fields[item[0]].name,
          rules: item[1],
          collapsed: state.collapsed.indexOf(item[0]) !== -1,
          toCollapse: (state.collapsed.indexOf(item[0]) !== -1) !== (item[0] === state.toggleCollapsed)
        };
      }).bind(this));
      // sort rules
      fields = _.sortBy(fields, function(field) {
        return _.min(_.pluck(field.rules, 'creationDate'));
      });
      _.each(fields, function(field) {
        field.rules = _.sortBy(field.rules, 'creationDate');
      });

      // render the template
      var html = this.renderTemplate('rules', {
        fields: fields,
        count: rules.length
      });
      var generateSnippet = this.$('.generateSnippet');
      if (rules.length) {
        generateSnippet.show();
      }
      else {
        generateSnippet.hide();
      }

      _.defer((function() {
        if (state.toggleCollapsed) {
          var index = state.collapsed.indexOf(state.toggleCollapsed);
          var element = this.$(".rule[data-id=%@] ul".fmt(state.toggleCollapsed));
          if (index === -1) {
            state.collapsed.push(state.toggleCollapsed);
            element.slideDown();
          }
          else {
            state.collapsed.splice(index, 1);
            element.slideUp();
          }
          state.toggleCollapsed = null;
        }
      }).bind(this));

      return html;
    },

    // TOOLS ===================================================================

    // Implement the object() method of underscorejs, because 1.3.3 doesn't
    // include it. Simplified for our use.
    toObject: function(list) {
      if (list == null) return {};
      var result = {};
      for (var i = 0, l = list.length; i < l; i++) {
        result[list[i][0]] = list[i][1];
      }
      return result;
    },

    // Implement the pairs() method of underscorejs, because 1.3.3 doesn't
    // include it.
    toPairs: function(obj) {
      var pairs = [];
      for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
      return pairs;
    },

    // Implement the partial() method of underscorejs, because 1.3.3 doesn't
    // include it.
    partial: function(func) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
        return func.apply(this,
          args.concat(Array.prototype.slice.call(arguments)));
      };
    },

    // Implement the countBy() method of underscorejs, because 1.3.3 doesn't
    // include it.
    countBy: function(list, func) {
      var count = 0;
      _.each(list, function(obj) {
        count += (func(obj) ? 1 : 0);
      });
      return count;
    },

    showSidebar: function() {
      this.switchTo('empty');
    },

    inNavbar: function() {
      return this.currentLocation() === 'nav_bar';
    },

    isAdmin: function() {
      return this.currentUser().role() === "admin";
    },

    isFieldCustom: function(id) {
      var field = this.storage.fields[id];
      var TYPES = ['tagger', 'checkbox', 'regexp', 'decimal', 'integer', 'text', 'textarea', 'date'];
      return _.contains(TYPES, field.type);
    },

    isFieldText: function(id) {
      var field = this.storage.fields[id];
      if (!field) {
        return false;
      }
      var TYPES = ['text', 'textarea'];
      return _.contains(TYPES, field.type);
    },

    fieldNameForID: function(id) {
      var name = this.storage.fields[id].type;
      // special case for type
      if (name === 'tickettype') {
        name = 'type';
      }
      // special case for priority
      if (name === 'basic_priority') {
        name = 'priority';
      }
      // special case for custom fields
      if (this.isFieldCustom(id)) {
        name = "custom_field_%@".fmt(id);
      }
      return name;
    },

    ticketFieldForID: function(id) {
      return this.ticketFields(this.fieldNameForID(id));
    },

    fieldExists: function(id) {
      return _.has(this.storage.fields, id);
    },

    fieldValueForID: function(id) {
      if (this.isFieldCustom(id)) {
        return this.ticket().customField(this.fieldNameForID(id));
      } else if (this.storage.fields[id].type === 'group') {
        var group = this.ticket().assignee().group();
        return (typeof group === "undefined") ? '' : group.id().toString();
      } else if (this.storage.fields[id].type === 'tickettype') {
        var type = this.ticket().type();
        return type === 'ticket' ? undefined : type;
      } else if (this.storage.fields[id].type === 'priority') {
        var priority = this.ticket().priority();
        return priority === '-' ? undefined : priority;
      } else {
        return this.ticket()[this.storage.fields[id].type]();
      }
    },

    fieldPresent: function(id) {
      var value = this.fieldValueForID(id);
      var type = this.storage.fields[id].type;
      if (type === 'checkbox') {
        return value == 'yes';
      } else if (type === 'tickettype' && value == 'ticket') {
        return false;
      } else {
        return value;
      }
    },

    setFieldValueForID: function(id, value) {
      if (this.isFieldCustom(id)) {
        return this.ticket().customField(this.fieldNameForID(id), value);
      }
      else {
        return this.ticket()[this.fieldNameForID(id)](value);
      }
    },

    ticketFormForRule: function(rule, ticketForms) {
      return _.find(ticketForms, function(form) {
        return form.id === rule.formId;
      });
    },

    filterItemsCollection: function(coll, filter) {
      if (typeof filter === "undefined" || !filter.length) {
        return coll;
      }
      filter = filter.toLowerCase();
      return _.filter(coll, function(item) {
        return item.name.toLowerCase().indexOf(filter) !== -1;
      });
    },

    removeDoubleColon: function(text) {
      return text.replace(/::/g, " » ");
    },

    markRulesAsClean: function() {
      var rules = this.storage.rules;
      _.each(rules, function(rule) {
        rule.dirty = false;
      });
    },

    // A set of rules can be seen as a graph (nodes being fields and edges
    // representing the "can show" relation).
    buildAdjacencyLists: function(rules) {
      var lists = {};

      function addEdge(from, to) {
        if (!_.has(lists, from)) {
          lists[from] = [to];
        }
        else if (!_.contains(lists[from], to)) {
          lists[from].push(to);
        }
      }

      _.each(rules, function(rule) {
        _.each(rule.select, function(target) {
          addEdge(rule.field, target);
        });
      });
      return lists;
    },

    buildValuesTable: function(rules) {
      var table = {};
      _.each(rules, function(rule) {
        if (!_.has(table, rule.field)) {
          table[rule.field] = {};
        }
        _.each(rule.select, function(target) {
          if (!_.has(table[rule.field], target)) {
            table[rule.field][target] = [];
          }
          table[rule.field][target].push(rule.value);
        });
      });
      return table;
    },

    // Given some adjacency lists, find the nodes with no incoming edge.
    findStartingFields: function(fieldToFieldMap) {
      return _.difference(_.map(_.keys(fieldToFieldMap), function(x) { return parseInt(x, 10) || x; }), _.flatten(_.values(fieldToFieldMap)));
    },

    // Create a DOT representation of the adjacency lists
    generateDot: function(lists, values) {
      var buff = ["digraph dump {"];
      var fields = _.flatten([_.keys(lists), _.values(lists)]);
      fields = _.uniq(fields, false, function(k) {
        return "" + k;
      });
      _.each(fields, (function(field) {
        var name = this.ticketFieldForID(field).label();
        buff.push("%@ [label=\"%@\"];".fmt(field, name));
      }).bind(this));
      _.each(lists, function(targets, from) {
        _.each(targets, function(to) {
          buff.push("%@ -> %@ [ label=\"%@\" ];".fmt(from, to, values[from][to]));
        });
      });
      buff.push("}");
      buff = buff.join('\n');
      console.log("https://chart.googleapis.com/chart?cht=gv&chl=%@".fmt(encodeURIComponent(buff)));
      return buff;
    },

    fieldMatch: function(values, fieldId) {
      var value = this.fieldValueForID(fieldId);
      return _.contains(values, value);
    },

    // Perform rules (actually hide elements from the UI)
    // Apply rules shouldn't be called directly anywhere, it is always
    // called via `applyRulesLater` so that it runs in the next event loop.
    // The deferral allows for updates in the UI to occur before rules are applied.
    _applyRules: function(currentField) {
      // Revert all labels because we no longer know which were required anymore
      this.revertLabels();

      this.currentTicketForm = this.ticket().form().id();

      // Because some account have some tickets created when ticket forms
      // didn't exist, we need to have a default value for the current ticket
      // form. As all account have a default ticket form attached we use its
      // ID.
      if (typeof this.currentTicketForm === "undefined") {
        this.currentTicketForm = this.getDefaultFormID();
      }

      this.saveOriginalLabels();
      this.markRequiredLabels();

      // The ticket form should not always be shown: when an account only has
      // one form, the dropdown is hidden by the framework and should not be
      // revealed.
      var ticketFields = _.reject(this.ticketFields(), (function(field) {
        return _.contains(this.PROTECTED_FIELDS, field.name());
      }).bind(this));
      var rules = this.getRestrictedRules();

      // fields used in a view
      var allConditionalFields = _.uniq(_.flatten(_.pluck(rules, 'select')));
      var fieldsToHide = allConditionalFields;
      var fieldsToShow = [];

      // don't hide the current field
      if (currentField) {
        var currentFieldId = parseInt(currentField.replace(/\D+/, ''), 0);
        fieldsToHide = _.without(allConditionalFields, currentFieldId);
      }

      // required fields
      var requiredFields = this.getRequiredFields();

      var valuesThatSatisfyRules = this.buildValuesTable(rules);
      var fieldToConditionalFieldsMap = this.buildAdjacencyLists(rules);
      var startingFields = this.findStartingFields(fieldToConditionalFieldsMap);

      var enforceRulesOnFields = (function(currentFieldDoesNotSatisfyRule, fieldId) {
        if (currentFieldDoesNotSatisfyRule) {
          var key = "ticket." + this.fieldNameForID(fieldId);
          this.ignoredEvents[key] = true;
          this.setFieldValueForID(fieldId, null);
        }

        _.each(fieldToConditionalFieldsMap[fieldId], (function(conditionalFieldId) {
          var doesNotSatisfyThisTime = currentFieldDoesNotSatisfyRule,
              currField;
          if (!currentFieldDoesNotSatisfyRule) {
            if (this.fieldMatch(valuesThatSatisfyRules[fieldId][conditionalFieldId], fieldId)) {
              fieldsToShow.push(conditionalFieldId);
              currField = this.ticketFieldForID(conditionalFieldId);
              if (!currField.isVisible()) {
                currField.show();
              }
            }
            else {
              doesNotSatisfyThisTime = true;
            }
          }
          enforceRulesOnFields(doesNotSatisfyThisTime, conditionalFieldId);
        }).bind(this));
      }).bind(this);

      // perform enforceRulesOnFields to show matching fields
      _.each(startingFields, this.partial(enforceRulesOnFields, false));

      // hide all fields that are affected by CFA but not shown by rules
      _.invoke(_.map(_.difference(fieldsToHide, fieldsToShow), this.ticketFieldForID.bind(this)), 'hide');

      // disable save if any required fields are missing,
      var missing = _.any(allConditionalFields, function(fieldId) {
        return this.ticketFieldForID(fieldId).isVisible() && _.contains(requiredFields, fieldId) && !this.fieldPresent(fieldId);
      }.bind(this));

      _.defer(function() {
        if (missing) {
          this.disableSave();
        } else {
          this.enableSave();
        }
      }.bind(this));

      this.markRequiredLabels();

      // Defer the cleanup process until all triggered events finished.
      _.defer(function() {
        this.ignoredEvents = {};
      }.bind(this));
    },

    applyRulesLater: function(currentField) {
      _.defer(this._applyRules.bind(this, currentField));
    },

    findIndexForSelection: function() {
      var select = this.SELECTION;
      var rule = _.find(this.storage.rules, function(rule) {
        return rule.field === select.field && rule.value === select.value;
      });
      return rule ? rule.index : null;
    },

    storeRules: function(rules) {
      // Reindex the rules. The index acts as a temporary ID, so as we can edit
      // them easily.
      var index = 0;
      // make sure the order is consistent.
      rules = _.sortBy(rules, function(rule) {
        return [rule.field, rule.value].join(",");
      });

      this.deepCopyRules(_.map(rules, function(rule) {
        rule.index = index++;
        // ensure we have the requireds attribute (migration)
        rule.requireds = (rule.requireds || []);

        return rule;
      }), this.storage.rules);
    },

    // Compute possible values for a given field.
    valuesForField: function(field) {
      var defaultType = function(f) {
        return [{name: "Any", value: null}];
      };

      var systemFieldGetter = function(f) {
        return f.system_field_options;
      };

      var types = {
        "checkbox": function(f) {
          return [
            {name: "Yes", value: "yes"},
            {name: "No", value: "no"}
          ];
        },
        "tagger": function(f) {
          return f.custom_field_options;
        },
        "priority": systemFieldGetter,
        "tickettype": systemFieldGetter,
        "group": (function(f) {
          var values = _.map(this.storage.groups, function(group) {
            return {
              name: group.name,
              value: group.id.toString()
            };
          });
          return _.sortBy(values, 'name');
        }).bind(this)
      };

      return (types[field.type] || defaultType)(field);
    },

    // Retrieve the rule for the given field and value, or null if no such rule
    // exists.
    ruleForFieldAndValue: function(fieldId, value) {
      return _.find(this.getRestrictedRules(), function(rule) {
          return rule.field === fieldId && rule.value === value;
        }) || null;
    },

    // Add a new rule to the rule set
    newRule: function(rule) {
      rule.formId = this.currentTicketForm;
      rule.field = parseInt(rule.field, 10);
      rule.dirty = true;
      var rules = [];
      this.deepCopyRules(this.storage.rules, rules);
      var hash = rule.formId + rule.field + rule.value;
      // remove any old version of the rule
      var oldRule = _.find(rules, function(irule) {
        return hash === irule.formId + irule.field + irule.value;
      });

      var index = oldRule ? _.indexOf(rules, oldRule) : null;

      if (oldRule) { // this is a rule edition or deletion
        rule.creationDate = oldRule.creationDate;
        rules.splice(index, 1);
        rule.requireds = oldRule.requireds;
      }
      else { // this is a rule creation
        rule.creationDate = new Date().getTime();
        rule.requireds = [];
      }
      if (rule.select.length > 0) {
        rules.push(rule);
      }

      this.storeRules(rules);
    },

    // count the number of items in coll with an attribute which evaluates to
    // true.
    countByAttr: function(coll, attr) {
      return _.filter(coll, function(item) {
        return item[attr];
      }).length;
    },

    removeRule: function(index) {
      var rules = this.storage.rules;
      rules.splice(index, 1);
      this.storeRules(rules);
      this.DIRTY.set();
      this.SELECTION.initialize();
      this.trigger('fieldChanged');
      this.trigger('valueChanged');
      this.trigger('selectionChanged');
    },

    reset: function() {
      this.storeRules(this.OLD_RULES);
      this.SELECTION.initialize();
      this.trigger('fieldChanged');
      this.trigger('valueChanged');
      this.trigger('selectionChanged');
      this.DIRTY.clear();
    },

    saveRules: function(options) {
      options = options || {};

      var rulesString;

      if (typeof options.check === "undefined" || options.check) {
        // options.check if some rules target required fields
        var rulesWithRequired = _.map(this.getRestrictedRules(), (function(rule) {
          return [rule, _.intersection(rule.select, this.storage.requiredFieldsIds)];
        }).bind(this));
        var suspectRules = _.filter(rulesWithRequired, function(rule) {
          return rule[1].length;
        });

        // branch out and display a window if so.
        if (suspectRules.length) {
          return this.displayRequiredWarning(suspectRules);
        }

        rulesString = JSON.stringify(this.storage.rules);
        if (rulesString.length > this.RULES_FIELDS_SIZE * this.RULES_FIELDS_NUMBER) {
          return this.$("#limitReachedModal").modal();
        }
      }

      this.markRulesAsClean();
      rulesString = rulesString || JSON.stringify(this.storage.rules);
      this.deepCopyRules(this.storage.rules, this.OLD_RULES);
      this.DIRTY.clear();

      // persist the rules
      if (this.isAdmin()) {
        this.ajax('saveRules', rulesString, options.notify);
      }
    },

    displayRequiredWarning: function(rules) {
      var modal = this.$("#requiredWarningModal");
      var rulesList = modal.find(".faultyRules");
      rulesList.html('');
      _.each(rules, (function(rule) {
        var fields = _.map(rule[0].select, (function(fieldId) {
          return {
            text: this.nameForFieldId(fieldId),
            required: _.contains(rule[1], fieldId)
          };
        }).bind(this));
        var data = {
          title: "%@ > %@".fmt(this.nameForFieldId(rule[0].field), this.valueNameForRule(rule[0])),
          fields: fields
        };
        var html = this.renderTemplate('required_rule', data);
        rulesList.append(html);
      }).bind(this));

      modal.modal();
    },

    deepCopyRules: function(from, to) {
      to.length = 0; // reset the destination array
      _.each(from, (function(rule) {
        var newRule = {};
        _.each(rule, function(value, key) {
          newRule[key] = value;
        });
        to.push(newRule);
      }).bind(this));
    },

    nameForFieldId: function(id) {
      return this.storage.fields[id].name;
    },

    valueNameForRule: function(rule) {
      if (this.isFieldText(rule.field)) {
        return rule.value;
      }

      var targetField = this.storage.fields[rule.field];
      if (!targetField) {
        return null;
      }

      var option = _.find(targetField.values,
        function(v) {
          return v.value === rule.value;
        });

      return option ? option.name : null;
    },

    getCurrentTicketForm: function() {
      return _.find(this.storage.ticketForms, (function(form) {
        return form.id === this.currentTicketForm;
      }).bind(this));
    },

    getRestrictedFields: function() {
      var restricted_arr = _.filter(this.storage.fields, (function(field) {
        return typeof this.currentTicketForm === "undefined" ||
          _.contains(this.getCurrentTicketForm().ticket_field_ids, field.id);
      }).bind(this));

      if (this.currentMode === 'endUser') {
        restricted_arr = _.filter(restricted_arr, function(field) {
          return field.visibleInPortal;
        });
      }

      restricted_arr = _.reject(restricted_arr, function(field) {
        return field.type === 'status';
      });

      // rename group to assignee
      var group = _.find(restricted_arr, function(field) {
        return field.type === 'group';
      });
      if (group) {
        group.name = this.I18n.t('fields.group');
      }

      var pairs = _.map(restricted_arr, function(field) {
        return [field.id, field];
      });
      return this.toObject(pairs);
    },

    getRestrictedRules: function() {
      return _.filter(this.storage.rules, (function(rule) {

        return rule.formId === this.currentTicketForm;
      }).bind(this));
    },

    getDefaultFormID: function() {
      var attr = 'default';
      return _.find(this.storage.ticketForms, function(form) {
        return form['default'];
      }).id;
    },

    updateFilterCrossState: function(target) {
      var input = this.$(target);
      var cross = input.parent().find('.clearSearch');
      if (input.val().length) {
        cross.fadeIn();
      }
      else {
        cross.fadeOut();
      }
    },

    cleanUpAttributes: function(coll, names, value) {
      var isGetter = _.isFunction(value);
      _.each(coll, function(item) {
        _.each(names, function(name) {
          item[name] = isGetter ? value(item) : value;
        });
      });
    },

    getNameForSystemField: function(allFields, fieldId) {
      if (!fieldId) { return; }
      var systemTypes = ['tickettype', 'priority'];
      var fieldType = allFields[fieldId].type;
      var result = fieldId;

      if (_.contains(systemTypes, fieldType)) {
        result = fieldType;
        // Special case so that Helpcenter can identify field as type
        if (result === 'tickettype') { result = 'type'; }
      }
      return result;
    },

    getNamesForSystemFields: function(allFields, fieldIds) {
      if (!fieldIds || fieldIds === []) { return; }
      return _.map(fieldIds, function(fieldId) {
        return this.getNameForSystemField(allFields, fieldId);
      }, this);
    },

    // EVENTS ==================================================================

    // App ---------------------------------------------------------------------

    onPaneActivation: function() {
      if (this.isAdmin()) {
        this.SELECTION.initialize();
        this.switchTo('choices', {
          has_forms: _.filter(this.storage.ticketForms, function(form) {
            return form.active;
          }).length > 1,
          forms: this.storage.ticketForms,
          isEndUser: this.currentMode === 'endUser',
          firstTimeEndUser: this.currentMode === 'endUser' && !this.storage.rules.length
        });
        _.defer(function() {
          this.$('.modeSwitch').zdSelectMenu('setValue', this.currentMode);
          this.$('.formSelect').zdSelectMenu('setValue', this.currentTicketForm);
        }.bind(this));
        this.DIRTY.clear();
        // XXX
        this.trigger('fieldChanged');
      }
      else {
        this.switchTo('denied');
      }
    },

    onPaneDeactivation: function() {
      this.showSidebar();
    },

    onAppDeactivation: function() {
      this.revertLabels();
    },

    onAppCreated: function() {
      this.originalLabels = {};
      this.redraw = new Redrawer();
      this.SELECTION = new Selection(this);
      this.DIRTY = new BooleanState(this, 'rulesDirty', 'rulesClean');
      this.rulesPartialRenderer = partialRenderer(
        this.rulesRendering,
        '.all_rules', {
        selection: this.SELECTION,
        collapsed: []
        },
        this
      );
    },

    onAppActivation: function() {
      this.storage = _.defaults(_.pick(this.storage || {}, 'fields', 'allTicketForms', 'groups'), {
        rules: [],
        fields: [],
        allTicketForms: [],
        ticketForms: [],
        requiredFieldsIds: [],
        groups: {}
      });

      this.OLD_RULES = [];
      this.rulesField = (this.currentMode === 'agent' ? 'rules' : 'user_rules');
      var rules = this.readRulesFromSettings(this.rulesField);

      this.getInitData().then((function() {
        if (this.currentMode === 'endUser') {
          this.storage.ticketForms = _.filter(this.storage.allTicketForms, function(ticketForm) {
            return ticketForm.end_user_visible;
          });
        } else {
          this.storage.ticketForms = this.storage.allTicketForms;
        }

        this.storeRules(this.sanitizeRules(rules, this.storage.ticketForms));
        this.deepCopyRules(this.storage.rules, this.OLD_RULES);

        if (this.storage.ticketForms.length > 0) {
          this.currentTicketForm = this.storage.ticketForms[0].id;
        }
        if (this.inNavbar()) {
          this.onPaneActivation();
        }
        else {
          this.showSidebar();
          this.applyRulesLater();
        }
      }).bind(this));
    },

    readRulesFromSettings: function(rulesField) {
      var text = '';

      for (var i = 0; i < this.RULES_FIELDS_NUMBER; i++) {
        // In order to upgrade smoothly, the first field does not have a suffix
        var key = (i === 0 ? rulesField : [rulesField, i].join('_'));
        var value = this.setting(key);
        if (value) {
          text = text + value;
        }
      }
      if (!text.length) {
        text = '[]';
      }

      return ConditionChecker.getAllValidConditions(JSON.parse(text));
    },

    getAllGroups: function() {
      return this.promise(function(resolve, reject) {
        var groups = [];

        function fail(err) {
          reject(err);
        }

        function done(data) {
          groups = groups.concat(data.groups);

          if (data.next_page) {
            this.ajax('getPage', data.next_page).done(done).fail(fail);
          } else {
            resolve({
              groups: groups,
              count: groups.length
            });
          }
        }

        this.ajax('getGroups').done(done).fail(fail);
      });
    },

    getInitData: function() {
      if (!this.storage.ticketForms.length) {
        return this.when(this.getAllGroups(), this.ajax('getTicketFields'), this.ajax('getTicketForms')).then(function(groupsObj, ticketFieldsObj, ticketFormsObj) {
          // note: groupsObj structure differs to ticketFieldsObj and ticketFormsObj
          this.onGetGroups(groupsObj);
          this.onGetTicketFields(ticketFieldsObj[0]);
          this.onGetTicketForms(ticketFormsObj[0]);
        }.bind(this));
      } else {
        return this.promise(function(done, fail) {
          done();
        });
      }
    },

    saveOriginalLabels: function() {
      if (typeof this.ticketFields !== "undefined") {
        var requiredFields = this.getRequiredFields();

        _.each(requiredFields, function(id) {
          this.originalLabels[id] = this.ticketFieldForID(id).label();
        }.bind(this));
      }
    },

    markRequiredLabels: function() {
      if (typeof this.ticketFields !== "undefined") {
        var requiredFields = this.getRequiredFields();

        _.each(requiredFields, function(id) {
          var field = this.ticketFieldForID(id);
          field.label("%@*".fmt(this.originalLabels[id]));
        }.bind(this));
      }
    },

    revertLabels: function() {
      if (typeof this.ticketFields !== "undefined") {
        _.each(this.originalLabels, function(label, id) {
          var field = this.ticketFieldForID(id);
          if (field && label) {
            field.label(label);
          }
        }.bind(this));
      }
    },

    getRequiredFields: function() {
      var matchingRules = _.filter(this.getRestrictedRules(), function(rule) {
        return this.fieldValueForID(rule.field) == rule.value;
      }.bind(this));
      return _.uniq(_.flatten(_.pluck(matchingRules, 'requireds')));
    },

    fieldsChanged: function(event) {
      if (this.ignoredEvents[event.propertyName]) {
        event.preventDefault();
        return;
      }
      if (typeof this.ticketFields !== "undefined") {
        if (event.propertyName === 'ticket.form.id') {
          this.currentTicketForm = event.newValue;
          this.applyRulesLater();
        }
        else {
          var restrictedRules = this.getRestrictedRules();
          var fields = _.uniq(_.flatten(_.map(restrictedRules, function(rule) {
            return rule.select.concat([rule.field]);
          })));
          fields = _.map(fields, function(id) {
            return "ticket.%@".fmt(this.fieldNameForID(id));
          }.bind(this));

          // special case for ticket's assignee / group
          if (event.propertyName.indexOf('ticket.assignee.') === 0) {
            event.propertyName = 'ticket.group';
          }
          if (_.contains(fields, event.propertyName)) {
            this.applyRulesLater(event.propertyName);
          }
        }
      }
    },

    sanitizeRules: function(rules, ticketForms) {
      var validators = {
        allTargetsExist: function(rule) {
          return _.every(rule.select.concat([rule.field]), this.fieldExists.bind(this));
        },
        valueStillExists: function(rule) {
          return !!this.valueNameForRule(rule);
        },
        formHasAllFields: function(rule) {
          var form = this.ticketFormForRule(rule, ticketForms);
          if (!form) {
            return false;
          }
          var fields = rule.select.concat([rule.field]);
          return _.every(fields, function(field) {
            return _.contains(form.ticket_field_ids, field);
          });
        }
      };

      return _.select(rules, function(rule) {
        return _.every(_.values(validators), function(f) {
          return f.apply(this, [rule]);
        }.bind(this));
      }.bind(this));
    },

    // Requests ----------------------------------------------------------------

    onGetTicketFields: function(data) {
      var fields = _.reject(data.ticket_fields, (function(field) {
        if (!field.active) {
          return true;
        }
        if (_.contains(this.BLACKLIST, field.type)) {
          return true;
        }
        return false;
      }).bind(this));

      this.storage.fields = this.toObject(_.map(fields, (function(field) {
        field.id = parseInt(field.id, 10);
        var required = false;
        if (!this.setting('disable_conflicts_prevention')) {
          required = (this.currentMode === 'endUser' ? field.required_in_portal : field.required);
        }
        return [field.id, {
          id: field.id,
          name: (this.currentMode === 'endUser' ? field.title_in_portal : field.title),
          type: field.type,
          values: this.valuesForField(field),
          systemRequired: required,
          visibleInPortal: field.visible_in_portal
        }];
      }).bind(this)));

      var requiredFields = _.filter(this.storage.fields, function(field) {
        return field.required;
      });

      this.storage.requiredFieldsIds = _.pluck(requiredFields, 'id');
    },

    onGetTicketForms: function(data) {
      this.storage.allTicketForms = _.filter(data.ticket_forms, function(ticketForm) {
        return ticketForm.active;
      });
    },

    onGetGroups: function(data) {
      this.storage.groups = data.groups;
    },

    // UI ----------------------------------------------------------------------

    onDeleteAllClick: function(event) {
      event.preventDefault();
      this.$("#deleteAllModal").modal();
    },

    onConfirmDeleteAllClick: function(event) {
      event.preventDefault();

      // remove all rules on the current ticket form
      this.OLD_RULES = _.reject(this.OLD_RULES, (function(rule) {
        return rule.formId === this.currentTicketForm;
      }).bind(this));

      this.reset();
      this.saveRules({ notify: false, check: false });
      services.notify(this.I18n.t("notices.allDeleted"), "error");
    },

    onConfirmRulesSave: function(event) {
      event.preventDefault();
      this.saveRules({ notify: true, check: false });
    },

    onTicketFormChange: function(event) {

      var $formSelect = this.$(".formSelect"),
          id = parseInt($formSelect.zdSelectMenu('value'), 10),
          formChanged = this.currentTicketForm && this.currentTicketForm != id,
          ignoreEvent = this.ignoredEvents['zd_ui_change .formSelect'],
          unsavedChanges = this.dirtyRulesCount();

      if (!ignoreEvent) {
        this.when((formChanged && unsavedChanges) ? this.unsavedChangesModal() : null).then(function onOk(saveRules) {
          if (saveRules) {
            this.saveRules();
          }

          this.currentTicketForm = id;
          this.reset();
        }.bind(this), function onCancel() {
          // Revert form change and ignore the event so we don't show a modal twice
          this.ignoredEvents['zd_ui_change .formSelect'] = true;
          $formSelect.zdSelectMenu('setValue', this.currentTicketForm);
          this.ignoredEvents['zd_ui_change .formSelect'] = false;
        }.bind(this));
      }
    },

    onFieldClick: function(event) {
      event.preventDefault();
      this.onDisableRequired(event);
      this.SELECTION.setField(this.$(event.target).attr('value'));
      this.SELECTION.setValue(null);
      this.SELECTION.setSelect([]);
    },

    onValueClick: function(event) {
      event.preventDefault();
      this.onDisableRequired(event);
      this.SELECTION.setValue(this.$(event.target).attr('value'), 10);

      var rule = this.ruleForFieldAndValue(parseInt(this.SELECTION.field, 10),
        this.SELECTION.value);

      this.SELECTION.setSelect(rule !== null ? rule.select : []);
    },

    onSelectedFieldClick: _.debounce(function(event) {
      event.preventDefault();
      var link = this.$(event.target);
      if (!link.parent().hasClass('unselectable')) {
        var id = parseInt(link.attr('value'), 10);
        var rule = this.getCurrentRule();
        if (rule) {
          var index = rule.requireds.indexOf(id);
          if (index >= 0) {
            rule.requireds.splice(index, 1);
          }
        }
        this.SELECTION.toggleSelect(id);
      }
    }, 200, true),

    onCancelClick: function(event) {
      event.preventDefault();
      this.reset();
    },

    onSaveClick: function(event) {
      this.onDisableRequired(event);
      this.saveRules();
    },

    onRuleDeleteClick: function(event) {
      event.preventDefault();
      var index = parseInt(this.$(event.target).attr('value'), 10);
      var rule = this.storage.rules[index];
      var text = "%@ > %@".fmt(this.nameForFieldId(rule.field), this.valueNameForRule(rule));
      this.$("#deleteOneModal .modalRuleDisplay h4").html(text);
      text = _.map(rule.select, this.nameForFieldId.bind(this)).join(', ');
      this.$("#deleteOneModal .modalRuleDisplay p").html(text);
      this.$("#deleteOneModal .yes").attr('value', index);
      this.$("#deleteOneModal").modal();
    },

    onRuleDeleteConfirmClick: function(event) {
      event.preventDefault();
      var index = this.$(event.target).attr('value');
      this.removeRule(index);
      services.notify(this.I18n.t("notices.deleted"), "error");
      this.saveRules({ notify: false, check: false });
    },

    onGenerateSnippetClick: function(event) {
      var rules = [];
      var fields = this.storage.fields;

      this.deepCopyRules(this.storage.rules, rules);
      rules = _.map(rules, function(rule) {
        if (!_.has(fields, rule.field)) {
          return null;
        }

        return {
          fieldType: fields[rule.field].type,
          field: this.getNameForSystemField(fields, rule.field),
          value: rule.value,
          select: this.getNamesForSystemFields(fields, rule.select),
          formId: rule.formId,
          requireds: this.getNamesForSystemFields(fields, rule.requireds) || []
        };
      }, this);
      var rulesString = JSON.stringify(_.compact(rules));
      var snippet = [
        '<script src="https://zendesk.tv/conditional_fields/helpcenter.js"></script>',
        helpers.fmt('<script>var cfaRules = %@;</script>', rulesString)
      ].join('\n');
      this.$("#snippetModal .modalSnippetCode").text(snippet);
      this.$("#snippetModal").modal();
    },

    onFilterFieldsChange: function(event) {
      this.redraw.fields(this);
      this.updateFilterCrossState(event.target);
    },

    onFilterValuesChange: function(event) {
      this.redraw.values(this);
      this.updateFilterCrossState(event.target);
    },

    onFilterSelectedFieldsChange: function(event) {
      this.redraw.selection(this);
      this.updateFilterCrossState(event.target);
    },

    onCollapseMenuClick: function(event) {
      event.preventDefault();
      var id = this.$(event.target).closest('.collapse_menu').attr('value');
      this.rulesPartialRenderer.state.toggleCollapsed = id;
      this.rulesPartialRenderer.render();
    },

    onRuleItemClick: function(event) {
      event.preventDefault();
      var link = this.$(event.target);
      var index = link.attr('value');
      var rule = this.storage.rules[index];
      this.SELECTION.setFromRule(rule);
      this.rulesPartialRenderer.render();
    },

    onClearSearchClick: function(event) {
      event.preventDefault();
      this.$(event.target).parent().find("input").val('').trigger('keyup');
    },

    onRuleMouseHover: function(event) {
      var element = this.$(event.target).closest('.rule li.value');
      if (!element.hasClass('hardSelect')) {
        var deleteLink = element.find('.deleteRule');
        if (event.type === 'mouseenter') {
          element.addClass('selectedRule');
          deleteLink.show();
        }
        else {
          element.removeClass('selectedRule');
          deleteLink.hide();
        }
      }
    },

    onModeSwitchChange: function(event) {
      var $modeSwitch = this.$('.modeSwitch'),
          newMode = $modeSwitch.zdSelectMenu('value'),
          modeChanged = newMode !== this.currentMode,
          ignoreEvent = this.ignoredEvents['zd_ui_change .modeSwitch'],
          unsavedChanges = this.dirtyRulesCount();

      if (modeChanged && !ignoreEvent) {
        this.when(unsavedChanges ? this.unsavedChangesModal() : null).then(function onOk(saveRules) {
          if (saveRules) {
            this.saveRules();
          }

          this.currentMode = newMode;
          this.switchTo('loading');
          this.onAppActivation();
        }.bind(this), function onCancel() {
          // Revert mode switch and ignore the event so we don't show a modal twice
          this.ignoredEvents['zd_ui_change .modeSwitch'] = true;
          $modeSwitch.zdSelectMenu('setValue', this.currentMode);
          this.ignoredEvents['zd_ui_change .modeSwitch'] = false;
        }.bind(this));
      }
    },

    onCopyRulesClick: function(event) {
      this.$('.firstTimeEndUser').html(this.renderTemplate('loading'));

      var rulesToCopy = this.readRulesFromSettings('rules');
       // reject rules that are not part of the current set of forms
      rulesToCopy = _.reject(rulesToCopy, function(rule) {
        return !this.ticketFormForRule(rule, this.storage.ticketForms);
      }.bind(this));

      this.storeRules(rulesToCopy);

      this.DIRTY.clear();
      this.trigger('fieldChanged');
      this.$('.firstTimeEndUser').hide();
      this.$('.table').show();
      this.saveRules();
    },

    onNewSetRulesClick: function(event) {
      this.$('.firstTimeEndUser').hide();
      this.$('.table').show();
    },

    onTextValueInput: function(event) {
      var value = this.$('.values-text-input').val();
      this.SELECTION.setValue(value.length ? value : null, true);
      this.SELECTION.setSelect([], true);
    },

    // Data binding ------------------------------------------------------------

    // Redraw the value column based on the currently selected field and the
    // currently selected value.
    onValueChanged: function(event) {
      this.redraw.values(this);
    },

    // Redraw the field column based on the currently selected field
    onFieldChange: function(event) {
      this.redraw.fields(this);
    },

    // Redraw the selection column based on the current selection
    onSelectionChanged: function(event) {
      // update the current rule
      this.newRule(this.SELECTION.getRule());
      this.redraw.selection(this);
      this.trigger('fieldChanged');
      this.trigger('valueChanged');
      this.DIRTY.set();
    },

    ruleHash: function(rule) {
      return rule.formId + rule.field + rule.value;
    },

    findMatchingRule: function(set, rule) {
      var FIELDS = ['formId', 'field', 'value'];
      return _.find(set, function(oldRule) {
        return _.all(FIELDS, function(field) {
          return oldRule[field] === rule[field];
        });
      });
    },

    arraysSimilar: function(array1, array2) {
      if (array1.length !== array2.length) {
        return false;
      }
      return _.intersection(array1, array2).length === array1.length;
    },

    dirtyRulesCount: function() {
      // count added and modified rules
      var dirtyCount = this.countBy(this.storage.rules, function(rule) {
        var oldRule = this.findMatchingRule(this.OLD_RULES, rule);
        return !oldRule || !this.arraysSimilar(oldRule.select, rule.select) || !this.arraysSimilar(oldRule.requireds, rule.requireds);
      }.bind(this));

      // count removed rules
      dirtyCount += Math.max(this.OLD_RULES.length - this.storage.rules.length, 0);

      return dirtyCount;
    },

    onRulesDirty: function(event) {
      var dirtyCount = this.dirtyRulesCount();
      if (dirtyCount) {
        this.$('.cfa_navbar').find('.cancel, .save').removeAttr('disabled');
        var text = helpers.fmt("%@ (%@)", this.I18n.t('rules.save'), dirtyCount);
        this.$('.cfa_navbar .save').html(text);
      } else {
        this.$('.cfa_navbar').find('.cancel, .save').attr('disabled', true);
        this.$('.cfa_navbar .save').html(this.I18n.t('rules.save'));
      }
      this.trigger('rulesChanged');
    },

    onRulesClean: function(event) {
      this.$('.cfa_navbar').find('.cancel, .save').attr('disabled', true);
      this.$('.cfa_navbar .save').html(this.I18n.t('rules.save'));
      this.trigger('rulesChanged');
    },

    onRulesChanged: function(event) {
      this.rulesPartialRenderer.render(this.getRestrictedRules());
      var deleteAllButton = this.$('.deleteAll');
      if (this.storage.rules.length) {
        deleteAllButton.show();
      }
      else {
        deleteAllButton.hide();
      }
    },

    onEnableRequired: function(event) {
      this.newRequires = [];
      event.preventDefault();
      this.$('.enable-required').hide();
      this.$('.disable-required').show();
      this.$('.selected input').prop('checked', false).show();
      var $ = this.$;
      this.$('.selected li.required').each(function() {
        $(this).find('input').prop('checked', true);
        $(this).find('.requiredTag').hide();
      });
    },

    getCurrentRule: function() {
      var sel = this.SELECTION.getRule(),
          app = this;
      return _.find(this.storage.rules, function(rule) {
        return rule.field == sel.field &&
          rule.value == sel.value &&
          rule.formId === app.currentTicketForm;
      });
    },

    allRulesForCurrentForm: function() {
      var app = this;

      return _.filter(this.storage.rules, function(rule) {
        return rule.formId === app.currentTicketForm;
      });
    },

    // Shows the unsaved changes modal and returns a promise representing the user's choice
    unsavedChangesModal: function() {
      return this.promise(function(done, fail) {
        var $modal = this.$("#unsavedChangesModal").modal();
        $modal.on('hide', function() {
          _.delay(fail);
        });
        $modal.find(".yes").on('click', function(event) {
          _.delay(done.bind(null, true));
        });
        $modal.find(".no").on('click', function(event) {
          _.delay(done.bind(null, false));
        });
      });
    },

    onDisableRequired: function(event) {
      event.preventDefault();
      this.$('.enable-required').show();
      this.$('.disable-required').hide();

      var $ = this.$;
      var rule = this.getCurrentRule();
      if (rule && this.$('.selected input:visible').size()) {
        rule.requireds = [];
        this.$('.selected input').each(function() {
          var checkbox = $(this);
          if (checkbox.is(':checked')) {
            var id = parseInt(checkbox.data('value'), 10);
            rule.requireds.push(id);
          }
        });
      }
      this.redraw.selection(this);
      this.DIRTY.set();
    }
  };
}());
;
}
var app = ZendeskApps.defineApp(source)
  .reopenClass({"location":{"zendesk":{"nav_bar":"_legacy","ticket_sidebar":"_legacy","new_ticket_sidebar":"_legacy"}},"noTemplate":["ticket_sidebar","new_ticket_sidebar"],"singleInstall":false,"signedUrls":false})
  .reopen({
    appName: "Conditional Fields",
    appVersion: "1.2.5",
    assetUrlPrefix: "https://19078.apps.zdusercontent.com/19078/assets/1468478022-80c029e485ae429672f5a18334d30441/",
    appClassName: "app-19078",
    author: {
      name: "Zendesk",
      email: "support@zendesk.com"
    },
    translations: {"app":{"parameters":{"disable_conflicts_prevention":{"label":"Supprimer les avertissements de prévention des conflits","helpText":"Faites preuve de prudence si vous activez ce paramètre."}}},"rules":{"empty":"Sélectionner votre première condition","helpText":"Configurez vos conditions pour créer vos champs conditionnels. Sélectionnez un champ, une valeur pour ce champ et le champ approprié à afficher.","title":"Gérer les champs conditionnels","summary":"Conditions dans ce formulaire ({{count}})","fields":"Champs","values":"Valeurs","select":"Champs à afficher","cancel":"Annuler les modifications","save":"Enregistrer","copy":"Copier les règles de champs conditionnels d’agent","or":"ou","newSet":"Commencer un nouveau jeu de règles","deleteAll":"Supprimer toutes les règles conditionnelles","deleteAllForForm":"Delete all conditional rules for this form","formLabel":"Formulaire de ticket :","modeLabel":"Conditions pour :","generateSnippet":"Générer des règles pour le centre d’aide","requiredWarning":"Ce champ est obligatoire.","alreadyUsedFieldError":"Ce champ est déjà utilisé dans une autre règle.","valuesTextInput":"Saisir le texte pour déclencher la règle"},"modes":{"agent":"Agent","endUser":"Utilisateur final"},"fields":{"group":"Groupes"},"notices":{"saved":"Vos règles ont été enregistrées.","allDeleted":"Toutes vos règles ont été supprimées.","deleted":"Votre règle a été supprimée."},"loading":"Chargement...","modal":{"unsavedChanges":{"title":"Unsaved changes","text":"There are unsaved changes which will be lost if you continue, do you want to save them first?","yes":"Yes, Save changes","no":"No, don't save changes","cancel":"Cancel"},"limitReached":{"title":"Limite de stockage atteinte","text":"Vous avez atteint la limite de stockage de règles. Vous devez réduire le nombre de règles.","cancel":"Annuler"},"snippet":{"title":"Générer des règles pour le centre d’aide","text":"Vous devez coller ce snippet de code dans le modèle Titre du document du centre d’aide.","dismiss":"Annuler"},"deleteAll":{"title":"Supprimer toutes les règles ?","text":"Si vous cliquez sur Oui, toutes vos règles seront supprimées de façon permanente.","yes":"Oui, supprimer toutes les règles","no":"Annuler"},"deleteOne":{"title":"Supprimer la règle ?","text":"Voulez-vous vraiment supprimer la règle suivante ? Cette action est irréversible.","yes":"Confirmer","no":"Annuler"},"requiredWarning":{"title":"Cette règle affecte un champ obligatoire.","text":"Voulez-vous vraiment enregistrer la règle suivante ? N’oubliez pas que cela peut empêcher vos agents d’envoyer des tickets car la règle suivante affecte un champ obligatoire :","cancel":"Annuler et retourner à la modification","yes":"Confirmer et enregistrer"}},"appstatus":"L’application s’exécute sur ce ticket.","docLink":"En savoir plus…","accessdenied":"Cette page est réservée aux administrateurs. Veuillez contacter votre administrateur Zendesk pour en savoir plus.","separators":{"availableCount":"Disponible(s) ({{count}})","available":"Disponible(s)","existing":"Conditions existantes ({{count}})","unavailable":"Indisponible(s)"},"required":{"enable":"Obligatoire","disable":"Terminé","required":"(obligatoire)"}},
    templates: {"choices":"\u003cdiv class=\"pane left\"\u003e\n  \u003caside class=\"sidebar\"\u003e\n    \u003ch4\u003e{{t \"rules.modeLabel\"}}\u003c/h4\u003e\n    \u003cselect class='modeSwitch' data-zd-type=\"select_menu\"\u003e\n      \u003coption value=\"agent\"\u003e{{t \"modes.agent\"}}\u003c/option\u003e\n      \u003coption value=\"endUser\"\u003e{{t \"modes.endUser\"}}\u003c/option\u003e\n    \u003c/select\u003e\n\n    {{#if has_forms}}\n      \u003ch4\u003e{{t \"rules.formLabel\"}}\u003c/h4\u003e\n      \u003cselect id=\"form\" data-zd-type=\"select_menu\" class='formSelect'\u003e\n        {{#forms}}\n        \u003coption value=\"{{id}}\"\u003e{{name}}\u003c/option\u003e\n        {{/forms}}\n      \u003c/select\u003e\n    {{/if}}\n\n    \u003cdiv class=\"all_rules\"\u003e\u003c/div\u003e\n\n    {{#if isEndUser}}\n      \u003cbutton class=\"generateSnippet btn\"\u003e{{t \"rules.generateSnippet\"}}\u003c/button\u003e\n    {{/if}}\n  \u003c/aside\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"pane right section\"\u003e\n  \u003csection class=\"main\"\u003e\n    \u003cdiv class='intro'\u003e\n      \u003ch3\u003e{{t \"rules.title\"}}\u003c/h3\u003e\n      \u003cp\u003e{{t \"rules.helpText\"}} \u003ca href=\"https://support.zendesk.com/entries/26674953-Using-the-Conditional-Fields-app-Enterprise-Only-\" target=\"_blank\"\u003e{{t \"docLink\"}}\u003c/a\u003e\u003c/p\u003e\n    \u003c/div\u003e\n\n    {{#if firstTimeEndUser}}\n      \u003cdiv class='firstTimeEndUser'\u003e\n\n        \u003cbutton class='copyRules btn'\u003e{{t \"rules.copy\"}}\u003c/button\u003e\n        \u003cspan class='or'\u003e{{t \"rules.or\"}}\u003c/span\u003e\n        \u003cbutton class='newSetRules btn'\u003e{{t \"rules.newSet\"}}\u003c/button\u003e\n\n      \u003c/div\u003e\n    {{/if}}\n\n\n\n    \u003cul class=\"table-header clearfix\"\u003e\n        \u003cli\u003e{{t \"rules.fields\"}}\u003c/li\u003e\n        \u003cli\u003e{{t \"rules.values\"}}\u003c/li\u003e\n        \u003cli\u003e{{t \"rules.select\"}} (\u003cspan class=\"selected_count\"\u003e0\u003c/span\u003e)\u003c/li\u003e\n    \u003c/ul\u003e\n\n\n    \u003cdiv class='table-wrapper'\u003e\n        \u003ctable class=\"table {{#if firstTimeEndUser}}hide{{/if}}\"\u003e\n            \u003ctbody\u003e\n            \u003ctr\u003e\n                \u003ctd class=\"fields\"\u003e\u003c/td\u003e\n                \u003ctd\u003e\n                    \u003cinput class='values-text-input' style='display: none' placeholder=\"{{t \"rules.valuesTextInput\"}}\"\u003e\n                    \u003cdiv class='values'\u003e\n                    \u003c/div\u003e\n                \u003c/td\u003e\n                \u003ctd class=\"selected\"\u003e\u003c/td\u003e\n            \u003c/tr\u003e\n            \u003c/tbody\u003e\n        \u003c/table\u003e\n    \u003c/div\u003e\n  \u003c/section\u003e\n\u003c/div\u003e\n\n\n\u003cfooter\u003e\n  \u003cdiv class=\"pane\"\u003e\n    \u003cbutton class=\"delete text-error deleteAll\"\u003e{{#if has_forms}}{{t \"rules.deleteAllForForm\"}}{{else}}{{t \"rules.deleteAll\"}}{{/if}}\u003c/button\u003e\n    \u003cdiv class=\"action-buttons pull-right\"\u003e\n      \u003cbutton class=\"btn cancel\"\u003e{{t \"rules.cancel\"}}\u003c/button\u003e\n      \u003cbutton class=\"btn btn-primary save\"\u003e{{t \"rules.save\"}}\u003c/button\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/footer\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"unsavedChangesModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.unsavedChanges.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.unsavedChanges.text\"}}\u003c/p\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn pull-left\" data-dismiss=\"modal\"\u003e{{t \"modal.unsavedChanges.cancel\"}}\u003c/button\u003e\n    \u003cbutton class=\"btn no\" data-dismiss=\"modal\"\u003e{{t \"modal.unsavedChanges.no\"}}\u003c/button\u003e\n    \u003cbutton class=\"btn btn-primary yes\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.unsavedChanges.yes\"}}\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"deleteAllModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.deleteAll.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.deleteAll.text\"}}\u003c/p\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\"\u003e{{t \"modal.deleteAll.no\"}}\u003c/button\u003e\n    \u003cbutton class=\"btn btn-danger yes\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.deleteAll.yes\"}}\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"deleteOneModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.deleteOne.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.deleteOne.text\"}}\u003c/p\u003e\n    \u003cdiv class=\"modalRuleDisplay\"\u003e\n      \u003ch4\u003e\u003c/h4\u003e\n      \u003cp\u003e\u003c/p\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\"\u003e{{t \"modal.deleteOne.no\"}}\u003c/button\u003e\n    \u003cbutton class=\"btn btn-danger yes\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.deleteOne.yes\"}}\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"requiredWarningModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.requiredWarning.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.requiredWarning.text\"}}\u003c/p\u003e\n    \u003cul class=\"faultyRules\"\u003e\n    \u003c/ul\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.requiredWarning.cancel\"}}\n    \u003c/button\u003e\n    \u003cbutton class=\"btn btn-danger yes\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.requiredWarning.yes\"}}\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"limitReachedModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.limitReached.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.limitReached.text\"}}\u003c/p\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\"\u003e\n      {{t \"modal.limitReached.cancel\"}}\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" id=\"snippetModal\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003ch3\u003e{{t \"modal.snippet.title\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"modal.snippet.text\"}} \u003ca href=\"https://support.zendesk.com/entries/26674953-Using-the-Conditional-Fields-app-Enterprise-Only-\" target=\"_blank\"\u003e{{t \"docLink\"}}\u003c/a\u003e\u003c/p\u003e\n    \u003cpre\u003e\n      \u003ccode class=\"modalSnippetCode\"\u003e\u003c/code\u003e\n    \u003c/pre\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\"\u003e{{t \"modal.snippet.dismiss\"}}\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e","denied":"{{t \"accessdenied\"}}","empty":"\u003cdiv class=\"alert alert-success empty-sidebar\"\u003e\n       {{t \"appstatus\"}}\n\u003c/div\u003e","fields":"\u003cdiv class='separator'\u003e{{t \"separators.availableCount\" count=freeFields.length}}\u003c/div\u003e\n\n\u003cul class='available'\u003e\n  {{#freeFields}}\n    \u003cli {{#if selected}}class=\"active\"{{/if}}\u003e\n      \u003ca value=\"{{id}}\" class=\"field{{#if assigned}} assigned{{/if}}\"\u003e{{name}}\u003c/a\u003e\n    \u003c/li\u003e\n  {{/freeFields}}\n\u003c/ul\u003e\n\n{{#if usedFields.length}}\n  \u003cdiv class='separator'\u003e{{t \"separators.existing\" count=usedFields.length}}\u003c/div\u003e\n  \u003cul class='available'\u003e\n    {{#usedFields}}\n      \u003cli {{#if selected}}class=\"active\"{{/if}}\u003e\n        \u003ca value=\"{{id}}\" class=\"field{{#if assigned}} assigned{{/if}}\"\u003e{{name}}\u003c/a\u003e\n      \u003c/li\u003e\n    {{/usedFields}}\n  \u003c/ul\u003e\n{{/if}}","layout":"\u003cstyle\u003e\n@charset \"UTF-8\";\n.app-19078 header .logo {\n  background-image: url(\"https://19078.apps.zdusercontent.com/19078/assets/1468478022-80c029e485ae429672f5a18334d30441/logo-small.png\"); }\n.app-19078 .empty-sidebar {\n  margin-bottom: 0px;\n  margin-top: 9px; }\n.app-19078.main_panes.apps_nav_bar {\n  padding: 0; }\n  .app-19078.main_panes.apps_nav_bar .pane {\n    bottom: 50px; }\n    .app-19078.main_panes.apps_nav_bar .pane.left {\n      width: 330px; }\n    .app-19078.main_panes.apps_nav_bar .pane.right {\n      left: 330px; }\n  .app-19078.main_panes.apps_nav_bar [data-main] .loading .spinner {\n    margin-top: 25%; }\n  .app-19078.main_panes.apps_nav_bar [data-main] .left {\n    background-color: #f8f8f8;\n    position: absolute; }\n  .app-19078.main_panes.apps_nav_bar [data-main] .right {\n    border-left: 1px solid #d5d5d5; }\n  .app-19078.main_panes.apps_nav_bar footer {\n    background-color: #f5f5f5;\n    border-top: 1px solid #ddd;\n    bottom: 0;\n    height: 53px;\n    left: 0;\n    position: absolute;\n    z-index: 9;\n    width: 100%; }\n    .app-19078.main_panes.apps_nav_bar footer .pane {\n      margin: 10px; }\n      .app-19078.main_panes.apps_nav_bar footer .pane .text-error {\n        color: red;\n        background: none;\n        padding-top: 0.7em; }\n      .app-19078.main_panes.apps_nav_bar footer .pane .cancel {\n        padding-top: 0.5em;\n        padding-bottom: 0.5em;\n        margin-right: 0.5em; }\n      .app-19078.main_panes.apps_nav_bar footer .pane .save {\n        padding-left: 2em;\n        padding-right: 2em;\n        padding-top: 0.5em;\n        padding-bottom: 0.5em; }\n.app-19078 .sidebar {\n  margin: 20px 25px; }\n.app-19078 .sidebar .generateSnippet {\n  margin-top: 15px;\n  margin-left: auto;\n  margin-right: auto;\n  display: block; }\n.app-19078 .sidebar h4 {\n  margin-bottom: 10px; }\n.app-19078 .sidebar .zd-selectmenu {\n  margin-bottom: 20px; }\n.app-19078 .sidebar select {\n  margin-bottom: 25px;\n  width: 100%; }\n.app-19078 .sidebar .all_rules .global {\n  border-top: 1px solid #d5d5d5; }\n.app-19078 .sidebar .all_rules .rule {\n  border-bottom: 1px solid #d5d5d5;\n  font-size: 13px;\n  line-height: 18px;\n  padding: 10px; }\n  .app-19078 .sidebar .all_rules .rule .ruleTitle {\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    overflow: hidden; }\n    .app-19078 .sidebar .all_rules .rule .ruleTitle a.field {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n      width: calc(100% - 63px);\n      display: inline-block;\n      vertical-align: -0.8em; }\n  .app-19078 .sidebar .all_rules .rule .altText {\n    color: #AAA;\n    font-weight: bold; }\n  .app-19078 .sidebar .all_rules .rule .field {\n    font-weight: bold;\n    margin-bottom: 5px; }\n  .app-19078 .sidebar .all_rules .rule .collapse_menu {\n    color: black; }\n  .app-19078 .sidebar .all_rules .rule ul.collapsed {\n    display: none; }\n  .app-19078 .sidebar .all_rules .rule ul {\n    background-color: #f5f5f5; }\n    .app-19078 .sidebar .all_rules .rule ul .altText {\n      font-weight: normal; }\n    .app-19078 .sidebar .all_rules .rule ul p {\n      margin-left: 20px; }\n  .app-19078 .sidebar .all_rules .rule li {\n    padding: 5px 5px 5px 20px; }\n    .app-19078 .sidebar .all_rules .rule li.selectedRule {\n      background-color: #ededed; }\n    .app-19078 .sidebar .all_rules .rule li.hardSelect {\n      border: 1px solid #e5e5e5; }\n  .app-19078 .sidebar .all_rules .rule .value a {\n    color: #444; }\n  .app-19078 .sidebar .all_rules .rule .value p {\n    color: #999;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .app-19078 .sidebar .all_rules .rule .value .ruleItem:hover {\n    text-decoration: underline;\n    color: #146eaa; }\n.app-19078 .sidebar .all_rules .empty {\n  border-bottom: 1px solid #d5d5d5;\n  font-style: italic;\n  padding: 10px 0;\n  text-align: center; }\n.app-19078 .main {\n  height: 100%;\n  margin: 20px 0px;\n  width: 1000px; }\n  .app-19078 .main .intro {\n    margin: 0px 25px;\n    max-width: 1000px; }\n  .app-19078 .main h3 {\n    font-size: 1.5em;\n    font-weight: normal;\n    margin-bottom: 10px; }\n  .app-19078 .main .firstTimeEndUser {\n    text-align: center;\n    margin-top: 100px; }\n    .app-19078 .main .firstTimeEndUser .or {\n      font-size: 1.8em;\n      display: inline-block;\n      margin-left: 1em;\n      margin-right: 1em;\n      position: relative;\n      top: 0.2em; }\n  .app-19078 .main ul.table-header {\n    margin-top: 25px;\n    max-width: 1000px;\n    margin-left: 0px;\n    text-transform: uppercase;\n    font-size: 11px;\n    line-height: 14px;\n    border: solid 1px #d3d3d3;\n    border-left: none; }\n    .app-19078 .main ul.table-header li {\n      float: left;\n      width: 33.33%;\n      background-image: -webkit-linear-gradient(90deg, #DEDEDE 0%, #FDFDFD 100%);\n      background-image: -moz-linear-gradient(90deg, #DEDEDE 0%, #FDFDFD 100%);\n      background-image: -ms-linear-gradient(90deg, #DEDEDE 0%, #FDFDFD 100%);\n      font-weight: normal;\n      text-transform: uppercase;\n      font-size: 11px;\n      line-height: 14px;\n      height: 36px;\n      display: block;\n      padding: 10px;\n      box-sizing: border-box; }\n  .app-19078 .main .table-wrapper {\n    height: calc(100% - 145px);\n    overflow: auto;\n    display: block;\n    clear: both; }\n  .app-19078 .main table {\n    max-width: 1000px;\n    min-width: 640px;\n    table-layout: fixed;\n    border-bottom: 1px solid #d3d3d3; }\n    .app-19078 .main table th, .app-19078 .main table td {\n      padding: 0; }\n    .app-19078 .main table tbody tr:hover td {\n      background-color: #fff; }\n    .app-19078 .main table tbody td {\n      border-top: none;\n      border-right: 1px solid #d3d3d3;\n      padding: 20px 13px 0px; }\n    .app-19078 .main table tbody .separator {\n      color: #9a9a9a;\n      font-size: 11px;\n      line-height: 11px;\n      padding-bottom: 12px;\n      border-bottom: 1px solid #d9d9d9;\n      margin-bottom: 10px;\n      margin-top: 46px; }\n      .app-19078 .main table tbody .separator:first-child {\n        margin-top: 0px; }\n    .app-19078 .main table tbody .available {\n      margin-bottom: 20px; }\n    .app-19078 .main table tbody .values-text-input {\n      order: 0px;\n      border-bottom: 1px solid #e8e8e8;\n      border-radius: 0px;\n      width: 100%;\n      box-sizing: border-box;\n      box-shadow: none;\n      height: 31px; }\n    .app-19078 .main table tbody ul, .app-19078 .main table tbody li {\n      margin: 0;\n      padding: 0; }\n    .app-19078 .main table tbody ul {\n      overflow-y: hidden;\n      overflow-x: hidden;\n      width: calc(100% + 6px); }\n    .app-19078 .main table tbody li {\n      border: 0; }\n      .app-19078 .main table tbody li a {\n        display: block;\n        padding: 10px;\n        margin-left: 20px;\n        position: relative;\n        color: #333;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis; }\n      .app-19078 .main table tbody li.active, .app-19078 .main table tbody li:hover {\n        background-color: #f5f5f5; }\n      .app-19078 .main table tbody li.active a, .app-19078 .main table tbody li a.assigned {\n        font-weight: bold; }\n      .app-19078 .main table tbody li.active a:after, .app-19078 .main table tbody li.selected a:after {\n        color: #333;\n        display: block;\n        padding: 10px;\n        position: absolute;\n        right: 0;\n        top: 0; }\n      .app-19078 .main table tbody li.active a:after {\n        content: \"▸\"; }\n      .app-19078 .main table tbody li span[data-toggle=\"tooltip\"] {\n        position: relative;\n        top: 12px; }\n      .app-19078 .main table tbody li.selected input {\n        position: relative;\n        top: 10px;\n        right: 1px; }\n      .app-19078 .main table tbody li.selected .checkMark {\n        float: left;\n        position: relative;\n        top: 11px;\n        left: 6px; }\n      .app-19078 .main table tbody li.selected .ui-icon-alert {\n        position: relative;\n        right: 8px; }\n      .app-19078 .main table tbody li.unselectable a {\n        color: #CCC; }\n.app-19078 #snippetModal pre {\n  max-height: 150px;\n  overflow: scroll;\n  background-color: #efefef; }\n.app-19078 .modalRuleDisplay {\n  border: 1px solid #cccccc;\n  padding: 5px; }\n  .app-19078 .modalRuleDisplay h4, .app-19078 .modalRuleDisplay p {\n    background-color: #f6f6f6;\n    padding: 10px; }\n  .app-19078 .modalRuleDisplay h4 {\n    padding-bottom: 0em; }\n  .app-19078 .modalRuleDisplay p {\n    padding-top: 0.5em; }\n.app-19078 .enterpriseBackdrop {\n  width: 100%;\n  background: rgba(110, 110, 110, 0.5);\n  height: 100%;\n  position: absolute;\n  z-index: 10;\n  top: 0px; }\n.app-19078 #requiredWarningModal .faultyRules {\n  margin-top: 10px; }\n  .app-19078 #requiredWarningModal .faultyRules li.rule {\n    margin-bottom: 10px; }\n    .app-19078 #requiredWarningModal .faultyRules li.rule ul {\n      background-color: #f6f6f6;\n      margin-left: 0px;\n      padding-left: 10px;\n      padding-right: 10px; }\n      .app-19078 #requiredWarningModal .faultyRules li.rule ul li {\n        display: inline; }\n        .app-19078 #requiredWarningModal .faultyRules li.rule ul li:after {\n          content: \", \"; }\n        .app-19078 #requiredWarningModal .faultyRules li.rule ul li:last-child:after {\n          content: \"\"; }\n.app-19078 .enable-required, .app-19078 .disable-required {\n  float: right; }\n  .app-19078 .enable-required .enableRequired, .app-19078 .enable-required .disableRequired, .app-19078 .disable-required .enableRequired, .app-19078 .disable-required .disableRequired {\n    margin-left: 5px;\n    border: 1px solid #ccc;\n    padding: 2px 7px 2px 7px;\n    border-radius: 4px;\n    color: #666; }\n.app-19078 .requiredTag {\n  color: #ccc;\n  position: relative;\n  top: 12px;\n  font-size: 11px; }\n\u003c/style\u003e\n\u003cheader\u003e\n  \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n\u003c/header\u003e\n\n\u003cdiv data-main class='cfa_navbar'\u003e\n  {{spinner}}\n\u003c/div\u003e","loading":"\u003cdiv class=\"loading\"\u003e{{spinner \"dotted\"}}\u003c/div\u003e","required_rule":"\u003cli class='rule'\u003e\n  \u003cdiv class=\"modalRuleDisplay\"\u003e\n    \u003ch4\u003e{{title}}\u003c/h4\u003e\n    \u003cp\u003e\n      \u003cul\u003e\n        {{#each fields}}\n          \u003cli\u003e{{#if required}}\u003cstrong\u003e{{text}}\u003c/strong\u003e{{else}}{{text}}{{/if}}\u003c/li\u003e\n        {{/each}}\n      \u003c/ul\u003e\n    \u003c/p\u003e\n  \u003c/div\u003e\n\u003c/li\u003e","rules":"\u003ch4 class=\"rules_summary_title\"\u003e{{t \"rules.summary\" count=count}}\u003c/h4\u003e\n\u003cul class=\"unstyled global\"\u003e\n{{#fields}}\n  \u003cli class=\"rule\" data-id=\"{{id}}\"\u003e\n    \u003cdiv class='ruleTitle'\u003e\n      \u003cdiv class=\"pull-right\"\u003e\n        \u003ca href=\"#\" class=\"collapse_menu\" value=\"{{id}}\"\u003e\n          \u003cspan class=\"ui-icon {{#unless toCollapse}}ui-icon-triangle-1-e{{else}}ui-icon-triangle-1-s{{/unless}}\"\u003e\u003c/span\u003e\n        \u003c/a\u003e\n      \u003c/div\u003e\n      \u003ci class='icon-arrow-right'\u003e\u003c/i\u003e \u003ca class=\"field\"\u003e{{name}}\u003c/a\u003e\n    \u003c/div\u003e\n    \u003cul class=\"unstyled {{#unless collapsed}}collapsed{{/unless}}\"\u003e\n    {{#rules}}\n      \u003cli class=\"value{{#if selected}} selectedRule hardSelect{{/if}}\"\u003e\n      \u003ca class='ruleItem' value='{{index}}'\u003e\u003ci class='icon-arrow-right'\u003e\u003c/i\u003e {{valueText}}\u003c/a\u003e\n          \u003cdiv class=\"pull-right\"\u003e\n            \u003ca class='deleteRule {{#unless selected}}hide{{/unless}}' value='{{index}}'\u003e×\u003c/a\u003e\n          \u003c/div\u003e\n          \u003cp\u003e\u003ci class='icon-arrow-right'\u003e\u003c/i\u003e \u003cem\u003e{{fieldsText}}\u003c/em\u003e\u003c/p\u003e\n      \u003c/li\u003e\n    {{/rules}}\n    \u003c/ul\u003e\n  \u003c/li\u003e\n{{else}}\n\u003cli class=\"empty\"\u003e{{t \"rules.empty\"}}\u003c/li\u003e\n{{/fields}}\n\u003c/ul\u003e","select_fields":"{{#if total}}\n    \u003cdiv class='separator'\u003e\n      {{#if hasSelected}}\n        \u003cdiv class='enable-required'\u003e\n          \u003ca class='enableRequired'\u003e{{t \"required.enable\"}}\u003c/a\u003e\n        \u003c/div\u003e\n        \u003cdiv class='disable-required' style='display: none'\u003e\n          \u003ca class='disableRequired'\u003e{{t \"required.disable\"}}\u003c/a\u003e\n        \u003c/div\u003e\n      {{/if}}\n      {{t \"separators.available\"}}\n    \u003c/div\u003e\n\n    \u003cul\u003e\n      {{#selectableFields}}\n        \u003cli class=\"{{#if selected}}selected{{/if}} {{#if unselectable}}unselectable{{/if}} {{#if required}}required{{/if}}\"\u003e\n          {{#if required}}\n            \u003cspan class='requiredTag pull-right'\u003e{{t \"required.required\"}}\u003c/span\u003e\n          {{/if}}\n          {{#if selected}}\n            \u003ci class='icon-ok checkMark'/\u003e\n            \u003cinput type='checkbox' class='pull-right' style='display: none' data-value=\"{{id}}\"\u003e\n          {{/if}}\n          \u003ca value=\"{{id}}\"\n             class=\"selectedField{{#if selected}} assigned{{/if}}\"\u003e\n               {{name}}\n          \u003c/a\u003e\n        \u003c/li\u003e\n      {{/selectableFields}}\n    \u003c/ul\u003e\n\n\n    {{#if unselectableFields.length}}\n      \u003cdiv class='separator'\u003e{{t \"separators.unavailable\"}}\u003c/div\u003e\n\n      \u003cul class='unavailable'\u003e\n        {{#unselectableFields}}\n          \u003cli class=\"unselectable\"\u003e\n            \u003ca value=\"{{id}}\"\n               class=\"selectedField\"\u003e\n                 {{name}}\n            \u003c/a\u003e\n          \u003c/li\u003e\n        {{/unselectableFields}}\n      \u003c/ul\u003e\n    {{/if}}\n{{/if}}","values":"{{#if values.length}}\n  \u003cdiv class='separator'\u003e{{t \"separators.available\"}}\u003c/div\u003e\n\n  \u003cul\u003e\n    {{#values}}\n      \u003cli {{#if selected}}class=\"active\"{{/if}}\u003e\n        \u003ca value=\"{{value}}\" class=\"value{{#if assigned}} assigned{{/if}}\"\u003e{{name}}\u003c/a\u003e\n      \u003c/li\u003e\n    {{/values}}\n  \u003c/ul\u003e\n{{/if}}"},
    frameworkVersion: "1.0"
  });

ZendeskApps["Conditional Fields"] = app;

    with( ZendeskApps.AppScope.create() ) {

  var source = (function() {
    var self = this;
    var current_page = 0;
    var previous_page;
    var per_page = 9;
    var next_page;

    var bestData;
    var navigation_html;
    var put_data;
    var current_text;
    var ratio;
    /*global Image:true*/

    return {
        events: {
            'app.activated':'initialize',
            'click .btn':'toggleButtonGroup',
            'click li.clickable':'add_colour', 
        
            'mouseover .more-info': function(e) {
              this.$(e.target).popover('show');
            },
            
            // Navigate paginated content with Next, Previous, or Direct Page Link
            'click .page_link': function(e) {
                current_page = parseInt(this.$(e.target).val(), 10);
                if (this.$('#get_library').hasClass('active')){
                    this.renderLibrary(current_page);
                } else if (this.$('#getImage').hasClass('active')) {
                    this.renderTicket(current_page);
                }
            },
            
            //working with images in ticket
            'click #getImage': 'renderTicket',
            'click #add_images' : 'addToLibrary',
            'click #add_text' : 'addTextToLibrary',

            //working with images inside of library
            'click #get_library':'renderLibrary', 
            'click #embed_images':'embedImages',
            'click #embed_link':'embedLinks',
            'click #remove_images':'removeImages',
            'click #preview_item': 'previewItem',

            // working with Remote Content
            'click #getExternal': 'getExternal',
            'click #addExternal': 'addExternalToLibrary'
        },

        requests: {
            putField: function(data) {
                return {
                    url: '/api/v2/users/'+self.user_id+'.json',
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json; charset=UTF-8',
                    data: '{"user": {"user_fields":{"'+this.settings.field_key+'":"'+data+'"}}}',
                };
            },

            getField: function(data) {
                return {
                    url: '/api/v2/users/me.json',
                    type: 'GET',
                    dataType: 'json',
                };
            }
        },

        initialize: function() {
            self.user_id = this.currentUser().id();
        },

        renderTicket: function(current_image_page) {
            // load all attachments from current ticket
            var attachments = [];

            if (typeof current_image_page !== "number"){
                current_image_page = 0;
            }
            
            this.comment().attachments().forEach(function(comment){
                var object = {};

                if (comment.contentType().indexOf("image") > -1) {
                    object.url = comment.contentUrl();
                    object.name = comment.filename();
                    object.type = "image";
                    attachments.push(object);
                } else {
                    object.url = comment.contentUrl();
                    object.name = comment.filename();
                    object.type = "text";
                    attachments.push(object);
                }
            });
            
            this.ticket().comments().forEach(function(comment){
                comment.nonImageAttachments().forEach(function(nonImage){
                    var object = {};
                    object.url = nonImage.contentUrl();
                    object.name = nonImage.filename();
                    object.type = "text";
                    attachments.push(object);
                });
                comment.imageAttachments().forEach(function(image){
                    var object = {};
                    object.url = image.contentUrl();
                    object.name = image.filename();
                    object.type = "image";
                    attachments.push(object);
                });
                
                var regex = comment.value().match(/<img.*src=["'](.*)["'].*">/gi);
                if (regex !== null) {
                    for (i = 0; i < regex.length; ++i) {
                        var object = {};
                        var url = regex[i].match(/src=["'](.+?)["']/gi);
                        object.url = url.toString().substring(5, url[0].length - 1);
                        var alt = regex[i].match(/alt=["'](.+?)["']/gi);
                        object.name = (alt !== null) ? alt.toString().substring(5, alt[0].length - 1) : this.I18n.t('alt');
                        object.type = "image";
                        attachments.push(object);
                    }                    
                }
            });
            
            // if no images, show no images and break.
            if(attachments.length === 0) {
                this.switchTo("ticket", {imageList: "<li class=\"imgbox\"><br>"+this.I18n.t('errors.ticket_empty')+"</li>"});
                return;
            }

            //  render attachments
            var number_of_items = attachments.length;
            var pagination = this.paginate(attachments, current_image_page, number_of_items);
            var attachment;
            var attachmentList = "";
            var end_of_list = per_page*(current_image_page+1);
            var beg_of_list = per_page*current_image_page;
            if (end_of_list > number_of_items) {
                end_of_list = number_of_items;
            }
            for (var i = beg_of_list; i < end_of_list; i++){
                if (attachments[i] !== null){
                    if (attachments[i].type == "text"){
                        attachmentList += this.renderTemplate("imgbox",
                        {
                            type: attachments[i].type,
                            src: '',
                            alt: attachments[i].name,
                            height: 0,
                            width: 0,
                            top: 0,
                            left: 0,
                            data_url: attachments[i].url,
                            data_title: attachments[i].name,
                            data_content: attachments[i].url
                        });
                    } else if (attachments[i].type == "image"){
                        attachment = this.resizeImage(attachments[i].url);
                        attachmentList += this.renderTemplate("imgbox",
                        {
                            type: attachments[i].type,
                            src: attachments[i].url,
                            alt: attachments[i].name,
                            height: attachment.height,
                            width: attachment.width,
                            top: (82-attachment.height)/2,
                            left: (82-attachment.width)/2,
                            data_url: attachments[i].url,
                            data_title: attachments[i].name,
                            data_content: attachments[i].url
                        });
                    }
                    else {return;}
                }
            }
            this.switchTo("ticket", {imageList: attachmentList, pagination: pagination});
        },
        
        paginate: function(array, current_page, number_of_items) {
            var number_of_pages = Math.ceil(number_of_items/per_page);
            
            if (current_page === 0) { 
                previous_page = 0;
                navigation_html = '<button type="button" class="page_link left_end" disabled value="'+previous_page+'"><-</button>';
            } else {
                previous_page = current_page - 1;
                navigation_html = '<button type="button" class="page_link left_end" value="'+previous_page+'"><-</button>';
            }
            
            for(var i = 0; i < number_of_pages; i++){
                if (i == current_page){
                    navigation_html += '<button type="button" class="page_link current middle" disabled value="'+i+'">' + (i + 1) +'</button>';
                } else {
                    navigation_html += '<button type="button" class="page_link middle" value="'+i+'">' + (i + 1) +'</button>';
                }
            }
            
            if (current_page+1 >= number_of_pages) { 
                next_page = number_of_pages;
                navigation_html += '<button type="button" class="page_link right_end" disabled value="'+next_page+'">-></button>';
            } else {
                next_page = current_page + 1;
                navigation_html += '<button type="button" class="page_link right_end" value="'+next_page+'">-></button>';
            }
            
            var pagination = this.renderTemplate('pagination', { page_navigation: navigation_html });
            
            return pagination;
        },

        renderLibrary: function() {
            // load library page template, get data from user field and render thumbnails
            this.ajax('getField').done(function(data) {
                self.library = data.user.user_fields[this.settings.field_key];
                current_page |= 0;
    
                if(self.library == null) {
                    this.switchTo("library", {imageList: "<li class=\"imgbox\"><br>"+this.I18n.t('errors.library_empty')+"</li>"});
                    return;
                }
                
                var attachment_list = JSON.parse(self.library);
                var number_of_items = attachment_list.length;
                var pagination = this.paginate(attachment_list, current_page, number_of_items);           
                var img;
                var imageList = "";
                var end_of_list = per_page*(current_page+1);
                var beg_of_list = per_page*current_page;
                if (end_of_list > number_of_items) {
                    end_of_list = number_of_items;
                }
                
                for (var i = beg_of_list; i < end_of_list; i++){
                    if (attachment_list[i] !== null){
                        var imageObject = {};
                        if (attachment_list[i].type == "image"){
                            imageObject = this.resizeImage(attachment_list[i].url);
                            imageObject.top = (82-imageObject.height)/2;
                            imageObject.left = (82-imageObject.width)/2;
                        } else if (attachment_list[i].type == "text") {
                            imageObject = new Image();
                            imageObject.height = 0;
                            imageObject.width = 0;
                            imageObject.top = 0;
                            imageObject.left = 0;
                        }
                        imageObject.alt = attachment_list[i].alt;
                        imageObject.data_url = attachment_list[i].url;
                        imageObject.type = attachment_list[i].type;
    
                        imageList += this.renderTemplate("imgbox",
                        {
                            alt: imageObject.alt,
                            src: imageObject.src,
                            height: imageObject.height,
                            width: imageObject.width,
                            top: imageObject.top,
                            left: imageObject.left,
                            data_url: imageObject.data_url,
                            type: imageObject.type,
                            data_title: imageObject.alt,
                            data_content: imageObject.data_url,
                            image_id: i
                        });    
                    }                
                }
                this.switchTo("library", {imageList: imageList, pagination: pagination});
            });
        },

        resizeImage: function(object) {
            var img = new Image(82, 82);
            img.src = object;
                // this is for resizing and maintaining aspect ratio - currently it works, but sometimes it fires after the image is added, resulting in a blank.  Need to make it populate before the image is added to the page...
                /*if(img.width > img.height) {
                    ratio = 82/img.width;
                } else {
                    ratio = 82/img.height;
                }
                img.height *= ratio;
                img.width *= ratio;*/
            return img;            
        },

        toggleButtonGroup: function(event) {
            if(this.$(event.target).parent().hasClass("btn-group")) {
                _.each(this.$(event.target).parent().children(),
                function(value) {
                    this.$(value).removeClass("active");
                });
                this.$(event.target).addClass("active");
            }
        },

        // Toggle Class for Selected Item - Disable Preview Button if Multiple Items Selected
        add_colour: function(event) {
            if(this.$(event.target).prop('tagName') == "IMG") {
                this.$(event.target).parent().parent().toggleClass("highlight");
            } else if(this.$(event.target).prop('tagName') == "DIV") {
                this.$(event.target).parent().toggleClass("highlight");
            } else {
                this.$(event.target).toggleClass("highlight");
            }
            var numItems = this.$(".highlight").length;
            if ( numItems > 1) {
                this.$("#preview_item").prop("disabled", true); 
            } else if ( numItems <= 1) {
                this.$("#preview_item").prop("disabled", false); 
            }
            this.$(".hidden").removeClass("hidden");
        },

        // add attachments to library, including URL, name, and type (txt or image)
        addToLibrary: function(data){
            var value = this.ajax('getField', data).done(function(data) {
                var put_data = (data.user.user_fields[this.settings.field_key]) ? JSON.parse(data.user.user_fields[this.settings.field_key]) :[] ;
                this.$(".highlight").each(function(i, val) {
                    var alt = val.children[0].children[0].getAttribute("alt");
                    if (val.getAttribute("class").indexOf("image") !== -1 ) {
                        var image_array = {};
                        image_array.url = val.children[0].children[0].getAttribute("src");
                        image_array.alt = alt;
                        image_array.type = "image";
                        put_data.push(image_array);
                    }
                    else if (val.getAttribute("class").indexOf("doc")) {
                        var doc_array = {};
                        doc_array.url = val.children[0].children[0].getAttribute("data-contentURL");
                        doc_array.alt = alt;
                        doc_array.type = "text";
                        put_data.push(doc_array);
                    }
                });
                put_data = JSON.stringify(put_data).replace(/"/g, "\\\"");
                this.ajax('putField', put_data).done(function() {
                    services.notify(this.I18n.t('add.done'));
                }).fail(function() {
                    services.notify(this.I18n.t('add.fail'));
                });
            });
        },

        // Remove attachment from user field
        removeImages: function(data){
            this.ajax('getField').done(function(data) {
                var put_data = JSON.parse(data.user.user_fields[this.settings.field_key]);
                var removeValFromIndex = [];

                self.$(".highlight").each(function(i, val) {
                    removeValFromIndex.push(self.$(this).attr('id'));
                });
                for (var i = removeValFromIndex.length -1; i >=0; i--){
                    put_data.splice(removeValFromIndex[i],1);
                }
                put_data = JSON.stringify(put_data).replace(/"/g, "\\\"");
                this.ajax('putField', put_data).done(function(data) {
                    self.library = data.user.user_fields[this.settings.field_key];
                    services.notify(this.I18n.t('remove.done'));
                    this.renderLibrary();
                }).fail(function() {
                    services.notify(this.I18n.t('remove.fail'));
                });
            });               
        },

        // Embed image with Markdown based on user action
        embedImages: function(data){
            put_data = '';
            self.$(".highlight").each(function(i, val) {
                put_data += "!["+this.I18n.t('markdown')+"]("+val.children[0].children[0].getAttribute("src")+") " + "\n";
            });
            current_text = this.comment().text();
            current_text += put_data;
            this.comment().text(current_text);
        },

        embedLinks: function(data){
            put_data = '';
            self.$(".highlight").each(function(i, val) {
                put_data += "["+val.children[0].children[0].getAttribute("alt")+"]("+val.children[0].children[0].getAttribute("data-contentURL")+")";
            });
            current_text = this.comment().text();
            current_text += put_data;
            this.comment().text(current_text);
        },

        // Preview item in iframe - use Google Docs API for text files
        previewItem: function(data, target){
            var url;
            if (self.$(".highlight").hasClass('image')) {
                url = self.$(".highlight > div > img").attr('data-contenturl');
            } else if (self.$(".highlight").hasClass('text')) {
                var log = self.$(".highlight > div > img").attr('data-contenturl');
                url = "http://docs.google.com/viewer?url="+log+"&embedded=true";
            }
            this.$('#modalIframe').attr('src', url);
            this.$('#myModal').modal('show');
        },

        getExternal: function() {
            this.switchTo("external");
        },

        //  Allow end-user to add externally hosted files to library
        addExternalToLibrary: function() {
            var ERRORS = {
              ext: [
                this.I18n.t('errors.url'),
                this.I18n.t('errors.nickname'),
                this.I18n.t('errors.type')
              ]
            };
            var fields, values, errout = false;
            fields = [this.$("#externalURL"), this.$("#externalFileName"), this.$(".type-btn.active")];
            values = [fields[0].val(), fields[1].val().replace(/[,;]/g,""), fields[2].data("type")];
            values.map(function(d,i){
                if(!d) {
                    fields[i].addClass("field-error");
                    services.notify(ERRORS.ext[i], 'error');
                    errout |= true;
                } else if(i === 0 && d.indexOf("https://") !== 0) {
                    fields[i].addClass("field-error");
                    services.notify(ERRORS.ext[i], 'error');
                    errout |= true;
                }
            });
            if(errout) return;
            fields.forEach(function(d) {
                d.removeClass('field-error'); 
                this.$(d).val("");
            });

            this.ajax('getField').done(function(data) {
                var put_data = (data.user.user_fields[this.settings.field_key]) ? JSON.parse(data.user.user_fields[this.settings.field_key]) :[] ;
                var image_array = {};
                image_array.url = values[0];
                image_array.alt = values[1];
                image_array.type = values[2];
                put_data.push(image_array);
                put_data = JSON.stringify(put_data).replace(/"/g, "\\\"");
                this.ajax('putField', put_data).done(function() {
                    services.notify(this.I18n.t('add.done'));
                }).fail(function() {
                    services.notify(this.I18n.t('add.fail'));
                });
            });
        },

        removeFieldError: function(e) {
            this.$(e.target).removeClass("field-error");
        }

    };

}());
;

  var app = ZendeskApps.defineApp(source)
    .reopenClass({"location":["ticket_sidebar","new_ticket_sidebar"],"noTemplate":false,"singleInstall":false})
    .reopen({
      appName: "Attachment Library",
      appVersion: "1.0",
      assetUrlPrefix: "/api/v2/apps/65346/assets/",
      appClassName: "app-65346",
      author: {
        name: "Zendesk Labs",
        email: "zendesklabs@zendesk.com"
      },
      translations: {"app":{"parameters":{"field_key":{"label":"User Field Key"}}},"loading":"Welcome to the amazing","add":{"done":"Item(s) Successfully Added.","fail":"Item(s) could not be added.  Please try again or contact your administrator."},"errors":{"url":"Please provide a valid URL (must include 'https').","nickname":"Please provide a nickname for the file.","type":"Please select the type of file to import.","ticket_empty":"No attachments found","library_empty":"Nothing here yet!"},"remove":{"done":"Item(s) removed successfully.","fail":"Oops! Something went wrong."},"markdown":"Image from Markdown","external":{"title":"Add File from Web","url":"Enter external file URL here! Must start with https://","name":"Enter a name for the file here!","type":"Attachment type:","image":"Image","text":"Text","add":"Add to Library"},"ticket":{"add":"Add Item(s) to Library","preview":"Preview Item (only one may be selected)","embed":"Add Image(s) to ticket as embedded image(s)","link":"Add Item(s) to ticket as link(s)","document":"Attachment Preview","close":"Close"},"layout":{"library":"Library","ticket":"Ticket","external":"External"},"library":{"remove":"Remove Item(s) from Library","preview":"Preview Item (only one may be selected)","embed":"Add Image(s) to ticket as embedded image(s)","link":"Add Item(s) to ticket as link(s)","document":"Attachment Preview","close":"Close"},"alt":"No Name"},
      templates: {"external":"\u003ch4\u003e{{t \"external.title\"}}\u003c/h4\u003e\u003c/br\u003e\n\u003cdiv class=\"external-form\"\u003e\n    \u003cinput id=\"externalURL\" type=\"text\" placeholder=\"{{t \"external.url\"}}\"\u003e\u003c/input\u003e\u003cbr\u003e\u003cbr\u003e\n    \u003cinput id=\"externalFileName\" type=\"text\" placeholder=\"{{t \"external.name\"}}\"\u003e\u003c/input\u003e\u003cbr\u003e\n    \u003cbr\u003e{{t \"external.type\"}}\n    \u003cdiv class=\"btn-group\"\u003e\n        \u003cbutton class=\"btn type-btn active\" data-type=\"image\"\u003e{{t \"external.image\"}}\u003c/button\u003e\n        \u003cbutton class=\"btn type-btn\" data-type=\"text\"\u003e{{t \"external.text\"}}\u003c/button\u003e\n    \u003c/div\u003e\u003cbr\u003e\n    \u003cdiv id=\"addExternal\" class=\"btn\"\u003e{{t \"external.add\"}}\u003c/div\u003e\n\u003c/div\u003e","imgbox":"\u003cli class=\"imgbox clickable {{type}} more-info\" data-html=\"true\" data-content=\"Full URL: {{data_content}}\" data-trigger=\"hover\" data-placement=\"left\" data-title=\"Title: {{data_title}}\" id=\"{{image_id}}\"\u003e\n  \u003cdiv style=\"position: relative; top: {{top}}px; left: {{left}}px;\"\u003e\n    \u003cimg src=\"{{src}}\" width=\"{{width}}\" height=\"{{height}}\" alt=\"{{alt}}\" data-contentURL=\"{{data_url}}\"\u003e\u003c/img\u003e\n  \u003c/div\u003e\n\u003c/li\u003e","layout":"\u003cstyle\u003e\n.app-65346 header .logo {\n  background-image: url(\"/api/v2/apps/65346/assets/logo-small.png\"); }\n.app-65346 div#page_navigation {\n  text-align: center; }\n.app-65346 button.page_link {\n  background: white;\n  padding: 4px;\n  color: black; }\n.app-65346 button.current {\n  background-color: #E0E0E0;\n  color: gray; }\n.app-65346 button.left_end {\n  border-left: 2px gray solid;\n  border-right: 0;\n  border-bottom: 2px gray solid;\n  border-top: 2px gray solid;\n  border-radius: 3px 0 0 3px; }\n.app-65346 button.middle {\n  border-left: 2px gray solid;\n  border-right: 0;\n  border-bottom: 2px gray solid;\n  border-top: 2px gray solid; }\n.app-65346 button.right_end {\n  border: 2px gray solid;\n  border-radius: 0 3px 3px 0; }\n.app-65346 img.clickable:hover {\n  border: 5px green solid; }\n.app-65346 img.clickable {\n  margin-left: 5px; }\n.app-65346 .hidden {\n  display: none; }\n.app-65346 .btn {\n  margin-top: 5px; }\n.app-65346 .selector {\n  width: 100%;\n  text-align: center; }\n.app-65346 .main-btn {\n  width: 33%; }\n.app-65346 .sub-btn {\n  width: 25%; }\n.app-65346 .subsub-btn {\n  width: 50%; }\n.app-65346 .type-btn {\n  width: 20%; }\n.app-65346 .imgframe {\n  width: 100%; }\n.app-65346 .boxlist {\n  list-style-type: none;\n  margin: 8px 0px 0px 8px;\n  padding: 0px; }\n.app-65346 .imgbox {\n  box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  display: inline-block;\n  border: 2px solid #AAAAAA;\n  box-shadow: 0px 0px 2px #999999;\n  width: 96px;\n  height: 96px;\n  text-align: center;\n  margin: 0px 8px 8px 0px;\n  padding: 5px;\n  border-radius: 5px;\n  overflow: hidden; }\n.app-65346 .imgbox.text {\n  background-position: center;\n  background-image: url(\"/api/v2/apps/65346/assets/document.png\");\n  background-size: 82px 82px; }\n.app-65346 .imgbox.text img {\n  display: none; }\n.app-65346 .imgbox:hover {\n  border: 2px solid #78A300; }\n.app-65346 .highlight {\n  box-shadow: 0px 0px 6px 3px #679200;\n  border: 2px solid #78A300; }\n.app-65346 .field-error {\n  box-shadow: 0px 0px 6px #ff0000;\n  border: 1px solid #ff0000; }\n.app-65346 .modal {\n  width: 700px; }\n.app-65346 #externalURL, .app-65346 #externalFileName {\n  width: 300px; }\n.app-65346 .current {\n  border: .5px solid black;\n  color: blue; }\n.app-65346 button :disabled {\n  opacity: 0.5;\n  color: gray; }\n\u003c/style\u003e\n\u003cheader\u003e\n  \u003cspan class=\"logo\"/\u003e\n  \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n\u003c/header\u003e\n\u003cbody\u003e\n  \u003cdiv class=\"btn-group\"\u003e\n    \u003cbutton id=\"get_library\" class=\"btn main-btn\"\u003e{{t \"layout.library\"}}\u003c/button\u003e\n    \u003cbutton id=\"getImage\" class=\"btn main-btn\"\u003e{{t \"layout.ticket\"}}\u003c/button\u003e\n    \u003cbutton id=\"getExternal\" class=\"btn main-btn\"\u003e{{t \"layout.external\"}}\u003c/button\u003e\n  \u003c/div\u003e\n  \u003cbr\u003e\n\n\u003csection data-main/\u003e","library":"\u003cdiv class=\"imgframe\" id=\"insert_stuff\"\u003e\n  \u003cul class=\"boxlist\"\u003e\n    {{{imageList}}}\n  \u003c/ul\u003e\n\u003c/div\u003e\n{{{pagination}}}\n\u003cbutton class=\"hidden btn btn-large\" id=\"embed_images\"\u003e{{t \"library.embed\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"embed_link\"\u003e{{t \"library.link\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"remove_images\"\u003e{{t \"library.remove\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"preview_item\"\u003e{{t \"library.preview\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cdiv id=\"myModal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\" \u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003cbutton type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"\u003e×\u003c/button\u003e\n    \u003ch3 id=\"myModalLabel\"\u003e{{t \"library.document\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\" style=\"text-align: center;\"\u003e\n\u003ciframe id=\"modalIframe\" width=\"600\" height=\"780\" style=\"border: none;\"\u003e\u003c/iframe\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\"\u003e{{t \"library.close\"}}\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e","main":"\u003cdiv class=\"selector\"\u003e\n  \u003cdiv class=\"btn-group\"\u003e\n    \u003cbutton class=\"btn sub-btn active\"\u003egrp2:btn1\u003c/button\u003e\n    \u003cbutton class=\"btn sub-btn\"\u003egrp2:btn2\u003c/button\u003e\n    \u003cbutton class=\"btn sub-btn\"\u003egrp2:btn3\u003c/button\u003e\n    \u003cbutton class=\"btn sub-btn\"\u003egrp2:btn4\u003c/button\u003e\n  \u003c/div\u003e\n  \u003cbr\u003e\n  \u003cdiv class=\"btn-group\"\u003e\n    \u003cbutton class=\"btn subsub-btn active\"\u003egrp1:btn1\u003c/button\u003e\n    \u003cbutton class=\"btn subsub-btn\"\u003egrp1:btn2\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e","pagination":"\u003cdiv id='page_navigation'\u003e{{{page_navigation}}}\u003c/div\u003e","ticket":"\u003cdiv class=\"imgframe\" id=\"insert_stuff\"\u003e\n  \u003cul class=\"boxlist\"\u003e\n    {{{imageList}}}\n  \u003c/ul\u003e\n\u003c/div\u003e\n{{{pagination}}}\n\u003cbutton class=\"hidden btn btn-large\" id=\"add_images\"\u003e{{t \"ticket.add\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"preview_item\"\u003e{{t \"ticket.preview\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"embed_images\"\u003e{{t \"ticket.embed\"}}\u003c/button\u003e\u003c/br\u003e\n\u003cbutton class=\"hidden btn btn-large\" id=\"embed_link\"\u003e{{t \"ticket.link\"}}\u003c/button\u003e\u003c/br\u003e\n\n\u003cdiv id=\"myModal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\" \u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003cbutton type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"\u003e×\u003c/button\u003e\n    \u003ch3 id=\"myModalLabel\"\u003e{{t \"ticket.document\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\" style=\"text-align: center;\"\u003e\n\u003ciframe id=\"modalIframe\" width=\"600\" height=\"780\" style=\"border: none;\"\u003e\u003c/iframe\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\"\u003e{{t \"ticket.close\"}}\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e"},
      frameworkVersion: "1.0"
    });

  ZendeskApps["Attachment Library"] = app;
}

    with( ZendeskApps.AppScope.create() ) {

  var source = (function() {
  return {
    childRegex: /child_of:(\d*)/,
    parentRegex: /(?:father_of|parent_of):(\d*)/, //father_of is here to ensure compatibility with older versions

    events: {
      // APP EVENTS
      'app.created'                     : 'onCreated',
      'app.activated'                   : 'onActivated',
      'ticket.status.changed'           : 'loadIfDataReady',
      // AJAX EVENTS
      'createChildTicket.done'          : 'createChildTicketDone',
      'fetchTicket.done'                : 'fetchTicketDone',
      'fetchGroups.done'                : function(data){ this.fillGroupWithCollection(data.groups); },
      'createChildTicket.fail'          : 'genericAjaxFailure',
      'updateTicket.fail'               : 'genericAjaxFailure',
      'fetchTicket.fail'                : 'displayHome',
      'autocompleteRequester.fail'      : 'genericAjaxFailure',
      'fetchGroups.fail'                : 'genericAjaxFailure',
      'fetchUsersFromGroup.fail'        : 'genericAjaxFailure',

      // DOM EVENTS
      'click .new-linked-ticket'        : 'displayForm',
      'click .create-linked-ticket'     : 'create',
      'click .copy_description'         : 'copyDescription',
      'change select[name=requester_type]' : 'handleRequesterTypeChange',
      'change select[name=assignee_type]' : function(event){
        if (this.$(event.target).val() == 'custom')
          return this.formAssigneeFields().show();
        return this.formAssigneeFields().hide();
      },
      'change .group'                   : 'groupChanged',
      'click .token .delete'            : function(e) { this.$(e.target).parent('li.token').remove(); },
      'keypress .add_token input'       : function(e) { if(e.charCode === 13) { this.formTokenInput(e.target, true);}},
      'input .add_token input'            : function(e) { this.formTokenInput(e.target); },
      'focusout .add_token input'         : function(e) { this.formTokenInput(e.target,true); },
      'focusout .linked_ticket_form [required]' : 'handleRequiredFieldFocusout'
    },

    requests: {
      createChildTicket: function(ticket){
        return {
          url: '/api/v2/tickets.json',
          dataType: 'json',
          data: JSON.stringify(ticket),
          processData: false,
          contentType: 'application/json',
          type: 'POST'
        };
      },
      updateTicket: function(id, data){
        return {
          url: '/api/v2/tickets/'+ id +'.json',
          dataType: 'json',
          data: JSON.stringify(data),
          processData: false,
          contentType: 'application/json',
          type: 'PUT'
        };
      },
      fetchTicket: function(id){
        return {
          url: '/api/v2/tickets/' + id + '.json?include=groups,users',
          dataType: 'json',
          type: 'GET'
        };
      },
      autocompleteRequester: function(email){
        return {
          url: '/api/v2/users/autocomplete.json?name=' + email,
          type: 'POST'
        };
      },
      fetchGroups: function(){
        return {
          url: '/api/v2/groups/assignable.json',
          type: 'GET'
        };
      },
      fetchUsersFromGroup: function(group_id){
        return {
          url: '/api/v2/groups/' + group_id + '/users.json',
          type: 'GET'
        };
      },
      fetchComments: function(ticketId){
        return {
          url: '/api/v2/tickets/' + ticketId + '/comments.json?per_page=1',
          type: 'GET'
        };
      },
      paginatedRequest: function(request, page, args) {
        var requestArgs = this.requests[request];
        if (_.isFunction(requestArgs)) {
          requestArgs = requestArgs.apply(this, args);
        }
        requestArgs.url += (/\?/.test(requestArgs.url)) ? '&page=' + page : '?page=' + page;
        return requestArgs;
      }
    },

    onCreated: function() {
      this.displayHome();
    },

    onActivated: function() {
      _.defer(function() {
        if (this.hideAncestryField()) {
          this.loadIfDataReady();
        }
      }.bind(this));
    },

    loadIfDataReady: function(){
      if (this.ticket() &&
          this.ticket().id() &&
          !_.isUndefined(this.ancestryValue())){

        if (this.hasChild() || this.hasParent())
          return this.ajax('fetchTicket', this.childID() || this.parentID());
      }
    },

    ticketIsClosed: function() {
      return this.ticket().status() == "closed";
    },

    displayHome: function(data){
      this.switchTo('home', {
        closed_warn: this.ticketIsClosed(),
        forbidden: data && data.status === 403
      });
    },

    displayForm: function(event){
      if(this.ticketIsClosed()) {
        return;
      }

      event.preventDefault();

      this.paginateRequest('fetchGroups').then(function(data){
        this.fillGroupWithCollection(data.groups);
      }.bind(this));

      this.switchTo('form', {
        current_user: {
          email: this.currentUser().email()
        },
        closed_warn: this.ticketIsClosed(),
        tags: this.tags(),
        ccs: this.ccs()
      });

      this.bindAutocompleteOnRequesterEmail();
    },

    create: function(event){
      event.preventDefault();

      if (this.formIsValid()){
        var attributes = this.childTicketAttributes();

        this.spinnerOn();
        this.disableSubmit();

        this.ajax('createChildTicket', attributes)
          .fail(function(){
            this.enableSubmit();
          })
          .always(function(){
            this.spinnerOff();
          });
      }
    },

    // FORM RELATED

    formSubject: function(val){ return this.formGetOrSet('.subject', val); },
    formDescription: function(val){ return this.formGetOrSet('.description', val); },
    formGroup: function(val){return this.formGetOrSet('.group', val); },
    formAssignee: function(val){return this.formGetOrSet('.assignee', val); },
    formRequesterEmail: function(val){return this.formGetOrSet('.requester_email', val); },
    formRequesterName: function(val){return this.formGetOrSet('.requester_name', val); },

    formGetOrSet: function(selector, val){
      if (_.isUndefined(val))
        return this.$(selector).val();
      return this.$(selector).val(val);
    },

    formRequesterType: function(){
      return this.$('select[name=requester_type]').val();
    },

    formRequesterFields: function(){
      return this.$('.requester_fields');
    },

    formAssigneeFields: function(){
      return this.$('.assignee_fields');
    },

    formAssigneeType: function(){
      return this.$('select[name=assignee_type]').val();
    },

    formToken: function(type){
      return _.map(this.$('.'+type+' li.token span'), function(i){ return i.innerHTML; });
    },

    formTokenInput: function(el, force){
      var input = this.$(el);
      var value = input.val();

      if ((value.indexOf(' ') >= 0) || force){
        _.each(_.compact(value.split(' ')), function(token){
          var li = '<li class="token"><span>'+token+'</span><a class="delete" tabindex="-1">×</a></li>';
          this.$(el).before(li);
        }, this);
        input.val('');
      }
    },

    fillGroupWithCollection: function(collection){
      return this.$('.group').html(this.htmlOptionsFor(collection));
    },

    fillAssigneeWithCollection: function(collection){
      return this.$('.assignee').html(this.htmlOptionsFor(collection));
    },

    formShowAssignee: function(){
      return this.$('.assignee-group').show();
    },

    formHideAssignee: function(){
      return this.$('.assignee-group').hide();
    },

    disableSubmit: function(){
      return this.$('.btn').prop('disabled', true);
    },

    enableSubmit: function(){
      return this.$('.btn').prop('disabled', false);
    },

    htmlOptionsFor:  function(collection){
      var options = '<option>-</option>';

      _.each(collection, function(item){
        options += '<option value="'+item.id+'">'+(item.name || item.title)+'</option>';
      });

      return options;
    },

    formIsValid: function(){
      var requiredFields = this.$('form.linked_ticket_form [required]'),
          validatedFields = this.validateFormFields(requiredFields);

      return _.all(validatedFields, function(validatedField) {
        return validatedField === true;
      }, this);
    },

    validateFormFields: function(fields){
      var validatedFields = [];

      _.each(fields, function(field) {
        var isValid = this.validateField(field);
        validatedFields.push(isValid);
      }, this);

      return validatedFields;
    },

    validateField: function(field) {
      var viewField = this.$(field),
      valid = !_.isEmpty(viewField.val());

      if (valid){
        viewField.parents('.control-group').removeClass('error');
        return true;
      } else {
        viewField.parents('.control-group').addClass('error');
        return false;
      }
    },

    handleRequiredFieldFocusout: function(event) {
      this.validateField(event.currentTarget);
    },

    spinnerOff: function(){
      this.$('.spinner').hide();
    },

    spinnerOn: function(){
      this.$('.spinner').show();
    },

    // EVENT CALLBACKS

    fetchTicketDone: function(data){
      var assignee = _.find(data.users, function(user){
        return user.id == data.ticket.assignee_id;
      });

      var custom_field = _.find(data.ticket.custom_fields, function(field){
        return field.id == this.ancestryFieldId();
      }, this);

      var is_child = this.childRegex.test(custom_field.value);


      var group = _.find(data.groups, function(item){
        return item.id == data.ticket.group_id;
      });

      if (assignee)
        assignee = assignee.name;

      data.ticket.locale = {};
      _.each(['status', 'type'], (function(name) {
        data.ticket.locale[name] = this.localizeTicketValue(name, data.ticket[name]);
      }).bind(this));

      var parent_closed = false;

      if(this.ticketIsClosed()) {
        parent_closed = true;
      }

      this.switchTo('has_relation', { ticket: data.ticket,
                                      is_child: is_child,
                                      assignee: assignee,
                                      group: group,
                                      closed_warn: parent_closed
                                    });
    },

    localizeTicketValue: function(name, value) {
      var path = helpers.fmt("ticket.values.%@.%@", name, value);
      return this.I18n.t(path);
    },

    createChildTicketDone: function(data){
      var value = "parent_of:" + data.ticket.id;

      if(this.ticket().status() != "closed") {
        this.ticket().customField("custom_field_" + this.ancestryFieldId(),value);

        this.ajax('updateTicket',
                  this.ticket().id(),
                  { "ticket": { "custom_fields": [
                    { "id": this.ancestryFieldId(), "value": value }
                  ]}});
      }

      this.ajax('fetchTicket', data.ticket.id);

      this.spinnerOff();
    },

    copyDescription: function(){
      this.spinnerOn();
      this.disableSubmit();

      this.ajax('fetchComments', this.ticket().id()).then(function(data) {
        var useRichText = this.ticket().comment().useRichText();
        var ticketDescription = data.comments[0];
        var newTicketContent = useRichText ? ticketDescription.html_body : ticketDescription.body;
        var newLine = useRichText ? '<br />' : '\n';
        var descriptionDelimiter = helpers.fmt(newLine + "--- %@ ---" + newLine, this.I18n.t("delimiter"));
        var formDescription = this.formDescription().split(descriptionDelimiter);

        var ret = formDescription[0];

        if (formDescription.length === 1) {
          ret += descriptionDelimiter + newTicketContent;
        }

        this.formDescription(ret);

        this.spinnerOff();
        this.enableSubmit();
      }.bind(this));
    },

    bindAutocompleteOnRequesterEmail: function(){
      var self = this;

      // bypass this.form to bind the autocomplete.
      this.$('.requester_email').autocomplete({
        minLength: 3,
        source: function(request, response) {
          self.ajax('autocompleteRequester', request.term).done(function(data){
            response(_.map(data.users, function(user){
              return {"label": user.email, "value": user.email};
            }));
          });
        },
        select: function() {
          self.$('.requester_name').prop('required', false);
          self.$('.requester_fields .control-group').removeClass('error');
        }
      });
    },

    handleRequesterTypeChange: function(event){
      var self = this,
          fields = this.formRequesterFields().find('input');

      if (this.$(event.target).val() == 'custom') {
        this.formRequesterFields().show();
        fields.prop('required', true);
      } else {
        this.formRequesterFields().hide();
        fields.prop('required', false);
      }
    },

    groupChanged: function(){
      var group_id = Number(this.formGroup());

      if (!_.isFinite(group_id)) {
        return this.formHideAssignee();
      }

      this.spinnerOn();

      this
        .paginateRequest('fetchUsersFromGroup', group_id)
        .done(function(data){
          this.formShowAssignee();
          this.fillAssigneeWithCollection(data.users);
        }.bind(this))
        .always(function(){ this.spinnerOff(); }.bind(this));
    },

    genericAjaxFailure: function(){
      services.notify(this.I18n.t('ajax_failure'), 'error');
    },

    // FORM TO JSON

    childTicketAttributes: function(){
      var params = {
        "subject": this.formSubject(),
        "comment": {},
        "custom_fields": [
          {
            id: this.ancestryFieldId(),
            value: 'child_of:' + this.ticket().id()
          }
        ]
      };

      if (this.ticket().comment().useRichText()){
        params.comment.html_body = this.convertLineBreaksToHtml(this.formDescription());
      } else {
        params.comment.body = this.formDescription();
      }

      _.extend(params,
               this.serializeRequesterAttributes(),
               this.serializeAssigneeAttributes(),
               this.serializeTagAttributes()
              );

      return { "ticket": params };
    },

    serializeTagAttributes: function(){
      var attributes = { tags: [] };
      var tags = this.formToken('tags');
      var ccs = this.formToken('ccs');

      if (tags)
        attributes.tags = tags;

      if (ccs)
        attributes.collaborators = ccs;

      return attributes;
    },

    serializeAssigneeAttributes: function(){
      var type = this.formAssigneeType();
      var attributes = {};

      // Very nice looking if/elseif/if/if/elseif/if/if
      // see: http://i.imgur.com/XA7BG5N.jpg
      if (type == 'current_user'){
        attributes.assignee_id = this.currentUser().id();
      } else if (type == 'ticket_assignee' &&
                 this.ticket().assignee()) {

        if (this.ticket().assignee().user()){
          attributes.assignee_id = this.ticket().assignee().user().id();
        }
        if (this.ticket().assignee().group()){
          attributes.group_id = this.ticket().assignee().group().id();
        }
      } else if (type == 'custom' &&
                 (this.formGroup() || this.formAssignee())){
        var group_id = Number(this.formGroup());
        var assignee_id = Number(this.formAssignee());

        if (_.isFinite(group_id))
          attributes.group_id = group_id;

        if (_.isFinite(assignee_id))
          attributes.assignee_id = assignee_id;
      }

      return attributes;
    },

    serializeRequesterAttributes: function(){
      var type = this.formRequesterType();
      var attributes  = {};

      if (type == 'current_user'){
        attributes.requester_id = this.currentUser().id();
      } else if (type == 'ticket_requester' &&
                 this.ticket().requester().id()) {
        attributes.requester_id = this.ticket().requester().id();
      } else if (type == 'custom' &&
                 this.formRequesterEmail()){
        attributes.requester = {
          "email": this.formRequesterEmail(),
          "name": this.formRequesterName()
        };
      }
      return attributes;
    },

    paginateRequest: function(request, options) {
      var requestArgs = Array.prototype.slice.call(arguments, 1),
          property = /^fetch(\w+?)(?:$|From)/.exec(request)[1].toLowerCase(),
          arrayData = [],
          page = 1;

      return this.promise(function(done, fail) {
        function onSuccess(data) {
          arrayData = arrayData.concat(data[property]);
          if (data.next_page) {
            makeRequest();
          } else {
            var returnObj = {};
            returnObj[property] = arrayData;
            done.call(this, returnObj);
          }
        }

        function onFail() {
          fail.apply(this, arguments);
        }

        var makeRequest = function() {
          this.ajax.call(this, 'paginatedRequest', request, page++, requestArgs).then(onSuccess, onFail);
        }.bind(this);

        makeRequest();
      }.bind(this));
    },

    // HELPERS

    tags: function(){
      var tags = [];

      if (!_.isEmpty(this.ticket().tags()))
        tags = _.union(tags,this.ticket().tags());

      if (!_.isEmpty(this.settings.child_tag))
        tags = _.union(tags, [ this.settings.child_tag ]);

      return tags;
    },

    ccs: function(){
      return _.map(this.ticket().collaborators(), function(cc){ return cc.email(); });
    },

    hideAncestryField: function(){
      var field = this.ticketFields("custom_field_" + this.ancestryFieldId());

      if (!field){
        services.notify(this.I18n.t("ancestry_field_missing"), "error");
        return false;
      }

      return field.hide();
    },
    ancestryValue: function(){
      return this.ticket().customField("custom_field_" + this.ancestryFieldId());
    },
    ancestryFieldId: function(){
      return this.setting('ancestry_field');
    },
    hasChild: function(){
      return this.parentRegex.test(this.ancestryValue());
    },
    hasParent: function(){
      return this.childRegex.test(this.ancestryValue());
    },
    childID: function(){
      if (!this.hasChild())
        return;

      return this.parentRegex.exec(this.ancestryValue())[1];
    },
    parentID: function(){
      if (!this.hasParent())
        return;

      return this.childRegex.exec(this.ancestryValue())[1];
    },
    convertLineBreaksToHtml: function(strToConvert){
      return strToConvert.replace(/\n/g, "<br />");
    }
  };
}());
;
}
var app = ZendeskApps.defineApp(source)
  .reopenClass({"location":{"zendesk":{"ticket_sidebar":"_legacy"}},"noTemplate":false,"singleInstall":false})
  .reopen({
    appName: "Linked Ticket",
    appVersion: "1.9.8",
    assetUrlPrefix: "/api/v2/apps/6272/assets/",
    appClassName: "app-6272",
    author: {
      name: "Zendesk",
      email: "support@zendesk.com"
    },
    translations: {"app":{"parameters":{"ancestry_field":{"label":"Champ de référence","helpText":"Placez un ID de champ texte personnalisé pour stocker les données de référence Ticket lié. Exemple : 2240041"},"child_tag":{"label":"Marqueur enfant","helpText":"Ce marqueur sera ajouté au ticket enfant créé. Exemple : ticket_enfant"}}},"ajax_failure":"Une erreur est survenue. Essayez de recharger l’application.","ancestry_field_missing":"\u003cstrong\u003eApplication Ticket lié :\u003c/strong\u003e Avez-vous suivi les instructions de configuration et défini un champ personnalisé ?","has_parent":"Ce ticket a un ticket parent.","has_child":"Ce ticket a un ticket enfant.","form":{"subject":{"label":"Sujet :"},"description":{"label":"Description :"},"requester_email":{"label":"E-mail du demandeur"},"requester_name":{"label":"Nom du demandeur (pour les nouveaux demandeurs uniquement)"},"group":{"label":"Groupe"},"requester":{"label":"Demandeur :","current_user":"moi","ticket_requester":"demandeur du ticket","custom":"autre"},"assignee":{"label":"Assigné :","current_user":"moi","ticket_assignee":"assigné au ticket","custom":"autre","group_label":"Groupe de l’assigné","name_label":"Nom de l’assigné"},"copy_description":{"label":"Copier la description du ticket actuel"},"ccs":{"label":"CC :"},"tags":{"label":"Marqueurs :"},"submit":"Créer le ticket","loading":"Envoi..."},"ticket":{"id":"ID","subject":"Sujet :","status":"Statut","type":"Type","assignee":"Assigné :","group":"Groupe","values":{"status":{"new":"Nouveau","open":"Ouvert","pending":"En attente","hold":"En pause","solved":"Résolu","closed":"Clos"},"type":{"problem":"Problème","incident":"Incident","question":"Question","task":"Tâche"}}},"delimiter":"Description d’origine","forbidden":"Vous n’êtes pas autorisé à consulter ce ticket lié.","create_ticket":"Créer un ticket","closed_warn":"Le ticket parent est clos et ne peut pas être modifié. Seul le ticket enfant continuera de contenir une référence."},
    templates: {"form":"{{#if closed_warn}}\n  \u003cdiv class=\"alert alert-danger\"\u003e{{t \"closed_warn\"}}\u003c/div\u003e\n{{/if}}\n\n\u003cdiv class=\"row-fluid\"\u003e\n  \u003cdiv class=\"well span12\"\u003e\n    \u003cform class=\"linked_ticket_form\"\u003e\n\n      \u003cstrong\u003e* {{t \"form.requester.label\"}}\u003c/strong\u003e\n      \u003cdiv class=\"control-group\"\u003e\n        \u003cselect name=\"requester_type\" class=\"span12\" required\u003e\n          \u003coption value=\"\"\u003e-\u003c/option\u003e\n          \u003coption value=\"current_user\"\u003e{{t \"form.requester.current_user\"}} - {{current_user.email}}\u003c/option\u003e\n          \u003coption value=\"ticket_requester\"\u003e{{t \"form.requester.ticket_requester\"}} - {{ticket.requester.email}}\u003c/option\u003e\n          \u003coption value=\"custom\"\u003e{{t \"form.requester.custom\"}}\u003c/option\u003e\n        \u003c/select\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"requester_fields\"\u003e\n        \u003cdiv class=\"control-group\"\u003e\n          \u003clabel\u003e\n            * {{t \"form.requester_email.label\"}}\n            \u003cinput type=\"text\" class=\"requester_email span12\"\u003e\n          \u003c/label\u003e\n        \u003c/div\u003e\n\n        \u003cdiv class=\"control-group\"\u003e\n          \u003clabel\u003e\n            * {{t \"form.requester_name.label\"}}\n            \u003cinput type=\"text\" class=\"requester_name span12\"\u003e\n          \u003c/label\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n\n      \u003cstrong\u003e{{t \"form.assignee.label\"}}\u003c/strong\u003e\n      \u003cdiv class=\"control-group\"\u003e\n        \u003clabel\u003e\n          \u003cselect name=\"assignee_type\" class=\"span12\"\u003e\n            \u003coption value=\"\"\u003e-\u003c/option\u003e\n            \u003coption value=\"current_user\"\u003e{{t \"form.assignee.current_user\"}} - {{current_user.email}}\u003c/option\u003e\n            \u003coption value=\"ticket_assignee\"\u003e{{t \"form.assignee.ticket_assignee\"}} - {{ticket.assignee.group.name}}/{{ticket.assignee.user.email}}\u003c/option\u003e\n            \u003coption value=\"custom\"\u003e{{t \"form.assignee.custom\"}}\u003c/option\u003e\n          \u003c/select\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"assignee_fields\"\u003e\n        \u003cdiv class=\"control-group\"\u003e\n          \u003clabel\u003e{{t \"form.assignee.group_label\"}}\n            \u003cselect class=\"group span12\"\u003e\n              \u003coption\u003e-\u003c/option\u003e\n            \u003c/select\u003e\n          \u003c/label\u003e\n        \u003c/div\u003e\n\n        \u003cdiv class=\"assignee-group control-group\" style=\"display:none;\"\u003e\n          \u003clabel\u003e{{t \"form.assignee.name_label\"}}\n            \u003cselect class=\"assignee span12\"\u003e\n              \u003coption\u003e-\u003c/option\u003e\n            \u003c/select\u003e\n          \u003c/label\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n\n      \u003cstrong\u003e{{t \"form.ccs.label\"}}\u003c/strong\u003e\n      \u003cdiv class=\"form_field ccs\"\u003e\n        \u003cul class=\"token_list span12\"\u003e\n          {{#each ccs}}\n          \u003cli class=\"token\"\u003e\n            \u003cspan\u003e{{this}}\u003c/span\u003e\n            \u003ca class=\"delete\" tabindex=\"-1\"\u003e×\u003c/a\u003e\n          \u003c/li\u003e\n          {{/each}}\n          \u003cli class=\"add_token\"\u003e\u003cinput class=\"highlightable\" type=\"text\"\u003e\u003c/li\u003e\n        \u003c/ul\u003e\n      \u003c/div\u003e\n      \u003cbr/\u003e\n\n      \u003cstrong\u003e{{t \"form.tags.label\"}}\u003c/strong\u003e\n      \u003cdiv class=\"form_field tags\"\u003e\n        \u003cul class=\"token_list span12\"\u003e\n          {{#each tags}}\n          \u003cli class=\"token\"\u003e\n            \u003cspan\u003e{{this}}\u003c/span\u003e\n            \u003ca class=\"delete\" tabindex=\"-1\"\u003e×\u003c/a\u003e\n          \u003c/li\u003e\n          {{/each}}\n          \u003cli class=\"add_token\"\u003e\u003cinput class=\"highlightable\" type=\"text\"\u003e\u003c/li\u003e\n        \u003c/ul\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"control-group\"\u003e\n        \u003clabel\u003e\n          \u003cstrong\u003e* {{t \"form.subject.label\"}}\u003c/strong\u003e\n          \u003cinput type=\"text\" class=\"subject span12\" required\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"control-group\"\u003e\n        \u003clabel class=\"checkbox\"\u003e\n          \u003cinput type=\"checkbox\" class=\"copy_description\"\u003e{{t \"form.copy_description.label\"}}\n        \u003c/label\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"control-group\"\u003e\n        \u003clabel\u003e\n          \u003cstrong\u003e* {{t \"form.description.label\"}}\u003c/strong\u003e\n          \u003ctextarea rows=\"8\" class=\"description span12\" required\u003e\u003c/textarea\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"centered\"\u003e\n        \u003cbutton type=\"submit\" class=\"create-linked-ticket btn btn-success btn-large\"\u003e{{t \"form.submit\"}}\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/form\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"spinner\"\u003e\u003c/div\u003e","has_relation":"{{#if closed_warn}}\n  \u003cdiv class=\"alert alert-danger\"\u003e{{t \"closed_warn\"}}\u003c/div\u003e\n{{/if}}\n\n\u003cdiv class=\"well well-small\"\u003e\n  \u003cdiv class=\"row-fluid\"\u003e\n    \u003cdiv class=\"span12\"\u003e\n      \u003ca href=\"#/tickets/{{ticket.id}}\"\u003e\n        \u003cstrong\u003e\n          \u003e\u003e\u0026nbsp;\n          {{#if is_child}}\n          {{t \"has_child\"}}\n          {{else}}\n          {{t \"has_parent\"}}\n          {{/if}}\n        \u003c/strong\u003e\n      \u003c/a\u003e\n    \u003c/div\u003e\n\n    \u003cdiv class=\"span12\"\u003e\n      \u003cdiv class=\"span3\"\u003e\n        \u003cstrong\u003e\n          {{t \"ticket.id\"}}\n        \u003c/strong\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"span9\"\u003e\n        \u003cstrong\u003e\n          \u003ca href=\"#/tickets/{{ticket.id}}\"\u003e\n            {{ticket.id}}\n          \u003c/a\u003e\n        \u003c/strong\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    \u003cdiv class=\"span12\"\u003e\n      \u003cdiv class=\"span3\"\u003e\n        \u003cstrong\u003e\n          {{t \"ticket.subject\"}}\n        \u003c/strong\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"span9\"\u003e\n        {{ticket.subject}}\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    \u003cdiv class=\"span12\"\u003e\n      \u003cdiv class=\"span3\"\u003e\n        \u003cstrong\u003e\n          {{t \"ticket.status\"}}\n        \u003c/strong\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"span9\"\u003e\n        \u003cspan class=\"ticket_status_label {{ticket.status}}\"\u003e\n          \u003cstrong\u003e{{ticket.locale.status}}\u003c/strong\u003e\n        \u003c/span\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    {{#if ticket.type}}\n      \u003cdiv class=\"span12\"\u003e\n        \u003cdiv class=\"span3\"\u003e\n          \u003cstrong\u003e\n            {{t \"ticket.type\"}}\n          \u003c/strong\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"span9\"\u003e\n          {{ticket.locale.type}}\n        \u003c/div\u003e\n      \u003c/div\u003e\n    {{/if}}\n\n    \u003cdiv class=\"span12\"\u003e\n      \u003cdiv class=\"span3\"\u003e\n        \u003cstrong\u003e\n          {{t \"ticket.assignee\"}}\n        \u003c/strong\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"span9\"\u003e\n        {{assignee}}\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    \u003cdiv class=\"span12\"\u003e\n      \u003cdiv class=\"span3\"\u003e\n        \u003cstrong\u003e\n          {{t \"ticket.group\"}}\n        \u003c/strong\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"span9\"\u003e\n        {{group.name}}\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n  \u003c/div\u003e\n\u003c/div\u003e","home":"{{#if forbidden}}\n  \u003cdiv class=\"well\"\u003e\n    \u003cdiv class=\"row-fluid centered\"\u003e\n      {{t \"forbidden\"}}\n    \u003c/div\u003e\n  \u003c/div\u003e\n{{else}}\n  {{#if closed_warn}}\n    \u003cdiv class=\"alert alert-danger\"\u003e{{t \"closed_warn\"}}\u003c/div\u003e\n  {{/if}}\n  \u003cdiv class=\"well\"\u003e\n    \u003cdiv class=\"row-fluid centered\"\u003e\n      \u003ca class=\"new-linked-ticket btn btn-success btn-large\"\n         {{#if closed_warn}}disabled=\"disabled\"{{/if}}\u003e\n        {{t \"create_ticket\"}}\n      \u003c/a\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n{{/if}}","layout":"\u003cstyle\u003e\n.app-6272 header .logo {\n  background-image: url(\"/api/v2/apps/6272/assets/logo-small.png\"); }\n.app-6272 .control-group {\n  margin-bottom: 10px; }\n.app-6272 .centered {\n  text-align: center; }\n.app-6272 .requester_fields {\n  display: none; }\n.app-6272 .assignee_fields {\n  display: none; }\n.app-6272 select {\n  display: block;\n  border: 1px solid #CCC; }\n.app-6272 .token_list {\n  margin-bottom: 10px; }\n.app-6272 .token_list .token {\n  white-space: normal; }\n.app-6272 div.spinner {\n  display: none;\n  width: 100px;\n  height: 100px;\n  position: absolute;\n  top: 40%;\n  left: 50%;\n  background: url(\"/api/v2/apps/6272/assets/spinner.gif\") no-repeat center center;\n  text-align: center;\n  padding: 10px;\n  margin-left: -50px;\n  margin-top: -50px;\n  z-index: 2;\n  overflow: auto; }\n.app-6272 .text-warning {\n  color: #a94442;\n  font-size: 95%; }\n\u003c/style\u003e\n\u003cheader\u003e\n  \u003cspan class=\"logo\"/\u003e\n  \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n\u003c/header\u003e\n\n\u003csection data-main/\u003e"},
    frameworkVersion: "1.0"
  });

ZendeskApps["Linked Ticket"] = app;

    with( ZendeskApps.AppScope.create() ) {

  var source = /* globals FormData */

 /**
 * @constructor
 */
(function() {
  'use strict';

  /**====================== Dashboard Globals START ============================**/
  var REFRESH_RATE = 300; // The rate of a page refresh in seconds
  var REFRESH_FAILURE_RESTART = 5; // The delay before retrying after a refresh failure.
  
  var ENTRY_HEIGHT = 72;  // Fixed
  var SEPARATOR_HEIGHT = 72; // Fixed
  var COL_HEADER_HEIGHT = 72; // Fixed
  
  var FACET_ITEM_HEIGHT=24;
  
  // Can be overridden by maxColEntries app setting
  var MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN = 8;
  
  // Calculated from max number of allowed entries in a single column
  var ENTRIES_COL_HEIGHT = 0;
  var SINGLE_COLUMN_HEIGHT = 0;
  var SPLIT_COLUMN_HEIGHT = 0;
  var COLUMN_PADDING = 8;
  
  var MAX_HOVER_DESCRIPTION_LENGTH = 253;
  var MAX_FACET_LABEL_LENGTH = 33;
  
  var EVENT_LABELS = {"agent_work_time":"Solve","requester_wait_time":"Solve","first_reply_time":"Reply","next_reply_time":"Reply"};
  
  var VIEW_NAME = "Coherence SLA Dashboard View";
  
  var PER_PAGE = 100;
  /**======================== Dashboard Globals END ==============================**/
  
  
  /************************** STRING HELPERS START  ******************************/ 
  /** String function to clip to the supplied length and add suspension marks */
  String.prototype.clipTo = function(maxlength) {
    var result = this;
    if (this.length > maxlength) {
      result = this.substring(0,maxlength-3)+"...";
    }
    return result;
  };
  
  /** String function to clip to the supplied length and add suspension marks */
  String.prototype.startsWith = function(str) {
    var result = false;
    if (str) {
      var l = str.length;
      if (l<this.length) {
       var start = this.substring(0, l);
       return start===str;
      }
    }
    return false;
  };
  /************************ STRING HELPERS END ************************************/  
  
  
  /**====================== Dashboard Classes START =============================**/
  
  /**======= Facets Class START ========**/
  function Facets(facetTypes, app) {
    // local pointer to this app
    this.app = app;
    // A Facets substructure to contain the raw facet values for each possible facet type :
    // eventName, priority, org_name, assignee_name, grp_name, nextevents, custom_status
    this.facets = {};
    this.facets.eventName = {};     // event names
    this.facets.priority = {};      // priority
    this.facets.org_name = {};      // organization names
    this.facets.assignee_name = {}; // assignee names
    this.facets.grp_name = {};      // group names
    this.facets.nextevents = {};    // number of tickets with next events (faux facet)
    this.facets.custom_status = {}; // Custom Status (if applicable)
    this.panels = {};
    this.panels.content_personnel=false;
    this.panels.content_status=false;
    this.panels.content_priority=false;
    this.panels.content_custom_fields=false;
    this.panels.content_events=false;
    this.filters={};   // A structure representing which facets are currently selected and being applied
    this.sorted = {};  // A stucture holding reordered facet values ultimately used to drive the template display
    this.active = {};  // A structure representing which facets are currently active for use and therefore displayed
    this.active.grp_name = ((facetTypes!=null) && _.contains(facetTypes,"Groups")) ? "" : "hidden";
    this.active.assignee_name = ((facetTypes!=null) && _.contains(facetTypes,"Agents")) ? "":"hidden";
    this.active.org_name = ((facetTypes!=null) && _.contains(facetTypes,"Organizations")) ? "":"hidden";
    this.active.priority = ((facetTypes!=null) && _.contains(facetTypes,"Priority")) ? "":"hidden";
    var active = null;
    // A structure to represent which facet panel groupings to show based on presence of child facet filters inside
    this.showpanel = {};
    this.showpanel.personnel=(this.active.grp_name==="" || this.active.assignee_name==="" || this.active.org_name==="") ? "":"hidden";
    this.showpanel.priority= (this.active.priority==="") ? "": "hidden";
    // A structure to represent the expansion state and size of the facet areas
    this.expansions = {};
    this.expansions.eventName={};
    this.expansions.eventName.size=1;
    this.expansions.priority={};
    this.expansions.priority.size=1;
    this.expansions.org_name={};
    this.expansions.org_name.size=1;
    this.expansions.assignee_name={};
    this.expansions.assignee_name.size=1;
    this.expansions.grp_name={};
    this.expansions.grp_name.size=1;
  }
  
  Facets.prototype.filterCount = function() {
    return Object.keys(this.filters).length;
  };
  
  // Used to build a display string of currently selected filter values into display names for use in breadcrumb on main dashboard 
  Facets.prototype.filterString = function() {
    var result = "";
    for (var i in this.filters) {
      result += " | ";
      var filter = this.filters[i];
      var term = filter.label;
      if (filter.label==="<none>") {
        if (filter.type==="org_name") {
          term = this.app.I18n.t('dash.noorgs'); // "<no organizations>"
        } else if (filter.type==="assignee_name") {
          term = this.app.I18n.t('dash.noagents');// "<no agents>"
        } else if (filter.type==="grp_name") {
          term = this.app.I18n.t('dash.nogroups');// "<no groups>"
        }
      }
      result += term;
    }
    if (result==="") {
      result = " | " + this.app.I18n.t('dash.all');
    }
    return result;
  };
  
  // Resets an individual facet count back to zero
  Facets.prototype.resetFacet = function(facetType) {
    var oldFacet = this.facets[facetType];
    this.facets[facetType] = {};
    for (var i in oldFacet) {
      var val = oldFacet[i];
      if (val.selected==="selected") {
        val.count = 0;
        this.facets[facetType][i]=val;
      }
    }
  };
  
  // Resets all facet counts back to zero 
  // Used prior to a dashboard data refresh and reanalysis
  Facets.prototype.resetCounts = function() {
    // Preserve only the selected values and return their counts to zero
    this.resetFacet("eventName");
    this.resetFacet("priority");
    this.resetFacet("org_name");
    this.resetFacet("assignee_name");
    this.resetFacet("grp_name");
  };
  
  // Increments the count for a particular facet
  // Called whilst analysing each entry of dashboard data
  Facets.prototype.incrementFacet = function(facetType,value) {
    if (value) {
      var facet = this.facets[facetType][value];
      if (!facet) {
        this.facets[facetType][value] = {};
        this.facets[facetType][value].value = value;
        this.facets[facetType][value].selected="";
        this.facets[facetType][value].count=1;
        var optionLabel = null;
        var clippedValue = null;
        clippedValue = value.clipTo(MAX_FACET_LABEL_LENGTH);
        this.facets[facetType][value].label=value==="&nbsp;"?"<none>":clippedValue;    
        this.facets[facetType][value].title= value;
      } else {
        this.facets[facetType][value].count++;
      }
    }
  };
  
  // Explicitly sets a facet value to a fixed count
  // Used by tickets next events faux facet
  Facets.prototype.setFacetCount = function(facetType,value,count) {
    var facet = this.facets[facetType][value];
    if (!facet) {
      this.facets[facetType][value] = {};
      this.facets[facetType][value].selected=""; 
      var clippedValue = value.clipTo(MAX_FACET_LABEL_LENGTH);
      this.facets[facetType][value].label=value==="&nbsp;"?"<none>":clippedValue;
      this.facets[facetType][value].title= value;
    }
    this.facets[facetType][value].count = count;
  };
  
  // Increments the appropriate facets for the supplied entry
  // which can either represent an event or a ticket
  Facets.prototype.recordEntry = function(entry) {
    this.incrementFacet("eventName", entry.eventName);
    this.incrementFacet("priority", entry.priority);
    this.incrementFacet("org_name", entry.org_name);
    this.incrementFacet("assignee_name", entry.assignee_name);
    this.incrementFacet("grp_name", entry.grp_name);
  };  
  
  // Returns whether a value within a facet type is selected
  Facets.prototype.isSelected = function(facetType,value) {
    var facet = this.facets[facetType][value];
    if (!facet) {
      return false;
    } else {
      return this.facets[facetType][value].selected==="selected";
    }
  };
  
  // Changes the internal facet data to represent a toggle of a facet value
  Facets.prototype.toggleFacetSelection = function(facetType,value) {
    var facet = this.facets[facetType][value];
    var filterId = facetType+":"+value;
    if (facet) {
      if (this.isSelected(facetType,value)) {
        this.facets[facetType][value].selected="";
        delete this.filters[filterId];
      } else {
        this.facets[facetType][value].selected="selected";
        this.filters[filterId]={"type":facetType,"value":value,"label":this.facets[facetType][value].label};
      }
      return true;
    } else {
      return false;
    }
  };
  
  // 
  Facets.prototype.getFacetById = function(id) {
    var parts = id.split(":");
    var result = {};
    result.type=parts[1];
    result.value=parts[2];
    return result;
  };
  
  // Returns true is the supplied entry (event or ticket)
  // matches the currently selected set of tickets.
  Facets.prototype.matchesFilter = function(entry) {
    var result = true;
    if (this.filterCount()>0) {
      for (var i in this.filters) {
        var filter = this.filters[i];
        var property = filter.type;
        var value = filter.value;
        result = result && (entry[property]===value);
      }
    }
    return result;
  };
  
  // Populate the sorted structure with facet values sorted by count (descending)
  // The facet selection panels order the facet values by count, largest to smallest
  Facets.prototype.orderByCount = function(facetExpansionSize) {
    for (var i in this.facets) {
      var facetType = this.facets[i];
      var facetVals = [];
      for (var j in facetType) {
        var facetValue = facetType[j];
        facetVals.push(facetValue);
      }
      facetVals.sort(this.byCountDesc);
      this.sorted[i]={};
      this.sorted[i].vals = facetVals;
      var numFacetVals = facetVals.length;
      if (i==="eventName") {
        numFacetVals++; // for the artificial tickets facet
      }
      var expansion = this.expansions[i];
      if (expansion) {
        var maxNumberOfVisibleItems = expansion.size*facetExpansionSize;
        var numVisibleItems = Math.min(maxNumberOfVisibleItems,numFacetVals);
        expansion.height = numVisibleItems*FACET_ITEM_HEIGHT;
        if (expansion.size<=1) {
          expansion.fewer = "hidden";
        } else {
          expansion.fewer = "";
        }
        if (numFacetVals<=maxNumberOfVisibleItems || expansion.size==2) {
          expansion.more = "hidden";
        } else {
          expansion.more = "";
        }
        if (expansion.fewer=="hidden" && expansion.more=="hidden") {
          expansion.buttons="hidden";
        } else {
          expansion.buttons="";
        }
      }
    }
  };
  
  // Sorting comparator
  Facets.prototype.byCountDesc = function(a,b) {
    return b.count - a.count;
  };
  
  Facets.prototype.numberOfFacets = function(facetType) {
    if (this.sorted[facetType]) {
      return this.sorted[facetType].length;
    } else {
      return 0;
    }    
  };
  /**========= Facets Class END  =======**/

 
  /**========== PageProperties Class START ==========**/
  function PageProperties() {
    this.viewMode=null;
    this.collapsed = "";
    this.facetExpansions= {};
    
  }
  PageProperties.prototype.getViewMode = function() {
    return this.viewMode;
  };
  PageProperties.prototype.setViewMode = function(viewMode) {
    this.viewMode = viewMode;
  };
  PageProperties.prototype.getViewName = function() {
    if (this.viewMode==="events_mode") {
      return "Destination Board (Events)";
    } else {
      return "Destination Board (Tickets)";
    }
  };
  PageProperties.prototype.getCollapsed = function() {
    return this.collapsed;
  };
  PageProperties.prototype.setCollapsed = function(val) {
    if (val) {
      this.collapsed = "collapsed";
    } else {
      this.collapsed = "";
    }
  };
   
  PageProperties.prototype.clone = function() {
    var result = new PageProperties();
    result.viewMode = this.viewMode;
    return result;
  };  
  /**=========== PageProperties Class END =========**/
  
  /**==========  PageData Class START =============**/
  function PageData(pageProperties,colModel) {
    // Clone the properties
    this.valid = true;
    this.pageProps = pageProperties.clone();
    this.cols = [];
    var columns = colModel.columns;
    for (var i=0; i<columns.length; i++) {
      var colEntries = [];
      this.cols.push(colEntries);
      var entries = columns[i].all;
      for (var j=0; j<entries.length; j++) {
        var entry = entries[j];
        colEntries.push(entry.entryId);
      }
    }    
  }
  PageData.prototype.compare = function(pageData) {
    var result = [];
    if (!pageData.valid) {
      return null;
    } else {
      // Cycle around each column
      for (var i=0; i<this.cols.length; i++) {
        var thisColEntries = this.cols[i];
        var otherColEntries = pageData.cols[i];
        var added= _.difference(thisColEntries,otherColEntries);
        var removed = _.difference(otherColEntries,thisColEntries);
        var trend = new Trend(added,removed);
        result.push(trend);      
      }
    }
    return result;
  };
  PageData.prototype.invalidate = function() {
    this.valid = false;
  };  
  /**=========  PageData Class END ===========**/
  
  /**========== Trend Class START ============**/
  function Trend(added,removed) {
    this.classes = {};
    this.classes.showTrendInfo="hide";
    this.classes.showDownward="hide";
    this.classes.showUpward="hide";
    this.added = 0;
    this.removed = 0;
    if (added && removed) {
      this.added = added.length;
      this.removed = removed.length;
      if (this.added>0 || this.removed>0) {
        this.classes.showTrendInfo="";
        var net = this.added - this.removed;
        if (net>0) {
          this.classes.showUpward="";
        }
        if (net<0) {
          this.classes.showDownward="";
        }
      }
    }
  }
  Trend.prototype.add = function(trend) {
    var result = new Trend();
    result.added += trend.added;
    result.removed += trend.removed;
    if (result.added>0 || result.removed>0) {
      result.classes.showTrendInfo="";
      var net = result.added - result.removed;
      if (net>0) {
        result.classes.showUpward="";
      }
      if (net<0) {
        result.classes.showDownward="";
      }
    }
    return result;
  };
  /**==========  Trend Class END ==========**/
  
 
  function IdentificationSegment(domain,userId,name,email,role,version) {
    this.userId = userId;
    this.properties = {};
    this.properties.domain = domain; 
    this.properties.app = "CloudSET ZD SLA Dashboard";
    this.properties.version = version;
    this.traits = {};
    this.traits.name = name;
    this.traits.email = email;
    this.traits.title = role;   
  }
  
  function TrackConfiguredSegment (domain,userId,username,email,role,slas,version){
    this.userId = userId;
    this.event = "Configured ZD SLA Dashboard First Use";
    this.properties = {};
    this.properties.domain = domain; 
    this.properties.app = "CloudSET ZD SLA Dashboard";
    this.properties.version = version;
    this.properties.useremail = email;
    this.properties.username = username;
    this.properties.role = role;
    this.properties.slas = slas;
  }
  
  function TrackUsageSegment (domain,userId,username,email,role,version) {
    this.userId = userId;
    this.event = "ZD SLA Dashboard Usage";
    this.filters = [];
    this.properties = {};
    this.properties.domain = domain; 
    this.properties.app = "CloudSET ZD SLA Dashboard";
    this.properties.version = version;
    this.properties.useremail = email;
    this.properties.username = username;
    this.properties.role = role;
    this.properties.ticketcount = null;
    this.properties.slas = null;
    this.properties.filterstr = "";
    this.clearUsageMetrics();
  }
  
  TrackUsageSegment.prototype.startUsage = function() {
    this.properties.start = Date.now();
  };
  
  TrackUsageSegment.prototype.calcUsageMetrics = function() {
    var now = Date.now();
    var then = this.properties.start;
    var usage_ms = now-then;          
    this.properties.usage_ms=usage_ms;
    this.properties.usage=this.toHoursMinsSecs(usage_ms);
  };
  
  TrackUsageSegment.prototype.clearUsageMetrics = function() {
    this.properties.start = null;
    this.filters = [];
    this.properties.filterstr="";
    this.properties.usage_ms=0;
    this.properties.usage="";
    this.properties.slas = null;
    this.properties.nav=false;
  };
  
  TrackUsageSegment.prototype.recordFilter = function(facetType) {
    if (!_.contains(this.filters,facetType)) {
      this.filters.push(facetType);
      var filterStr = "";
      for (var i=0; i<this.filters.length; i++) {
        if (i>0) {
          filterStr+=", ";
        }
        filterStr += this.filters[i];
      }
      this.properties.filterstr=filterStr;
    }
  };
  
  TrackUsageSegment.prototype.recordTicketCount = function(ticketCount) {
    this.properties.ticketcount = ticketCount;
  };
  
  TrackUsageSegment.prototype.start = function() {
    this.properties.start = Date.now();
  };
  
  TrackUsageSegment.prototype.started = function() {
    return this.properties.start != null;
  };
  
  TrackUsageSegment.prototype.toHoursMinsSecs = function(milliseconds) {
    var result = "";
    var secs = milliseconds/1000;
    if (secs>3600) {
      result = Math.floor(secs/3600)+"h ";
      secs = (secs % 3600);
    }
    if (secs > 60) {
      result += Math.floor(secs/60)+"m ";
      secs = (secs % 60);
    }
    result += Math.floor(secs) + "s";      
    return result;
  };

  TrackUsageSegment.prototype.recordHasSLAPolicies = function(hasSLAPolicies) {
    this.properties.slas = hasSLAPolicies;
  };

  TrackUsageSegment.prototype.recordNav = function() {
    this.properties.nav = true;
  };
  
  /**=========================== Dashboard Classes END =======================**/    
  

  return {
       
    /** SLA Assistant Mappings **/
    metricNameMap: {"first_reply_time":"First Response","next_reply_time":"Next Reply","requester_wait_time":"Resolution","agent_work_time":"Resolution"},
    metricDescMap: {"first_reply_time":"The time within which an Agent should make an initial public response to the Requester","next_reply_time":"The time within which an Agent should make the next briefing update to the Requester","requester_wait_time":"The time within which we should solve this ticket","agent_work_time":"The time within which we should solve this ticket"},
    tzMap: {"International Date Line West":"Pacific/Midway","Midway Island":"Pacific/Midway","American Samoa":"Pacific/Pago_Pago","Hawaii":"Pacific/Honolulu","Alaska":"America/Juneau","Pacific Time (US & Canada)":"America/Los_Angeles","Tijuana":"America/Tijuana","Mountain Time (US & Canada)":"America/Denver","Arizona":"America/Phoenix","Chihuahua":"America/Chihuahua","Mazatlan":"America/Mazatlan","Central Time (US & Canada)":"America/Chicago","Saskatchewan":"America/Regina","Guadalajara":"America/Mexico_City","Mexico City":"America/Mexico_City","Monterrey":"America/Monterrey","Central America":"America/Guatemala","Eastern Time (US & Canada)":"America/New_York","Indiana (East)":"America/Indiana/Indianapolis","Bogota":"America/Bogota","Lima":"America/Lima","Quito":"America/Lima","Atlantic Time (Canada)":"America/Halifax","Caracas":"America/Caracas","La Paz":"America/La_Paz","Santiago":"America/Santiago","Newfoundland":"America/St_Johns","Brasilia":"America/Sao_Paulo","Buenos Aires":"America/Argentina/Buenos_Aires","Montevideo":"America/Montevideo","Georgetown":"America/Guyana","Greenland":"America/Godthab","Mid-Atlantic":"Atlantic/South_Georgia","Azores":"Atlantic/Azores","Cape Verde Is.":"Atlantic/Cape_Verde","Dublin":"Europe/Dublin","Edinburgh":"Europe/London","Lisbon":"Europe/Lisbon","London":"Europe/London","Casablanca":"Africa/Casablanca","Monrovia":"Africa/Monrovia","UTC":"Etc/UTC","Belgrade":"Europe/Belgrade","Bratislava":"Europe/Bratislava","Budapest":"Europe/Budapest","Ljubljana":"Europe/Ljubljana","Prague":"Europe/Prague","Sarajevo":"Europe/Sarajevo","Skopje":"Europe/Skopje","Warsaw":"Europe/Warsaw","Zagreb":"Europe/Zagreb","Brussels":"Europe/Brussels","Copenhagen":"Europe/Copenhagen","Madrid":"Europe/Madrid","Paris":"Europe/Paris","Amsterdam":"Europe/Amsterdam","Berlin":"Europe/Berlin","Bern":"Europe/Berlin","Rome":"Europe/Rome","Stockholm":"Europe/Stockholm","Vienna":"Europe/Vienna","West Central Africa":"Africa/Algiers","Bucharest":"Europe/Bucharest","Cairo":"Africa/Cairo","Helsinki":"Europe/Helsinki","Kyiv":"Europe/Kiev","Riga":"Europe/Riga","Sofia":"Europe/Sofia","Tallinn":"Europe/Tallinn","Vilnius":"Europe/Vilnius","Athens":"Europe/Athens","Istanbul":"Europe/Istanbul","Minsk":"Europe/Minsk","Jerusalem":"Asia/Jerusalem","Harare":"Africa/Harare","Pretoria":"Africa/Johannesburg","Kaliningrad":"Europe/Kaliningrad","Moscow":"Europe/Moscow","St. Petersburg":"Europe/Moscow","Volgograd":"Europe/Volgograd","Samara":"Europe/Samara","Kuwait":"Asia/Kuwait","Riyadh":"Asia/Riyadh","Nairobi":"Africa/Nairobi","Baghdad":"Asia/Baghdad","Tehran":"Asia/Tehran","Abu Dhabi":"Asia/Muscat","Muscat":"Asia/Muscat","Baku":"Asia/Baku","Tbilisi":"Asia/Tbilisi","Yerevan":"Asia/Yerevan","Kabul":"Asia/Kabul","Ekaterinburg":"Asia/Yekaterinburg","Islamabad":"Asia/Karachi","Karachi":"Asia/Karachi","Tashkent":"Asia/Tashkent","Chennai":"Asia/Kolkata","Kolkata":"Asia/Kolkata","Mumbai":"Asia/Kolkata","New Delhi":"Asia/Kolkata","Kathmandu":"Asia/Kathmandu","Astana":"Asia/Dhaka","Dhaka":"Asia/Dhaka","Sri Jayawardenepura":"Asia/Colombo","Almaty":"Asia/Almaty","Novosibirsk":"Asia/Novosibirsk","Rangoon":"Asia/Rangoon","Bangkok":"Asia/Bangkok","Hanoi":"Asia/Bangkok","Jakarta":"Asia/Jakarta","Krasnoyarsk":"Asia/Krasnoyarsk","Beijing":"Asia/Shanghai","Chongqing":"Asia/Chongqing","Hong Kong":"Asia/Hong_Kong","Urumqi":"Asia/Urumqi","Kuala Lumpur":"Asia/Kuala_Lumpur","Singapore":"Asia/Singapore","Taipei":"Asia/Taipei","Perth":"Australia/Perth","Irkutsk":"Asia/Irkutsk","Ulaanbaatar":"Asia/Ulaanbaatar","Seoul":"Asia/Seoul","Osaka":"Asia/Tokyo","Sapporo":"Asia/Tokyo","Tokyo":"Asia/Tokyo","Yakutsk":"Asia/Yakutsk","Darwin":"Australia/Darwin","Adelaide":"Australia/Adelaide","Canberra":"Australia/Melbourne","Melbourne":"Australia/Melbourne","Sydney":"Australia/Sydney","Brisbane":"Australia/Brisbane","Hobart":"Australia/Hobart","Vladivostok":"Asia/Vladivostok","Guam":"Pacific/Guam","Port Moresby":"Pacific/Port_Moresby","Magadan":"Asia/Magadan","Srednekolymsk":"Asia/Srednekolymsk","Solomon Is.":"Pacific/Guadalcanal","New Caledonia":"Pacific/Noumea","Fiji":"Pacific/Fiji","Kamchatka":"Asia/Kamchatka","Marshall Is.":"Pacific/Majuro","Auckland":"Pacific/Auckland","Wellington":"Pacific/Auckland","Nuku'alofa":"Pacific/Tongatapu","Tokelau Is.":"Pacific/Fakaofo","Chatham Is.":"Pacific/Chatham","Samoa":"Pacific/Apia"},
  
    /************************ REQUEST DEFINITIONS START *************************/
    /**======== Dashboard Requests START =======**/  
    requests: {

      requestSLAPolicies : function() {
        //console.log("Remote Check for SLA Policies...");
        return {
          url : "/api/v2/slas/policies.json",
          type : 'GET',
          dataType : 'json',
          cors: true
        };
      },

      requestSLAData : function(url) {
        return {
          url : url,
          type : 'GET',
          dataType : 'json',
          cors: true
        };
      },
      
      requestTicketData : function(url) {
        return {
          url : url,
          type : 'GET',
          dataType : 'json',
        };
      },
      
      requestTicketComments : function(url) {
        return {
          url : url,
          type : 'GET',
          dataType : 'json',
        };
      },  
      
      requestSegIdentify : function(data) {
        return {
          url : this.settings.segapiurl+"identify",
          type : 'POST',
          data : JSON.stringify(data),
          contentType: 'application/json',
          cors:true,
          headers: {
            'Authorization': 'Basic ' + Base64.encode(this.settings.segwritekey)
          }
        };
      },

      requestSegTrack : function(data) {
        return {
          url : this.settings.segapiurl+"track",
          type : 'POST',
          data : JSON.stringify(data),
          contentType: 'application/json',
          cors:true,
          headers: {
            'Authorization': 'Basic ' + Base64.encode(this.settings.segwritekey)
          }
        };
      },
            
      requestAppUpdate : function(url, appSettings) {
        return {
          url : url,
          type : 'PUT',
          data : JSON.stringify(appSettings),
          contentType: 'application/json',
          cors:true
        };
      },
      
      /**======== Dashboard Requests END =======**/

      /**======== SLA Assistant Requests START =======**/
      getUserDetails: function() {
        return {
          url: '/api/v2/users/me.json',
          type: 'GET',
          dataType: 'json'
        };        
      },
      getTicket : function(id) {
        return {
          url: '/api/v2/tickets/'+id+'.json?include=slas',
          type: 'GET',
          dataType: 'json'
        };
      },
      getSlaPolicies: function() {
        return {
          url: '/api/v2/slas/policies.json',
          type: 'GET',
          dataType: 'json'
        };
      },
      getAudit : function(url) {
        return {
          url: url,
          type: 'GET',
          dataType: 'json'
        };
      }
      /**======== SLA Assistant Requests END =======**/
      
    },
    
    /*********************** REQUEST DEFINITIONS END **************************/

    /*********************** EVENT DEFINITIONS START **************************/
    events: {
      
      /**======= Tab Events START =========**/ 
      'click .cs_zd_sla .tab' : 'tabSwitch',
      
      /**======= Dashboard Events START =========**/     
      'app.activated': 'initialize',
      'pane.activated' : 'paneActivated',
      'pane.deactivated' : 'paneDeactivated',
      'app.willDestroy': 'cleanUp',

      'requestSLAPolicies.done':     'requestSLAPoliciesSuccess',
      'requestSLAScehdules.fail':     'requestSLAPoliciesError',

      'requestSLAData.done':     'requestSLADataSuccess',
      'requestSLAData.fail':     'requestSLADataError',
      
      'requestTicketData.done':     'requestTicketDataSuccess',
      'requestTicketData.fail':     'requestTicketDataError',
      
      'requestSegIdentify.done':     'requestSegIdentifySuccess',
      'requestSegIdentify.fail':     'requestSegIdentifyError',
      
      'requestSegTrack.done':     'requestSegTrackSuccess',
      'requestSegTrack.fail':     'requestSegTrackError',   
      
      'requestAppUpdate.done':     'requestAppUpdateSuccess',
      'requestAppUpdate.fail':     'requestAppUpdateError',  
      
      'click .panel.left .pin_control' : 'pinControl',
      'click .panel.left .refresh' : "manualRefresh",

      'click .facets_section .facet' : "selectFacet", 
      
      'click .expansionbutton.fewer' : "contractFacet", 
      'click .expansionbutton.more' : "expandFacet",  
      
      'click .panel_expander' : 'expandOrContractPanel',
      
      'mouseenter .title a' : 'enterEntryDesc',
      'mouseleave .title a' : 'leaveEntryDesc',
      'click .ticket_summary' : 'leaveEntryDesc',
      
      'click .title a' : 'ticketHrefHandler',
      
      'window.resize': "winResize",        
      /**======= Dashboard Events END =========**/  
      
      /**======= Dashboard Config Events START =========**/ 
      'click #cs_configuration button.save' : 'saveConfig',
      /**======= Dashboard Config Events  =========**/
      
      /**======= SLA Assistant Events START =========**/   
        'getTicket.done': 'updateSLA',
        'ticket.form.id.changed': 'formChanged',
        'ticket.updated': 'handleUpdate'
      /**======= SLA Assistant Events END =========**/             

    },
    /*********************** EVENT DEFINITIONS END **************************/
    
    inNavbar: function() {
      return this.currentLocation() === 'nav_bar';
    },
    
    
    /*********************** GENERAL UI EVENT HANDLERS START **************************/
    winResize : function() {
      if (this.inNavbar()) {
        this.dashboardWinResize();
      }
    },
    /*********************** GENERAL UI EVENT HANDLERS END **************************/
    
    
    /************************ APP EVENTS START ******************************/   
    initialize: function(data) {
      if (this.inNavbar()) { 
        // Initialise the dashboard and dashboard configuration tabs
        this.initializeDashboard(data);
        this.$(".cs_zd_sla .dashheader").removeClass("hide");
      } else {
        // Initialise the SLA Assistant
        this.$(".cs_zd_sla .dashheader").addClass("hide");
        if (data.firstLoad) { 
          this.data = data;
          this.ajax('getUserDetails').done(function(data){
            moment.locale(this.currentUser().locale());
            moment.tz.setDefault(this.lookupCorrectTZName(data.user.time_zone));
          });
        }
        this.ajax('getTicket', this.ticket().id());
      }
    },    
            
    paneActivated : function() {
      if (this.inNavbar()) {        
        this.configureHeader(); // Ensure the header bar shows tabs for administrators or just the app name for agents
        this.checkBuildConfigTab(); // Set up the contents of the dashboard configuration tab for administrators - once only
        if (this.settings.applied==="false") {
          // Announce the lack of configuration on the dashboard tab for other agents to see
          this.switchTo("notconfigured");
          var $configTab = this.$("#cs_configuration_tab");
          // and now switch to the configuration tab
          this.switchToTab($configTab);
        } else {
          // A normal pane reactivation (ie configuration has already occurred)
          this.dashboardPaneActivated();
          if (!this.segTrackUsage.started()) {
            this.segTrackUsage.start();
          }
          this.checkSLAPolicies(false);
        }        
      } 
    },
    
    paneDeactivated : function() {
      if (this.inNavbar()) {
        if (this.settings.applied==="true") {
          this.stopDashboardRefresh();
          if (this.segTrackUsage.started()) {
            this.segTrackUsage.calcUsageMetrics();
            this.ajax("requestSegTrack", this.segTrackUsage);
            this.segTrackUsage.clearUsageMetrics();
          }
        }
      }
    },
    
    checkSLAPolicies : function(forceCheck) {
      if (forceCheck) {
        this.ajax("requestSLAPolicies");
      } else {
        // Check local storage for evidence of previous successful sla policies check           
        var cs_has_sla_policies = this.store("cs_has_sla_policies");
        if (cs_has_sla_policies) {
          //console.log("Cached sla policies = true");
          this.hasSLAPolicies = true; // prevent any further checks for SLA policies whilst on dashboard tab
        } else {
          //console.log("Cached sla policies = false");
        }
        if (this.hasSLAPolicies) {
          if (this.segTrackUsage) {
            this.segTrackUsage.recordHasSLAPolicies(true);
          }
        } else {
          // Either no record in cache or last check recorded false
          // So check again whether SLA Policies are in force yet
          // The success handler will update this.segTrackUsage accordingly
          this.ajax("requestSLAPolicies");
        }
      }
    },
        
    cleanUp: function() {
      if (this.inNavbar()) {
        this.stopDashboardRefresh();
      }
    },    
    /************* APP EVENTS END *********************/

    
    /************* REQUEST CALLBACKS START *********************/
   
    /**======= Dashboard Request Callbacks START =========**/

    // Dashboard data from Zendesk view
    requestSLAPoliciesSuccess : function(data) {
      // record, in Segment, the most recent number of results returned in the view
      var policies = data.sla_policies;
      this.hasSLAPolicies = null;
      if (!policies || policies.length===0) {
        this.hasSLAPolicies=false;
        this.$("#no_slas").show();
        this.store("cs_has_sla_policies",false);
      } else {
        this.hasSLAPolicies=true;
        this.$("#no_slas").hide();
        // record in local storage to prevent further checks
        this.store("cs_has_sla_policies",true);
      }
      if (this.$("#cs_configuration_tab").hasClass("active")) {
        // Configuration tab active so do a services notify popup too
        services.notify('No SLA Policies detected', 'alert');
      }
      // Update the hasSLAPolicies property in the Usage Tracking Event based on the result of the latest query
      if (this.segTrackUsage) {
        this.segTrackUsage.recordHasSLAPolicies(this.hasSLAPolicies);
      }
    },

    requestSLAPoliciesError : function(jqxhr, settings, error) {
      var status = jqxhr.status;
      var respJSON = jqxhr.responseJSON;
      var rje = "";
      if (respJSON && respJSON.error) {
        rje = "," + respJSON.error;
      }
      services.notify("Failed to retrieve SLA Policy data : " + status + rje, "error", 5000);
      this.countdown=REFRESH_FAILURE_RESTART;
    },


    // Dashboard data from Zendesk view 
    requestSLADataSuccess : function(data) {
      // record, in Segment, the most recent number of results returned in the view       
      var ticketCount = 0;
      if (data.rows) {
        ticketCount = data.rows.length; 
      }
      this.segTrackUsage.recordTicketCount(ticketCount);
      // Record the view in the cache
      this.cacheViewData(data);
      // And render the dashboard
      this.slaDataLoaded(data);
      this.countdown=REFRESH_RATE;
    },
    
    requestSLADataError : function(jqxhr, settings, error) {
      this.showDashboardSpinnys(false);
      var status = jqxhr.status;
      var respJSON = jqxhr.responseJSON;
      var rje = "";
      if (respJSON && respJSON.error) {
        rje = "," + respJSON.error;
      }
      services.notify("Failed to retrieve dashboard data : " + status + rje, "error", 5000);
      this.countdown=REFRESH_FAILURE_RESTART;
    }, 
    
    cacheViewData : function(data) {
      // Store the latest view data in the cache
      var jvstr = JSON.stringify(data);
      this.store("cs_sla_jvstr",jvstr);
      // And record when this was done
      var now = new Date();
      var epoch = now.getTime();
      this.store("cs_sla_jvtime",epoch);
    },
    
    // Render the dashboard view - the supplied data has either come from the cache or is a new view evaluation
    slaDataLoaded : function(data) {
      // record, in Segment, the last number of results returned from a view, either recently or from the cache       
      var ticketCount = 0;
      if (data.rows) {
        ticketCount = data.rows.length; 
      }
      this.segTrackUsage.recordTicketCount(ticketCount);      
      this.model = data;
      this.renderFacetView();
    },
    
    // Supplementary Ticket Data for hover functionality
    requestTicketDataSuccess : function(data) {
      if (this.ticketSummaryInfo && this.popupRequested) {
        this.popupRequested = false;
        this.ticketSummaryInfo.ticket = data.ticket;
        this.ticketSummaryInfo.status = data.ticket.status.toLowerCase();
        this.ticketSummaryInfo.displaystatus = data.ticket.status;   
        this.showTicketSummaryInfoPopup("ticketsummary");
      }
    },
    
    requestTicketDataError : function(jqxhr, settings, error) {
      this.popupRequested = false;
      var status = jqxhr.status;
      services.notify("Failed to retrieve ticket details " + status, 5000);
    },
    
    requestSegIdentifySuccess : function(data) {
    },
    
    requestSegIdentifyError : function(jqxhr, settings, error) {
    },
    
    requestSegTrackSuccess : function(data) {
    },
    
    requestSegTrackError : function(jqxhr, settings, error) {
    },
    
    
    /**======= Dashboard Request Callbacks END =========**/  
    
    /************* REQUEST CALLBACKS END *********************/
    
    
    /**======= Dashboard Activation START  =========**/  
    /**
     * Called when the app is first activated to set up the dashboard
     * On first installation this.settings.applied is FALSE. 
     * Under these circumstances the dashboard is initially disabled awaiting the first configuration by an administrator.
     * Thus only a minimal set of structures are initialised.
     * After the configuration is saved, this.settings.applied becomes TRUE and a subsequent refresh of the page
     * will mean initializeDashboard sets i[ 
     *  
     * Sets up this.refreshUrl to obtain the SLA View model data from CloudSET via Ajax Makes an initial call to get the
     * model data using this url Subsequent refreshes are taken care of by the paneActivated method
     */
    initializeDashboard: function(data) {
      this.configTabBuilt = false;  // to track building of configtab contents once only
      this.hasSLAPolicies = false;  // to track if Zendesk SLA policies are defined

      this.domain = this.currentAccount().subdomain() + ".zendesk.com";
      this.userRole = this.currentUser().role();
      this.agentName = this.currentUser().name();
      // segment tracking
      this.segTrackUsage = new TrackUsageSegment(this.domain, this.currentUser().id(), this.agentName, this.currentUser().email(), this.userRole, this.settings.app_version);
      // Only set up dashboard constructs if the initial configuration has taken place
      if (this.settings.applied==="true") {
        // top level app properties
        this.pageProps = null; //
        this.lastPage = null;
        this.columns = null;
        this.facetTypes = null;
        this.facetTypes=null;
        this.facetExpansionSize = 0;
        this.eventWeightings = null; 
        this.facetPreselection = null;
        this.countdown = REFRESH_RATE;
        this.model = {};
        this.ticketSummaryInfo = null;
        this.AutoRefresh = true;
        this.popupRequested = false;

        var that = this;
        //this.t = setTimeout(function(){that.runTimer(that, this);}, 1);

        // Create an object to hold the page properties
        // viewMode
        // viewName
        this.pageProps = new PageProperties();

        // Create an object to hold the last page data
        // pageProps
        // colEntries
        this.lastPage = null;       

        // Establish the view type
        this.pageProps.setViewMode("tickets_mode");
        var defaultViewMode = this.settings.defaultViewMode; 

        //this.columns = JSON.parse('[{"name":"What Next","period":{"start":24,"label":"Next 4 days","end":96}},{"name":"Next","period":{"start":0,"label":"Today","end":24}},{"name":"Late","period":{"start":-2400,"label":"Last 100 days","end":0}}]');
        this.columns = JSON.parse(this.settings.columns);

        //this.facetTypes =  JSON.parse('["Agents","Organizations","Groups","Priority"]');
        this.facetTypes =  JSON.parse(this.settings.facets);

        this.facetExpansionSize = 5;

        this.facets = new Facets(this.facetTypes, this);

        if (this.settings.CurrentAgentFilter && (this.userRole==="agent")) {
          this.facetPreselection="facet:assignee_name:"+this.agentName;
        }

        this.viewsUrl = "/api/v2/views.json";
        this.refreshUrl = null;
        
        // Get a handle to the view established by the requirements api
        var requirementsView = this.requirement("coherence_sla_dashboard_view");
        this.refreshUrl = "/api/v2/views/" + requirementsView.requirement_id + "/execute.json?page=1&per_page=" + PER_PAGE;
      }
    },
        
    configureHeader : function() {
      if (this.userRole==="admin") {
        this.$(".cs_zd_sla #sla3title").hide();
        this.$(".cs_zd_sla .btn.tab").show();
      } else {
        this.$(".cs_zd_sla #sla3title").show();
        this.$(".cs_zd_sla .btn.tab").hide();
      }
      var restrictedFeatures = this.I18n.t('dash.restrictedfeatures');
      var safeStr = helpers.safeString(restrictedFeatures);
      var $span = this.$(".cs_zd_sla span.restricted");
      $span.html(safeStr.string);
    },
       
    
    checkBuildConfigTab : function() {
      if (this.userRole==="admin" && !this.configTabBuilt) {
        this.buildConfigurationTab();
        if (this.settings.applied==="false") {
          this.$("#cs_configuration label.firstconfig").show();
        }
        this.configTabBuilt=true;
      }
    },
     
    
    dashboardPaneActivated : function() {
      var that = this;
      _.defer(function() {
          // Initiate building of dashboard either from the cache or a fresh view evaluation
          that.runDashboard();
          // Start the countdown timer
          if (that.AutoRefresh) {
            that.startDashboardRefresh();
          }  
      });
    },
   
    // Initiate building of dashboard either from the cache or a fresh view evaluation
    runDashboard : function() {
      if (this.settings.applied==="true") {
        if (this.refreshUrl) {
          // will be using Requirements API - so already have view
          this.buildDashboard();
        }
      }
    },
    
    /** 
     * Uses local storage to see if the more than 5 minutes has elapsed since the last full refresh using a view evaluation
     * If it has performs another view evaluation and builds the dashboard from this, updating the timestamp, and cached view afterwards in local storage
     * If not builds the view again from the last cached view in local storage
     */
    buildDashboard : function() {
      var cachedData = null;
      var cs_sla_jvtime = this.store("cs_sla_jvtime");
      if (cs_sla_jvtime) {
        var now = new Date();
        var epoch = now.getTime();
        if ((epoch-cs_sla_jvtime) < REFRESH_RATE * 1000) {
          var cs_sla_jvstr = this.store("cs_sla_jvstr");
          cachedData = JSON.parse(cs_sla_jvstr);
          var cs_sla_countdown = this.store("cs_sla_countdown");
          if (cs_sla_countdown) {
            this.countdown = cs_sla_countdown;
          }
        }        
      }
      if (cachedData) {
        // Render the dashboard from the cached view data
        this.slaDataLoaded(cachedData);
      } else {      
        if (this.refreshUrl) {
          this.showDashboardSpinnys(true);
          // Make a call to get a fresh view - happend at most once every 5 mins
          this.ajax('requestSLAData',this.refreshUrl);
        }
      }
    },
    
    buildConfigurationTab : function() {
      this.config = JSON.parse(this.settings.config);
      this.embelishConfigForHandlerbars(this.config);
      var model = {};
      model.columns = this.config.columns;
      model.facets = this.config.facets;
      var configTabHTML = this.renderTemplate("config", model);
      this.$("section.admin").html(configTabHTML);
    },
    
    embelishConfigForHandlerbars : function(config) {
      for (var i=0; i<config.columns.length; i++) {
        var col = config.columns[i];
        if (i<2) {
          col.fromto="From :";
        } else {
          col.fromto="Up to :";
        }
        col.select_hours = "";
        col.select_days = "";
        col.select_weeks = "";      
        if (col.units==="hours") {
          col.select_hours = "selected";
        } else if (col.units==="days") {
          col.select_days = "selected";
        } else if (col.units==="weeks") {
          col.select_weeks = "selected";
        }
      }
      var facets = config.facets;
      facets.select_priority=facets.Priority?"checked=checked":"";
      facets.select_agents=facets.Agents?"checked=checked":"";
      facets.select_orgs=facets.Organizations?"checked=checked":"";
      facets.select_groups=facets.Groups?"checked=checked":"";
    },


    /**======= Dashboard Activation END  =========**/  
    
    /**================= Dashboard entry hover methods START ========================**/
    
    enterEntryDesc : function(ev) {
      var that = this;
      this.ticketDetailsId = setTimeout(function(){
        that.popupRequested=true;
        that.showTicketSummary(ev);
      }, 500);
    },
    
    leaveEntryDesc : function() {
      this.popupRequested=false;
      clearTimeout(this.ticketDetailsId);
      this.removeTicketSummary();
    },
    
    ticketHrefHandler : function(ev) {
      this.popupRequested=false;
      this.segTrackUsage.recordNav();
      return true;
    },
       
    showTicketSummary : function(ev) {
      this.removeTicketSummary();
      this.ticketSummaryInfo = {};
      this.ticketSummaryInfo.showlatestcomment="hidden";
      this.ticketSummaryInfo.ev = ev;
      this.ticketSummaryInfo.$anchor= this.$(ev.currentTarget);
      var href = this.ticketSummaryInfo.$anchor.attr("href");
      this.ticketSummaryInfo.href = href;
      this.ajax('requestTicketData',"/api/v2/"+href+".json");
    },
    
    removeTicketSummary : function() {
      if (this.ticketSummaryInfo && this.ticketSummaryInfo.$html) {
        this.removeTicketSummaryPopup(this.ticketSummaryInfo.$html);
        this.ticketSummaryInfo = null;
      }
    },
    
    removeTicketSummaryPopup : function($elem) {
      $elem.remove();
    },

    /** Called when the request to get the ticket details returns successfully 
     *  The data returned is used to populate the ticket summary popup
     */
    
    showTicketSummaryInfoPopup : function(templateName) {
      if (this.ticketSummaryInfo) {
        var that = this;
        // Make a further call to get the latest comment
        this.ajax('requestTicketComments',"/api/v2/"+this.ticketSummaryInfo.href+"/comments.json?include=users")
        .done(function(data) {
          var comments = data.comments;
          if (comments && comments.length>1) {
            this.ticketSummaryInfo.showlatestcomment="";
            var lastComment = comments[comments.length-1];
            var comment = {};
            this.ticketSummaryInfo.latestcomment = comment;
            comment.created_at = lastComment.created_at;
            var createdAtDisplay = new Date(lastComment.created_at).toLocaleString();
            comment.created_at_display = createdAtDisplay;
            comment.author_name = "<unknown>";
            comment.body = lastComment.body;
            var users = data.users;
            if (users) {
              for (var i=0; i<users.length; i++) {
                var user = users[i];
                if (user.id===lastComment.author_id) {
                  comment.author_name = user.name;
                  break;
                }                  
              }
            }
          }  
          this.renderTicketSummaryInfo(templateName);
        })
        .fail(function(data) {
          this.renderTicketSummaryInfo(templateName);
        });
      }
    },
    
    
    renderTicketSummaryInfo : function(templateName) {
      var $entryBox = this.ticketSummaryInfo.$anchor.parents(".entry_box");
      var entryBoxPosition = $entryBox.position(); // relative to panel right      
      if (entryBoxPosition.left > 0 && entryBoxPosition.top > 0) {
        var $entryBoxOffsetParent = $entryBox.offsetParent();
        var $col = $entryBox.parents(".entries_column");
        var colpos = "middle";
        if ($col[0]) {
          colpos = this.$($col[0]).attr("colpos");
        }
        // Clip description to 250 chars like Zendesk view hover
        var ticket = this.ticketSummaryInfo.ticket;
        ticket.description = ticket.description.clipTo(MAX_HOVER_DESCRIPTION_LENGTH);
        var html = this.renderTemplate(templateName,this.ticketSummaryInfo);
        this.ticketSummaryInfo.$html = this.$(html);
        $entryBoxOffsetParent.append(this.ticketSummaryInfo.$html);
        var ev = this.ticketSummaryInfo.ev;
        var viewportHeight = ev.view.innerHeight;
        var mouseY = ev.pageY;
        if (mouseY > (viewportHeight/2)+100) {
          this.ticketSummaryInfo.$html.css("top",entryBoxPosition.top-this.ticketSummaryInfo.$html.height());    
        } else {
          this.ticketSummaryInfo.$html.css("top",entryBoxPosition.top+$entryBox.height());        
        }
        var leftOffset = 0;
        if (colpos==="right") {
          leftOffset = (this.ticketSummaryInfo.$html.width()-$entryBox.width())*-1; 
        }
        this.ticketSummaryInfo.$html.css("left",entryBoxPosition.left+leftOffset);
        this.ticketSummaryInfo.$html.show();      
      } else {
        // if entryBoxPosition is 0,0 we have navigated away from the dashboard and want to cancel the display
        this.removeTicketSummary();
      }
    },
    
    
    /**================= Dashboard entry hover methods END ========================**/  
    
    /**================= Dashboard Feedback START ======================**/
    showDashboardSpinner: function(show) {
      if (show) {
        this.$('.main').addClass('loading');
        this.$('.loading_spinner').show();
      } else {
        this.$('.main').removeClass('loading');
        this.$('.loading_spinner').hide();
      }
    },
    
    showDashboardViewSpinny: function(show) {
      if (show) {
        this.$('.icon-loading-spinner').css("display","inline-block");
      } else {
        this.$('.icon-loading-spinner').css("display","none");
      }
    },    
    
    showDashboardSpinnys : function(show) {
      this.showDashboardSpinner(show);
      this.showDashboardViewSpinny(show);
    },
    /**================= Dashboard Feedback START ======================**/
    
    /**================= Dashboard Page Refresh START ======================**/
    
    /**
     * Starts a regular page refresh, by making a new Ajax call for the latest model data at an interval of 1 minute The REFRESH_RATE var above controls the
     * interval.
     */
    startDashboardRefresh : function() {
      var that = this;
      this.refreshFunc = setInterval(function() {
        if (that.countdown > 0) {
          var countdownStr = that.toMinsSecs(that.countdown);
          var refreshIn = that.I18n.t("dash.refreshin",{"timeleft":countdownStr});
          that.$(".countdown").html(refreshIn);
          that.countdown--;
          that.store("cs_sla_countdown",that.countdown);
          if (that.countdown===0) {
            that.dashboardRefresh();
          }
        }
      },1000);
    },
    
    toMinsSecs : function(countdown) {
      var result = "";
      var mins = null;
      var secs = null;
      if (countdown > 60) {
        result = Math.floor(countdown/60)+"m "+(countdown % 60)+"s";
      } else {
        result = countdown + "s";
      }
      return result;
    },
    
    dashboardRefresh : function() {
      this.showDashboardViewSpinny(true);
      this.ajax('requestSLAData',this.refreshUrl);
    },
    
    /**
     * Stops the regular page refresh and associated Ajax queries Called when the app pane is deactivated
     */
    stopDashboardRefresh : function() {
      if (this.refreshFunc) {
        clearInterval(this.refreshFunc);
      }
    },
    
    /**================= Dashboard Page Refresh START ======================**/
    
    /**================= Dashboard Model and Display Processing START ======================**/
  
    calcColumnHeights : function() {
      var $board = this.$(".board");
      ENTRIES_COL_HEIGHT = (($board.height()*100)/95)-82;
      var $entriesContainer = this.$(".entries_container");
      var containerHeight = $entriesContainer.height();
      // Calculate single and split column heights
      var colHeight = ENTRIES_COL_HEIGHT - COL_HEADER_HEIGHT;
      MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN = Math.floor(colHeight/ENTRY_HEIGHT);
      // Must have enough space for at least 3 entries in a column
      MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN = Math.max(MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN,3);
      SINGLE_COLUMN_HEIGHT =(MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN * ENTRY_HEIGHT) + COLUMN_PADDING;
      SPLIT_COLUMN_HEIGHT = (SINGLE_COLUMN_HEIGHT - SEPARATOR_HEIGHT) / 2;
      ENTRIES_COL_HEIGHT = SINGLE_COLUMN_HEIGHT + COL_HEADER_HEIGHT; 
      // Now set the height of the three entries container to be SINGLE_COLUMN_HEIGHT
      this.setColumnHeights();
    },
    
    setColumnHeights : function() {
      for (var i=1; i<=3; i++) {
        var $entriesCol = this.$(".entries_column.col"+i);
        $entriesCol.height(ENTRIES_COL_HEIGHT);
      }
    },    
       
    renderFacetView : function() {
      var $container = this.$(".panel.left");
      this.lastScrollTop = $container.scrollTop();       
      this.model.filteredTickets = [];
      this.model.filteredEvents = [];
      var viewMode = this.pageProps.viewMode;
      // new model so apply any facet filters to create a filtered set of tickets and events
      this.applyFilters(viewMode); // created filtered tickets/events
      var colModel = this.allocateToColumns();
      // Now we need to recalculate the facet counts based on all the entries that have been allocated into columns
      this.recalcFacetCounts(colModel.allentries);
      // Set up the count against the "faux" facet for tickets mode to be the number of tickets 
      this.facets.setFacetCount("nextevents","all",colModel.alltickets.length);
      // Check if we have a facet preselection based on role
      // This will only ever be applied once at the start
      if (this.facetPreselection) {
        var facet = this.facets.getFacetById(this.facetPreselection);
        if (facet) {
          // Note because this toggle attempt only happens once at initialization
          // the toggle will always be an attempt to switch on the preSelction filter (not off)
          if (this.facets.toggleFacetSelection(facet.type,facet.value)) {
            // If toggleFacetSelection returns true then the previous set of facets included
            // the facetPreselection value. 
            // So only then do we need to refilter and alloacte again based on the additional new filter 
            this.model.filteredTickets = [];
            this.model.filteredEvents = [];
            this.applyFilters(viewMode); // created filtered tickets/events
            colModel = this.allocateToColumns();
            this.recalcFacetCounts(colModel.allentries);
            this.facets.setFacetCount("nextevents","all",colModel.alltickets.length);
          }
        }
        this.facetPreselection=null; // and nullify to prevent reoccurrence
      }
      // Now we can render the view with the facet counts in the left pane and the entries in the right pane
      this.renderView(colModel);
      this.applyFacetPanelState();
      this.selectCurrentViewItem(this.pageProps.viewMode);
      this.restoreScrollPosition();
      this.showDashboardSpinnys(false);
    },
    
    
    applyFacetPanelState : function() {
      // All the facet panels are initially expanded so collapse those 
      for (var id in this.facets.panels) {
        if (this.facets.panels[id]) {
          // need to collapse this panel
          var contentPanelId = "panel_"+id;
          var $panelContent = this.$("#"+contentPanelId);
          var $i = this.$("i#"+id);
          this.showPanelContent($panelContent,$i,false);          
        }
      }
    },
    
 
    applyFilters : function(viewMode) {
      var rows = this.model.rows;        
      this.model.filteredTickets.length=0;
      this.model.filteredEvents.length=0;
      var hidePending = true;
      var hideOnHold = true;
      var nameMaps = {};
      nameMaps.groups = this.parseSideloads(this.model.groups);
      nameMaps.orgs = this.parseSideloads(this.model.organizations);
      nameMaps.users = this.parseSideloads(this.model.users);      
      for (var j=0; j<rows.length; j++) {
        var row = rows[j];
        if (row.sla_next_breach_at) { // only consider tickets that have a sla next breach
          var ticket = row.ticket;
          // Filter pending / onhold tickets
          var status= ticket.status;
          if (hidePending && status==="pending") {
            continue;
          }
          if (hideOnHold && status==="hold") {          
            continue;
          }
          // Add in any facet properties before matching
          ticket = this.embelishTicket(ticket,row,nameMaps);
          if (viewMode==="tickets_mode") {
            if (this.facets.matchesFilter(ticket)) {
              this.model.filteredTickets.push(ticket);
            }
          }
        }
      }
    },
    
    parseSideloads : function(sideloads) {
      var map = {};
      if (sideloads) {
        for (var i=0; i<sideloads.length; i++) {
          var sideload = sideloads[i];
          var id = sideload.id;
          var name = sideload.name;
          map[id]=name;
        }
      }
      return map;
    },     
    
    
    embelishTicket : function(ticket, row, nameMaps) {
      ticket.ticketid = ticket.id;
      ticket.url = "tickets/"+ ticket.ticketid;
      ticket.rolledupmeasuredescription = "";
      // Group name
      ticket.grp_name=null;
      var grpId = row.group_id;
      ticket.grp_id = grpId;
      if (grpId!=null) {
        ticket.grp_name = nameMaps.groups[grpId];
      }
      if (ticket.grp_name==null || ticket.grp_name==="") {
        ticket.grp_name="&nbsp;";
      }
            
      // Requester name
      ticket.req_name=null;
      var reqId = row.requester_id;
      ticket.req_id = reqId;
      if (reqId!=null) {
        ticket.req_name = nameMaps.users[reqId];
      }      
      if (ticket.req_name==null || ticket.req_name==="") {
        ticket.req_name="&nbsp;";
      }
      
      // Orgnanization name
      ticket.org_name=null;
      var orgId = row.organization_id;
      ticket.org_id = orgId;
      if (orgId!=null) {
        ticket.org_name = nameMaps.orgs[orgId];
      }        
      if (ticket.org_name==null || ticket.org_name==="") {
        ticket.org_name="&nbsp;";
      }
      
      // Assignee name
      ticket.assignee_name=null;
      var assigneeId = row.assignee_id;
      ticket.assignee_id = assigneeId;
      if (assigneeId!=null) {
        ticket.assignee_name = nameMaps.users[assigneeId];
      }      
      if (ticket.assignee_name==null || ticket.assignee_name==="") {
        ticket.assignee_name="&nbsp;";
      }
      
      if (ticket.priority==null || ticket.priority==="") {
        ticket.priority="&nbsp;";
      }
      if (ticket.custom_status==null || ticket.custom_status==="") {
        ticket.custom_status="&nbsp;";
      }
      ticket = this.calcDesc(ticket);
      ticket.custom_fields=[];
      
      
      var policyMetric = ticket.sla_policy_metric;
      // When there is no next event information
      // create a dummy structure as would have been present using the earlier server code

      ticket.nextEvent = this.createNextEvent(policyMetric);
     
      ticket.eventName = ticket.nextEvent.label;
      if (ticket.eventName==null) {
        ticket.eventName="Unknown";
      }
      return ticket;
    },
    
    createNextEvent : function(policyMetric) {
      var nextEvent = {};
      nextEvent.label = EVENT_LABELS[policyMetric.metric];
      if (nextEvent.label==null) {
        nextEvent.label = "";         
      }
      var breachAt = policyMetric.breach_at;
      nextEvent.bystr = breachAt;
      var breachDate = new Date(breachAt);
      nextEvent.by= breachDate.getTime();
      nextEvent.rolledupmeasure="";
      return nextEvent;     
    },

    
    /** Work out what to display as the ticket identification string
     *  Attempt to use subject first. But if undefined use description
     *  Then if longer than 25 characters - clip it
     *  Set the roam over title to be the full subject or description as appropriate from the earlier logic
     */
    calcDesc : function(ticket) {
      if (ticket.subject && ticket.subject.length>0) {
        ticket.title = ticket.subject;
        ticket.desc = ticket.subject;
      } else if (ticket.description && ticket.description.length>0) {
        ticket.title = ticket.description;
        ticket.desc = ticket.description;
      } else {
        ticket.title = "<un-titled>";
        ticket.desc = "<un-titled>";
      }
      return ticket;
    },
 
    
    recalcFacetCounts : function(entries) {
      this.facets.resetCounts();
      for (var j=0; j<entries.length; j++) {
        this.facets.recordEntry(entries[j]);
      }
      this.facets.orderByCount(this.facetExpansionSize);
    },  

    
    selectCurrentViewItem : function(mode) {
      this.selectedViewItem = this.$("ul.viewlist li[id='"+mode+"']");
      this.selectedViewItem.addClass("selected");
    },
    
    allocateToColumns : function() {
      return this.processTicketData(this.model,this.columns,this.facets);
    },

    renderView: function(colModel) {
      this.removeTicketSummary();
      var model = this.model;
      model.viewtitle = this.pageProps.getViewName();
      var collapsed = this.pageProps.getCollapsed();
      var total_tickets_str = null;
      var total_tickets = colModel.alltickets.length;
      if (total_tickets===1) {
        total_tickets_str = this.I18n.t("dash.ticketcount",{"count":total_tickets});
      } else {
        total_tickets_str = this.I18n.t("dash.ticketscount",{"count":total_tickets});
      }   
      model = _.extend(model, {
        total_tickets_str : total_tickets_str,
        collapsed : collapsed,
        facets : this.facets,   
        filter_desc : this.facets.filterString()
      });
      // If we have last page data - compare trends if page settings have not been changed
      var thisPage = new PageData(this.pageProps, colModel);
      var trends = null;
      if (this.lastPage) {
        trends = thisPage.compare(this.lastPage);
      }
      // Now that we have all the entries organised by column
      // Record the data against the lastPage object for trend analysis next time
      this.lastPage = thisPage;
      this.switchTo('destinationboard', model);
      this.calcColumnHeights();
      this.model = model;
      var columns = colModel.columns;
      for (var i=0; i<columns.length; i++) {
        var column = columns[i];
        if (trends!=null) {
          column.trends = trends[i];
        } else {
          column.trends = new Trend();
        }
        column.num_entries = column.all.length;
        if (column.num_entries===1) {
          column.num_col_entries=this.I18n.t("dash.ticketcount",{"count":column.num_entries});
        } else {
          column.num_col_entries=this.I18n.t("dash.ticketscount",{"count":column.num_entries});
        }
        if (column.num_entries<=MAX_NUMBER_OF_ENTRIES_PER_SINGLE_COLUMN) {
          // single column model
          column.topcolheight = SINGLE_COLUMN_HEIGHT;
          column.separator_display = "none";
          column.bottomcolheight = 0;
          // move all the bottom column entries into the top column
          column.top = column.all;
          column.bottom.length=0;
        } else {
          column.topcolheight = SPLIT_COLUMN_HEIGHT;
          column.separator_display = "block";
          column.bottomcolheight = SPLIT_COLUMN_HEIGHT;
        }
        var html = this.renderTemplate("entriescolumn",column);
        var columnSelector = ".entries_column.col"+(i+1);
        this.$(columnSelector).html(html);
        //var $topCol = this.$(".entries_column.col"+(i+1) + " .col_fragment.top .scroll_entries");
        //var $bottomCol = this.$(".entries_column.col"+(i+1) + " .col_fragment.bottom .scroll_entries");
        //$topCol.height(column.topcolheight);
        //$bottomCol.height(column.bottomcolheight);
        // Move scrollbars to bottom of the bottom fragments
        var bottomScroller = this.$(columnSelector + " .col_fragment.bottom .scroll_entries");
        var divHeight = bottomScroller.height();
        bottomScroller.scrollTop(divHeight*2); 
      }
      this.showDashboardSpinner(false);
    },
       
    setupColumnMetaData : function(columnDefs,colType) {
      var colModel = {};
      colModel.allentries = []; // holds a list of all entries that have been allocated to the columns 
      colModel.alltickets = []; // holds a list of all unique tickets referenced by colModel.allEntries
      colModel.columns = [];
      for (var i=0; i<columnDefs.length; i++) {
        var colDef = columnDefs[i];
        var column = {};
        column.all = [];
        column.top = [];
        column.bottom = [];
        column.columnname = colDef.name;
        column.entry_type = colType;
        column.numentries= "0";
        column.period = colDef.period.label;
        column.start = colDef.period.start;
        column.end = colDef.period.end;
        colModel.columns.push(column);
      }
      return colModel;
    },
    
    processTicketData : function(model, columnDefs, facets) {
      var colModel = this.setupColumnMetaData(columnDefs,"Tickets");
      var tickets = model.filteredTickets;
      var now = new Date().getTime();
      if (tickets) {
        tickets.sort(this.byTimeOfNextEvent);
        for (var j=0; j<tickets.length; j++) {
          var ticket = tickets[j];
          // Calculate remaining time in minutes for display
          var timeOfNextEvent = ticket.nextEvent.by;
          var diff = timeOfNextEvent - now;
          var timeToNextEvent = Math.floor(diff/60000);
          var isLate = timeToNextEvent < 0;
          ticket.nextEventRemainingTime = this.formatMinutes(timeToNextEvent);
          ticket.bystr = ticket.nextEvent.bystr;
          // Add classes to alter entry display based on lateness
          ticket.classes = {};
          ticket.isLate = isLate ? "late" : "";
          ticket.classes.showclock = isLate ? "hidden" : "";
          ticket.classes.showlateclock = isLate ? "" : "hidden";
          ticket.classes.measure = ticket.nextEvent.rolledupmeasure;
          ticket.classes.showorg = (this.facets.active.org_name)==="hidden"?"invisible":"";
          ticket.classes.showreq = "invisible";
          // Remaining ticket level properties
          // The other display properties match existing properties on the ticket
          // orgname
          // description
          // construct and entry id for use with trend analysis based on the ticket id and the event name
          ticket.entryId = ticket.ticketid+":"+ticket.eventName;

          // now construct a late column ticket too if appropriate
          var lateTicket = this.getLateTicket(ticket);
          var lateTicketAllocated = false;
          if (lateTicket!=null) {  
            lateTicketAllocated = this.addToColumn(lateTicket,lateTicket.timeToNextEvent,colModel);
            if (lateTicketAllocated) {
              colModel.allentries.push(lateTicket);
              colModel.alltickets.push(lateTicket);
            }
          }
          // only add the normal ticket if we didn't already allocate a late ticket above
          if (!lateTicketAllocated) {
            if (!isLate || (ticket.nextEvent.rolledupmeasure!=="")) {
              // only add the normal ticket if it is not late 
              // or it is late and the rolledupmeasure is not empty - if rolledupmeasure is nonempty chances
              // are that a lateTicket was allocated above anyway
              var allocated = this.addToColumn(ticket,timeToNextEvent,colModel);
              if (allocated) {
                colModel.allentries.push(ticket);
                colModel.alltickets.push(ticket);
              }
            }
          }
        }
      }
      // resort the final column of tickets now that some lateTickets may have been inserted into it in random time position
      colModel.columns[2].all.sort(this.byTimeToNextEvent);
      this.applyColSplits(colModel);
      return colModel;
    },
    
     getLateEvent : function(ticket) {
      var now = new Date().getTime();
      var event = ticket.nextEvent;
      event.timeOfNextEvent = event.by;
      var diff = event.timeOfNextEvent - now;
      event.timeToNextEvent = Math.floor(diff/60000);
      event.isLate = event.timeToNextEvent < 0;
      return event.isLate ? event : null;
    },
 
    getLateTicket : function(ticket) {
      var lateTicket = null;
      var lateEvents = [];
      // We only have the next event as the basis for constructing a ticket for the late column
      var lateEvent = this.getLateEvent(ticket);
      if (lateEvent) {
        lateTicket = this.shallowCloneTicket(ticket);
        // now update the ticket with the worst event specific properties
        lateTicket.timeToNextEvent = lateEvent.timeToNextEvent;
        lateTicket.nextEventRemainingTime = this.formatMinutes(lateEvent.timeToNextEvent);
        lateTicket.bystr = lateEvent.bystr;
        // Add classes to alter entry display based on lateness of worst event
        lateTicket.isLate = lateEvent.isLate ? "late" : "";
        lateTicket.classes.showclock = lateEvent.isLate ? "hidden" : "";
        lateTicket.classes.showlateclock = lateEvent.isLate ? "" : "hidden";
        lateTicket.classes.measure = "violated"; // if showing in late column always show as violated - red bar
        lateTicket.rolledupmeasuredescription = lateEvent.label + " breached";
        lateTicket.eventName = lateEvent.label;
        lateTicket.entryId = ticket.ticketid+":"+lateTicket.eventName; 
      }
      return lateTicket;
    },

     
    shallowCloneTicket : function(ticket) {
      var result = {};
      result.classes = {};
      result.assignee_name = ticket.assignee_name;
      result.assignee_name = ticket.assignee_name;
      result.created = ticket.created;      
      result.description = ticket.description;
      result.domain = ticket.domain;
      // ignore subevents
      result.id = ticket.id;
      result.lastModified = ticket.lastModified;
      // ignore nextEvent
      result.org_id = ticket.org_id;  
      result.org_name = ticket.org_name;
      result.priority = ticket.priority;
      result.req_id = ticket.req_id;
      result.req_name = ticket.req_name;
      result.grp_id = ticket.grp_id;
      result.grp_name = ticket.grp_name;
      result.status = ticket.status;
      result.ticketid = ticket.ticketid;
      result.url = "tickets/"+ ticket.ticketid;// to allow ticket description to be navigable to from view
      result.title = ticket.title;
      result.desc = ticket.desc;
      result.classes.measure = ticket.classes.measure;
      result.rolledupmeasuredesc=ticket.rolledupmeasuredesc;
      for (var i in ticket) {
        if (i.startsWith("custom_")) {
          result[i] = ticket[i];
        }
      }
      return result;
    }, 
    
     
    addToColumn : function(entry, timeToNextEvent, colModel) {
      var allocated = false;
      var columns = colModel.columns;
      for (var i=0; i<columns.length; i++) {
        var column = columns[i];
        var startMins = column.start*60;
        var endMins = column.end*60;
        if ((timeToNextEvent>=startMins) && (timeToNextEvent<endMins)) {
          column.all.push(entry);
          allocated = true;
          break;
        } 
      }    
      return allocated;
    },
    
    applyColSplits : function(colModel) {
      var columns = colModel.columns;
      for (var i=0; i<columns.length; i++) {
        var column = columns[i];
        var entries = column.all;
        for (var k=0; k<entries.length; k++) {
          var entry = entries[k];
          if (k+1<=entries.length/2) {
            column.top.push(entry);
          } else {
            column.bottom.push(entry);
          }
        }
      }
    },
    
    byTimeOfNextEvent : function(a,b) {
      return a.nextEvent.by - b.nextEvent.by;
    },
    
    byTimeToNextEvent : function(a,b) {
      return a.timeToNextEvent - b.timeToNextEvent;
    },
    
    /**
     * Takes an integer value in minutes and converts it into a string of the form [<d> days] hh:mm
     */
    formatMinutes : function(timeToNextEvent) {
      var ttne = Math.abs(timeToNextEvent); 
      var result = "";
      if (timeToNextEvent == null) {
        return "";
      } 
      var parts = this.getTimeParts(ttne);
      if (parts.days>0) {
        result += parts.days + " day";
        if (parts.days>1) {
          result+="s";
        }
        result += " ";
      }
      if (parts.hours>9) {
        result += "" + parts.hours;
      } else {
        result += "0" + parts.hours;
      }
      result += ":";
      if (parts.minutes>9) {
        result += "" + parts.minutes;
      } else {
        result += "0" + parts.minutes;
      }
      if (timeToNextEvent<0) {
        result = "- " + result;
      }
      return result;      
    },

    /**
     * Given a total time in minutes, return an object with the time split into days hours and minute components
     * 
     */
    getTimeParts : function(timeInMinutes) {
      var result = {};
      var remainingMinutes = timeInMinutes;
      var days = Math.floor(timeInMinutes/1440);
      remainingMinutes = timeInMinutes % 1440;
      var hours = Math.floor(remainingMinutes/60);
      remainingMinutes = remainingMinutes % 60;
      result.days = days;
      result.hours = hours;
      result.minutes = remainingMinutes;
      return result;
    },
    
    /**================= Dashboard Model and Display Processing START ======================**/

    /**================= Dashboard UI Event Handlers START ====================**/   
    
    tabSwitch : function(ev) {
      var $tab = this.$(ev.currentTarget);
      this.switchToTab($tab);
    },

    switchToTab : function($tab) {
      this.$(".tab").removeClass("active");
      $tab.addClass("active");
      var tabContentId = $tab.attr("data-tab-content");
      this.$(".tabbed_content .tabbed").addClass("hide");
      this.$(".tabbed_content #"+tabContentId).removeClass("hide");
      // If we are switching to the Configuration tab force a recheck of SLAPolicies
      var tabId = $tab.attr("id");
      if (tabId==="cs_configuration_tab") {
        this.checkSLAPolicies(true);
      }
    },
    
    expandSidePanel : function() {
      this.$('.panel.left').removeClass('collapsed');
      this.$('.panel.right').removeClass('collapsed');      
      this.pageProps.setCollapsed(false);      
    },
    
    collapseSidePanel : function() {
      this.$('.panel.left').addClass('collapsed');
      this.$('.panel.right').addClass('collapsed');
      this.pageProps.setCollapsed(true);
    },
    
    pinControl : function(ev) {
      if (this.pageProps.getCollapsed()==="collapsed") {
        this.expandSidePanel();
      } else {
        this.collapseSidePanel();
      }
    },   
    
    contractFacet : function(ev) {
      var $span = this.$(ev.currentTarget);
      var facetType = $span.parent().attr("facet_type");
      if (facetType) {
        if (this.facets.expansions[facetType].size==2) {
          this.facets.expansions[facetType].size--;
        }
        this.renderFacetView();
      }
    },
    
    expandFacet : function(ev) {
      var $span = this.$(ev.currentTarget);
      var facetType = $span.parent().attr("facet_type");
      if (facetType) {
        if (this.facets.expansions[facetType].size==1) {
          this.facets.expansions[facetType].size++;
        }
        this.renderFacetView();
      }
      //this.scrollToFacetSelection($span);
    }, 
    
    
    expandOrContractPanel : function(ev) {
      var $i = this.$(ev.currentTarget);
      var id = $i.attr("id");
      var contentPanelId = "panel_"+id;
      var $panelContent = this.$("#"+contentPanelId);
      if (!this.facets.panels[id]) {
        // panel is expanded so hide it whilst still displaying any selected facets
        this.showPanelContent($panelContent,$i,false); 
        this.facets.panels[id]=true; // remember it is hidden
      } else {
        // panel is hidden so expand it
        this.showPanelContent($panelContent,$i,true); 
        this.facets.panels[id]=false; // remember it is expanded 
      }
    },
    
    
    showPanelContent : function($panelContent,$i,show) {
      var $containedFacetGroups = $panelContent.find(".facet_group");
      var $facetGroup = null;
      if (show) {
        // simply show all the facet groups inside the $panelContent
        for (var h=0; h<$containedFacetGroups.length; h++) {
          $facetGroup = this.$($containedFacetGroups[h]);
          if (!$facetGroup.hasClass("hidden")) {
            // show if not premarked as hidden
            $facetGroup.show();
          }
        }
        $i.addClass("icon-chevron-down").removeClass("icon-chevron-right");
      } else {
        // First find all selected list items inside the panel content - we don't want to hide these
        var $selectedLIs = $panelContent.find(".facet_group ul.facets li.selected");
        var $parentSelectedFacetGroups = $selectedLIs.parents(".facet_group");
        // now cycle round the contained facet groups and hide those not in the parentSelectedFacetGroups
        for (var i=0; i<$containedFacetGroups.length; i++) {
          var facetGroup = $containedFacetGroups[i];
          $facetGroup = this.$(facetGroup);
          var okToHide = !$facetGroup.hasClass("hidden");  // do not hide if already marked as hidden
          if (okToHide) {
            for (var j=0; j<$parentSelectedFacetGroups.length; j++) {
              var selectedGroup = $parentSelectedFacetGroups[j];
              if (facetGroup==selectedGroup) {
                okToHide = false;  
              }
            }
          }
          if (okToHide) {
            this.$(facetGroup).hide();
          }
        }
        $i.removeClass("icon-chevron-down").addClass("icon-chevron-right");
      }
    },
       
    selectFacet : function(event) {
      var $li = this.$(event.currentTarget);
      var facetId = $li.attr("id");
      // Disable Tickets (Next Events for now)
      if (facetId!=="tickets_view_mode") { // ignore the pseudo facet used to switch view modes
        var facet = this.facets.getFacetById(facetId);
        this.segTrackUsage.recordFilter(facet.type);
        this.facets.toggleFacetSelection(facet.type,facet.value);
        this.lastPage.invalidate();
        var liId = $li.attr("id");
        var parentULId = $li.parent().attr("id");
        this.renderFacetView();
        this.scrollToFacetSelection(liId,parentULId);
      }
    },
    
    scrollToFacetSelection : function(liId,parentULId) {
      var $parentUL = this.$("#"+parentULId);
      var $facetValLI = null;
      if ($parentUL[0]) {
        // find the contained list item whose id matches liId
        var $items = $parentUL.children("li");
        for (var i=0; i<$items.length; i++) {
          var item = $items[i];
          var $item = this.$(item); 
          if ($item.attr("id")===liId) {
            $facetValLI=$item; 
          }
        }
      }
      if ($facetValLI!=null) {
        var $container = this.$(".panel.left");
        var containerHeight = $container.height();
        var containerScrollTop = $container.scrollTop();
        var scrollOffsetTop = $facetValLI.offset().top;
        var containerOffsetTop = $container.offset().top;
        var yPosition = scrollOffsetTop - containerOffsetTop;
        if (yPosition>containerScrollTop+(containerHeight/2)) {
          $container.animate({scrollTop:yPosition-(containerHeight/2)},1);
        }
      }
    },
    
    restoreScrollPosition : function() {
      var $container = this.$(".panel.left");
      $container.animate({scrollTop:this.lastScrollTop},1);
    },
    
    getJQLookupId : function(myid) {      
      return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\\\$1" );
    },
    

    dashboardWinResize : function() {
      var that = this;
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = setTimeout(function(){
        that.renderFacetView();
      }, 250);
    },
    
    manualRefresh : function() {
      this.dashboardRefresh();
    },
    
    /**  Dashboard Config Event Handlers START **/ 
    saveConfig : function() {
      this.$("#cs_configuration button.save").html("Saving");
      this.updateConfigValues(this.config);
      var appSettings = this.getAppSettings(this.config);
      var url = "/api/v2/apps/installations/" + this.installationId() + ".json";
      this.ajax("requestAppUpdate",url,appSettings);
    },
    
    requestAppUpdateSuccess : function(data) {
      if (this.settings.applied==="false") {
        this.segmentConfigured();
      }
      this.$("#cs_configuration button.save").html("Save");
      this.$("#cs_configuration .savemsg").hide();
      this.$("#cs_configuration .savemsg.success").show();
    },
    
    requestAppUdateError : function(jqxhr, settings, error) {
      this.$("#cs_configuration button.save").html("Save");
      this.$("#cs_configuration .savemsg").hide();
      this.$("#cs_configuration .savemsg.error").show();
      this.consoleMsg(error,"error");
    },
 
    segmentConfigured : function() {
      // identity
      var userId = this.currentUser().id();
      var username = this.currentUser().name();
      var email = this.currentUser().email();
      var role = this.currentUser().role();
      var segIdentify = new IdentificationSegment(this.domain,userId,username,email,role, this.settings.app_version);
      this.ajax("requestSegIdentify",segIdentify);
      var segTrackConfigured = new TrackConfiguredSegment(this.domain, userId, username, email, this.userRole, this.hasSLAPolicies, this.settings.app_version);
      this.ajax("requestSegTrack", segTrackConfigured);
    },
    
    updateConfigValues : function(config) {
      config.columns = [];
      var positions = ['Left','Middle','Right'];
      for ( var p = 0; p < positions.length; p++) {
        var col = {};
        var pos = positions[p];
        col.position = pos;
        col.title = this.$("#title_"+pos).val();
        col.label = this.$("#label_"+pos).val();
        var limit = this.$("#limit_col_"+pos).val();
        col.limit = parseInt(limit,10);        
        col.units = this.$("#col_units_"+pos).val();
        config.columns.push(col);        
      }
    
      // Facet Panel
      var facets = {};
      config.facets = facets;
      var groupsOpt = this.$("#sla_dash_facet_groups");
      if (groupsOpt.is(":visible") && groupsOpt.is(":checked")) {
        facets.Groups = true;
      } 
      if (this.$("#sla_dash_facet_agents").is(":checked")) {
        facets.Agents = true;
      } 
      var orgsOpt = this.$("#sla_dash_facet_orgs");
      if (orgsOpt.is(":visible") && orgsOpt.is(":checked")) {
        facets.Organizations = true;
      }  
      if (this.$("#sla_dash_facet_priority").is(":checked")) {
        facets.Priority = true;
      }
      config.applied="true";
    },
    
    
    getAppSettings : function(config) {
      var result = {};
      var appSettings = {};
      result.settings = appSettings;
      appSettings.segapiurl=this.settings.segapiurl;
      appSettings.segwritekey=this.settings.segwritekey;
      appSettings.config = JSON.stringify(config);
      var columns=[];
      var lastPeriod = null;
      for (var i=0; i<config.columns.length; i++) {
        var col = config.columns[i];
        var appCol = {};
        appCol.name = col.title;
        var period = {};
        appCol.period = period;
        period.label=col.label;
        var hoursLimit = this.getLimitInHours(col);
        var end = hoursLimit;
        if (col.position==="Right") {
          period.start = hoursLimit*-1;
          end = 0;
        }
        period.end = end;
        if (lastPeriod != null) {
          lastPeriod.start=end;
        }
        columns.push(appCol);
        lastPeriod = period;
      }
      appSettings.columns = JSON.stringify(columns);
      var facets=[];
      for (var j in config.facets) {
        facets.push(j);
      }
      appSettings.facets = JSON.stringify(facets);
      appSettings.applied = config.applied;
      return result;
    },
    
    getLimitInHours : function(col) {
      var result = 0;
      if (col.units==="hours") {
        result = col.limit;
      } else if (col.units==="days") {
        result = col.limit * 24;
      } else if (col.units=="weeks") {
        result = col.limit * 24 * 7;
      }
      return result;
    },
    
    consoleMsg : function(msg,severity) {
      if (typeof(console) != 'undefined') {
        if (severity==="error") {
          console.error(msg);
        } else if (severity==="warn") {
          console.warn(msg);
        } else if (severity==="info") {
          console.info(msg);
        }
      }
    },
    
    /**  Dashboard Config Event Handlers END**/
    
    /**================= Dashboard UI Event Handlers END ====================**/ 
    
    /**================= SLA Assistant Main Logic START ====================**/  
    handleUpdate: function(user) {
      this.ajax('getTicket', this.ticket().id());
    },
    
    activeSLAs: function(slas) {
      var count = 0;
      for (var i = 0; i < slas.policy_metrics.length; i++) {
        if (slas.policy_metrics[i].stage != 'achieved') {
          count++;
        }
      }
      return count;
    },
    
    updateSLA: function(data) {
      if (data.ticket.slas && this.activeSLAs(data.ticket.slas) > 0) {
        this.switchTo('assistant');
        this.$('#sla3title').html(this.I18n.t('slaassistant'));
        this.$(this.data.target).show();
        this.displayTicketSLA(data.ticket);
      } else {
        // No SLA so don't show the app
        this.$(this.data.target).hide();
      }
    },
    
    findSlaDet: function(allslas, tn) {
      for (var i = 0; i < allslas.length; i++) {
        if (allslas[i].timerName === tn) {
          return allslas[i];
        }
      }
      return null;
    },
    
    displayTicketSLA: function(tkt) {
      var i;
      var allDates = [];
      var allSlas = [];
      var html = '';
      for (i = 0; i < tkt.slas.policy_metrics.length; i++) {
        if (tkt.slas.policy_metrics[i].stage != 'achieved') {
          allDates.push(tkt.slas.policy_metrics[i].breach_at + "_++_" + tkt.slas.policy_metrics[i].metric);
          var sladet = {};
          sladet.timerName = tkt.slas.policy_metrics[i].metric;
          sladet.label = this.metricNameMap[sladet.timerName];
          sladet.description = this.metricDescMap[sladet.timerName];
          sladet.by = tkt.slas.policy_metrics[i].breach_at;
          sladet.state = tkt.slas.policy_metrics[i].stage;
          var left = tkt.slas.policy_metrics[i].minutes || tkt.slas.policy_metrics[i].hours || tkt.slas.policy_metrics[i].days || tkt.slas.policy_metrics[i].weeks || 0;
          var mins = tkt.slas.policy_metrics[i].minutes || 10000;
          if (sladet.state == 'active' && left < 0) {
            sladet.state = 'late';
          } else if (sladet.state == 'active' && mins > 0 && mins < 20) {
            sladet.state = 'warn';
          }
          allSlas.push(sladet);
        }
      }
      if (allDates.length > 0) {
        allDates.sort();
        for (i = 0; i < allDates.length; i++) {
          var pos = allDates[i].indexOf("_++_");
          var tn = allDates[i].substring(pos+4);
          var sdet = this.findSlaDet(allSlas, tn);          
          var cls1 = '';
          if (sdet.state != null && sdet.state.length > 0) {
            cls1 = sdet.state;
          }
          var m = moment(sdet.by);
          var date = m.format('ddd DD MMM');
          var time = m.format('HH:mm');
          html += this.renderTemplate("event", {title:sdet.label,description:sdet.description,time:time,date:date,state:sdet.state,cls1:cls1,paused:sdet.state=='paused'});
        }
      } else {
        html += this.renderTemplate("nosla");
      }
      this.$('#sla').html(html);
      if (this.sla) {
        this.$('#sla2 #sla-details .value').html(this.sla);
        if (this.sla_policy) {
          this.$('#sla2 #sla-details .value').attr("title", this.sla_policy.description||'This SLA Policy was not given a description');          
        }
      } else {
        this.lookupSLA(null);
      }
    },
    
    appDeactivated: function() {
    },
    
    formChanged: function() {
      // Use defer method since we want to wait until the form has been re-rendered.
      var self = this;
      _.defer(function() {
        self.ajax('getTicket', self.ticket().id());
      });
    },
    
    
    lookupCorrectTZName: function(abrTZ) {
      var tz = this.tzMap[abrTZ];
      return tz || "Etc/UTC";
    },
    
    populateSLA: function(sla) {
      this.sla = sla;
      this.$('#sla2 #sla-details .value').html(this.sla);
      this.ajax('getSlaPolicies').done(function(data) {
        if (data.sla_policies) {
          for (var i = 0; i < data.sla_policies.length; i++) {
            if (this.sla == data.sla_policies[i].title) {
              this.sla_policy = data.sla_policies[i];
              break;
            }
          }
        }
        if (this.sla_policy) {
          this.$('#sla2 #sla-details .value').attr("title", this.sla_policy.description||'This SLA Policy was not given a description');          
        }
      });
    },
    
    lookupSLA: function(url) {
      if (url == null) {
        url = '/api/v2/tickets/'+this.ticket().id()+'/audits.json?sort_order=desc';
      }
      this.ajax('getAudit', url).done(function(data) {
        var sla = null;
        for (var i = 0; i < data.audits.length && sla == null; i++) {
          for (var j = 0; j < data.audits[i].events.length && sla == null; j++) {
            var event = data.audits[i].events[j];
            if (event.type =='Change' && this.metricNameMap[event.field_name] != null) {
              sla = event.via.current_sla_policy;
            }
          }
        }
        if (sla != null) {
          this.populateSLA(sla);
        } else {
          url = data.next_page;
          if (url != null) {
            this.lookupSLA(url);
          }
        }
      });
    }
    
    /**================= SLA Assistant Main Logic END ====================**/
      
  };

}());
;

  var app = ZendeskApps.defineApp(source)
    .reopenClass({"location":["nav_bar","ticket_sidebar"],"noTemplate":false,"singleInstall":true})
    .reopen({
      assetUrlPrefix: "/api/v2/apps/66692/assets/",
      appClassName: "app-66692",
      author: {
        name: "Coherence Design",
        email: "support@cloudset.net"
      },
      translations: {"app":{"parameters":{"cloudsetUrl":{"label":"CloudSET URL","helpText":"URL du serveur CloudSET.  Ce paramètre, s'il est fourni, remplacera celui par défaut."}}},"description":"Application de la barre de navigation pour configurer les définitions de SLA","apptitle":"Assistant SLA","strapLine":"Tous les billets sont maintenant sous la Direction du service-level agreement (SLA).","sla":"Politique SLA","slapaused":"SLA en pause","bhregion":"Heures","averesponse":"Temps de réponse moyen","cumresponse":"Temps de réponse cumulatif","vcount":"Dénombrement des violations","pcount":"Dénombrement des passes","ecount":"Dénombrement des extensions","total":"Total (passes + violations)","slaassistant":"Assistant SLA","slaconfig":"Configuration de la gestion du SLA du CloudSET","hours":"Heures","hoursto":"Heures jusqu'à '{{label}}'","avehoursto":"Moyenne d'heures jusqu'à '{{label}}'","evcount":"Dénombrement d'événement {{count}}","showmeasures":"Afficher les mesures","hidemeasures":"Masquer les mesures","showescalation":"Afficher l'intensification","hideescalation":"Masquer l'intensification","lastescalation":"Afficher l'intensification","nextescalation":"Dernière intensification","esclevel":"Prochaine intensification","violates":"Enfreint","buttons":{"reassess":"Réévaluer","reenact":"Reconstituer","review":"Examiner","cancel":"Annuler","applyrea":"Appliquer la réévaluation","applyree":"Appliquer la reconstitution","assessing":"En cours d'évaluation...","enacting":"En cours de constitution...","reviewing":"En cours d'examen..."},"months":{"jan":"Jan","feb":"Fév","mar":"Mar","apr":"Avr","may":"Mai","jun":"Jun","jul":"Jul","aug":"Aoû","sep":"Sep","oct":"Oct","nov":"Nov","dec":"Déc"},"days":{"mon":"Lun","tue":"Mar","wed":"Mer","thu":"Jeu","fri":"Ven","sat":"Sam","sun":"Dim"},"ticketStatus":{"new":"Ouvert","open":"En attente","pending":"En suspens","hold":"Cette capacité a un ensemble de caractéristiques \u003cb\u003elimité\u003c/b\u003e"},"dash":{"restrictedfeatures":"Cette capacité a un ensemble de caractéristiques \u003cb\u003elimité\u003c/b\u003e","restrictions":"Taux d'actualisation de 5 minutes; Jusqu'à 100 billets; Pas de champs personnalisés","refreshrestrictions":"Taux d'actualisation limité à 5 minutes","ticketrestrictions":"Billets limités à un maximum de 100","upgradebenefits":"Renseignez-vous au sujet des bénéfices de mise à jour","dashboard":"Tableau de bord","configure":"Configurer","configuration":"Configuration de tableau de bord","filteredviews":"Visualisations SLA filtrées","destboard":"Tableau de destination","groups":"Groupes","agents":"Agents","organizations":"Organisations","less":"Moins","more":"Plus","people":"PERSONNES","priority":"PRIORITÉ","metrics":"INDICATEURS","ticketcount":"{{count}} billet","ticketscount":"{{count}} billets","refreshin":"Actualiser dans {{timeleft}}","all":"Tous","noorgs":"\u003cpas d'organisation\u003e","nogroups":"\u003cpas de groupes\u003e","noagents":"\u003cpas d'agents\u003e","showmore":"Afficher plus","showless":"Afficher moins","showfewer":"En afficher moins"}},
      templates: {"assistant":"\u003cdiv id=\"sla2\" class=\"content-sla\"\u003e\n  \u003cdiv class=\"sla-statsy sla-head\"\u003e\n    \u003cdiv id=\"sla-details\"\u003e\n      \u003cdiv class=\"value _tooltip slaname\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"\"\u003e...\u003c/div\u003e\n      \u003cdiv class=\"title\"\u003e{{t \"sla\"}}\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\u003cdiv id=\"sla\" class=\"content-sla\"\u003e\n\u003c/div\u003e\n","config":"\u003cdiv class=\"tab_content\"\u003e\r\n  \u003cdiv class=\"dash_config two_column\"\u003e\r\n    \u003cdiv id=\"no_slas\" class=\"hide\"\u003e\r\n      \u003clabel\u003eWARNING : No Zendesk Service Level Agreements (SLA's) detected.\u003c/label\u003e\r\n      \u003cp\u003eThe dashboard will remain empty until some tickets are created under an SLA.\u003c/p\u003e\r\n      \u003cp\u003eYou can define Service Level Agreements \u003ca href=\"/agent/admin/slas\"\u003ehere\u003c/a\u003e\u003c/p\u003e\r\n    \u003c/div\u003e\r\n    \u003cfieldset class=\"toppanel form_element\"\u003e\r\n      \u003cdiv class=\"sla_label\"\u003eColumns\u003c/div\u003e\r\n      \u003cdiv id=\"columns_form_field\" class=\"form_field\"\u003e\r\n        {{#each columns}}\r\n        \u003cdiv class=\"columnspec\"\u003e\r\n          \u003ch4\u003e{{this.position}}\u003c/h4\u003e\r\n          \u003cdiv\u003e\r\n            \u003clabel\u003eTitle:\u003c/label\u003e\u003cinput id=\"title_{{this.position}}\" type=\"text\" name=\"coltitle\" class=\"coltitle\" value=\"{{this.title}}\"\u003e\r\n          \u003c/div\u003e\r\n          \u003cdiv\u003e\r\n            \u003clabel\u003eLabel:\u003c/label\u003e\u003cinput id=\"label_{{this.position}}\" type=\"text\" name=\"collabel\" class=\"collabel\" value=\"{{this.label}}\"\u003e\r\n          \u003c/div\u003e\r\n          \u003cdiv class=\"range\"\u003e\r\n            \u003clabel\u003e{{this.fromto}}\u003c/label\u003e \u003cinput class=\"hours\" id=\"limit_col_{{this.position}}\" type=\"text\" name=\"collimit\"\r\n              value=\"{{this.limit}}\"\u003e\u003c/input\u003e \u003cselect id=\"col_units_{{this.position}}\" class=\"units\"\u003e\r\n              \u003coption {{this.select_hours}} value=\"hours\"\u003ehours\u003c/option\u003e\r\n              \u003coption {{this.select_days}} value=\"days\"\u003edays\u003c/option\u003e\r\n              \u003coption {{this.select_weeks}} value=\"weeks\"\u003eweeks\u003c/option\u003e\r\n            \u003c/select\u003e \u003cspan\u003eold\u003c/span\u003e\r\n          \u003c/div\u003e\r\n        \u003c/div\u003e\r\n        {{/each}}\r\n        \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\r\n        \u003cp\u003eSpecify the titles and the time periods for the three columns on the dashboard.\u003c/p\u003e\r\n        \u003cp class=\"compact\"\u003e\"From:\" represents the limit at the bottom of the left and middle columns, \"Up to\" represents the limit at the top of the\r\n          right column.\u003c/p\u003e\r\n        \u003cp\u003e[The time periods from left to right across the three columns are contiguous from the future to the past.' The top limit of the left column\r\n          equates to the bottom limit of the middle column.' Similarly, the top of the middle column and the bottom of the right column equate to \"now\".]\u003c/p\u003e\r\n      \u003c/div\u003e\r\n    \u003c/fieldset\u003e\r\n    \u003cfieldset class=\"form_element\"\u003e\r\n      \u003cdiv class=\"sla_label\"\u003eStandard Facets\u003c/div\u003e\r\n      \u003cdiv class=\"form_field\"\u003e\r\n        \u003cdiv class=\"facet_group\"\u003e\r\n          \u003clabel\u003ePeople\u003c/label\u003e\r\n            \u003cdiv\u003e\u003cinput {{facets.select_groups}} type=\"checkbox\" id=\"sla_dash_facet_groups\" class=\"typecb\" name=\"facets\" value=\"groups\"\u003eGroups\u003c/input\u003e\u003c/div\u003e\r\n            \u003cdiv\u003e\u003cinput {{facets.select_agents}} type=\"checkbox\" id=\"sla_dash_facet_agents\" class=\"typecb\" name=\"facets\" value=\"agents\"\u003eAgents\u003c/input\u003e\u003c/div\u003e\r\n            \u003cdiv\u003e\u003cinput {{facets.select_orgs}} type=\"checkbox\" id=\"sla_dash_facet_orgs\" class=\"typecb\" name=\"facets\" value=\"orgs\"\u003eOrganizations\u003c/input\u003e\u003c/div\u003e          \r\n        \u003c/div\u003e\r\n        \u003cdiv class=\"facet_group\"\u003e\r\n          \u003clabel\u003ePriority\u003c/label\u003e\r\n          \u003cdiv\u003e\u003cinput {{facets.select_priority}} type=\"checkbox\" id=\"sla_dash_facet_priority\" class=\"typecb\" name=\"facets\" value=\"priority\"\u003ePriority\u003c/input\u003e\u003c/div\u003e          \r\n        \u003c/div\u003e\r\n        \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\r\n        \u003cp\u003eSpecify the facet filters you wish to be available in the side panel of the dashboard\u003c/p\u003e\r\n      \u003c/div\u003e\r\n    \u003c/fieldset\u003e\r\n    \u003cfieldset class=\"lastpanel form_element\"\u003e\r\n      \u003cdiv class=\"form_field\"\u003e\r\n        \u003clabel class=\"savemsg firstconfig hide\"\u003ePlease adjust any settings and then press \u003cbutton class=\"button\" type=\"button\"\u003eSave\u003c/button\u003e to enable the dashboard for all agents.\u003c/label\u003e\r\n        \u003clabel class=\"savemsg success hide\"\u003eSave complete. Please refresh the page to apply the latest settings to the dashboard\u003c/label\u003e\r\n        \u003clabel class=\"savemsg error hide\"\u003eUnable to save latest settings. Please try again.\u003c/label\u003e       \r\n        \u003cbutton class=\"button btnw save\" type=\"button\"\u003eSave\u003c/button\u003e\r\n      \u003c/div\u003e\r\n    \u003c/fieldset\u003e\r\n  \u003c/div\u003e\r\n\u003c/div\u003e","destinationboard":"\u003cdiv id=\"cs_dashboard\" class=\"slaview tab_content\"\u003e\n\t\u003cdiv class=\"panel left collapsible {{collapsed}}\"\u003e\n      \u003cdiv class=\"views_section\"\u003e\n        \u003cdiv class=\"header\"\u003e\n          \u003cdiv class=\"inner\"\u003e\n            \u003ch1\u003e{{t \"dash.filteredviews\"}}\u003ci class=\"icon-loading-spinner\"\u003e\u003c/i\u003e\u003c/h1\u003e\n            \u003cdiv class=\"actions\"\u003e\n              \u003cbutton class=\"pin_control\"\u003e\n                \u003ci class=\"icon-chevron-right pin\"\u003e\u003c/i\u003e \u003ci class=\"icon-chevron-left unpin\"\u003e\u003c/i\u003e\n              \u003c/button\u003e\n            \u003c/div\u003e\n            \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n          \u003c/div\u003e\n        \u003c/div\u003e\n        \u003cdiv\u003e\n          \u003cul class=\"viewlist\"\u003e\n            \u003cli id=\"destinationboard\" class=\"selected\"\u003e\u003ca\u003e{{t \"dash.destboard\"}}\u003c/a\u003e\u003c/li\u003e\n          \u003c/ul\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"facets_section\"\u003e\n        \u003cdiv class=\"{{facets.showpanel.personnel}}\"\u003e\n          \u003cdiv class=\"facet_heading separated\"\u003e\n            \u003ci id=\"content_personnel\" class=\"icon-chevron-down panel_expander\"\u003e\u003c/i\u003e\n            \u003clabel class=\"panelheader\"\u003e{{t \"dash.people\"}}\u003c/label\u003e\n          \u003c/div\u003e \n          \u003cdiv id=\"panel_content_personnel\"\u003e\n            \u003cdiv class=\"facet_heading\"\u003e\n\t\t      \u003cdiv class=\"facet_group {{facets.active.grp_name}}\"\u003e\n                \u003ch1\u003e{{t \"dash.groups\"}}\u003c/h1\u003e\n                \u003cdiv class=\"facet_list\" style=\"height:{{facets.expansions.grp_name.height}}px\"\u003e\n                  \u003cul id=\"facet_ul_grp_name\" class=\"grp_name facets\"\u003e\n                    {{#each facets.sorted.grp_name.vals}}\n                    \u003cli id=\"facet:grp_name:{{this.value}}\" class=\"facet {{this.selected}}\"\u003e\n                      \u003cimg src=\"{{assetURL \"darkgreycross.png\"}}\"/\u003e          \n                      \u003cspan title=\"{{this.title}}\" class=\"facetval\"\u003e{{this.label}}\u003c/span\u003e\n                      \u003cspan class=\"right\"\u003e{{this.count}}\u003c/span\u003e\n                      \u003cspan class=\"clear\"\u003e\u003c/span\u003e\n                    \u003c/li\u003e\n                    {{/each}}\n                  \u003c/ul\u003e\n                \u003c/div\u003e\n                \u003cdiv\u003e\n                  \u003cdiv class=\"{{facets.expansions.grp_name.buttons}}\"\u003e\n                    \u003cdiv class=\"expansionbuttons\" facet_type=\"grp_name\"\u003e\n                      \u003cspan class=\"expansionbutton fewer _tooltip {{facets.expansions.grp_name.fewer}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showfewer'}}\"\u003e{{t \"dash.less\"}} \u0026laquo;\u003c/span\u003e\n                      \u003cspan class=\"expansionbutton more _tooltip {{facets.expansions.grp_name.more}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showmore'}}\"\u003e{{t \"dash.more\"}} \u0026raquo;\u003c/span\u003e\n                    \u003c/div\u003e\n                  \u003c/div\u003e\n                  \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n                \u003c/div\u003e  \n              \u003c/div\u003e\n            \u003c/div\u003e    \n            \u003cdiv class=\"facet_heading\"\u003e\n              \u003cdiv class=\"facet_group {{facets.active.assignee_name}}\"\u003e\n                \u003ch1\u003e{{t \"dash.agents\"}}\u003c/h1\u003e\n                \u003cdiv class=\"facet_list\" style=\"height:{{facets.expansions.assignee_name.height}}px\"\u003e\n                  \u003cul id=\"facet_ul_assignee_name\" class=\"assignee_name facets\"\u003e\n                    {{#each facets.sorted.assignee_name.vals}}\n                    \u003cli id=\"facet:assignee_name:{{this.value}}\" class=\"facet {{this.selected}}\"\u003e\n                      \u003cimg src=\"{{assetURL \"darkgreycross.png\"}}\"/\u003e          \n                      \u003cspan title=\"{{this.title}}\" class=\"facetval\"\u003e{{this.label}}\u003c/span\u003e\n                      \u003cspan class=\"right\"\u003e{{this.count}}\u003c/span\u003e\n                      \u003cspan class=\"clear\"\u003e\u003c/span\u003e\n                    \u003c/li\u003e\n         \t        {{/each}}\n                  \u003c/ul\u003e\n                \u003c/div\u003e\n                \u003cdiv\u003e\n                  \u003cdiv class=\"{{facets.expansions.assignee_name.buttons}}\"\u003e\n                    \u003cdiv class=\"expansionbuttons\" facet_type=\"assignee_name\"\u003e\n                      \u003cspan class=\"expansionbutton fewer _tooltip {{facets.expansions.assignee_name.fewer}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showfewer'}}\"\u003e{{t \"dash.less\"}} \u0026laquo;\u003c/span\u003e\n                      \u003cspan class=\"expansionbutton more _tooltip {{facets.expansions.assignee_name.more}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showmore'}}\"\u003e{{t \"dash.more\"}} \u0026raquo;\u003c/span\u003e\n                    \u003c/div\u003e\n                  \u003c/div\u003e\n                  \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n                \u003c/div\u003e \n              \u003c/div\u003e \n            \u003c/div\u003e \n            \u003cdiv class=\"facet_heading\"\u003e\n              \u003cdiv class=\"facet_group {{facets.active.org_name}}\"\u003e\n                \u003ch1\u003e{{t \"dash.organizations\"}}\u003c/h1\u003e\n                \u003cdiv class=\"facet_list\" style=\"height:{{facets.expansions.org_name.height}}px\"\u003e\n                  \u003cul id=\"facet_ul_org_name\" class=\"org_name facets\"\u003e\n                  {{#each facets.sorted.org_name.vals}}\n                    \u003cli id=\"facet:org_name:{{this.value}}\" class=\"facet {{this.selected}}\"\u003e\n                      \u003cimg src=\"{{assetURL \"darkgreycross.png\"}}\"/\u003e\n                      \u003cspan title=\"{{this.title}}\" class=\"facetval\"\u003e{{this.label}}\u003c/span\u003e\n                      \u003cspan class=\"right\"\u003e{{this.count}}\u003c/span\u003e\n                      \u003cspan class=\"clear\"\u003e\u003c/span\u003e\n                    \u003c/li\u003e\n                  {{/each}}\n                  \u003c/ul\u003e\n                \u003c/div\u003e\n                \u003cdiv\u003e\n                  \u003cdiv class=\"{{facets.expansions.org_name.buttons}}\"\u003e\n                    \u003cdiv class=\"expansionbuttons\" facet_type=\"org_name\"\u003e\n                      \u003cspan class=\"expansionbutton fewer _tooltip {{facets.expansions.org_name.fewer}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showfewer'}}\"\u003e{{t \"dash.less\"}} \u0026laquo;\u003c/span\u003e\n                      \u003cspan class=\"expansionbutton more _tooltip {{facets.expansions.org_name.more}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showmore'}}\"\u003e{{t \"dash.more\"}} \u0026raquo;\u003c/span\u003e\n                    \u003c/div\u003e\n                  \u003c/div\u003e\n                  \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n                \u003c/div\u003e \n              \u003c/div\u003e\n            \u003c/div\u003e  \n          \u003c/div\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"{{facets.showpanel.priority}}\"\u003e\n          \u003cdiv class=\"facet_heading separated\"\u003e\n            \u003ci id=\"content_priority\" class=\"icon-chevron-down panel_expander\"\u003e\u003c/i\u003e\n            \u003clabel class=\"panelheader\"\u003e{{t \"dash.priority\"}}\u003c/label\u003e\n          \u003c/div\u003e \n          \u003cdiv id=\"panel_content_priority\"\u003e\n            \u003cdiv class=\"facet_heading\"\u003e           \n              \u003cdiv class=\"facet_group {{facets.active.priority}}\"\u003e\n                \u003ch1\u003ePriority\u003c/h1\u003e\n                \u003cdiv class=\"facet_list\" style=\"height:{{facets.expansions.priority.height}}px\"\u003e        \n                  \u003cul id=\"facet_ul_priority\" class=\"priority facets\"\u003e\n                  {{#each facets.sorted.priority.vals}}\n                    \u003cli id=\"facet:priority:{{this.value}}\" class=\"facet {{this.selected}}\"\u003e\n                      \u003cimg src=\"{{assetURL \"darkgreycross.png\"}}\"/\u003e          \n                      \u003cspan title=\"{{this.title}}\" class=\"facetval\"\u003e{{this.label}}\u003c/span\u003e\n                      \u003cspan class=\"right\"\u003e{{this.count}}\u003c/span\u003e\n                      \u003cspan class=\"clear\"\u003e\u003c/span\u003e\n                    \u003c/li\u003e\n                  {{/each}}\n                  \u003c/ul\u003e\n                \u003c/div\u003e\n                \u003cdiv\u003e\n                  \u003cdiv class=\"{{facets.expansions.priority.buttons}}\"\u003e\n                    \u003cdiv class=\"expansionbuttons\" facet_type=\"priority\"\u003e\n                      \u003cspan class=\"expansionbutton fewer _tooltip {{facets.expansions.priority.fewer}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showfewer'}}\"\u003e{{t \"dash.less\"}} \u0026laquo;\u003c/span\u003e\n                      \u003cspan class=\"expansionbutton more _tooltip {{facets.expansions.priority.more}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showmore'}}\"\u003e{{t \"dash.more\"}} \u0026raquo;\u003c/span\u003e\n                    \u003c/div\u003e\n                  \u003c/div\u003e\n                  \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n                \u003c/div\u003e\n              \u003c/div\u003e\n            \u003c/div\u003e\n          \u003c/div\u003e             \n        \u003c/div\u003e\n        \u003cdiv class=\"{{facets.showpanel.events}}\"\u003e\n          \u003cdiv class=\"facet_heading separated\"\u003e\n            \u003ci id=\"content_events\" class=\"icon-chevron-down panel_expander\"\u003e\u003c/i\u003e\n            \u003clabel class=\"panelheader\"\u003e{{t \"dash.metrics\"}}\u003c/label\u003e\n          \u003c/div\u003e \n          \u003cdiv id=\"panel_content_events\"\u003e\n            \u003cdiv class=\"facet_heading\"\u003e     \n              \u003cdiv class=\"facet_group\"\u003e    \n    \t\t    \u003ch1\u003eSLA Metrics\u003c/h1\u003e\n    \t\t    \u003cdiv class=\"facet_list\" style=\"height:{{facets.expansions.eventName.height}}px\"\u003e\n                  \u003cul id=\"facet_ul_eventName\" class=\"eventName facets\"\u003e\n                  {{#each facets.sorted.eventName.vals}}\n                    \u003cli id=\"facet:eventName:{{this.value}}\" class=\"facet {{this.selected}}\"\u003e\n    \t\t          \u003cimg src=\"{{assetURL \"darkgreycross.png\"}}\"/\u003e\n    \t\t          \u003cspan class=\"facetval\"\u003e{{this.label}}\u003c/span\u003e\n                      \u003cspan class=\"right\"\u003e{{this.count}}\u003c/span\u003e\n                      \u003cspan class=\"clear\"\u003e\u003c/span\u003e\n                    \u003c/li\u003e\n    \t\t\t  {{/each}}\n                  \u003c/ul\u003e\n                \u003c/div\u003e\n                \u003cdiv\u003e\n                  \u003cdiv class=\"{{facets.expansions.eventName.buttons}}\"\u003e\n                    \u003cdiv class=\"expansionbuttons\" facet_type=\"eventName\"\u003e\n                      \u003cspan class=\"expansionbutton fewer _tooltip {{facets.expansions.eventName.fewer}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showfewer'}}\"\u003e{{t \"dash.less\"}} \u0026laquo;\u003c/span\u003e\n                      \u003cspan class=\"expansionbutton more _tooltip {{facets.expansions.eventName.more}}\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"1000\", \"hide\":\"0\"}' title=\"{{t 'dash.showmore'}}\"\u003e{{t \"dash.more\"}} \u0026raquo;\u003c/span\u003e\n                    \u003c/div\u003e\n                  \u003c/div\u003e\n                  \u003cdiv class=\"clear\"\u003e\u003c/div\u003e\n                \u003c/div\u003e\n              \u003c/div\u003e\n            \u003c/div\u003e\n          \u003c/div\u003e              \n        \u003c/div\u003e\n      \u003c/div\u003e  \n\t\u003c/div\u003e\n    \u003cdiv class=\"panel right {{collapsed}}\"\u003e\n      \u003cdiv class=\"board\"\u003e\n        \u003cdiv class=\"viewheader\"\u003e\n          \u003cdiv\u003e\n            \u003cdiv class=\"left\"\u003e\n              \u003ch1 class=\"viewtitle\"\u003e{{t \"dash.destboard\"}}\u003ci class=\"icon-loading-spinner\"\u003e\u003c/i\u003e\u003c/h1\u003e \n                \u003cdiv class=\"summary\"\u003e\n                  \u003cspan class=\"_tooltip\" data-toggle='tooltip' data-placement='bottom' data-original-title='{{t \"dash.ticketrestrictions\"}}'\u003e{{total_tickets_str}}\u003c/span\u003e\u003cspan\u003e{{filter_desc}}\u003c/span\u003e\n                \u003c/div\u003e                \n            \u003c/div\u003e\n            \u003cdiv class=\"timer right _tooltip\" data-toggle='tooltip' data-placement='top' data-original-title='{{t \"dash.refreshrestrictions\"}}'\u003e\n              \u003ch4 class=\"countdown\"\u003e\u0026nbsp;\u003c/h4\u003e\n            \u003c/div\u003e\n            \u003cdiv class=\"clearright\"\u003e\u003c/div\u003e\n          \u003c/div\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"entries_container\"\u003e\n          \u003cdiv class=\"entries_column col1 paler\" colpos=\"left\"\u003e\u003c/div\u003e\n          \u003cdiv class=\"entries_column col2\" colpos=\"middle\"\u003e\u003c/div\u003e\n          \u003cdiv class=\"entries_column col3 paler\" colpos=\"right\"\u003e\u003c/div\u003e\n          \u003cdiv style=\"clear: both\"\u003e\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n\u003c/div\u003e\n\n\n\n","entriescolumn":"\u003cdiv class=\"col_fragment top\"\u003e\n  \u003ch1\u003e{{columnname}}\u003c/h1\u003e\n  \u003cdiv class=\"summary\"\u003e\n    \u003cdiv class=\"left\"\u003e\u003cspan\u003e{{num_col_entries}}\u003c/span\u003e\u003cspan\u003e | \u003c/span\u003e\u003cspan\u003e{{period}}\u003c/span\u003e\u003c/div\u003e\n    \u003cdiv class=\"right {{trends.classes.showTrendInfo}}\"\u003e\u003cspan\u003e{{trends.added}}\u003c/span\u003e\u003cspan\u003e|\u003c/span\u003e\u003cspan\u003e{{trends.removed}}\u003c/span\u003e\u003cimg class=\"{{trends.classes.showUpward}}\" src=\"{{assetURL \"up.png\"}}\"\u003e\u003c/img\u003e\u003cimg class=\"{{trends.classes.showDownward}}\" src=\"{{assetURL \"down.png\"}}\"\u003e\u003c/img\u003e\u003cspan style=\"display:none;font-family:entypo\"\u003e\u0026#x2B07;\u003c/span\u003e\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"clear\"/\u003e\n  \u003cdiv class=\"scroll_entries\" style=\"height:{{topcolheight}}px\"\u003e\n    \u003cul class=\"entries\"\u003e\n\t\t\t{{#each top}}\n\t\t\t\u003cli class=\"{{classes.measure}}\"\u003e\n\t\t\t\t\u003cdiv class=\"entry_box\"\u003e\n\t\t\t\t\t\u003cdiv class=\"statusbar _tooltip\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"{{rolledupmeasuredesc}}\"\u003e\n\t\t\t\t\t\t\u003cdiv class=\"component upper\"\u003e\u0026nbsp;\u003c/div\u003e\n\t\t\t\t\t\t\u003cdiv class=\"component lower\"\u003e\u0026nbsp;\u003c/div\u003e\n\t\t\t\t\t\u003c/div\u003e\n          \u003cdiv class=\"rightcol\"\u003e\n            \u003cdiv class=\"time\"\u003e\n              \u003cspan class=\"timeleft right _tooltip {{isLate}}\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"{{bystr}}\"\u003e\n                \u003cimg class=\"{{classes.showclock}}\" src=\"{{assetURL \"clock.png\"}}\"/\u003e\n                \u003cimg class=\"{{classes.showlateclock}}\" src=\"{{assetURL \"lateclock.png\"}}\"/\u003e {{nextEventRemainingTime}}\n              \u003c/span\u003e\n            \u003c/div\u003e\n            \u003cdiv class=\"eventtype\"\u003e\n              \u003cspan class=\"eventname right\"\u003e{{eventName}}\u003c/span\u003e\n            \u003c/div\u003e\n          \u003c/div\u003e\t\n          \u003cdiv class=\"midcol\"\u003e\u003c/div\u003e          \t\t\t\t\n\t\t\t\t\t\u003cdiv class=\"leftcol\"\u003e\n\t\t\t\t\t\t\u003cdiv class=\"title\"\u003e\n\t\t\t\t\t\t  \u003cspan\u003e\u003ca class=\"_tooltip\" href=\"{{url}}\"\"\u003e{{desc}}\u003c/a\u003e\u003c/span\u003e\n            \u003c/div\u003e\n\t\t\t\t\t\t\u003cdiv class=\"org {{classes.showorg}}\"\u003e\u003cspan\u003e\u003ca href=\"organizations/{{org_id}}\"\u003e{{{org_name}}}\u003c/a\u003e\u003c/span\u003e\u003c/div\u003e\n\t\t\t\t\t\t\u003cdiv class=\"req {{classes.showreq}}\"\u003e\u003cspan\u003e\u003c/span\u003e\u003c/div\u003e\n\t\t\t\t\t\u003c/div\u003e\n\t\t\t\t\u003c/div\u003e\n\t\t\t\u003c/li\u003e\n\t\t\t{{/each}}\n    \u003c/ul\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\u003cdiv class=\"col_fragment middle\" style=\"display:{{separator_display}}\"\u003e\u003c/div\u003e\n\u003cdiv class=\"col_fragment bottom\"\u003e\n  \u003cdiv class=\"scroll_entries\" style=\"height:{{bottomcolheight}}px\"\u003e\n    \u003cul class=\"entries\"\u003e\n      {{#each bottom}}\n      \u003cli class=\"{{classes.measure}}\"\u003e\n        \u003cdiv class=\"entry_box\"\u003e\n          \u003cdiv class=\"statusbar _tooltip\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"{{rolledupmeasuredesc}}\"\u003e\n            \u003cdiv class=\"component upper\"\u003e\u0026nbsp;\u003c/div\u003e\n            \u003cdiv class=\"component lower\"\u003e\u0026nbsp;\u003c/div\u003e\n          \u003c/div\u003e\n          \u003cdiv class=\"rightcol\"\u003e\n            \u003cdiv class=\"time\"\u003e\n              \u003cspan class=\"timeleft right _tooltip {{isLate}}\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"{{bystr}}\"\u003e\n                \u003cimg class=\"{{classes.showclock}}\" src=\"{{assetURL \"clock.png\"}}\"/\u003e\n                \u003cimg class=\"{{classes.showlateclock}}\" src=\"{{assetURL \"lateclock.png\"}}\"/\u003e {{nextEventRemainingTime}}\n              \u003c/span\u003e\n            \u003c/div\u003e\n            \u003cdiv class=\"eventtype\"\u003e\n              \u003cspan class=\"eventname right\"\u003e{{eventName}}\u003c/span\u003e\n            \u003c/div\u003e\n          \u003c/div\u003e  \n          \u003cdiv class=\"midcol\"\u003e\u003c/div\u003e        \n          \u003cdiv class=\"leftcol\"\u003e\n            \u003cdiv class=\"title\"\u003e\n              \u003cspan class=\"title\"\u003e\u003ca class=\"_tooltip\" href=\"{{url}}\"\u003e{{desc}}\u003c/a\u003e\u003c/span\u003e\n            \u003c/div\u003e\n            \u003cdiv class=\"org {{classes.showorg}}\"\u003e\u003cspan\u003e\u003ca href=\"organizations/{{org_id}}\"\u003e{{{org_name}}}\u003c/a\u003e\u003c/span\u003e\u003c/div\u003e\n            \u003cdiv class=\"req {{classes.showreq}}\"\u003e\u003cspan\u003e\u003c/span\u003e\u003c/div\u003e\n          \u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/li\u003e\n      {{/each}}\n    \u003c/ul\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\n\n","event":"  \u003cdiv class=\"sla-vertical\"\u003e\u003c/div\u003e\r\n  \u003cdiv class=\"sla-statsy {{state}}-sla {{cls1}}\"\u003e\r\n    \u003cdiv class=\"day _tooltip\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"{{description}}\"\u003e{{title}}\u003c/div\u003e\r\n    \u003cdiv class=\"arrow\"\u003e\u003c/div\u003e\r\n    \u003cdiv class=\"sla-count sla-pc sla-circle\"\u003e\u0026nbsp;\u003c/div\u003e\r\n    {{#if paused}}\r\n    \u003cdiv class=\"data\"\u003e\r\n      \u003cdiv class=\"sla-paused\"\u003e{{t \"slapaused\"}}\u003c/div\u003e\r\n    \u003c/div\u003e\r\n    {{else}}\r\n    \u003cdiv class=\"data\"\u003e\r\n      \u003cdiv class=\"time\"\u003e{{time}}\u003c/div\u003e\u003cdiv class=\"date\"\u003e{{date}}\u003c/div\u003e\r\n    \u003c/div\u003e\r\n    {{/if}}    \r\n  \u003c/div\u003e","layout":"\u003cstyle\u003e\n.app-66692 {\n  /******************** Global Styles **************************/\n  /********************** App layout.hdbs and Header Styles *******************************/\n  /** Tabs Zendesk Styling **/\n  /******************** ZD Main Dashboard Styles **************************/\n  /* iPad in Landscape */\n  /************ Ticket Summary Popup Styles *********************/\n  /*********************** Ticket Summary Popup Styles END ******************/\n  /************************* ZD Dashboard Configuration tab styles ************************************/\n  /** ZD Dashboard Configuration equivalents for bootstrap-combined-min */\n  /******************** ZD SLA Assistant Styles *********************************/ }\n  .app-66692 header .logo {\n    background-image: url(\"/api/v2/apps/66692/assets/logo-small.png\"); }\n  .app-66692 header .logo {\n    background-image: url(\"/api/v2/apps/66692/assets/logo-small.png\"); }\n  .app-66692 header .logo:hover {\n    background-position: -2px -2px;\n    background-size: 29px; }\n  .app-66692 ul {\n    list-style-type: none; }\n  .app-66692 .loading {\n    opacity: 0.5; }\n  .app-66692 .loading_spinner {\n    display: none; }\n  .app-66692 .clear {\n    clear: both; }\n  .app-66692 .clearright {\n    clear: right; }\n  .app-66692 .hidden {\n    display: none; }\n  .app-66692 .invisible {\n    visibility: hidden; }\n  .app-66692 .cs_zd_sla .appinfo {\n    width: 320px; }\n  .app-66692 .cs_zd_sla .restrictioninfo {\n    position: relative;\n    top: -16px;\n    display: inline; }\n  .app-66692 .cs_zd_sla .tab_links {\n    display: inline-block;\n    margin: 12px 10px 0px 10px; }\n  .app-66692 .cs_zd_sla .tab_links a.active {\n    background-color: #FFF;\n    border-color: #EFEFEF;\n    border-bottom: 3px solid #78A300;\n    cursor: default;\n    font-weight: bold; }\n  .app-66692 .cs_zd_sla .tab_links a {\n    color: #343434;\n    font-weight: normal;\n    font-size: 13px;\n    border-radius: 0;\n    padding: 0 0 5px 0;\n    margin: 0 30px 0 0;\n    border-bottom: 3px solid transparent;\n    border: 1px solid transparent;\n    text-align: center;\n    text-align: center;\n    position: relative;\n    display: block;\n    float: left;\n    background: none; }\n  .app-66692 .dashheader.right {\n    margin-top: 10px;\n    margin-right: 60px; }\n  .app-66692 .dashheader.right span {\n    font-size: 13px; }\n  .app-66692 .dashheader.right a {\n    font-size: 14px;\n    font-weight: bold; }\n  .app-66692 .cs_zd_sla .tab {\n    margin: 5px 0 0 0; }\n  .app-66692 .tabbed_content {\n    height: 100%; }\n  .app-66692 section.main {\n    height: 100%; }\n  .app-66692 span.restricted b {\n    font-size: 14px;\n    color: black; }\n  .app-66692 .slaview {\n    width: 100%;\n    height: 100%; }\n  .app-66692 .slaview .viewheader {\n    margin: 0px 0px 25px 0;\n    width: 100%; }\n  .app-66692 .summary span {\n    font-size: 12px;\n    line-height: 16px;\n    font-weight: 300;\n    color: #999; }\n  .app-66692 .panel {\n    float: left;\n    position: relative; }\n  .app-66692 .panel.left {\n    width: 330px;\n    background-color: #f8f8f8;\n    height: 100%;\n    top: -10px;\n    left: -10px;\n    border-right: 1px solid #d5d5d5; }\n  .app-66692 .panel.collapsible {\n    -webkit-transition: width 1.0s ease;\n    -webkit-transition-delay: 0.0s;\n    -moz-transition: width 1.0s ease 0.0s;\n    -o-transition: width 1.0s ease 0.0s;\n    transition: width 1.0s ease 0.0s; }\n  .app-66692 .panel.left.collapsed {\n    width: 35px;\n    overflow: hidden; }\n  .app-66692 .panel.right {\n    padding: 0 1%;\n    width: auto;\n    width: initial;\n    height: 100%;\n    float: none;\n    margin-left: 330px;\n    position: relative;\n    -webkit-transition: margin-left 1.0s ease;\n    -webkit-transition-delay: 0.0s;\n    -moz-transition: margin-left 1.0s ease 0.0s;\n    -o-transition: margin-left 1.0s ease 0.0s;\n    transition: margin-left 1s ease 0s; }\n  .app-66692 .panel.right.collapsed {\n    margin-left: 35px;\n    -webkit-transition: margin-left 1.0s ease;\n    -webkit-transition-delay: 0.0s;\n    -moz-transition: margin-left 1.0s ease 0.0s;\n    -o-transition: margin-left 1.0s ease 0.0s;\n    transition: margin-left 1.0s ease 0.0s; }\n  .app-66692 .header {\n    background-color: transparent;\n    font-size: 12px;\n    color: #555;\n    font-weight: bold;\n    padding: 20px 20px 0px 30px; }\n  .app-66692 .header .inner {\n    border-bottom: 1px solid #ddd; }\n  .app-66692 .panel.left {\n    overflow-y: scroll; }\n  .app-66692 .panel.left h1 {\n    font-size: 12px;\n    color: #555;\n    font-weight: bold;\n    white-space: nowrap;\n    line-height: normal; }\n  .app-66692 .panel.left .header h1 {\n    float: left; }\n  .app-66692 .panel.right h1 {\n    font-size: 20px;\n    font-weight: bold; }\n  .app-66692 .header .actions {\n    float: right;\n    white-space: nowrap; }\n  .app-66692 .header button.refresh {\n    padding-right: 0px; }\n  .app-66692 .header button {\n    background-color: transparent;\n    opacity: 0.5; }\n  .app-66692 .header button:hover {\n    opacity: 1; }\n  .app-66692 .header button i.pin {\n    display: none; }\n  .app-66692 .collapsed .header button i.unpin {\n    display: none; }\n  .app-66692 .collapsed .header button i.pin {\n    display: inline-block; }\n  .app-66692 .collapsed .header h1 {\n    display: none; }\n  .app-66692 .collapsed button.refresh {\n    display: none; }\n  .app-66692 .collapsed .viewlist {\n    display: none; }\n  .app-66692 .collapsed .facets_section {\n    display: none; }\n  .app-66692 ul.viewlist {\n    padding: 15px;\n    margin: 0px; }\n  .app-66692 ul.viewlist li {\n    white-space: nowrap;\n    padding: 0px; }\n  .app-66692 ul.viewlist li:hover {\n    background-color: #ebebeb; }\n  .app-66692 ul.viewlist li a {\n    display: block;\n    padding: 9px 52px 9px 13px;\n    text-decoration: none;\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    color: #555555; }\n  .app-66692 .viewlist li.selected {\n    border-left: 3px solid #78a300;\n    background-color: #ebebeb;\n    color: #333;\n    font-weight: bold; }\n  .app-66692 .facets_section {\n    margin: 0px 20px 0px 30px; }\n  .app-66692 .facets {\n    margin-left: 1.0em; }\n  .app-66692 .facet_heading {\n    padding: 0px 0px; }\n  .app-66692 .facet_heading label.panelheader {\n    color: #c4c4c4;\n    font-weight: bold;\n    font-size: 11px;\n    letter-spacing: 1px;\n    display: inline; }\n  .app-66692 .facet_heading i {\n    opacity: 0.5;\n    margin-left: -16px; }\n  .app-66692 .facet_heading.separated {\n    border-top: 2px solid #ddd;\n    margin: 15px 0px 12px 0px; }\n  .app-66692 .facets_section .facet_heading.separated:first-child {\n    margin-top: 0px; }\n  .app-66692 .facet_group {\n    margin: 4px 0px 10px 0px; }\n  .app-66692 .facet {\n    padding: 3px 8px; }\n  .app-66692 .facet.selected {\n    background-color: #ebebeb;\n    cursor: auto;\n    font-weight: normal;\n    border-radius: 3px !important;\n    padding: 3px 8px 2px 8px; }\n  .app-66692 .facet:hover {\n    background-color: #ebebeb;\n    cursor: pointer;\n    border-radius: 5px; }\n  .app-66692 .facet .right {\n    float: right; }\n  .app-66692 .facet img {\n    width: 12px;\n    position: relative;\n    top: 1px;\n    padding-right: 5px;\n    display: none; }\n  .app-66692 .facet.selected img {\n    display: inline; }\n  .app-66692 #tickets_view_mode span:first-child {\n    color: #888;\n    font-weight: bold; }\n  .app-66692 #tickets_view_mode.facet:hover {\n    background-color: transparent;\n    cursor: default;\n    border-radius: 0px; }\n  .app-66692 .board {\n    padding: 0px;\n    margin: 10px;\n    height: 90%; }\n  .app-66692 .board .left {\n    float: left; }\n  .app-66692 .board .right {\n    float: right; }\n  .app-66692 .board .right:hover {\n    cursor: default; }\n  .app-66692 .entries_container {\n    width: 100%;\n    height: 100%; }\n  .app-66692 .entries_column {\n    float: left;\n    margin: 0 2% 0 0;\n    border: 1px solid;\n    border-radius: 5px;\n    padding: 1% 1.5%; }\n  .app-66692 .entries_column h1 {\n    text-align: center; }\n  .app-66692 .summary {\n    color: #888;\n    font-size: 14px; }\n  .app-66692 .summary span {\n    padding: 0px 3px; }\n  .app-66692 .summary img {\n    width: 12px; }\n  .app-66692 .ticket_summary i.icon-remove {\n    float: right;\n    padding: 4px;\n    opacity: 0.5;\n    position: relative;\n    top: 4px;\n    left: 4px; }\n  .app-66692 ul.entries {\n    margin: 0px; }\n  .app-66692 .scroll_entries {\n    overflow: auto;\n    padding-right: 5px; }\n  .app-66692 .col_fragment.middle {\n    height: 32px;\n    padding: 20px 0px; }\n  .app-66692 .col_fragment.top.clear {\n    margin-bottom: 10px; }\n  .app-66692 .entry_box {\n    padding: 10px 0 10px 12px;\n    position: relative;\n    width: auto;\n    height: 80%; }\n  .app-66692 .entry_box .statusbar {\n    height: 100%;\n    float: left;\n    margin-left: -11px;\n    margin-right: 6px; }\n  .app-66692 .entry_box .leftcol, .app-66692 .entry_box .midcol {\n    float: left; }\n  .app-66692 .entry_box .rightcol {\n    float: right;\n    position: relative;\n    z-index: 999; }\n  .app-66692 .entry_box .leftcol div.title {\n    margin: 2px 0px; }\n  .app-66692 .entry_box .title a {\n    color: #000000; }\n  .app-66692 .entry_box .title a:hover {\n    color: #146eaa; }\n  .app-66692 .entry_box .leftcol .org {\n    margin: 1px 0px;\n    font-size: 13px; }\n  .app-66692 .entry_box .leftcol .org a {\n    color: #999; }\n  .app-66692 .entry_box .leftcol .org a:hover {\n    color: #146eaa; }\n  .app-66692 .entry_box .leftcol .req {\n    font-size: 11px; }\n  .app-66692 .entry_box .leftcol .req a {\n    color: #999; }\n  .app-66692 .entry_box .leftcol .req a:hover {\n    color: #146eaa; }\n  .app-66692 .entry_box .rightcol .time {\n    height: 30px; }\n  .app-66692 .statusbar .component {\n    background-color: #000000;\n    width: 8px;\n    height: 50%; }\n  .app-66692 li.violated .statusbar .component {\n    background-color: #ac1b14; }\n  .app-66692 li.warned .statusbar .component {\n    background-color: #d9bf38; }\n  .app-66692 li.warnedviolated .statusbar .component.upper {\n    background-color: #d9bf38;\n    height: 48%;\n    margin-bottom: 30%; }\n  .app-66692 li.warnedviolated .statusbar .component.lower {\n    background-color: #ac1b14;\n    height: 48%; }\n  .app-66692 li.warnedwarned.statusbar .component.upper {\n    background-color: #d9bf38;\n    height: 48%;\n    margin-bottom: 30%; }\n  .app-66692 li.warnedwarned .statusbar .component.lower {\n    background-color: #d9bf38;\n    height: 48%; }\n  .app-66692 li.violatedviolated .statusbar .component.upper {\n    background-color: #ac1b14;\n    height: 48%;\n    margin-bottom: 30%; }\n  .app-66692 li.violatedviolated .statusbar .component.lower {\n    background-color: #ac1b14;\n    height: 48%; }\n  .app-66692 .entries li {\n    height: 72px; }\n  .app-66692 .entry_box .line {\n    padding: 4px 0px 4px 0px; }\n  .app-66692 .title {\n    font-size: 14px;\n    font-weight: bold;\n    font-family: Arial; }\n  .app-66692 .eventname {\n    padding: 2px 8px 2px 8px;\n    background-color: #ebebeb;\n    color: black;\n    border-radius: 3px; }\n  .app-66692 .timeleft {\n    padding: 2px 5px 2px 5px;\n    background-color: #000000;\n    color: white;\n    border-radius: 3px; }\n  .app-66692 .timeleft img {\n    height: 12px;\n    padding-right: 3px;\n    position: relative;\n    top: 1px; }\n  .app-66692 .timer {\n    background-color: #64CEFC;\n    border-radius: 5px;\n    padding: 2px 6px;\n    min-width: 160px; }\n  .app-66692 h4.countdown {\n    color: white;\n    text-align: center;\n    font-family: arial;\n    font-size: 14px;\n    line-height: 32px;\n    white-space: nowrap; }\n  .app-66692 span.late {\n    color: #FF6666;\n    font-weight: bold; }\n  .app-66692 .slaview {\n    width: 100% !important; }\n  .app-66692 .entries_column.col1 {\n    width: 26%; }\n  .app-66692 .entries_column.col2 {\n    width: 34%; }\n  .app-66692 .entries_column.col3 {\n    width: 26%;\n    margin-right: 0; }\n  .app-66692 .paler {\n    border-color: #AAA; }\n  .app-66692 .paler h1, .app-66692 .paler .summary, .app-66692 .paler .col_fragment.middle {\n    opacity: 0.6; }\n  .app-66692 .paler .scroll_entries {\n    opacity: 0.85; }\n  .app-66692 .col_fragment.middle {\n    background: url(\"/api/v2/apps/66692/assets/colsplitter.png\") center center no-repeat;\n    height: 40px;\n    padding: 0;\n    margin: 5px 0; }\n  .app-66692 .entry_box .leftcol {\n    float: none;\n    position: relative;\n    top: 0;\n    left: 0;\n    width: auto;\n    width: initial; }\n  .app-66692 .entry_box .leftcol div.title {\n    margin: 2px 0px;\n    width: auto;\n    height: 20px;\n    overflow: hidden; }\n  .app-66692 .entry_box .rightcol {\n    float: right;\n    margin-left: 10px; }\n  .app-66692 .col_fragment.middle, .app-66692 col_fragment.middle img {\n    width: 100%; }\n  .app-66692 .viewheader .right {\n    width: auto;\n    text-align: right;\n    margin-right: 6px; }\n  .app-66692 .title a, .app-66692 .org a, .app-66692 .req a {\n    width: auto;\n    display: block;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .app-66692 .facet_list {\n    overflow-y: auto; }\n  .app-66692 .expansionbuttons {\n    border-top: 1px dotted #D5D5D5;\n    margin: 10px 0px 0px 18px;\n    padding-top: 5px; }\n  .app-66692 .expansionbutton {\n    margin: 0px 3px;\n    opacity: 0.8; }\n  .app-66692 .expansionbutton:hover {\n    opacity: 1;\n    cursor: pointer; }\n  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: landscape) {\n    .app-66692 .entries_column.col1 {\n      width: 28.5%; }\n    .app-66692 .entries_column.col2 {\n      width: 28.5%; }\n    .app-66692 .entries_column.col3 {\n      width: 28.5%; } }\n  @media (max-width: 1024px) {\n    .app-66692 .entries_column.col1 {\n      width: 28.5%; }\n    .app-66692 .entries_column.col2 {\n      width: 28.5%; }\n    .app-66692 .entries_column.col3 {\n      width: 28.5%; } }\n  .app-66692 .ticket_summary .popover-inner {\n    width: 550px;\n    border-radius: 5px;\n    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);\n    border: 1px solid #ddd; }\n  .app-66692 .ticket_summary .priority {\n    text-transform: lowercase; }\n  .app-66692 .ticket_summary .priority.priority_- {\n    display: none; }\n  .app-66692 .ticket_summary .priority.priority_high {\n    color: #555; }\n  .app-66692 .ticket_summary .priority.priority_urgent {\n    color: #555;\n    font-weight: bold; }\n  .app-66692 .ticket_summary h3 {\n    font-weight: normal;\n    color: #999;\n    font-size: 12px;\n    padding: 21px 0 0 20px;\n    border-bottom-width: 0;\n    background-color: #ffffff; }\n  .app-66692 .ticket_summary h3 .details {\n    padding-left: 10px;\n    vertical-align: middle; }\n  .app-66692 .ticket_summary .popover-content {\n    padding: 13px 20px 20px 20px;\n    color: #555;\n    word-wrap: break-word; }\n  .app-66692 .ticket_summary .popover-content p {\n    white-space: normal;\n    padding-bottom: 2px;\n    color: #333;\n    font-weight: bold;\n    line-height: 16px; }\n  .app-66692 .ticket_summary .last-comment-subhead {\n    margin: 17px 0 11px 0;\n    line-height: 16px; }\n  .app-66692 .ticket_summary .comment-subhead {\n    margin-bottom: 5px;\n    height: 13px; }\n  .app-66692 .ticket_summary .author {\n    font-weight: bold; }\n  .app-66692 #cs_configuration {\n    margin: 10px 16px 0px;\n    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Tahoma, Verdana, sans-serif;\n    font-size: 13px; }\n  .app-66692 #cs_configuration input[type=checkbox] {\n    margin: 0 8px 0 0; }\n  .app-66692 #cs_configuration input[type=\"checkbox\"]:focus {\n    box-shadow: none; }\n  .app-66692 #cs_configuration #no_slas {\n    border-bottom: 1px dotted #CCC;\n    padding: 10px 0px 20px 0px; }\n  .app-66692 #cs_configuration #no_slas label {\n    font-size: 14px;\n    color: #EA8006; }\n  .app-66692 .two_column .form_element {\n    border-bottom: 1px dotted #CCC;\n    padding: 17px 0; }\n  .app-66692 .two_column .form_element .sla_label {\n    line-height: 17px;\n    float: left;\n    padding-top: 3px;\n    width: 170px;\n    color: #4C4C4C;\n    white-space: normal;\n    font-weight: bold;\n    font-size: 13px; }\n  .app-66692 .two_column .form_element .form_field {\n    margin-left: 180px;\n    width: 920px;\n    float: none; }\n  .app-66692 .two_column .form_element .form_field label {\n    color: #333333; }\n  .app-66692 .two_column .form_element .sub_field {\n    margin-top: 10px;\n    padding-top: 10px;\n    border-top: 1px dotted #CCC; }\n  .app-66692 .two_column .form_element .form_field p {\n    color: #666;\n    font-size: 12px;\n    line-height: 17px;\n    padding: 5px 0 3px 0; }\n  .app-66692 .columnspec:first-child {\n    border-left: #ccc 1px solid;\n    padding-left: 15px; }\n  .app-66692 .columnspec {\n    float: left;\n    margin-right: 15px;\n    padding-right: 15px;\n    border-right: #ccc 1px solid; }\n  .app-66692 .columnspec label {\n    display: inline-block;\n    width: 50px; }\n  .app-66692 .facet_panel label {\n    display: inline-block;\n    width: 175px; }\n  .app-66692 .range {\n    margin: 20px 0px; }\n  .app-66692 #cs_configuration .range .units {\n    width: 82px;\n    position: relative;\n    top: 4px;\n    right: 4px;\n    height: 30px; }\n  .app-66692 .columnspec .range input {\n    margin-right: 10px; }\n  .app-66692 .columnspec input[type='text'] {\n    position: relative;\n    top: 4px; }\n  .app-66692 .columnspec input[type='text'].coltitle {\n    height: 32px;\n    width: 200px; }\n  .app-66692 .columnspec input[type='text'].collabel {\n    height: 24px;\n    width: 200px; }\n  .app-66692 .form_field p {\n    margin: 10px 0px 0px 0px; }\n  .app-66692 .form_field p.compact {\n    margin-top: 0px; }\n  .app-66692 .hours {\n    width: 30px; }\n  .app-66692 #cs_configuration .facet_group {\n    float: left;\n    padding: 5px 20px 15px 20px;\n    background-color: #F8F8F8;\n    margin-right: 60px;\n    border-radius: 5px; }\n  .app-66692 #cs_configuration .facet_group label {\n    font-style: italic;\n    margin-bottom: 10px;\n    font-weight: bold; }\n  .app-66692 #cs_configuration label {\n    font-size: 13px;\n    cursor: default;\n    margin-bottom: 5px; }\n  .app-66692 .button {\n    padding: 7px 14px;\n    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Tahoma, Verdana, sans-serif;\n    font-size: 13px;\n    font-weight: bold;\n    line-height: normal;\n    -webkit-border-radius: 5px;\n    -moz-border-radius: 5px;\n    border-radius: 5px;\n    color: #fff;\n    text-shadow: inherit;\n    background-color: #757575;\n    margin-bottom: 10px; }\n  .app-66692 .btnw {\n    min-width: 70px; }\n  .app-66692 .save {\n    background-color: #404040;\n    float: right; }\n  .app-66692 #cs_configuration .savemsg {\n    float: left;\n    font-size: 14px; }\n  .app-66692 #cs_configuration .savemsg.success {\n    color: green;\n    margin-left: 100px; }\n  .app-66692 #cs_configuration .savemsg.error {\n    color: #c14445;\n    margin-left: 200px; }\n  .app-66692 #cs_configuration label.firstconfig {\n    color: blue; }\n  .app-66692 #cs_configuration label.firstconfig button {\n    width: 40px;\n    height: 25px;\n    font-size: 10px;\n    padding: 1px;\n    background-color: #404040;\n    margin: 0px 5px; }\n  .app-66692 #cs_configuration {\n    color: #333333; }\n  .app-66692 #cs_configuration h4 {\n    font-size: 17.5px; }\n  .app-66692 #cs_configuration h4 {\n    margin: 10px 0;\n    font-family: inherit;\n    font-weight: bold;\n    line-height: 20px;\n    color: inherit;\n    text-rendering: optimizelegibility; }\n  .app-66692 #cs_configuration select {\n    width: 220px;\n    border: 1px solid #cccccc;\n    background-color: #ffffff; }\n  .app-66692 #cs_configuration select {\n    line-height: 30px; }\n  .app-66692 #cs_configuration select {\n    display: inline-block;\n    height: 20px;\n    padding: 4px 6px;\n    margin-bottom: 10px;\n    font-size: 14px;\n    line-height: 20px;\n    color: #555555;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    vertical-align: middle; }\n  .app-66692 #cs_configuration input[type=\"text\"] {\n    display: inline-block;\n    height: 20px;\n    padding: 4px 6px;\n    margin-bottom: 10px;\n    font-size: 14px;\n    line-height: 20px;\n    color: #555555;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    vertical-align: middle; }\n  .app-66692 #cs_configuration input[type=\"text\"] {\n    background-color: #ffffff;\n    border: 1px solid #cccccc;\n    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n    -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n    -webkit-transition: border linear .2s, box-shadow linear .2s;\n    -moz-transition: border linear .2s, box-shadow linear .2s;\n    -o-transition: border linear .2s, box-shadow linear .2s;\n    transition: border linear .2s, box-shadow linear .2s; }\n  .app-66692 #cs_not_configured_dashboard {\n    margin-top: 50px;\n    text-align: center; }\n  .app-66692 .sla_mgt h3 {\n    line-height: 30px; }\n  .app-66692 .sla_mgt p {\n    line-height: 15px; }\n  .app-66692 .sla_mgt .logo {\n    background: transparent url(\"/api/v2/apps/66692/assets/logo-small.png\") no-repeat;\n    background-size: 25px 25px;\n    float: right;\n    height: 25px;\n    width: 25px; }\n  .app-66692 .sla_mgt li + li {\n    margin-top: 0.4em; }\n  .app-66692 .hide {\n    display: none; }\n  .app-66692 .left {\n    float: left; }\n  .app-66692 .right {\n    float: right; }\n  .app-66692 div.content-sla {\n    color: #484a36;\n    float: left;\n    font-weight: bold;\n    margin: 0px 0px 0px 0px;\n    width: 100%;\n    line-height: 15px; }\n  .app-66692 div.supplementary-sla {\n    background-color: gainsboro; }\n  .app-66692 div.sla-head {\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    padding: 0 5px;\n    height: 30px;\n    width: 308px;\n    border-width: 1px;\n    border-style: solid;\n    border-color: #ddd; }\n  .app-66692 div.sla-stats {\n    -moz-border-radius: 8px;\n    -webkit-border-radius: 8px;\n    border-radius: 8px;\n    padding: 5px 10px;\n    text-align: center;\n    margin-top: 5px;\n    min-height: 28px; }\n  .app-66692 div.sla-statsy {\n    clear: both; }\n  .app-66692 div.sla-vertical {\n    margin-left: 146px;\n    width: 1px;\n    height: 15px;\n    border-left: 1px solid #ddd;\n    clear: both; }\n  .app-66692 div.sla-circle {\n    -moz-border-radius: 50%;\n    -webkit-border-radius: 50%;\n    border-radius: 50%;\n    border: 1px solid #ddd; }\n  .app-66692 div.sla-indent {\n    margin-left: 132px; }\n  .app-66692 div.sla-square {\n    border: 1px solid #ddd; }\n  .app-66692 div.sla-stats div {\n    display: block;\n    font-size: 10px;\n    font-weight: normal;\n    margin: 2px 0; }\n  .app-66692 div.sla-statsy div {\n    display: block;\n    font-size: 10px;\n    font-weight: normal; }\n  .app-66692 div.paused-sla div.day {\n    text-align: center;\n    height: 20px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    border: 1px solid #78A300;\n    background-color: #ffffff;\n    width: 123px;\n    float: left;\n    font-size: 12px;\n    padding: 4px 0 2px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    margin-top: 2px;\n    color: #78A300; }\n  .app-66692 div.paused-sla div.arrow {\n    float: left;\n    margin-top: 8px;\n    width: 0;\n    height: 0;\n    border-left: 10px solid #78A300;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent; }\n  .app-66692 div.late-sla div.day {\n    text-align: center;\n    height: 20px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    background-color: #BD322C;\n    width: 123px;\n    float: left;\n    font-size: 12px;\n    padding: 4px 0 2px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    margin-top: 2px;\n    color: white; }\n  .app-66692 div.late-sla div.arrow {\n    float: left;\n    margin-top: 8px;\n    width: 0;\n    height: 0;\n    border-left: 10px solid #BD322C;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent; }\n  .app-66692 div.warn-sla div.day {\n    text-align: center;\n    height: 20px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    background-color: #d9bf38;\n    width: 123px;\n    float: left;\n    font-size: 12px;\n    padding: 4px 0 2px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    margin-top: 2px;\n    color: white; }\n  .app-66692 div.warn-sla div.arrow {\n    float: left;\n    margin-top: 8px;\n    width: 0;\n    height: 0;\n    border-left: 10px solid #d9bf38;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent; }\n  .app-66692 div.active-sla div.day {\n    text-align: center;\n    height: 20px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    background-color: #78A300;\n    width: 123px;\n    float: left;\n    font-size: 12px;\n    padding: 4px 0 2px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    margin-top: 2px;\n    color: white; }\n  .app-66692 div.active-sla div.arrow {\n    float: left;\n    margin-top: 8px;\n    width: 0;\n    height: 0;\n    border-left: 10px solid #78A300;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent; }\n  .app-66692 div.sla-statsy div.data {\n    float: left;\n    font-weight: bold;\n    font-size: 12px;\n    padding: 3px;\n    margin-top: 2px;\n    width: 150px; }\n  .app-66692 div.sla-statsy div.data div.sla-paused {\n    font-size: 13px;\n    text-align: center;\n    font-weight: bold; }\n  .app-66692 div.sla-statsy div.data div.time {\n    font-size: 13px;\n    float: left;\n    font-weight: bold; }\n  .app-66692 div.sla-statsy div.data div.tz {\n    font-size: 9px;\n    float: left;\n    margin-left: 2px;\n    padding-top: 1px; }\n  .app-66692 div.sla-statsy div.data div.date {\n    font-size: 13px;\n    float: right;\n    font-weight: bold; }\n  .app-66692 div.sla-statsy div.sla-pc {\n    cursor: auto;\n    width: 26px;\n    height: 22px;\n    padding-top: 4px;\n    float: left;\n    font-weight: bold;\n    font-size: 12px;\n    text-align: center;\n    color: #749849; }\n  .app-66692 div.sla-statsy div.title {\n    float: right;\n    font-size: 11px;\n    margin-left: 3px;\n    padding: 8px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    text-align: left; }\n  .app-66692 div.sla-statsy div.value {\n    max-width: 135px;\n    float: left;\n    height: 15px;\n    margin-top: 5px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    font-weight: bold;\n    font-size: 9px;\n    padding: 2px 5px;\n    overflow: hidden;\n    text-align: center;\n    text-transform: uppercase;\n    color: white;\n    background-color: #777; }\n  .app-66692 div.sla-statsy div.titleb {\n    float: right;\n    font-size: 11px;\n    margin-left: 3px;\n    padding: 8px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    text-align: right; }\n  .app-66692 div.sla-statsy div.valueb {\n    max-width: 85px;\n    float: right;\n    height: 15px;\n    margin-top: 5px;\n    -moz-border-radius: 4px;\n    -webkit-border-radius: 4px;\n    border-radius: 4px;\n    font-weight: bold;\n    font-size: 9px;\n    padding: 2px 5px;\n    overflow: hidden;\n    text-align: center;\n    text-transform: uppercase;\n    color: white;\n    background-color: #aaa; }\n  .app-66692 div.killed div.data, .app-66692 div.retro div.data, .app-66692 div.finished div.data {\n    color: #999; }\n  .app-66692 .sla-active-field {\n    cursor: pointer;\n    color: #1A6690; }\n  .app-66692 .data .smallfont {\n    font-size: 0.75em;\n    font-weight: normal; }\n  .app-66692 div.sla-istats {\n    -moz-border-radius: 8px 8px 8px 8px;\n    background-color: #e9e9e9;\n    padding: 3px;\n    text-align: left;\n    clear: both; }\n  .app-66692 div.sla-istats div {\n    font-size: 10px;\n    font-weight: normal;\n    margin: 5px 0; }\n  .app-66692 div.sla-istats div.day {\n    font-size: 12px;\n    padding: 0px 3px;\n    margin-right: 15px; }\n  .app-66692 div.sla-istats div.data {\n    font-weight: bold;\n    font-size: 12px;\n    -moz-border-radius: 4px 4px 4px 4px;\n    padding: 3px;\n    background-color: #cccccc; }\n  .app-66692 .slad-title {\n    font-size: 16px;\n    line-height: 30px;\n    height: 30px;\n    width: 100%; }\n  .app-66692 .slad-headerline {\n    clear: both;\n    font-weight: bold;\n    font-size: 13px;\n    height: 30px;\n    line-height: 30px;\n    margin-bottom: 8px; }\n  .app-66692 .slad-dummy {\n    float: left;\n    height: 30px;\n    width: 100px;\n    padding-left: 5px; }\n  .app-66692 .slad-eventname {\n    float: left;\n    height: 30px;\n    width: 100px;\n    background-color: #ffffff;\n    border-radius: 3px;\n    -moz-border-radius: 3px;\n    -webkit-border-radius: 3px;\n    padding-left: 5px;\n    overflow: hidden; }\n  .app-66692 .slad-priority {\n    float: left;\n    text-align: center;\n    margin-left: 10px;\n    height: 30px;\n    width: 100px; }\n  .app-66692 .slad-row {\n    clear: both;\n    font-size: 12px;\n    height: 30px;\n    line-height: 30px;\n    margin-bottom: 5px; }\n\u003c/style\u003e\n\u003cheader class=\"cs_zd_sla\"\u003e\n  \u003cdiv class=\"appinfo left\"\u003e\n    \u003ca href=\"https://www.cloudset.net\" target=\"_blank\" class=\"logo\"\u003e\u003c/a\u003e\n    \u003ch3 id=\"sla3title\"\u003e{{setting \"name\"}}\u003c/h3\u003e\n    \u003cnav class=\"btn-group\"\u003e\n      \u003cbutton id=\"cs_dashboard_tab\" class=\"btn tab active _tooltip hide\" data-toggle='tooltip' data-placement='bottom' data-original-title='{{setting \"name\"}}' data-tab-content=\"cs_dashboard\"\u003e{{t \"dash.dashboard\"}}\u003c/button\u003e\n      \u003cbutton id=\"cs_configuration_tab\" class=\"btn tab hide\" data-tab-content=\"cs_configuration\"\u003e{{t \"dash.configure\"}}\u003c/button\u003e\n    \u003c/nav\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"dashheader right\"\u003e\n     \u003cspan class=\"restricted _tooltip\" data-toggle='tooltip' data-placement='bottom' data-original-title='{{t \"dash.restrictions\"}}'\u003e\u003c/span\u003e\u003cspan\u003e - \u003ca href=\"http://www.sla-m.net\" target=\"_blank\"\u003e{{t \"dash.upgradebenefits\"}}\u003c/a\u003e\u003c/span\u003e\n \u003c/div\u003e\n\u003c/header\u003e\n\u003cdiv class=\"loading_spinner\"\u003e{{spinner}}\u003c/div\u003e\n\u003cdiv class=\"tabbed_content\"\u003e\n  \u003csection id=\"cs_dashboard\" class=\"main tabbed\" data-main\u003e\u003c/section\u003e\n  \u003csection id=\"cs_configuration\" class=\"admin tabbed hide\"\u003e\u003c/section\u003e\n\u003c/div\u003e","nosla":"  \u003cdiv class=\"sla-vertical\"\u003e\u003c/div\u003e\r\n  \u003cdiv class=\"sla-statsy\"\u003e\r\n    \u003cdiv class=\"sla-indent sla-tc sla-circle\"\u003e\u0026nbsp;\u003c/div\u003e\r\n  \u003c/div\u003e","notconfigured":"\u003cdiv id=\"cs_not_configured_dashboard\" class=\"slaview tab_content\"\u003e\n  \u003ch3\u003eThe dashboard is currently disabled awaiting configuration by an Administrator\u003c/h3\u003e\n\u003c/div\u003e\n\n\n\n","ticketsummary":"\u003cdiv class=\"ember-view popover ticket_summary\" style=\"bottom: auto; opacity: 1;\"\u003e\r\n  \u003cdiv class=\"popover-inner\" style=\"max-height: 368px;\"\u003e\r\n    \u003ci class=\"icon-remove\"\u003e\u003c/i\u003e\r\n    \u003ch3 class=\"popover-title\"\u003e\r\n      \u003cspan class=\"ticket_status_label small {{this.status}}\"\u003e{{this.displaystatus}}\u003c/span\u003e\u003cspan class=\"details\"\u003e\u003cspan class=\"ticketid\"\u003eTicket\r\n          #{{this.ticket.id}} \u003c/span\u003e\u003cspan class=\"priority priority_urgent\"\u003e({{this.ticket.priority}})\u003c/span\u003e \u003c/span\u003e\r\n    \u003c/h3\u003e\r\n    \u003cdiv class=\"popover-content\"\u003e\r\n      \u003cp class=\"subj\"\u003e{{this.ticket.subject}}\u003c/p\u003e\r\n      \u003cdiv class=\"comment desc\"\u003e{{this.ticket.description}}\u003c/div\u003e\r\n      \u003cdiv class=\"latest-comment {{this.showlatestcomment}}\"\u003e\r\n        \u003cdiv class=\"last-comment-header\"\u003e\r\n          \u003cspan\u003eLatest comment\u003c/span\u003e\r\n        \u003c/div\u003e\r\n        \u003cdiv class=\"last-comment-subhead\"\u003e\r\n          \u003cspan class=\"author\"\u003e{{this.latestcomment.author_name}}\u003c/span\u003e \r\n          \u003cspan class=\"summary-date\"\u003e\r\n            \u003cdiv\u003e\r\n              \u003ctime class=\"live\" datetime=\"{{this.latestcomment.created_at}}\" title=\"{{this.latestcomment.created_at_display}}\"\u003e{{this.latestcomment.created_at_display}}\u003c/time\u003e\r\n            \u003c/div\u003e\r\n          \u003c/span\u003e\r\n        \u003c/div\u003e\r\n        \u003cdiv class=\"comment\"\u003e{{this.latestcomment.body}}\u003c/div\u003e\r\n      \u003c/div\u003e\r\n    \u003c/div\u003e\r\n  \u003c/div\u003e\r\n\u003c/div\u003e"},
      frameworkVersion: "1.0"
    });

  ZendeskApps["SLA-M Dashboard"] = app;
}

    with( ZendeskApps.AppScope.create() ) {

  var source = /*globals performance:false */
(function() {
  'use_strict';

  function getTick() {
    // for newer browsers rely on performance.now()
    if (typeof performance !== 'undefined' && performance.now) {
      return Math.floor(performance.now());
    }

    // Otherwise fall back on Date.
    return (new Date()).valueOf();
  }

  return {
    SETUP_INFO: 'https://support.zendesk.com/entries/69791168-Setting-up-the-Time-Tracking-app',

    storage: {},

    requests: {
      fetchAuditsPage: function(url) {
        return {
          url: url || helpers.fmt(
            '/api/v2/tickets/%@/audits.json?include=users',
            this.ticket().id()
          )
        };
      },
      fetchTicketForms: function(url) {
        return {
          url: url || '/api/v2/ticket_forms.json'
        };
      }
    },

    events: {
      'app.created'             : 'onAppCreated',
      'app.activated'           : 'onAppActivated',
      'app.deactivated'         : 'onAppFocusOut',
      'app.willDestroy'         : 'onAppWillDestroy',
      'ticket.save'             : 'onTicketSave',
      'ticket.submit.done'      : 'onTicketSubmitDone',
      '*.changed'               : 'onAnyTicketFieldChanged',
      'ticket.updated'          : 'onTicketUpdated',
      'fetchAuditsPage.done'    : 'onFetchAuditsPageDone',
      'fetchAllAudits.done'     : 'onFetchAllAuditsDone',
      'click .pause'            : 'onPauseClicked',
      'click .play'             : 'onPlayClicked',
      'click .reset'            : 'onResetClicked',
      'click .modal-save'       : 'onModalSaveClicked',
      'shown .modal'            : 'onModalShown',
      'hidden .modal'           : 'onModalHidden',
      'click .expand-bar'       : 'onTimelogsClicked'
    },

    /*
     *
     *  EVENT CALLBACKS
     *
     */
    onAppCreated: function() {
      if (this.installationId()) {
        var totalTimeField = this.requirement('total_time_field'),
            timeLastUpdateField = this.requirement('time_last_update_field');
        this.storage.totalTimeFieldId = totalTimeField && totalTimeField.requirement_id;
        this.storage.timeFieldId = timeLastUpdateField && timeLastUpdateField.requirement_id;

        this.initialize();
      } else {
        _.defer(this.initialize.bind(this));
        this.storage.totalTimeFieldId = parseInt(this.setting('total_time_field_id'), 10);
        this.storage.timeFieldId = parseInt(this.setting('time_field_id'), 10);
      }
      if (this.setting('hide_from_agents') && this.currentUser().role() !== 'admin') {
        this.hide();
      }
    },

    onAppActivated: function(app) {
      if (!app.firstLoad) {
        this.onAppFocusIn();
      }
    },

    onAppWillDestroy: function() {
      clearInterval(this.timeLoopID);
    },

    onAppFocusOut: function() {
      if (this.setting('auto_pause_resume')) {
        this.autoPause();
      }
    },

    onAppFocusIn: function() {
      if (this.setting('auto_pause_resume') && !this.manuallyPaused) {
        this.autoResume();
      }
    },

    onAnyTicketFieldChanged: function() {
      _.defer(this.hideFields.bind(this));
    },

    onTicketSave: function() {
      if (this.setting('time_submission') && this.visible()) {
        return this.promise(function(done, fail) {
          this.saveHookPromiseDone = done;
          this.saveHookPromiseFail = fail;

          this.renderTimeModal();
        }.bind(this));
      } else {
        this.updateTime(this.elapsedTime());

        return true;
      }
    },

    onTicketSubmitDone: function() {
      this.resetElapsedTime();
      _.delay(this.getTimelogs.bind(this), 1000);
    },

    onTicketUpdated: function(updatedBy) {
      if (updatedBy.id() !== this.currentUser().id()) {
        this.getTimelogs();
      }
    },

    onFetchAllAuditsDone: function() {
      var status = "",
          timeDiff,
          isFollowUp = _.reduce(this.store('audits'), function(isFollowUp, audit) {
            return isFollowUp || (audit.via && audit.via.source && audit.via.source.rel === 'follow_up');
          }, false);

      if (isFollowUp) {
        var audits = this.store('audits'),
            isThisEvent = function(event) {
              return event.field_name == this.storage.totalTimeFieldId;
            };
        for (var i = 0; i < audits.length; i++) {
          var audit = audits[i],
              totalTimeEvent = _.find(audit.events, isThisEvent, this);

          if (totalTimeEvent) break;

          /* If we got to the last one without breaking out so far, we can reset it */
          if (i === audits.length - 1) {
            this.totalTime('0');
          }
        }
      }

      var timelogs = _.reduce(this.store('audits'), function(memo, audit) {
            var newStatus = _.find(audit.events, function(event) {
                  return event.field_name == 'status';
                }, this),
                auditEvent = _.find(audit.events, function(event) {
                  return event.field_name == this.storage.totalTimeFieldId;
                }, this);

            if (newStatus) {
              status = newStatus.value;
            }

            if (auditEvent) {
              if (!memo.length) {
                auditEvent.previous_value = 0;
              }
              timeDiff = auditEvent.value - (auditEvent.previous_value || 0);
              memo.push({
                time: this.TimeHelper.secondsToTimeString(parseInt(timeDiff, 10)),
                date: new Date(audit.created_at).toLocaleString(),
                status: status,
                // Guard around i18n status because some old apps don't have this
                localized_status: status ? this.I18n.t(helpers.fmt('statuses.%@', status)) : "",
                user: _.find(this.store('users'), function(user) {
                  return user.id === audit.author_id;
                })
              });
            }

            return memo;
          }, [], this);

      this.renderTimelogs(timelogs.reverse());
    },

    onPauseClicked: function(e) {
      var $el = this.$(e.currentTarget);

      $el.find('i').addClass('active');
      this.$('.play i').removeClass('active');

      this.manuallyPaused = this.paused = true;
    },

    onPlayClicked: function(e) {
      var $el = this.$(e.currentTarget);

      $el.find('i').addClass('active');
      this.$('.pause i').removeClass('active');

      this.manuallyPaused = this.paused = false;
    },

    onResetClicked: function() {
      this.resetElapsedTime();
    },

    onTimelogsClicked: function() {
      this.$('.timelogs-container').slideToggle();
      this.$('.expand-bar').toggleClass('expanded');
    },

    onModalSaveClicked: function() {
      var timeString = this.$('.modal-time').val();

      try {
        this.updateTime(this.TimeHelper.timeStringToSeconds(timeString, this.setting('simple_submission')));
        this.saveHookPromiseIsDone = true; // Flag that saveHookPromiseDone is gonna be called after hiding the modal
        this.$('.modal').modal('hide');
        this.saveHookPromiseDone();
      } catch (e) {
        if (e.message == 'bad_time_format') {
          services.notify(this.I18n.t('errors.bad_time_format'), 'error');
        } else {
          throw e;
        }
      }
    },

    onModalShown: function() {
      var timeout = 15,
          $timeout = this.$('span.modal-timer'),
          $modal = this.$('.modal');

      this.modalTimeoutID = setInterval(function() {
        timeout -= 1;

        $timeout.html(timeout);

        if (timeout === 0) {
          $modal.modal('hide');
        }
      }.bind(this), 1000);

      $modal.find('.modal-save').focus();
    },

    onModalHidden: function() {
      clearInterval(this.modalTimeoutID);

      if (!this.saveHookPromiseIsDone) {
        this.saveHookPromiseFail(this.I18n.t('errors.save_hook'));
      }
    },

    /*
     *
     * METHODS
     *
     */

    checkForms: (function() {
      var forms = [];

      function fetch(url) {
        this.ajax('fetchTicketForms', url).done(callback.bind(this));
      }

      function callback(data) {
        forms.push.apply(forms, data.ticket_forms);

        if (data.next_page) {
          fetch.call(this, data.next_page);
        } else {
          var requiredTicketFieldIds = [
                this.storage.timeFieldId,
                this.storage.totalTimeFieldId
              ];

          forms = _.filter(forms, function(form) {
            return form.active;
          });

          var valid = _.all(forms, function(form) {
            return _.intersection(form.ticket_field_ids, requiredTicketFieldIds).length === requiredTicketFieldIds.length;
          });

          if (!valid) {
            this.switchTo('setup_info', { link: this.SETUP_INFO });
            this.$('.expand-bar').remove();
            this.onAppWillDestroy();
          }
        }
      }

      return function() {
        if (!this.ticket().form().id()) { return; }

        fetch.call(this);
      };
    })(),

    initialize: function() {
      this.getTimelogs();
      this.hideFields();
      this.checkForms();

      this.timeLoopID = this.setTimeLoop();

      this.switchTo('main', {
        manualPauseResume: this.setting('manual_pause_resume'),
        displayReset: this.setting('reset'),
        displayTimelogs: this.isTimelogsEnabled()
      });
    },

    fetchAllAudits: function(url, data, callback) {
      this.store('audits', []);
      this.store('users', []);
      this.ajax('fetchAuditsPage');
    },

    onFetchAuditsPageDone: function(data) {
      this.store('audits', this.store('audits').concat(data.audits));
      this.store('users', this.store('users').concat(data.users));

      if (!data.next_page) {
        this.trigger('fetchAllAudits.done');
      } else {
        this.ajax('fetchAuditsPage', data.next_page);
      }
    },

    getTimelogs: function() {
      if (this.isTimelogsEnabled()) { this.fetchAllAudits(); }
    },

    updateMainView: function(time) {
      this.$('.live-timer').html(this.TimeHelper.secondsToTimeString(time));
      this.$('.live-totaltimer').html(this.TimeHelper.secondsToTimeString(
        this.totalTime() + time
      ));
    },

    renderTimelogs: function(timelogs) {
      this.$('.timelogs-container')
        .html(this.renderTemplate('timelogs', {
          timelogs: timelogs
        }));

      this.$('tr').tooltip({ placement: 'left', html: true });
    },

    hideFields: function() {
      _.each([this.timeFieldLabel(), this.totalTimeFieldLabel()], function(f) {
        var field = this.ticketFields(f);

        if (field && field.isVisible()) {
          field.hide();
        }
      }, this);
    },

    /*
     * TIME RELATED
     */

    elapsedTime: function(time) {
      if (typeof time !== "undefined") {
        this.realElapsedTime = time * 1000;
      }
      return (this.realElapsedTime / 1000) | 0;
    },

    setTimeLoop: function() {
      this.lastTick = getTick();
      this.elapsedTime(0);

      return setInterval(function() {
        var now = getTick();
        if (!this.paused) {
          this.realElapsedTime += now - this.lastTick;

          this.updateMainView(this.elapsedTime());
        }
        this.lastTick = now;
      }.bind(this), 1000);
    },

    updateTime: function(time) {
      this.time(time);
      this.totalTime(this.totalTime() + time);
    },

    autoResume: function() {
      this.paused = false;
    },

    autoPause: function() {
      this.paused = true;
    },

    renderTimeModal: function() {
      if (this.setting('simple_submission')) {
        this.$('.modal-time').val(Math.floor(this.elapsedTime() / 60));
      } else {
        this.$('.modal-time').val(this.TimeHelper.secondsToTimeString(this.elapsedTime()));
      }
      this.$('.modal').modal('show');
    },

    resetElapsedTime: function() {
      this.elapsedTime(0);
      this.updateMainView(this.elapsedTime());
    },

    /*
     *
     * UTILS
     *
     */

    isTimelogsEnabled: function() {
      return this.ticket() && this.ticket().id() && this.setting('display_timelogs');
    },

    time: function(time) {
      return this.getOrSetField(this.timeFieldLabel(), time);
    },

    totalTime: function(time) {
      if (this.currentLocation() === 'new_ticket_sidebar' && typeof time === 'undefined') return 0;
      return this.getOrSetField(this.totalTimeFieldLabel(), time) || 0;
    },

    totalTimeFieldLabel: function() {
      return this.buildFieldLabel(this.storage.totalTimeFieldId);
    },

    timeFieldLabel: function() {
      return this.buildFieldLabel(this.storage.timeFieldId);
    },

    buildFieldLabel: function(id) {
      return helpers.fmt('custom_field_%@', id);
    },

    getOrSetField: function(fieldLabel, value) {
      if (typeof value !== "undefined") {
        return this.ticket().customField(fieldLabel, value);
      }

      return parseInt((this.ticket().customField(fieldLabel) || 0), 10);
    },

    TimeHelper: {
      secondsToTimeString: function(seconds) {
        var negative = seconds < 0,
            absValue = Math.abs(seconds),
            hours    = Math.floor(absValue / 3600),
            minutes  = Math.floor((absValue - (hours * 3600)) / 60),
            secs     = absValue - (hours * 3600) - (minutes * 60);

        var timeString = helpers.fmt('%@:%@:%@',
          this.addInsignificantZero(hours),
          this.addInsignificantZero(minutes),
          this.addInsignificantZero(secs)
        );

        return (negative ? '-' : '') + timeString;
      },

      simpleFormat: /^-?\d+$/,

      complexFormat: /^(\d{0,2}):(\d{0,2}):(\d{0,2})$/,

      timeStringToSeconds: function(timeString, simple) {
        var result;

        if (simple) {
          result = timeString.match(this.simpleFormat);

          if (!result) { throw { message: 'bad_time_format' }; }

          return parseInt(result[0], 10) * 60;
        } else {
          result = timeString.match(this.complexFormat);

          if (!result || result.length != 4) { throw { message: 'bad_time_format' }; }

          return this.parseIntWithDefault(result[1]) * 3600 +
            this.parseIntWithDefault(result[2]) * 60 +
            this.parseIntWithDefault(result[3]);
        }
      },

      parseIntWithDefault: function(num, def) {
        return parseInt(num, 10) || def || 0;
      },

      addInsignificantZero: function(n) {
        return ( n < 10 ? '0' : '') + n;
      }
    }
  };
}());
;
}
var app = ZendeskApps.defineApp(source)
  .reopenClass({"location":{"zendesk":{"new_ticket_sidebar":"_legacy","ticket_sidebar":"_legacy"}},"noTemplate":false,"singleInstall":true})
  .reopen({
    appName: "Time Tracking",
    appVersion: "0.4.4",
    assetUrlPrefix: "/api/v2/apps/35111/assets/",
    appClassName: "app-35111",
    author: {
      name: "Zendesk",
      email: "support@zendesk.com"
    },
    translations: {"app":{"parameters":{"time_field_id":{"label":"ID du champ de temps","helpText":"L’ID d’un champ numérique personnalisé qui contiendra le temps total."},"time_object_field_id":{"label":"ID du champ de configuration","helpText":"L’ID d’un champ numérique personnalisé qui contiendra le temps consacré au ticket."},"display_timelogs":{"label":"Afficher les journaux horaires pour les agents","helpText":"Les agents peuvent voir l’activité des journaux horaires."},"hide_from_agents":{"label":"Masquer l’application pour les agents","helpText":"Les agents ne disposant pas du rôle d’administrateur ne verront pas cette application. Cela les empêche également de voir et de modifier les données de temps au moment de l’envoi."},"manual_pause_resume":{"label":"Afficher les contrôles du minuteur","helpText":"Les agents peuvent arrêter ou réinitialiser le minuteur manuellement."},"auto_pause_resume":{"label":"Pause automatique","helpText":"Le minuteur s’arrête quand l’agent quitte le ticket et reprend quand l’agent revient au ticket."},"reset":{"label":"Réinitialiser le temps actuel","helpText":"Les agents peuvent réinitialiser le temps actuel consacré à un ticket."},"time_submission":{"label":"Modifier l’envoi du temps","helpText":"Les agents peuvent consulter et modifier leur temps avant d’envoyer le ticket."},"simple_submission":{"label":"Envoi du temps simplifié","helpText":"Les agents peuvent saisir une valeur en minutes avant d’envoyer le ticket."}}},"statuses":{"new":"n","open":"o","pending":"a","hold":"p","solved":"r","closed":"c"},"views":{"main":{"pause":"Pause","total_time_spent":"Temps total","play":"Lire","reset":"Réinitialiser","timelogs":"Journal horaire","timelogs_table":{"agent":"Agent","time":"Temps","status":"Statut"}},"timelogs":{"title":"Journal horaire","csv_export":"Exporter au format CSV","error":"Impossible de charger des journaux horaires.","empty":"Aucun journal horaire à afficher"},"modal":{"body":"C’est le temps que vous avez consacré à ce ticket. Modifiez le temps si nécessaire, puis cliquez sur Envoyer le temps.","close":"Annuler","save":"Envoyer le temps"}},"errors":{"setup":{"question":"Avez-vous suivi les instructions d’installation pour cette application et configuré les deux champs de tickets obligatoires pour qu’ils s’affichent sur chaque formulaire de ticket ?","solution":"Si ce n’est pas le cas, consultez \u003ca href=\"{{url}}\" target=\"_blank\"\u003eces instructions\u003c/a\u003e et allez à votre page de gestion des formulaires de tickets pour finaliser la configuration."},"save_hook":"Vous devez envoyer votre temps pour ce ticket.","bad_time_format":"Format de temps incorrect (HH:MM:SS).","negative_time":"Le temps était négatif. Réinitialisation à 0."}},
    templates: {"layout":"\u003cstyle\u003e\n.app-35111 header .logo {\n  background-image: url(\"/api/v2/apps/35111/assets/logo-small.png\"); }\n.app-35111.box.app_view {\n  padding-bottom: 0px; }\n.app-35111 section[data-main] {\n  font-family: Lucida Grande; }\n.app-35111 .live-timer {\n  font-size: 26px;\n  font-weight: regular;\n  color: #333; }\n.app-35111 .total-time {\n  padding-top: 15px;\n  padding-bottom: 2px;\n  font-size: 12px;\n  color: #999; }\n.app-35111 [class^=\"icon-time-\"] {\n  background-position: initial; }\n.app-35111 .icon {\n  display: block;\n  width: 15px;\n  height: 15px;\n  background-image: url(\"/api/v2/apps/35111/assets/icons.png\");\n  background-repeat: no-repeat; }\n.app-35111 .icon-time-play {\n  background-position: -30px -30px; }\n  .app-35111 .icon-time-play.active {\n    background-position: -5px -30px; }\n.app-35111 .icon-time-pause {\n  background-position: -30px -5px; }\n  .app-35111 .icon-time-pause.active {\n    background-position: -5px -5px; }\n.app-35111 .icon-time-reset {\n  background-position: -55px -5px; }\n.app-35111 .text-center {\n  text-align: center; }\n.app-35111 input {\n  text-align: inherit;\n  font-size: 20px;\n  padding: 10px;\n  margin: 10px; }\n.app-35111 .timelogs-container {\n  display: none;\n  padding-bottom: 10px; }\n  .app-35111 .timelogs-container .heading {\n    border-top: 1px solid #ddd;\n    border-bottom: 1px solid #ddd;\n    padding: 10px 0px 10px 0px; }\n.app-35111 .timelogs-empty {\n  color: #999;\n  font-size: 11px;\n  padding: 10px;\n  text-align: center; }\n.app-35111 .csv-export {\n  font-size: 11px; }\n.app-35111 .table {\n  margin-bottom: 0px; }\n  .app-35111 .table tr:hover td {\n    background-color: white; }\n  .app-35111 .table th {\n    font-size: 11px;\n    font-weight: normal;\n    color: #333;\n    padding-top: 5px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd; }\n  .app-35111 .table td {\n    border-top: 0px;\n    padding-top: 10px;\n    font-weight: normal;\n    font-size: 11px;\n    color: #8c8c8c; }\n.app-35111 .expand-bar {\n  background-color: #F8F8F8;\n  border-top: 1px solid #f0f0f0;\n  cursor: pointer;\n  padding-top: 0px;\n  padding-bottom: 15px;\n  margin-left: -15px;\n  margin-right: -15px;\n  -webkit-border-radius: 0 0 5px 5px;\n  -moz-border-radius: 0 0 5px 5px;\n  -ms-border-radius: 0 0 5px 5px;\n  -o-border-radius: 0 0 5px 5px;\n  -kthml-border-radius: 0 0 5px 5px;\n  border-radius: 0 0 5px 5px; }\n  .app-35111 .expand-bar .arrow {\n    margin-top: 12px;\n    height: 6px;\n    min-width: 11px;\n    background-repeat: no-repeat;\n    background-position: center;\n    background-image: url(\"/api/v2/apps/35111/assets/ico-arrow-up-normal.png\");\n    -webkit-transform: rotateX(180deg);\n    -moz-transform: rotateX(180deg);\n    -ms-transform: rotateX(180deg);\n    -o-transform: rotateX(180deg);\n    -kthml-transform: rotateX(180deg);\n    transform: rotateX(180deg);\n    -webkit-transition: -webkit-transform 0.5s;\n    -moz-transition: -moz-transform 0.5s;\n    -ms-transition: -ms-transform 0.5s;\n    -o-transition: -o-transform 0.5s;\n    -kthml-transition: -kthml-transform 0.5s;\n    transition: transform 0.5s; }\n  .app-35111 .expand-bar.expanded .arrow {\n    -webkit-transform: rotateX(0deg);\n    -moz-transform: rotateX(0deg);\n    -ms-transform: rotateX(0deg);\n    -o-transform: rotateX(0deg);\n    -kthml-transform: rotateX(0deg);\n    transform: rotateX(0deg); }\n  .app-35111 .expand-bar:hover {\n    background-image: url(\"/api/v2/apps/35111/assets/hover-bg.png\");\n    background-repeat: no-repeat;\n    background-position: center top; }\n.app-35111 .btn:focus {\n  outline: 0; }\n\u003c/style\u003e\n\u003cdiv class=\"app-container\"\u003e\n  \u003cheader\u003e\n    \u003cspan class=\"logo\"/\u003e\n    \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n  \u003c/header\u003e\n  \u003csection data-main/\u003e\n\u003c/div\u003e","main":"\u003cdiv class=\"timers\"\u003e\n  \u003cdiv class=\"row-fluid current-timer\"\u003e\n    \u003cdiv class=\"span6\"\u003e\n      \u003cdiv class=\"live-timer \"\u003e00:00:00\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"span6\"\u003e\n      \u003cdiv class=\"text-center pull-right\"\u003e\n        {{#if manualPauseResume}}\u003cbutton class=\"btn play\" title=\"{{t \"views.main.play\"}}\"\u003e\u003ci class=\"icon icon-time-play active\"\u003e\u003c/i\u003e\u003c/button\u003e{{/if}}\n        {{#if manualPauseResume}}\u003cbutton class=\"btn pause\" title=\"{{t \"views.main.pause\"}}\"\u003e\u003ci class=\"icon icon-time-pause\"\u003e\u003c/i\u003e\u003c/button\u003e{{/if}}\n        {{#if displayReset}}\u003cbutton class=\"btn reset\" title=\"{{t \"views.main.reset\"}}\"\u003e\u003ci class=\"icon icon-time-reset\"\u003e\u003c/i\u003e\u003c/button\u003e{{/if}}\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"row-fluid total-time\"\u003e\n    \u003cdiv class=\"span12\"\u003e\n      \u003cstrong\u003e{{t \"views.main.total_time_spent\"}}\u003c/strong\u003e: \u003cspan class=\"live-totaltimer\"\u003e00:00:00\u003c/span\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n{{#if displayTimelogs}}\n  \u003cdiv class=\"row-fluid timelogs-container\"\u003e\n    {{spinner \"dotted\"}}\n  \u003c/div\u003e\n\n  \u003cdiv class=\"expand-bar\"\u003e\n    \u003cdiv class=\"arrow\"\u003e\u003c/div\u003e\n  \u003c/div\u003e\n{{/if}}\n\n\u003cdiv class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\"\u003e\n  \u003cdiv class=\"modal-header\"\u003e\n    \u003cbutton type=\"button\" class=\"close\" aria-hidden=\"true\" data-dismiss=\"modal\"\u003e×\u003c/button\u003e\n    \u003ch3\u003e{{setting \"name\"}}\u003c/h3\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-body\"\u003e\n    \u003cp\u003e{{t \"views.modal.body\"}}\u003c/p\u003e\n\n    \u003cdiv class=\"modal-time-container text-center\"\u003e\n      \u003cinput class=\"modal-time\" type=\"text\" value=\"HH:MM:SS\"/\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"modal-footer\"\u003e\n    \u003cbutton class=\"btn\" aria-hidden=\"true\" data-dismiss=\"modal\"\u003e{{t \"views.modal.close\"}} (\u003cspan class=\"modal-timer\"\u003e15\u003c/span\u003e)\u003c/button\u003e\n    \u003cbutton class=\"btn btn-primary modal-save\"\u003e{{t \"views.modal.save\"}}\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e","setup_info":"\u003cdiv class=\"alert alert-warning\"\u003e\n  \u003cp\u003e{{t 'errors.setup.question'}}\u003c/p\u003e\u003cbr\u003e\n  \u003cp\u003e{{{t 'errors.setup.solution' url=link}}}\u003c/p\u003e\n\u003c/div\u003e","timelogs":"\u003cdiv class=\"heading\"\u003e\n  \u003cstrong\u003e{{t \"views.timelogs.title\"}}\u003c/strong\u003e\n\u003c/div\u003e\n{{#if timelogs}}\n  \u003ctable class=\"table table-condensed\"\u003e\n    \u003cthead\u003e\n      \u003cth\u003e{{t \"views.main.timelogs_table.status\"}}\u003c/th\u003e\n      \u003cth\u003e{{t \"views.main.timelogs_table.agent\"}}\u003c/th\u003e\n      \u003cth\u003e{{t \"views.main.timelogs_table.time\"}}\u003c/th\u003e\n    \u003c/thead\u003e\n    \u003ctbody\u003e\n      {{#each timelogs}}\n      \u003ctr data-toggle=\"tooltip\" title=\"{{date}}\"\u003e\n        \u003ctd\u003e\n          \u003cspan class=\"ticket_status_label {{status}}\"\u003e\n            \u003cstrong\u003e{{localized_status}}\u003c/strong\u003e\n          \u003c/span\u003e\n        \u003c/td\u003e\n        \u003ctd\u003e{{user.name}}\u003c/td\u003e\n        \u003ctd\u003e{{time}}\u003c/td\u003e\n      \u003c/tr\u003e\n      {{/each}}\n    \u003c/tbody\u003e\n  \u003c/table\u003e\n{{else}}\n  \u003cp class=\"timelogs-empty\"\u003e\n    {{t \"views.timelogs.empty\"}}\n  \u003c/p\u003e\n{{/if}}"},
    frameworkVersion: "1.0"
  });

ZendeskApps["Time Tracking"] = app;


    if (ZendeskApps["Redmine"]) {
      ZendeskApps["Redmine"].install({"id":254321,"app_id":41140,"app_name":"Redmine","enabled":true,"settings":{"name":"Redmine","title":"Redmine","redmine_url":"http://redmine.it.aramisauto.com"},"requirements":[],"updated_at":"2015-02-27T09:40:46Z","created_at":"2015-02-27T09:39:53Z"});
    }
    if (ZendeskApps["Yammer App"]) {
      ZendeskApps["Yammer App"].install({"id":342419,"app_id":66783,"app_name":"Yammer App","enabled":true,"settings":{"name":"Yammer App","title":"Yammer App","yammer_token":"icBll74mAvak0eDUQhccA6RH0nAi2YIko53grZ7lYQ"},"requirements":[],"updated_at":"2016-01-10T09:35:35Z","created_at":"2016-01-10T09:35:35Z"});
    }
    if (ZendeskApps["Show Related Tickets"]) {
      ZendeskApps["Show Related Tickets"].install({"id":346249,"app_id":5131,"app_name":"Show Related Tickets","enabled":true,"settings":{"disable_tooltip":true,"name":"Affichage des tickets associés","title":"Affichage des tickets associés"},"requirements":[],"updated_at":"2016-01-14T10:54:55Z","created_at":"2016-01-14T10:54:55Z"});
    }
    if (ZendeskApps["TeamViewer"]) {
      ZendeskApps["TeamViewer"].install({"id":344105,"app_id":23614,"app_name":"TeamViewer","enabled":true,"settings":{"name":"TeamViewer","title":"TeamViewer","tv_CustomFieldId":"25034295","tv_customerLinkPrefix":"Voici le lien pour la connexion @@URL@@\r\n\r\nMerci de me rejoindre en cliquant dessus","tv_waitingMessage":null},"requirements":[],"updated_at":"2016-02-02T12:22:38Z","created_at":"2016-01-10T09:15:44Z"});
    }
    if (ZendeskApps["Conditional Fields"]) {
      ZendeskApps["Conditional Fields"].install({"id":387351,"app_id":19078,"app_name":"Conditional Fields","enabled":true,"settings":{"disable_conflicts_prevention":false,"name":"Champs conditionnels","title":"Champs conditionnels","rules":"[{\"field\":27741851,\"value\":\"demandes\",\"select\":[27742091],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565171896,\"requireds\":[27742091],\"index\":0,\"valueText\":\"Demandes\",\"fieldsText\":\"Type Demande\",\"selected\":false},{\"field\":27741851,\"value\":\"incidents\",\"select\":[27742081,28241291,28123312],\"formId\":62101,\"dirty\":true,\"creationDate\":1446630926795,\"requireds\":[27742081,28241291],\"index\":1,\"valueText\":\"Incidents\",\"fieldsText\":\"Type Incidents, Impact :, Blocage clientèle\",\"selected\":true},{\"field\":27741861,\"value\":\"tablette_hs\",\"select\":[28272191,28272201,28292412,28273441],\"formId\":62101,\"dirty\":true,\"creationDate\":1446124035700,\"requireds\":[28273441,28292412,28272191,28272201],\"index\":2,\"valueText\":\"Tablette HS\",\"fieldsText\":\"Numéro SIM, Modèle Tablette, Numéro IMEI, Panne Tablette\",\"selected\":false},{\"field\":27742081,\"value\":\"divers\",\"select\":[27741891],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565188360,\"requireds\":[27741891],\"index\":3,\"valueText\":\"Divers\",\"fieldsText\":\"Divers\",\"selected\":false},{\"field\":27742081,\"value\":\"gestion_de_parc\",\"select\":[27741861],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565180535,\"requireds\":[27741861],\"index\":4,\"valueText\":\"Gestion de Parc\",\"fieldsText\":\"Gestion Incident de Parc\",\"selected\":false},{\"field\":27742081,\"value\":\"gestion_téléphonie\",\"select\":[27741881],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565185255,\"requireds\":[27741881],\"index\":5,\"valueText\":\"Gestion Téléphonie\",\"fieldsText\":\"Gestion Téléphonie\",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_de_la_téléphonie\",\"select\":[27767422],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565201879,\"requireds\":[27767422],\"index\":6,\"valueText\":\"Gestion de la téléphonie\",\"fieldsText\":\"Gestion de la téléphonie \",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_de_parc_demande\",\"select\":[27767202],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565198127,\"requireds\":[27767202],\"index\":7,\"valueText\":\"Gestion de Parc\",\"fieldsText\":\"Gestion de Parc\",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_du_personnel\",\"select\":[27742061],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565205080,\"requireds\":[27742061],\"index\":8,\"valueText\":\"Gestion du Personnel\",\"fieldsText\":\"Gestion du Presonnel\",\"selected\":false},{\"field\":28032492,\"value\":\"siège\",\"select\":[28294011],\"formId\":62101,\"dirty\":true,\"creationDate\":1446371782564,\"requireds\":[28294011],\"index\":9,\"valueText\":\"Siège\",\"fieldsText\":\"Service\",\"selected\":false},{\"field\":28032492,\"value\":\"siège\",\"select\":[28294011],\"formId\":60072,\"dirty\":true,\"creationDate\":1457374657462,\"requireds\":[],\"index\":10,\"valueText\":\"Siège\",\"fieldsText\":\"Service\",\"selected\":false}]","rules_1":null,"user_rules":"[{\"field\":27741851,\"value\":\"demandes\",\"select\":[27742091],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565171896,\"requireds\":[27742091],\"index\":0,\"valueText\":\"Demandes\",\"fieldsText\":\"Type Demande\",\"selected\":false},{\"field\":27741851,\"value\":\"incidents\",\"select\":[27742081,28241291,28123312],\"formId\":62101,\"dirty\":true,\"creationDate\":1446630850181,\"requireds\":[27742081,28241291],\"index\":1,\"valueText\":\"Incidents\",\"fieldsText\":\"Type Incidents, Impact :, Blocage clientèle\",\"selected\":true},{\"field\":27741861,\"value\":\"tablette_hs\",\"select\":[28272191,28272201,28292412,28273441],\"formId\":62101,\"dirty\":true,\"creationDate\":1446124236853,\"requireds\":[28273441,28292412,28272191,28272201],\"index\":2,\"valueText\":\"Tablette HS\",\"fieldsText\":\"Numéro SIM, Modèle Tablette, Numéro IMEI, Panne Tablette\",\"selected\":false},{\"field\":27742081,\"value\":\"divers\",\"select\":[27741891],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565188360,\"requireds\":[27741891],\"index\":3,\"valueText\":\"Divers\",\"fieldsText\":\"Divers\",\"selected\":false},{\"field\":27742081,\"value\":\"gestion_de_parc\",\"select\":[27741861],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565180535,\"requireds\":[27741861],\"index\":4,\"valueText\":\"Gestion de Parc\",\"fieldsText\":\"Gestion Incident de Parc\",\"selected\":false},{\"field\":27742081,\"value\":\"gestion_téléphonie\",\"select\":[27741881],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565185255,\"requireds\":[27741881],\"index\":5,\"valueText\":\"Gestion Téléphonie\",\"fieldsText\":\"Gestion Téléphonie\",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_de_la_téléphonie\",\"select\":[27767422],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565201879,\"requireds\":[27767422],\"index\":6,\"valueText\":\"Gestion de la téléphonie\",\"fieldsText\":\"Gestion de la téléphonie \",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_de_parc_demande\",\"select\":[27767202],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565198127,\"requireds\":[27767202],\"index\":7,\"valueText\":\"Gestion de Parc\",\"fieldsText\":\"Gestion de Parc\",\"selected\":false},{\"field\":27742091,\"value\":\"gestion_du_personnel\",\"select\":[27742061],\"formId\":62101,\"dirty\":true,\"creationDate\":1442565205080,\"requireds\":[27742061],\"index\":8,\"valueText\":\"Gestion du Personnel\",\"fieldsText\":\"Gestion du Presonnel\",\"selected\":false},{\"field\":28032492,\"value\":\"siège\",\"select\":[28294011],\"formId\":62101,\"dirty\":true,\"creationDate\":1446371759936,\"requireds\":[28294011],\"index\":9,\"valueText\":\"Siège\",\"fieldsText\":\"Service\",\"selected\":false},{\"field\":28032492,\"value\":\"siège\",\"select\":[28294011],\"formId\":60072,\"dirty\":true,\"creationDate\":1457374615587,\"requireds\":[],\"index\":10,\"valueText\":\"Siège\",\"fieldsText\":\"Service\",\"selected\":false}]","user_rules_1":null},"requirements":[],"updated_at":"2016-03-07T18:17:40Z","created_at":"2015-09-18T08:32:21Z"});
    }
    if (ZendeskApps["Attachment Library"]) {
      ZendeskApps["Attachment Library"].install({"id":391559,"app_id":65346,"app_name":"Attachment Library","enabled":true,"settings":{"name":"Attachment Library","title":"Attachment Library","field_key":"attachment_library"},"requirements":[],"updated_at":"2016-03-07T18:23:57Z","created_at":"2016-03-07T18:23:57Z"});
    }
    if (ZendeskApps["Linked Ticket"]) {
      ZendeskApps["Linked Ticket"].install({"id":393555,"app_id":6272,"app_name":"Linked Ticket","enabled":true,"settings":{"name":"Ticket lié","title":"Ticket lié","ancestry_field":"25794979","child_tag":"ticket_enfant"},"requirements":[],"updated_at":"2016-03-07T18:30:49Z","created_at":"2016-03-07T18:30:49Z"});
    }
    if (ZendeskApps["SLA-M Dashboard"]) {
      ZendeskApps["SLA-M Dashboard"].install({"id":344395,"app_id":66692,"app_name":"SLA-M Dashboard","enabled":true,"settings":{"columns":"[{\"name\":\"What Next\",\"period\":{\"label\":\"Next 4 days\",\"end\":96,\"start\":24}},{\"name\":\"Next\",\"period\":{\"label\":\"Today\",\"end\":24,\"start\":0}},{\"name\":\"Late\",\"period\":{\"label\":\"Last 100 days\",\"start\":-2400,\"end\":0}}]","facets":"[\"Organizations\",\"Priority\"]","config":"{\"columns\":[{\"position\":\"Left\",\"title\":\"What Next\",\"label\":\"Next 4 days\",\"limit\":96,\"units\":\"hours\"},{\"position\":\"Middle\",\"title\":\"Next\",\"label\":\"Today\",\"limit\":24,\"units\":\"hours\"},{\"position\":\"Right\",\"title\":\"Late\",\"label\":\"Last 100 days\",\"limit\":100,\"units\":\"days\"}],\"facets\":{\"Organizations\":true,\"Priority\":true},\"applied\":\"true\"}","segapiurl":"https://api.segment.io/v1/","segwritekey":"ErHzNJ4BIMmMb2FFjyKnD4wdiRNXnMyy","applied":"true","app_version":"2.0","name":"SLA-M Dashboard","title":"SLA-M Dashboard"},"requirements":[{"identifier":"coherence_sla_dashboard_view","requirement_id":48218265,"requirement_type":"views"}],"updated_at":"2016-04-14T06:48:54Z","created_at":"2016-01-10T19:25:03Z"});
    }
    if (ZendeskApps["Time Tracking"]) {
      ZendeskApps["Time Tracking"].install({"id":389222,"app_id":35111,"app_name":"Time Tracking","enabled":true,"settings":{"hide_from_agents":false,"display_timelogs":true,"auto_pause_resume":true,"manual_pause_resume":true,"reset":true,"time_submission":true,"simple_submission":true,"name":"Suivi du temps","title":"Suivi du temps","time_field_id":null,"total_time_field_id":null},"requirements":[{"identifier":"time_last_update_field","requirement_id":27863131,"requirement_type":"ticket_fields"},{"identifier":"total_time_field","requirement_id":27863121,"requirement_type":"ticket_fields"}],"updated_at":"2016-04-14T06:48:54Z","created_at":"2015-09-21T14:02:09Z"});
    }

    ZendeskApps.sortAppsForSite("nav_bar", [387351,344395]);
    ZendeskApps.sortAppsForSite("ticket_sidebar", [254321,342419,346249,344105,387351,391559,393555,344395,389222]);
    ZendeskApps.sortAppsForSite("new_ticket_sidebar", [342419,346249,344105,387351,391559,389222]);
}());

ZendeskApps.trigger && ZendeskApps.trigger('ready');
