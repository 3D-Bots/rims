# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RIMS (React Inventory Management System) is an inventory management system for tracking electronic parts and components. This is a React + TypeScript frontend application using localStorage for data persistence.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: React Bootstrap + Bootstrap 5
- **Routing**: React Router v6
- **Icons**: React Icons (Font Awesome)
- **Data Storage**: localStorage (JSON)

### Directory Structure
```
src/
├── components/
│   ├── auth/         # Login, Register, EditProfile, ProtectedRoute
│   ├── common/       # AlertDisplay, Pagination, ConfirmModal
│   ├── items/        # ItemList, ItemDetail, ItemForm
│   ├── layout/       # Header, Footer, Layout
│   └── users/        # UserList, UserDetail, UserRow
├── contexts/
│   ├── AuthContext.tsx    # Authentication state management
│   └── AlertContext.tsx   # Flash message state management
├── services/
│   ├── authService.ts     # Authentication operations
│   ├── itemService.ts     # Item CRUD operations
│   ├── userService.ts     # User CRUD operations
│   └── storage.ts         # localStorage wrapper
├── types/
│   ├── User.ts           # User type definitions
│   └── Item.ts           # Item type definitions
└── data/
    └── seed.ts           # Initial seed data
```

### Key Features
- **Authentication**: Email/password login with role-based access (user, vip, admin)
- **Items**: Full CRUD with sortable/paginated table, image upload (base64), category selection
- **Users**: Admin-only user management with role changes
- **Alerts**: Auto-dismissing flash messages

### Default Credentials
- Admin: admin@example.com / changeme
- User: user@example.com / changeme

### Data Models

**User**: id, email, password, role, signInCount, lastSignInAt, lastSignInIp, timestamps

**Item**: id, name, description, productModelNumber, vendorPartNumber, vendorName, quantity, unitValue, value (calculated), picture, vendorUrl, category, location, timestamps

## Contributing

- Sign the CLA before contributing
- Branch naming: `rims-[issue-num]`
- Use `Fixes #123` in commit messages to auto-close issues
