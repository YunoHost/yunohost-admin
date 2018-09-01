(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    // *********
    // Diagnosis
    // *********

    // Server monitoring
    app.get('#/diagnosis', function (c) {

        // Why this method ?
        c.api('/diagnosis/show', function(data) { 
		for (var i = 0 ; i < data.reports.length ; i++)
		{
		    // Convert timestamp to datetime
		    data.reports[i].time = new Date(data.reports[i].timestamp*1000);
		    for (var j = 0 ; j < data.reports[i].reports.length ; j++)
		    {
			var type_ = data.reports[i].reports[j].report[0];
			type_ = type_.toLowerCase();
			var icon = "";
			var issue = false;

			if (type_ == "success") {
			    icon = "check-circle";
			}
			else if (type_ == "warning") {
			    icon = "warning";
			    issue = true;
			}
			else if (type_ == "error") {
		            type_ = "danger";
			    icon = "times";
			    issue = true;
			}
			data.reports[i].reports[j].report[0] = type_;
			data.reports[i].reports[j].icon = icon;
			data.reports[i].reports[j].issue = issue;
		    };
		};
		c.view('diagnosis/diagnosis_show', data, function() {
			$(".rerun-diagnosis").click(function() {
				var category = $(this).attr("category");
				c.api('/diagnosis/run', function(data) {
					// This is a copy-pasta of some of the
					// redirect/refresh code of sammy.js
					// because for some reason calling the function did not work >.>
					var to = "#/diagnosis";
					c.trigger('redirect', {to: to});
					c.app.last_location = c.path;
					c.app.setLocation(to);
					c.app.trigger('location-changed');
				}, 'POST', {"categories": [category], "force":true});
			});
		});
        }, 'GET');

    });

})();
