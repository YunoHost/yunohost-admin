<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/migrations">{{t 'migrations'}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'migrations_pending'}}
        {{#if pending_migrations}}
        <div class="btn-toolbar pull-right">
            <a href="#/tools/migrations/run" class="btn btn-success" style="margin-top: -3px"><span class="fa-fw fa-play"></span> {{t 'run'}}</a>
            <a href="#/tools/migrations/skip" class="btn btn-warning" style="margin-top: -3px"><span class="fa-fw fa-close"></span> {{t 'skip'}}</a>
        </div>
        {{/if}}
        </h2>
    </div>
    
    {{#if pending_migrations}}
        <div class="list-group">
        {{#pending_migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading" style="text-transform: capitalize;">
                {{ number }}. {{ name }}
            </h3>
            <p id="description-migration-{{number}}" class="list-group-item-text">
                {{ description }}
            </p>
            {{#if disclaimer }}
            <hr>
            <p id="disclaimer-migration-{{number}}" class="list-group-item-text">
                {{ disclaimer }}
                <div style="margin-left:20px">
                <label style="" id="disclaimer-ack-migration-{{number}}" class="checkbox disclaimer-ack">
                    <input type="checkbox"> I read and understood this disclaimer
                </label>
                </div>
            </p>
            {{/if}}
        </div>
        {{/pending_migrations}}
        </div>
    {{else}}
    <div class="panel-body">
        <span class="text-success"><span class="fa-fw fa-check-circle"></span>{{t 'migrations_no_pending' }}</span>
    </div>
    {{/if}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'migrations_done'}}
        </h2>
    </div>
    
    {{#if done_migrations}}
        <div class="list-group">
        {{#done_migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading" style="text-transform: capitalize;">
                <a data-toggle="collapse" href="#description-migration-{{number}}">
                {{ number }}. {{ name }}
                </a>
            </h3>
            <p id="description-migration-{{number}}" class="list-group-item-text collapse">
                {{ description }}
            </p>
        </div>
        {{/done_migrations}}
        </div>
    {{else}}
    <div class="panel-body">
        <span class="text-info">{{t 'migrations_no_done' }}</span>
    </div>
    {{/if}}
</div>



