import { memo, FC, ChangeEvent } from 'react';

interface IRowItemProps {
	isEdit: boolean;
	value: string;
	onChange: (value: string) => void;
}
const RowItem: FC<IRowItemProps> = ({ isEdit, value, onChange }) => {
	const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};

	if (isEdit) {
		return <input value={value} onChange={onChangeHandler} />;
	}

	return <span>{value}</span>;
};

export default memo(RowItem);
