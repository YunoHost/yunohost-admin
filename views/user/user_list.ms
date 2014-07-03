<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/users" class="btn btn-default"><div>{{t 'users'}}</div></a>
        </div>   
    </div>
</div>

<div class="pull-right">
    <a href="#/users/create" class="btn btn-success slide">
    	<span class="fa-plus"></span> {{t 'users_new'}}
    </a>
</div>
<div class="clearfix"></div>
<div class="br"></div>

<div class="list-group">
{{#users}}
    <a href="#/users/{{username}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{username}} <small>{{fullname}}</small></h2>
        <p class="list-group-item-text">{{mail}}</p>
    </a>
{{/users}}

{{^users}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'users_no'}}
</div>
{{/users}}

</div>
