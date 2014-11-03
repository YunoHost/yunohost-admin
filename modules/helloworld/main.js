var helloworld = function(app,path) {        
    app.get('#/helloworld', function (c) {
        c.view([path,'helloworld']);
    });        
};
