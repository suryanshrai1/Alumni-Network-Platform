## Deployed Link (Live Trial)

https://alumni-network-platform-six.vercel.app/

---

# Alumni Network Platform

A modern web application for connecting alumni, sharing events, and fostering community engagement. Built with React and Supabase, the platform offers real-time chat, event management, and a searchable alumni directory—all in a responsive, user-friendly interface.

---

## 🚀 Features

- **User Authentication**: Secure signup and login with Supabase Auth.
- **Alumni Directory**: Search and filter alumni profiles by department, year, and more.
- **Event Management**: Post, browse, and register for alumni events.
- **Real-Time Chat**: Instantly connect with other alumni via live chat.
- **Profile Management**: Update your personal and professional details.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Instant Feedback**: Toast notifications for all major actions.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite)
- **Backend**: Supabase (Database, Auth, Realtime)
- **Styling**: CSS Modules
- **Routing**: React Router
- **Notifications**: Toastify

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suryanshrai1/Alumni-Network-Platform.git
   cd alumni-network-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase:**
   - Create a project at [Supabase](https://supabase.com/).
   - Copy your Supabase URL and anon key.
   - Create a `.env` file in the root directory:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in your browser:**
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
src/
  components/      # Reusable UI components
  pages/           # Main application pages (Dashboard, Events, Chat, etc.)
  assets/          # Images and static assets
  supabaseClient.js# Supabase configuration
  App.jsx          # Main app component
  main.jsx         # Entry point
```

---

## 📝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## Contributors

Suryansh Rai
Anuj Bhakat
Saurav Suman

## 🙌 Acknowledgements

- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [React Router](https://reactrouter.com/)
- [Toastify](https://fkhadra.github.io/react-toastify/)

---

**Connect. Collaborate. Celebrate. — The Alumni Network Platform**

---