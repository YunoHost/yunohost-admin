<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/catalog">{{t 'install'}}</a>
</div>

<div class="separator"></div>

<div class="input-group" id="app-filter-input">
    <div id="back-to-category-selection" class="input-group-btn"><button class="btn btn-primary"><i class="fa-arrow-left"></i></button></div>
    <span id="current-category-filter" class="input-group-addon"></span>
    <span id="current-category-separator" class="input-group-addon" style="background: white;border: none;">&nbsp;</span>
    <span class="input-group-addon"><i class="fa-search"></i></span>
    <input type="text" id="filter-app-cards" class="form-control" role="textbox"  placeholder="{{t 'search_for_apps'}}" aria-describedby="basic-addon0"/>
    <div class="input-group-btn">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span id="app-cards-list-filter-text">{{t 'only_decent_quality_apps'}}</span> <span class="caret"></span>
        </button>
        <ul id="dropdownFilter" class="dropdown-menu" data-filter="decentQuality" role="menu">
            <li role="presentation" class="button dropdownFilter" data-filter="isHighQuality"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'only_highquality_apps'}}</a></li>
            <li role="presentation" class="button dropdownFilter" data-filter="decentQuality"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'only_decent_quality_apps'}}</a></li>
            <li role="presentation" class="button dropdownFilter" data-filter="isworking"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'only_working_apps'}}</a></li>
            <li role="presentation" class="button dropdownFilter" data-filter="*"><a class="menu-item" role="menu-item" tabindex="-1">{{t 'all_apps'}}</a></li>
        </ul>
    </div>
</div>

<div class="separator"></div>

<div id="category-selector" class="list-group grid">
  {{#categories}}
  <button class="app-category-card panel panel-default" data-category="{{id}}">
        <div class="panel-body">
            <h2 class="app-category-title" style="white-space: normal"><span class="fa-fw fa-{{icon}}"></span> {{title}}</h2>
            <h3 class="app-category-card-desc" style="white-space: normal">{{description}}</h3>
        </div>
  </button>
  {{/categories}}
</div>

{{#categories}}
<div class="subtag-selector" data-app-category="{{id}}" style="text-align: center">
    {{#if subtags}}
    <button class="btn btn-default active" data-subtag="all">All</button>
    {{/if}}
    {{#subtags}}
    <button class="btn btn-default" data-subtag="{{.}}">{{.}}</button>
    {{/subtags}}
    {{#if subtags}}
    <button class="btn btn-default" data-subtag="others">Others</button>
    {{/if}}
</div>
{{/categories}}


<div class="separator"></div>

<div id="apps" class="list-group grid">
{{#apps}}
  <div class="app-card panel panel-default {{state}} {{isWorking}} {{isHighQuality}} {{decentQuality}} {{level}}-level" data-category="{{category}}" data-subtags="{{#subtags}}{{.}}{{#unless @last}},{{/unless}}{{/subtags}}">
        <div class="panel-body">
            <h2 class="app-title">
            {{manifest.name}}
            {{#if (eq state 'working') }}
            {{#if (eq decentQuality 'badQuality')}}
            <span class="label label-warning label-as-badge app-state" title="{{t 'app_state_low_quality_explanation' }}">{{t 'app_state_low_quality' }}</span>
            {{/if}}
            {{else}}
            <span class="label label-{{stateColor}} label-as-badge app-state" title="{{t (concat 'app_state_' state '_explanation') }}">{{t (concat 'app_state_' state) }}</span>
            {{/if}}
            </h2>
            <div class="app-card-desc">{{manifest.description}}</div>
        </div>
            <div class="app-card-date-maintainer">
              {{#if (eq maintainedColor 'danger') }}
              <span class="text text-warning maintained-status" title="{{t (concat maintained '_details') }}"><i class="fa-warning"></i> {{t maintained}}</span>
              {{/if}}
            </div>
            <div class="btn-group" role="group">
                <a href="{{git.url}}" target="_BLANK" type="button" role="button" class="btn btn-default col-xs-4">
                    <i class="fa-code"></i> Code
                </a>
                <a href="{{git.url}}/blob/master/README.md" target="_BLANK" type="button" role="button" class="btn btn-default col-xs-4">
                    <i class="fa-book"></i> Readme
                </a>
                {{#installable}}
                <a href="#/apps/install/{{manifest.id}}" type="button" role="button" class="btn btn-{{installColor}} col-xs-4 active">
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
