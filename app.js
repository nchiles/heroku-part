const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

app.use(express.static(path.join(__dirname, '/')))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, '/'))
app.set('view engine', 'ejs')


app.get('/', async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query('SELECT * FROM winners_table');
		const results = { 'results': (result) ? result.rows : null};
		console.log(results);
		res.setHeader('Access-Control-Allow-Origin', '*');
    	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
		res.status(200).json(results)
		client.release();
	} catch (err) {
		console.error(err);
		res.send("Error " + err);
	}
})

app.post('/', (req, res) => {
	const text = 'INSERT INTO winners_table(name, prize) VALUES($1, $2)'
	const values = [req.body.name, req.body.prize];

	pool.query(text, values, (error, results) => {
		if (error) {
			throw error
		}
		res.redirect('back');
	})
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))