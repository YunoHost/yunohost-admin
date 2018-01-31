<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/migrations">{{t 'migrations'}}</a>
</div>

<div class="separator"></div>

{{#if upToDate}}
<div class="alert alert-success">
    <span class="fa-fw fa-check-circle"></span> No migrations to be run !
</div>
{{else}}
<div class="alert alert-warning">
    <span class="fa-fw fa-exclamation-triangle"></span> There are pending migrations that need to be ran.
</div>
{{/if}}

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'pending_migrations'}}
        <div class="btn-toolbar pull-right">
            <a href="#" class="btn btn-success" style="margin-top: -3px"><span class="fa-fw fa-play"></span> {{t 'run'}}</a>
            <a href="#" class="btn btn-warning" style="margin-top: -3px"><span class="fa-fw fa-close"></span> {{t 'skip'}}</a>
        </div>
        </h2>
    </div>
    
    {{#if migrations}}
        <div class="list-group">
        {{#migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading" style="text-transform: capitalize;">
                {{ number }}. {{ name }}
            </h3>
            <p id="description-migration-{{number}}" class="list-group-item-text">
                (No description available)
            </p>
        </div>
        {{/migrations}}
        </div>
    {{else}}
    <div class="panel-body">
        <span class="text-success"><span class="fa-fw fa-check-circle"></span> No pending migrations !</span>
    </div>
    {{/if}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'previous_migrations'}}
        </h2>
    </div>
    
    {{#if previous_migrations}}
        <div class="list-group">
        {{#previous_migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading" style="text-transform: capitalize;">
                <a data-toggle="collapse" href="#description-migration-{{number}}">
                {{ number }}. {{ name }}
                </a>
            </h3>
            <p id="description-migration-{{number}}" class="list-group-item-text collapse">
                (No description available)
            </p>
        </div>
        {{/previous_migrations}}
        </div>
    {{else}}
    <div class="panel-body">
        <span class="text-info">No previous migrations.</span>
    </div>
    {{/if}}
</div>



