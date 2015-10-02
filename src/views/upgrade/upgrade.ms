<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/update">{{t 'system_update'}}</a>
    <a href="#/upgrade">{{t 'system_upgrade'}}</a>
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
