<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/update">{{t 'system_update'}}</a>
    <a href="#/upgrade">{{t 'system_upgrade'}}</a>
</div>

<div class="separator"></div>

{{#if logs}}
<pre id="upgrade-log" class="upgrade-log log">
{{#logs}}
    {{.}}
{{/logs}}
</pre>
<button data-paste-content="#upgrade-log"><i class="fa-cloud-upload"></i> {{t 'upload'}}</button>
{{else}}
        {{t 'no_log'}}
{{/if}}
