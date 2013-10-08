from tastypie.test import ResourceTestCase
from django.contrib.auth.models import User
from containers.models import Container

class ContainerResourceTest(ResourceTestCase):
    fixtures = ['test_containers.json']

    def setUp(self):
        super(ContainerResourceTest, self).setUp()
        self.api_list_url = '/api/v1/containers/'
        self.username = 'testuser'
        self.password = 'testpass'
        self.user = User.objects.create_user(self.username,
            'testuser@example.com', self.password)
        self.api_key = self.user.api_key.key
        self.data = {
            'image': 'base',
            'command': 'echo Hello',
            'description': 'test app',
            'ports': [],
            'hosts': ['/api/v1/hosts/1/']
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
        self.assertTrue('container_id' in keys)

    def test_create_container(self):
        """
        Tests create container
        """
        resp = self.api_client.post(self.api_list_url, format='json',
            data=self.data, authentication=self.get_credentials())
        self.assertHttpCreated(resp)

