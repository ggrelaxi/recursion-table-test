import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState, memo } from 'react';
import { entityId } from 'src/config';
import { DocIcon } from 'src/Icons/DocIcon';
import './Main.style.scss';
import { Loader } from 'src/Loader/Loader';
import { TrashIcon } from 'src/Icons';
import { RowItem } from 'src/RowItem';

interface IRow {
	rowName: string;
	total: string | number;
	salary: string | number;
	mimExploitation: string | number;
	machineOperatorSalary: string | number;
	materials: string | number;
	mainCosts: string | number;
	supportCosts: string | number;
	equipmentCosts: string | number;
	overheads: string | number;
	estimatedProfit: string | number;
	isEdit: boolean;
	isTemp: boolean;
	child: IRow[];
	id?: number | string;
	parentId?: number | string;
}

const defaultItem = {
	rowName: 'string',
	total: 0,
	salary: 0,
	mimExploitation: 0,
	machineOperatorSalary: 0,
	materials: 0,
	mainCosts: 0,
	supportCosts: 0,
	equipmentCosts: 0,
	overheads: 0,
	estimatedProfit: 0,
	isEdit: false,
	child: [],
};

const addChildRow = (tree: IRow[], rowId: string | number) => {
	return tree.map((row: IRow) => {
		if (row.id === rowId)
			row.child.push({ ...defaultItem, id: uuidv4(), isEdit: true, isTemp: true, parentId: row.id });
		row.child = addChildRow(row.child, rowId);
		return row;
	});
};

const changeRowValue = (tree: IRow[], rowId: string | number, fieldName: string, value: string) => {
	return tree.map((row) => {
		if (row.id === rowId) {
			// @ts-expect-error
			row[fieldName] = value;
		}
		row.child = changeRowValue(row.child, rowId, fieldName, value);
		return row;
	});
};

const prepareData = (tree: IRow[]) => {
	return tree.map((row) => {
		row.isEdit = false;
		row.child = prepareData(row.child);
		return row;
	});
};

const updateData = (tree: IRow[], response: { current: IRow }, tempId: string) => {
	const { current } = response;

	return tree.map((row) => {
		console.log(current.id, tempId, row.id);
		if (row.id === tempId) {
			row.isEdit = false;
			row.id = current.id;
		}

		row.child = updateData(row.child, response, tempId);
		return row;
	});
};

const filteredData = (tree: IRow[], tempId: string) => {
	return tree.filter((row) => {
		row.child = filteredData(row.child, tempId);
		return row.id !== tempId;
	});
};

export const Main = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const addRowClickHandler = (rowId: number) => (event: any) => {
		event.stopPropagation();
		//@ts-expect-error
		setData((prevData) => {
			return addChildRow(prevData, rowId);
		});
	};

	const deleteRowHandler = (rowId: number) => (event: any) => {
		event.stopPropagation();
		setIsLoading(true);

		fetch(`http://185.244.172.108:8081/v1/outlay-rows/entity/${entityId}/row/${rowId}/delete`, { method: 'DELETE' })
			.then((res) => res.json())
			// @ts-expect-error
			.then(() => setData((prevState) => filteredData(prevState, rowId)))
			.finally(() => setIsLoading(false));
	};

	const rowClickHandler = (rowId: number) => (event: any) => {
		setData((prevData) => {
			const dataCopy = structuredClone(prevData);
			const iter = (node: IRow) => {
				if (node.id === rowId && node.isEdit === false && event.detail === 2) {
					node.isEdit = !node.isEdit;
					return;
				}

				node.child.forEach(iter);
			};

			dataCopy.forEach(iter);

			return dataCopy;
		});
	};

	console.log(data);

	const rowEventHandler =
		(row: IRow) =>
		// @ts-expect-error
		(event: KeyboardEvent<HTMLDivElement>): void => {
			console.log(row, 333);
			if (event.key === 'Enter') {
				const payload = {
					equipmentCosts: row.equipmentCosts,
					estimatedProfit: row.estimatedProfit,
					machineOperatorSalary: row.machineOperatorSalary,
					mainCosts: row.mainCosts,
					materials: row.materials,
					mimExploitation: row.mimExploitation,
					overheads: row.overheads,
					rowName: row.rowName,
					salary: row.salary,
					supportCosts: row.supportCosts,
				};
				setIsLoading(true);

				if (row.isTemp === true) {
					fetch(`http://185.244.172.108:8081/v1/outlay-rows/entity/${entityId}/row/create`, {
						method: 'POST',
						body: JSON.stringify({ ...payload, parentId: row.parentId }),
						headers: {
							'Content-Type': 'application/json',
						},
					})
						.then((res) => res.json())
						.then((data) => {
							// @ts-expect-error
							setData((prevState) => updateData(prevState, data, row.id));
						})
						.finally(() => setIsLoading(false));

					return;
				}

				fetch(`http://185.244.172.108:8081/v1/outlay-rows/entity/${entityId}/row/${row.id}/update`, {
					method: 'POST',
					body: JSON.stringify(payload),
					headers: {
						'Content-Type': 'application/json',
					},
				})
					.then((res) => res.json())
					.then((data) => {
						// @ts-expect-error
						setData((prevState) => updateData(prevState, data, row.id));
					})
					.finally(() => setIsLoading(false));
			}
		};

	const changeRowItemHandler = (rowId: string | number, fieldName: string) => (value: string) => {
		// @ts-expect-error
		setData((prevData) => changeRowValue(prevData, rowId, fieldName, value));
	};

	useEffect(() => {
		setIsLoading(true);
		fetch(`http://185.244.172.108:8081/v1/outlay-rows/entity/${entityId}/row/list`, { headers: { Accept: '*/*' } })
			.then((res) => res.json())
			.then((data) => {
				// @ts-expect-error
				setData(data.length > 0 ? prepareData(data) : [{ ...defaultItem, id: uuidv4() }]);
			})
			.finally(() => setIsLoading(false));
	}, []);

	const renderTree = (tree: IRow[], level = 0) => {
		return tree.map((row) => {
			const { id, rowName, salary, isEdit, equipmentCosts, overheads, estimatedProfit, child } = row;

			return (
				<div key={id} className="tree-node">
					<div
						className="table-row "
						onKeyDown={rowEventHandler(row)}
						onClick={rowClickHandler(row.id as number)}
					>
						<div className="level">
							{!isEdit && (
								<div
									className={`icons-container ${level > 0 && 'child-row'} ${
										child.length && 'has-child'
									}`}
									style={{ marginLeft: `calc(${level} * 20px)` }}
								>
									<DocIcon onClick={addRowClickHandler(row.id as number)} />
									<TrashIcon onClick={deleteRowHandler(row.id as number)} />
								</div>
							)}
						</div>
						<div className="name">
							<RowItem
								isEdit={isEdit}
								onChange={changeRowItemHandler(id as string, 'rowName')}
								value={rowName as string}
							/>
						</div>
						<div className="salary">
							<RowItem
								isEdit={isEdit}
								onChange={changeRowItemHandler(id as string, 'salary')}
								value={salary as string}
							/>
						</div>
						<div className="equipment">
							<RowItem
								isEdit={isEdit}
								onChange={changeRowItemHandler(id as string, 'equipmentCosts')}
								value={equipmentCosts as string}
							/>
						</div>
						<div className="overheads">
							<RowItem
								isEdit={isEdit}
								onChange={changeRowItemHandler(id as string, 'overheads')}
								value={overheads as string}
							/>
						</div>
						<div className="profit">
							<RowItem
								isEdit={isEdit}
								onChange={changeRowItemHandler(id as string, 'estimatedProfit')}
								value={estimatedProfit as string}
							/>
						</div>
					</div>
					<div className="children">{renderTree(row.child, level + 1)}</div>
				</div>
			);
		});
	};

	return (
		<main className="main">
			<div className="top">
				<div className="header-container">
					<h1>Строительно-монтажные работы</h1>
				</div>
			</div>
			<div className="data">
				<div className="table-header">
					<div className="level">Уровень</div>
					<div className="name">Наименование работ</div>
					<div className="salary">Основная ЗП</div>
					<div className="equipment">Оборудование</div>
					<div className="overheads">Накладные расходы</div>
					<div className="profit">Сметная прибыль</div>
				</div>

				<div className="table-body">{renderTree(data)}</div>
			</div>
			{isLoading && <Loader />}
		</main>
	);
};
