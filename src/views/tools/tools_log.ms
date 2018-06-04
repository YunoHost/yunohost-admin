<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/logs">{{t 'logs'}}</a>
    <a href="#/tools/logs/{{ log.log_path }}">{{ log.log_path }}</a>
</div>

<div class="actions-group">
    <a data-paste-content="#description, #metadata, #env, #log" class="btn btn-success">
        <span class="fa-cloud-upload"></span> {{t 'upload'}}
    </a>
</div>

<div class="separator"></div>

{{#if log.metadata}}
<div class="panel panel-default">
    <div class="panel-heading">
<!-- PLEASE DON'T INDENT THIS CODE, IT IS PASTED ON YUNOPASTE -->
<h2 class="panel-title" id="description"><span class="fa-fw fa-info-circle"></span> {{ log.description }}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal" id="metadata">
<dt>{{t 'path'}}</dt> <dd>{{ log.log_path }}</dd>
{{#if log.metadata.started_at}}<dt>{{t 'started_at'}}</dt> <dd>{{formatTime log.metadata.started_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>
{{/if}}{{#if log.metadata.ended_at}}<dt>{{t 'ended_at'}}</dt> <dd>{{formatTime log.metadata.ended_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>{{/if}}
        </dl>
    </div>
</div>
{{#if log.metadata.env}}
<div class="panel panel-default">
    <div class="panel-heading" role="tab" id="heading-context">
        <h2 class="panel-title">
            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-context" aria-expanded="true" aria-controls="collapse-context">
                <span class="fa-fw fa-bug"></span>{{t 'Context'}}
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
        {{#if log.metadata.error}}
            <div class="alert alert-warning" role="alert"><span class="fas fa-exclamation-triangle"></span> <strong>{{t 'Error'}}</strong>: {{log.metadata.error}}</div>
        {{/if}}
{{#if next_number}}<a href="#/tools/logs/{{#if log.name}}{{ log.name }}{{else}}{{ log.log_path }}{{/if}}?number={{ next_number }}">MORE</a>{{/if}}
        <!-- no indent because pre is sensible to whitespaces -->
<pre id="log" class="full-width">{{#log.logs}}{{.}}
{{/log.logs}}</pre>
    </div>
</div>
