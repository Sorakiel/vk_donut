import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router'
import { ScreenSpinner, SplitCol, SplitLayout, View } from '@vkontakte/vkui'
import { ReactNode, useEffect, useState } from 'react'

import { Home } from './panels'
import { DEFAULT_VIEW_PANELS } from './routes'

export const App = () => {
	const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } =
		useActiveVkuiLocation()
	const [popout, setPopout] = useState<ReactNode | null>(
		<ScreenSpinner size='large' />
	)

	useEffect(() => {
		async function fetchData() {
			setPopout(null)
		}
		fetchData()
	}, [])

	return (
		<SplitLayout popout={popout}>
			<SplitCol>
				<View activePanel={activePanel}>
					<Home id='home' />
				</View>
			</SplitCol>
		</SplitLayout>
	)
}
