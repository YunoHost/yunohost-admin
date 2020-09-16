<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup">{{t 'backup'}}</a>
    <a href="#/backup/{{storage.id}}">{{storage.name}}</a>
    <a href="#/backup/{{storage.id}}/{{name}}">{{name}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block;"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
        <button class="btn btn-sm btn-success pull-right" data-action="download" data-storage="{{storage.id}}" data-archive="{{name}}">
            <span class="fa-download"></span> {{t 'download'}}
        </button>
        <button class="btn btn-sm btn-danger slide pull-right" data-action="delete" data-storage="{{storage.id}}" data-archive="{{name}}">
            <span class="fa-trash-o"></span> {{t 'delete'}}
        </button>
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
        <h2 class="panel-title" style="display: inline-block;">
          <span class="fa-fw fa-archive"></span>
          {{t 'backup_content'}}
        </h2>
        <button type="button" data-action="select_all" class="btn btn-sm btn-default pull-right">{{t 'select_all'}}</button>
        <button type="button" data-action="select_none" class="btn btn-sm btn-default pull-right">{{t 'select_none'}}</button>
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
