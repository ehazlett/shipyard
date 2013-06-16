from django.conf import settings

def app_name(context):
    return { 'APP_NAME': getattr(settings, 'APP_NAME', 'Unknown')}

def app_revision(context):
    return { 'APP_REVISION': getattr(settings, 'APP_REVISION', 'Unknown')}

def google_analytics_code(context):
    return { 'GOOGLE_ANALYTICS_CODE': getattr(settings, 'GOOGLE_ANALYTICS_CODE', None)}
