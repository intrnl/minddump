import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Link, Stack, useFocusEffect } from 'expo-router';

import { MasonryFlashList } from '@shopify/flash-list';
import { ActivityIndicator, FAB, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { format as formatDate } from 'date-fns';

import useSWR from 'swr';
import { useDebounce } from 'usehooks-ts';

import CachedImage from '../components/CachedImage';
import Header, { SearchTitle } from '../components/Header';

import { connect } from '../lib/database';
import { exec } from '../lib/database-utils';
import { type Gif } from '../lib/giphy';

const style = StyleSheet.create({
	root: {
		flex: 1,
	},

	list: {
		padding: 16,
		paddingTop: 8,
		paddingBottom: 16 + 55 + 16,
	},
	listItemRoot: {
		overflow: 'hidden',
		borderRadius: 9,
		borderColor: '#F2F2F2',
		borderWidth: 1,
		margin: 8,
	},
	listItemTitling: {
		padding: 12,
	},
	listItemTitle: {
		fontSize: 16,
		fontWeight: '500',
	},
	listItemDate: {
		color: '#0000005C',
		fontSize: 12,
	},

	fab: {
		width: 184,
		height: 55,
		borderRadius: 45,
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		zIndex: 10,
	},
});

const GifPreview = ({ giphyId }: { giphyId: string }) => {
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

	const ratio = +data.images.fixed_height.width / +data.images.fixed_height.height;

	return (
		<CachedImage
			source={{ uri: data.images.fixed_height.url }}
			cacheKey={`${data.id}-fixed_height`}
			style={{ aspectRatio: ratio }}
			resizeMode='contain'
			placeholder={
				<View style={{ backgroundColor: '#D9D9D9', aspectRatio: ratio }}>
					<ActivityIndicator
						size='small'
						style={{ flex: 1, justifyContent: 'center' }}
					/>
				</View>
			}
		/>
	);
};

const HomePage = () => {
	const inset = useSafeAreaInsets();

	const [isSearching, setIsSearching] = React.useState(false);
	const [search, setSearch] = React.useState('');

	const debouncedSearch = useDebounce(search, 500);

	const { data, mutate } = useSWR(`posts?q=${debouncedSearch}`, async () => {
		const db = await connect();

		const [result] = await exec(db, [
			{
				sql:
					`SELECT id, datetime(created_at, 'localtime') AS created_at, title, giphy_id FROM notes WHERE title LIKE ? ORDER BY id DESC`,
				args: [`%${debouncedSearch}%`],
			},
		]);

		const rows = result.rows as ({ id: number; created_at: number; title: string; giphy_id: string })[];
		return rows;
	});

	useFocusEffect(React.useCallback(() => {
		mutate();
	}, []));

	return (
		<View style={StyleSheet.compose(style.root, { marginTop: inset.top })}>
			<Stack.Screen options={{ title: 'Home' }} />

			{isSearching
				? (
					<Header
						title={<SearchTitle value={search} onValueChange={setSearch} />}
						action={
							<IconButton
								key='close'
								icon='close'
								accessibilityLabel='Cancel search'
								onPress={() => {
									setIsSearching(false);
									setSearch('');
								}}
							/>
						}
					/>
				)
				: (
					<Header
						action={
							<IconButton
								key='search'
								icon='magnify'
								accessibilityLabel='Search'
								onPress={() => setIsSearching(true)}
							/>
						}
					/>
				)}

			<Link href='/post/create' asChild>
				<FAB icon='plus' label='MindDump' style={style.fab} />
			</Link>

			<MasonryFlashList
				data={data}
				numColumns={2}
				keyExtractor={(item) => item.id + ''}
				renderItem={({ item }) => (
					<View style={style.listItemRoot}>
						<Link href={`/post/${item.id}`} asChild>
							<Pressable android_ripple={{ borderless: false, foreground: true }}>
								<GifPreview giphyId={item.giphy_id} />

								<View style={style.listItemTitling}>
									<Text style={style.listItemTitle}>{item.title}</Text>
									<Text style={style.listItemDate}>{formatDate(new Date(item.created_at), 'MMMM do, yyyy')}</Text>
								</View>
							</Pressable>
						</Link>
					</View>
				)}
				estimatedItemSize={70}
				contentContainerStyle={style.list}
				ListEmptyComponent={
					<View>
						<Text>Empty!</Text>
					</View>
				}
			/>
		</View>
	);
};

export default HomePage;
