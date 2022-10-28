<h1 align="center">Mad Hatter - BanklessDAO's Discord Bot</h1>

<p align="center">
  <img src="./assets/profile.png" alt="mad-hatter-logo" width="120px" height="120px"/>
  <br>
  <i>Mad Hatter is a Node.js Discord bot written in Typescript to help
    <br> faciliate operations in the BanklessDAO Discord.</i>
  <br>
</p>

<p align="center">
  <a href="https://docs.bankless.community/mad-hatter-product-support/">User Guide</a>
  •
  <a href="https://discord.gg/EWRMHjqQVf">The Garage: DAO Bot Development Discord</a>
  •
  <a href="https://sentry.io/organizations/bankless-dao/projects/mad-hatter/?project=6095995">Sentry</a>
  <br>
  <br>
</p>
<hr>

## Documentation

- [Developer Setup](docs/DEVELOPER.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
#### Libraries
- [discord.js](https://discord.js.org/#/docs/main/stable/general/welcome)
- [slash-create](https://slash-create.js.org/#/)

#### Guides
* [discord.js Guide](https://discordjs.guide/)
* [A Guide to Discord Bots](https://maah.gitbooks.io/discord-bots/content/)

## Development Setup
### Prerequisites
- Install [Node.js 16.x](https://nodejs.org/en/) which includes [Node Package Manager](https://docs.npmjs.com/getting-started)
- Install [Yarn 1.x](https://classic.yarnpkg.com/lang/en/docs/install)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop) which includes Docker Engine, Docker CLI client, and Docker Compose.
- Configure Discord application on the [Discord Developer Portal](https://discord.com/developers/applications).

### Optional downloads
* Install [Robo3T](https://robomongo.org/) or Studio3T for a MongoDB GUI.
* Install [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) to simplifiy management of node versions.

### Starting the application

#### Recommended method
Verify [GNU Make](https://www.gnu.org/software/make/) v3.81+ is installed by running `make -v`, then run the Makefile in the project root directory:
```
make
```

#### Alternative methods
If not using GNU make:

```
docker-compose up --build
```

If not using Docker:
```
yarn start
```
