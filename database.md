# Database Schema - NLA Data Portal

This document outlines the PostgreSQL database schema for the Rwanda National Land Authority Data Portal.

## Overview

The database is designed to support a data request management system with role-based access control, document handling, and comprehensive audit trails for land data access requests.

**Key Design Decision**: The schema uses a consolidated approach where:
- `requests` table contains basic request metadata (title, description, user, overall status)
- `request_datasets` table contains each dataset within a request with its own specific criteria including date ranges, administrative levels, UPI lists, etc.
- This allows each dataset in a request to have different date ranges, criteria, and even approval status

## Tables

### 1. Users Table

Stores all user information including external researchers, NLA staff, and administrators.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('external', 'internal', 'admin')),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN (
        'individual', 'academic_institution', 'research_organization', 
        'private_company', 'ngo', 'government_agency', 
        'international_organization', 'employee'
    )),
    organization_name VARCHAR(255),
    organization_email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_user_type ON users(user_type);
```

### 2. User Permissions Table

Manages granular permissions for each user role.

```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    can_view_all_requests BOOLEAN DEFAULT FALSE,
    can_approve_requests BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_view_audit_trail BOOLEAN DEFAULT FALSE,
    can_export_data BOOLEAN DEFAULT FALSE,
    can_configure_datasets BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
```

### 3. Requests Table

Core table for managing data access requests (consolidated design).

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_request_number ON requests(request_number);
CREATE INDEX idx_requests_created_at ON requests(created_at);
```

### 4. Dataset Categories Table

Defines available dataset categories and their metadata.

```sql
CREATE TABLE dataset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dataset_categories (name, icon, description) VALUES
('Transaction Reports', '📊', 'Reports on land transaction activities and statistics'),
('User Activity Reports', '👥', 'Reports on user activities and performance metrics'),
('Parcel Analysis Reports', '🗺️', 'Detailed reports on land parcels and their characteristics'),
('Spatial Data (Shapefiles)', '🌍', 'Geographic data files for mapping and spatial analysis');
```

### 5. Datasets Table

Defines individual datasets within categories.

```sql
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES dataset_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    requires_period BOOLEAN DEFAULT FALSE,
    requires_upi_list BOOLEAN DEFAULT FALSE,
    requires_id_list BOOLEAN DEFAULT FALSE,
    requires_upi BOOLEAN DEFAULT FALSE,
    has_admin_level BOOLEAN DEFAULT FALSE,
    has_user_level BOOLEAN DEFAULT FALSE,
    has_transaction_type BOOLEAN DEFAULT FALSE,
    has_land_use BOOLEAN DEFAULT FALSE,
    has_size_range BOOLEAN DEFAULT FALSE,
    fields JSONB, -- Array of field names for the dataset
    criteria JSONB, -- Array of criteria identifiers
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_datasets_category_id ON datasets(category_id);
```

### 6. Request Datasets Table

Each row represents one dataset within a request with ALL dataset-specific criteria including date ranges.

```sql
CREATE TABLE request_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    
    -- Dataset-specific criteria (each dataset can have different requirements)
    date_range_from DATE,
    date_range_to DATE,
    administrative_level JSONB, -- {province: "Kigali", district: "Gasabo", etc.}
    transaction_types VARCHAR(255)[], -- Array of transaction types
    land_use_types VARCHAR(255)[], -- Array of land use types  
    size_range_min DECIMAL,
    size_range_max DECIMAL,
    upi_list TEXT[], -- Array of UPI codes
    id_list VARCHAR(255)[], -- Array of national IDs
    user_id UUID REFERENCES users(id), -- For user-specific datasets
    
    -- Additional criteria as needed
    additional_criteria JSONB, -- For future extensibility
    
    -- Status per dataset (a request can have multiple datasets with different statuses)
    dataset_status VARCHAR(50) DEFAULT 'pending' CHECK (dataset_status IN ('pending', 'approved', 'rejected', 'processing')),
    dataset_notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_request_datasets_request_id ON request_datasets(request_id);
CREATE INDEX idx_request_datasets_dataset_id ON request_datasets(dataset_id);
CREATE INDEX idx_request_datasets_status ON request_datasets(dataset_status);
CREATE INDEX idx_request_datasets_dates ON request_datasets(date_range_from, date_range_to);
```

### 7. Supporting Documents Table

Manages uploaded documents for requests.

```sql
CREATE TABLE supporting_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('verification', 'research', 'authorization', 'other')),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_supporting_documents_request_id ON supporting_documents(request_id);
CREATE INDEX idx_supporting_documents_category ON supporting_documents(category);
```

### 8. Administrative Levels Table

Rwanda's administrative hierarchy for location-based filtering.

```sql
CREATE TABLE administrative_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    village VARCHAR(100),
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3, 4, 5)), -- 1=Province, 2=District, 3=Sector, 4=Cell, 5=Village
    parent_id UUID REFERENCES administrative_levels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_levels_province ON administrative_levels(province);
CREATE INDEX idx_admin_levels_district ON administrative_levels(district);
CREATE INDEX idx_admin_levels_level ON administrative_levels(level);
CREATE INDEX idx_admin_levels_parent_id ON administrative_levels(parent_id);
```

### 9. Audit Trail Table

Comprehensive logging of all system activities.

```sql
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'request', 'document', etc.
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_entity_type ON audit_trail(entity_type);
CREATE INDEX idx_audit_trail_entity_id ON audit_trail(entity_id);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at);
```

### 10. User Sessions Table

Manages user authentication sessions.

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```


### 12. Request Comments Table

Internal comments and communication on requests.

```sql
CREATE TABLE request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    parent_comment_id UUID REFERENCES request_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_comments_user_id ON request_comments(user_id);
```

### 13. Data Export Logs Table

Tracks all data exports for compliance and audit purposes.

```sql
CREATE TABLE data_export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    export_type VARCHAR(50) NOT NULL,
    dataset_info JSONB NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('csv', 'xlsx', 'json', 'shapefile', 'pdf')),
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_export_logs_request_id ON data_export_logs(request_id);
CREATE INDEX idx_data_export_logs_user_id ON data_export_logs(user_id);
CREATE INDEX idx_data_export_logs_created_at ON data_export_logs(created_at);
```

## Views

### Request Summary View

```sql
CREATE VIEW request_summary_view AS
SELECT 
    dr.id,
    dr.request_number,
    dr.title,
    dr.status,
    dr.created_at,
    dr.updated_at,
    u.name as user_name,
    u.email as user_email,
    u.organization_name,
    u.user_type,
    approved_user.name as approved_by_name,
    COUNT(sd.id) as document_count,
    COUNT(rd.id) as dataset_count
FROM requests dr
LEFT JOIN users u ON dr.user_id = u.id
LEFT JOIN users approved_user ON dr.approved_by = approved_user.id
LEFT JOIN supporting_documents sd ON dr.id = sd.request_id
LEFT JOIN request_datasets rd ON dr.id = rd.request_id
GROUP BY dr.id, u.id, approved_user.id;
```

## Triggers and Functions

### Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_requests_timestamp BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_permissions_timestamp BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### Audit Trail Trigger

```sql
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (user_id, action, entity_type, entity_id, new_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (user_id, action, entity_type, entity_id, old_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_requests_user_status ON requests(user_id, status);
CREATE INDEX idx_requests_status_created ON requests(status, created_at);
CREATE INDEX idx_documents_request_category ON supporting_documents(request_id, category);

-- Full-text search indexes
CREATE INDEX idx_requests_title_search ON requests USING gin(to_tsvector('english', title));
CREATE INDEX idx_requests_description_search ON requests USING gin(to_tsvector('english', description));
```

## Database Initialization

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('external', 'internal', 'admin');
CREATE TYPE user_type AS ENUM ('individual', 'academic_institution', 'research_organization', 'private_company', 'ngo', 'government_agency', 'international_organization', 'employee');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'in_review');
CREATE TYPE document_category AS ENUM ('verification', 'research', 'authorization', 'other');
CREATE TYPE export_format AS ENUM ('csv', 'xlsx', 'json', 'shapefile', 'pdf');
```

This schema supports the full functionality of the NLA Data Portal while maintaining data integrity, audit capabilities, and scalability for future enhancements.