import json
from django.views import View
from django.views.generic import ListView
from django.http import HttpResponse
from django.core import serializers
from django.utils import timezone
from .models import Header, Detail

# 신규 테이블을 생성하는 경우 기준값을 정의합니다
NEW_PAGE_ID = 0

# Ajax을 위한 View함수는 필요없고, django.views.View 를 사용합니다.
# (Django 1.10 에서 지원하는 Generic View 함수를 사용합니다)
# https://docs.djangoproject.com/en/1.10/ref/class-based-views/base/#django.views.generic.base.View
class HandsonTableView(View):

    # 역직렬화 함수 : DataBase 내용을 출력합니다
    def get(self, request, *args, **kwargs):
        # http://stackoverflow.com/questions/13527843/accessing-primary-key-from-url-in-django-view-class
        details = Detail.objects.filter(header__pk=self.kwargs.get('pk')).select_related().all()

        # serializer에서 json.dump를 사용하여 직렬화를 구현햇으므로
        # 별도로 JsonResponse 를 사용하면 json.dump() 함수를 2중, 3중으로 적용하는 결과가 됩니다
        # http://stackoverflow.com/questions/26373992/use-jsonresponse-to-serialize-a-queryset-in-django-1-7
        # https://github.com/django/django/blob/1d1e246db6ae8a8c7b9a54f3485809a36c5ee373/django/core/serializers/json.py#L63
        # https://github.com/django/django/blob/190d2ff4a7a392adfe0b12552bd71871791d87aa/django/http/response.py#L526
        return HttpResponse(
            serializers.serialize('handsontablejson', details),
            content_type='application/json'
        )

    # 직렬화 함수 : 사용자가 Post 로 입력한 내용을 DataBase에 저장합니다
    # http://stackoverflow.com/questions/29780060/trying-to-parse-request-body-from-post-in-django
    def post(self, request, *args, **kwargs):    
        body_unicode = request.body.decode('utf-8')
        body   = json.loads(body_unicode)
        header = self.update_header(self.kwargs.get('pk'))

        # DELETE & INSERT 기능을 구현합니다.
        Detail.objects.filter(header=header).delete()
        # Post 필드값을 DataBase 필드값과 대응하여 내용을 저장합니다
        try:
            for b in body:
                Detail(
                    header = header,
                    purchase_date = b.get('purchase_date'),
                    name  = b.get('name'),
                    price = b.get('price'),
                ).save()
            return HttpResponse('저장을 완료하였습니다')
        except ValidationError:
            print("날짜 정보를 잘못 입력하거나, 숫자가 아닌 정보를 입력하였습니다")

    def update_header(self, pk):
        if int(pk) == NEW_PAGE_ID:
            new_header = Header(update_at = timezone.now())
            new_header.save()

            # 만약 보전할만한 'id' 가 있는 경우에는 그 값을 print 함수로 출력합니다
            # http://stackoverflow.com/questions/14832115/get-the-last-inserted-id-in-django
            print(Header.objects.latest('id').id)
            return new_header

        # QuerysetObject 대신 RecordObject 를 사용하기 때문에 first ()로 수정합니다
        # AttributeError: 'QuerySet' object has no attribute 'save'
        # http://stackoverflow.com/questions/6221510/django-calling-save-on-a-queryset-object-queryset-object-has-no-attribute-s
        header = Header.objects.filter(pk=pk).first()
        header.update_at = timezone.now()
        header.save()
        return header