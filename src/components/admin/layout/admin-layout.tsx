
import Head from 'next/head';
import type { ReactNode } from 'react';

type AdminLayoutProps = {
	title: string;
	description?: string;
	children: ReactNode;
};

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
	const pageTitle = `${title} | Painel administrativo`;

	return (
		<>
			<Head>
				<title>{pageTitle}</title>
				{description ? <meta name="description" content={description} /> : null}
			</Head>
			<div className="admin-layout">
				<header className="admin-layout__header">
					<div>
						<h1>{title}</h1>
						{description ? <p>{description}</p> : null}
					</div>
				</header>
				<main className="admin-layout__content">{children}</main>
			</div>
		</>
	);
}
