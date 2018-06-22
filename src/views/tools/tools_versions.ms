<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/versions">{{t 'versions'}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'versions'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            {{#each versions}}
            <dt>{{@key}}</dt>
            <dd>{{version}} ({{repo}})</dd>
            {{/each}}
        </dl>
        <a href="#/update" class="btn btn-success pull-right">{{t 'system_update'}}</a>
    </div>
</div>
