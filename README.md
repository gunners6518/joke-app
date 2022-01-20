# joke-app

Created a joke-app for the official remix tutorial  
The following requirements are met.

- user registration by authentication
- Maintaining user and joke data using prisma
- joke crud
- SEO with Meta Tags

reference  
https://remix.run/docs/en/v1/tutorials/jokes

## DataBase

```prisma
model User {
  id           String   @id @default(uuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  username     String   @unique
  passwordHash String
  jokes        Joke[]
}

model Joke {
  id         String   @id @default(uuid())
  jokesterId String
  jokester   User     @relation(fields: [jokesterId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  name       String
  content    String
}
```

# deploy

https://joke-app.fly.dev/

## true structure

```
remix-jokes
├── README.md
├── app
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── routes
│       └── index.tsx
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── remix.config.js
├── remix.env.d.ts
└── tsconfig.json
```
