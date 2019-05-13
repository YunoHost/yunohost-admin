<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/logs">{{t 'logs'}}</a>
</div>

<div class="separator"></div>

{{#intl locales=locale}}
{{#if data}}
<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
{{#data}}
{{#if value}}
    <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="heading-{{key}}">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-{{key}}" aria-expanded="true" aria-controls="collapse-{{key}}">
                    <span class="fa-fw fa-{{icon}}"></span>{{t (concat 'logs_' key)}}
                </a>
            </h2>
        </div>
        <div id="collapse-{{key}}" class="panel-collapse{{#if @first}}{{else}} collapse{{/if}}" role="tabpanel" aria-labelledby="heading-{{key}}">
            <div class="list-group">
            {{#value}}
                <a href="#/tools/logs/{{ name }}" class="list-group-item" title='{{formatTime started_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}'><small style="margin-right:20px;" >{{formatRelative started_at}}</small>
                <span class="fa-fw fa-{{success_icon}}"></span> {{ description }}</a>
            {{/value}}
            </div>
        </div>
    </div>
{{/if}}
{{/data}}
</div>
{{/if}}
{{/intl}}
