<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users">{{t 'users'}}</a>
</div>

<div class="actions-group">
    <a href="#/groups" class="btn btn-info">
        <span class="fa-key-modern"></span> {{t 'group_manage_permissions'}}
    </a> 
    <a role="button" href="#/users/create" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'users_new'}}
    </a>
</div>

<div class="separator"></div>

<div class="list-group">
{{#each users}}
    <a href="#/users/{{@key}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{@key}} <small>{{fullname}}</small></h2>
        <p class="list-group-item-text">{{mail}}</p>
    </a>
{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'users_no'}}
</div>
{{/each}}

</div>
