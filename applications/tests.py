from tastypie.test import ResourceTestCase
from django.contrib.auth.models import User
from containers.models import Container

class ApplicationResourceTest(ResourceTestCase):
    fixtures = ['test_applications.json', 'test_containers.json']

    def setUp(self):
        super(ApplicationResourceTest, self).setUp()
        self.api_list_url = '/api/v1/applications/'
        self.container_list_url = '/api/v1/containers/'
        self.username = 'testuser'
        self.password = 'testpass'
        self.user = User.objects.create_user(self.username,
            'testuser@example.com', self.password)
        self.api_key = self.user.api_key.key
        self.data = {
            'name': 'test-app',
            'description': 'test app',
            'domain_name': 'test.example.com',
            'backend_port': 1234,
            'protocol': 'http'
        }

    def get_credentials(self):
        return self.create_apikey(self.username, self.api_key)

    def test_get_list_unauthorzied(self):
        """
        Test get without key returns unauthorized
        """
        self.assertHttpUnauthorized(self.api_client.get(self.api_list_url,
            format='json'))

    def test_get_list_json(self):
        """
        Test get application list
        """
        resp = self.api_client.get(self.api_list_url, format='json',
            authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)

    def test_get_detail_json(self):
        """
        Test get application details
        """
        url = '{}1/'.format(self.api_list_url)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)
        data = self.deserialize(resp)
        keys = data.keys()
        self.assertTrue('name' in keys)
        self.assertTrue('description' in keys)
        self.assertTrue('domain_name' in keys)
        self.assertTrue('backend_port' in keys)
        self.assertTrue('containers' in keys)

    def test_create_application(self):
        """
        Tests that applications can be created via api
        """
        resp = self.api_client.post(self.api_list_url, format='json',
            data=self.data, authentication=self.get_credentials())
        self.assertHttpCreated(resp)
        resp = self.api_client.get(self.api_list_url, format='json',
            authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)
        data = self.deserialize(resp)
        d = data.get('objects')[-1]
        self.assertTrue(d.get('name') == self.data.get('name'))
        self.assertTrue(d.get('domain_name') == self.data.get('domain_name'))

    def test_update_application(self):
        """
        Test update application
        """
        url = '{}1/'.format(self.api_list_url)
        data = self.data
        app_name = 'app-updated'
        data['name'] = app_name
        resp = self.api_client.put(url, format='json',
            data=data, authentication=self.get_credentials())
        self.assertHttpAccepted(resp)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)
        data = self.deserialize(resp)
        self.assertTrue(data.get('name') == app_name)

    def test_update_application_with_containers(self):
        """
        Test update application with containers
        """
        url = '{}1/'.format(self.api_list_url)
        container_url = '{}1/'.format(self.container_list_url)
        data = self.data
        data['containers'] = [container_url]
        resp = self.api_client.put(url, format='json',
            data=data, authentication=self.get_credentials())
        self.assertHttpAccepted(resp)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)
        data = self.deserialize(resp)
        self.assertTrue(data.get('name') == self.data.get('name'))
        self.assertTrue(container_url in data.get('containers'))

    def test_delete_application(self):
        """
        Test delete application
        """
        url = '{}1/'.format(self.api_list_url)
        resp = self.api_client.delete(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpAccepted(resp)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpNotFound(resp)
