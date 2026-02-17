import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

class FirebaseAuthBackend {
  constructor(firebaseConfig) {
    if (firebaseConfig) {
      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Listen to auth state changes
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          await AsyncStorage.setItem("authUser", JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem("authUser");
        }
      });

      // Initialize Google Auth
      this.initGoogleAuth(firebaseConfig);
    }
  }

  initGoogleAuth = (firebaseConfig) => {
    // You'll need to get these from your Firebase config
    this.googleRequest = Google.useAuthRequest({
      expoClientId: firebaseConfig.expoClientId, // Add this to your config
      iosClientId: firebaseConfig.iosClientId,   // Add this to your config
      androidClientId: firebaseConfig.androidClientId, // Add this to your config
      webClientId: firebaseConfig.webClientId,   // Add this to your config
    });
  };

  /**
   * Registers the user with given details
   */
  registerUser = (email, password) => {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          resolve(userCredential.user);
        })
        .catch((error) => {
          reject(this._handleError(error));
        });
    });
  };

  /**
   * Edit user profile
   */
  editProfileAPI = (displayName, photoURL) => {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL
        })
        .then(() => {
          resolve(this.auth.currentUser);
        })
        .catch((error) => {
          reject(this._handleError(error));
        });
      } else {
        reject(new Error("No authenticated user"));
      }
    });
  };

  /**
   * Login user with given details
   */
  loginUser = (email, password) => {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          resolve(userCredential.user);
        })
        .catch((error) => {
          reject(this._handleError(error));
        });
    });
  };

  /**
   * Forget Password user with given details
   */
  forgetPassword = (email) => {
    return new Promise((resolve, reject) => {
      sendPasswordResetEmail(this.auth, email)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(this._handleError(error));
        });
    });
  };

  /**
   * Logout the user
   */
  logout = () => {
    return new Promise((resolve, reject) => {
      signOut(this.auth)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(this._handleError(error));
        });
    });
  };

  /**
   * Social Login user with given details
   */
  socialLoginUser = async (type) => {
    try {
      if (type === "google") {
        // Trigger Google Sign-In
        const result = await this.googleRequest[1](); // promptAsync()
        
        if (result?.type === 'success') {
          const { id_token } = result.params;
          
          // Create Firebase credential
          const credential = GoogleAuthProvider.credential(id_token);
          
          // Sign in with credential
          const userCredential = await signInWithCredential(this.auth, credential);
          return userCredential.user;
        } else {
          throw new Error('Google sign-in was cancelled');
        }
      } else if (type === "facebook") {
        // Facebook login would require expo-auth-session/providers/facebook
        throw new Error("Facebook login not implemented. Please install expo-auth-session/providers/facebook");
      } else {
        throw new Error("Unsupported social login type");
      }
    } catch (error) {
      throw this._handleError(error);
    }
  };

  addNewUserToFirestore = async (user) => {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const profile = user.providerData[0] || {};
      
      const details = {
        firstName: profile.displayName?.split(' ')[0] || '',
        lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
        fullName: profile.displayName || user.displayName || '',
        email: profile.email || user.email || '',
        picture: profile.photoURL || user.photoURL || '',
        createdDtm: serverTimestamp(),
        lastLoginTime: serverTimestamp()
      };
      
      await setDoc(userRef, details);
      return { user, details };
    } catch (error) {
      throw this._handleError(error);
    }
  };

  setLoggeedInUser = async (user) => {
    await AsyncStorage.setItem("authUser", JSON.stringify(user));
  };

  /**
   * Returns the authenticated user
   */
  getAuthenticatedUser = async () => {
    try {
      const authUser = await AsyncStorage.getItem("authUser");
      if (!authUser) return null;
      return JSON.parse(authUser);
    } catch (error) {
      console.error("Error getting authenticated user:", error);
      return null;
    }
  };

  /**
   * Handle the error
   * @param {*} error
   */
  _handleError(error) {
    var errorMessage = error.message;
    return errorMessage;
  }
}

let _fireBaseBackend = null;

/**
 * Initialize the backend
 * @param {*} config
 */
const initFirebaseBackend = config => {
  if (!_fireBaseBackend) {
    _fireBaseBackend = new FirebaseAuthBackend(config);
  }
  return _fireBaseBackend;
};

/**
 * Returns the firebase backend
 */
const getFirebaseBackend = () => {
  return _fireBaseBackend;
};

export { initFirebaseBackend, getFirebaseBackend };