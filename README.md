# TMDay

TMDay is a solution composed of a .NET RESTful API, a React web application, and a set of automated tests. The project focuses on managing and visualizing test cases and tracking their progress.

## Project Structure

- TMDay.API: .NET RESTful API for managing test cases.
- TMDay.Web: React web application to interact with the API.
- TMDay.Tests: Automated unit tests for the API.

## Requirements

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js and npm](https://nodejs.org/)
- [Vite](https://vitejs.dev/) (optional, installed via npm)

## Setup

1. Clone the repository:
```
git clone https://github.com/dayannis06/TMDay.git
```
2. Restore dependencies and build the API:
```
cd TMDay.API
dotnet restore
dotnet build
```

3. Install frontend dependencies:
```
cd TMDay.Web
npm install
```

## Usage

### API (.NET)
```
cd TMDay.API
dotnet run
```

The API will be available at `https://localhost:5206` or the configured port.

### Frontend (React)
```
cd TMDay.Web
npm run dev
```

The app will be available at `http://localhost:5173` (or the port configured by Vite).

## Testing (xUnit)
```
cd TMDay.Tests
dotnet test
```
## What did I learn from this project?
- Best practices for organizing a multi-project solution (API, frontend, and tests).
- How to design and implement a RESTful API using .NET that supports create, read, update, and delete (CRUD) operations.
- How to write and run automated unit tests using xUnit for .NET projects.


## What did I learn from this course?
- Work with files and directories, and store and retrieve json files.
- How to use JsonSerializer class for serializing and deserializing JSON data.
- Parallel programming in C# using Task Parallel Library (TPL).
- Execute data queries using LINQ in both query syntax and method syntax forms.
- Improved my skills in debugging, troubleshooting, and iterative development.

## What I have done differently or what additional features would I have added?
- I would add a duplication feature for test scenarios, allowing users to modify only the necessary parts when creating similar scenarios.
- I would implement authentication and role-based authorization to enable different users to manage test cases according to their roles.
- I would migrate from file-based storage to a database to improve scalability, reliability, and data consistency.

## Use of IA
- I used AI to generate and refine pages, components, and specific styling details within the existing frontend structure.
- I also used AI as a code completion assistant while writing code and help troubleshoot issues.
