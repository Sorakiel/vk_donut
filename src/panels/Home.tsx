import bridge from '@vkontakte/vk-bridge'
import {
	Avatar,
	Button,
	Div,
	Group,
	Header,
	Panel,
	PanelHeader,
	SimpleCell,
	Spinner,
	View,
} from '@vkontakte/vkui'
import { useEffect, useState } from 'react'
import './Home.css'

// Типы для данных, возвращаемых из API
interface Group {
	id: number
	name: string
	photo_50: string
	members_count: number
	is_admin: number
}

interface AuthTokenResponse {
	access_token: string
	scope: string
}

export const Home = () => {
	const [groups, setGroups] = useState<Group[]>([])
	const [authToken, setAuthToken] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Получение ключа доступа
		const getAuthToken = async () => {
			try {
				const data: AuthTokenResponse = await bridge.send(
					'VKWebAppGetAuthToken',
					{
						app_id: 52898714,
						scope: 'groups',
					}
				)
				if (data.access_token) {
					setAuthToken(data.access_token)
				}
			} catch (error) {
				console.error('Error getting auth token:', error)
			}
		}

		getAuthToken()
	}, [])

	useEffect(() => {
		if (authToken) {
			const fetchGroups = async () => {
				try {
					setLoading(true)
					// Получение списка групп пользователя
					const groupsResponse = await bridge.send('VKWebAppCallAPIMethod', {
						method: 'groups.get',
						params: {
							extended: 1,
							fields: 'members_count,photo_50',
							v: '5.131',
							access_token: authToken,
						},
					})

					// Получение информации о ролях пользователя в группах
					const groupIds = groupsResponse.response.items
						.map((group: Group) => group.id)
						.join(',')
					const rolesResponse = await bridge.send('VKWebAppCallAPIMethod', {
						method: 'groups.getById',
						params: {
							group_ids: groupIds,
							fields: 'is_admin,members_count',
							v: '5.131',
							access_token: authToken,
						},
					})

					// Фильтрация групп по ролям
					const adminGroups = rolesResponse.response.filter(
						(group: Group) => group.is_admin === 1
					)
					setGroups(adminGroups)
					setLoading(false)
				} catch (error) {
					console.error('Error fetching groups:', error)
					setLoading(false)
				}
			}

			fetchGroups()
		}
	}, [authToken])

	return (
		<View activePanel='main'>
			<Panel id='main'>
				<PanelHeader>VK Donut</PanelHeader>
				<Div className='Banner'></Div>
				{loading ? (
					<Spinner size='large' />
				) : (
					<Group className='groups' header={<Header>Ваши сообщества</Header>}>
						{groups.map(group => (
							<SimpleCell
								key={group.id}
								before={<Avatar size={48} src={group.photo_50} />}
								after={
									<Button
										mode='primary'
										onClick={() => {
											window.open(
												`https://vk.com/donut_settings/-${group.id}`,
												'_blank'
											)
										}}
									>
										Подключить
									</Button>
								}
							>
								{group.name}
								<div>{` ${group.members_count} подписчик`}</div>
							</SimpleCell>
						))}
					</Group>
				)}
			</Panel>
		</View>
	)
}
