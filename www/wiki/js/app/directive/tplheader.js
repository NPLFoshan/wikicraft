
/**
 * Created by wuxiangan on 2016/12/20.
 */
define([
	'app',
	"helper/util",
], function (app, util) {
    app.directive('tplheader', ['$compile', function ($compile) {
		return {
			restrict: 'E',
			scope: true,
            template:'<div ng-show="isShow" class="tpl-header" ng-click="click()">\
                        <span ng-bind-html="templateSrc"></span>\
                        <span class="pull-right" ng-click="showVersions()">上次保存：{{committer_name}}于{{committed_date}}</span>\
                      </div>',
			controller: ["$rootScope", "$scope", "$attrs", "modal", function($rootScope, $scope, $attrs, modal){
				if (!$attrs.mdwikiname || !config.mdwikiMap[$attrs.mdwikiname]) {
					return;
				}
				var mdwiki = config.mdwikiMap[$attrs.mdwikiname];
				var pageinfo = $rootScope.pageinfo;
				var template = mdwiki.template;
				$scope.$rootScope = $rootScope;
				$scope.isShow = mdwiki.editorMode && $rootScope.pageinfo;
				$scope.mdwiki = mdwiki;

				//console.log("---------------", $attrs.mdwikiname, mdwiki);
				$scope.$watch("mdwiki.template" ,function(){
					//console.log("================================", mdwiki.template, mdwiki);
					template = mdwiki.template;
					//console.log(template);
					if (template) {
                        $scope.templateSrc = template.isPageTemplate ? "当前页面" : "_theme";
                        $scope.templateSrc += "<i class='iconfont icon-bianji'></i>";
					} else {
                        $scope.templateSrc =  "模板为空" + "<i class='iconfont icon-tianjia'></i>";
                    }
                });
                
				$scope.$watch("$rootScope.pageinfo", function() {
					pageinfo = $rootScope.pageinfo;
					if (!pageinfo) {
						$scope.isShow = false;
						return;
					}

					$scope.isShow = true;
					//console.log(pageinfo);
					if (pageinfo.committer_name) {
						$scope.committer_name = pageinfo.committer_name.substring(11);
					}
					if (pageinfo.committed_date) {
						$scope.committed_date = pageinfo.committed_date.substring(0,10);
					}
					util.$apply();
                });
                
                $scope.showVersions = function(){
                    $scope.currentPage = $scope.pageinfo;
                    modal('controller/gitVersionController', {
                        controller: 'gitVersionController',
                        size: 'lg',
                        backdrop: true,
                        scope: $scope
                    }, function (wikiBlock) {
                        console.log(wikiBlock);
                    }, function (result) {
                        console.log(result);
                    });
                }

				$scope.click = function(){
					template = mdwiki.template;
					console.log(template, mdwiki);
					if (!template) {
						console.log("新建模板");
						var defaultTemplate = "```@template/js/layout\n```\n";
						mdwiki.editor.replaceRange(defaultTemplate, {line: 0, ch: 0}, {line:0,ch: 0});
						config.shareMap.moduleEditorParams.wikiBlockStartPost = 0;
						config.shareMap.moduleEditorParams.wikiBlock = undefined;
						return ;
					}
					if (!template.isPageTemplate) {
						var urlObj = {username: pageinfo.username, sitename:pageinfo.sitename, pagename:"_theme"};
						$rootScope.$broadcast('changeEditorPage', urlObj);
						return;
					}
					if (!template.blockCache) {
						return;
					}
					$rootScope.viewEditorClick(template.blockCache.containerId);
					util.$apply();	
				}
			}],
		}
    }]);
});
