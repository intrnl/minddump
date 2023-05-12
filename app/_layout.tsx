import React from 'react';

import { Stack } from 'expo-router';
import { MD3LightTheme as DefaultTheme, type MD3Theme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme: MD3Theme = {
	...DefaultTheme,
	colors: {
		primary: 'rgb(80, 102, 0)',
		onPrimary: 'rgb(255, 255, 255)',
		primaryContainer: 'rgb(195, 244, 0)',
		onPrimaryContainer: 'rgb(22, 30, 0)',
		secondary: 'rgb(91, 97, 70)',
		onSecondary: 'rgb(255, 255, 255)',
		secondaryContainer: 'rgb(224, 230, 196)',
		onSecondaryContainer: 'rgb(24, 30, 9)',
		tertiary: 'rgb(58, 102, 94)',
		onTertiary: 'rgb(255, 255, 255)',
		tertiaryContainer: 'rgb(188, 236, 226)',
		onTertiaryContainer: 'rgb(0, 32, 28)',
		error: 'rgb(186, 26, 26)',
		onError: 'rgb(255, 255, 255)',
		errorContainer: 'rgb(255, 218, 214)',
		onErrorContainer: 'rgb(65, 0, 2)',
		background: 'rgb(254, 252, 244)',
		onBackground: 'rgb(27, 28, 23)',
		surface: 'rgb(254, 252, 244)',
		onSurface: 'rgb(27, 28, 23)',
		surfaceVariant: 'rgb(227, 228, 211)',
		onSurfaceVariant: 'rgb(70, 72, 60)',
		outline: 'rgb(118, 120, 107)',
		outlineVariant: 'rgb(198, 200, 184)',
		shadow: 'rgb(0, 0, 0)',
		scrim: 'rgb(0, 0, 0)',
		inverseSurface: 'rgb(48, 49, 44)',
		inverseOnSurface: 'rgb(243, 241, 233)',
		inversePrimary: 'rgb(171, 214, 0)',
		elevation: {
			level0: 'transparent',
			level1: 'rgb(245, 245, 232)',
			level2: 'rgb(240, 240, 225)',
			level3: 'rgb(235, 236, 217)',
			level4: 'rgb(233, 234, 215)',
			level5: 'rgb(230, 231, 210)',
		},
		surfaceDisabled: 'rgba(27, 28, 23, 0.12)',
		onSurfaceDisabled: 'rgba(27, 28, 23, 0.38)',
		backdrop: 'rgba(47, 49, 39, 0.4)',
	},
};

const Layout = () => {
	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: 'transparent' },
					}}
				/>
			</PaperProvider>
		</SafeAreaProvider>
	);
};

export default Layout;
