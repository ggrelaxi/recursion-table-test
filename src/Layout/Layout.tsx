import './Layout.style.scss';
import { Aside } from 'src/Aside/Aside';
import { Header } from 'src/Header/Header';
import { Main } from 'src/Main/Main';

export const Layout = () => {
	return (
		<div className="wrapper">
			<Header />
			<div className="container">
				<Aside />
				<Main />
			</div>
		</div>
	);
};
