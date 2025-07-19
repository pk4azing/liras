from django.contrib import admin
from .models import CDEmployee, CCDUser, ClientCD

admin.site.register(ClientCD)
admin.site.register(CDEmployee)
admin.site.register(CCDUser)