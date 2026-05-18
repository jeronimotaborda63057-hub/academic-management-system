import * as React from "react";
import {router, useRootNavigationState, useSegments} from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../services/auth/firebaseConfig";

interface ContextInterface {
    user: User | null;
    signIn : React.Dispatch<React.SetStateAction<User>>;
    signOut : () => void;
}

interface User {
    uid: string;
    displayName: string;
    photoURL: string;
    providerId: string;
    createdAt: string;
    lastLoginAt: string;
}

const userInitialState  : ContextInterface= {
    uid:"",
    createdAt:"",
    displayName:"",
    lastLoginAt:"",
    photoURL:"",
    providerId:"",
}

const contextInitialState : ContextInterface = {
    user: User | null,
    signIn:() => {},
    signOut:() => {},
}

