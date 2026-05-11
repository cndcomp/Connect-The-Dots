import { useState, useEffect, useRef } from 'react';
import { zoomies } from 'ldrs';

zoomies.register();

const GOOGLE_CLIENT_ID = '503312762836-tmi47ccqp3q9clmff4ehe3jerdsidm8u.apps.googleusercontent.com';

const LGBTQ_OPTIONS = [
  '🏳️‍🌈 Straight', '🏳️‍🌈 Gay', '🏳️‍🌈 Lesbian', '🏳️‍🌈 Bisexual',
  '🏳️‍🌈 Pansexual', '🏳️‍🌈 Asexual', '🏳️‍🌈 Queer', '🏳️‍🌈 Questioning', '🏳️‍🌈 Prefer not to say'
];

// Video/Audio Call Component
const CallModal = ({ isOpen, onClose, targetUser, currentUser, isVideo }) => {
  const [myStream, setMyStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const myVideoRef = useRef();
  const theirVideoRef = useRef();

  useEffect(() => {
    if (isOpen) startCall();
    return () => { if (myStream) myStream.getTracks().forEach(track => track.stop()); };
  }, [isOpen]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
      setMyStream(stream);
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      setTimeout(() => setIsCallActive(true), 1000);
    } catch (err) { alert('Could not access camera/microphone'); onClose(); }
  };

  const toggleMute = () => {
    if (myStream) { myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled); setIsMuted(!isMuted); }
  };

  const toggleVideo = () => {
    if (myStream && isVideo) { myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled); setIsVideoOff(!isVideoOff); }
  };

  const endCall = () => {
    if (myStream) myStream.getTracks().forEach(track => track.stop());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={callStyles.overlay}>
      <div style={callStyles.container}>
        {isVideo && (
          <>
            <div style={callStyles.remoteContainer}>
              <video ref={theirVideoRef} autoPlay playsInline style={callStyles.remoteVideo} />
            </div>
            <div style={callStyles.localContainer}>
              <video ref={myVideoRef} autoPlay playsInline muted style={callStyles.localVideo} />
            </div>
          </>
        )}
        {!isVideo && (
          <div style={callStyles.audioContainer}>
            <div style={callStyles.audioAvatar}>{targetUser?.profileImage ? <img src={targetUser.profileImage} alt="" style={callStyles.audioAvatarImg} /> : <span style={callStyles.audioAvatarEmoji}>😊</span>}</div>
            <div style={callStyles.audioName}>{targetUser?.name}</div>
          </div>
        )}
        <div style={callStyles.callingText}>{!isCallActive ? `Calling ${targetUser?.name}...` : `Connected with ${targetUser?.name}`}</div>
        <div style={callStyles.controls}>
          <button onClick={toggleMute} style={callStyles.controlBtn}>{isMuted ? '🔇' : '🎤'}</button>
          {isVideo && <button onClick={toggleVideo} style={callStyles.controlBtn}>{isVideoOff ? '📹❌' : '📹'}</button>}
          <button onClick={endCall} style={{...callStyles.controlBtn, ...callStyles.endBtn}}>📞</button>
        </div>
      </div>
    </div>
  );
};

const callStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 10000 },
  container: { width: '100%', height: '100%', position: 'relative' },
  remoteContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  remoteVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  localContainer: { position: 'absolute', bottom: 80, right: 20, width: 100, height: 150, borderRadius: 12, overflow: 'hidden', border: '2px solid white' },
  localVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  audioContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' },
  audioAvatar: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  audioAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  audioAvatarEmoji: { fontSize: 60 },
  audioName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  callingText: { position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 16, background: 'rgba(0,0,0,0.5)', padding: 10 },
  controls: { position: 'absolute', bottom: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20 },
  controlBtn: { width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 24, cursor: 'pointer' },
  endBtn: { background: '#FF4D6D' },
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [showCall, setShowCall] = useState(false);
  const [callTarget, setCallTarget] = useState(null);
  const [isVideoCall, setIsVideoCall] = useState(true);
  
  // Easter egg
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showToilet, setShowToilet] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  // User data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [vibe, setVibe] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [location, setLocation] = useState('');
  const [sexuality, setSexuality] = useState('');
  
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('connect_dots_users');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('connect_dots_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const userData = currentUser ? allUsers[currentUser.email] : null;
  const friends = userData?.friends || [];
  const incomingRequests = userData?.incomingRequests || [];
  const sentRequests = userData?.sentRequests || [];

  const otherUsers = Object.values(allUsers).filter(u => u.email !== currentUser?.email);

  // Easter egg functions
  const handleLogoClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    setTimeout(() => setTapCount(0), 1000);
    if (newCount >= 4) {
      setShowNumberPad(true);
      setTapCount(0);
    }
  };

  const handleNumberPad = (num) => {
    const newCode = secretCode + num;
    setSecretCode(newCode);
    if (newCode === '1234') {
      setShowToilet(true);
      setShowNumberPad(false);
      setSecretCode('');
    } else if (newCode.length === 4) {
      setSecretCode('');
    }
  };

  const handleCloseToilet = () => {
    setShowToilet(false);
    setSecretCode('');
  };

  // Friend functions
  const sendFriendRequest = (targetEmail) => {
    const targetUser = allUsers[targetEmail];
    if (!targetUser) return;
    if (friends.includes(targetEmail)) { alert(`You're already friends with ${targetUser.name}!`); return; }
    if (sentRequests.includes(targetEmail)) { alert(`Friend request already sent to ${targetUser.name}!`); return; }
    
    updateMyData({ sentRequests: [...sentRequests, targetEmail] });
    setAllUsers(prev => ({
      ...prev,
      [targetEmail]: {
        ...prev[targetEmail],
        incomingRequests: [...(prev[targetEmail].incomingRequests || []), currentUser.email]
      }
    }));
    alert(`✨ Friend request sent to ${targetUser.name}!`);
  };

  const acceptFriendRequest = (fromEmail) => {
    const fromUser = allUsers[fromEmail];
    updateMyData({
      friends: [...friends, fromEmail],
      incomingRequests: incomingRequests.filter(email => email !== fromEmail)
    });
    setAllUsers(prev => ({
      ...prev,
      [fromEmail]: {
        ...prev[fromEmail],
        friends: [...(prev[fromEmail].friends || []), currentUser.email],
        sentRequests: (prev[fromEmail].sentRequests || []).filter(email => email !== currentUser.email)
      }
    }));
    alert(`🎉 You're now friends with ${fromUser.name}!`);
  };

  const declineFriendRequest = (fromEmail) => {
    updateMyData({ incomingRequests: incomingRequests.filter(email => email !== fromEmail) });
    setAllUsers(prev => ({
      ...prev,
      [fromEmail]: {
        ...prev[fromEmail],
        sentRequests: (prev[fromEmail].sentRequests || []).filter(email => email !== currentUser.email)
      }
    }));
  };

  const removeFriend = (friendEmail) => {
    if (confirm('Remove this friend?')) {
      updateMyData({ friends: friends.filter(f => f !== friendEmail) });
      setAllUsers(prev => ({
        ...prev,
        [friendEmail]: {
          ...prev[friendEmail],
          friends: (prev[friendEmail].friends || []).filter(f => f !== currentUser.email)
        }
      }));
    }
  };

  const updateMyData = (updates) => {
    setAllUsers(prev => ({ ...prev, [currentUser.email]: { ...prev[currentUser.email], ...updates } }));
  };

  // Chat functions
  const sendMessage = (friendEmail, text) => {
    if (!text.trim()) return;
    const messages = userData?.messages?.[friendEmail] || [];
    updateMyData({
      messages: { ...userData?.messages, [friendEmail]: [...messages, { from: 'me', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
    });
    setInputText('');
  };

  // Auth functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
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

  const handleSignup = (e) => {
    e.preventDefault();
    if (allUsers[email]) { alert('Account already exists!'); return; }
    const newUser = {
      email, password, name, age: parseInt(age) || 25,
      bio: bio || "New here!",
      vibe: vibe || "Excited to connect",
      profileImage: profileImage || null,
      location: location || "Unknown",
      sexuality: sexuality || "Prefer not to say",
      friends: [], incomingRequests: [], sentRequests: [], messages: {},
    };
    setAllUsers({ ...allUsers, [email]: newUser });
    setCurrentUser({ email, name });
    setLoggedIn(true);
  };

  const deleteAccount = () => {
    if (confirm('⚠️ Delete your account permanently? This cannot be undone.')) {
      const newUsers = { ...allUsers };
      delete newUsers[currentUser.email];
      setAllUsers(newUsers);
      setLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Logo component
  const Logo = () => (
    <div onClick={handleLogoClick} style={{ cursor: 'pointer', marginBottom: 16 }}>
      <div style={{ fontSize: 64 }}>🔗✨</div>
      <div style={{ fontSize: 8, color: '#999', marginTop: 4 }}>✨ tap 4 times ✨</div>
    </div>
  );

  const SmallLogo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 24 }}>🔗</span>
      <span style={{ fontSize: 16, fontWeight: 'bold', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect the Dots</span>
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <l-zoomies size="80" stroke="5" bgOpacity="0.1" speed="1.4" color="#FF4D6D"></l-zoomies>
        <p style={styles.loadingText}>Connecting the dots...</p>
      </div>
    );
  }

  // Chat screen
  if (activeChat) {
    const messages = userData?.messages?.[activeChat.email] || [];
    return (
      <>
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            <button onClick={() => setActiveChat(null)} style={styles.backBtn}>←</button>
            <div style={styles.chatUserInfo}>
              <div style={styles.chatAvatar}>
                {activeChat.profileImage ? <img src={activeChat.profileImage} alt="" style={styles.chatAvatarImg} /> : <span style={styles.chatAvatarEmoji}>😊</span>}
              </div>
              <div>
                <div style={styles.chatName}>{activeChat.name}, {activeChat.age}</div>
                <div style={styles.chatStatus}>✨ Connected</div>
              </div>
            </div>
            <div style={styles.chatActions}>
              <button onClick={() => { setCallTarget(activeChat); setIsVideoCall(true); setShowCall(true); }} style={styles.callBtn}>📹</button>
              <button onClick={() => { setCallTarget(activeChat); setIsVideoCall(false); setShowCall(true); }} style={styles.callBtn}>📞</button>
            </div>
          </div>
          <div style={styles.chatMessagesArea}>
            {messages.length === 0 && (
              <div style={styles.emptyChat}>
                <span style={styles.emptyChatEmoji}>💬</span>
                <p>Send a message to start the conversation!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{...styles.chatMsg, justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.chatBubble, background: msg.from === 'me' ? '#FF4D6D' : '#f0f0f0', color: msg.from === 'me' ? 'white' : '#333'}}>
                  {msg.text}
                  <div style={styles.chatTime}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            <input style={styles.chatInput} placeholder="Type a message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(activeChat.email, inputText)} />
            <button style={styles.sendMsgBtn} onClick={() => sendMessage(activeChat.email, inputText)}>Send</button>
          </div>
        </div>
        <CallModal isOpen={showCall} onClose={() => setShowCall(false)} targetUser={callTarget} currentUser={currentUser} isVideo={isVideoCall} />
      </>
    );
  }

  // Login/Signup screen
  if (!loggedIn) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <Logo />
          <h1 style={styles.authTitle}>Connect the Dots</h1>
          <p style={styles.authSubtitle}>Find your perfect match</p>
          {!showSignup ? (
            <form onSubmit={handleLogin} style={styles.authForm}>
              <input style={styles.authInput} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input style={styles.authInput} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" style={styles.authBtn}>Login →</button>
              <p style={styles.authSwitch}>New here? <button onClick={() => setShowSignup(true)} style={styles.authLink}>Create account</button></p>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={styles.authForm}>
              <input style={styles.authInput} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input style={styles.authInput} placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <input style={styles.authInput} placeholder="Your vibe" value={vibe} onChange={(e) => setVibe(e.target.value)} />
              <textarea style={{...styles.authInput, minHeight: 80}} placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
              <input style={styles.authInput} placeholder="Your city" value={location} onChange={(e) => setLocation(e.target.value)} />
              <select style={styles.authInput} value={sexuality} onChange={(e) => setSexuality(e.target.value)}>
                <option value="">How do you identify?</option>
                {LGBTQ_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div style={styles.imageUploadArea}>
                <input type="file" accept="image/*" id="profileImage" onChange={handleImageUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => document.getElementById('profileImage').click()} style={styles.imageUploadBtn}>{profileImage ? '📷 Photo added ✓' : '📷 Add profile photo'}</button>
              </div>
              <input style={styles.authInput} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input style={styles.authInput} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" style={styles.authBtn}>Create Account →</button>
              <p style={styles.authSwitch}>Already have an account? <button onClick={() => setShowSignup(false)} style={styles.authLink}>Login</button></p>
            </form>
          )}
        </div>
        
        {/* Easter Egg Number Pad */}
        {showNumberPad && (
          <div style={styles.modalOverlay}>
            <div style={styles.easterModal}>
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
        
        {/* Easter Egg Toilet */}
        {showToilet && (
          <div style={styles.modalOverlay}>
            <div style={styles.toiletModal}>
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
  const visibleUsers = otherUsers.filter(u => !friends.includes(u.email) && !sentRequests.includes(u.email) && !incomingRequests.includes(u.email));

  return (
    <>
      <div style={styles.mainContainer}>
        <div style={styles.mainCard}>
          {/* Header */}
          <div style={styles.mainHeader}>
            <SmallLogo />
            <div style={styles.mainActions}>
              <button onClick={() => setShowSettings(true)} style={styles.iconBtn}>⚙️</button>
              <button onClick={() => setLoggedIn(false)} style={styles.logoutBtn}>Logout</button>
            </div>
          </div>

          {/* User Profile Bar */}
          <div style={styles.profileBar}>
            <div style={styles.profileAvatar}>
              {userData?.profileImage ? <img src={userData.profileImage} alt="" style={styles.profileAvatarImg} /> : <span style={styles.profileAvatarEmoji}>😊</span>}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>{userData?.name}, {userData?.age}</div>
              <div style={styles.profileLocation}>📍 {userData?.location || 'Unknown'}</div>
            </div>
            <div style={styles.profileVibe}>{userData?.vibe}</div>
          </div>

          {/* Tabs */}
          <div style={styles.tabBar}>
            <button onClick={() => setActiveTab('discover')} style={{...styles.tab, background: activeTab === 'discover' ? '#FF4D6D' : '#f0f0f0', color: activeTab === 'discover' ? 'white' : '#666'}}>✨ Discover</button>
            <button onClick={() => setActiveTab('friends')} style={{...styles.tab, background: activeTab === 'friends' ? '#FF4D6D' : '#f0f0f0', color: activeTab === 'friends' ? 'white' : '#666'}}>
              👥 Friends ({friends.length})
              {incomingRequests.length > 0 && <span style={styles.tabBadge}>!</span>}
            </button>
          </div>

          {/* Discover Tab */}
          {activeTab === 'discover' && (
            <div>
              {visibleUsers.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyEmoji}>🎉</span>
                  <h3>No more profiles!</h3>
                  <p>Check your friends or come back later</p>
                </div>
              ) : (
                <div style={styles.profileCard}>
                  <div style={styles.profileCardAvatar}>
                    {visibleUsers[0]?.profileImage ? <img src={visibleUsers[0].profileImage} alt="" style={styles.profileCardAvatarImg} /> : <span style={styles.profileCardAvatarEmoji}>😊</span>}
                  </div>
                  <h2 style={styles.profileCardName}>{visibleUsers[0]?.name}, {visibleUsers[0]?.age}</h2>
                  <p style={styles.profileCardVibe}>{visibleUsers[0]?.vibe}</p>
                  <p style={styles.profileCardBio}>"{visibleUsers[0]?.bio}"</p>
                  <button onClick={() => sendFriendRequest(visibleUsers[0].email)} style={styles.addFriendBtn}>➕ Add Friend</button>
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              {/* Incoming Requests */}
              {incomingRequests.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>✨ Friend Requests ({incomingRequests.length})</h3>
                  {incomingRequests.map(email => {
                    const user = allUsers[email];
                    if (!user) return null;
                    return (
                      <div key={email} style={styles.requestCard}>
                        <div style={styles.requestAvatar}>
                          {user.profileImage ? <img src={user.profileImage} alt="" style={styles.requestAvatarImg} /> : <span style={styles.requestAvatarEmoji}>😊</span>}
                        </div>
                        <div style={styles.requestInfo}>
                          <div style={styles.requestName}>{user.name}, {user.age}</div>
                          <div style={styles.requestBio}>{user.vibe}</div>
                        </div>
                        <div style={styles.requestActions}>
                          <button onClick={() => acceptFriendRequest(email)} style={styles.acceptBtn}>Accept</button>
                          <button onClick={() => declineFriendRequest(email)} style={styles.declineBtn}>Decline</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Your Friends */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👥 Your Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                  <div style={styles.emptyFriends}>
                    <span style={styles.emptyEmoji}>🤝</span>
                    <p>No friends yet. Send some friend requests!</p>
                  </div>
                ) : (
                  friends.map(email => {
                    const user = allUsers[email];
                    if (!user) return null;
                    return (
                      <div key={email} style={styles.friendCard}>
                        <div style={styles.friendAvatar}>
                          {user.profileImage ? <img src={user.profileImage} alt="" style={styles.friendAvatarImg} /> : <span style={styles.friendAvatarEmoji}>😊</span>}
                        </div>
                        <div style={styles.friendInfo}>
                          <div style={styles.friendName}>{user.name}, {user.age}</div>
                          <div style={styles.friendLocation}>📍 {user.location}</div>
                        </div>
                        <div style={styles.friendActions}>
                          <button onClick={() => setActiveChat(user)} style={styles.chatFriendBtn}>💬 Chat</button>
                          <button onClick={() => { setCallTarget(user); setIsVideoCall(true); setShowCall(true); }} style={styles.callFriendBtn}>📹</button>
                          <button onClick={() => removeFriend(email)} style={styles.removeFriendBtn}>✕</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sent Requests */}
              {sentRequests.filter(email => !friends.includes(email)).length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>📤 Sent Requests</h3>
                  {sentRequests.filter(email => !friends.includes(email)).map(email => {
                    const user = allUsers[email];
                    if (!user) return null;
                    return (
                      <div key={email} style={styles.sentCard}>
                        <div style={styles.sentAvatar}>
                          {user.profileImage ? <img src={user.profileImage} alt="" style={styles.sentAvatarImg} /> : <span style={styles.sentAvatarEmoji}>😊</span>}
                        </div>
                        <div style={styles.sentInfo}>
                          <div style={styles.sentName}>{user.name}, {user.age}</div>
                          <div style={styles.sentStatus}>⏳ Waiting for response...</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Settings</h2>
              <button onClick={() => setShowSettings(false)} style={styles.modalClose}>✕</button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.settingItem}><span>📧 Email</span><span>{currentUser?.email}</span></div>
              <div style={styles.settingItem}><span>👤 Name</span><span>{userData?.name}</span></div>
              <div style={styles.settingItem}><span>🎂 Age</span><span>{userData?.age}</span></div>
              <div style={styles.settingItem}><span>📍 Location</span><span>{userData?.location}</span></div>
              <div style={styles.settingItem}><span>🏳️‍🌈 Identity</span><span>{userData?.sexuality}</span></div>
              <button onClick={deleteAccount} style={styles.dangerBtn}>🗑️ Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      <CallModal isOpen={showCall} onClose={() => setShowCall(false)} targetUser={callTarget} currentUser={currentUser} isVideo={isVideoCall} />
    </>
  );
}

const styles = {
  loadingContainer: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingText: { color: 'white', fontSize: 18, fontWeight: 500, letterSpacing: 2 },
  
  authContainer: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' },
  authCard: { background: 'white', borderRadius: 48, padding: 40, width: '100%', maxWidth: 450, textAlign: 'center', boxShadow: '0 25px 45px rgba(0,0,0,0.1)' },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  authSubtitle: { color: '#666', marginBottom: 32 },
  authForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  authInput: { padding: 16, borderRadius: 28, border: '1px solid #e0e0e0', background: '#f8f8f8', fontSize: 14, outline: 'none' },
  authBtn: { padding: 14, borderRadius: 50, background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', color: 'white', border: 'none', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  authSwitch: { marginTop: 20, color: '#666', fontSize: 14 },
  authLink: { background: 'none', border: 'none', color: '#FF4D6D', fontWeight: 'bold', cursor: 'pointer' },
  imageUploadArea: { marginBottom: 12 },
  imageUploadBtn: { width: '100%', padding: 12, background: '#f0f0f0', border: '1px solid #e0e0e0', borderRadius: 28, fontSize: 12, cursor: 'pointer', color: '#666' },
  
  // Easter Egg
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 },
  easterModal: { background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, padding: '32px 28px', textAlign: 'center', width: 280, border: '0.5px solid rgba(255,255,255,0.1)' },
  modalSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, marginBottom: 24 },
  secretCodeDisplay: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28 },
  codeDot: { fontSize: 24, color: '#FF4D6D' },
  codeDotEmpty: { fontSize: 24, color: 'rgba(255,255,255,0.2)' },
  numberPad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  numBtn: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: 40, color: 'white', fontSize: 20, cursor: 'pointer' },
  toiletModal: { background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, padding: '40px 32px', textAlign: 'center', width: 280 },
  toiletEmoji: { fontSize: 64, marginBottom: 20, cursor: 'pointer' },
  toiletMessage: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 28 },
  closeBtn: { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '10px 24px', borderRadius: 30, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%' },
  
  // Main App
  mainContainer: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  mainCard: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 48, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 45px rgba(0,0,0,0.3)' },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainActions: { display: 'flex', gap: 10 },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', borderRadius: 30, cursor: 'pointer', fontSize: 16 },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 16px', borderRadius: 30, cursor: 'pointer', color: 'white', fontSize: 12 },
  
  profileBar: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 60, marginBottom: 20 },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileAvatarEmoji: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  profileLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  profileVibe: { color: '#FF4D6D', fontSize: 12, fontWeight: 'bold', padding: '4px 12px', background: 'rgba(255,77,109,0.2)', borderRadius: 20 },
  
  tabBar: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 14, position: 'relative' },
  tabBadge: { position: 'absolute', top: -5, right: 5, background: '#FF4D6D', color: 'white', borderRadius: 10, padding: '0px 6px', fontSize: 10 },
  
  profileCard: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 48, padding: 32, textAlign: 'center', marginBottom: 20 },
  profileCardAvatar: { width: 140, height: 140, borderRadius: 70, margin: '0 auto 16px', overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileCardAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileCardAvatarEmoji: { fontSize: 64 },
  profileCardName: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  profileCardVibe: { color: '#FF4D6D', fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
  profileCardBio: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  addFriendBtn: { background: 'linear-gradient(135deg, #4CAF50, #45a049)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 50, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  
  requestCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 24, marginBottom: 8 },
  requestAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  requestAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  requestAvatarEmoji: { fontSize: 28 },
  requestInfo: { flex: 1 },
  requestName: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  requestBio: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  requestActions: { display: 'flex', gap: 8 },
  acceptBtn: { background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12 },
  declineBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12 },
  
  friendCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 24, marginBottom: 8 },
  friendAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  friendAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  friendAvatarEmoji: { fontSize: 28 },
  friendInfo: { flex: 1 },
  friendName: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  friendLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  friendActions: { display: 'flex', gap: 6 },
  chatFriendBtn: { background: '#FF4D6D', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 14 },
  callFriendBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 14 },
  removeFriendBtn: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 },
  
  sentCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 24, marginBottom: 8, opacity: 0.7 },
  sentAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sentAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  sentAvatarEmoji: { fontSize: 28 },
  sentInfo: { flex: 1 },
  sentName: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 15 },
  sentStatus: { color: '#FFA500', fontSize: 11 },
  
  emptyState: { textAlign: 'center', padding: 40 },
  emptyFriends: { textAlign: 'center', padding: 30, background: 'rgba(255,255,255,0.03)', borderRadius: 32 },
  emptyEmoji: { fontSize: 60, marginBottom: 16, display: 'block' },
  
  // Chat
  chatContainer: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)' },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white', width: 40, height: 40, borderRadius: 30 },
  chatUserInfo: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  chatAvatarEmoji: { fontSize: 28 },
  chatName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  chatStatus: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  chatActions: { display: 'flex', gap: 8 },
  callBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', borderRadius: 30, cursor: 'pointer', fontSize: 18 },
  chatMessagesArea: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  emptyChat: { textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' },
  emptyChatEmoji: { fontSize: 48, marginBottom: 12, display: 'block' },
  chatMsg: { display: 'flex' },
  chatBubble: { maxWidth: '70%', padding: '10px 16px', borderRadius: 24, fontSize: 14 },
  chatTime: { fontSize: 10, opacity: 0.6, marginTop: 4 },
  chatInputArea: { display: 'flex', gap: 10, padding: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)' },
  chatInput: { flex: 1, padding: 14, borderRadius: 40, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, outline: 'none' },
  sendMsgBtn: { background: 'linear-gradient(135deg, #FF6B6B, #FF4D6D)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 40, cursor: 'pointer', fontWeight: 'bold' },
  
  // Settings Modal
  modalCard: { background: 'white', borderRadius: 32, width: '90%', maxWidth: 400, overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid #eee' },
  modalClose: { background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' },
  modalContent: { padding: 20 },
  settingItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee', color: '#333' },
  dangerBtn: { background: 'rgba(255,77,109,0.1)', color: '#FF4D6D', border: '1px solid rgba(255,77,109,0.3)', padding: '12px', borderRadius: 28, width: '100%', cursor: 'pointer', fontSize: 14, fontWeight: 'bold', marginTop: 16 },
};