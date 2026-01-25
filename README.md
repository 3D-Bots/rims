# React Inventory Management System (RIMS)

RIMS is an Open Source Inventory Management System designed primarily to keep track of electronic parts and components. It allows you to keep track of your available parts and assist you with re-ordering parts.

## Project Status

This project is currently in an early alpha stage. This is a React + TypeScript frontend application.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Bootstrap (UI framework)
- React Router v6 (routing)
- localStorage (data persistence)

## Installation

```bash
npm install
npm run dev
```

This will install all dependencies and start the development server at http://localhost:5173.

## Default Credentials

**Admin User**
```
username: admin@example.com
password: changeme
```

**Regular User**
```
username: user@example.com
password: changeme
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- User authentication with role-based access control
- Inventory item management (CRUD)
- Sortable and paginated item list
- Image upload support
- Admin user management
- Category-based organization

## Categories

Items can be organized into categories:
Arduino, Raspberry Pi, BeagleBone, Prototyping, Kits & Projects, Boards, LCDs & Displays, LEDs, Power, Cables, Tools, Robotics, CNC, Components & Parts, Sensors, 3D Printing, Wireless
