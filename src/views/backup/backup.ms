<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup">{{t 'backup'}}</a>
</div>

<div class="actions-group">
    <!--<a href="#/storages/create" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'storages_new'}}
    </a>-->
</div>

<div class="separator"></div>

<div class="list-group">
{{#each storages}}
    <a href="#/backup/{{id}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{name}} <small>{{id}}</small></h2>
        <p class="list-group-item-text">{{uri}}</p>
    </a>
{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'storages_no'}}
</div>
{{/each}}

</div>
