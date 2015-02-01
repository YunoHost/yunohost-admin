<form action="#/postinstall" method="POST" class="form-horizontal">

<div class="well">
    <p>{{t 'postinstall_intro'}}</p>
</div>

<h2>{{t 'domain'}}</h2>
<div class="panel-group" id="accordion">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
          {{t 'domain_add_panel_with_domain'}}
        </a>
      </h4>
    </div>
    <div id="collapseOne" class="panel-collapse collapse in">
      <div class="panel-body">
        <small>{{t 'domain_add_dns_doc'}}</small>
        <div class="br"></div>
        <div class="form-group">
            <strong class="col-sm-3 control-label">{{t 'domain_name'}}</strong>
            <div class="col-sm-9">
              <div class="input-group">
                <label for="domain" class="input-group-addon">
                  <span class="fa-fw fa-cloud"></span><span class="sr-only">{{t 'domain'}}</span>
                </label>
                <input type="text" id="domain" name="domain" class="form-control" placeholder="{{t 'myserver_org'}}">
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
          {{t 'domain_add_panel_without_domain'}}
        </a>
      </h4>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <small>{{t 'domain_add_dyndns_doc'}}</small>
        <div class="br"></div>
        <div class="form-group">
            <strong class="col-sm-3 control-label">{{t 'domain_name'}}</strong>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
              <div class="input-group">
                <label for="ddomain" class="input-group-addon">
                  <span class="fa-fw fa-cloud"></span><span class="sr-only">{{t 'domain'}}</span>
                </label>
                <input type="text" id="ddomain" name="ddomain" class="form-control" placeholder="{{t 'myserver'}}">
              </div>
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="ddomain-ext">
                   {{#ddomains}}
                       <option>{{.}}</option>
                   {{/ddomains}}
               </select>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="br"></div>

<h2>{{t 'password'}}</h2>
<div class="panel panel-default">
  <div class="panel-body">

    <div class="form-group">
        <label for="password" class="col-sm-3 control-label">{{t 'administration_password'}}</label>
        <div class="col-sm-9">
            <input type="password" id="password" name="password" class="form-control" placeholder="••••••">
        </div>
    </div>

    <div class="form-group">
        <label for="confirmation" class="col-sm-3 control-label">{{t 'password_confirmation'}}</label>
        <div class="col-sm-9">
            <input type="password" id="confirmation" name="confirmation" class="form-control" placeholder="••••••">
        </div>
    </div>

  </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-success" value="Go !">
</div>

</form>
