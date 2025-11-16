# 🔧 Network Troubleshooting Guide

## Issue: "Network request failed" in React Native app

### ✅ What we fixed:

1. **Updated API configuration** to automatically detect platform
2. **Set your local IP address** (192.168.3.109) for mobile device connectivity
3. **Added network debugging tools** in the app
4. **Created a debug screen** for connection testing

### 🛠️ How to test the fix:

1. **Start your backend server**:
   ```bash
   cd /home/vandol/projects/taskmanager
   npm run dev
   ```

2. **Start your React Native app**:
   ```bash
   cd frontend
   npm start
   ```

3. **Test the connection**:
   - On your mobile device, open the app
   - If you see connection errors, tap the "🔧 Network Debug" button
   - This will test your connection and show diagnostics

### 📱 Important Notes:

- **For mobile devices**: The app now automatically uses your computer's IP (192.168.3.109)
- **For web browser**: The app uses localhost (http://localhost:3000)
- **Both devices must be on the same WiFi network**

### 🔍 If you still have issues:

1. **Check your computer's IP changed**:
   ```bash
   ip route get 1.1.1.1 | grep -oP 'src \K[^ ]+'
   ```
   If it's different than 192.168.3.109, update `frontend/src/utils/config.ts`

2. **Test backend accessibility**:
   ```bash
   curl http://192.168.3.109:3000/
   ```

3. **Check firewall**: Make sure port 3000 is not blocked

4. **Use the debug screen**: Tap the 🔧 button in the app for diagnostics

### 🎯 Quick test checklist:

- ✅ Backend running on http://192.168.3.109:3000
- ✅ API endpoint working: http://192.168.3.109:3000/api/tasks
- ✅ Mobile device on same WiFi
- ✅ App shows correct API URL in debug mode

The app should now work perfectly on your mobile device! 🚀