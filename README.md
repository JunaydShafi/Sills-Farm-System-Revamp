# Sills Farm System Revamp

A modern web-based business management system for Pleasant Grove Farms, developed by **Project DREAM** at California State University, Sacramento.

**CSC 190/191 Senior Project | Sacramento State**

## Overview

The Sills Farm System Revamp is a software modernization project developed for Pleasant Grove Farms, a third-generation agricultural business in Northern California.

Pleasant Grove Farms currently relies on a legacy Microsoft Access and VBA business management system built using technology from the early 2000s. Although the existing system supports daily business operations, its aging architecture presents challenges involving maintainability, security, scalability, and compatibility with modern technology.

Our goal is to develop a modern, web-based application that preserves the essential functionality of the existing system while improving its user interface, security, reliability, and long-term maintainability.

## Project Objectives

- Modernize the existing Microsoft Access business system.
- Develop an intuitive interface based on redesigned Figma mockups.
- Implement secure authentication and role-based access control.
- Support multiple users accessing the system.
- Transition business data to a modern relational database.
- Preserve existing business operations and reporting capabilities.
- Develop a maintainable and scalable application.

## Planned Features

The system is intended to support:

- Customer and Vendor Management
- Product and Inventory Management
- Orders and Invoices
- Accounts Receivable and Accounts Payable
- Banking and Financial Records
- Employee and Payroll Management
- Reporting and Federal Tax Reporting
- User Management and Authentication
- Activity History and Audit Logging
- System Administration

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Primary programming language |
| React | Frontend user interface |
| Next.js | Full-stack application framework |
| Tailwind CSS | Interface styling |
| Lucide React | Interface icons |
| PostgreSQL | Planned relational database |
| Microsoft Azure | Planned cloud hosting |
| GitHub | Version control and collaboration |

The technology stack may be adjusted as development progresses.

## Development Status

**In Development — CSC 190, Fall 2026**

The initial development phase focuses on establishing the application structure and implementing frontend pages based on approved Figma designs.

**Currently implemented:**
- Next.js application structure
- Main dashboard and navigation interface
- Activity History placeholder page
- Shared farm logos, images, and interface icons

Database integration, authentication, business logic, and deployment are planned for subsequent development phases.

**Anticipated Project Completion:** May 2027

## Getting Started

### Prerequisites

- Node.js 20.9 or newer, using a supported release
- Git
- npm (included with Node.js)

### Installation

Clone the repository:

```bash
git clone https://github.com/JunaydShafi/Sills-Farm-System-Revamp.git
cd Sills-Farm-System-Revamp
```

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

The current frontend can run without a PostgreSQL database or Azure configuration.

## Contributing

Project DREAM uses **feature branches and GitHub pull requests** for collaborative development.

Developers should update their local `main` branch before starting new work, create a separate branch for each feature or Jira story, and request a review before merging into `main`.

For detailed setup instructions, Next.js page creation, images, Lucide React icons, and Git workflows, refer to the **Project DREAM Developer Setup & Collaboration Guide** (shared with team members).

## Development Team

**Project DREAM**  
California State University, Sacramento  
Department of Computer Science

- Junayd Shafi — Team Leader
- Peter
- Reymond
- Araiz
- Derick
- Christian

## Project Disclaimer

This project is being developed for educational purposes as part of Sacramento State's Computer Science Senior Project program in collaboration with Pleasant Grove Farms.

The repository is intended to contain application source code and development resources. Confidential business information, employee records, financial data, and production credentials must not be committed.

## Acknowledgments

Special thanks to Edward M. Sills and Pleasant Grove Farms for providing the opportunity to modernize their existing business management system.

We also thank the Sacramento State Computer Science faculty and our project advisor for their guidance throughout development.
