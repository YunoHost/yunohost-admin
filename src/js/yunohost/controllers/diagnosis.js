(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    // *********
    // Diagnosis
    // *********

    app.get('#/diagnosis', function (c) {
        c.api('GET', '/diagnosis/show?full', {}, function(data) {

            // Prepare data to be displayed ...
            for (var i = 0 ; i < data.reports.length ; i++)
            {
                // Convert timestamp to datetime
                data.reports[i].time = new Date(data.reports[i].timestamp*1000);
                data.reports[i].warnings = 0;
                data.reports[i].errors = 0;
                data.reports[i].ignored = 0;
                for (var j = 0 ; j < data.reports[i].items.length ; j++)
                {
                    var type_ = data.reports[i].items[j].status;
                    type_ = type_.toLowerCase();
                    var ignored = data.reports[i].items[j].ignored;
                    var icon = "";
                    var issue = false;

                    if (type_ == "success") {
                        icon = "check-circle";
                    }
                    else if (ignored == true) {
                        icon = type_;
                        if (type_ == "error") {
                            icon = "times"
                        }
                        type_ = "ignored";
                        data.reports[i].ignored++;
                    }
                    else if (type_ == "warning") {
                        icon = "warning";
                        issue = true;
                        data.reports[i].warnings++;
                    }
                    else if (type_ == "error") {
                        type_ = "danger";
                        icon = "times";
                        issue = true;
                        data.reports[i].errors++;
                    }
                    data.reports[i].items[j].status = type_;
                    data.reports[i].items[j].icon = icon;
                    data.reports[i].items[j].issue = issue;
                    // We want filter_args to be something like "dnsrecords,domain=yolo.test,category=xmpp"
                    data.reports[i].items[j].filter_args = data.reports[i].id;
                    for (prop in data.reports[i].items[j].meta) {
                        data.reports[i].items[j].filter_args = data.reports[i].items[j].filter_args + ","+prop+"="+data.reports[i].items[j].meta[prop];
                    }
                };
                data.reports[i].noIssues = data.reports[i].warnings + data.reports[i].errors ? false : true;
            };

            // Render and display the view
            c.view('diagnosis/diagnosis_show', data, function() {

                // Configure share with yunopaste button
                $("button[data-action='share']").click(function() {
                    c.api('GET', '/diagnosis/show?share', {}, function(data) {
                        c.hideLoader();
                        window.open(data.url, '_blank');
                    });
                });

                // Configure 'rerun diagnosis' button behavior
                $("button[data-action='rerun-diagnosis']").click(function() {
                    var category = $(this).data("category");
                    c.api('POST', '/diagnosis/run?force', {"categories": [category]}, function(data) {
                        c.refresh();
                    });
                });

                // Configure 'ignore' / 'unignore' buttons behavior
                $("button[data-action='ignore']").click(function() {
                    var filter_args = $(this).data("filter-args");
                    c.api('POST', '/diagnosis/ignore', {'add_filter': filter_args.split(',') }, function(data) {
                        c.refresh();
                    })
                });

                $("button[data-action='unignore']").click(function() {
                    var filter_args = $(this).data("filter-args");
                    c.api('POST', '/diagnosis/ignore', {'remove_filter': filter_args.split(',') }, function(data) {
                        c.refresh();
                    })
                });
            });
        });
    });

})();
