<form action="#/postinstall" method="POST" class="form-horizontal">

<div class="well">
    <p>A last step is necessary to fulfill the installation: You have to link your YunoHost instance to a domain name, and set a new administrator password.</p>
</div>

<div class="br"></div>
<h2>Domain</h2>
<div class="br"></div>
<div class="panel-group" id="accordion">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
          I already have a domain name...
        </a>
      </h4>
    </div>
    <div id="collapseOne" class="panel-collapse collapse in">
      <div class="panel-body">
        <small>... and I have <a href="http://doc.yunohost.org/#/dns">set my DNS correctly</a>.</small>
        <hr>
        <div class="form-group">
            <label for="domain" class="col-sm-3 control-label">Domain name</label>
            <div class="col-sm-9 input-group">
                <span class="input-group-addon"> <span class="glyphicon glyphicon-cloud"></span> </span>
                <input type="text" name="domain" class="form-control" placeholder="myserver.org">
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
          I don't have a domain name...
        </a>
      </h4>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <small>... and I want a dynamic DNS service.</small>
        <hr>
        <div class="form-group">
            <label for="ddomain" class="col-sm-3 control-label">Domain name</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6 input-group">
                <span class="input-group-addon"> <span class="glyphicon glyphicon-cloud"></span> </span>
                <input type="text" name="ddomain" class="form-control" placeholder="myserver">
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="ddomain-ext">
                   {{#DDomains}}
                       <option>{{.}}</option>
                   {{/DDomains}}
               </select>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="br"></div>

<h2>Password</h2>
<div class="br"></div>
<div class="form-group">
    <label for="password" class="col-sm-3 control-label">New admin password</label>
    <div class="col-sm-9">
        <input type="password" name="password" class="form-control" placeholder="••••••">
    </div>
</div>

<div class="form-group">
    <label for="confirmation" class="col-sm-3 control-label">Confirmation</label>
    <div class="col-sm-9">
        <input type="password" name="confirmation" class="form-control" placeholder="••••••">
    </div>
</div>

<div class="br"></div>

<div class="text-center">
    <input type="submit" class="btn btn-success" value="Go !">
</div>

</form>
