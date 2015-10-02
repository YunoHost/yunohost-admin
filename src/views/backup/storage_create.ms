
<div class="btn-breadcrumb">
    <a href="#/"><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/backup" class="btn btn-default">{{t 'backup'}}</a>
    <a href="#/backup/{{storage.id}}/create" class="btn btn-default">{{t 'storage_create'}}</a>
</div>

<div class="separator"></div>

<form action="#/storages" method="POST" class="form-horizontal">    
    <div class="panel panel-default">
        <div class="panel-body">
            <div class="form-group">
                <label for="type" class="col-sm-3 control-label">{{t 'backup_type'}}</label>
                <div class="col-sm-9">
                    <select class="form-control" name="type">
                           <option>sftp</option>
                           <option>ftp</option>
                           <option>rsync</option>
                   </select>
                </div>
            </div>
            <div class="form-group">
                <label for="domain" class="col-sm-3 control-label">{{t 'domain'}}</label>
                <div class="col-sm-9">
                    <input type="text" id="domain" name="domain" class="form-control" placeholder="monserver.fr" required>
                </div>
            </div>
            <div class="form-group">
                <label for="username" class="col-sm-3 control-label">{{t 'user_username'}}</label>
                <div class="col-sm-9">
                    <input type="text" id="username" name="username" class="form-control" placeholder="johndoe" required>
                </div>
            </div>
            <div class="form-group">
                <label for="password" class="col-sm-3 control-label">{{t 'password'}}</label>
                <div class="col-sm-9">
                    <input type="password" id="password" name="password" class="form-control" placeholder="•••••" required>
                </div>
            </div>
            <div class="form-group">
                <label for="path" class="col-sm-3 control-label">{{t 'path'}}</label>
                <div class="col-sm-9">
                    <input type="text" id="path" name="path" class="form-control" placeholder="~/" required>
                </div>
            </div>
        </div>
    </div>
    <div class="text-center">
        <input type="submit" class="btn btn-success slide back" value="{{t 'save'}}">
    </div>
</form>
