Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}

var _webroot = "http://fl-dev.com/";

// EXTENSION APP
	
    // App Model
    // ----------
    var App = Backbone.DeepModel.extend({});

    // App View
    // --------------

    var AppView = Backbone.View.extend({

        el: $("#app"),

        initialize: function() { 

        	// check if user data is available
        	var user = localStorage.getObject('bloomboard.user');
        	if(!user){
        		var profileView = new ProfileView;
        		profileView.showLogin();
        	}else{
        		this.render();
        	}
        },

        render: function(){
			var observationView = new ObservationView;
			var scheduleView = new ScheduleView;
			var traineeView = new TraineeView;
			var profileView = new ProfileView;

			var app = new App();
			var params = { user : localStorage.getObject('bloomboard.user') } ;
			app.fetch({ url: _webroot + 'coachDashboard/iIndex/data.json', data : params,  dataType: "jsonp",  success: function (dashboard) { 
					if(dashboard.attributes.status == 'ok'){
						var data = dashboard.attributes.data;
						localStorage.setObject('bloomboard.dashboard', data);
						observationView.render();
						scheduleView.render();
					}
				}
			});

			app.fetch({ url: _webroot + 'coachDashboard/iGetCoachTrainees/data.json', data : params, dataType: "jsonp",  success: function (trainees) { 
					if(trainees.attributes.status == 'ok'){
						var data = trainees.attributes.data;
						localStorage.setObject('bloomboard.trainees', data);
						traineeView.render();
					}
				}
			});

			profileView.renderProfile();
        }

    });

	var ProfileView = Backbone.View.extend({
        
        el: $("#profile"),

		events: {
			'click	#login' 			: 	'login',
			'click  #logout'			: 	'logout'
		},

		render: function(){

		},

		storeLogin: function(){
			chrome.cookies.set({ url: _webroot , name: "bloomboard", value: user_id.toString(), expirationDate: (new Date().getTime()/1000) + 36*3600 });
		},

		showLogin: function(){
    		var loginTemplate = _.template($('#login-template').html());
			$(this.el).html(loginTemplate());
		},

		login: function(){
			var app = new App();
			var params = { username:  $('#username').val(), password : $('#password').val() } ;
			app.fetch({ url: _webroot + 'users/iLogin/data.json', data : params, dataType: "jsonp",  success: function (login) { 
					if(login.attributes.status == 'ok'){
						data = login.attributes.data;
						localStorage.setObject('bloomboard.user', data);
                  		var profileView = new ProfileView;
                  		profileView.renderProfile();
                  		appView.render();
					}else{
						alert('login failed');
					}
				}
			});
		},

		renderProfile: function(){
			var user = localStorage.getObject('bloomboard.user');
			var profileTemplate = _.template($('#profile-template').html());
			$(this.el).html( profileTemplate({
					user : user
				}));
		},

		logout: function(){
			localStorage.removeItem('bloomboard.user');
			localStorage.removeItem('bloomboard.dashboard');
			localStorage.removeItem('bloomboard.trainees');
			this.showLogin();
		}
	});

	var ObservationView = Backbone.View.extend({

		el : $('#observations'),

		initialize: function(){},

		events: {},

		render: function(){
			
			var dashboard = localStorage.getObject('bloomboard.dashboard');
			var observationsTemplate = _.template($('#observations-template').html());
			$(this.el).html( observationsTemplate({
					shelf: dashboard.shelf
				}));

		}
	});

	var ScheduleView = Backbone.View.extend({

		el : $('#schedule #today-tasks'),

		initialize: function(){},

		events: {},

		render: function(){
			
			var dashboard = localStorage.getObject('bloomboard.dashboard');
			var todayTasksTemplate = _.template($('#today-tasks-template').html());
			$(this.el).html( todayTasksTemplate({
					tasks: dashboard.today_tasks
				}));
		}
	});

	var TraineeView = Backbone.View.extend({

		el : $('#trainees'),

		initialize: function(){},

		events: {},

		render: function(trainees){

			var trainee_data = localStorage.getObject('bloomboard.trainees');
			var trainees = trainee_data.trainees;

			var traineesTemplate = _.template($('#trainees-template').html());
			$(this.el).html( traineesTemplate({
					trainees: trainees
				}));
		}
	});

	// start application
	appView = new AppView();


/*

	chrome.cookies.get({ url: _webroot , name: 'bloomboard' }, function(cookie){
		if(!cookie || cookie.value != user_id) 
		{
			var profileView = new ProfileView();
			profileView.showLogin();
		}else{
			var appView = new AppView();
		}
	});
*/

///////////



