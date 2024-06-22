from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UsernameField
from django.contrib.auth.models import User
from .models import UserProfile, Production, ProductionZone, ProductionUser, Report, PhotoReport
from multiupload.fields import MultiFileField

class LoginUserForm(forms.Form):
    username = UsernameField()
    password = forms.CharField()

class RegisterUserForm(UserCreationForm):
    class Meta:
        model = User
        fields = 'username', 'email', 'first_name', 'last_name', 'password1', 'password2'
        
class CreateUserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        exclude = ['user']

class CreateProductionForm(forms.ModelForm):
    class Meta:
        model = Production
        fields = ['name', 'description']
        exclude = ['user']

class CreateProductionZoneForm(forms.ModelForm):
    class Meta:
        model = ProductionZone
        fields = ['name', 'description']
        exclude = ['production', 'responsible_worker']

class CreateProductionUserForm(forms.ModelForm):
    class Meta:
        model = ProductionUser
        exclude = ['production', 'user']

class CreateReportForm(forms.ModelForm):
    photos = MultiFileField(max_num=10, min_num=1, max_file_size=1024*1024*5)

    class Meta:
        model = Report
        fields = ['title', 'description', 'photos']
        exclude = ['status', 'datetime', 'worker', 'production_zone',]

class EditReportForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = ['title', 'description', 'status']



