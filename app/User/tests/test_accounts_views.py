from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from User.models import UserProfile

User = get_user_model()

class AccountViewsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.profile = UserProfile.objects.create(user=self.user)
        self.client.login(username="testuser", password="testpass123")

    def test_profile_view_authenticated(self):
        response = self.client.get(reverse("account:home"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("user", response.context)

    def test_update_view_user_get(self):
        url = reverse("account:update") + "?form=user"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("form", response.context)

    def test_update_view_profile_post(self):
        url = reverse("account:update")
        data = {
            "form": "profile",
            "bio": "Updated bio",
            "location": "Testfille",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, "Updated bio")

    def test_update_view_missing_form_type(self):
        url = reverse("account:update")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 400)

    def test_update_view_invalid_form_type(self):
        url = reverse("account:update") + "?form=invalid"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_delete_view(self):
        response = self.client.post(reverse("account:delete"))
        self.assertRedirects(response, reverse("core:home"))
        self.assertFalse(User.objects.filter(username="testuser").exists())

    def test_unauthenticated_access_redirect(self):
        self.client.logout()
        response = self.client.get(reverse("account:home"))
        self.assertEqual(response.status_code, 302)
        self.assertIn("/login/", response.url)
