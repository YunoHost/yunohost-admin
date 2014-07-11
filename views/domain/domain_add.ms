<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/domains" class="btn btn-default"><div>{{t 'domain_list'}}</div></a>
            <a href="#/domains/add" class="btn btn-default"><div>{{t 'domain_add'}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>

<div class="br"></div>

<form action="#/domains/add" method="POST" class="form-horizontal">

<div class="panel-group" id="accordion">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
          {{t 'domain_add_panel_with_domain'}}
        </a>
      </h4>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <small>{{t 'domain_add_dns_doc'}}</small>
        <hr>
        <div class="form-group">
            <label for="domain" class="col-sm-3 control-label">{{t 'domain_name'}}</label>
            <div class="col-sm-9">
                <input type="text" id="domain" name="domain" class="form-control" placeholder="{{t 'myserver_org'}}">
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
        <hr>
        <div class="form-group">
            <label for="ddomain" class="col-sm-3 control-label">{{t 'domain_name'}}</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" id="ddomain" name="ddomain" class="form-control" placeholder="{{t 'myserver'}}">
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

<div class="text-center">
    <input type="submit" class="btn btn-success slide back" value="{{t 'add'}}">
</div>

</form>
