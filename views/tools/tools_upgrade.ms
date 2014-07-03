<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/update">{{t 'system_update'}}</a>
    <a href="#/tools/upgrade">{{t 'system_upgrade'}}</a>
</div>

<div class="separator"></div>

{{#if logs}}
<pre class="upgrade-log log">
{{#logs}}
    {{.}}
{{/logs}}
</pre>
{{else}}
        {{t 'no_log'}}
{{/if}}
