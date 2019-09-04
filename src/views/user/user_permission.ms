<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users">{{t 'users'}}</a>
    <a href="#/users/permissions">{{t 'perm_manage_permissions'}}</a>
</div>

<div class="actions-group">
    <a role="button" href="#/users/groups/create" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'perm_groups_new'}}
    </a>
</div>

<div class="separator"></div>

<div id="view-permissions">
{{#each groups}}
<div class="panel panel-default">
    <div class="panel-heading" role="tab" id="heading-context-group-{{name}}">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" href="#collapse-group-{{name}}" aria-expanded="false" aria-controls="collapse-group-{{name}}">
                    <span class="fa-fw fa-group"></span> {{t 'group'}} "{{ucwords name}}"
                </a>
            </h2>
    </div>
    <div id="collapse-group-{{name}}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-context-group-{{name}}">
        <div class="panel-body">
            <div class="row">
                <div class="col-sm-2">
                    <h3>{{t 'users'}}</h3>
                </div>
                <div class="col-sm-10">
                    {{#if all_users}}
                        <div class="alert alert-info" role="alert"><span class="fa-info-circle"></span> {{t 'perm_all_users_group_explanation'}}</div>
                    {{else}}
                        {{#each users}}
                            <span class="label label-default label-removable">
                                <span class="fa-fw fa-user"></span>
                                {{.}} 
                                <span  class="label-separator" aria-hidden="true">|</span>
                                <a role="button">
                                    <span class="fa-close" style="margin-left:5px"></span>
                                    <span class="sr-only">{{t 'delete'}}</span>
                                </a>
                            </span>
                        {{/each}}
                        <div class="btn-group">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="fa-plus"></span> {{t 'perm_add_user'}}
                            </button>
                            <ul class="dropdown-menu">
                                {{#each ../../users}}
                                    <li>{{.}}</li>
                                {{/each}}
                            </ul>
                        </div>
                    {{/if}}
                </div>
            </div>
            <hr />
            <div class="row">
                <div class="col-sm-2">
                    <h3>{{t 'permissions'}}</h3>
                </div>
                <div class="col-sm-10">
                    {{#each permissions}}
                        <span class="label label-default label-removable"><span class="fa-fw fa-key-modern"></span>{{.}} 
                            <span  class="label-separator" aria-hidden="true">|</span>
                            <a role="button">
                                <span class="fa-close" style="margin-left:5px"></span>
                                <span class="sr-only">{{t 'delete'}}</span>
                            </a>
                        </span>
                    {{/each}}
                    <div class="btn-group">
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="fa-plus"></span> {{t 'perm_add_permission'}}
                        </button>
                        <ul class="dropdown-menu">
                            {{#each ../../permissions}}
                                <li>{{.}}</li>
                            {{/each}}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{{/each}}
<div class="panel panel-info">
    <div class="panel-heading" role="tab" id="heading-context-specific">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" href="#collapse-specific" aria-expanded="false" aria-controls="collapse-specific">
                    <span class="fa-fw fa-group"></span> {{t 'perm_specific_permissions'}}
                </a>
            </h2>
    </div>
    <div id="collapse-specific" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-context-specific">
        <div class="panel-body">
            {{#each users_with_specific_permissions}}
                <div class="row">
                    <div class="col-sm-2">
                        <h3>{{username}}</h3>
                    </div>
                    <div class="col-sm-10">
                        {{#each permissions}}
                            <span class="label label-default label-removable"><span class="fa-fw fa-key-modern"></span>{{.}} 
                                <span  class="label-separator" aria-hidden="true">|</span>
                                <a role="button">
                                    <span class="fa-close" style="margin-left:5px"></span>
                                    <span class="sr-only">{{t 'delete'}}</span>
                                </a>
                            </span>
                        {{/each}}
                        <div class="btn-group">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="fa-plus"></span> {{t 'perm_add_permission'}}
                            </button>
                            <ul class="dropdown-menu">
                                {{#each ../../permissions}}
                                    <li>{{.}}</li>
                                {{/each}}
                            </ul>
                        </div>
                    </div>
                </div>
                <hr />
            {{/each}}
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="fa-plus"></span> {{t 'perm_add_user'}}
                </button>
                <ul class="dropdown-menu">
                    {{#each ../../users}}
                        <li>{{.}}</li>
                    {{/each}}
                </ul>
            </div>
        </div>
    </div>
</div>
</div>
