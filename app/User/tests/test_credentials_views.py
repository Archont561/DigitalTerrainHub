from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model, SESSION_KEY
from django.core import mail

User = get_user_model()

class PasswordResetFlowIntegrationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='old_password123'
        )

    def test_full_password_reset_flow(self):
        # 1. Request password reset form (GET)
        reset_url = reverse('credentials:password-reset')
        response = self.client.get(reset_url)
        self.assertEqual(response.status_code, 200)

        # 2. Submit password reset form (POST with email)
        response = self.client.post(reset_url, {'email': self.user.email})
        self.assertRedirects(response, reverse('credentials:password-reset-done'))

        # Check that an email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn(self.user.email, email.to)
        self.assertIn('reset', email.subject.lower())

        # Extract uid and token from email body
        # This assumes the email contains a URL with uid and token as path components
        # We'll parse it out by searching for the password-reset-confirm URL
        import re
        match = re.search(r'/password-reset-confirm/([^/]+)/([^/]+)/', email.body)
        self.assertIsNotNone(match, "Password reset confirm link not found in email")
        uidb64, token = match.groups()

        # 3. Visit password reset confirm page (GET)
        confirm_url = reverse('credentials:password-reset-confirm', kwargs={'uidb64': uidb64, 'token': token})
        response = self.client.get(confirm_url)
        self.assertEqual(response.status_code, 302)

        
        # 4. Submit new password (POST)
        new_password = 'new_secure_password_456'
        response = self.client.post(response.url, data={
            'new_password1': new_password,
            'new_password2': new_password,
        })
        # Should redirect to password-reset-complete on success
        self.assertEqual(response.status_code, 302)

        response = self.client.get(response.url)
        self.assertEqual(response.status_code, 200)

        # 6. Verify that the password has actually changed
        self.user.refresh_from_db()

        self.assertTrue(self.user.check_password(new_password))


class CredentialsAuthFlowsTest(TestCase):
    def setUp(self):
        self.user_password = 'TestPass123!'
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password=self.user_password
        )

    def login(self):
        self.client.login(username=self.user.username, password=self.user_password)

    def test_register_view(self):
        url = reverse('credentials:register')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'NewPass1234!',
            'password2': 'NewPass1234!',
        }
        response = self.client.post(url, data)
        self.assertRedirects(response, reverse('credentials:login'))
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_view(self):
        url = reverse('credentials:login')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = {
            'username': self.user.username,
            'password': self.user_password,
        }
        response = self.client.post(url, data)
        self.assertRedirects(response, reverse('account:home'))

    def test_logout_view(self):
        self.login()

        url = reverse('credentials:logout')
        response = self.client.post(url)
        self.assertRedirects(response, reverse('core:home'))

    def test_password_change_flow(self):
        self.login()

        url = reverse('credentials:password-change')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        new_password = 'NewSecurePass123!'
        data = {
            'old_password': self.user_password,
            'new_password1': new_password,
            'new_password2': new_password,
        }
        response = self.client.post(url, data)
        self.assertRedirects(response, reverse('credentials:password-change-done'))

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))

    def test_password_change_done_view(self):
        self.login()
        url = reverse('credentials:password-change-done')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_email_verification_view(self):
        url = reverse('credentials:email_verification')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        # User is logged out
        self.assertNotIn(SESSION_KEY, self.client.session)

    def test_password_change_flow(self):
        # Must be logged in for password change
        self.client.login(username=self.user.username, password=self.user_password)

        url = reverse('credentials:password-change')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        new_password = 'NewSecurePass123!'

        data = {
            'old_password': self.user_password,
            'new_password1': new_password,
            'new_password2': new_password,
        }
        response = self.client.post(url, data)
        # Should redirect to password change done page
        self.assertRedirects(response, reverse('credentials:password-change-done'))

        # Confirm password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))

    def test_password_change_done_view(self):
        url = reverse('credentials:password-change-done')
        self.client.login(username=self.user.username, password=self.user_password)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_email_verification_view(self):
        url = reverse('credentials:email_verification')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

