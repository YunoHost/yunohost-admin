<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/firewall" class="btn btn-default"><div>{{t 'firewall'}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>
<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-shield"></span> {{t 'ports'}}</h2>
    </div>
    <div class="panel-body">
        <div class="table-responsive">
            <h3>{{t 'tcp'}}</h3>
            <table class="table table-striped table-hover table-condensed table-firewall">
                <thead>
                <tr>
                    <th>{{t 'port'}}</th>
                    <th>{{t 'ipv4'}}</th>
                    <th>{{t 'ipv6'}}</th>
                    <th>{{t 'upnp'}}</th>
                </tr>
                </thead>
                <tbody>
                {{#each ports.TCP}}
                <tr>
                    <td>{{@key}}</td>
                    <td>
                    {{#if this.ipv4}}
                    <span class="fa-check"></span>
                    <a class="btn btn-xs btn-danger" href="#/firewall/port/{{@key}}/tcp/ipv4/close">{{t 'close'}}</a>
                    {{else}}
                    <span></span>
                    <span class="fa-times"></span>
                    <a class="btn btn-xs btn-success" href="#/firewall/port/{{@key}}/tcp/ipv4/open">{{t 'open'}}</a>
                    {{/if}}
                    </td>
                    <td>
                    {{#if this.ipv6}}
                    <span class="fa-check"></span>
                    <a class="btn btn-xs btn-danger" href="#/firewall/port/{{@key}}/tcp/ipv6/close">{{t 'close'}}</a>
                    {{else}}
                    <span class="fa-times"></span>
                    <a class="btn btn-xs btn-success" href="#/firewall/port/{{@key}}/tcp/ipv6/open">{{t 'open'}}</a>
                    {{/if}}
                    </td>
                    <td>
                    {{#if this.uPnP}}
                    <span class="fa-check"></span>
                    {{else}}
                    <span class="fa-times"></span>
                    {{/if}}
                    </td>
                </tr>
                {{/each}}
                </tbody>
            </table>
        </div>
        <div class="table-responsive">
            <h3>{{t 'udp'}}</h3>
            <table class="table table-striped table-hover table-condensed table-firewall">
                <thead>
                <tr>
                    <th>{{t 'port'}}</th>
                    <th>{{t 'ipv4'}}</th>
                    <th>{{t 'ipv6'}}</th>
                    <th>{{t 'upnp'}}</th>
                </tr>
                </thead>
                <tbody>
                {{#each ports.UDP}}
                <tr>
                    <td>{{@key}}</td>
                    <td>
                    {{#if this.ipv4}}
                    <span class="fa-check"></span>
                    <a class="btn btn-xs btn-danger" href="#/firewall/port/{{@key}}/tcp/ipv4/close">{{t 'close'}}</a>
                    {{else}}
                    <span></span>
                    <span class="fa-times"></span>
                    <a class="btn btn-xs btn-success" href="#/firewall/port/{{@key}}/tcp/ipv4/open">{{t 'open'}}</a>
                    {{/if}}
                    </td>
                    <td>
                    {{#if this.ipv6}}
                    <span class="fa-check"></span>
                    <a class="btn btn-xs btn-danger" href="#/firewall/port/{{@key}}/tcp/ipv6/close">{{t 'close'}}</a>
                    {{else}}
                    <span class="fa-times"></span>
                    <a class="btn btn-xs btn-success" href="#/firewall/port/{{@key}}/tcp/ipv6/open">{{t 'open'}}</a>
                    {{/if}}
                    </td>
                    <td>
                    {{#if this.uPnP}}
                    <span class="fa-check"></span>
                    {{else}}
                    <span class="fa-times"></span>
                    {{/if}}
                    </td>
                </tr>
                {{/each}}
                </tbody>
            </table>
        
        </div>
    </div>
</div>

<!--
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">{{t 'udp'}}</h2>
    </div>
    <div class="panel-body table-responsive">
    </div>
</div>
-->

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cog"></span> {{t 'operations'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/firewall/port" method="POST" class="">
            <div class="form-group row">
                <div class="col-xs-6 col-sm-3">
                    <label for="action" class="control-label">{{t 'action'}}</label>
                    <select id="action" name="action" class="form-control" required>
                        <option value="open">{{t 'open'}}</option>
                        <option value="close">{{t 'close'}}</option>
                    </select>
                </div>
                <div class="col-xs-6 col-sm-3">
                    <label for="port" class="control-label">{{t 'port'}}</label>
                    <input type="number" id="port" name="port" class="form-control" required min="1" max="65535">
                </div>
                <div class="col-xs-6 col-sm-3">
                    <label for="connection" class="control-label">{{t 'connection'}}</label>
                    <select id="connection" name="connection" class="form-control" required>
                        <option value="ipv4">{{t 'ipv4'}}</option>
                        <option value="ipv6">{{t 'ipv6'}}</option>
                    </select>
                </div>
                <div class="col-xs-6 col-sm-3">
                    <label for="protocol" class="control-label">{{t 'protocol'}}</label>
                    <select id="protocol" name="protocol" class="form-control" required>
                        <option value="tcp">{{t 'tcp'}}</option>
                        <option value="udp">{{t 'udp'}}</option>
                        <option value="both">{{t 'both'}}</option>
                    </select>
                </div>
            </div>
            <div class="form-group row">
                <div class="col-xs-6 col-sm-3">
                    <input type="submit" class="btn btn-success slide back" value="{{t 'save'}}">
                </div>
            </div>

        </form>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-exchange"></span> {{t 'upnp'}}</h2>
    </div>
    <div class="panel-body">
        {{#if upnp}}
            <p class="text-success">{{t 'upnp_enabled'}}</p>
            <a href="#/firewall/upnp/disable" class="btn btn-danger">{{t 'disable'}}</a>
        {{else}}
            <p class="text-danger">{{t 'upnp_disabled'}}</p>
            <a href="#/firewall/upnp/enable" class="btn btn-success">{{t 'enable'}}</a>
        {{/if}}
    </div>
</div>
