const mysql = require('mysql');
const { loadParameters } = require('../db/parameterUtil.js');

const crypto = require('crypto')


let con = null;

class CoreConnection {
    static async obtenerPool(usuario, password) {
        const paramSt = process.env.DB_DATASOURCE;
        const databaseParam = await loadParameters(paramSt);
        const datasource = JSON.parse(databaseParam);
        /*console.log("datasource",datasource);
        console.log("usuario",usuario);
        console.log("password",password);*/

        var dbconfig = {
            user: datasource.user,
            password: datasource.password,
            host: datasource.host,
            database: datasource.database
        };

        
        con = await mysql.createConnection(dbconfig);
        var shasum = crypto.createHash('sha1')
        shasum.update(password)
        var shapass = shasum.digest('hex')

        const queryPromise = new Promise((resolve, reject) => {
          con.query("SELECT * FROM Usuario where email = ? and password = ?",[usuario,shapass], (error, results) => {
              if (error) {
                  Logger.debug(error);
                  reject(error);
              }
              resolve(results);
          });
        });

        const result = await queryPromise;

        return result[0]!=null? 1:0


    }
}
module.exports = { CoreConnection };