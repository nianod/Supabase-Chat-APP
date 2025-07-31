## 💬 Realtime Chat App

A modern, clean Realtime Chat App built with React, Tailwind CSS, Google Auth, and Supabase Realtime. Instantly connect with friends, family, or classmates — messages update live, avatars included 😄.

### 🚀 Features
🔐 Google Authentication – Easy sign-in with your Google account

⚡ Realtime Messaging – Messages appear live for all users using Supabase sockets

💬 User Avatars – See who’s chatting with their Google profile picture

🌙 Responsive UI – Styled with Tailwind CSS, works beautifully on all screen sizes

🟢 Online Status – Display number of users currently online

### 🛠️ Tech Stack
| Frontend |	Backend/Database |	Auth |
| ------ | --------------------- | ----- |
| React |	Supabase Realtime DB | Google OAuth |
| Tailwind  CSS |	Supabase sockets | Supabase Auth |



### 🧠 How It Works
User signs in with Google using Supabase Auth

Upon login, the app stores their avatar and name

When a user sends a message:

It’s stored in the Supabase DB

Supabase broadcasts it via sockets to all connected users

Messages appear live, styled depending on whether the message is yours or from others

