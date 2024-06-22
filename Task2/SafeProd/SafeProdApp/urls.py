from django.urls import include, path
from . import views

urlpatterns = [
    path('get_csrf_token', views.get_csrf_token, name='get_csrf_token'),

    path('', views.home_page, name='home'),
    path('login', views.login_page, name='login'),
    path('registration', views.registration_page, name='registration'),
    path('exit', views.user_exit, name='exit'),

    path('create_production', views.create_production, name='create_production'),
    path('edit_production/<int:production>', views.edit_production, name='edit_production'),
    path('delete_production/<int:production>', views.delete_production, name='delete_production'),

    path('production_zones/<int:production>', views.production_zones, name='production_zones'),
    path('create_production_zone/<int:production>', views.create_production_zone, name='create_production_zone'),
    path('edit_production_zone/<int:production_zone>', views.edit_production_zone, name='edit_production_zone'),
    path('delete_production_zone/<int:production_zone>', views.delete_production_zone, name='delete_production_zone'),
    path('get_production_zone/<int:production_zone>/', views.get_production_zone, name='get_production_zone'),

    path('production_workers/<int:production>', views.production_workers, name='production_workers'),
    path('add_worker/<int:production>', views.add_worker, name='add_worker'),
    path('delete_worker/<int:production>', views.delete_worker, name='delete_worker'),

    path('add_report/<int:production_zone>', views.add_report, name='add_report'),
    path('all_reports/<int:production_zone>', views.all_reports, name='all_reports'),
    path('my_reports/', views.my_reports, name='my_reports'),
    path('edit_report/<int:report>', views.edit_report, name='edit_report'),
    path('delete_report/<int:report>', views.delete_report, name='delete_report'),
    path('get_report/<int:report_id>/', views.get_report, name='get_report'),
    
    path('add_sensor/<int:production_zone>', views.add_sensor, name='add_sensor'),
    path('delete_sensor/<int:production_zone>', views.delete_sensor, name='delete_sensor'),
    path('get_sensor_data/', views.get_sensor_data, name='get_sensor_data'),
    path('display_sensor_data/<int:production_zone>', views.display_sensor_data, name='display_ensor_data')
] 