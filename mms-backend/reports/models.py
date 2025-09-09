from django.db import models

class SystemSetting(models.Model):
    key = models.CharField(max_length=200, unique=True)
    value = models.CharField(max_length=1000)  # stringify numeric values as needed
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.key} = {self.value}"

class Report(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()

    def __str__(self):
        return self.name
