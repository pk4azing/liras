from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string

# Helper function
def generate_unique_username(prefix):
    return f"{prefix}_{get_random_string(8)}"

class ClientCD(models.Model):
    name = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=100, unique=True)
    email_domain = models.CharField(max_length=100, help_text="Only emails with this domain can be used")
    plan = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CDUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    client = models.ForeignKey(ClientCD, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        # Validate domain
        if not self.user.email.endswith(f"@{self.client.email_domain}"):
            raise ValidationError("Email domain does not match the allowed client domain.")

        # Auto-assign username
        if not self.user.username:
            self.user.username = generate_unique_username(f"CD_{self.client.id}")
            self.user.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.client.name})"

class CCDUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    client = models.ForeignKey(ClientCD, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # Validate domain
        if not self.user.email.endswith(f"@{self.client.email_domain}"):
            raise ValidationError("Email domain does not match the allowed client domain.")

        # Auto-assign username
        if not self.user.username:
            self.user.username = generate_unique_username(f"CCD_{self.client.id}")
            self.user.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - CCD ({self.client.name})"