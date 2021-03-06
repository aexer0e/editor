import { Component as VueComponent } from 'vue'
import Vue from 'vue'
import { v4 as uuid } from 'uuid'

export const WINDOWS = Vue.observable({})
export function createWindow(
	vueComponent: VueComponent,
	state: Record<string, unknown> = {}
) {
	const windowUUID = uuid()
	const windowState: typeof state = Vue.observable({
		isVisible: false,
		shouldRender: false,
		...state,
	})

	const windowApi = {
		getState: () => windowState,
		close: () => {
			windowState.isVisible = false
			setTimeout(() => {
				windowState.shouldRender = false
			}, 600)
		},
		open: () => {
			windowState.shouldRender = true
			windowState.isVisible = true
		},
		dispose: () => Vue.delete(WINDOWS, windowUUID),
	}

	Vue.set(WINDOWS, windowUUID, [vueComponent, windowApi])

	return windowApi
}
