<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/lists">{{t 'appslists'}}</a>
    <a href="#/apps/lists/{{name}}">{{appslist.name}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'name'}}</dt>
            <dd>{{appslist.name}}</dd>
            <dt>{{t 'url'}}</dt>
            <dd>{{appslist.url}}</dd>
            <dt>{{t 'appslists_last_update'}}</dt>
            <dd>{{formatTime appslist.lastUpdate day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>
        </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <div class="container">
            <p>{{t 'appslists_info_refresh_desc'}}</p>
            <a href="#/apps/lists/{{appslist.name}}/refresh" role="button" class="btn btn-info slide">
                <span class="fa-refresh"></span> {{t 'refresh_app_list'}}
            </a>
        </div>
        {{#appslist.removable}}
        <hr>
        <div class="container">
            <p>{{t 'appslists_info_remove_desc'}}</p>
            <a role="button" href="#/apps/lists/{{appslist.name}}/remove" class="btn btn-danger slide back">
                <span class="fa-trash-o"></span> {{t 'remove'}}
            </a>
        </div>
        {{/appslist.removable}}
    </div>
</div>
