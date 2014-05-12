<div class="pull-left">
    <a href="#/tools" class="btn btn-default slide back">
    	<span class="fa-chevron-left"></span> {{t 'tools'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'tools_adminpw'}}</h1>
<div class="br"></div>

<form action="#/tools/adminpw" method="PUT" class="form-horizontal">

	<div class="panel panel-default">
	    <div class="panel-body">
	        <div class="form-group">
	            <label for="old_password" class="col-sm-3 control-label">{{t 'tools_adminpw_current'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="old_password" class="form-control" placeholder="{{t 'tools_adminpw_current_placeholder'}} "/>
	            </div>
	        </div>
	        <hr />
	        <div class="form-group">
	            <label for="new_password" class="col-sm-3 control-label">{{t 'password_new'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="new_password" class="form-control" placeholder="{{t 'tools_adminpw_new_placeholder'}} "/>
	            </div>
	        </div>
	        <div class="form-group">
	            <label for="confirm_new_password" class="col-sm-3 control-label">{{t 'password_confirm'}}</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="confirm_new_password" class="form-control" placeholder="{{t 'tools_adminpw_confirm_placeholder'}}" />
	            </div>
	        </div>
	    </div>
	</div>

	<div class="text-center">
	    <input type="submit" class="btn btn-success slide back" value="{{t 'save'}}">
	</div>

</form>
