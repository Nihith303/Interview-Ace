
'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  type User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('auth/email-already-in-use')) {
      return 'This email is already in use.';
    }
    if (error.message.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (error.message.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (error.message.includes('auth/invalid-credential')) {
        return 'Invalid email or password.';
    }
    if (error.message.includes('auth/popup-closed-by-user')) {
        return 'Authentication process was cancelled.';
    }
    if (error.message.includes('auth/account-exists-with-different-credential')) {
        return 'An account already exists with this email address using a different sign-in method.';
    }
    return error.message;
  }
  return 'An unknown error occurred.';
};

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    // If the user document does not exist, create it.
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
        });
    }
};

export async function signup(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    
    // Update profile and create user document
    await updateProfile(user, { displayName: name });
    await createUserDocument(user);

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function logout() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

async function signInWithProvider(provider: GoogleAuthProvider | GithubAuthProvider) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await createUserDocument(user);
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithProvider(provider);
}

export async function signInWithGitHub() {
    const provider = new GithubAuthProvider();
    return await signInWithProvider(provider);
}
