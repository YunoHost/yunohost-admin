

<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup" class="btn btn-default">{{t 'backup'}}</a>
    <a href="#/backup/{{storage.id}}" class="btn btn-default">{{storage.name}}</a>
    <a href="#/backup/{{storage.id}}/{{name}}" class="btn btn-default">{{name}}</a>
</div>

<div class="separator"></div>

<form action="#/backup/{{storage.id}}/{{name}}/restore" method="POST" class="form-horizontal">
    <div class="list-group">
        {{#each hooks}}
            <label for="{{@key}}" class="list-group-item">
                <span class="pull-right"><input type="checkbox" id="{{@key}}" name="hooks" value="{{@key}}" checked></span>
                <h2 class="list-group-item-heading">{{name}}</h2>
            </label>
        {{/each}}
        {{#each apps}}
            <label for="{{id}}" class="list-group-item">
                <span class="pull-right"><input type="checkbox" id="{{id}}" name="apps" value="{{id}}" checked></span>
                <h2 class="list-group-item-heading">{{name}} <small>{{id}}</small></h2>
            </label>
        {{/each}}
        {{^items}}
            <div class="alert alert-warning">
                <span class="fa-exclamation-triangle"></span>
                {{t 'archive_empty'}}
            </div>
        {{/items}}
    </div>
    {{#if items}}
        <span class="pull-right">
            <input type="submit" class="btn btn-danger slide back" value="{{t 'restore'}}" />
        </span>
    {{/if}}
</form>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <div class="container">
            <p>{{t 'backup_archive_download'}}</p>
            <a class="btn btn-info slide" href="#/backup/{{storage.id}}/{{name}}/download">
                <span class="fa-download"></span> {{t 'download'}}
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'backup_archive_delete'}}</p>
            <a href="#/backup/{{storage.id}}/{{name}}/delete" class="btn btn-danger slide">
                <span class="fa-trash"></span> {{t 'delete'}}
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
                            <input type="submit" class="btn btn-success slide" value="{{t 'copy'}}">
                        </div>
                    </div>
                </form>
            </div>
        {{/if}}
    </div>
</div>
