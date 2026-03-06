# Branch Protection Rules

## main

- Only merge via pull request from develop or hotfix/\*
- Require build to pass before merge
- Never commit directly to main after v1.0.0 launch

## develop

- Default working branch
- All features branch from here
- Merge to main only when ready to release

## Naming conventions

- feature/[description] → new functionality
- fix/[description] → bug fix
- chore/[description] → maintenance
- hotfix/[description] → emergency production fix

## Commit message format

feat: | fix: | chore: | docs: | refactor: | style:
