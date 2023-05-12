import React from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useSWR from 'swr';

import CachedImage from '../../components/CachedImage';
import Header, { BlankTitle } from '../../components/Header';

import { connect } from '../../lib/database';
import { exec } from '../../lib/database-utils';
import { Gif } from '../../lib/giphy';

const style = StyleSheet.create({
	flex: {
		flex: 1,
	},
	background: {
		flex: 1,
		backgroundColor: 'red',
	},
	image: {
		width: '100%',
		resizeMode: 'cover',
	},
	content: {
		padding: 24,
	},
	bottom: {
		height: 1,
		backgroundColor: 'blue',
	},
});

const GiphyHeader = ({ giphyId, height }: { giphyId: string; height: number }) => {
	const { data } = useSWR(`giphy/${giphyId}`, async () => {
		const db = await connect();

		const [result] = await exec(db, [
			{
				sql: `SELECT json FROM giphy WHERE id = ?`,
				args: [giphyId],
			},
		]);

		const rows = result.rows;

		if (rows.length > 0) {
			return JSON.parse(rows[0].json) as Gif;
		}
		else {
			return null;
		}
	});

	if (!data) {
		return <View style={{ height: 90, backgroundColor: '#D9D9D9' }} />;
	}

	return (
		<CachedImage
			source={{ uri: data.images.fixed_height.url }}
			cacheKey={`${data.id}-fixed_height`}
			style={{ height }}
			resizeMode='cover'
			placeholder={
				<View style={{ backgroundColor: '#D9D9D9', height }}>
					<ActivityIndicator
						size='small'
						style={{ flex: 1, justifyContent: 'center' }}
					/>
				</View>
			}
		/>
	);
};

const PostDetailsPage = () => {
	const { id: postId } = useLocalSearchParams();

	const inset = useSafeAreaInsets();
	const router = useRouter();

	const [yScrollOffset] = React.useState(() => new Animated.Value(0));
	const [width] = React.useState(() => Dimensions.get('window').width);

	const imageHeight = width * 0.75;

	const { data, isLoading } = useSWR(`posts/${postId}`, async () => {
		const db = await connect();

		const [result] = await exec(db, [
			{
				sql: `SELECT title, content, giphy_id FROM notes WHERE id = ?`,
				args: [postId],
			},
		]);

		const rows = result.rows as ({ title: string; content: string; giphy_id: string })[];

		if (rows.length > 0) {
			return rows[0];
		}
		else {
			return null;
		}
	});

	if (isLoading) {
		return (
			<View>
				<ActivityIndicator />
			</View>
		);
	}

	if (!data) {
		return (
			<View>
				Uh oh, not found
			</View>
		);
	}

	return (
		<View style={style.flex}>
			<ScrollView
				style={style.flex}
				scrollEventThrottle={20}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { y: yScrollOffset } } }],
					{ useNativeDriver: false },
				)}
			>
				<GiphyHeader
					giphyId={data.giphy_id}
					height={imageHeight}
				/>

				<View style={style.content}>
					<Text style={{ fontSize: 24, fontWeight: '700' }}>{data.title}</Text>
					<Text style={{ marginTop: 24, fontSize: 16 }}>{data.content}</Text>
				</View>
			</ScrollView>

			<Animated.View
				style={{
					backgroundColor: yScrollOffset.interpolate({
						inputRange: [0, imageHeight - 52 - inset.top - 15],
						outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
					}),
					paddingTop: inset.top,
					position: 'absolute',
					left: 0,
					right: 0,
				}}
			>
				<Header
					title={<BlankTitle />}
					action={
						<IconButton
							icon='close'
							iconColor='black'
							accessibilityLabel='Close'
							onPress={router.back}
						/>
					}
				/>
			</Animated.View>
		</View>
	);
};

export default PostDetailsPage;
