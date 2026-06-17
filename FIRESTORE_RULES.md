# Firestore Security Rules

Cole as seguintes regras no Firebase Console > Firestore Database > Rules:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /empresas/{userId} {

      allow read, write:
      if request.auth != null
      && request.auth.uid == userId;

      match /{document=**} {
        allow read, write:
        if request.auth != null
        && request.auth.uid == userId;
      }
    }
  }
}
```

## Passos para aplicar:

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Acesse "Firestore Database"
4. Clique na aba "Rules"
5. Apague o conteúdo padrão
6. Cole o código acima
7. Clique em "Publish"
