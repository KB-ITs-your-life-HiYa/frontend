import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';

// 개발용 시드 계정. R__seed_01_member.sql 과 같은 값이다.
const DEMO_PASSWORD = 'demo1234';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

    async function handleSubmit() {
        if (!canSubmit) return;

        setError(null);
        setSubmitting(true);
        try {
            await login(email.trim(), password);
            // 성공하면 화면을 직접 넘기지 않는다. member 가 채워지면 네비게이터가 알아서 바꾼다
        } catch (e) {
            setError(
                e instanceof ApiError
                    ? e.message
                    : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
            );
        } finally {
            setSubmitting(false);
        }
    }

    // 개발용. 이메일·비밀번호를 채우고 바로 로그인한다.
    // 입력칸도 같이 채워서 어떤 계정으로 들어갔는지 보이게 한다.
    async function loginAs(demoEmail: string) {
        setEmail(demoEmail);
        setPassword(DEMO_PASSWORD);
        setError(null);
        setSubmitting(true);
        try {
            await login(demoEmail, DEMO_PASSWORD);
        } catch (e) {
            setError(
                e instanceof ApiError
                    ? e.message
                    : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>다시 만나서 반가워요</Text>
                <Text style={styles.sub}>가입할 때 사용한 이메일로 로그인해주세요</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>이메일</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="name@example.com"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        editable={!submitting}
                    />

                    <Text style={[styles.label, styles.labelSpaced]}>비밀번호</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                        autoCapitalize="none"
                        textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        editable={!submitting}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>

                <View style={styles.footer}>
                    {submitting ? (
                        <View style={styles.loading}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <Button label="로그인" onPress={handleSubmit} style={!canSubmit ? styles.disabled : undefined} />
                    )}

                    {/* 개발 중에만 보인다. 프로덕션 빌드에서는 __DEV__ 가 false 라 통째로 빠진다 */}
                    {__DEV__ && (
                        <View style={styles.demoBox}>
                            <Text style={styles.demoLabel}>개발용 계정</Text>
                            <View style={styles.demoRow}>
                                <Button
                                    label="demo1 (D-1275)"
                                    variant="secondary"
                                    size="sm"
                                    style={styles.demoButton}
                                    onPress={() => loginAs('demo1@fledge.dev')}
                                />
                                <Button
                                    label="demo2 (D-180)"
                                    variant="secondary"
                                    size="sm"
                                    style={styles.demoButton}
                                    onPress={() => loginAs('demo2@fledge.dev')}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.white },
    container: { flexGrow: 1, paddingHorizontal: spacing.lg },
    title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, lineHeight: 32 },
    sub: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
    form: { marginTop: spacing.xl },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
    labelSpaced: { marginTop: spacing.md },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },
    error: { fontSize: 13, color: colors.danger, marginTop: spacing.md, lineHeight: 18 },
    footer: { marginTop: 'auto', paddingTop: spacing.xl },
    demoBox: { marginTop: spacing.lg },
    demoLabel: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm, textAlign: 'center' },
    demoRow: { flexDirection: 'row', gap: spacing.sm },
    demoButton: { flex: 1 },
    loading: { height: 52, alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.4 },
});