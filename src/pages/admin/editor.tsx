import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminEditorRedirect() {
	const router = useRouter()

	useEffect(() => {
		void router.replace('/admin')
	}, [router])

	return null
}
