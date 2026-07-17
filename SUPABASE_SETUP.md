# Choco Planner - mise en service Supabase

## 1. Creer le projet

1. Creer un projet sur Supabase.
2. Ouvrir `SQL Editor`.
3. Coller et executer tout le fichier `supabase/schema.sql`.

## 2. Creer le premier utilisateur

1. Ouvrir `Authentication > Users`.
2. Creer l'utilisateur administrateur avec son email et son mot de passe.
3. Dans `SQL Editor`, executer en remplacant l'adresse :

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'VOTRE_EMAIL'
);
```

Les autres roles possibles sont `planner`, `production` et `viewer`.

Pour limiter l'acces aux personnes invitees, desactiver les inscriptions publiques
dans les reglages d'authentification Supabase et creer les utilisateurs depuis
`Authentication > Users`.

## 3. Connecter Vercel

Dans Vercel, ouvrir `Project Settings > Environment Variables` et ajouter :

- `VITE_SUPABASE_URL` : Project Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY` : Project Settings > API > anon/public key

Selectionner `Production`, `Preview` et `Development`, puis redeployer.

Ne jamais mettre la `service_role key` dans Vercel avec le prefixe `VITE_`, dans
GitHub ou dans le code. Le navigateur utilise uniquement la cle `anon`, protegee
par les politiques RLS du fichier SQL.

## 4. Premier test

1. Se connecter a Choco Planner.
2. Choisir une usine et preparer un planning.
3. Ouvrir `Versiones`.
4. Enregistrer un brouillon.
5. Cliquer sur `Aprobar y congelar`.
6. Verifier que produits, dates et quantites planifiees ne sont plus modifiables.
7. Saisir `Real kg` et une `Nota del turno`.
8. Recharger la page puis rouvrir la version : le reel et la note doivent rester.
9. Cliquer sur `Compartir` et tester le lien avec un utilisateur `viewer`.

