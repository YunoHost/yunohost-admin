<div class="pull-left">
    <a href="#/tools/update" class="btn btn-default slide back">
       <span class="fa-chevron-left"></span> {{t 'system_update'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'system_upgrade'}}</h1>
<div class="br"></div>

{{#if logs}}
<pre class="upgrade-log log">
{{#logs}}
    {{.}}
{{/logs}}
</pre>
{{else}}
No log.
{{/if}}