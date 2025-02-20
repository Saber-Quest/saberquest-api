
<p align="center">
  <a href="https://saberquest.xyz/" target="_blank">
    <img src="https://saberquest.xyz/assets/images/Logo.png" width="120" alt="SaberQuest Logo" />
  </a>
</p>

<h1 align="center"><strong>SaberQuest <br>Beat Saber made fun!</strong></h1>

## Project setup

```bash
$ pnpm install
```

## Database setup

```bash
# running the PostgreSQL docker
$ docker compose up -d

# using prisma to migrate and seed database
$ npx prisma migrate dev --name init
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run build && pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
## Support

Contributing is done via pull requests. If you want to add something, don't be afraid to do it!

## License

SaberQuest is [Apache 2.0 licensed](https://github.com/Saber-Quest/saberquest-api/blob/master/LICENSE).
