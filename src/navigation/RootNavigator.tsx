import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import BenefitsScreen from '../screens/Benefits/BenefitsScreen';
import HousingCalendarScreen from '../screens/Housing/HousingCalendarScreen';
import PlayScreen from '../screens/Play/PlayScreen';
import MyPageScreen from '../screens/MyPage/MyPageScreen';
import TodoListScreen from '../screens/Home/TodoListScreen';
import AccountListScreen from '../screens/Home/AccountListScreen';
import NotificationsScreen from '../screens/Home/NotificationsScreen';
import ExpenseReportScreen from '../screens/Home/ExpenseReportScreen';
import SupportEndForecastScreen from '../screens/Home/SupportEndForecastScreen';
import TopicCategoryScreen from '../screens/Play/TopicCategoryScreen';
import TopicDetailScreen from '../screens/Play/TopicDetailScreen';
import ScheduleListScreen from '../screens/Housing/ScheduleListScreen';
import HousingNoticeDetailScreen from '../screens/Housing/HousingNoticeDetailScreen';
import BenefitDetailScreen from '../screens/Benefits/BenefitDetailScreen';
import CareScreen from '../screens/Care/CareScreen';
import CounselorPortalScreen from '../screens/Counselor/CounselorPortalScreen';

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import { AccountType } from '../types';
import type { SubsidyMatchResponse } from '../types/benefit';

export type RootTabParamList = {
  Home: undefined;
  Chat: { signalId?: number } | undefined;
  Benefits: undefined;
  Housing: undefined;
  Play: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  CounselorPortal: undefined;
  MyPage: undefined;
  Care: undefined;
  TodoList: undefined;
  TopicCategory: { categoryId: number; title: string };
  TopicDetail: { topicId: number };
  ScheduleList: undefined;
  HousingNoticeDetail: { noticeId: number };
  BenefitDetail: { item: SubsidyMatchResponse };
  AccountList: { type: AccountType };
  Notifications: undefined;
  ExpenseReport: undefined;
  SupportEndForecastDetail: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  Benefits: { active: 'cash', inactive: 'cash-outline' },
  Housing: { active: 'business', inactive: 'business-outline' },
  Play: { active: 'game-controller', inactive: 'game-controller-outline' },
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Home: '홈',
  Chat: '대화',
  Benefits: '지원금',
  Housing: '독립지원',
  Play: '놀이',
};

// 탭 바 밑에 흰 배경이 두 겹으로 보인다는 피드백 — react-navigation이 기기 하단 세이프 에어리어
// 만큼을 tabBarStyle과 별도로 덧붙이면서, 우리가 준 고정 height(66)짜리 흰 바 아래에
// 세이프 에어리어용 흰 여백이 또 한 겹 붙어 마치 배경이 두 개인 것처럼 보였다.
// 세이프 에어리어 인셋을 직접 읽어서 height/padding에 미리 포함시키는 걸로 한 번 고쳤는데,
// 홈 화면의 CareBanner 팝업(Modal)이 떠 있을 때만 다시 두 겹으로 보인다는 리포트가 왔다.
// RN의 Modal이 열려 있는 동안 안드로이드에서 useSafeAreaInsets()가 이 화면(MainTabs) 쪽에
// 순간적으로 다른 값(대개 0)을 돌려주는 경우가 있어서, insets.bottom을 매 렌더마다 반영하면
// 팝업이 뜨는 순간 탭 바 높이 계산이 흔들려 버린다. 그래서 처음 마운트될 때 값을 한 번만
// 저장해두고 그 뒤로는 화면 어딘가에서 Modal이 뜨든 말든 흔들리지 않게 고정했다.
function MainTabs() {
  const insets = useSafeAreaInsets();
  const [bottomInset] = useState(() => insets.bottom);
  const tabBarBasePadding = 10;
  const tabBarBaseHeight = 56;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 16 },
        tabBarStyle: {
          height: tabBarBaseHeight + Math.max(bottomInset, tabBarBasePadding),
          paddingBottom: Math.max(bottomInset, tabBarBasePadding),
          paddingTop: 6,
          backgroundColor: colors.white,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof RootTabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: TAB_LABELS.Home }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: TAB_LABELS.Chat }} />
      <Tab.Screen name="Benefits" component={BenefitsScreen} options={{ title: TAB_LABELS.Benefits }} />
      <Tab.Screen name="Housing" component={HousingCalendarScreen} options={{ title: TAB_LABELS.Housing }} />
      <Tab.Screen name="Play" component={PlayScreen} options={{ title: TAB_LABELS.Play }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, member } = useAuth();

  // 저장된 토큰을 확인하는 동안. 이게 없으면 로그인한 사람에게도 로그인 화면이 깜빡한다
  if (loading) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
          <ActivityIndicator color={colors.primary} />
        </View>
    );
  }

  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {member ? (
              member.role === 'COUNSELOR' ? (
                // 상담사 계정은 청년용 탭 화면 대신, 사이드바가 있는 PC 웹 포털 화면 하나로 보낸다.
                <Stack.Screen name="CounselorPortal" component={CounselorPortalScreen} />
              ) : (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="MyPage" component={MyPageScreen} />
                <Stack.Screen name="Care" component={CareScreen} />
                <Stack.Screen name="TodoList" component={TodoListScreen} />
                <Stack.Screen name="AccountList" component={AccountListScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} />
                <Stack.Screen name="SupportEndForecastDetail" component={SupportEndForecastScreen} />
                <Stack.Screen name="TopicCategory" component={TopicCategoryScreen} />
                <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
                <Stack.Screen name="ScheduleList" component={ScheduleListScreen} />
                <Stack.Screen name="HousingNoticeDetail" component={HousingNoticeDetailScreen} />
                <Stack.Screen name="BenefitDetail" component={BenefitDetailScreen} />
              </>
              )
          ) : (
              <>
                <Stack.Screen name="Onboarding" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
  );
}
