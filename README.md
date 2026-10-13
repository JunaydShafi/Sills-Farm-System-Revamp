# Sills-Farm-System-Revamp

A modern web-based business management system for Pleasant Grove Farms, developed by Project DREAM at Sacramento State.

**Project DREAM | CSC 190/191 Senior Project | California State University, Sacramento**

## Overview

The Sills Farm System Revamp is a software modernization project developed by Project DREAM for Pleasant Grove Farms, a third-generation agricultural business in Northern California.

Pleasant Grove Farms currently relies on a legacy Microsoft Access and VBA business management system originally developed using technology from the early 2000s. Although the existing system supports the farm's daily operations, its aging architecture presents challenges involving maintainability, security, scalability, and compatibility with modern technology.

Our goal is to develop a modern, web-based business management application that preserves the essential functionality of the existing system while improving its interface, security, reliability, and long-term maintainability.

## Project Objectives

- Modernize the existing Microsoft Access business system.
- Develop an intuitive interface based on redesigned Figma mockups.
- Implement secure user authentication and role-based access control.
- Support multiple users accessing the system.
- Transition business data to a modern relational database.
- Preserve existing business operations and reporting capabilities.
- Develop a maintainable and scalable application.

## Planned Features

The system is intended to support the following business operations:

- Customer Management
- Vendor Management
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

| **Technology** | **Purpose** |
| -------------- | ----------- |
| JavaScript | Primary programming language |
| React | Frontend user interface |
| Next.js | Full-stack application framework |
| Tailwind CSS | Interface styling |
| PostgreSQL | Planned relational database |
| Microsoft Azure | Planned cloud hosting |
| GitHub | Version control and collaboration |

The technology stack may be adjusted as development progresses.

## Development Status

**In Development — CSC 190, Fall 2026**

The initial development phase focuses on establishing the application structure and implementing frontend pages based on approved Figma designs.

Database integration, authentication, business logic, and deployment will be implemented during subsequent development phases.

**Anticipated Project Completion:** May 2027

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

---

## Getting Started

The following instructions explain how to download, install, and run the Sills Farm System Revamp application locally.

### Prerequisites

Before running the application, install the following:

- **Node.js** — Version 20.9 or later, compatible with the project's Next.js version. An active LTS release is recommended.
- **npm** — Included with Node.js.
- **Git** — Required for cloning the repository and collaborating.
- **Visual Studio Code** — Recommended code editor.
- **Web Browser** — Google Chrome, Microsoft Edge, or another modern browser.

Download links:

- Node.js: https://nodejs.org/
- Git: https://git-scm.com/
- Visual Studio Code: https://code.visualstudio.com/

To verify that Node.js, npm, and Git are installed, open a terminal and run:

```bash
node -v
npm -v
git --version
```

Each command should display the installed version.

### Installation

**Step 1 — Clone the repository**

Open a terminal in the directory where you want to store the project.

```bash
git clone https://github.com/JunaydShafi/Sills-Farm-System-Revamp.git
```

This downloads the project source code from GitHub.

**Step 2 — Navigate to the project directory**

```bash
cd Sills-Farm-System-Revamp
```

**Step 3 — Install dependencies**

```bash
npm install
```

This installs the dependencies defined in `package.json`, including Next.js, React, and Tailwind CSS.

Dependencies are installed locally in the `node_modules` directory, which is excluded from Git version control.

**Step 4 — Start the development server**

```bash
npm run dev
```

Wait for the terminal to display a message indicating that the development server is ready.

**Step 5 — Open the application**

Open a browser and navigate to:

http://localhost:3000

The application should now be running locally.

Changes made to application files will generally appear automatically in the browser during development.

To stop the development server, press `Ctrl + C` in the terminal.

### Project Structure

The application uses the Next.js App Router.

```text
Sills-Farm-System-Revamp/
├── public/                  # Static images, logos, and icons
├── src/
│   └── app/
│       ├── page.js          # Main dashboard/homepage
│       ├── layout.js        # Shared application layout
│       └── globals.css      # Global styles and Tailwind CSS
├── .gitignore               # Files excluded from Git
├── eslint.config.mjs        # ESLint configuration
├── jsconfig.json            # JavaScript project configuration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Locked dependency versions
└── README.md                # Project documentation
```

Additional application pages will be created inside `src/app/` as development progresses.

For example:

```text
src/app/
├── page.js
├── customers/
│   └── page.js
├── vendors/
│   └── page.js
└── orders/
    └── page.js
```

These pages correspond to:

- `/` — Main dashboard
- `/customers` — Customer Management
- `/vendors` — Vendor Management
- `/orders` — Order Management

### Development Notes

- The application is currently under active development.
- PostgreSQL and Azure are planned for later development stages and are not required to run the current frontend.
- Placeholder data may be used during frontend development.
- Actual business records and sensitive information must not be committed to GitHub.
- Development dependencies may have outstanding security advisories. Contributors should review npm audit results and avoid forced dependency upgrades without team review.

---

## GitHub Collaboration Workflow

Project DREAM uses Git and GitHub for version control and collaborative development.

To minimize merge conflicts and protect the main application, **all team members should develop their assigned features on separate branches**.

The `main` branch represents the shared, stable version of the project.

Feature branches should be merged into `main` through GitHub pull requests after review.

### Step 1 — Obtain Repository Access

Team members must have a GitHub account and accept the repository collaboration invitation sent by the team leader.

After accepting the invitation, clone the repository using the instructions in the Getting Started section.

### Step 2 — Update the Local Main Branch

Before starting new work, open the terminal in the project directory and run:

```bash
git switch main
git pull origin main
```

This switches to the `main` branch and downloads the latest changes from GitHub.

**Important:** Do not start new work on an outdated version of `main`.

### Step 3 — Create a Feature Branch

Each team member should create a separate branch for their assigned task.

For example, a developer assigned to the Customer Management page could run:

```bash
git switch -c feature/customer-page
```

This creates a new branch named `feature/customer-page` and automatically switches to it.

Recommended branch names include:

```text
feature/dashboard
feature/customer-page
feature/vendor-page
feature/orders-page
feature/invoices-page
feature/inventory-page
feature/federal-reporting
feature/user-management
feature/login-page
```

Branch names should describe the feature or task being developed.

To verify the current branch, run:

```bash
git branch
```

The active branch will be marked with an asterisk (`*`).

### Step 4 — Develop the Assigned Feature

Develop the assigned functionality using the approved Figma mockups and project requirements.

Team members should:

- Work primarily on files related to their assigned feature.
- Follow the existing project structure and coding conventions.
- Use placeholder data when backend functionality is not yet available.
- Test their changes locally using `npm run dev`.
- Avoid committing passwords, credentials, database files, or confidential business information.
- Communicate with the team before modifying shared files that other developers may be editing.

### Step 5 — Stage and Commit Changes

After completing a meaningful portion of work, check the modified files:

```bash
git status
```

Stage the changes:

```bash
git add .
```

Review the staged changes:

```bash
git status
```

Create a commit with a descriptive message:

```bash
git commit -m "Implement customer management page layout"
```

Commit messages should clearly describe the changes made.

Examples:

```text
Implement dashboard navigation
Create vendor management page
Add invoice form components
Fix inventory table styling
Update federal reporting layout
```

Team members are encouraged to commit regularly as they make meaningful progress.

### Step 6 — Push the Feature Branch to GitHub

After committing changes, push the feature branch:

```bash
git push -u origin feature/customer-page
```

Replace `feature/customer-page` with the name of your own branch.

The `-u` option establishes a tracking relationship between the local branch and the remote GitHub branch.

For subsequent pushes on the same branch, developers can generally use:

```bash
git push
```

**Important:** Pushing a feature branch does not automatically merge it into `main`.

### Step 7 — Create a Pull Request

After pushing the feature branch:

1. Open the project's GitHub repository.
2. Navigate to the **Pull requests** tab.
3. Click **New pull request**, or use the **Compare & pull request** button if GitHub displays it.
4. Set the base branch to `main`.
5. Set the compare branch to the feature branch (for example, `feature/customer-page`).
6. Enter a descriptive title and explanation of the changes.
7. Reference the related Jira story or task when applicable.
8. Click **Create pull request**.

The pull request allows the team to review the changes before merging them into the main application.

### Step 8 — Review and Merge the Pull Request

The team leader or designated reviewer should review the pull request.

The review should verify that:

- The feature follows the approved Figma design and project requirements.
- The code is readable and appropriately organized.
- The application runs without new errors.
- The changes do not unintentionally affect unrelated pages.
- No confidential information or credentials have been committed.
- Any merge conflicts have been resolved.

After approval and successful checks, an authorized team member can click **Merge pull request** on GitHub.

Once merged, the feature becomes part of the `main` branch.

**Team members should avoid pushing directly to `main` unless explicitly coordinated with the team.**

### Step 9 — Update the Local Repository After a Merge

After a pull request has been merged, developers should update their local `main` branch:

```bash
git switch main
git pull origin main
```

This downloads the newly merged changes.

For the next assigned task, create another feature branch:

```bash
git switch -c feature/next-task
```

Developers should generally use a new branch for each separate feature or Jira story rather than continuously reusing an old branch.

### Example: Complete Feature Development Workflow

The following example demonstrates the typical process for developing a Customer Management page.

```bash
# 1. Switch to the main branch
git switch main

# 2. Download the latest changes
git pull origin main

# 3. Create a new feature branch
git switch -c feature/customer-page

# 4. Develop and test the customer page
npm run dev

# Stop the development server with Ctrl+C before continuing

# 5. Review changes
git status

# 6. Stage changes
git add .

# 7. Commit changes
git commit -m "Implement customer management page"

# 8. Push the feature branch
git push -u origin feature/customer-page
```

Next, open GitHub and create a pull request from `feature/customer-page` into `main`.

After the pull request is reviewed and merged, update the local repository:

```bash
git switch main
git pull origin main
```

### Collaboration Guidelines

To support efficient teamwork, Project DREAM follows these guidelines:

1. **Do not develop new features directly on `main`.** Create a feature branch for each task.
2. **Pull the latest changes before starting a new branch.** This reduces conflicts and keeps development synchronized.
3. **Commit frequently with meaningful messages.** Each commit should represent a clear development change.
4. **Push branches regularly.** This makes work available for review and collaboration.
5. **Use pull requests for integration.** All major changes should be reviewed before merging into `main`.
6. **Coordinate shared-file changes.** Developers should communicate when modifying common layouts, navigation, or configuration.
7. **Keep sensitive information out of GitHub.** Never commit passwords, API keys, private database records, or confidential farm information.
8. **Track work in Jira.** Branches, commits, and pull requests should reference the relevant Jira tasks when practical.

---

## Project Disclaimer

This project is being developed for educational purposes as part of Sacramento State's Computer Science Senior Project program in collaboration with Pleasant Grove Farms.

The repository is intended to contain application source code and development resources. Confidential business information, employee records, financial data, and production credentials must not be committed.

## Acknowledgments

Special thanks to Edward M. Sills and Pleasant Grove Farms for providing the opportunity to modernize their existing business management system.

We also thank the Sacramento State Computer Science faculty and our project advisor for their guidance throughout development.
