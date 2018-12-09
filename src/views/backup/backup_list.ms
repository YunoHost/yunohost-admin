<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup">{{t 'backup'}}</a>
    <a href="#/backup/{{storage.id}}">{{storage.name}}</a>
</div>

<div class="actions-group">
    <a role="button" href="#/backup/{{storage.id}}/create" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'backup_new'}}
    </a>
</div>

<div class="separator"></div>

{{#intl locales=locale}}
<div class="list-group">
{{#each archives}}
    <a href="#/backup/{{../storage.id}}/{{name}}" class="list-group-item slide clearfix" title='{{formatTime created_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}'>
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{formatRelative created_at}} <small>{{name}} ({{humanSize size}})</small></h2>
        <p class="list-group-item-text">{{path}}</p>
    </a>
{{/each}}
{{^archives}}
    <div class="alert alert-warning">
        <span class="fa-exclamation-triangle"></span>
        {{t 'backups_no'}}
    </div>
{{/archives}}

</div>
{{/intl}}

<!--<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-download"></span> {{t 'upload_archive'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/backup/{{storage.id}}/upload" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="label" class="col-sm-12">{{t 'url'}}</label>
                <div class="col-sm-12">
                    <input type="file" id="url" name="url" value="" required pattern="^.*\.tar\.gz$">
                </div>
            </div>
            <div class="form-group">
                <div class="text-center">
                    <input type="submit" class="btn btn-success slide" value="{{t 'upload'}}">
                </div>
            </div>
        </form>
    </div>
</div>-->
