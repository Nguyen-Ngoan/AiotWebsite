# core_api/urls.py

from django.urls import path
from .views import (
    RootView,
    PostListView,
    PostDetailView,
    ProductListView,
    ProductDetailView,
    ProductImageUploadView,
    ProductImageDeleteView,
    TechnicalDocListView,
    TechnicalDocDetailView,
    MaterialListView,
    MaterialDetailView,
    MaterialImageUploadView,
    MaterialImageDeleteView,
    ProjectListView,
    ProjectDetailView,
    ProjectBOMView,
    ProjectSlugCheckView,
    ProjectThumbnailUploadView,
    ProjectAddProductView,
    ProjectAddMaterialView,
    ProjectStepsUpdateView,
    ProjectImageUploadView,
    ProjectImageDeleteView,
    ProjectPlaybookListView,
    ProjectPlaybookDetailView,
)
from .views_printing import (
    PrintingSystemConfigView,
    MachineGroupListView,
    MachineGroupDetailView,
    FilamentListView,
    FilamentDetailView,
    PrintedPartListView,
    PrintedPartDetailView,
    PrintedPartPublicDetailView,
    PrintedPartImageUploadView,
    PrintedPartImageDeleteView,
)

urlpatterns = [
    path("", RootView.as_view(), name="api-root"),

    # Posts
    path("posts/", PostListView.as_view(), name="post-list-create"),
    path("posts/<str:post_id>/", PostDetailView.as_view(), name="post-detail"),

    # Products (lưu trên Firestore, không dùng DB Django)
    path("products/", ProductListView.as_view(), name="product-list-create"),
    path("products/<str:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<str:product_id>/images/", ProductImageUploadView.as_view(), name="product-image-upload"),
    path("products/<str:product_id>/images/delete/", ProductImageDeleteView.as_view(), name="product-image-delete"),

    # Technical Docs (Cấu trúc mới)
    path("technical-docs/", TechnicalDocListView.as_view(), name="technical-doc-list"),
    path("technical-docs/<str:doc_id>/", TechnicalDocDetailView.as_view(), name="technical-doc-detail"),

    # Materials
    path("materials/", MaterialListView.as_view(), name="material-list-create"),
    path("materials/<str:material_id>/", MaterialDetailView.as_view(), name="material-detail"),
    path("materials/<str:material_id>/images/", MaterialImageUploadView.as_view(), name="material-image-upload"),
    path("materials/<str:material_id>/images/delete/", MaterialImageDeleteView.as_view(), name="material-image-delete"),

    # Projects (DIY)
    path("projects/", ProjectListView.as_view(), name="project-list-create"),
    path("projects/check-slug/", ProjectSlugCheckView.as_view(), name="project-check-slug"),
    path("projects/<str:slug>/", ProjectDetailView.as_view(), name="project-detail"),
    path("projects/<str:project_id>/bom/", ProjectBOMView.as_view(), name="project-add-bom"),
    # This path now points to the view that handles PUT requests for updating all steps.
    # The frontend's StepsManager uses a PUT request to save all changes.
    path("projects/<str:project_id>/steps/", ProjectStepsUpdateView.as_view(), name="project-steps-update"),
    path("projects/<str:project_id>/thumbnail/", ProjectThumbnailUploadView.as_view(), name="project-upload-thumbnail"),
    path("projects/<str:project_id>/add-product/", ProjectAddProductView.as_view(), name="project-add-product"),
    path("projects/<str:project_id>/add-material/", ProjectAddMaterialView.as_view(), name="project-add-material"),
    path("projects/<str:project_id>/images/", ProjectImageUploadView.as_view(), name="project-image-upload"),
    path("projects/<str:project_id>/images/delete/", ProjectImageDeleteView.as_view(), name="project-image-delete"),

    # Prompt Playbooks
    path("projects/<str:project_id>/playbooks/", ProjectPlaybookListView.as_view(), name="project-playbook-list"),
    path("projects/<str:project_id>/playbooks/<str:playbook_id>/", ProjectPlaybookDetailView.as_view(), name="project-playbook-detail"),

    # 3D Printing
    path("printing/config/", PrintingSystemConfigView.as_view(), name="printing-config"),
    path("printing/machines/", MachineGroupListView.as_view(), name="machine-group-list"),
    path("printing/machines/<str:doc_id>/", MachineGroupDetailView.as_view(), name="machine-group-detail"),
    path("printing/filaments/", FilamentListView.as_view(), name="filament-list"),
    path("printing/filaments/<str:doc_id>/", FilamentDetailView.as_view(), name="filament-detail"),
    path("printing/parts/", PrintedPartListView.as_view(), name="printed-part-list"),
    path("printing/parts/<str:doc_id>/", PrintedPartDetailView.as_view(), name="printed-part-detail"),
    path("printing/parts/by-slug/<str:slug>/", PrintedPartPublicDetailView.as_view(), name="printed-part-public-detail"),
    path("printing/parts/<str:part_id>/images/", PrintedPartImageUploadView.as_view(), name="printed-part-image-upload"),
    path("printing/parts/<str:part_id>/images/delete/", PrintedPartImageDeleteView.as_view(), name="printed-part-image-delete"),
]
