<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/diagnosis">{{t 'diagnosis'}}</a>
</div>

<div class="actions-group">
    <button class="btn btn-success" data-action="share">
        <span class="fa-cloud-upload"></span> {{t 'logs_share_with_yunopaste'}}
    </button>
</div>

<div class="separator"></div>

<div class="alert alert-warning">{{t 'diagnosis_experimental_disclaimer'}}</div>

{{#reports}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block; margin-right: 10px;">
        <a data-toggle="collapse" href="#category-{{id}}">{{ description }}</a>
        </h2>
        {{#if noIssues}}{{#if items}}<span class="label label-success">{{t 'everything_good'}}</span>{{/if}}{{/if}}
        {{#if errors}}<span class="label label-danger">{{t 'errors' errors }}</span>{{/if}}
        {{#if warnings}}<span class="label label-warning">{{t 'warnings' warnings }}</span>{{/if}}
        {{#if ignored}}<span class="label label-default">{{t 'ignored' ignored }}</span>{{/if}}
        <button class="btn btn-sm {{#if items}}btn-info{{else}}btn-success{{/if}} pull-right" data-action="rerun-diagnosis" data-category="{{ id }}"><span class="fa-fw fa-refresh"></span> {{t 'rerun_diagnosis'}}</button>
    </div>
    <div class="panel-body collapse {{#if errors}}in{{/if}}" id="category-{{id}}">
    <ul class="list-group" style="margin-bottom: 0px">
        <p>{{t 'last_ran' }} {{formatRelative time day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" }}</p>
        {{#items}}
        <li class="list-group-item alert alert-{{status}} alert-{{status}}-yo clearfix">
            {{#if icon}}
            <span class="fa-fw fa-{{icon}}"></span>
            {{/if}}
            {{summary}}
            {{#if ignored}}
            <button class="btn btn-sm btn-default pull-right" data-action="unignore" data-filter-args="{{ filter_args }}"><span class="fa-fw fa-bell"></span> {{t 'unignore'}}</button>
            {{else}}
            {{#if issue}}
            <button class="btn btn-sm btn-warning pull-right" data-action="ignore" data-filter-args="{{ filter_args }}"><span class="fa-fw fa-bell-slash"></span> {{t 'ignore'}}</button>
            {{/if}}
            {{/if}}
            {{#if details}}
            <a role="button" class="btn btn-sm btn-default pull-right" data-toggle="collapse" href="#details-{{../id}}-{{@index}}" aria-expanded="false" aria-controls="details-{{../id}}-{{@index}}"><span class="fa-fw fa-level-down"></span>{{t 'details'}}</a>
            <div class="collapse" id="details-{{../id}}-{{@index}}">
                <ul>
                {{#details}}<li>{{.}}</li>{{/details}}
                </ul>
            </div>
            {{/if}}
        </li>
        {{/items}}
    </ul>
    </div>
</div>
{{/reports}}
