<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/domains">{{t 'domains'}}</a>
    <a href="#/domains/{{name}}">{{name}}</a>
    <a href="#/domains/{{name}}/dns">{{t 'dns'}}</a>
</div>
<div class="separator"></div>

<div class="alert alert-warning">
    <span class="fa-fw fa-warning"></span> {{t 'domain_dns_conf_is_just_a_recommendation' }}
</div>

<div class="panel panel-default">
  <div class="panel-heading">
    <h2 class="panel-title">
        <span class="fa-fw fa-globe"></span> {{t 'domain_dns_config'}}
    </h2>
  </div>
  <div class="panel-body">
  <pre>{{dns}}</pre>
  </div>
</div>
