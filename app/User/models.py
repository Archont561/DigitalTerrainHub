from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default="Write something about yourself.")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
