# Deploy steps (Luca does these himself)

## One time
1. On GitHub create a **public** repo named `minuet-of-forest`.
2. Push this folder:
   ```
   git remote add origin https://github.com/WandeR22LSTR/minuet-of-forest.git
   git branch -M main
   git push -u origin main
   ```
   If GitHub made an initial commit, run `git pull origin main --allow-unrelated-histories --no-rebase -X ours --no-edit` first.
3. Repo -> Settings -> Pages -> Source: **GitHub Actions**.
4. The site appears at `https://wander22lstr.github.io/minuet-of-forest/` after the first workflow run (Actions tab).

## Every change
`git push`. The workflow builds and deploys.

## Before going live
Run `npm run todos`, finish or draft every item, and have your PI check the research page wording.

## After Nocturne of Shadow exists
Set `NOCTURNE_URL` (its login page address) in `site.config.mjs` and push. The hidden footer medallion then appears.
