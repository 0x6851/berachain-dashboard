# Berachain Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd berachain-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add necessary environment variables (e.g., API keys).

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests
```bash
npm test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Deployment
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Features
- **CoinGecko Supply Data:** The dashboard now fetches historical supply data for BERA from CoinGecko via the `/api/coingecko` endpoint. This provides accurate and up-to-date supply information.

## Setup
- Ensure you have the necessary environment variables set up for API access.
- Run `npm install` to install dependencies.
- Start the development server with `npm run dev`.

## Usage
- Visit `http://localhost:3000` to view the dashboard.
- The supply chart will display the historical supply data fetched from CoinGecko.
