-- SQL Schema for Rent-A-Room Users
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists (optional, be careful in production!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'tenant' CONSTRAINT chk_user_role CHECK (role IN ('tenant', 'owner', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CONSTRAINT chk_user_status CHECK (status IN ('active', 'suspended', 'pending')),
    avatar TEXT DEFAULT 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    location VARCHAR(255) DEFAULT '',
    bio TEXT DEFAULT '',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    verified BOOLEAN DEFAULT FALSE,
    preferences TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user retrieval by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for searching by role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rent NUMERIC(10, 2) NOT NULL,
    deposit NUMERIC(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL CONSTRAINT chk_room_type CHECK (room_type IN ('single', 'double', 'studio', 'shared', 'penthouse')),
    furnishing VARCHAR(50) NOT NULL CONSTRAINT chk_furnishing CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
    images TEXT[] DEFAULT '{}'::TEXT[],
    available_from VARCHAR(50) NOT NULL,
    amenities TEXT[] DEFAULT '{}'::TEXT[],
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CONSTRAINT chk_listing_status CHECK (status IN ('active', 'filled', 'pending', 'inactive')),
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    floor_area NUMERIC(10, 2),
    floor INTEGER,
    total_floors INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching rooms by city and area
CREATE INDEX IF NOT EXISTS idx_rooms_city_area ON rooms(city, area);
-- Index for filtering by owner
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Create rent_requests table
CREATE TABLE IF NOT EXISTS rent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CONSTRAINT chk_request_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    message TEXT,
    owner_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for filtering requests by tenant
CREATE INDEX IF NOT EXISTS idx_requests_tenant ON rent_requests(tenant_id);
-- Index for filtering requests by room
CREATE INDEX IF NOT EXISTS idx_requests_room ON rent_requests(room_id);

