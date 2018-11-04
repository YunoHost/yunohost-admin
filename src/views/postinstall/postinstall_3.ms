<form action="#/postinstall" method="POST" class="form-horizontal">

<h2>{{t 'password'}}</h2>
<p class="lead">
    {{t 'postinstall_password'}}
</p>
<div class="panel panel-default">
  <div class="panel-body">

    <div class="alert alert-warning">{{t 'good_practices_about_admin_password'}}</div>

    <div class="form-group">
        <label for="password" class="col-sm-4 control-label">{{t 'administration_password'}}</label>
        <div class="col-sm-8">
            <input required type="password" id="password" name="password" class="form-control" placeholder="••••••">
        </div>
    </div>

    <div class="form-group">
        <label for="confirmation" class="col-sm-4 control-label">{{t 'password_confirmation'}}</label>
        <div class="col-sm-8">
            <input required type="password" id="confirmation" name="confirmation" class="form-control" placeholder="••••••">
        </div>
    </div>

  </div>
</div>

<input name="domain" type="hidden" value="{{ domain }}">

<div class="pull-left">
    <a href="#/postinstall/domain" class="btn btn-default btn-lg slide back">
    	<span class="fa-chevron-left"></span> {{t 'previous'}}
    </a>
</div>

<div class="pull-right">
    <input type="submit" class="btn btn-default btn-lg btn-primary" value="{{t 'Go !'}}">
</div>

</form>
