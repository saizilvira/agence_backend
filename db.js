import {createPool} from 'mysql2/promise'

export const pool = createPool({
    host: 'containers-us-west-109.railway.app',
    user: 'root',
    password: 'DFOR7bq66VhIYdtDPJBz',
    port: '5610',
    database: 'railway'
})
