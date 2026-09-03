import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import BenefitsScreen from '../screens/Benefits/BenefitsScreen';
import HousingCalendarScreen from '../screens/Housing/HousingCalendarScreen';
import PlayScreen from '../screens/Play/PlayScreen';
import MyPageScreen from '../screens/MyPage/MyPageScreen';
import TodoListScreen from '../screens/Home/TodoListScreen';
import TopicDetailScreen from '../screens/Play/TopicDetailScreen';
import ScheduleListScreen from '../screens/Housing/ScheduleListScreen';
import CareScreen from '../screens/Care/CareScreen';

import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';

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
  MyPage: undefined;
  Care: undefined;
  TodoList: undefined;
  TopicDetail: { title: string };
  ScheduleList: undefined;
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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 16 },
        tabBarStyle: { height: 66, paddingBottom: 10, paddingTop: 6 },
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
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="MyPage" component={MyPageScreen} />
                <Stack.Screen name="Care" component={CareScreen} />
                <Stack.Screen name="TodoList" component={TodoListScreen} />
                <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
                <Stack.Screen name="ScheduleList" component={ScheduleListScreen} />
              </>
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
