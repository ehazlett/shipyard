from shipyard import wsgi
#import newrelic.agent
application = wsgi.application

#newrelic.agent.initialize('newrelic.ini')
#app = newrelic.agent.wsgi_application()(app)
