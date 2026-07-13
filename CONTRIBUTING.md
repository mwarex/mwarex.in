# Contributing to MWareX

First off, thank you for considering contributing to MWareX! It's people like you that make MWareX a great platform.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Check existing issues:** Before creating bug reports, please check a list of existing issues.
- **Use the template:** When you create a bug report, please include as many details as possible following the Bug Report template.

### Suggesting Enhancements

- **Use the template:** Open an issue and use the Feature Request template to describe your idea, why it's needed, and how it should work.

### Pull Requests

1. **Fork the repo** and create your branch from `main`.
2. **Setup the project** by following the setup instructions in the `README.md`.
3. **If you've added code** that should be tested, add tests.
4. **If you've changed APIs**, update the documentation.
5. **Ensure the test suite passes**.
6. **Make sure your code lints** (Run `npm run lint`).
7. **Issue that pull request!**

## Development Workflow

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```

### AI Engine (Python)
```bash
cd ai_engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Commit Message Guidelines

We follow standard conventional commits:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools
