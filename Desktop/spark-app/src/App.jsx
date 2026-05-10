import { useState, useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = '503312762836-tmi47ccqp3q9clmff4ehe3jerdsidm8u.apps.googleusercontent.com';

// Indian cities list
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Nagpur', 'Indore', 'Bhopal', 'Surat', 'Vadodara', 'Ludhiana',
  'Agra', 'Nashik', 'Ranchi', 'Chandigarh', 'Goa', 'Kochi', 'Vizag', 'Coimbatore',
  'Mysore', 'Udaipur', 'Amritsar', 'Guwahati', 'Bhubaneswar', 'Trivandrum'
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [vibe, setVibe] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [interests, setInterests] = useState([]);
  const [location, setLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  
  // Filter states
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinAge, setFilterMinAge] = useState(18);
  const [filterMaxAge, setFilterMaxAge] = useState(35);
  const [filterShowLocationDropdown, setFilterShowLocationDropdown] = useState(false);
  const [filterLocationSearch, setFilterLocationSearch] = useState('');
  
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState('swipe');
  const [touchStart, setTouchStart] = useState(null);
  const [touchX, setTouchX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [secretMode, setSecretMode] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [secretCode, setSecretCode] = useState('');
  const [showToilet, setShowToilet] = useState(false);
  const [tapTimeout, setTapTimeout] = useState(null);
  
  const fileInputRef = useRef(null);

  const interestOptions = ['🎨 Art', '🏏 Cricket', '🍛 Food', '🎬 Movies', '🎵 Music', '✈️ Travel', '📚 Reading', '🧘 Wellness', '💻 Tech', '🎮 Gaming', '🏋️ Gym', '☕ Chai'];

  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('connect_dots_users');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('connect_dots_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const userData = currentUser ? allUsers[currentUser.email] : null;
  const myMatches = userData?.matches || [];
  const myLikes = userData?.likes || [];
  const likedBy = userData?.likedBy || [];
  const myPasses = userData?.passes || [];
  const mutualMatches = myLikes.filter(id => likedBy.includes(id));
  
  // Filter other users based on location and age preferences
  const filteredOtherUsers = Object.values(allUsers).filter(user => {
    if (user.email === currentUser?.email) return false;
    if (myPasses.includes(user.email)) return false;
    if (myLikes.includes(user.email)) return false;
    
    // Location filter
    if (filterLocation && user.location !== filterLocation) return false;
    
    // Age filter
    if (user.age < filterMinAge || user.age > filterMaxAge) return false;
    
    return true;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleNextStep = () => {
    if (signupStep === 1 && (!name || !age)) {
      alert('Please tell us your name and age!');
      return;
    }
    if (signupStep === 2 && (!vibe || !bio)) {
      alert('Tell us a bit about yourself!');
      return;
    }
    if (signupStep === 3 && !location) {
      alert('Please select your city!');
      return;
    }
    setSignupStep(signupStep + 1);
  };

  const handlePrevStep = () => {
    setSignupStep(signupStep - 1);
  };

  const filteredCities = INDIAN_CITIES.filter(city =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredFilterCities = INDIAN_CITIES.filter(city =>
    city.toLowerCase().includes(filterLocationSearch.toLowerCase())
  );

  const handleSignup = (e) => {
    e.preventDefault();
    if (allUsers[email]) {
      alert('Account already exists!');
      return;
    }
    const newUser = {
      email, password, name, age: parseInt(age) || 25,
      bio: bio || "New to Connect the Dots!",
      vibe: vibe || "Excited to meet people",
      profilePhoto: profilePhoto || "😊",
      profileImage: profileImage || null,
      interests: interests,
      location: location,
      matches: [], likes: [], likedBy: [], passes: [], messages: {},
      loginMethod: 'email'
    };
    setAllUsers({ ...allUsers, [email]: newUser });
    setCurrentUser({ email, name });
    setLoggedIn(true);
    setSignupStep(1);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = allUsers[email];
    if (user && user.password === password) {
      setCurrentUser({ email, name: user.name });
      setLoggedIn(true);
    } else {
      alert('Invalid email or password!');
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window.google === 'undefined') {
      alert('Google login loading. Please try again.');
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: (tokenResponse) => {
        if (tokenResponse.access_token) {
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          .then(res => res.json())
          .then(userInfo => {
            const googleEmail = userInfo.email;
            const googleName = userInfo.given_name || userInfo.name || googleEmail.split('@')[0];
            const googlePicture = userInfo.picture;
            
            if (allUsers[googleEmail]) {
              setCurrentUser({ email: googleEmail, name: allUsers[googleEmail].name });
              setLoggedIn(true);
            } else {
              const newUser = {
                email: googleEmail,
                password: 'google_oauth_' + Date.now(),
                name: googleName,
                age: 25,
                bio: "New to Connect the Dots!",
                vibe: "Excited to meet people",
                profilePhoto: googlePicture ? '🖼️' : "😊",
                profileImage: googlePicture || null,
                interests: [],
                location: '',
                matches: [], likes: [], likedBy: [], passes: [], messages: {},
                loginMethod: 'google'
              };
              setAllUsers({ ...allUsers, [googleEmail]: newUser });
              setCurrentUser({ email: googleEmail, name: googleName });
              setLoggedIn(true);
            }
          });
        }
      }
    });
    client.requestAccessToken();
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setActiveChat(null);
    setShowSettings(false);
    setShowFilters(false);
  };

  const updateMyData = (updates) => {
    if (!currentUser) return;
    setAllUsers(prev => ({ ...prev, [currentUser.email]: { ...prev[currentUser.email], ...updates } }));
  };

  const handleLike = (likedUserEmail) => {
    const likedUser = allUsers[likedUserEmail];
    if (!likedUser) return;
    const newLikes = [...myLikes, likedUserEmail];
    const theyLikedMe = likedUser.likedBy?.includes(currentUser.email);
    let newMatches = [...myMatches];
    if (theyLikedMe) {
      newMatches.push({
        email: likedUserEmail, name: likedUser.name, age: likedUser.age,
        vibe: likedUser.vibe, profilePhoto: likedUser.profilePhoto, profileImage: likedUser.profileImage
      });
    }
    updateMyData({ likes: newLikes, matches: newMatches });
    setAllUsers(prev => ({
      ...prev,
      [likedUserEmail]: { ...prev[likedUserEmail], likedBy: [...(prev[likedUserEmail].likedBy || []), currentUser.email] }
    }));
    if (theyLikedMe) alert(`🎉 Match with ${likedUser.name}! 🎉`);
  };

  const handlePass = (passedUserEmail) => {
    updateMyData({ passes: [...myPasses, passedUserEmail] });
  };

  const sendMessage = (matchEmail, text) => {
    if (!text.trim()) return;
    const currentMessages = userData?.messages?.[matchEmail] || [];
    const newMessages = { ...(userData?.messages || {}), [matchEmail]: [...currentMessages, { from: "me", text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] };
    updateMyData({ messages: newMessages });
    setInputText('');
  };

  const deleteAccount = () => {
    if (confirm('⚠️ Permanently delete your account? This cannot be undone.')) {
      const newUsers = { ...allUsers };
      delete newUsers[currentUser.email];
      setAllUsers(newUsers);
      handleLogout();
    }
  };

  const handleDragStart = (e, itemId) => {
    setTouchStart(e.clientX || e.touches?.[0]?.clientX);
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!touchStart) return;
    const delta = (e.clientX || e.touches?.[0]?.clientX) - touchStart;
    setTouchX(delta);
  };

  const handleDragEnd = (itemId) => {
    if (Math.abs(touchX) > 50) {
      if (touchX > 0) handleLike(itemId);
      else handlePass(itemId);
    }
    setTouchX(0);
    setIsDragging(false);
    setTouchStart(null);
  };

  const handleLogoClick = () => {
    if (tapTimeout) clearTimeout(tapTimeout);
    const newTapCount = secretTapCount + 1;
    setSecretTapCount(newTapCount);
    if (newTapCount >= 5) {
      setSecretMode(true);
      setSecretTapCount(0);
    }
    const timeout = setTimeout(() => setSecretTapCount(0), 1000);
    setTapTimeout(timeout);
  };

  const handleNumberPad = (num) => {
    const newCode = secretCode + num;
    setSecretCode(newCode);
    if (newCode === '1234') {
      setShowToilet(true);
      setSecretMode(false);
      setSecretCode('');
    } else if (newCode.length === 4) {
      setSecretCode('');
    }
  };

  const handleCloseToilet = () => {
    setShowToilet(false);
    setSecretCode('');
  };

  const clearFilters = () => {
    setFilterLocation('');
    setFilterMinAge(18);
    setFilterMaxAge(35);
  };

  const Logo = () => (
    <div style={styles.logoContainer} onClick={handleLogoClick}>
      {!logoError ? (
        <img src="/logo.png" alt="Logo" style={styles.logoImage} onError={() => setLogoError(true)} />
      ) : (
        <span style={styles.logoFallback}>🔗✨</span>
      )}
      <div style={styles.logoHint}>✨ tap 5 times ✨</div>
    </div>
  );

  const SmallLogo = () => (
    <div style={styles.smallLogoContainer}>
      {!logoError ? (
        <img src="/logo.png" alt="Logo" style={styles.smallLogoImage} onError={() => setLogoError(true)} />
      ) : (
        <span style={styles.smallLogoFallback}>🔗</span>
      )}
      <span style={styles.smallLogoText}>Connect the Dots</span>
    </div>
  );

  // Chat Screen
  if (activeChat) {
    const match = activeChat;
    const msgs = userData?.messages?.[match.email] || [];
    return (
      <div style={styles.container}>
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <button onClick={() => setActiveChat(null)} style={styles.backButton}>←</button>
            <div style={styles.chatUser}>
              {match.profileImage ? (
                <img src={match.profileImage} alt={match.name} style={styles.chatImage} />
              ) : (
                <div style={styles.chatEmoji}>{match.profilePhoto || "😊"}</div>
              )}
              <div>
                <div style={styles.chatName}>{match.name}, {match.age}</div>
                <div style={styles.chatVibe}>{match.vibe}</div>
                {match.location && <div style={styles.chatLocation}>📍 {match.location}</div>}
              </div>
            </div>
          </div>
          <div style={styles.chatMessages}>
            {msgs.length === 0 && (
              <div style={styles.icebreaker}>
                <div style={styles.icebreakerText}>💬 Start the conversation!</div>
                <button onClick={() => sendMessage(match.email, `Hey ${match.name}! Great to meet you 😊`)} style={styles.icebreakerBtn}>Say Hello 👋</button>
              </div>
            )}
            {msgs.map((msg, i) => (
              <div key={i} style={{...styles.message, justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.from === 'me' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: 'white'}}>
                  {msg.text}
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.chatInput}>
            <input style={styles.chatInputField} placeholder="Type a message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(match.email, inputText)} />
            <button style={styles.sendButton} onClick={() => sendMessage(match.email, inputText)}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!loggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <Logo />
          <h1 style={styles.title}>Connect the Dots</h1>
          <p style={styles.subtitle}>Indian Dating · Real Connections</p>
          
          {!showSignup ? (
            <>
              <button onClick={handleGoogleLogin} style={styles.googleButton}><span style={{ fontSize: 20, marginRight: 12 }}>G</span>Continue with Google</button>
              <div style={styles.divider}><span style={styles.dividerLine}></span><span style={styles.dividerText}>or</span><span style={styles.dividerLine}></span></div>
              <form onSubmit={handleLogin}>
                <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={styles.button}>Login →</button>
              </form>
              <p style={styles.switchText}>New here? <button onClick={() => { setShowSignup(true); setSignupStep(1); }} style={styles.linkButton}>Create account</button></p>
            </>
          ) : (
            <>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${(signupStep / 4) * 100}%`}} />
              </div>
              <div style={styles.stepIndicators}>
                <div style={{...styles.stepDot, background: signupStep >= 1 ? '#FF4D6D' : 'rgba(255,255,255,0.2)'}}>1</div>
                <div style={styles.stepLine} />
                <div style={{...styles.stepDot, background: signupStep >= 2 ? '#FF4D6D' : 'rgba(255,255,255,0.2)'}}>2</div>
                <div style={styles.stepLine} />
                <div style={{...styles.stepDot, background: signupStep >= 3 ? '#FF4D6D' : 'rgba(255,255,255,0.2)'}}>3</div>
                <div style={styles.stepLine} />
                <div style={{...styles.stepDot, background: signupStep >= 4 ? '#FF4D6D' : 'rgba(255,255,255,0.2)'}}>4</div>
              </div>
              
              {signupStep === 1 && (
                <div style={styles.stepContainer}>
                  <h3 style={styles.stepTitle}>Let's start with the basics ✨</h3>
                  <input style={styles.input} placeholder="What's your name?" value={name} onChange={(e) => setName(e.target.value)} />
                  <input style={styles.input} placeholder="Your age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                  <div style={styles.imageUploadArea}>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.imageUploadBtn}>{profileImage ? '📷 Great photo! ✓' : '📷 Add a profile photo'}</button>
                    {profileImage && <div style={styles.imagePreview}><img src={profileImage} alt="Preview" style={styles.imagePreviewImg} /></div>}
                  </div>
                  <button onClick={handleNextStep} style={styles.button}>Next →</button>
                </div>
              )}
              
              {signupStep === 2 && (
                <div style={styles.stepContainer}>
                  <h3 style={styles.stepTitle}>Tell us about yourself 💫</h3>
                  <input style={styles.input} placeholder="Your vibe (e.g., Foodie, Traveler, Artist)" value={vibe} onChange={(e) => setVibe(e.target.value)} />
                  <textarea style={{...styles.input, minHeight: 80}} placeholder="Write a short bio... what makes you unique?" value={bio} onChange={(e) => setBio(e.target.value)} />
                  <div style={styles.buttonGroup}>
                    <button onClick={handlePrevStep} style={styles.secondaryButton}>Back</button>
                    <button onClick={handleNextStep} style={styles.button}>Next →</button>
                  </div>
                </div>
              )}
              
              {signupStep === 3 && (
                <div style={styles.stepContainer}>
                  <h3 style={styles.stepTitle}>What do you love? ❤️</h3>
                  <div style={styles.interestsGrid}>
                    {interestOptions.map(interest => (
                      <button key={interest} onClick={() => toggleInterest(interest)} style={{...styles.interestBtn, background: interests.includes(interest) ? '#FF4D6D' : 'rgba(255,255,255,0.1)', border: interests.includes(interest) ? 'none' : '1px solid rgba(255,255,255,0.2)'}}>
                        {interest}
                      </button>
                    ))}
                  </div>
                  <div style={styles.buttonGroup}>
                    <button onClick={handlePrevStep} style={styles.secondaryButton}>Back</button>
                    <button onClick={handleNextStep} style={styles.button}>Next →</button>
                  </div>
                </div>
              )}
              
              {signupStep === 4 && (
                <div style={styles.stepContainer}>
                  <h3 style={styles.stepTitle}>Where are you located? 📍</h3>
                  <div style={styles.locationDropdownContainer}>
                    <button
                      type="button"
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                      style={styles.locationButton}
                    >
                      {location || 'Select your city'}
                      <span style={styles.dropdownArrow}>▼</span>
                    </button>
                    {showLocationDropdown && (
                      <div style={styles.locationDropdown}>
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          style={styles.locationSearch}
                          autoFocus
                        />
                        <div style={styles.locationList}>
                          {filteredCities.map(city => (
                            <div
                              key={city}
                              onClick={() => {
                                setLocation(city);
                                setShowLocationDropdown(false);
                                setLocationSearch('');
                              }}
                              style={styles.locationOption}
                            >
                              📍 {city}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <div style={styles.buttonGroup}>
                    <button onClick={handlePrevStep} style={styles.secondaryButton}>Back</button>
                    <button onClick={handleSignup} style={styles.button}>Finish & Start →</button>
                  </div>
                </div>
              )}
              
              <p style={styles.switchText}>Already have an account? <button onClick={() => setShowSignup(false)} style={styles.linkButton}>Login</button></p>
            </>
          )}
        </div>
        
        {/* Easter Egg Popups */}
        {secretMode && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <p style={styles.modalSubtitle}>enter passcode</p>
              <div style={styles.secretCodeDisplay}>
                {secretCode.split('').map((_, i) => <span key={i} style={styles.codeDot}>●</span>)}
                {[...Array(4 - secretCode.length)].map((_, i) => <span key={`empty-${i}`} style={styles.codeDotEmpty}>○</span>)}
              </div>
              <div style={styles.numberPad}>
                {[1,2,3,4,5,6,7,8,9].map(num => <button key={num} onClick={() => handleNumberPad(num.toString())} style={styles.numBtn}>{num}</button>)}
                <button onClick={() => handleNumberPad('0')} style={styles.numBtn}>0</button>
                <button onClick={() => setSecretCode(secretCode.slice(0, -1))} style={styles.numBtn}>⌫</button>
              </div>
            </div>
          </div>
        )}
        
        {showToilet && (
          <div style={styles.modalOverlay}>
            <div style={styles.toiletCard}>
              <div style={styles.toiletEmoji}>🚽</div>
              <p style={styles.toiletMessage}>fuck you, hrishi.</p>
              <button onClick={handleCloseToilet} style={styles.closeBtn}>close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main App
  const currentProfile = filteredOtherUsers[0];
  const hasNewLikes = likedBy.length > 0 && !likedBy.some(email => myLikes.includes(email));
  const activeFilterCount = (filterLocation ? 1 : 0) + (filterMinAge !== 18 ? 1 : 0) + (filterMaxAge !== 35 ? 1 : 0);

  return (
    <>
      <div style={styles.container}>
        <div style={styles.appCard}>
          <div style={styles.header}>
            <SmallLogo />
            <div style={styles.headerRight}>
              <button onClick={() => setShowFilters(true)} style={{...styles.settingsBtn, background: activeFilterCount > 0 ? '#FF4D6D' : 'rgba(255,255,255,0.1)'}}>
                🎯 {activeFilterCount > 0 && <span style={styles.filterBadge}>{activeFilterCount}</span>}
              </button>
              <button onClick={() => setShowSettings(true)} style={styles.settingsBtn}>⚙️</button>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          </div>
          <div style={styles.userLocation}>
            {userData?.location && <span>📍 {userData.location}</span>}
          </div>
          <div style={styles.tabs}>
            <button onClick={() => setView('swipe')} style={{...styles.tab, background: view === 'swipe' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: view === 'swipe' ? 'white' : 'rgba(255,255,255,0.7)'}}>🔍 Swipe</button>
            <button onClick={() => setView('matches')} style={{...styles.tab, background: view === 'matches' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: view === 'matches' ? 'white' : 'rgba(255,255,255,0.7)'}}>💬 Matches ({mutualMatches.length}){hasNewLikes && <span style={styles.newBadge}>!</span>}</button>
          </div>
          {view === 'swipe' && (
            <>
              {filteredOtherUsers.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyEmoji}>🎉</div>
                  <h3>No more profiles!</h3>
                  <p>Try changing your filters or check back later</p>
                  <button onClick={() => setShowFilters(true)} style={styles.resetBtn}>Adjust Filters →</button>
                </div>
              ) : (
                <div style={{...styles.swipeCard, transform: isDragging ? `translateX(${touchX}px) rotate(${touchX * 0.05}deg)` : 'none', transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)'}}
                  onMouseDown={(e) => handleDragStart(e, currentProfile.email)}
                  onMouseMove={handleDragMove}
                  onMouseUp={() => handleDragEnd(currentProfile.email)}
                  onTouchStart={(e) => handleDragStart(e, currentProfile.email)}
                  onTouchMove={handleDragMove}
                  onTouchEnd={() => handleDragEnd(currentProfile.email)}>
                  <div style={styles.profilePhotoContainer}>
                    {currentProfile.profileImage ? (
                      <img src={currentProfile.profileImage} alt={currentProfile.name} style={styles.profilePhotoImg} />
                    ) : (
                      <div style={styles.profilePhoto}>{currentProfile.profilePhoto || "😊"}</div>
                    )}
                  </div>
                  <h2 style={styles.swipeName}>{currentProfile.name}, {currentProfile.age}</h2>
                  <p style={styles.swipeVibe}>{currentProfile.vibe}</p>
                  {currentProfile.location && <p style={styles.swipeLocation}>📍 {currentProfile.location}</p>}
                  <p style={styles.swipeBio}>"{currentProfile.bio}"</p>
                  {currentProfile.interests && currentProfile.interests.length > 0 && (
                    <div style={styles.interestsPreview}>
                      {currentProfile.interests.slice(0, 3).map(interest => (
                        <span key={interest} style={styles.interestTag}>{interest}</span>
                      ))}
                    </div>
                  )}
                  {isDragging && (
                    <div style={{...styles.dragIndicator, opacity: Math.min(Math.abs(touchX) / 80, 0.8)}}>
                      {touchX > 0 ? '♥ LIKE' : '✕ NOPE'}
                    </div>
                  )}
                </div>
              )}
              <div style={styles.actionButtons}>
                <button onClick={() => currentProfile && handlePass(currentProfile.email)} style={styles.nopeCircle}>✕</button>
                <button onClick={() => currentProfile && handleLike(currentProfile.email)} style={styles.likeCircle}>♥</button>
              </div>
              {activeFilterCount > 0 && (
                <div style={styles.activeFilters}>
                  {filterLocation && <span style={styles.filterTag}>📍 {filterLocation}</span>}
                  {(filterMinAge !== 18 || filterMaxAge !== 35) && (
                    <span style={styles.filterTag}>🎂 {filterMinAge}-{filterMaxAge}</span>
                  )}
                  <button onClick={clearFilters} style={styles.clearFiltersBtn}>Clear all ✕</button>
                </div>
              )}
            </>
          )}
          {view === 'matches' && (
            <>
              {mutualMatches.length === 0 && likedBy.filter(email => !myLikes.includes(email)).length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyEmoji}>💔</div>
                  <h3>No matches yet</h3>
                  <button onClick={() => setView('swipe')} style={styles.resetBtn}>Start Swiping →</button>
                </div>
              ) : (
                <>
                  {likedBy.filter(email => !myLikes.includes(email)).length > 0 && (
                    <div style={styles.likesSection}>
                      <p style={styles.sectionTitle}>❤️ Liked You ({likedBy.filter(email => !myLikes.includes(email)).length})</p>
                      {likedBy.filter(email => !myLikes.includes(email)).map(email => {
                        const user = allUsers[email];
                        if (!user) return null;
                        return (
                          <div key={email} style={styles.matchItem}>
                            {user.profileImage ? <img src={user.profileImage} alt={user.name} style={styles.matchImage} /> : <div style={styles.matchEmoji}>{user.profilePhoto || "😊"}</div>}
                            <div style={styles.matchInfo}>
                              <div style={styles.matchName}>{user.name}, {user.age}</div>
                              <div style={styles.matchVibe}>{user.vibe}</div>
                              {user.location && <div style={styles.matchLocation}>📍 {user.location}</div>}
                            </div>
                            <button onClick={() => handleLike(email)} style={styles.likeBackBtn}>Like Back ❤️</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {mutualMatches.length > 0 && (
                    <div style={styles.matchesSection}>
                      <p style={styles.sectionTitle}>✨ Your Matches ({mutualMatches.length}) ✨</p>
                      {mutualMatches.map(email => {
                        const user = allUsers[email];
                        if (!user) return null;
                        return (
                          <div key={email} style={styles.matchItem} onClick={() => setActiveChat(user)}>
                            {user.profileImage ? <img src={user.profileImage} alt={user.name} style={styles.matchImage} /> : <div style={styles.matchEmoji}>{user.profilePhoto || "😊"}</div>}
                            <div style={styles.matchInfo}>
                              <div style={styles.matchName}>{user.name}, {user.age}</div>
                              <div style={styles.matchVibe}>{user.vibe}</div>
                              {user.location && <div style={styles.matchLocation}>📍 {user.location}</div>}
                            </div>
                            <button style={styles.chatBtn}>💬 Chat</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Filters Modal */}
      {showFilters && (
        <div style={styles.modalOverlay} onClick={() => setShowFilters(false)}>
          <div style={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.settingsHeader}>
              <h2 style={styles.settingsTitle}>Filter Matches</h2>
              <button onClick={() => setShowFilters(false)} style={styles.closeSettingsBtn}>✕</button>
            </div>
            <div style={styles.settingsContent}>
              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>📍 Location</h3>
                <div style={styles.locationDropdownContainer}>
                  <button
                    type="button"
                    onClick={() => setFilterShowLocationDropdown(!filterShowLocationDropdown)}
                    style={styles.locationButton}
                  >
                    {filterLocation || 'Any city'}
                    <span style={styles.dropdownArrow}>▼</span>
                  </button>
                  {filterShowLocationDropdown && (
                    <div style={styles.locationDropdown}>
                      <input
                        type="text"
                        placeholder="Search cities..."
                        value={filterLocationSearch}
                        onChange={(e) => setFilterLocationSearch(e.target.value)}
                        style={styles.locationSearch}
                        autoFocus
                      />
                      <div style={styles.locationList}>
                        <div
                          onClick={() => {
                            setFilterLocation('');
                            setFilterShowLocationDropdown(false);
                            setFilterLocationSearch('');
                          }}
                          style={styles.locationOption}
                        >
                          🌍 Any city
                        </div>
                        {filteredFilterCities.map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              setFilterLocation(city);
                              setFilterShowLocationDropdown(false);
                              setFilterLocationSearch('');
                            }}
                            style={styles.locationOption}
                          >
                            📍 {city}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>🎂 Age Range</h3>
                <div style={styles.ageRangeContainer}>
                  <input
                    type="range"
                    min={18}
                    max={50}
                    value={filterMinAge}
                    onChange={(e) => setFilterMinAge(parseInt(e.target.value))}
                    style={styles.rangeInput}
                  />
                  <div style={styles.ageRangeValues}>
                    <span>{filterMinAge}</span>
                    <span>-</span>
                    <span>{filterMaxAge}</span>
                  </div>
                  <div style={styles.ageRangeSliders}>
                    <input
                      type="range"
                      min={18}
                      max={50}
                      value={filterMaxAge}
                      onChange={(e) => setFilterMaxAge(parseInt(e.target.value))}
                      style={styles.rangeInput}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.buttonGroup}>
                <button onClick={clearFilters} style={styles.secondaryButton}>Reset Filters</button>
                <button onClick={() => setShowFilters(false)} style={styles.button}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.settingsHeader}>
              <h2 style={styles.settingsTitle}>Settings</h2>
              <button onClick={() => setShowSettings(false)} style={styles.closeSettingsBtn}>✕</button>
            </div>
            <div style={styles.settingsContent}>
              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>Account</h3>
                <div style={styles.settingsItem}>
                  <span>📧 Email</span>
                  <span style={styles.settingsValue}>{currentUser?.email}</span>
                </div>
                <div style={styles.settingsItem}>
                  <span>👤 Name</span>
                  <span style={styles.settingsValue}>{userData?.name}</span>
                </div>
                <div style={styles.settingsItem}>
                  <span>🎂 Age</span>
                  <span style={styles.settingsValue}>{userData?.age}</span>
                </div>
                <div style={styles.settingsItem}>
                  <span>📍 Location</span>
                  <span style={styles.settingsValue}>{userData?.location || 'Not set'}</span>
                </div>
              </div>
              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>Danger Zone</h3>
                <button onClick={deleteAccount} style={styles.dangerSettingsBtn}>
                  🗑️ Delete Account Permanently
                </button>
                <p style={styles.dangerText}>This action cannot be undone. All your data will be lost.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'radial-gradient(circle at 20% 50%, #1a1a2e, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont', padding: 20 },
  glassCard: { background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(24px)', borderRadius: 48, padding: 40, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 45px -12px rgba(0,0,0,0.5)' },
  appCard: { background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(24px)', borderRadius: 48, padding: 24, width: '100%', maxWidth: 450, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 45px -12px rgba(0,0,0,0.5)' },
  chatCard: { background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(24px)', borderRadius: 48, width: '100%', maxWidth: 450, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  logoContainer: { marginBottom: 16, cursor: 'pointer' },
  logoImage: { width: 80, height: 80, objectFit: 'contain', borderRadius: 20, margin: '0 auto' },
  logoFallback: { fontSize: 64 },
  logoHint: { fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 },
  smallLogoContainer: { display: 'flex', alignItems: 'center', gap: 8 },
  smallLogoImage: { width: 32, height: 32, objectFit: 'contain' },
  smallLogoFallback: { fontSize: 24 },
  smallLogoText: { fontSize: 16, fontWeight: '600', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, background: 'linear-gradient(135deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'rgba(255,255,255,0.5)', marginBottom: 32 },
  googleButton: { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 50, padding: 14, fontSize: 16, fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 20, color: '#333', transition: 'transform 0.15s' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' },
  dividerText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  input: { width: '100%', padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, fontSize: 14, background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' },
  button: { background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', color: 'white', border: 'none', padding: 14, borderRadius: 50, fontSize: 16, fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'transform 0.15s' },
  secondaryButton: { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: 14, borderRadius: 50, fontSize: 16, fontWeight: '600', cursor: 'pointer', flex: 1, transition: 'transform 0.15s' },
  buttonGroup: { display: 'flex', gap: 12, marginTop: 8 },
  switchText: { marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  linkButton: { background: 'none', border: 'none', color: '#FF4D6D', fontWeight: '600', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerRight: { display: 'flex', gap: 8 },
  userLocation: { textAlign: 'center', marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  settingsBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 30, cursor: 'pointer', color: 'white', fontSize: 16, position: 'relative' },
  filterBadge: { position: 'absolute', top: -2, right: -2, background: '#FF4D6D', borderRadius: 10, padding: '2px 5px', fontSize: 10, fontWeight: 'bold' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', color: 'white', fontSize: 12 },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: 14, position: 'relative', transition: 'all 0.15s' },
  newBadge: { position: 'absolute', top: -5, right: 10, background: '#FF4D6D', color: 'white', borderRadius: 10, padding: '0px 6px', fontSize: 10 },
  swipeCard: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 48, padding: 32, textAlign: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'grab', position: 'relative' },
  profilePhotoContainer: { marginBottom: 16 },
  profilePhoto: { fontSize: 80 },
  profilePhotoImg: { width: 120, height: 120, borderRadius: 60, objectFit: 'cover', margin: '0 auto', border: '3px solid rgba(255,255,255,0.2)' },
  swipeName: { fontSize: 28, fontWeight: '700', marginBottom: 4, color: 'white' },
  swipeVibe: { color: '#FF4D6D', fontWeight: '600', fontSize: 14, marginBottom: 8 },
  swipeLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 },
  swipeBio: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontStyle: 'italic' },
  interestsPreview: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 },
  interestTag: { background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  dragIndicator: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none', whiteSpace: 'nowrap' },
  actionButtons: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 },
  nopeCircle: { width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 28, color: '#FF4D6D', cursor: 'pointer', transition: 'transform 0.15s' },
  likeCircle: { width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', border: 'none', fontSize: 32, color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,77,109,0.3)', transition: 'transform 0.15s' },
  activeFilters: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  filterTag: { background: 'rgba(255,77,109,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 11, color: '#FF4D6D', border: '1px solid rgba(255,77,109,0.3)' },
  clearFiltersBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer' },
  emptyState: { textAlign: 'center', padding: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  resetBtn: { marginTop: 16, padding: '10px 24px', background: '#FF4D6D', color: 'white', border: 'none', borderRadius: 50, cursor: 'pointer' },
  likesSection: { marginBottom: 20 },
  matchesSection: {},
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: 'rgba(255,255,255,0.7)' },
  matchItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  matchEmoji: { fontSize: 40, minWidth: 50, textAlign: 'center' },
  matchImage: { width: 50, height: 50, borderRadius: 25, objectFit: 'cover' },
  matchInfo: { flex: 1 },
  matchName: { fontWeight: 'bold', fontSize: 15, color: 'white' },
  matchVibe: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  matchLocation: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  chatBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, cursor: 'pointer' },
  likeBackBtn: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, cursor: 'pointer' },
  chatHeader: { padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 },
  backButton: { background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white', width: 40, height: 40, borderRadius: 30 },
  chatUser: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  chatEmoji: { fontSize: 44 },
  chatImage: { width: 50, height: 50, borderRadius: 25, objectFit: 'cover' },
  chatName: { fontWeight: 'bold', fontSize: 16, color: 'white' },
  chatVibe: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  chatLocation: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  chatMessages: { flex: 1, overflowY: 'auto', padding: 16 },
  icebreaker: { textAlign: 'center', padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 32, marginBottom: 16 },
  icebreakerText: { marginBottom: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  icebreakerBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 50, cursor: 'pointer', fontSize: 14 },
  message: { display: 'flex', marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 24, fontSize: 14 },
  messageTime: { fontSize: 10, opacity: 0.6, marginTop: 4 },
  chatInput: { padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 10 },
  chatInputField: { flex: 1, padding: 14, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, fontSize: 14, background: 'rgba(255,255,255,0.05)', color: 'white' },
  sendButton: { background: '#FF4D6D', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 40, cursor: 'pointer' },
  imageUploadArea: { marginBottom: 12 },
  imageUploadBtn: { width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer' },
  imagePreview: { marginTop: 8, display: 'flex', justifyContent: 'center' },
  imagePreviewImg: { width: 60, height: 60, borderRadius: 30, objectFit: 'cover', border: '2px solid #FF4D6D' },
  progressBar: { height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#FF4D6D', borderRadius: 2, transition: 'width 0.3s' },
  stepIndicators: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: { width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', color: 'white' },
  stepLine: { width: 30, height: 1, background: 'rgba(255,255,255,0.2)' },
  stepContainer: { animation: 'fadeIn 0.3s' },
  stepTitle: { color: 'white', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  interestsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 },
  interestBtn: { padding: '8px 12px', borderRadius: 50, fontSize: 12, cursor: 'pointer', color: 'white', transition: 'all 0.15s' },
  locationDropdownContainer: { position: 'relative', width: '100%', marginBottom: 12 },
  locationButton: { width: '100%', padding: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, color: 'white', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dropdownArrow: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  locationDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 20, marginTop: 8, zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', maxHeight: 250, overflow: 'hidden' },
  locationSearch: { width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' },
  locationList: { maxHeight: 200, overflowY: 'auto' },
  locationOption: { padding: '12px 16px', cursor: 'pointer', color: 'white', fontSize: 14, transition: 'background 0.15s', ':hover': { background: 'rgba(255,255,255,0.1)' } },
  ageRangeContainer: { marginBottom: 16 },
  rangeInput: { width: '100%', margin: '8px 0', accentColor: '#FF4D6D' },
  ageRangeValues: { display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, color: 'white', fontSize: 14 },
  ageRangeSliders: { marginTop: 8 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, padding: '32px 28px', textAlign: 'center', width: 300, border: '0.5px solid rgba(255,255,255,0.1)' },
  modalSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, marginBottom: 24 },
  secretCodeDisplay: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28 },
  codeDot: { fontSize: 24, color: '#FF4D6D' },
  codeDotEmpty: { fontSize: 24, color: 'rgba(255,255,255,0.2)' },
  numberPad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  numBtn: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '14px 0', borderRadius: 40, color: 'white', fontSize: 20, cursor: 'pointer' },
  toiletCard: { background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, padding: '40px 32px', textAlign: 'center', width: 280 },
  toiletEmoji: { fontSize: 64, marginBottom: 20, cursor: 'pointer' },
  toiletMessage: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 28 },
  closeBtn: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '10px 24px', borderRadius: 30, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%' },
  settingsModal: { background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, width: '90%', maxWidth: 400, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.1)' },
  settingsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' },
  settingsTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
  closeSettingsBtn: { background: 'none', border: 'none', fontSize: 20, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' },
  settingsContent: { padding: 20 },
  settingsSection: { marginBottom: 24 },
  settingsSectionTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  settingsItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' },
  settingsValue: { color: 'rgba(255,255,255,0.5)' },
  dangerSettingsBtn: { background: 'rgba(255,77,109,0.15)', color: '#FF4D6D', border: '1px solid rgba(255,77,109,0.3)', padding: '12px 16px', borderRadius: 28, width: '100%', cursor: 'pointer', fontSize: 14, fontWeight: '600' },
  dangerText: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' },
};