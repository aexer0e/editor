import { createNotification } from '@/components/Footer/create'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'
import type { IDisposable } from '@/types/disposable'

/**
 * Creates a new error notification
 * @param config
 */
export function createErrorNotification(error: Error): IDisposable {
	const message = error.message
	let short = message
	if (message.includes(': ')) short = message.split(': ').shift() as string
	if (short.length > 24)
		short = message.length > 24 ? `${message.substr(0, 23)}...` : message

	const notification = createNotification({
		icon: 'mdi-alert-circle-outline',
		message: short,
		color: 'error',
		disposeOnMiddleClick: true,
		onClick: () => {
			createInformationWindow(`ERROR: ${short}`, message)
			notification.dispose()
		},
	})

	return {
		...notification,
	}
}

window.addEventListener('error', event => {
	createErrorNotification(event.error)
})

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
	createErrorNotification(new Error(event.reason))
}
