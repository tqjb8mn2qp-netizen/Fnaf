# 🎮 How to Publish Your Game on Steam

Publishing on Steam is a great goal! However, there are some important things to know first.

## ⚠️ Important: Current Game Limitations

Your current game is a **web-based game** built with HTML/JavaScript and Three.js. Steam requires **standalone executable files** (.exe for Windows, .app for Mac, etc.).

### What You Need to Do First:

You have **2 options**:

---

## Option 1: Convert Web Game to Desktop App (Recommended for Your Game)

Since your game is web-based, you need to wrap it in a desktop application.

### Method A: Electron (Most Popular)

**Electron** packages your HTML/JS game as a desktop app.

#### Steps:

1. **Install Node.js and npm**
   ```bash
   # Download from: https://nodejs.org/
   ```

2. **Set Up Electron**
   ```bash
   cd /home/user/webapp
   npm init -y
   npm install electron --save-dev
   npm install electron-builder --save-dev
   ```

3. **Create Electron Main File** (`main.js`)
   ```javascript
   const { app, BrowserWindow } = require('electron');
   const path = require('path');

   function createWindow() {
       const win = new BrowserWindow({
           width: 1280,
           height: 720,
           webPreferences: {
               nodeIntegration: false,
               contextIsolation: true
           },
           icon: path.join(__dirname, 'icon.png')
       });

       win.loadFile('index.html');
       
       // Remove menu bar for cleaner look
       win.setMenuBarVisibility(false);
   }

   app.whenReady().then(createWindow);

   app.on('window-all-closed', () => {
       if (process.platform !== 'darwin') {
           app.quit();
       }
   });

   app.on('activate', () => {
       if (BrowserWindow.getAllWindows().length === 0) {
           createWindow();
       }
   });
   ```

4. **Update package.json**
   ```json
   {
     "name": "3d-exploration-game",
     "version": "1.0.0",
     "main": "main.js",
     "scripts": {
       "start": "electron .",
       "build-win": "electron-builder --win",
       "build-mac": "electron-builder --mac",
       "build-linux": "electron-builder --linux"
     },
     "build": {
       "appId": "com.yourname.explorationgame",
       "productName": "3D Exploration Game",
       "files": [
         "**/*",
         "!node_modules",
         "!.git"
       ],
       "win": {
         "target": "nsis",
         "icon": "icon.ico"
       },
       "mac": {
         "target": "dmg",
         "icon": "icon.icns"
       },
       "linux": {
         "target": "AppImage",
         "icon": "icon.png"
       }
     }
   }
   ```

5. **Build Your Game**
   ```bash
   npm run build-win    # For Windows
   npm run build-mac    # For Mac
   npm run build-linux  # For Linux
   ```

6. **Test the Executable**
   - Find the built files in `dist/` folder
   - Run the .exe file to test your game

### Method B: NW.js (Alternative)

Similar to Electron, another option for packaging web apps.

#### Steps:

1. **Download NW.js**
   - Go to: https://nwjs.io/
   - Download the appropriate version

2. **Package Your Game**
   - Put all your game files in a folder
   - Create `package.json`
   - Use NW.js to build executables

---

## Option 2: Rebuild Game as Native Application

This is more work but gives better performance.

### Options:

1. **Unity** (C#) - Most popular game engine
2. **Unreal Engine** (C++/Blueprints) - AAA quality
3. **Godot** (GDScript) - Open source and free

This would require **rewriting your entire game** in a game engine, but you'd get:
- ✅ Better performance
- ✅ Native executables
- ✅ More features
- ✅ Professional quality

---

## 📋 Steam Requirements & Costs

Before publishing on Steam, you need to meet these requirements:

### 1. **Steam Direct Fee: $100 USD**
   - One-time fee per game
   - Recoupable after $1,000 in sales
   - Required to publish ANY game on Steam

### 2. **Technical Requirements**
   - ✅ Windows executable (.exe) - **REQUIRED**
   - ✅ Mac build (.app) - Recommended
   - ✅ Linux build - Recommended
   - ✅ Game must be at least somewhat complete
   - ✅ No major bugs or crashes
   - ✅ Playable content (at least 10-15 minutes)

### 3. **Legal Requirements**
   - ✅ Be at least 18 years old OR have parent/guardian sign
   - ✅ Provide tax information (W-9 for US, W-8 for international)
   - ✅ Have a bank account for payments
   - ✅ Own all rights to your game content

### 4. **Content Requirements**
   - ✅ Game must have **actual gameplay** (not just a demo/prototype)
   - ✅ No stolen assets or copyrighted material
   - ✅ Must follow Steam's content guidelines
   - ✅ Professional store page (screenshots, description, trailer)

### 5. **Assets Needed**
   - Game icon (256x256, 512x512)
   - Store header capsule (616x353)
   - Store library capsule (600x900)
   - Screenshots (at least 5)
   - Trailer video (recommended)
   - Store description and features list

---

## 🚀 Step-by-Step: Publishing on Steam

### Phase 1: Prepare Your Game (Current Stage)

1. **Convert to Desktop App**
   - Use Electron to package as .exe
   - Build for Windows (minimum requirement)
   - Test thoroughly

2. **Add More Content** (Your game currently needs this)
   - Your game is very minimal (empty room)
   - Steam expects more gameplay content
   - Add objectives, levels, or features
   - Aim for at least 15-30 minutes of gameplay

3. **Polish Your Game**
   - Fix all bugs
   - Improve graphics/UI
   - Add settings menu
   - Add proper game over/victory conditions
   - Test on multiple computers

4. **Create Marketing Assets**
   - Create game icon
   - Take appealing screenshots
   - Write compelling description
   - (Optional) Create trailer video

---

### Phase 2: Register with Steamworks

1. **Create Steam Partner Account**
   - Go to: https://partner.steamgames.com/
   - Sign in with your Steam account
   - Click "Join Steam Direct"

2. **Complete Signup**
   - Provide personal information
   - Agree to Steam Distribution Agreement
   - Complete digital paperwork

3. **Pay $100 App Fee**
   - Required for each game you publish
   - Use credit card or other payment method
   - Wait for 30-day review period (first-time publishers)

4. **Complete Steamworks Verification**
   - Verify email and phone number
   - Wait for account approval

---

### Phase 3: Set Up Your Game on Steamworks

1. **Create App in Steamworks**
   - Go to Steamworks dashboard
   - Click "Create New App"
   - Enter game name

2. **Configure Store Page**
   - Upload all marketing assets
   - Write game description
   - Set price (or Free)
   - Choose categories and tags
   - Add screenshots and trailer

3. **Upload Game Builds**
   - Download **SteamCMD** or use **Steamworks SDK**
   - Upload your game executable files
   - Set up depots (Windows/Mac/Linux versions)
   - Test using Steam's build review

4. **Set Up Achievements (Optional)**
   - Create achievement icons
   - Integrate Steamworks API into your game
   - Test achievement triggers

5. **Configure Settings**
   - Set release date
   - Choose visibility (public/private)
   - Set up regional pricing
   - Configure community features

---

### Phase 4: Review & Launch

1. **Submit for Review**
   - Complete all required fields
   - Submit store page for review
   - Wait for Valve approval (can take several days)

2. **Pre-Launch Checklist**
   - Test game build thoroughly
   - Verify all store assets appear correctly
   - Set your release date
   - Prepare marketing materials

3. **Launch Your Game**
   - Set visibility to "Public"
   - Announce on social media
   - Engage with community
   - Monitor feedback and reviews

---

## 💰 Costs Breakdown

| Item | Cost | Notes |
|------|------|-------|
| Steam Direct Fee | $100 USD | One-time per game, recoupable |
| Electron/Development | Free | Open source tools |
| Marketing Assets | $0-500 | DIY or hire designer |
| Game Content | Time | Your development time |
| **Total Minimum** | **$100** | If you do everything yourself |

---

## ⏱️ Realistic Timeline

**For Your Current Game:**

1. **Package as Desktop App** - 1-2 days
2. **Add More Content** - 1-4 weeks (your game is very minimal)
3. **Polish & Testing** - 1-2 weeks
4. **Create Marketing Assets** - 3-5 days
5. **Steamworks Setup** - 2-3 days
6. **Review & Approval** - 3-7 days (Valve review)

**Total: 2-3 months minimum** (with active development)

---

## 🎯 Recommendations for Your Game

### Current State Analysis:

Your game currently:
- ✅ Has working first-person controls
- ✅ Has menu system with music
- ✅ Has mobile support
- ⚠️ **Very minimal content** (empty room, no gameplay)
- ⚠️ **No real objective or challenge**
- ⚠️ **Very short** (can "complete" in seconds)

### What Steam Reviewers Expect:

Steam typically rejects games that are:
- Too short (under 10 minutes of content)
- Asset flips with no original content
- Non-functional or extremely buggy
- Misleading store descriptions

### My Honest Recommendation:

**Before Steam, you should:**

1. **Add Significant Content**
   - Multiple rooms/levels
   - Puzzles or objectives
   - Collectibles or challenges
   - Story or progression system
   - At least 30 minutes of gameplay

2. **Improve Polish**
   - Better graphics/textures
   - Sound effects for actions
   - Proper UI/menus
   - Settings (graphics, audio, controls)
   - Save/load system

3. **Test Extensively**
   - Multiple testers
   - Different computers
   - Bug fixing
   - Performance optimization

4. **Build Community First**
   - Publish on **itch.io** first (free, easier)
   - Get feedback from players
   - Build following on social media
   - Create demo version

---

## 🌟 Alternative Path (Recommended for Now)

### Phase 1: Build Audience (Free Platforms)

1. **Publish on itch.io** (free, easy)
   - Build community
   - Get feedback
   - Iterate on design

2. **Share on Social Media**
   - Reddit (r/WebGames, r/IndieGaming)
   - Twitter
   - Discord servers

3. **Gather Feedback**
   - Learn what players want
   - Improve your game
   - Build a following

### Phase 2: Expand Content

1. **Add More Gameplay**
   - New levels/areas
   - Objectives and challenges
   - Story elements
   - Longer playtime

2. **Improve Quality**
   - Better graphics
   - More polish
   - Professional feel

### Phase 3: Steam Launch

1. **Package as Desktop App** (Electron)
2. **Pay $100 Steam fee**
3. **Submit to Steam**
4. **Launch with existing fanbase**

---

## 📚 Resources

### Electron Packaging:
- **Electron Docs**: https://www.electronjs.org/docs/latest/
- **Electron Builder**: https://www.electron.build/

### Steam Resources:
- **Steamworks Documentation**: https://partner.steamgames.com/doc/home
- **Steam Direct**: https://partner.steamgames.com/steamdirect
- **Steam Best Practices**: https://partner.steamgames.com/doc/store/best_practices

### Game Development:
- **Game Dev Reddit**: https://www.reddit.com/r/gamedev/
- **Indie Game Marketing**: https://www.reddit.com/r/IndieGaming/
- **itch.io**: https://itch.io/ (Start here!)

---

## ✅ Action Plan for YOU

### Immediate Next Steps:

1. **First, publish to itch.io or GitHub Pages**
   - Get your game online NOW (free and easy)
   - Start getting feedback

2. **Add more content to your game**
   - Create multiple rooms
   - Add objectives
   - Make it more interesting

3. **Learn Electron**
   - Follow tutorials
   - Package your game as .exe
   - Test on Windows

4. **Build a community**
   - Share your game
   - Get feedback
   - Improve based on input

5. **Save $100 for Steam fee**
   - Set aside money
   - Wait until game is more complete

6. **Then consider Steam**
   - When game is substantial
   - When you have audience
   - When you're ready for $100 investment

---

## 🎮 The Reality

**Steam is great, but:**
- Requires $100 upfront
- Expects polished, complete games
- Very competitive marketplace
- Your current game is too minimal

**Better path:**
1. Publish free on web (GitHub Pages) → **NOW**
2. Publish on itch.io → **This week**
3. Build and improve game → **1-3 months**
4. Package with Electron → **When ready**
5. Launch on Steam → **When game is complete**

---

## 💡 Final Thoughts

Steam is achievable, but it's a bigger journey! Start with:
1. ✅ **Web publishing** (GitHub Pages) - Free and instant
2. ✅ **itch.io** - Game platform, free, builds audience
3. ✅ **Improve your game** - Add content and polish
4. ✅ **Learn Electron** - Package as desktop app
5. ✅ **Then Steam** - When you're ready

**Don't rush Steam!** Build your game and audience first. Steam will still be there when you're ready! 🚀

---

Need help with any of these steps? Just ask! 😊
