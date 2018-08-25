<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/ca">{{t 'tools_security_feed'}}</a>
</div>

<div class="separator"></div>

{{#if items}}
    <div class="list-group">
    {{#items}}
        <div class="list-group-item">
            <!-- <a href="{{url}}" class="fa-chevron-right pull-right"></a> -->
            <h2 class="list-group-item-heading"><a href="{{url}}">{{title}}</a></h2>
            <div class="list-group-item-text">
                <p class="pub-date"><em>{{date}}</em></p>
                {{{desc}}}
                <p class="text-right">
                    <a href="{{url}}" role="button"  class="btn btn-default">{{t 'read_more'}}</a>
                </p>
            </div>
        </div>
    {{/items}}
    </div>
{{else}}
<div class="alert alert-success">
    <span class="fa-thumbs-o-up"></span> {{t 'tools_security_feed_no_items'}}
</div>
{{/if}}

<div>
    <a role="button" href="{{url.web}}" class="btn btn-success" target="_blank"><span class="fa-list"></span> {{t 'tools_security_feed_view_items'}}</a> 
    <a role="button" href="{{url.rss}}" class="btn btn-warning" target="_blank"><span class="fa-rss"></span> {{t 'tools_security_feed_subscribe_rss'}}</a>
</div>
