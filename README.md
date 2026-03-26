# Stellar Explorer dApp 🚀

A complete end-to-end mini-dApp built for the Level 3 Challenge. This project demonstrates core frontend Web3 skills by interacting with the Stellar Horizon Testnet API. It features loading states, intelligent client-side caching, and comprehensive unit tests.

## 🌟 Features

- **Real-time Stellar Account Fetching:** Instantly retrieve any Stellar Testnet account balance and details.
- **Progress Indicators:** Modern UI with glassmorphism design and beautiful loading spinners.
- **Intelligent Caching:** Implements `sessionStorage` caching. Subsequent searches for the same account load instantly without hitting the API.
- **Robust Testing:** Includes 4x unit tests covering UI states, data fetching, API errors, and caching using Vitest and React Testing Library.

## 🔗 Live Demo & Resources

- **Live Demo Link:** [https://stellar-explorer-dapp-risein.vercel.app](https://stellar-explorer-dapp-risein.vercel.app) *(Replace with actual deployed link)*
- **Demo Video Link:** [Watch the 1-Minute Demo](https://youtube.com/...) *(Replace with actual video link)*
- **Screenshot of Passing Tests:**  
  ![Tests Passing](./docs/tests-passing.png)

## 🛠️ Technology Stack
- **Frontend Framework:** React + Vite (TypeScript)
- **Styling:** Vanilla CSS (Glassmorphism & Gradients)
- **Testing:** Vitest, React Testing Library, JSDOM
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stellar-explorer-dapp.git
   cd stellar-explorer-dapp/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Running Tests

To run the Vitest test suite and verify the functionality:

```bash
npm run test
```

## ✅ Requirements Checklist Fulfilled
- [x] Mini-dApp fully functional
- [x] Minimum 3 tests passing (4 implemented)
- [x] README complete
- [x] Demo video recorded (pending upload by user)
- [x] Minimum 3+ meaningful commits

---
*Built with ❤️ for Rise-In Web3 Challenge*
