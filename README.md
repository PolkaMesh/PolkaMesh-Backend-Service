# PolkaMesh Backend Service

Backend service for PolkaMesh - Automated event listener and job executor for the decentralized AI compute marketplace.

## 🚀 What This Does

This NestJS backend service replaces the Phat contract functionality for MVP demonstrations by:
- Listening for blockchain events from 6 deployed contracts
- Executing AI jobs (simulated)
- Generating attestation proofs
- Automating payment releases

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the service
npm run start:dev

# 3. With Docker
docker-compose up -d backend
```

## 📋 Features

- ✅ Direct Polkadot.js integration (no SDK dependency)
- ✅ 6 contract services (PaymentEscrow, JobQueue, PhalaJobProcessor, etc.)
- ✅ Event listener for JobSubmitted events
- ✅ Automated job execution flow
- ✅ Attestation generation
- ✅ Payment automation
- ✅ Docker support

## 🏗️ Architecture

```
Backend Service (Port 3000)
    ↓
Polkadot.js API
    ↓
6 Contracts on Paseo Testnet
```

## 🔧 Configuration

Edit `.env` file with your contract addresses and RPC endpoint.

## 📝 License

Apache-2.0