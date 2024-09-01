const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors');

const app = express()
app.use(cors());
const ports = 2000;

const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
];

const secret_key = '12345' // tidak diubah menjadi token melainkan digunakan untuk membuat sebuah token, tanpa secret_key maka token tidak akan terbuat

// Middleware untuk parsing JSON
app.use(express.json());



function simpleMiddleware(req, res, next) {
    console.log(`Request received: ${req.method} ${req.url} ${new Date().toISOString()}`)
    next()
}

app.use(simpleMiddleware)


// Route untuk menghasilkan token JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy check; dalam aplikasi nyata, lakukan verifikasi terhadap database
    if (username === 'admin' && password === 'password') {
        // payload digunakan untuk menampilkan data yang akan diberikan melalui token
        const user = { id: 1, username: username, name: 'arthur', }; // Contoh payload
        const token = jwt.sign(user, secret_key, { expiresIn: '1h' }); // Token berlaku 1 jam
        res.json({ token });
    } else {
        res.status(400).send('Invalid credentials');
    }
});


// ini merupakan middleware untuk proses get method, karena tanpa melewati ini atau proses ini gagal maka mthod get tidak akan pernah menghasilkan data yang diinginkan
function verifyToken(req, res, next) {
    // merupakan proses untuk menambahkan key dan value pada headers ketika akses api, tujuannya untuk authentication
    const authHeader = req.headers['authorization']
    // Mengambil token setelah "Bearer "
    const token = authHeader && authHeader.split(' ')[1];

    // ini bertujuan untuk checking apakah di headers sudah ditambahkan token apa belum
    if (!token) {
        return res.status(403).send('A token is required for authentication')
    }

    // ini proses verify oleh jwt untuk checking apakah token itu valid atau tidak, biasanya token tidak valid ketika sudah expired
    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid Token')
        }

        req.user = decoded;
        next()
    })

}


// proses get akan melewati verifytoken terlebih dahulu baru akan menghasilkan sebuah data penting
app.get('/get', verifyToken, (req, res) => {
    res.json({
        message: 'Success get data',
        user: req.user,
        items: items,
    })
})


app.listen(ports, () => {
    console.log(`server berjalan di ports: ${ports} `)
})

