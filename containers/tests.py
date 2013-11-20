from tastypie.test import ResourceTestCase
from django.contrib.auth.models import User
from containers.models import Container, Host
import os

class ContainerResourceTest(ResourceTestCase):

    def setUp(self):
        super(ContainerResourceTest, self).setUp()
        self.api_list_url = '/api/v1/containers/'
        self.username = 'testuser'
        self.password = 'testpass'
        self.user = User.objects.create_user(self.username,
            'testuser@example.com', self.password)
        self.api_key = self.user.api_key.key
        host = Host()
        host.name = 'local'
        host.hostname = os.getenv('DOCKER_TEST_HOST', '127.0.0.1')
        host.save()
        self.host = host
        self.data = {
            'image': 'base',
            'command': '/bin/bash',
            'description': 'test app',
            'ports': [],
            'hosts': ['/api/v1/hosts/1/']
        }
        resp = self.api_client.post(self.api_list_url, format='json',
            data=self.data, authentication=self.get_credentials())

    def tearDown(self):
        for c in self.host.get_all_containers():
            self.host.destroy_container(c.container_id)

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
        data = self.deserialize(resp)
        self.assertTrue(len(data.get('objects')) == 1)

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
        self.assertTrue('meta' in keys)

    def test_create_container(self):
        """
        Tests create container
        """
        resp = self.api_client.post(self.api_list_url, format='json',
            data=self.data, authentication=self.get_credentials())
        self.assertHttpCreated(resp)

    def test_delete_container(self):
        url = '{}1/'.format(self.api_list_url)
        resp = self.api_client.delete(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpAccepted(resp)

    def test_restart_container(self):
        """
        Test container restart
        """
        url = '{}1/restart/'.format(self.api_list_url)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpAccepted(resp)

    def test_stop_container(self):
        """
        Test container stop
        """
        url = '{}1/stop/'.format(self.api_list_url)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpAccepted(resp)

    def test_destroy_container(self):
        """
        Test container destroy
        """
        url = '{}1/destroy/'.format(self.api_list_url)
        resp = self.api_client.get(url, format='json',
            authentication=self.get_credentials())
        self.assertHttpAccepted(resp)

