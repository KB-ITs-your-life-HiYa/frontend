import { Alert, Platform } from 'react-native';

/**
 * 확인 대화상자. 사용자가 확인을 누르면 true 를 돌려준다.
 *
 * react-native-web 은 버튼이 있는 Alert.alert 을 구현하지 않아 웹에서는
 * 아무 일도 일어나지 않는다(에러도 나지 않는다). 웹에서는 window.confirm 을 쓴다.
 */
export function confirm(
    title: string,
    message: string,
    confirmLabel = '확인'
): Promise<boolean> {
    if (Platform.OS === 'web') {
        return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }

    return new Promise((resolve) => {
        Alert.alert(title, message, [
            { text: '취소', style: 'cancel', onPress: () => resolve(false) },
            { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
        ]);
    });
}
