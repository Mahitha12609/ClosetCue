# 👗 Closet Cue

**Closet Cue** is a smart and stylish virtual wardrobe web application that helps users organize their outfits, create combinations, and plan what to wear — all in one place. Built with Firebase, FullCalendar, and pure HTML/CSS/JS, it's a fully client-side wardrobe planner with real-time storage and interactive scheduling.

---

## 🚀 Features

### 🧺 Wardrobe Management
- Upload images for different clothing layers: **Shirts, Pants, Jackets, Innerwear, Accessories**
- Display and preview uploaded items in respective categories
- Generate customizable outfit combinations based on selected layers

### 🌟 Saved Looks
- Save curated outfits under unique names
- Prevent duplicate look names
- Search saved looks with a live filter
- Directly schedule saved looks to the calendar

### 📅 Outfit Calendar
- Integrated with FullCalendar.js
- Select a saved look, assign a custom event color, and schedule it on any date
- Reschedule and delete events interactively
- Ensures no duplicate events for same outfit & day

### 📸 Social Feed
- View posts from all users in a beautiful, scrollable feed
- Shows: user name, caption, posted look, and timestamp
- Real-time updates from Firebase Firestore

### ✍️ Post to Feed
- Choose a saved look and add a caption
- Share to the public feed with one click
- Easy UI to select, preview, and highlight selected look

---

## 🔧 Technologies Used

- **Frontend**: HTML5, CSS3 (with gradients, responsive cards), JavaScript (ES6)
- **Firebase**:
  - Firestore (for users, posts, saved looks, calendar events)
  - Firebase Auth (for user sessions)
- **Calendar**: FullCalendar.js (`v6.1.9`)
- **Hosting**: Firebase Hosting

---

## 📁 Folder Structure

