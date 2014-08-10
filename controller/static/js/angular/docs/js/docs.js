angular.module('docsApp', [
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'ngAnimate',
  'DocsController',
  'versionsData',
  'pagesData',
  'directives',
  'errors',
  'examples',
  'search',
  'tutorials',
  'versions',
  'bootstrap',
  'bootstrapPrettify',
  'ui.bootstrap.dropdown'
])


.config(function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

angular.module('directives', [])

/**
 * backToTop Directive
 * @param  {Function} $anchorScroll
 *
 * @description Ensure that the browser scrolls when the anchor is clicked
 */
.directive('backToTop', ['$anchorScroll', '$location', function($anchorScroll, $location) {
  return function link(scope, element) {
    element.on('click', function(event) {
      $location.hash('');
      scope.$apply($anchorScroll);
    });
  };
}])


.directive('code', function() {
  return {
    restrict: 'E',
    terminal: true,
    compile: function(element) {
      var linenums = element.hasClass('linenum');// || element.parent()[0].nodeName === 'PRE';
      var match = /lang-(\S+)/.exec(element[0].className);
      var lang = match && match[1];
      var html = element.html();
      element.html(window.prettyPrintOne(html, lang, linenums));
    }
  };
});


angular.module('DocsController', [])

.controller('DocsController', [
          '$scope', '$rootScope', '$location', '$window', '$cookies', 'openPlunkr',
              'NG_PAGES', 'NG_NAVIGATION', 'NG_VERSION',
  function($scope, $rootScope, $location, $window, $cookies, openPlunkr,
              NG_PAGES, NG_NAVIGATION, NG_VERSION) {


  $scope.openPlunkr = openPlunkr;

  $scope.docsVersion = NG_VERSION.isSnapshot ? 'snapshot' : NG_VERSION.version;

  $scope.fold = function(url) {
    if(url) {
      $scope.docs_fold = '/notes/' + url;
      if(/\/build/.test($window.location.href)) {
        $scope.docs_fold = '/build/docs' + $scope.docs_fold;
      }
      window.scrollTo(0,0);
    }
    else {
      $scope.docs_fold = null;
    }
  };
  var OFFLINE_COOKIE_NAME = 'ng-offline',
      INDEX_PATH = /^(\/|\/index[^\.]*.html)$/;


  /**********************************
   Publish methods
   ***********************************/

  $scope.navClass = function(navItem) {
    return {
      active: navItem.href && this.currentPage.path,
      'nav-index-section': navItem.type === 'section'
    };
  };

  $scope.afterPartialLoaded = function() {
    var pagePath = $scope.currentPage ? $scope.currentPage.path : $location.path();
    $window._gaq.push(['_trackPageview', pagePath]);
  };

  /** stores a cookie that is used by apache to decide which manifest ot send */
  $scope.enableOffline = function() {
    //The cookie will be good for one year!
    var date = new Date();
    date.setTime(date.getTime()+(365*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    var value = angular.version.full;
    document.cookie = OFFLINE_COOKIE_NAME + "="+value+expires+"; path=" + $location.path;

    //force the page to reload so server can serve new manifest file
    window.location.reload(true);
  };



  /**********************************
   Watches
   ***********************************/


  $scope.$watch(function docsPathWatch() {return $location.path(); }, function docsPathWatchAction(path) {

    var currentPage = $scope.currentPage = NG_PAGES[path];
    if ( !currentPage && path.charAt(0)==='/' ) {
      // Strip off leading slash
      path = path.substr(1);
    }

    currentPage = $scope.currentPage = NG_PAGES[path];
    if ( !currentPage && path.charAt(path.length-1) === '/' && path.length > 1 ) {
      // Strip off trailing slash
      path = path.substr(0, path.length-1);
    }

    currentPage = $scope.currentPage = NG_PAGES[path];
    if ( !currentPage && /\/index$/.test(path) ) {
      // Strip off index from the end
      path = path.substr(0, path.length - 6);
    }

    currentPage = $scope.currentPage = NG_PAGES[path];

    if ( currentPage ) {
      $scope.currentArea = currentPage && NG_NAVIGATION[currentPage.area];
      var pathParts = currentPage.path.split('/');
      var breadcrumb = $scope.breadcrumb = [];
      var breadcrumbPath = '';
      angular.forEach(pathParts, function(part) {
        breadcrumbPath += part;
        breadcrumb.push({ name: (NG_PAGES[breadcrumbPath]&&NG_PAGES[breadcrumbPath].name) || part, url: breadcrumbPath });
        breadcrumbPath += '/';
      });
    } else {
      $scope.currentArea = NG_NAVIGATION['api'];
      $scope.breadcrumb = [];
    }
  });

  /**********************************
   Initialize
   ***********************************/

  $scope.versionNumber = angular.version.full;
  $scope.version = angular.version.full + "  " + angular.version.codeName;
  $scope.subpage = false;
  $scope.offlineEnabled = ($cookies[OFFLINE_COOKIE_NAME] == angular.version.full);
  $scope.futurePartialTitle = null;
  $scope.loading = 0;
  $scope.$cookies = $cookies;

  $cookies.platformPreference = $cookies.platformPreference || 'gitUnix';

  if (!$location.path() || INDEX_PATH.test($location.path())) {
    $location.path('/api').replace();
  }

  // bind escape to hash reset callback
  angular.element(window).on('keydown', function(e) {
    if (e.keyCode === 27) {
      $scope.$apply(function() {
        $scope.subpage = false;
      });
    }
  });
}]);

angular.module('errors', ['ngSanitize'])

.filter('errorLink', ['$sanitize', function ($sanitize) {
  var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}<>]/g,
      MAILTO_REGEXP = /^mailto:/,
      STACK_TRACE_REGEXP = /:\d+:\d+$/;

  var truncate = function (text, nchars) {
    if (text.length > nchars) {
      return text.substr(0, nchars - 3) + '...';
    }
    return text;
  };

  return function (text, target) {
    var targetHtml = target ? ' target="' + target + '"' : '';

    if (!text) return text;

    return $sanitize(text.replace(LINKY_URL_REGEXP, function (url) {
      if (STACK_TRACE_REGEXP.test(url)) {
        return url;
      }

      // if we did not match ftp/http/mailto then assume mailto
      if (!/^((ftp|https?):\/\/|mailto:)/.test(url)) url = 'mailto:' + url;

      return '<a' + targetHtml + ' href="' + url +'">' +
                truncate(url.replace(MAILTO_REGEXP, ''), 60) +
              '</a>';
    }));
  };
}])


.directive('errorDisplay', ['$location', 'errorLinkFilter', function ($location, errorLinkFilter) {
  var interpolate = function (formatString) {
    var formatArgs = arguments;
    return formatString.replace(/\{\d+\}/g, function (match) {
      // Drop the braces and use the unary plus to convert to an integer.
      // The index will be off by one because of the formatString.
      var index = +match.slice(1, -1);
      if (index + 1 >= formatArgs.length) {
        return match;
      }
      return formatArgs[index+1];
    });
  };

  return {
    link: function (scope, element, attrs) {
      var search = $location.search(),
        formatArgs = [attrs.errorDisplay],
        i;

      for (i = 0; angular.isDefined(search['p'+i]); i++) {
        formatArgs.push(search['p'+i]);
      }
      element.html(errorLinkFilter(interpolate.apply(null, formatArgs), '_blank'));
    }
  };
}]);

angular.module('examples', [])

.factory('formPostData', ['$document', function($document) {
  return function(url, fields) {
    /**
     * Form previously posted to target="_blank", but pop-up blockers were causing this to not work.
     * If a user chose to bypass pop-up blocker one time and click the link, they would arrive at
     * a new default plnkr, not a plnkr with the desired template.
     */
    var form = angular.element('<form style="display: none;" method="post" action="' + url + '"></form>');
    angular.forEach(fields, function(value, name) {
      var input = angular.element('<input type="hidden" name="' +  name + '">');
      input.attr('value', value);
      form.append(input);
    });
    $document.find('body').append(form);
    form[0].submit();
    form.remove();
  };
}])


.factory('openPlunkr', ['formPostData', '$http', '$q', function(formPostData, $http, $q) {
  return function(exampleFolder) {

    var exampleName = 'AngularJS Example';

    // Load the manifest for the example
    $http.get(exampleFolder + '/manifest.json')
      .then(function(response) {
        return response.data;
      })
      .then(function(manifest) {
        var filePromises = [];

        // Build a pretty title for the Plunkr
        var exampleNameParts = manifest.name.split('-');
        exampleNameParts.unshift('AngularJS');
        angular.forEach(exampleNameParts, function(part, index) {
          exampleNameParts[index] = part.charAt(0).toUpperCase() + part.substr(1);
        });
        exampleName = exampleNameParts.join(' - ');

        angular.forEach(manifest.files, function(filename) {
          filePromises.push($http.get(exampleFolder + '/' + filename, { transformResponse: [] })
            .then(function(response) {

              // The manifests provide the production index file but Plunkr wants
              // a straight index.html
              if (filename === "index-production.html") {
                filename = "index.html"
              }

              return {
                name: filename,
                content: response.data
              };
            }));
        });
        return $q.all(filePromises);
      })
      .then(function(files) {
        var postData = {};

        angular.forEach(files, function(file) {
          postData['files[' + file.name + ']'] = file.content;
        });

        postData['tags[0]'] = "angularjs";
        postData['tags[1]'] = "example";
        postData.private = true;
        postData.description = exampleName;

        formPostData('http://plnkr.co/edit/?p=preview', postData);
      });
  };
}]);

angular.module('docsApp.navigationService', [])

.factory('navigationService', function($window) {
  var service = {
    currentPage: null,
    currentVersion: null,
    changePage: function(newPage) {

    },
    changeVersion: function(newVersion) {

      //TODO =========
    //   var currentPagePath = '';

    // // preserve URL path when switching between doc versions
    // if (angular.isObject($rootScope.currentPage) && $rootScope.currentPage.section && $rootScope.currentPage.id) {
    //   currentPagePath = '/' + $rootScope.currentPage.section + '/' + $rootScope.currentPage.id;
    // }

    // $window.location = version.url + currentPagePath;

    }
  };
});

angular.module('search', [])

.controller('DocsSearchCtrl', ['$scope', '$location', 'docsSearch', function($scope, $location, docsSearch) {
  function clearResults() {
    $scope.results = [];
    $scope.colClassName = null;
    $scope.hasResults = false;
  }

  $scope.search = function(q) {
    var MIN_SEARCH_LENGTH = 2;
    if(q.length >= MIN_SEARCH_LENGTH) {
      var results = docsSearch(q);
      var totalAreas = 0;
      for(var i in results) {
        ++totalAreas;
      }
      if(totalAreas > 0) {
        $scope.colClassName = 'cols-' + totalAreas;
      }
      $scope.hasResults = totalAreas > 0;
      $scope.results = results;
    }
    else {
      clearResults();
    }
    if(!$scope.$$phase) $scope.$apply();
  };
  $scope.submit = function() {
    var result;
    for(var i in $scope.results) {
      result = $scope.results[i][0];
      if(result) {
        break;
      }
    }
    if(result) {
      $location.path(result.path);
      $scope.hideResults();
    }
  };
  $scope.hideResults = function() {
    clearResults();
    $scope.q = '';
  };
}])

.controller('Error404SearchCtrl', ['$scope', '$location', 'docsSearch', function($scope, $location, docsSearch) {
  $scope.results = docsSearch($location.path().split(/[\/\.:]/).pop());
}])

.factory('lunrSearch', function() {
  return function(properties) {
    if (window.RUNNING_IN_NG_TEST_RUNNER) return null;

    var engine = lunr(properties);
    return {
      store : function(values) {
        engine.add(values);
      },
      search : function(q) {
        return engine.search(q);
      }
    };
  };
})

.factory('docsSearch', ['$rootScope','lunrSearch', 'NG_PAGES',
    function($rootScope, lunrSearch, NG_PAGES) {
  if (window.RUNNING_IN_NG_TEST_RUNNER) {
    return null;
  }

  var index = lunrSearch(function() {
    this.ref('id');
    this.field('title', {boost: 50});
    this.field('keywords', { boost : 20 });
  });

  angular.forEach(NG_PAGES, function(page, key) {
    if(page.searchTerms) {
      index.store({
        id : key,
        title : page.searchTerms.titleWords,
        keywords : page.searchTerms.keywords
      });
    };
  });

  return function(q) {
    var results = {
      api : [],
      tutorial : [],
      guide : [],
      error : [],
      misc : []
    };
    angular.forEach(index.search(q), function(result) {
      var key = result.ref;
      var item = NG_PAGES[key];
      var area = item.area;
      item.path = key;

      var limit = area == 'api' ? 40 : 14;
      if(results[area].length < limit) {
        results[area].push(item);
      }
    });
    return results;
  };
}])

.directive('focused', function($timeout) {
  return function(scope, element, attrs) {
    element[0].focus();
    element.on('focus', function() {
      scope.$apply(attrs.focused + '=true');
    });
    element.on('blur', function() {
      // have to use $timeout, so that we close the drop-down after the user clicks,
      // otherwise when the user clicks we process the closing before we process the click.
      $timeout(function() {
        scope.$eval(attrs.focused + '=false');
      });
    });
    scope.$eval(attrs.focused + '=true');
  };
})

.directive('docsSearchInput', ['$document',function($document) {
  return function(scope, element, attrs) {
    var ESCAPE_KEY_KEYCODE = 27,
        FORWARD_SLASH_KEYCODE = 191;
    angular.element($document[0].body).on('keydown', function(event) {
      var input = element[0];
      if(event.keyCode == FORWARD_SLASH_KEYCODE && document.activeElement != input) {
        event.stopPropagation();
        event.preventDefault();
        input.focus();
      }
    });

    element.on('keydown', function(event) {
      if(event.keyCode == ESCAPE_KEY_KEYCODE) {
        event.stopPropagation();
        event.preventDefault();
        scope.$apply(function() {
          scope.hideResults();
        });
      }
    });
  };
}]);

angular.module('tutorials', [])

.directive('docTutorialNav', function(templateMerge) {
  var pages = [
    '',
    'step_00', 'step_01', 'step_02', 'step_03', 'step_04',
    'step_05', 'step_06', 'step_07', 'step_08', 'step_09',
    'step_10', 'step_11', 'step_12', 'the_end'
  ];
  return {
    compile: function(element, attrs) {
      var seq = 1 * attrs.docTutorialNav,
          props = {
            seq: seq,
            prev: pages[seq],
            next: pages[2 + seq],
            diffLo: seq ? (seq - 1): '0~1',
            diffHi: seq
          };

      element.addClass('btn-group');
      element.addClass('tutorial-nav');
      element.append(templateMerge(
        '<a href="tutorial/{{prev}}"><li class="btn btn-primary"><i class="glyphicon glyphicon-step-backward"></i> Previous</li></a>\n' +
        '<a href="http://angular.github.io/angular-phonecat/step-{{seq}}/app"><li class="btn btn-primary"><i class="glyphicon glyphicon-play"></i> Live Demo</li></a>\n' +
        '<a href="https://github.com/angular/angular-phonecat/compare/step-{{diffLo}}...step-{{diffHi}}"><li class="btn btn-primary"><i class="glyphicon glyphicon-search"></i> Code Diff</li></a>\n' +
        '<a href="tutorial/{{next}}"><li class="btn btn-primary">Next <i class="glyphicon glyphicon-step-forward"></i></li></a>', props));
    }
  };
})


.directive('docTutorialReset', function() {
  return {
    scope: {
      'step': '@docTutorialReset'
    },
    template:
      '<p><a href="" ng-click="show=!show;$event.stopPropagation()">Workspace Reset Instructions  ➤</a></p>\n' +
      '<div class="alert alert-info" ng-show="show">\n' +
      '  <p>Reset the workspace to step {{step}}.</p>' +
      '  <p><pre>git checkout -f step-{{step}}</pre></p>\n' +
      '  <p>Refresh your browser or check out this step online: '+
          '<a href="http://angular.github.io/angular-phonecat/step-{{step}}/app">Step {{step}} Live Demo</a>.</p>\n' +
      '</div>\n' +
      '<p>The most important changes are listed below. You can see the full diff on ' +
        '<a ng-href="https://github.com/angular/angular-phonecat/compare/step-{{step ? (step - 1): \'0~1\'}}...step-{{step}}">GitHub</a>\n' +
      '</p>'
  };
});

"use strict";

angular.module('versions', [])

.controller('DocsVersionsCtrl', ['$scope', '$location', '$window', 'NG_VERSIONS', function($scope, $location, $window, NG_VERSIONS) {
  $scope.docs_version  = NG_VERSIONS[0];

  for(var i=0, minor = NaN; i < NG_VERSIONS.length; i++) {
    var version = NG_VERSIONS[i];
    // NaN will give false here
    if (minor <= version.minor) {
      continue;
    }
    version.isLatest = true;
    minor = version.minor;
  }

  $scope.docs_versions = NG_VERSIONS;
  $scope.getGroupName = function(v) {
    return v.isLatest ? 'Latest' : (v.isStable ? 'Stable' : 'Unstable');
  };

  $scope.jumpToDocsVersion = function(version) {
    var currentPagePath = $location.path();

    // TODO: We need to do some munging of the path for different versions of the API...


    $window.location = version.docsUrl + currentPagePath;
  };
}]);
