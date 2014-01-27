{{#Installed}}
<div class="pull-left">
    <a href="#/" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="pull-right">
    <a href="#/apps/install" class="btn btn-success slide"><span class="glyphicon glyphicon-plus"></span> Install</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Installed apps</div>
{{/Installed}}


{{^Installed}}
<div class="pull-left">
    <a href="#/apps" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Installed apps</a>
</div>
<div class="pull-right">
    <a href="#/apps/refresh" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh list</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Available apps</div>
{{/Installed}}

<div class="br"></div>

<div class="list-group">
{{#Apps}}
    <a href="#/apps/{{^Installed}}install/{{/Installed}}{{ID}}" class="list-group-item slide">
        <h4 class="pull-left list-group-item-heading">{{Name}} <small>{{ID}}</small></h4>
        <span class="glyphicon glyphicon-chevron-right pull-right"></span>
        <div class="clearfix"></div>
        <p class="list-group-item-text">{{Description.en}}</p>
    </a>
{{/Apps}}

{{^Apps}}
<div class="alert alert-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    No installed apps.
</div>
{{/Apps}}

</div>
