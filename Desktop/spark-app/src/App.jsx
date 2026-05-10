import { useState, useEffect } from 'react';

// 👇 YOUR GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = '503312762836-tmi47ccqp3q9clmff4ehe3jerdsidm8u.apps.googleusercontent.com';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [vibe, setVibe] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState('swipe');
  const [touchStart, setTouchStart] = useState(null);
  const [touchX, setTouchX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [logoError, setLogoError] = useState(false);
  
  // Easter egg states
  const [secretMode, setSecretMode] = useState(false);
  const [secretStep, setSecretStep] = useState(0);
  const [secretCode, setSecretCode] = useState('');
  const [showToilet, setShowToilet] = useState(false);

  // Load all users from localStorage
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('connect_dots_users');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('connect_dots_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const createRipple = (e, elementId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y, elementId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  const userData = currentUser ? allUsers[currentUser.email] : null;
  const myMatches = userData?.matches || [];
  const myLikes = userData?.likes || [];
  const likedBy = userData?.likedBy || [];
  const myPasses = userData?.passes || [];
  const mutualMatches = myLikes.filter(id => likedBy.includes(id));
  
  const otherUsers = Object.values(allUsers).filter(user => 
    user.email !== currentUser?.email && 
    !myPasses.includes(user.email) &&
    !myLikes.includes(user.email)
  );

  // Email/Password Signup
  const handleSignup = (e) => {
    e.preventDefault();
    if (allUsers[email]) {
      alert('Account already exists!');
      return;
    }
    
    const newUser = {
      email, password, name,
      age: parseInt(age) || 25,
      bio: bio || "New to Connect the Dots!",
      vibe: vibe || "Excited to meet people",
      profilePhoto: profilePhoto || "😊",
      matches: [], likes: [], likedBy: [], passes: [], messages: {},
      loginMethod: 'email'
    };
    
    setAllUsers({ ...allUsers, [email]: newUser });
    setCurrentUser({ email, name });
    setLoggedIn(true);
  };

  // Email/Password Login
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

  // Google Login
  const handleGoogleLogin = () => {
    // @ts-ignore
    const client = google.accounts.oauth2.initTokenClient({
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
                profileImageUrl: googlePicture,
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
  };  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setActiveChat(null);
  };

  const updateMyData = (updates) => {
    if (!currentUser) return;
    setAllUsers(prev => ({
      ...prev,
      [currentUser.email]: { ...prev[currentUser.email], ...updates }
    }));
  };

  const handleLike = (likedUserEmail) => {
    const likedUser = allUsers[likedUserEmail];
    if (!likedUser) return;

    const newLikes = [...myLikes, likedUserEmail];
    const theyLikedMe = likedUser.likedBy?.includes(currentUser.email);
    
    let newMatches = [...myMatches];
    if (theyLikedMe) {
      newMatches.push({
        email: likedUserEmail,
        name: likedUser.name,
        age: likedUser.age,
        vibe: likedUser.vibe,
        profilePhoto: likedUser.profilePhoto,
        matchDate: new Date().toISOString()
      });
    }
    
    updateMyData({ likes: newLikes, matches: newMatches });
    
    setAllUsers(prev => ({
      ...prev,
      [likedUserEmail]: {
        ...prev[likedUserEmail],
        likedBy: [...(prev[likedUserEmail].likedBy || []), currentUser.email]
      }
    }));
    
    if (theyLikedMe) {
      alert(`🎉 It's a match with ${likedUser.name}! 🎉`);
    }
  };

  const handlePass = (passedUserEmail) => {
    updateMyData({ passes: [...myPasses, passedUserEmail] });
  };

  const sendMessage = (matchEmail, text) => {
    if (!text.trim()) return;
    
    const currentMessages = userData?.messages?.[matchEmail] || [];
    const newMessages = {
      ...(userData?.messages || {}),
      [matchEmail]: [...currentMessages, { 
        from: "me", 
        text, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }]
    };
    
    updateMyData({ messages: newMessages });
    setInputText('');
  };

  const deleteAccount = () => {
    if (confirm('⚠️ Delete your account? This cannot be undone.')) {
      const newUsers = { ...allUsers };
      delete newUsers[currentUser.email];
      setAllUsers(newUsers);
      handleLogout();
    }
  };

  const handleTouchStart = (e, itemId) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    createRipple(e, itemId);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const delta = e.touches[0].clientX - touchStart;
    setTouchX(delta);
  };

  const handleTouchEnd = (itemId) => {
    if (Math.abs(touchX) > 50) {
      if (touchX > 0) handleLike(itemId);
      else handlePass(itemId);
    }
    setTouchX(0);
    setIsDragging(false);
    setTouchStart(null);
  };

  // Easter egg functions
  const handleLogoClick = () => {
    setSecretStep(prev => prev + 1);
    setTimeout(() => setSecretStep(0), 1000);
    if (secretStep + 1 >= 3) {
      setSecretMode(true);
      setSecretStep(0);
    }
  };

  const handleNumberPad = (num) => {
    const newCode = secretCode + num;
    setSecretCode(newCode);
    if (newCode === '1234') {
      setShowToilet(true);
      setSecretMode(false);
      setSecretCode('');
    } else if (newCode.length === 4) {
      alert('Wrong code! Try again.');
      setSecretCode('');
    }
  };

  const handleToiletClick = () => {
    alert('🧻 Fuck you, Hrishi! 😂');
    setShowToilet(false);
  };

  // Logo Component
  const Logo = () => (
    <div style={styles.logoContainer} onClick={handleLogoClick}>
      {!logoError ? (
        <img 
          src="/logo.png" 
          alt="Connect the Dots Logo" 
          style={styles.logoImage}
          onError={() => setLogoError(true)}
        />
      ) : (
        <span style={styles.logoFallback}>🔗✨</span>
      )}
    </div>
  );

  // Small Logo Component
  const SmallLogo = () => (
    <div style={styles.smallLogoContainer}>
      {!logoError ? (
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={styles.smallLogoImage}
          onError={() => setLogoError(true)}
        />
      ) : (
        <span style={styles.smallLogoFallback}>🔗</span>
      )}
      <span style={styles.smallLogoText}>Connect the Dots</span>
    </div>
  );  // Chat Screen
  if (activeChat) {
    const match = activeChat;
    const msgs = userData?.messages?.[match.email] || [];
    
    return (
      <div style={styles.container}>
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <button onClick={() => setActiveChat(null)} style={styles.backButton}>←</button>
            <div style={styles.chatUser}>
              <div style={styles.chatEmoji}>{match.profilePhoto || "😊"}</div>
              <div>
                <div style={styles.chatName}>{match.name}, {match.age}</div>
                <div style={styles.chatVibe}>{match.vibe}</div>
              </div>
            </div>
          </div>
          <div style={styles.chatMessages}>
            {msgs.length === 0 && (
              <div style={styles.icebreaker}>
                <div style={styles.icebreakerText}>💬 Start the conversation!</div>
                <button onClick={() => {
                  sendMessage(match.email, `Hey ${match.name}! Great to meet you 😊`);
                  setTimeout(() => {
                    const replies = ["Hey! So glad we matched ✨", "Love your vibe!", "How's your day going?", "You seem really cool!"];
                    const reply = replies[Math.floor(Math.random() * replies.length)];
                    const currentMsgs = userData?.messages?.[match.email] || [];
                    const newMsgs = {
                      ...(userData?.messages || {}),
                      [match.email]: [...currentMsgs, { from: "them", text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() }]
                    };
                    updateMyData({ messages: newMsgs });
                  }, 1000);
                }} style={styles.icebreakerBtn}>Say Hello 👋</button>
              </div>
            )}
            {msgs.map((msg, i) => (
              <div key={i} style={{...styles.message, justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.from === 'me' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: msg.from === 'me' ? 'white' : 'white'}}>
                  {msg.text}
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.chatInput}>
            <input 
              style={styles.chatInputField} 
              placeholder="Type a message..." 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(match.email, inputText)} 
            />
            <button style={styles.sendButton} onClick={() => sendMessage(match.email, inputText)}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup Screen
  if (!loggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <Logo />
          <h1 style={styles.title}>Connect the Dots</h1>
          <p style={styles.subtitle}>Indian Dating · Real Connections</p>
          
          {/* Secret Mode Popup */}
          {secretMode && (
            <div style={styles.secretOverlay}>
              <div style={styles.secretCard}>
                <h3 style={styles.secretTitle}>🔐 Enter Secret Code</h3>
                <div style={styles.secretCodeDisplay}>****</div>
                <div style={styles.numberPad}>
                  {[1,2,3,4,5,6,7,8,9,0].map(num => (
                    <button key={num} onClick={() => handleNumberPad(num.toString())} style={styles.numBtn}>{num}</button>
                  ))}
                </div>
                <button onClick={() => setSecretMode(false)} style={styles.secretClose}>Close</button>
              </div>
            </div>
          )}

          {/* Toilet Easter Egg */}
          {showToilet && (
            <div style={styles.secretOverlay}>
              <div style={styles.secretCard}>
                <div style={styles.toiletEmoji} onClick={handleToiletClick}>🚽</div>
                <p style={styles.toiletText}>Click the toilet...</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleGoogleLogin} 
            style={styles.googleButton}
            onTouchStart={(e) => createRipple(e, 'google')}
          >
            <span style={{ fontSize: 20, marginRight: 12 }}>G</span>
            Continue with Google
          </button>
          
          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>
          
          {!showSignup ? (
            <>
              <form onSubmit={handleLogin}>
                <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={styles.button} onTouchStart={(e) => createRipple(e, 'login')}>Login →</button>
              </form>
              <p style={styles.switchText}>
                New here? <button onClick={() => setShowSignup(true)} style={styles.linkButton}>Create account</button>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleSignup}>
                <input style={styles.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input style={styles.input} placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                <input style={styles.input} placeholder="Vibe (e.g., Foodie, Traveler)" value={vibe} onChange={(e) => setVibe(e.target.value)} />
                <textarea style={{...styles.input, minHeight: 60}} placeholder="Short bio..." value={bio} onChange={(e) => setBio(e.target.value)} />
                <input style={styles.input} placeholder="Profile emoji (e.g., 😊 🏏 🎨)" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} />
                <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={styles.button} onTouchStart={(e) => createRipple(e, 'signup')}>Create Account →</button>
              </form>
              <p style={styles.switchText}>
                Already have an account? <button onClick={() => setShowSignup(false)} style={styles.linkButton}>Login</button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main App Screen
  const currentProfile = otherUsers[0];
  const hasNewLikes = likedBy.length > 0 && !likedBy.some(email => myLikes.includes(email));
  const isGoogleUser = userData?.loginMethod === 'google';

  return (
    <div style={styles.container}>
      <div style={styles.appCard}>
        <div style={styles.header}>
          <SmallLogo />
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setView('swipe')} style={{...styles.tab, background: view === 'swipe' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: view === 'swipe' ? 'white' : 'rgba(255,255,255,0.7)'}}>
            🔍 Swipe
          </button>
          <button onClick={() => setView('matches')} style={{...styles.tab, background: view === 'matches' ? '#FF4D6D' : 'rgba(255,255,255,0.1)', color: view === 'matches' ? 'white' : 'rgba(255,255,255,0.7)'}}>
            💬 Matches ({mutualMatches.length})
            {hasNewLikes && <span style={styles.newBadge}>!</span>}
          </button>
        </div>

        {view === 'swipe' && (
          <>
            {otherUsers.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyEmoji}>🎉</div>
                <h3>No more profiles!</h3>
                <p>Check your matches or come back later</p>
                <button onClick={() => setView('matches')} style={styles.resetBtn}>View Matches →</button>
              </div>
            ) : (
              <div 
                style={{...styles.swipeCard, transform: isDragging ? `translateX(${touchX}px) rotate(${touchX * 0.05}deg)` : 'translateX(0px) rotate(0deg)', transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)'}}
                onTouchStart={(e) => handleTouchStart(e, currentProfile.email)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(currentProfile.email)}
              >
                <div style={styles.profilePhoto}>{currentProfile.profilePhoto || "😊"}</div>
                <h2 style={styles.swipeName}>{currentProfile.name}, {currentProfile.age}</h2>
                <p style={styles.swipeVibe}>{currentProfile.vibe}</p>
                <p style={styles.swipeBio}>"{currentProfile.bio}"</p>
                {isDragging && (
                  <div style={{...styles.dragIndicator, opacity: Math.min(Math.abs(touchX) / 80, 0.8)}}>
                    {touchX > 0 ? '♥ LIKE' : '✕ NOPE'}
                  </div>
                )}
              </div>
            )}
            <div style={styles.actionButtons}>
              <button onClick={() => otherUsers[0] && handlePass(otherUsers[0].email)} style={styles.nopeCircle}>✕</button>
              <button onClick={() => otherUsers[0] && handleLike(otherUsers[0].email)} style={styles.likeCircle}>♥</button>
            </div>
          </>
        )}

        {view === 'matches' && (
          <>
            {mutualMatches.length === 0 && likedBy.filter(email => !myLikes.includes(email)).length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyEmoji}>💔</div>
                <h3>No matches yet</h3>
                <p>Like some profiles to find your match!</p>
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
                          <div style={styles.matchEmoji}>{user.profilePhoto || "😊"}</div>
                          <div style={styles.matchInfo}>
                            <div style={styles.matchName}>{user.name}, {user.age}</div>
                            <div style={styles.matchVibe}>{user.vibe}</div>
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
                          <div style={styles.matchEmoji}>{user.profilePhoto || "😊"}</div>
                          <div style={styles.matchInfo}>
                            <div style={styles.matchName}>{user.name}, {user.age}</div>
                            <div style={styles.matchVibe}>{user.vibe}</div>
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

        <div style={styles.settingsSection}>
          <button onClick={deleteAccount} style={styles.dangerBtn}>🗑️ Delete Account</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 50%, #1a1a2e, #0f172a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    padding: 20,
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: 48,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 25px 45px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
  },
  appCard: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: 48,
    padding: 24,
    width: '100%',
    maxWidth: 450,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 45px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
  },
  chatCard: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: 48,
    width: '100%',
    maxWidth: 450,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 45px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
  },
  logoContainer: { marginBottom: 16, cursor: 'pointer' },
  logoImage: { width: 80, height: 80, objectFit: 'contain', borderRadius: 20, margin: '0 auto' },
  logoFallback: { fontSize: 64, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.2))' },
  smallLogoContainer: { display: 'flex', alignItems: 'center', gap: 8 },
  smallLogoImage: { width: 32, height: 32, objectFit: 'contain' },
  smallLogoFallback: { fontSize: 24 },
  smallLogoText: { fontSize: 16, fontWeight: '600', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, background: 'linear-gradient(135deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'rgba(255,255,255,0.5)', marginBottom: 32 },
  googleButton: {
    background: 'rgba(255,255,255,0.95)',
    border: 'none',
    borderRadius: 50,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    color: '#333',
    transition: 'transform 0.15s ease',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' },
  dividerText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  input: {
    width: '100%',
    padding: 16,
    marginBottom: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 28,
    fontSize: 14,
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    outline: 'none',
  },
  button: {
    background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)',
    color: 'white',
    border: 'none',
    padding: 14,
    borderRadius: 50,
    fontSize: 16,
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform 0.15s ease',
  },
  switchText: { marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  linkButton: { background: 'none', border: 'none', color: '#FF4D6D', fontWeight: '600', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  googleBadge: { marginLeft: 6, fontSize: 10, background: '#4285F4', padding: '2px 6px', borderRadius: 10, color: 'white' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', color: 'white', fontSize: 12 },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: 14, position: 'relative' },
  newBadge: { position: 'absolute', top: -5, right: 10, background: '#FF4D6D', color: 'white', borderRadius: 10, padding: '0px 6px', fontSize: 10, fontWeight: 'bold' },
  swipeCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 48,
    padding: 32,
    textAlign: 'center',
    marginBottom: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'grab',
    transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
    position: 'relative'
  },
  profilePhoto: { fontSize: 80, marginBottom: 16, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.2))' },
  swipeName: { fontSize: 28, fontWeight: '700', marginBottom: 4, color: 'white' },
  swipeVibe: { color: '#FF4D6D', fontWeight: '600', fontSize: 14, marginBottom: 8 },
  swipeBio: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 },
  dragIndicator: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none', whiteSpace: 'nowrap' },
  actionButtons: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 },
  nopeCircle: { width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 28, color: '#FF4D6D', cursor: 'pointer', transition: 'transform 0.15s ease' },
  likeCircle: { width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', border: 'none', fontSize: 32, color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,77,109,0.3)', transition: 'transform 0.15s ease' },
  emptyState: { textAlign: 'center', padding: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  resetBtn: { marginTop: 16, padding: '10px 24px', background: '#FF4D6D', color: 'white', border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: '600' },
  likesSection: { marginBottom: 20 },
  matchesSection: {},
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: 'rgba(255,255,255,0.7)' },
  matchItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  matchEmoji: { fontSize: 40, minWidth: 50, textAlign: 'center' },
  matchInfo: { flex: 1 },
  matchName: { fontWeight: 'bold', fontSize: 15, color: 'white' },
  matchVibe: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  chatBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', fontWeight: '600' },
  likeBackBtn: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', fontWeight: '600' },
  chatHeader: { padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 },
  backButton: { background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white', width: 40, height: 40, borderRadius: 30 },
  chatUser: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  chatEmoji: { fontSize: 44 },
  chatName: { fontWeight: 'bold', fontSize: 16, color: 'white' },
  chatVibe: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  chatMessages: { flex: 1, overflowY: 'auto', padding: 16 },
  icebreaker: { textAlign: 'center', padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 32, marginBottom: 16 },
  icebreakerText: { marginBottom: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  icebreakerBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 50, cursor: 'pointer', fontSize: 14, fontWeight: '600' },
  message: { display: 'flex', marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 24, fontSize: 14 },
  messageTime: { fontSize: 10, opacity: 0.6, marginTop: 4 },
  chatInput: { padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 10 },
  chatInputField: { flex: 1, padding: 14, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' },
  sendButton: { background: '#FF4D6D', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 40, cursor: 'pointer', fontWeight: '600' },
  settingsSection: { marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center' },
  dangerBtn: { background: 'rgba(255,77,109,0.2)', color: '#FF4D6D', border: '1px solid rgba(255,77,109,0.3)', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', fontSize: 12, fontWeight: '600' },
  secretOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  secretCard: {
    background: 'rgba(30,30,50,0.95)',
    borderRadius: 48,
    padding: 32,
    textAlign: 'center',
    width: 280,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  secretTitle: { color: 'white', marginBottom: 20, fontSize: 20 },
  secretCodeDisplay: {
    background: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    color: '#FF4D6D',
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 20,
    fontFamily: 'monospace'
  },
  numberPad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 },
  numBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', padding: 16, borderRadius: 40, color: 'white', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' },
  secretClose: { background: 'rgba(255,255,255,0.2)', border: 'none', padding: 10, borderRadius: 30, color: 'white', cursor: 'pointer', width: '100%' },
  toiletEmoji: { fontSize: 80, cursor: 'pointer', marginBottom: 20 },
  toiletText: { color: 'white', fontSize: 18 }
};