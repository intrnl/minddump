import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface HeaderProps {
	title?: React.ReactNode;
	action?: React.ReactNode;
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
		flexGrow: 1,
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
	},
});

const Header = (props: HeaderProps) => {
	const { title = <MindDumpTitle />, action } = props;

	return (
		<View style={style.root}>
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
