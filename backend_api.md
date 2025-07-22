## HRMS API Usage Guidelines

The HRMS API is a RESTful API built with Django REST Framework, providing access to various modules for managing hotel and restaurant operations.

### 1. Base URL

All API endpoints are prefixed with `/api/v1/`.
**Example:** `http://your-domain.com/api/v1/`

### 2. Authentication

The API uses **Token-based Authentication**. You will need to obtain an authentication token (e.g., by logging in to an authentication endpoint) and include it in the `Authorization` header of your requests.

**Example Header:**
`Authorization: Token your_auth_token_here`

### 3. API Endpoints

Here are some example endpoints based on the implemented modules:

*   **Staff Management (Users):**
    *   `GET /api/v1/users/staff/` - List all staff members
    *   `GET /api/v1/users/staff/{id}/` - Retrieve a specific staff member
    *   `POST /api/v1/users/staff/` - Create a new staff member
    *   `GET /api/v1/users/departments/` - List all departments

*   **Hotel Management:**
    *   `GET /api/v1/hotel/rooms/` - List all rooms
    *   `GET /api/v1/hotel/bookings/` - List all bookings (reservations)
    *   `POST /api/v1/hotel/bookings/` - Create a new booking

*   **Restaurant Management:**
    *   `GET /api/v1/restaurant/menu-items/` - List all menu items
    *   `GET /api/v1/restaurant/tables/` - List all tables
    *   `POST /api/v1/restaurant/orders/` - Create a new order

*   **Guest Management:**
    *   `GET /api/v1/guest/guests/` - List all guests
    *   `GET /api/v1/guest/loyalty-programs/` - List all loyalty programs

*   **Attendance & Scheduling:**
    *   `GET /api/v1/attendance/attendances/` - List all attendance records
    *   `GET /api/v1/attendance/schedules/` - List all staff schedules
    *   `GET /api/v1/attendance/leave-requests/` - List all leave requests

*   **Billing & Payments:**
    *   `GET /api/v1/billing/invoices/` - List all invoices
    *   `GET /api/v1/billing/payments/` - List all payments

*   **Inventory Management:**
    *   `GET /api/v1/inventory/items/` - List all inventory items
    *   `GET /api/v1/inventory/suppliers/` - List all suppliers
    *   `GET /api/v1/inventory/purchase-orders/` - List all purchase orders

*   **Housekeeping Management:**
    *   `GET /api/v1/housekeeping/room-cleanings/` - List all room cleaning records
    *   `GET /api/v1/housekeeping/task-assignments/` - List all task assignments
    *   `GET /api/v1/housekeeping/maintenance-requests/` - List all maintenance requests

*   **Reports & Analytics:**
    *   `GET /api/v1/reports/report-configurations/` - List all report configurations

*   **System Administration:**
    *   `GET /api/v1/administration/audit-logs/` - List all audit logs
    *   `GET /api/v1/administration/system-configurations/` - List all system configurations

### 4. Filtering

Many list endpoints support filtering using query parameters. The available filter fields depend on the specific model. Django REST Framework's `django-filter` integration is used for this.

**General Filtering Syntax:**
Append `?field_name=value` to the endpoint URL. For multiple filters, use `&`.

**Examples:**

*   **Filter Rooms by Status:**
    To get all available rooms:
    `GET /api/v1/hotel/rooms/?status=available`

*   **Filter Staff by Department:**
    To get staff members in a specific department (assuming `department` is a filterable field on the staff model):
    `GET /api/v1/users/staff/?department__name=Engineering` (if filtering by related field name)

*   **Filter Invoices by Paid Status:**
    To get all unpaid invoices:
    `GET /api/v1/billing/invoices/?paid=False`

*   **Filter Attendance by User:**
    To get attendance records for a specific user (assuming `user` is a filterable field):
    `GET /api/v1/attendance/attendances/?user={user_id}`

*   **Filter Menu Items by Category:**
    To get menu items in the 'Main Course' category:
    `GET /api/v1/restaurant/menu-items/?category__name=Main%20Course`

**Common Filter Types:**

*   **Exact Match:** `field_name=value`
*   **Case-insensitive Contains:** `field_name__icontains=value`
*   **Greater Than/Less Than:** `field_name__gt=value`, `field_name__lt=value` (for numeric or date fields)
*   **Date Range:** `field_name__date__gte=YYYY-MM-DD`, `field_name__date__lte=YYYY-MM-DD`
*   **Related Field Filtering:** `related_field__field_name=value` (e.g., `room__room_number=101`)

### 5. Pagination

List endpoints are typically paginated to handle large datasets. The API uses standard pagination, often with `limit` and `offset` or `page` and `page_size` parameters.

**Example:**
*   `GET /api/v1/hotel/rooms/?limit=10&offset=20` (Get 10 rooms, starting from the 21st)
*   `GET /api/v1/hotel/rooms/?page=2&page_size=20` (Get the second page with 20 rooms per page)

### 6. Data Format

All requests and responses use **JSON** format.
**Example Request Body (for POST/PUT):**
```json
{
    "field1": "value1",
    "field2": "value2"
}
```
**Example Response Body:**
```json
{
    "id": 1,
    "field1": "value1",
    "field2": "value2"
}
```

### 7. Currency

All monetary values in the API are represented in Rupiah (Rp).

### 8. Security Hardening

This API has implemented basic security measures, but further hardening is recommended for production environments.

#### Implemented Measures:
*   **CORS Configuration**: `django-cors-headers` has been integrated to manage Cross-Origin Resource Sharing. In `core/settings/base.py`, `CORS_ALLOW_ALL_ORIGINS` is set to `True` for development convenience. **For production, it is crucial to restrict this to only trusted origins** using `CORS_ALLOWED_ORIGINS` or `CORS_ALLOWED_ORIGIN_REGEXES`.
*   **Secure Cookie Settings**: In `core/settings/production.py`, the following settings are enabled to enhance cookie security:
    *   `SECURE_SSL_REDIRECT`: Redirects all HTTP requests to HTTPS.
    *   `SESSION_COOKIE_SECURE`: Ensures session cookies are only sent over HTTPS.
    *   `CSRF_COOKIE_SECURE`: Ensures CSRF cookies are only sent over HTTPS.
    *   `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`: Configures HTTP Strict Transport Security (HSTS).
    *   `X_FRAME_OPTIONS = 'DENY'`: Prevents clickjacking by disallowing the site from being loaded in an iframe.

#### Further Manual Security Improvements:

For a robust production system, consider implementing the following:

*   **Rate Limiting**: Implement rate limiting on API endpoints (especially authentication and sensitive endpoints) to prevent abuse and brute-force attacks. Django REST Framework provides built-in rate limiting, or you can use external tools like Nginx or cloud provider services.
    *   **Manual Step**: Configure `REST_FRAMEWORK` settings in `core/settings/production.py` and apply `throttle_classes` to relevant `ViewSet`s.

*   **Sensitive Data Encryption**: While data is stored securely in the database, consider encrypting highly sensitive data fields at the application level before storage and decrypting them upon retrieval.
    *   **Manual Step**: Research and integrate a Django-compatible encryption library (e.g., `django-cryptography`) and apply encryption to sensitive model fields.

*   **Comprehensive Role-Based Access Control (RBAC)**: While basic permissions are in place, a more granular RBAC system might be needed for complex scenarios.
    *   **Manual Step**: Define custom permission classes in Django REST Framework to enforce object-level permissions or integrate with a dedicated RBAC library.

*   **Input Validation and Sanitization**: Ensure all user inputs are rigorously validated and sanitized to prevent injection attacks (SQL, XSS, etc.). Django forms and DRF serializers provide good validation, but additional custom validation might be necessary.
    *   **Manual Step**: Implement custom validators in serializers and models where complex validation rules are required.

*   **Audit Logging**: Enhance the existing audit logging to capture more detailed information about user actions, data changes, and system events.
    *   **Manual Step**: Expand the `AuditLog` model and integrate logging into more critical operations across the application.

*   **Session Management**: Implement robust session management practices, including session expiry, invalidation on password change, and protection against session hijacking.
    *   **Manual Step**: Review Django's session settings and implement custom session backend or middleware if needed.

*   **Security Headers**: Ensure all relevant security headers (e.g., Content Security Policy, X-Content-Type-Options, Referrer-Policy) are properly configured.
    *   **Manual Step**: Configure these headers in your web server (Nginx, Apache) or through Django middleware.

*   **Regular Security Audits and Penetration Testing**: Periodically conduct security audits and penetration tests to identify and address vulnerabilities.
    *   **Manual Step**: Engage security professionals for regular assessments.