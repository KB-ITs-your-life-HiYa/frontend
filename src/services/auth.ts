import {Platform} from "react-native";
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fledge.token';

// SecureStore 는 웹을 지원하지 않는다. 웹(개발 확인용)에서만 localStorage 로 떨어진다.
const isWeb = Platform.OS === 'web';

export async function saveToken(token: string): Promise<void> {
    if (isWeb) {
        localStorage.setItem(TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
    if (isWeb) {
        return localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
    if (isWeb) {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}