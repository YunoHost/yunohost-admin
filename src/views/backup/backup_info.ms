<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup">{{t 'backup'}}</a>
    <a href="#/backup/{{storage.id}}">{{storage.name}}</a>
    <a href="#/backup/{{storage.id}}/{{name}}">{{name}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'id'}}</dt><dd>{{ name }}</dd>
            <dt>{{t 'created_at'}}</dt><dd>{{formatTime created_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>
            <dt>{{t 'size'}}</dt><dd>{{ humanSize size}}</dd>
            <dt>{{t 'path'}}</dt><dd>{{ path }}</dd>
        </dl>
    </div>
</div>


<form action="#/backup/{{storage.id}}/{{name}}/restore" method="POST" class="form-horizontal">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
          <span class="fa-fw fa-archive"></span>
          {{t 'backup_content'}}
          <span class="select_all-none pull-right">
            <input type="button" role="select_all" class="btn btn-default slide back select_all" value="{{t 'select_all'}}" />
            <input type="button" role="select_none" class="btn btn-default slide back select_none" value="{{t 'select_none'}}" />
          </span>
        </h2>
    </div>
    {{#if items}}
    <div class="list-group">
        {{#each system_parts}}
        <div class="list-group-item">
            <input type="checkbox" id="{{@key}}" name="system_parts" value="{{value}}" checked class="nice-checkbox">
            <label for="{{@key}}" class="pull-right"><span class="sr-only">{{t 'check'}}</span></label>
            {{#if size}}
            <h2 class="list-group-item-heading">{{name}} <small>({{ humanSize size }})</small></h2>
            {{else}}
            <h2 class="list-group-item-heading">{{name}}</h2>
            {{/if}}
            <p class="list-group-item-text">{{description}}</p>
        </div>
        {{/each}}
        {{#each apps}}
        <div class="list-group-item">
            <input type="checkbox" id="{{@key}}" name="apps" value="{{@key}}" checked class="nice-checkbox">
            <label for="{{@key}}" class="pull-right"><span class="sr-only">{{t 'check'}}</span></label>
            <h2 class="list-group-item-heading">{{name}} <small>{{@key}} ({{ humanSize size }})</small></h2>
            <p class="list-group-item-text">{{description}}</p>
            <p class="list-group-item-text">{{t 'version'}} {{version}}</p>
        </div>
        {{/each}}
        <div class="list-group-item clearfix">
            <span class="pull-right ">
                <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'restore'}}" />
            </span>
        </div>
    </div>
    {{else}}
    <div class="panel-body">
        <div class="alert alert-warning">
            <span class="fa-exclamation-triangle"></span>
            {{t 'archive_empty'}}
        </div>
    </div>
    {{/if}}
</div>
</form>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <!--<div class="container">
            <p>{{t 'backup_archive_download'}}</p>
            <a role="button" class="btn btn-info slide" href="#/backup/{{storage.id}}/{{name}}/download">
                <span class="fa-download"></span> {{t 'download'}}
            </a>
        </div>
        <hr>-->
        <div class="container">
            <p>{{t 'backup_archive_delete'}}</p>
            <a href="#/backup/{{storage.id}}/{{name}}/delete" role="button" class="btn btn-danger slide">
                <span class="fa-trash-o"></span> {{t 'delete'}}
            </a>
        </div>
        {{#if other_storages}}
            <hr>
            <div class="container">
                <p>{{t 'backup_archive_copy'}}</p>
                <form action="#/backup/{{storage.id}}/{{name}}/copy" method="POST" class="form-horizontal">
                    <div class="form-group has-feedback">
                        <label for="label" class="col-sm-12">{{t 'url'}}</label>
                        <div class="col-sm-12">
                            <select id="storage" name="storage" class="form-control" required>
                                {{#each storages}}
                                    <option value="{{id}}">{{name}} ({{uri}})</option>
                                {{/each}}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="text-center">
                            <input type="submit" role="button" class="btn btn-success slide" value="{{t 'copy'}}">
                        </div>
                    </div>
                </form>
            </div>
        {{/if}}
    </div>
</div>
