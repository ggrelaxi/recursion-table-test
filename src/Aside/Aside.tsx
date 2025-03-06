import './Aside.style.scss';
import { BottomArrowIcon, ItemIcon } from 'src/Icons/';
import { useState } from 'react';

export const Aside = () => {
	const [isListOpen, setIsListOpen] = useState(true);

	const toggleListHandler = () => {
		setIsListOpen((prevState) => !prevState);
	};

	return (
		<aside className="aside">
			<div className="list-header">
				<div>
					<h2>Название проекта</h2>
					<p>Аббревиатура</p>
				</div>
				<BottomArrowIcon onClick={toggleListHandler} />
			</div>
			{isListOpen && (
				<div className="list-items">
					<div className="item">
						<ItemIcon />
						<h3>По проекту</h3>
					</div>
					<div className="item">
						<ItemIcon />
						<h3>Объекты</h3>
					</div>
					<div className="item">
						<ItemIcon />
						<h3>РД</h3>
					</div>
				</div>
			)}
		</aside>
	);
};
