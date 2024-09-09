# TestCoin

TestCoin är en blockchain-baserad applikation där användare kan registrera sig, logga in och utföra transaktioner med TestCoin-valutan. Systemet inkluderar funktioner för att skapa transaktioner, gräva block och se blockchain-historiken.

## Förutsättningar

För att köra detta projekt måste du ha följande installerat:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [PubNub](https://www.pubnub.com/)

## Installation

1-Navigera till backend-mappen:
  cd TestCoin-Backend
  npm install
  npm run dev

2-Navigera till frontend-mappen:
  cd TestCoin-Frontend
  npm install
  npm run dev

### API

POST /api/v1/TestCoin/auth/register: Registrera en ny användare.
POST /api/v1/TestCoin/auth/login: Logga in en användare och generera JWT-token.
GET /api/v1/TestCoin/transactions: Hämta transaktionshistorik.
POST /api/v1/TestCoin/transactions/create: Skapa en ny transaktion.
POST /api/v1/TestCoin/blockchain/mine: Gräv block i blockchain.

### Innan du kör applikationen, skapa en .env-fil i rotmappen för ditt backend-projekt med följande variabler

    MONGO_URI=<din-mongodb-url>
    JWT_SECRET=<hemlig-nyckel>
    PUBNUB_PUBLISH_KEY=<din-pubnub-publish-key>
    PUBNUB_SUBSCRIBE_KEY=<din-pubnub-subscribe-key>

1. Klona detta repo:

```bash
git clone https://github.com/dittanvandarnamn/TestCoin.git
