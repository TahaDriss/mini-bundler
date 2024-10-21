# Mini Bundler

Mini Bundler is a simple JavaScript module bundler that constructs a dependency graph for your project, handles imports and exports, and detects circular dependencies.

## Features

-  **Dependency Graph**: Constructs a dependency graph of modules and resolves import/export relationships.
-  **Circular Dependency Detection**: Detects circular dependencies between modules and throws an error.
-  **Code Parsing**: Uses `acorn` to parse JavaScript files into an abstract syntax tree (AST).
-  **Modular Architecture**: Handles module linking, dependency extraction, and resolution.

## Getting Started

### Installation

You can clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd mini-bundler
npm install
```
