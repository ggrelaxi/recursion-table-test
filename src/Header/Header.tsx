import { useState } from 'react';
import { GoBackIcon, MainIcon } from 'src/Icons';
import './Header.style.scss';

export const Header = () => {
	const [links, setLinks] = useState([
		{
			label: 'Просмотр',
			url: '#',
			isActive: true,
		},
		{
			label: 'Управление',
			url: '#',
			isActive: false,
		},
	]);
	const linkClickHandler = (idx: number) => () => {
		setLinks((prevLinks) => {
			return prevLinks.map((link, i) => ({ ...link, isActive: i === idx }));
		});
	};
	return (
		<header className="header">
			<MainIcon />
			<GoBackIcon />
			<nav>
				{links.map(({ url, label, isActive }, idx) => {
					return (
						<a
							key={idx}
							className={`${isActive ? 'active-link' : ''}`}
							href={url}
							onClick={linkClickHandler(idx)}
						>
							{label}
						</a>
					);
				})}
			</nav>
		</header>
	);
};
