from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CondominioViewSet,
    UsuarioViewSet, 
    ChamadoViewSet, 
    EnderecoViewSet, 
    AvisoViewSet,
    AreaComumViewSet,
    ReservaViewSet,
    EncomendaViewSet,
    AutorizacaoAcessoViewSet,
    DocumentoCondominioViewSet,
    EnqueteViewSet,
    DashboardView
)

router = DefaultRouter()
router.register('condominios', CondominioViewSet, basename='condominios')
router.register('usuarios', UsuarioViewSet, basename='usuarios')
router.register('chamados', ChamadoViewSet, basename='chamados')
router.register('enderecos', EnderecoViewSet, basename='enderecos')
router.register('avisos', AvisoViewSet, basename='avisos')
router.register('areas-comuns', AreaComumViewSet, basename='areas-comuns')
router.register('reservas', ReservaViewSet, basename='reservas')
router.register('encomendas', EncomendaViewSet, basename='encomendas')
router.register('acessos', AutorizacaoAcessoViewSet, basename='acessos')
router.register('documentos', DocumentoCondominioViewSet, basename='documentos')
router.register('enquetes', EnqueteViewSet, basename='enquetes')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
