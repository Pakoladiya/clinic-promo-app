import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { logout } from '../services/authService';

const DashboardScreen = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await logout();
            // RootNavigator handles redirect to Login via auth state change
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Welcome back</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ContentLibrary')}
            >
                <Text style={styles.cardIcon}>📋</Text>
                <View>
                    <Text style={styles.cardTitle}>Browse Content</Text>
                    <Text style={styles.cardSub}>Find promo material by discipline</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.cardIcon}>🏥</Text>
                <View>
                    <Text style={styles.cardTitle}>Clinic Profile</Text>
                    <Text style={styles.cardSub}>Manage your logo and clinic info</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f0f4ff' },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 28,
        marginTop: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    cardIcon: { fontSize: 28, marginRight: 16 },
    cardTitle: { fontSize: 17, fontWeight: '600', color: '#1a73e8', marginBottom: 3 },
    cardSub: { fontSize: 13, color: '#777' },
    logoutButton: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingVertical: 14,
    },
    logoutText: { color: '#e53935', fontSize: 15 },
});

export default DashboardScreen;
