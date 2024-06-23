from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

status_choices = [
    ('Active', 'Active'),
    ('Resolved', 'Resolved'),
    ('InProgress', 'In Progress'),
    ('Cancelled', 'Cancelled'),
]

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_owner = models.BooleanField(default=False)
    is_worker = models.BooleanField(default=False)

class Production(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__ (self):
        return self.name

class ProductionZone(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    production = models.ForeignKey(Production, on_delete=models.CASCADE)
    responsible_worker = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True)

    def __str__ (self):
        return self.name

class ProductionUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    production = models.ForeignKey(Production, on_delete=models.CASCADE)


class Report(models.Model):
    title = models.CharField(max_length=50)
    worker = models.ForeignKey(User, on_delete=models.CASCADE)
    production_zone = models.ForeignKey(ProductionZone, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=status_choices, default='Active')
    datetime = models.DateTimeField(default=datetime.now)
    
    def __str__ (self):
        return self.title
    
class PhotoReport(models.Model):
    image = models.ImageField(upload_to='report_photos/')
    report = models.ForeignKey(Report, on_delete=models.CASCADE)

class Sensor(models.Model):
    production_zone = models.ForeignKey(ProductionZone, on_delete=models.CASCADE)
    sensor_id = models.CharField(max_length=100)