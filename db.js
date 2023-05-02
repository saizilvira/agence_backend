import {createPool} from 'mysql2/promise'

export const pool = createPool({
    host: '192.168.1.9',
    user: 'root',
    password: 'unico123',
    port: '3306',
    database: 'caol'
})