import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../services/supabaseClient';
import { squareCrop } from '../utils/imageUtils';

const ProfileScreen = () => {
    const [clinicName, setClinicName] = useState('');
    const [clinicInfo, setClinicInfo] = useState('');
    const [logoUri, setLogoUri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setClinicName(data.clinic_name || '');
                setClinicInfo(data.clinic_info || '');
                setLogoUri(data.logo_url || null);
            }
        } catch (_) {
            // No profile row yet
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const croppedUri = await squareCrop(result.assets[0].uri, 300);
            setLogoUri(croppedUri);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            let logo_url = logoUri;

            // Upload logo if it's a new local file
            if (logoUri && logoUri.startsWith('file://')) {
                const ext = logoUri.split('.').pop();
                const path = `logos/${user.id}.${ext}`;
                const response = await fetch(logoUri);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage
                    .from('clinic-assets')
                    .upload(path, blob, { upsert: true });
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('clinic-assets')
                    .getPublicUrl(path);
                logo_url = publicUrl;
            }

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                clinic_name: clinicName,
                clinic_info: clinicInfo,
                logo_url,
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;

            Alert.alert('Saved', 'Your profile has been updated.');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1a73e8" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <TouchableOpacity style={styles.logoArea} onPress={handleLogoUpload}>
                {logoUri ? (
                    <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoPlaceholderText}>Tap to upload{'\n'}clinic logo</Text>
                    </View>
                )}
                <Text style={styles.changeLogoText}>{logoUri ? 'Change logo' : ''}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Clinic Name</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Sunrise Physiotherapy"
                value={clinicName}
                onChangeText={setClinicName}
            />

            <Text style={styles.label}>About Your Clinic</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description shown on shared content..."
                value={clinicInfo}
                onChangeText={setClinicInfo}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={saving}
            >
                {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveButtonText}>Save Profile</Text>
                }
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4ff' },
    inner: { padding: 24, paddingBottom: 48 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logoArea: { alignItems: 'center', marginBottom: 28 },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#dde3f0',
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 14,
        backgroundColor: '#e8eaf6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#c5cae9',
        borderStyle: 'dashed',
    },
    logoPlaceholderText: {
        color: '#7986cb',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    changeLogoText: { color: '#1a73e8', fontSize: 13, marginTop: 6 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dde3f0',
        padding: 14,
        fontSize: 15,
        marginBottom: 18,
    },
    textArea: { height: 110 },
    saveButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
