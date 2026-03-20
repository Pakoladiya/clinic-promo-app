import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, Share, ScrollView,
} from 'react-native';
import supabase from '../services/supabaseClient';

const LogoOverlayScreen = ({ route, navigation }) => {
    const { content } = route.params;
    const [logoUri, setLogoUri] = useState(null);
    const [clinicName, setClinicName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('clinic_name, logo_url')
                .eq('id', user.id)
                .single();

            if (data) {
                setClinicName(data.clinic_name || '');
                setLogoUri(data.logo_url || null);
            }
        } catch (_) {
            // Profile not set up yet — that's fine
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const message = [
            content.title,
            '',
            content.body,
            '',
            clinicName ? `— ${clinicName}` : '',
        ].join('\n').trim();

        try {
            await Share.share({ message });
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1a73e8" />
            </View>
        );
    }

    const profileIncomplete = !clinicName && !logoUri;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            {/* Branded preview card */}
            <View style={styles.previewCard}>
                <Text style={styles.previewDiscipline}>{content.discipline}</Text>
                <Text style={styles.previewTitle}>{content.title}</Text>
                <Text style={styles.previewBody} numberOfLines={6}>{content.body}</Text>

                <View style={styles.brandingRow}>
                    {logoUri ? (
                        <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="contain" />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoPlaceholderText}>LOGO</Text>
                        </View>
                    )}
                    <Text style={clinicName ? styles.clinicName : styles.clinicNameEmpty}>
                        {clinicName || 'Your Clinic Name'}
                    </Text>
                </View>
            </View>

            {profileIncomplete && (
                <View style={styles.hint}>
                    <Text style={styles.hintText}>
                        Set up your profile to add your clinic name and logo to shared content.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.hintLink}>Set up profile →</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4ff' },
    inner: { padding: 20, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    previewDiscipline: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1a73e8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    previewTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
    previewBody: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 20 },
    brandingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 16,
    },
    logo: { width: 44, height: 44, borderRadius: 6, marginRight: 12 },
    logoPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 6,
        backgroundColor: '#e8eaf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoPlaceholderText: { fontSize: 10, color: '#9fa8da', fontWeight: '600' },
    clinicName: { fontSize: 15, fontWeight: '600', color: '#1a73e8' },
    clinicNameEmpty: { fontSize: 14, color: '#bbb', fontStyle: 'italic' },
    hint: {
        backgroundColor: '#fff8e1',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    hintText: { fontSize: 13, color: '#7a6200', marginBottom: 6 },
    hintLink: { fontSize: 13, color: '#1a73e8', fontWeight: '600' },
    shareButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default LogoOverlayScreen;
