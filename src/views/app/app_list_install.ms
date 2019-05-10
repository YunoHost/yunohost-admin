<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/install">{{t 'install'}}</a>
</div>

<div class="actions-group">
    <a href="#/apps/lists" role="button" class="btn btn-success">
        <span class="fa-list"></span> {{t 'appslists_manage'}}
    </a>
    <a href="#/apps/lists/refresh" role="button" class="btn btn-info">
        <span class="fa-refresh"></span> {{t 'refresh_app_list'}}
    </a>
</div>

<div class="separator"></div>

<div class="input-group" id="app-filter-input">
    <span class="input-group-addon"><i class="fas fa-search"></i></span>
    <input type="text" id="filter-app-cards" class="form-control" role="textbox"  placeholder="{{t 'search_for_apps'}}" aria-describedby="basic-addon0"/>
    <div class="input-group-btn">
        <button type="button" role="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span id="app-cards-list-filter-text">{{t 'only_working_apps'}}</span> <span class="caret"></span>
        </button>
        <ul id="dropdownFilter" class="dropdown-menu" data-filter="isworking" role="menu">
            <li role="presentation" class="button dropdownFilter" data-filter="isworking"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'only_working_apps'}}</a></li>
            <li role="presentation" class="button dropdownFilter" data-filter="official"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'only_official_apps'}}</a></li>
            <li role="presentation" class="button dropdownFilter" data-filter="*"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'all_apps'}}</a></li>
        </ul>
    </div>
</div>

<div class="separator"></div>

<div class="list-group grid">
{{#apps}}
  <div class="app-card panel panel-default {{status}} {{state}} {{isWorking}} {{level}}-level">
        <div class="panel-body">
            <h2 class="app-title">{{name}}</h2>
            <div class="category">
              {{#isCommunity}} <span class="label label-info label-as-badge app-status">{{t 'community'}}</span>{{/isCommunity}}
              <span class="label label-{{stateColor}} label-as-badge app-state">{{t state}}</span>
              <a target="_BLANK" href="https://yunohost.org/#/packaging_apps_levels"><span class="label label-{{levelColor}} label-as-badge app-level" title="{{t 'app_level'}}">{{t 'level'}} {{levelFormatted}}</span></a>
              {{#displayLicense}}<span class="label label-default app-license" title="{{t 'app_license'}}">{{license}}</span>{{/displayLicense}}
            </div>
            <div class="app-card-desc">{{description}}</div>
        </div>
            <div class="app-card-date-maintainer">
                <i class="fa-refresh"></i> {{formatDate updateDate day="numeric" month="long" year="numeric"}} -
                {{#maintained}}<span title="{{t 'current_maintainer_title'}}" class="maintained"></span><i class="fa-user"></i> {{manifest.maintainer.name}}</span>{{/maintained}}
            {{^maintained}}<i class="fas fa-warning"></i> {{t 'unmaintained'}}{{/maintained}}
            </div>
            <div class="btn-group" role="group">
                <a href="{{git.url}}" target="_BLANK" type="button" role="button" class="btn btn-default col-xs-4">
                    <i class="fa-globe"></i> Code
                </a>
                <a href="{{git.url}}/blob/master/README.md" target="_BLANK" type="button" role="button" class="btn btn-default col-xs-4">
                    <i class="fa-book"></i> Readme
                </a>
                {{#installable}}
                <a href="#/apps/install/{{id}}" type="button" role="button" class="btn btn-{{installColor}} col-xs-4 active">
                    <i class="fa-plus"></i> {{t 'install'}}{{^isSafe}} <i class="fa-warning"></i>{{/isSafe}}
                </a>
                {{/installable}}
                {{^installable}}
                <span type="button" class="btn btn-default col-sm-4 active disabled"> {{t 'installed'}}</span>
                {{/installable}}
            </div>
    </div>
{{/apps}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-download"></span> {{t 'custom_app_install'}}</h2>
    </div>
    <div class="panel-body">
        <p class="alert alert-warning">
            <span class="fa-warning"></span>
            {{t 'confirm_install_custom_app'}}
        </p>
        <div class="alert alert-info">
            <p><span class="fa-lightbulb-o"></span>
            {{t 'install_custom_app_appslists_info'}}</p>
            <p>
                <a role="button" href="#/apps/lists" class="btn btn-info">{{t 'appslists_manage'}}</a>
            </p>
        </div>
        <form action="#/apps/install/custom" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="url" class="col-sm-12">{{t 'url'}}</label>
                <div class="col-sm-12">
                    <input type="url" id="url" name="url" class="form-control" value="" placeholder="https://github.com/USER/REPOSITORY" required pattern="^https://github.com/[a-zA-Z0-9-_.]+/[a-zA-Z0-9-_.]+[/]?$">
                    <p class="text-warning">
                        <span class="fa-github"></span> {{t 'custom_app_url_only_github'}}
                    </p>
                </div>
            </div>
            <div class="form-group">
                <div class="text-center">
                    <input type="submit" role="button" class="btn btn-success slide" value="{{t 'install'}}">
                </div>
            </div>
        </form>
    </div>
</div>
