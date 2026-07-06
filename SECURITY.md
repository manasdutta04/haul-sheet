# Security

Haul Sheet is a public assessment/demo app. It does not store user accounts or trip history.

## Supported Use

This app is intended as a planning/demo tool only. It is not a certified ELD, legal compliance record, or fleet management system.

## Sensitive Data

Do not commit:

- `.env`
- API keys
- Django secret keys
- database files
- deployment tokens

The included `.gitignore` excludes common local secrets and generated files.

## Reporting Issues

If this were a production app, security reports should be sent privately to the maintainer. For this assessment project, open a GitHub issue or contact the repository owner directly.
