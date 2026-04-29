# Qurban Management System - Al Binaa 1447H

A modern, full-stack web application for managing Qurban registrations and inventory.

## Features
- **Dashboard**: Real-time statistics of registrations, funds, and animal stock.
- **Registration**: Interactive form for participants to choose qurban types (Sapi/Domba).
- **Inventory**: Management of available animal types and pricing based on the official 1447H program.
- **Data Persistence**: Uses a structured JSON database for easy management and portability.

## Tech Stack
- **Backend**: Node.js, Express, Dotenv, CORS.
- **Frontend**: Vanilla JavaScript (ES6+), Modern CSS (Glassmorphism & Flex/Grid), FontAwesome.
- **Database**: JSON-based storage (`data/database.json`).

## How to Run
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Open your terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Pricing Data (1447H / 2026 M)
Data has been pre-seeded into `data/database.json` according to the official Al Binaa Qurban 1447H program, including:
- **Sapi**: Tipe A, B, C, D (390Kg - 230Kg)
- **Domba**: Super, A, B, C, D (60Kg - 15Kg)
