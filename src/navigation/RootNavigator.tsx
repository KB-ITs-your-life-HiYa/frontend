import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/Home/HomeScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import BenefitsScreen from '../screens/Benefits/BenefitsScreen';
import HousingCalendarScreen from '../screens/Housing/HousingCalendarScreen';
import MyPageScreen from '../screens/MyPage/MyPageScreen';

export type RootTabParamList = {
  Home: undefined;
  Chat: undefined;
  Benefits: undefined;
  Housing: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  Benefits: { active: 'cash', inactive: 'cash-outline' },
  Housing: { active: 'business', inactive: 'business-outline' },
  MyPage: { active: 'person', inactive: 'person-outline' },
};

// 5탭 구성: 홈 / 대화 / 지원금 / 독립지원 / 마이
// 온라인 케어(Care), 금융교육(Education), 온보딩(Onboarding) 화면은
// 우선 MyPage 등에서 Stack Navigator로 연결해 확장하면 됩니다.
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name as keyof RootTabParamList];
            return <Ionicons name={focused ? icons.active : icons.inactive} size={size ?? 22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
        <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '대화' }} />
        <Tab.Screen name="Benefits" component={BenefitsScreen} options={{ title: '지원금' }} />
        <Tab.Screen name="Housing" component={HousingCalendarScreen} options={{ title: '독립지원' }} />
        <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
