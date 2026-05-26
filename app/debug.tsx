import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, Button, ScrollView, View } from 'react-native';
import { BASE_URL, api } from '../src/services/api';

export default function DebugScreen() {
	const [result, setResult] = useState<string>('');
	const [loading, setLoading] = useState(false);

	const testMyServices = async () => {
		setLoading(true);
		setResult('');
		try {
			const resp = await api.get('/api/orders/myservices');
			setResult(JSON.stringify(resp.data, null, 2));
		} catch (err: any) {
			setResult(String(err?.message || err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// quick auto-check
		setResult('BASE_URL = ' + BASE_URL);
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>Debug: backend config</Text>
				<View style={styles.row}>
					<Text style={styles.label}>Base URL:</Text>
					<Text style={styles.value}>{BASE_URL}</Text>
				</View>

				<Button title={loading ? 'Probando...' : 'Probar /api/orders/myservices'} onPress={testMyServices} disabled={loading} />

				<Text style={styles.outputTitle}>Resultado:</Text>
				<Text style={styles.output}>{result || 'Sin resultados'}</Text>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#0a0a0b' },
	content: { padding: 20 },
	title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
	row: { flexDirection: 'row', marginBottom: 12 },
	label: { color: '#9a9a9a', marginRight: 8 },
	value: { color: '#fff', flex: 1 },
	outputTitle: { color: '#9a9a9a', marginTop: 18, marginBottom: 6 },
	output: { color: '#eaeaea', fontFamily: undefined },
});
