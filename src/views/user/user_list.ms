<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users" class="btn btn-default">{{t 'users'}}</a>
</div>   

<div class="actions-group">
    <a href="#/users/create" class="btn btn-success slide">
    	<span class="fa-plus"></span> {{t 'users_new'}}
    </a>
</div>

<div class="separator"></div>

<div class="list-group">
{{#users}}
    <a href="#/users/{{username}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{username}} <small>{{fullname}}</small></h2>
        <p class="list-group-item-text">{{mail}}</p>
        <p class="list-group-item-text">{{mailbox-quota}}</p>
    </a>
{{/users}}

{{^users}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'users_no'}}
</div>
{{/users}}

</div>
