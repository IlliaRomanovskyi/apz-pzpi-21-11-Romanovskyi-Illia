from django.contrib import admin
from .models import UserProfile, Production, ProductionZone, Report, PhotoReport, ProductionUser, Sensor

admin.site.register(UserProfile)
admin.site.register(Production)
admin.site.register(ProductionZone)
admin.site.register(Report)
admin.site.register(PhotoReport)
admin.site.register(ProductionUser)
admin.site.register(Sensor)
