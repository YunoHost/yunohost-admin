<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/adminpw">{{t 'tools_adminpw'}}</a>
</div>

<div class="separator"></div>

<div class="alert alert-warning">{{t 'good_practices_about_admin_password'}}</div>

<form action="#/tools/adminpw" method="PUT" class="form-horizontal">

	<div class="panel panel-default">
	    <div class="panel-body">
	        <div class="form-group">
	            <label for="old_password" class="col-sm-3 control-label">{{t 'tools_adminpw_current'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" id="old_password" name="old_password" class="form-control" placeholder="{{t 'tools_adminpw_current_placeholder'}} "/>
	            </div>
	        </div>
	        <hr />
	        <div class="form-group">
	            <label for="new_password" class="col-sm-3 control-label">{{t 'password_new'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" id="new_password" name="new_password" class="form-control" placeholder="{{t 'tools_adminpw_new_placeholder'}} "/>
	            </div>
	        </div>
	        <div class="form-group">
	            <label for="confirm_new_password" class="col-sm-3 control-label">{{t 'password_confirmation'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" id="confirm_new_password" name="confirm_new_password" class="form-control" placeholder="{{t 'tools_adminpw_confirm_placeholder'}}" />
	            </div>
	        </div>
	    </div>
	</div>

	<div class="text-center">
	    <input role="button" type="submit" class="btn btn-success slide back" value="{{t 'save'}}">
	</div>

</form>
