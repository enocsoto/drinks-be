Este repositorio usa convenciones de commit (conventional commits) y una plantilla de PR.

Pasos mínimos para colaborar:

1. Instalar dependencias (ejemplo con npm):

```bash
npm install
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged
```

2. Activar Husky (si no está activado):

```bash
npx husky install
npx husky add .husky/commit-msg "npx --no-install commitlint --edit \"$1\""
```

3. Opcional: configurar `lint-staged` en `package.json` para formateo/lint en pre-commit.

4. Usar la plantilla de PR al crear pull requests y seguir las reglas de commit.
