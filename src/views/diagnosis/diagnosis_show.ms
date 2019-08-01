<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/diagnosis">{{t 'diagnosis'}}</a>
</div>

<div class="actions-group">
    <a href="javascript:void(null);" onclick="c.api('/diagnosis/show?share', function(data) { $('div.loader').remove(); window.open(data.url, '_blank'); });" class="btn btn-success">
        <span class="fa-cloud-upload"></span> {{t 'logs_share_with_yunopaste'}}
    </a>
</div>

<div class="separator"></div>

{{#reports}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block; margin-right: 10px;">
        <a data-toggle="collapse" href="#category-{{id}}">{{ description }}</a>
        </h2>
        {{#if noIssues}}<span class="label label-success">{{t 'everything_good'}}</span>{{/if}}
        {{#if errors}}<span class="label label-danger">{{t 'errors' errors }}</span>{{/if}}
        {{#if warnings}}<span class="label label-warning">{{t 'warnings' warnings }}</span>{{/if}}
        <a role="button" category="{{ id }}" class="btn btn-sm btn-info pull-right rerun-diagnosis"><span class="fa-fw fa-refresh"></span> {{t 'rerun_diagnosis'}}</a>
    </div>
    <div class="panel-body collapse {{#unless noIssues}}in{{/unless}}" id="category-{{id}}">
    <ul class="list-group" style="margin-bottom: 0px">
        <p>{{t 'last_ran' }} {{formatRelative time day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" }}</p>
        {{#items}}
        <li class="list-group-item alert alert-{{status}} alert-{{status}}-yo clearfix">
            {{#if icon}}
            <span class="fa-fw fa-{{icon}}"></span>
            {{/if}}
            {{summary}}
            {{#if issue}}
            <a href="#" role="button" class="btn btn-sm btn-warning pull-right"><span class="fa-fw fa-times"></span> {{t 'ignore'}}</a>
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
