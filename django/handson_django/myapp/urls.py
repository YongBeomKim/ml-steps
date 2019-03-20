from django.conf.urls import url
from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from .views import HandsonTableView
from .models import Header

# http://qiita.com/irxground/items/cd83786b10d81eecce77
app_name = 'myapp'
urlpatterns = [
    # 목록을 출력합니다
    url(r'^records/$',
        ListView.as_view(model=Header),
        name='record-index',
    ),
    # 새로운 페이지
    url(r'^records/new$', 
        TemplateView.as_view(template_name='myapp/detail.html'),
        name='record-new'
    ),
    # 페이지 편집하기
    url(r'^records/(?P<pk>[0-9]+)/edit$', 
        TemplateView.as_view(template_name='myapp/detail.html'),
        name='record-edit'
    ),
    # Ajax 사용
    url(r'^ajax/records/(?P<pk>[0-9]+)$',
        HandsonTableView.as_view(),
        name='ajax',
    ),
]


    # url(r'^records/$',
    #     ListView.as_view(model=Header),
    #     name='record-index',
    # ),
    # # 새로운 페이지
    # url(r'^records/new$', 
    #     TemplateView.as_view(template_name='myapp/detail.html'),
    #     name='record-new'
    # ),
    # # 페이지 편집하기
    # url(r'^records/(?P<pk>[0-9]+)/edit$', 
    #     TemplateView.as_view(template_name='myapp/detail.html'),
    #     name='record-edit'
    # ),
    # # Ajax 사용
    # url(r'^ajax/records/(?P<pk>[0-9]+)$',
    #     HandsonTableView.as_view(),
    #     name='ajax',
    # ),