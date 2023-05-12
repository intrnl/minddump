import React from 'react';
import { StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

export interface HeaderProps {
	title?: React.ReactNode;
	action?: React.ReactNode;
	style?: ViewStyle;
}

const style = StyleSheet.create({
	root: {
		height: 52,
		gap: 16,
		paddingTop: 24,
		paddingHorizontal: 24,
		marginBottom: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},

	title: {
		flexDirection: 'row',
		flex: 1,
	},
	titleRegular: {
		fontSize: 20,
	},
	titleBold: {
		fontSize: 20,
		fontWeight: 'bold',
	},

	actions: {
		marginRight: -10,
		flexShrink: 1,
	},

	input: {
		flexGrow: 1,
		fontSize: 20,
	},
});

const Header = (props: HeaderProps) => {
	const { title = <MindDumpTitle />, action, style: rootStyle } = props;

	return (
		<View style={StyleSheet.compose(style.root, rootStyle)}>
			{title}

			<View style={style.actions}>
				{action}
			</View>
		</View>
	);
};

export default Header;

export const BlankTitle = () => {
	return <View style={style.title} />;
};

export const CreateMindDumpTitle = () => {
	return (
		<View style={style.title} accessibilityLabel='Create MindDump'>
			<Text style={style.titleRegular}>Create{' '}</Text>
			<Text style={style.titleRegular}>Mind</Text>
			<Text style={style.titleBold}>Dump</Text>
		</View>
	);
};

export const MindDumpTitle = () => {
	return (
		<View style={style.title} accessibilityLabel='MindDump'>
			<Text style={style.titleRegular}>Mind</Text>
			<Text style={style.titleBold}>Dump</Text>
		</View>
	);
};

export const SearchTitle = ({ value, onValueChange }: { value: string; onValueChange: (next: string) => void }) => {
	return (
		<View style={style.title}>
			<TextInput
				placeholder='Search'
				value={value}
				onChangeText={onValueChange}
				style={style.input}
			/>
		</View>
	);
};
