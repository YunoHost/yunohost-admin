<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/logs">{{t 'logs'}}</a>
    {{#if log.name}}
    <a href="#/tools/logs/{{ log.name }}">{{ log.name }}</a>
    {{else}}
    <a href="#/tools/logs/{{ log.log_path }}">{{ log.log_path }}</a>
    {{/if}}
</div>

<div class="actions-group">
    <a href="javascript:void(null);" onclick="c.api('/logs/display?path={{#if log.name}}{{ log.name }}{{else}}{{ log.log_path }}{{/if}}&share', function(data) { $('div.loader').remove(); window.open(data.url, '_blank'); });" class="btn btn-success">
        <span class="fa-cloud-upload"></span> {{t 'logs_share_with_yunopaste'}}
    </a>
</div>

<div class="separator"></div>

{{#intl locales=locale}}
{{#if log.metadata}}
<div class="panel panel-default">
    <div class="panel-heading">
<!-- PLEASE DON'T INDENT THIS CODE, IT IS PASTED ON YUNOPASTE -->
<h2 class="panel-title" id="description"><span class="fa-fw fa-info-circle"></span> {{ log.description }}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal" id="metadata">
<dt>{{t 'logs_path'}}</dt> <dd>{{ log.log_path }}</dd>
{{#if log.metadata.started_at}}<dt>{{t 'logs_started_at'}}</dt> <dd>{{formatTime log.metadata.started_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>
{{/if}}{{#if log.metadata.ended_at}}<dt>{{t 'logs_ended_at'}}</dt> <dd>{{formatTime log.metadata.ended_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>{{/if}}
{{#if log.metadata.error}}<dt>{{t 'logs_error'}}</dt> <dd>{{t 'logs_end_with_error'}} {{log.metadata.error}}</dd>{{/if}}
        </dl>
    </div>
</div>
{{#if log.metadata.env}}
<div class="panel panel-default">
    <div class="panel-heading" role="tab" id="heading-context">
        <h2 class="panel-title">
            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-context" aria-expanded="true" aria-controls="collapse-context">
                <span class="fa-fw fa-bug"></span>{{t 'logs_context'}}
            </a>
        </h2>
    </div>
    <div id="collapse-context" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-context">
    <div class="panel-body">
        <dl class="dl-horizontal" id="env">
{{#each log.metadata.env}}<dt>{{@key}}</dt> <dd>{{.}}</dd>
{{/each}}
        </dl>
    </div>
    </div>
</div>
{{/if}}

{{/if}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-file-text"></span> {{#if log.metadata}}{{t 'logs'}}{{else}}{{log.log_path}}{{/if}}</h2>
    </div>
    <div class="panel-body overflow-auto">
{{#if next_number}}<a href="#/tools/logs/{{#if log.name}}{{ log.name }}{{else}}{{ log.log_path }}{{/if}}?number={{ next_number }}" class="btn btn-default full-width"><span class="fa-fw fa-plus"></span> {{t 'logs_more'}}</a>{{/if}}
        <!-- no indent because pre is sensible to whitespaces -->
<pre id="log" class="full-width">{{#log.logs}}{{.}}
{{/log.logs}}</pre>
    </div>
</div>
{{/intl}}
