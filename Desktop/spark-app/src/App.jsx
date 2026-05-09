import { useState, useEffect } from 'react';

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
  const [view, setView] = useState('swipe'); // 'swipe' or 'matches'

  // Load all users from localStorage
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('connect_dots_users');
    return saved ? JSON.parse(saved) : {};
  });

  // Save users whenever they change
  useEffect(() => {
    localStorage.setItem('connect_dots_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Current user's data
  const userData = currentUser ? allUsers[currentUser.email] : null;
  const myMatches = userData?.matches || [];
  const myLikes = userData?.likes || []; // People I've liked
  const likedBy = userData?.likedBy || []; // People who liked me
  const myPasses = userData?.passes || []; // People I've passed on

  // Find mutual matches (people who liked me back)
  const mutualMatches = myLikes.filter(id => likedBy.includes(id));

  // Get all other users (excluding myself and people I've passed on)
  const otherUsers = Object.values(allUsers).filter(user => 
    user.email !== currentUser?.email && 
    !myPasses.includes(user.email) &&
    !myLikes.includes(user.email)
  );

  // Current user's full profile
  const myFullProfile = currentUser ? allUsers[currentUser.email] : null;

  // Signup
  const handleSignup = (e) => {
    e.preventDefault();
    if (allUsers[email]) {
      alert('Account already exists! Please login.');
      return;
    }
    
    const newUser = {
      email,
      password,
      name,
      age: parseInt(age) || 25,
      bio: bio || "New to Connect the Dots!",
      vibe: vibe || "Excited to meet people",
      profilePhoto: profilePhoto || "😊",
      matches: [],
      likes: [],
      likedBy: [],
      passes: [],
      messages: {}
    };
    
    setAllUsers({ ...allUsers, [email]: newUser });
    setCurrentUser({ email, name });
    setLoggedIn(true);
  };

  // Login
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

  // Logout
  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setActiveChat(null);
    setView('swipe');
  };

  // Update current user's data
  const updateMyData = (updates) => {
    if (!currentUser) return;
    setAllUsers(prev => ({
      ...prev,
      [currentUser.email]: { ...prev[currentUser.email], ...updates }
    }));
  };

  // Like someone
  const handleLike = (likedUserEmail) => {
    const likedUser = allUsers[likedUserEmail];
    if (!likedUser) return;

    // Add to my likes
    const newLikes = [...myLikes, likedUserEmail];
    
    // Check if they already liked me
    const theyLikedMe = likedUser.likedBy?.includes(currentUser.email);
    
    let newMatches = [...myMatches];
    if (theyLikedMe) {
      // It's a match!
      newMatches.push({
        email: likedUserEmail,
        name: likedUser.name,
        age: likedUser.age,
        vibe: likedUser.vibe,
        profilePhoto: likedUser.profilePhoto,
        matchDate: new Date().toISOString()
      });
    }
    
    updateMyData({
      likes: newLikes,
      matches: newMatches
    });
    
    // Add to their likedBy
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

  // Pass on someone
  const handlePass = (passedUserEmail) => {
    updateMyData({
      passes: [...myPasses, passedUserEmail]
    });
  };

  // Send a message
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

  // Receive a message (simulated for demo)
  const receiveMessage = (matchEmail, replyText) => {
    const currentMessages = userData?.messages?.[matchEmail] || [];
    const newMessages = {
      ...(userData?.messages || {}),
      [matchEmail]: [...currentMessages, { 
        from: "them", 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }]
    };
    updateMyData({ messages: newMessages });
  };

  // Delete account completely
  const deleteAccount = () => {
    if (confirm('⚠️ WARNING: This will permanently delete your account and all data. This cannot be undone. Are you sure?')) {
      const newUsers = { ...allUsers };
      delete newUsers[currentUser.email];
      setAllUsers(newUsers);
      handleLogout();
    }
  };

  // Get match details
  const getMatchDetails = (matchEmail) => {
    return allUsers[matchEmail];
  };

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
                  sendMessage(match.email, `Hey ${match.name}! Great to match with you 😊`);
                  setTimeout(() => receiveMessage(match.email, `Hey! So glad we connected! How's your day going? ✨`), 1000);
                }} style={styles.icebreakerBtn}>Say Hello 👋</button>
              </div>
            )}
            {msgs.map((msg, i) => (
              <div key={i} style={{...styles.message, justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.from === 'me' ? '#FF4D6D' : '#f0f0f0', color: msg.from === 'me' ? 'white' : '#333'}}>
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
        <div style={styles.card}>
          <div style={styles.logo}>🔗✨</div>
          <h1 style={styles.title}>Connect the Dots</h1>
          <p style={styles.subtitle}>Indian Dating · Real Connections</p>
          
          {!showSignup ? (
            <>
              <form onSubmit={handleLogin}>
                <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={styles.button}>Login →</button>
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
                <input style={styles.input} placeholder="Vibe (e.g., Foodie, Traveler, Artist)" value={vibe} onChange={(e) => setVibe(e.target.value)} />
                <textarea style={{...styles.input, minHeight: 60}} placeholder="Short bio about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
                <input style={styles.input} placeholder="Profile emoji (e.g., 😊 🏏 🎨)" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} />
                <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={styles.button}>Create Account →</button>
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
  const hasNewLikes = likedBy.length > 0 && !likedBy.some(email => myLikes.includes(email));

  return (
    <div style={styles.container}>
      <div style={styles.appCard}>
        <div style={styles.header}>
          <div>
            <div style={styles.logoSmall}>🔗 Connect the Dots</div>
            <p style={styles.welcome}>{myFullProfile?.name}, {myFullProfile?.age}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setView('swipe')} style={{...styles.tab, background: view === 'swipe' ? '#FF4D6D' : '#f0f0f0', color: view === 'swipe' ? 'white' : '#666'}}>
            🔍 Swipe
          </button>
          <button onClick={() => setView('matches')} style={{...styles.tab, background: view === 'matches' ? '#FF4D6D' : '#f0f0f0', color: view === 'matches' ? 'white' : '#666'}}>
            💬 Matches ({mutualMatches.length})
            {hasNewLikes && <span style={styles.newBadge}>!</span>}
          </button>
        </div>

        {/* Swipe View */}
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
              <>
                <div style={styles.swipeCard}>
                  <div style={styles.profilePhoto}>{otherUsers[0].profilePhoto || "😊"}</div>
                  <h2 style={styles.swipeName}>{otherUsers[0].name}, {otherUsers[0].age}</h2>
                  <p style={styles.swipeVibe}>{otherUsers[0].vibe}</p>
                  <p style={styles.swipeBio}>"{otherUsers[0].bio}"</p>
                </div>

                <div style={styles.actions}>
                  <button onClick={() => handlePass(otherUsers[0].email)} style={styles.nopeBtn}>✕</button>
                  <button onClick={() => handleLike(otherUsers[0].email)} style={styles.likeBtn}>♥</button>
                </div>
                <p style={styles.swipeHint}>{otherUsers.length} profile{otherUsers.length !== 1 ? 's' : ''} left</p>
              </>
            )}
          </>
        )}

        {/* Matches View */}
        {view === 'matches' && (
          <>
            {mutualMatches.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyEmoji}>💔</div>
                <h3>No matches yet</h3>
                <p>Like some profiles to find your match!</p>
                <button onClick={() => setView('swipe')} style={styles.resetBtn}>Start Swiping →</button>
              </div>
            ) : (
              <>
                {/* People who liked me (but I haven't liked back) */}
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

                {/* Mutual matches */}
                <div style={styles.matchesSection}>
                  <p style={styles.sectionTitle}>✨ Your Matches ({mutualMatches.length}) ✨</p>
                  {mutualMatches.map(email => {
                    const match = allUsers[email];
                    if (!match) return null;
                    return (
                      <div key={email} style={styles.matchItem} onClick={() => setActiveChat(match)}>
                        <div style={styles.matchEmoji}>{match.profilePhoto || "😊"}</div>
                        <div style={styles.matchInfo}>
                          <div style={styles.matchName}>{match.name}, {match.age}</div>
                          <div style={styles.matchVibe}>{match.vibe}</div>
                        </div>
                        <button style={styles.chatBtn}>💬 Chat</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Settings */}
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
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: 20
  },
  card: {
    background: 'white',
    borderRadius: 32,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  },
  appCard: {
    background: 'white',
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 450,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  },
  chatCard: {
    background: 'white',
    borderRadius: 32,
    width: '100%',
    maxWidth: 450,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  },
  logo: { fontSize: 60, marginBottom: 16 },
  logoSmall: { fontSize: 16, fontWeight: 'bold', color: '#FF4D6D' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#1a1a2e' },
  subtitle: { color: '#666', marginBottom: 32 },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
    border: '1px solid #ddd',
    borderRadius: 16,
    fontSize: 14,
    boxSizing: 'border-box'
  },
  button: {
    background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)',
    color: 'white',
    border: 'none',
    padding: 14,
    borderRadius: 50,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  switchText: { marginTop: 20, fontSize: 14, color: '#666' },
  linkButton: { background: 'none', border: 'none', color: '#FF4D6D', fontWeight: 'bold', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 4 },
  logoutBtn: { background: '#eee', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer' },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '10px', borderRadius: 30, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 14, position: 'relative' },
  newBadge: { position: 'absolute', top: -5, right: 10, background: '#FF4D6D', color: 'white', borderRadius: 10, padding: '0px 6px', fontSize: 10, fontWeight: 'bold' },
  swipeCard: { background: 'linear-gradient(145deg, #fafafa, #fff)', borderRadius: 24, padding: 32, textAlign: 'center', marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  profilePhoto: { fontSize: 80, marginBottom: 16 },
  swipeName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  swipeVibe: { color: '#FF4D6D', fontWeight: 600, fontSize: 14, marginBottom: 8 },
  swipeBio: { color: '#666', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 },
  actions: { display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 12 },
  nopeBtn: { background: '#fff', border: '2px solid #FF4D6D', borderRadius: 50, width: 60, height: 60, fontSize: 28, color: '#FF4D6D', cursor: 'pointer' },
  likeBtn: { background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', border: 'none', borderRadius: 50, width: 70, height: 70, fontSize: 32, color: 'white', cursor: 'pointer', boxShadow: '0 10px 25px rgba(255,77,109,0.3)' },
  swipeHint: { textAlign: 'center', fontSize: 12, color: '#999', marginBottom: 16 },
  emptyState: { textAlign: 'center', padding: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  resetBtn: { marginTop: 16, padding: '10px 24px', background: '#FF4D6D', color: 'white', border: 'none', borderRadius: 50, cursor: 'pointer' },
  likesSection: { marginBottom: 20 },
  matchesSection: {},
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#666' },
  matchItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' },
  matchEmoji: { fontSize: 40, minWidth: 50, textAlign: 'center' },
  matchInfo: { flex: 1 },
  matchName: { fontWeight: 'bold', fontSize: 15 },
  matchVibe: { fontSize: 12, color: '#999', marginTop: 2 },
  chatBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer' },
  likeBackBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer' },
  chatHeader: { padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16, background: 'white' },
  backButton: { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' },
  chatUser: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  chatEmoji: { fontSize: 40 },
  chatName: { fontWeight: 'bold', fontSize: 16 },
  chatVibe: { fontSize: 12, color: '#999', marginTop: 2 },
  chatMessages: { flex: 1, overflowY: 'auto', padding: 16, background: '#fafafa' },
  icebreaker: { textAlign: 'center', padding: 20, background: 'white', borderRadius: 16, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  icebreakerText: { marginBottom: 12, color: '#666', fontSize: 13 },
  icebreakerBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 25, cursor: 'pointer', fontSize: 14 },
  message: { display: 'flex', marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 18, fontSize: 14 },
  messageTime: { fontSize: 10, opacity: 0.6, marginTop: 4 },
  chatInput: { padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 10, background: 'white' },
  chatInputField: { flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 25, fontSize: 14, outline: 'none' },
  sendButton: { background: '#FF4D6D', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 25, cursor: 'pointer', fontWeight: 'bold' },
  settingsSection: { marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' },
  dangerBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }
};