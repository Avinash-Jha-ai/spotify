# 🎵Spotify - MERN Stack
A premium full-stack music streaming platform built using the MERN stack, featuring a sophisticated high-fidelity storefront, a dedicated artist portal, and seamless cloud-integrated backend logic.

💡 **Development Note:** The backend architecture and logic were custom-engineered from scratch, while the frontend user interface and components were developed with significant AI assistance to achieve a premium, discovery-driven aesthetic.

🔗 **Live Demo:** [https://spotify-home-ten.vercel.app/](https://spotify-home-ten.vercel.app/)

🔗 **Artist Portal Demo:** [https://spotify-rho-mauve.vercel.app/](https://spotify-rho-mauve.vercel.app/)

💻 **GitHub Repo:** [https://github.com/Avinash-Jha-ai/spotify](https://github.com/Avinash-Jha-ai/spotify)

---

## 🚀 Features

*   🔐 **Secure Authentication** (Google OAuth via Firebase & JWT)
*   🎧 **Seamless Audio Streaming** (High-fidelity playback with real-time controls)
*   📂 **Advanced Library Management** (Create and manage playlists effortlessly)
*   💖 **Dynamic Liked Songs** (Cinematic banners and real-time updates)
*   🎨 **Artist Dashboard** (Dedicated portal for creators to upload and manage tracks)
*   🔍 **Instant Search** (Real-time discovery of songs, artists, and albums)
*   📸 **Cloud-based Media Hosting** (Optimized audio and image handling via Cloudinary)
*   🎨 **Responsive Premium UI** (Desktop-first design with smooth Tailwind CSS styling)

---

## 🛠️ Tech Stack

### Frontend (Storefront & Artist Portal)
*   **React.js (Vite)**
*   **Redux Toolkit** (Global State Management)
*   **Tailwind CSS** (Utility-first styling for premium design)
*   **Lucide React** (Modern iconography)
*   **Firebase Auth** (Secure social login integration)
*   **Framer Motion** (Smooth animations and transitions)

### Backend
*   **Node.js**
*   **Express.js** (Robust REST API architecture)

### Database
*   **MongoDB** (Mongoose ODM for data modeling)

### Other Tools
*   **Cloudinary** (Media storage & delivery optimization)
*   **JWT** (Secure session authentication)
*   **Multer** (Efficient multi-part file handling)
*   **Music-Metadata** (Server-side audio tag extraction)
*   **Git & GitHub**

---

## 📂 Project Structure

```text
NOCTURNE/
│
├── backend/
│   ├── src/
│   │   ├── configs/        # Database & Service configurations
│   │   ├── controllers/    # Business logic (Auth, Song, Playlist, Liked)
│   │   ├── middlewares/    # Auth, Validation & Upload middleware
│   │   ├── models/         # MongoDB schemas (Song, User, Playlist)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # External service integrations (Cloudinary)
│   │   └── utils/          # Helper utility functions
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── frontend/ (User Portal)
│   ├── src/
│   │   ├── components/     # Reusable UI (Player, Sidebar, Cards, Navbar)
│   │   ├── features/       # Feature-based logic (Home, Library, Auth)
│   │   ├── store/          # Redux Toolkit global store configuration
│   │   ├── styles/         # Global Tailwind CSS configurations
│   │   └── utils/          # API services & Helper functions
│   └── main.jsx            # Frontend entry point
│
└── artist_portal/ (Creator Dashboard)
    ├── src/
    │   ├── components/     # Artist-specific UI components
    │   ├── features/       # Upload logic & Track management
    │   └── main.jsx        # Artist portal entry point
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Avinash-Jha-ai/spotify.git
cd spotify
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install artist portal dependencies
cd ../artist_portal
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the **backend** folder and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Firebase config if handled on backend, otherwise check frontend
```

### 4. Run the project
```bash
# Run backend (from /backend)
npm run dev

# Run frontend (from /frontend)
npm run dev

# Run artist portal (from /artist_portal)
npm run dev
```

---

## 📚 What I Learned

*   **Multi-Portal Architecture:** Designing and orchestrating separate user and creator environments within a single ecosystem.
*   **Cloud Media Management:** Implementing robust systems for uploading large audio files and programmatically extracting metadata.
*   **Social Auth Integration:** Managing complex authentication flows using Firebase Google OAuth coupled with JWT session persistence.
*   **State Orchestration:** Synchronizing global audio states across multiple components using Redux Toolkit for a seamless player experience.

---

## 🔮 Future Improvements

*   💬 **Real-time Lyrics:** Integration with LRCLIB or Musixmatch API.
*   🔔 **Push Notifications:** Alerts for new releases from followed artists.
*   🔍 **AI Recommendations:** Personalized discovery based on listening habits.
*   ⚡ **Offline Support:** PWA implementation for on-the-go listening.

---

## 🤝 Contributing
Contributions are welcome! Feel free to fork this repo and submit a pull request.

## 📬 Contact
**GitHub:** [https://github.com/Avinash-Jha-ai](https://github.com/Avinash-Jha-ai)  
**LinkedIn:** [https://www.linkedin.com/in/avinash-jha-0a261b385/](https://www.linkedin.com/in/avinash-jha-0a261b385/)

⭐ **If you like this project, don’t forget to give it a star!**
