<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/domains">{{t 'domains'}}</a>
    <a href="#/domains/{{name}}">{{name}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
  <div class="panel-heading">
    <h2 class="panel-title">
        <span class="fa-fw fa-globe"></span> {{name}}
    </h2>
  </div>
  <div class="panel-body">
    {{#if main}}
    <p class="alert alert-success">
        <span class="fa-star" title="{{t 'default'}}"></span> {{t 'domain_default_longdesc'}}
    </p>
    {{/if}}
    <p><a href="{{url}}" target="_blank">{{url}}</a></p>

  </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <div class="container">
            <p>{{t 'domain_visit_url' url}}</p>
            <a role="button" href="{{url}}" class="btn btn-success" target="_blank">
                {{t 'domain_visit'}} <span class="fa-fw fa-external-link"></span>
            </a>
        </div>
        {{#unless main}}
        <hr>
        <div class="container">
            <p>{{t 'domain_default_desc'}}</p>
            <form method="POST" action="#/domains">
                    <input type="hidden" name="domain" value="{{name}}" required class="form-control">
                    <button type="submit" class="btn btn-primary slide back" value="{{t 'set_default'}}">
                        {{t 'set_default'}} <span class="fa-fw fa-star"></span>
                    </button>
            </form>
        </div>
        {{/unless}}
        <hr>
        <div class="container">
            <p>{{t 'domain_dns_longdesc'}}</p>
            <a role="button" href="#/domains/{{name}}/dns"  class="btn btn-default slide">
                {{t 'domain_dns_config'}} <span class="fa-fw fa-globe"></span>
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'certificate_manage'}}</p>
            {{#unless enable_cert_management}}
            <p><span class="fa-fw fa-exclamation-circle"></span>
            {{t 'certificate_old_letsencrypt_app_conflict'}}
            </p>
            {{/unless}}
            <a href="#/domains/{{name}}/cert-management" role="button" class="btn btn-default slide {{#unless enable_cert_management}}disabled{{/unless}}">
                {{t 'ssl_certificate'}} <span class="fa-fw fa-lock"></span>
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'domain_delete_longdesc' name}}</p>
            <a href="#/domains/{{name}}/delete" role="button" class="btn btn-danger slide back">
                {{t 'delete'}} <span class="fa-fw fa-trash-o"></span>
            </a>
        </div>
    </div>
</div>
