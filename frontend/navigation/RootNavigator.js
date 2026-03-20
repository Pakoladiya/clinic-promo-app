import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ContentLibraryScreen from '../screens/ContentLibraryScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LogoOverlayScreen from '../screens/LogoOverlayScreen';
import ProfileScreen from '../screens/ProfileScreen';

import supabase from '../services/supabaseClient';

const Stack = createStackNavigator();

const RootNavigator = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setSession(session)
        );

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1a73e8" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#fff' },
                    headerTintColor: '#1a73e8',
                    headerTitleStyle: { fontWeight: '600' },
                }}
            >
                {!session ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
                        <Stack.Screen name="ContentLibrary" component={ContentLibraryScreen} options={{ title: 'Content Library' }} />
                        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Content' }} />
                        <Stack.Screen name="LogoOverlay" component={LogoOverlayScreen} options={{ title: 'Preview & Share' }} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
