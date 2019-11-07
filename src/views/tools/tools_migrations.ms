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
            <button class="btn btn-sm btn-success" data-action="run"><span class="fa-fw fa-play"></span> {{t 'run'}}</button>
        </div>
        {{/if}}
        </h2>
    </div>
    
    {{#if pending_migrations}}
        <div class="list-group">
        {{#pending_migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading">
                {{ number }}. {{ description }}
                <div class="btn-toolbar pull-right">
                <button class="btn btn-xs btn-warning" style="color:white;" data-action="skip" data-migration="{{id}}"><span class="fa-fw fa-close"></span> {{t 'skip'}}</button>
                </div>
            </h3>
            {{#if disclaimer }}
            <hr>
            <p id="disclaimer-migration-{{number}}" class="list-group-item-text">
                {{{ disclaimer }}}
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
        <h2 class="panel-title">
        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#done_migrations" aria-expanded="true" aria-controls="done_migrations">
            <span class="fa-fw fa-cogs"></span> {{t 'migrations_done'}}
        </a>
        </h2>
    </div>
    
    {{#if done_migrations}}
        <div id="done_migrations" class="list-group panel-collapse collapse" role="tabpanel" aria-labelledby="heading-{{key}}">
        {{#done_migrations}}
        <div class="list-group-item clearfix">
            <h3 class="list-group-item-heading">
                {{ number }}. {{ description }}
            </h3>
        </div>
        {{/done_migrations}}
        </div>
    {{else}}
    <div class="panel-body">
        <span class="text-info">{{t 'migrations_no_done' }}</span>
    </div>
    {{/if}}
</div>



