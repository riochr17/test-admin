import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Axios from 'axios';


const formatRp = (angka) => {
	let rupiah = '';		
	const angkarev = angka.toString().split('').reverse().join('');
	for(let i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
	return 'Rp '+rupiah.split('',rupiah.length-1).reverse().join('');
}

const StyledTableCell = withStyles(theme => ({
	head: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	body: {
		fontSize: 14,
	},
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.background.default,
		},
	},
}))(TableRow);

function createData(name, calories, fat, carbs, protein) {
	return { name, calories, fat, carbs, protein };
}

const rows = [
	createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
	createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
	createData('Eclair', 262, 16.0, 24, 6.0),
	createData('Cupcake', 305, 3.7, 67, 4.3),
	createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const useStyles = makeStyles({
	table: {
		minWidth: 700,
	},
});


const getStatus = (trx) => {
	if (!trx.ppob_data) {
		return 'BERHASIL';
	}

	const { request_data, response_data } = trx.ppob_data;
	const { kode_produk } = request_data;
	if (!response_data) {
		return 'GAGAL';
	}
	const responseCode = response_data.responseCode;
	const manualAdviceHashID = response_data.manualAdviceHashID;
	return manualAdviceHashID ? 'MANUAL ADVICE' : (responseCode == '00' ? 'BERHASIL' : 'GAGAL');
}

const getDeskripsiStatus = (trx) => {
	if (!trx.ppob_data) {
		return '-';
	}

	const { request_data, response_data } = trx.ppob_data;
	const { kode_produk } = request_data;
	if (!response_data) {
		return '-';
	}
	return response_data.message;
}

const getData = () => {
	return Axios({
		method: 'get',
		url: `http://182.23.44.62:7081/v2-public/api/trx-log`
	})
}

const manualAdvice = (id_transaksi) => {
	return Axios({
		method: 'get',
		url: `http://182.23.44.62:7081/v2-public/advice?id_transaksi=${id_transaksi}`,
	})
}


export default function CustomizedTables() {
	const classes = useStyles();
	const [data, setData] = useState([]);
	useEffect(() => {
		getData()
		.then(res => {
			setData(res.data);
		})
		.catch(err => {
			console.log(err);
		});
	}, []);

	return (
		<div>
			<TableContainer component={Paper}>
				<Table className={classes.table} aria-label="customized table">
					<TableHead>
						<TableRow>
							<StyledTableCell align="left">ID Transaksi</StyledTableCell>
							<StyledTableCell align="right">Amount</StyledTableCell>
							<StyledTableCell align="left">Deskripsi</StyledTableCell>
							<StyledTableCell align="left">Data</StyledTableCell>
							<StyledTableCell align="left">Status</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.map((row, index) => (
							<StyledTableRow key={index}>
								<StyledTableCell align="left">{row.trx_id}</StyledTableCell>
								<StyledTableCell align="right">{formatRp(row.amount)}</StyledTableCell>
								<StyledTableCell align="left">{row.trx_desc}</StyledTableCell>
								<StyledTableCell align="left">{getDeskripsiStatus(row)}</StyledTableCell>
								<StyledTableCell align="left">{
									getStatus(row) == 'MANUAL ADVICE'
									? (
										<Button
											onClick={e => {
												manualAdvice(row.trx_id)
												.then(res => {
													for (let i = 0; i < data.length; i++) {
														if (data[i].trx_id == row.trx_id) {
															data[i].ppob_data.response_data = res.data.result;
															setData(data.map(x => x));
															break;
														}
													}
												})
												.catch(err => console.log(err));
											}}
											variant="contained" 
											color="default">
											Manual Advice
										</Button>
									)
								  : (
									<Button
										variant="contained" color={getStatus(row) == 'GAGAL' ? 'secondary' : 'primary'}>
										{getStatus(row)}
									</Button>
								  )
								}</StyledTableCell>
							</StyledTableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
