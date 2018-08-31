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
		console.log(data);
		c.view('diagnosis/diagnosis_show', data);
		for (var i = 0 ; i < data.reports.length ; i++)
		{
		    for (var j = 0 ; j < data.reports[i].reports.length ; j++)
		    {
			var type_ = data.reports[i].reports[j].report[0];
			type_ = type_.toLowerCase();
			var icon = "";
			if (type_ == "success") {
			    icon = "check-circle";
			}
			else if (type_ == "warning") {
			    icon = "warning";
			}
			else if (type_ == "error") {
			    icon = "times";
			}
			data.reports[i].reports[j].report[0] = type_;
			data.reports[i].reports[j].report.push(icon);
		    };
		};
        }, 'GET');

    });

})();
