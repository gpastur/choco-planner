# Activer Aldo IA sur Vercel

1. Creer une cle API dans la plateforme OpenAI.
2. Dans Vercel, ouvrir le projet Choco Planner.
3. Aller dans `Settings` > `Environment Variables`.
4. Ajouter `OPENAI_API_KEY` avec la cle API. Selectionner Production et Preview.
5. Ajouter `ALDO_OPENAI_MODEL` avec la valeur `gpt-5-mini`.
6. Redeployer la derniere version.

La cle reste cote serveur dans Vercel. Elle ne doit jamais etre ajoutee dans GitHub,
dans `src`, ni dans une variable commencant par `VITE_`.

Aldo recoit les donnees operationnelles utiles a la question: produits, lignes,
stocks, min/max, demande, planning, production reelle et notes. Les recettes et
les variables `RECETAS_*` ne sont pas envoyees a Aldo.

Sans `OPENAI_API_KEY`, Aldo conserve ses reponses locales de secours.
