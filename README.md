# Stellar Explorer dApp 🚀

A complete end-to-end mini-dApp built for the Level 3 Challenge. This project demonstrates core frontend Web3 skills by interacting with the Stellar Horizon Testnet API. It features loading states, intelligent client-side caching, and comprehensive unit tests.

## 🌟 Features

- **Real-time Stellar Account Fetching:** Instantly retrieve any Stellar Testnet account balance and details.
- **Progress Indicators:** Modern UI with glassmorphism design, loading spinners, and a sleek animated progress bar.
- **Intelligent Caching:** Implements `sessionStorage` caching for instant re-loads and `localStorage` for search history persistence.
- **Robust Testing:** Includes 6x unit tests covering UI states, data fetching, API errors, caching, and progress indicators using Vitest and React Testing Library.
- **Recent Searches:** Keep track of your last 5 searched accounts for quick access.

## 🔗 Live Demo & Resources

- **Live Demo Link:** `[Insert Your Vercel/Netlify Link Here]` *(Please deploy the app and add the link here)*
- **Demo Video Link:** `[Insert Your Video Link Here]` *(A demo video has been generated as `demo-video.webp` in your root folder. You can upload it to YouTube/Loom and put the link here.)*
- **Screenshot of Passing Tests:**  
  *We have saved the test output in `frontend/docs/tests-passing.txt`. Please take a screenshot of it or your terminal and replace `[Screenshot Placeholder]` with the actual image path.* 
  ![Tests Passing]([Screenshot Placeholder])

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
- [x] Minimum 3 tests passing (6 implemented)
- [x] README complete
- [x] Demo video recorded (pending upload by user)
- [x] Minimum 3+ meaningful commits

---
*Built with ❤️ for Rise-In Web3 Challenge*
