from django.shortcuts import get_object_or_404, render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .forms import LoginUserForm, RegisterUserForm, CreateUserProfileForm, CreateProductionForm, CreateProductionZoneForm, CreateProductionUserForm, CreateReportForm, EditReportForm
from .models import UserProfile, Production, ProductionZone, ProductionUser, Report, PhotoReport, Sensor, status_choices
from django.core.exceptions import ObjectDoesNotExist
from .models import ProductionUser
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http import JsonResponse
import json

sensor_data_storage = []

def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

def home_page(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User is not authenticated'}, status=403)
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.is_owner:
            productions = Production.objects.filter(owner=request.user)
        elif user_profile.is_worker:
            productions_user = ProductionUser.objects.filter(user=request.user)
            production_ids = [pu.production_id for pu in productions_user]
            productions = Production.objects.filter(id__in=production_ids)
        else:
            productions = None

        productions_data = []
        for production in productions:
            productions_data.append({
                'id' : production.id,
                'name': production.name,
                'description': production.description,
                'owner': production.owner.username,
            })

        response_data = {
            'sign': request.user.is_authenticated, 
            'profile': {
                'id': request.user.id,
                'username': user_profile.user.username,
                'email': user_profile.user.email,
                'is_owner': user_profile.is_owner,
                'is_worker': user_profile.is_worker,
            },
            'productions': productions_data,
        }

        return JsonResponse(response_data)

    except ObjectDoesNotExist:
        response_data = {
            'sign': request.user.is_authenticated, 
            'profile': {
                'username': user_profile.user.username,
                'email': user_profile.user.email,
                'is_owner': user_profile.is_owner,
                'is_worker': user_profile.is_worker,
            },
            'productions': None
        }
        return JsonResponse(response_data)

def login_page(request): 
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def registration_page(request): 
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        is_worker = data.get('is_worker', False)
        is_owner = data.get('is_owner', False)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        user = User.objects.create_user(username=username, password=password, email=email)
        user.save()
        
        user_profile = UserProfile.objects.create(user=user, is_worker=is_worker, is_owner=is_owner)
        user_profile.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def user_exit(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def create_production(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')
        
        if not name:
            return JsonResponse({'error': 'Name is required'}, status=400)
        
        production = Production(name=name, description=description, owner=request.user)
        production.save()
        
        return JsonResponse({'success': True, 'production_id': production.id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
 
def edit_production(request, production):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')
        
        production = get_object_or_404(Production, id=production, owner=request.user)
        
        if name:
            production.name = name
        if description:
            production.description = description
            
        production.save()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_production(request, production):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        production = get_object_or_404(Production, id=production, owner=request.user)
        
        production.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def production_zones(request, production):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        user_profile = UserProfile.objects.get(user=request.user)

        production = get_object_or_404(Production, id=production)
        zones = ProductionZone.objects.filter(production=production)
        
        zones_list = []
        for zone in zones:
            sensor = Sensor.objects.filter(production_zone=zone).first()
            zone_data = {
                'id': zone.id,
                'name': zone.name,
                'description': zone.description,
                'responsible_worker': zone.responsible_worker.username if zone.responsible_worker else None,
                'sensor': sensor.sensor_id if sensor else None
            }

            profile = {
                'username': user_profile.user.username,
                'email': user_profile.user.email,
                'is_owner': user_profile.is_owner,
                'is_worker': user_profile.is_worker,
            }


            zones_list.append(zone_data)
        
        return JsonResponse({'zones': zones_list, 'profile': profile})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def create_production_zone(request, production):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')
        
        production = get_object_or_404(Production, id=production, owner=request.user)
        zone = ProductionZone(name=name, description=description, production=production)
        zone.save()
        
        return JsonResponse({'success': True, 'zone_id': zone.id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def edit_production_zone(request, production_zone):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')
        responsible_worker_username = data.get('responsible_worker')
        
        zone = get_object_or_404(ProductionZone, id=production_zone, production__owner=request.user)
        
        if name:
            zone.name = name
        if description:
            zone.description = description
        if responsible_worker_username is not None:
            if responsible_worker_username == "":
                zone.responsible_worker = None
            else:
                try:
                    zone.responsible_worker = User.objects.get(username=responsible_worker_username)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Responsible worker not found'}, status=404)
                except ProductionUser.DoesNotExist:
                    return JsonResponse({'error': 'Worker is not part of the production'}, status=400)
        
        zone.save()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_production_zone(request, production_zone):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        zone = get_object_or_404(ProductionZone, id=production_zone, production__owner=request.user)
        
        zone.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def get_production_zone(request, production_zone):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        zone = get_object_or_404(ProductionZone, id=production_zone, production__owner=request.user)
        zone_data = {
            'id': zone.id,
            'name': zone.name,
            'description': zone.description,
            'responsible_worker': zone.responsible_worker.username if zone.responsible_worker else ""
        }
        
        return JsonResponse(zone_data)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)   

def production_workers(request, production):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        production = get_object_or_404(Production, id=production, owner=request.user)
        workers = ProductionUser.objects.filter(production=production)
        
        workers_list = [{'id': worker.id, 'username': worker.user.username} for worker in workers]
        
        return JsonResponse({'workers': workers_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def add_worker(request, production):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        username = data.get('username')
        
        user = get_object_or_404(User, username=username)
        production = get_object_or_404(Production, id=production, owner=request.user)
        
        production_user = ProductionUser(user=user, production=production)
        production_user.save()
        
        return JsonResponse({'success': True, 'worker_id': production_user.id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_worker(request, production):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        username = data.get('username')
        
        if not username:
            return JsonResponse({'error': 'Username is required'}, status=400)
        
        production = get_object_or_404(Production, id=production, owner=request.user)
        worker = get_object_or_404(ProductionUser, user__username=username, production=production)
        
        worker.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def add_report(request, production_zone):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        title = request.POST.get('title')
        production_zone_obj = get_object_or_404(ProductionZone, id=production_zone)
        description = request.POST.get('description')
        files = request.FILES.getlist('photos')
        
        report = Report(title = title, worker=request.user, production_zone=production_zone_obj, description=description)
        report.save()
        
        for photo in files:
            PhotoReport.objects.create(image=photo, report=report)
        
        return JsonResponse({'success': True, 'report_id': report.id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def all_reports(request, production_zone):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        reports = Report.objects.filter(production_zone=production_zone)
        reports_list = [{
            'id': report.id,
            'title' : report.title,
            'description': report.description,
            'worker' : report.worker.username,
            'status': report.status,
            'timestamp' : report.datetime,
            'photos': [photo.image.url for photo in report.photoreport_set.all()]
        } for report in reports]
        
        return JsonResponse({'reports': reports_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def my_reports(request):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        if not UserProfile.objects.get(user=request.user).is_worker:
            return JsonResponse({'error': 'User is not worker'}, status=403)
        
        reports = Report.objects.filter(worker=request.user)
        reports_list = [{
            'id': report.id,
            'description': report.description,
            'status': report.status,
            'timestamp' : report.datetime,
            'photos': [photo.image.url for photo in report.photoreport_set.all()]
        } for report in reports]
        
        return JsonResponse({'reports': reports_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def edit_report(request, report):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        report_to_edit = get_object_or_404(Report, id=report)
        data = request.POST
        files = request.FILES.getlist('photos')

        user_profile = UserProfile.objects.get(user=request.user)
        can_edit_status = (
            user_profile.is_owner and report_to_edit.production_zone.production.owner == request.user or
            report_to_edit.production_zone.responsible_worker and report_to_edit.production_zone.responsible_worker == request.user
        )

        report_to_edit.title = data.get('title')
        report_to_edit.description = data.get('description')

        if 'status' in data and can_edit_status:
            report_to_edit.status = data.get('status')

        report_to_edit.save()
        
        delete_photos = data.getlist('delete_photo')
        for photo_id in delete_photos:
            photo_to_delete = get_object_or_404(PhotoReport, id=photo_id)
            photo_to_delete.delete()
        
        for file in files:
            PhotoReport.objects.create(report=report_to_edit, image=file)
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_report(request, report):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        report_to_delete = get_object_or_404(Report, id=report)
        if request.user != report_to_delete.worker and not UserProfile.objects.get(user=request.user).is_owner:
            return JsonResponse({'error': 'User not authorized'}, status=403)
        
        report_to_delete.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def add_sensor(request, production_zone):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        sensor_id = data.get('sensor_id')

        if not sensor_id:
            return JsonResponse({'error': 'Sensor ID is required'}, status=400)
        
        production_zone_obj = get_object_or_404(ProductionZone, id=production_zone)

        sensor = Sensor(production_zone=production_zone_obj, sensor_id=sensor_id)
        sensor.save()

        return JsonResponse({'success': True, 'sensor_id': sensor.id, 'production_zone_id': production_zone})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def delete_sensor(request, production_zone):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        sensor = get_object_or_404(Sensor, production_zone = production_zone)
        
        sensor.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def get_report(request, report_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        report = get_object_or_404(Report, id=report_id)
        photos = [photo.image.url for photo in report.photoreport_set.all()]

        report_data = {
            'id': report.id,
            'title': report.title,
            'description': report.description,
            'status': report.status,
            'photos': photos
        }

        return JsonResponse({'report': report_data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
@csrf_exempt
def get_sensor_data (request):
    if request.method == "POST":
        sensor_data_storage.append(request.POST)

        return JsonResponse({"status": "success"}, status=200)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def display_sensor_data(request, production_zone):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        sensor_id = get_object_or_404(Sensor, production_zone = production_zone).sensor_id

        for data in sensor_data_storage:
            if data.get("sensor_id") == sensor_id:
                return JsonResponse({'success': True, 'sensor_id': data.get("sensor_id"), 'temperature': data.get("Temperature"), 'humidity': data.get("Humidity"), 'noise': data.get("Noise")})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)