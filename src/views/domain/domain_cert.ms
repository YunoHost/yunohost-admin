<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/domains">{{t 'domains'}}</a>
    <a href="#/domains/{{name}}">{{name}}</a>
    <a href="#/domains/{{name}}/cert-management">{{t 'certificate'}}</a>
</div>

<div class="separator"></div>


<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-lock"></span> {{t 'certificate_status'}}
        </h2>
    </div>
    <div class="panel-body">
    
    <div class="alert alert-{{status.alert_type}}">
        <span class="fa-fw fa-{{status.alert_icon}}"></span> {{status.alert_message}}
    </div>
    
    <dl class="dl-horizontal">
            <dt>{{t 'certificate_authority'}}</dt>
            <dd>{{status.CA_type}} ({{status.CA_name}})</dd>
            <dt>{{t 'validity'}}</dt>
            <dd>{{status.validity}} days</dd>
        </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">

        {{#if actions_enabled.install_letsencrypt}}
        <div class="container">
        {{#if status.ACME_eligible}}
            <p><span class="fa-fw fa-check"></span> 
            {{t 'domain_is_eligible_for_ACME'}}</p>
        {{else}}
            <p><span class="fa-fw fa-meh-o"></span>
            {{t 'domain_not_eligible_for_ACME'}}</p>
        {{/if}}
            <button class="btn btn-success {{#unless status.ACME_eligible}}disabled{{/unless}}" data-domain="{{name}}" data-action="install-LE" >
                <span class="fa-star"></span> {{t 'install_letsencrypt_cert'}}
            </button>
        <hr>
        </div>
        {{/if}}
        {{#if actions_enabled.manual_renew_letsencrpt}}
        <div class="container">
        <p>{{t 'manually_renew_letsencrypt_message'}}</p>
            <button class="btn btn-warning" data-domain="{{name}}" data-action="renew-letsencrypt">
                <span class="fa-refresh"></span> {{t 'manually_renew_letsencrypt'}}
            </button>
        </div>
        <hr>
        {{/if}}
        {{#if actions_enabled.regen_selfsigned}}
        <div class="container">
        <p>{{t 'regenerate_selfsigned_cert_message'}}</p>
            <button class="btn btn-warning" data-domain="{{name}}" data-action="regen-selfsigned">
                <span class="fa-refresh"></span> {{t 'regenerate_selfsigned_cert'}}
            </button>
        </div>
        <hr>
        {{/if}}
        {{#if actions_enabled.replace_with_selfsigned}}
        <div class="container">
            <p>{{t 'revert_to_selfsigned_cert_message'}}</p>
            <button class="btn btn-danger" data-domain="{{name}}" data-action="replace-with-selfsigned">
                <span class="fa-exclamation-triangle"></span> {{t 'revert_to_selfsigned_cert'}}
            </button>
        </div>
        {{/if}}
    </div>
</div>


