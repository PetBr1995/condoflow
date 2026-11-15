from rest_framework.permissions import BasePermission, IsAuthenticated

class EhAutenticado(IsAuthenticated):
    message = "Você precisa estar autenticado para realizar esta ação."

class IsSindico(BasePermission):
    message = "Apenas o síndico ou administradores têm permissão para acessar este recurso."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(request.user.is_sindico or request.user.is_staff or request.user.is_superuser)
