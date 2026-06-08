const { getDb } = require('./db');
const logger = require('./logger');

class DbPool {
    constructor() {
        this.driver = 'sqlite';
    }

    async query(sql, params = []) {
        const db = await getDb();
        return db.all(sql, params);
    }

    async get(sql, params = []) {
        const db = await getDb();
        return db.get(sql, params);
    }

    async run(sql, params = []) {
        const db = await getDb();
        return db.run(sql, params);
    }

    async exec(sql) {
        const db = await getDb();
        return db.exec(sql);
    }

    /**
     * Future PostgreSQL migration:
     * Replace getDb() with a pg Pool and map these methods:
     *   query  -> pool.query(sql, params).then(r => r.rows)
     *   get    -> pool.query(sql, params).then(r => r.rows[0])
     *   run    -> pool.query(sql, params).then(r => ({ changes: r.rowCount }))
     *   exec   -> pool.query(sql)
     */
}

module.exports = new DbPool();
