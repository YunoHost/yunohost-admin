<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users">{{t 'users'}}</a>
    <a href="#/groups">{{t 'group_permissions'}}</a>
</div>

<div class="actions-group">
    <a role="button" href="#/groups/create" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'group_new'}}
    </a>
</div>

<div class="separator"></div>

{{!-- ======================== Partial inline view ======================= --}}
{{#*inline "label"}}
    <span class="label label-default label-removable">
        <span class="fa-fw fa-{{icon}}"></span>
        {{text}} 
        <a role="button" data-type="{{type}}s" data-operation="remove" data-item="{{value}}" data-group="{{group}}" class="group-update">
            <span class="fa-close" style="margin-left:5px"></span>
            <span class="sr-only">{{t 'delete'}}</span>
        </a>
    </span>
{{/inline}}

{{#*inline "labelsLine"}}
    {{#each items}}
        {{> label text=(call ../display .) value=. icon=../icon type=../type item=. group=../group}}
    {{/each}}
    {{#if inv}}
    <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="fa-plus"></span> {{t (concat 'group_add_' type)}}
        </button>
        <ul class="dropdown-menu">
            {{#each inv}}
                <li><a href="#" data-type="{{../type}}s" data-operation="add" data-item="{{.}}" data-group="{{../group}}" class="group-update">{{call ../display .}}</a></li>
            {{/each}}
        </ul>
    </div>
    {{/if}}
{{/inline}}
<div id="view-groups">

{{!-- ======================== Groups ======================= --}}
{{#each groups}}
{{#unless primary}}
<div class="panel panel-default">
    <div class="panel-heading" role="tab" id="heading-context-group-{{@key}}">
        <h2 class="panel-title">
            <a role="button" data-toggle="collapse" href="#collapse-group-{{@key}}" aria-expanded="false" aria-controls="collapse-group-{{@key}}">
                <span class="fa-fw fa-group"></span> {{#if special}}{{t (concat 'group_' @key)}}{{else}}{{t 'group'}} "{{ucwords @key}}"{{/if}}
            </a>
            {{#unless special}}
            <a href="#/groups/{{@key}}/delete" role="button" class="group-delete">
                <span class="fa-close"></span>
                <span class="sr-only">{{t 'delete'}}</span>
            </a>
            {{/unless}}
        </h2>
    </div>
    <div id="collapse-group-{{@key}}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-context-group-{{@key}}">
        <div class="panel-body">
            {{#unless special}}
            <div class="row">
                <div class="col-sm-2">
                    <h3>{{t 'users'}}</h3>
                </div>
                <div class="col-sm-10">
                        {{> labelsLine display=../displayUser icon="user" type="member" items=members inv=membersInv group=@key}}
                </div>
            </div>
            <hr />
            {{/unless}}
            <div class="row">
                <div class="col-sm-2">
                    <h3>{{t 'permissions'}}</h3>
                </div>
                <div class="col-sm-10">
                    {{> labelsLine display=../displayPermission icon="key-modern" type="permission" items=permissions inv=permissionsInv group=@key}}
                    {{#if special}}
                    <div style="font-style:italic"><span class="fa-info-circle"></span> {{t (concat 'group_' @key '_group_explanation')}}</div>
                    {{/if}}
                </div>
            </div>
        </div>
    </div>
</div>
{{/unless}}
{{/each}}


{{!-- ====================== User specific permissions ==================== --}}
<div class="panel panel-info">
    <div class="panel-heading" role="tab" id="heading-context-specific">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" href="#collapse-specific" aria-expanded="false" aria-controls="collapse-specific">
                    <span class="fa-fw fa-group"></span> {{t 'group_specific_permissions'}}
                </a>
            </h2>
    </div>
    <div id="collapse-specific" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-context-specific">
        <div class="panel-body">
            {{#each groups}}
            {{#if (or (and primary permissions) display)}}
                <div class="row">
                    <div class="col-sm-2">
                        <h3><span class="fa-fw fa-user"></span> {{@key}}</h3>
                    </div>
                    <div class="col-sm-10">
                        {{> labelsLine display=../displayPermission icon="key-modern" type="permission" items=permissions inv=permissionsInv group=@key}}
                    </div>
                </div>
                <hr />
            {{/if}}
            {{/each}}
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="fa-plus"></span> {{t 'group_add_member'}}
                </button>
                <ul class="dropdown-menu">
                    {{#each groups}}
                    {{#if primary}}
                    {{#unless (or permissions display)}}
                        <li><a href="#" data-user="{{@key}}" class="group-add-user">{{@key}}</a></li>
                    {{/unless}}
                    {{/if}}
                    {{/each}}
                </ul>
            </div>
        </div>
    </div>
</div>
</div>
