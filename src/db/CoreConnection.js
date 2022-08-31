const mysql = require('mysql');
const { loadParameters } = require('../db/parameterUtil.js');

const crypto = require('crypto')


let con = null;

class CoreConnection {

    static async getCon(){
        const paramSt = process.env.DB_DATASOURCE;
        const databaseParam = await loadParameters(paramSt);
        const datasource = JSON.parse(databaseParam);
        const dbconfig= {
            user: datasource.user,
            password: datasource.password,
            host: datasource.host,
            database: datasource.database
        };
        return await mysql.createConnection(dbconfig);
    }
    static async obtenerPool(usuario, password) {
        con = await this.getCon();
        var shasum = crypto.createHash('sha1')
        shasum.update(password)
        var shapass = shasum.digest('hex')
        
        var response = {
            code :'',
            message : "",
        }

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

        if(result[0] != null){
            const persona = result[0];
            response.code = "success"
            response.message = persona.nombre + " " +persona.apellidos

          }else{
            response.code = 'error'
            response.message = 'No existe persona'
          }

        return response

    };
    static async validacionTarjeta(tarjeta, nombres) {
        const {pan, fechaVenc, panPorc, fecPorc, cvc, cvcPorc} = tarjeta;
        var response = {
            code :'success',
            message : "Verificación Exitosa",
        }
        con = await this.getCon();
        console.log('pan:',pan)
        var dt = new Date();
        const fechaTarjeta = fechaVenc?.split('/');
        //const fecTarj = fechaTarjeta[1] + fechaTarjeta[0];
        const fecTarj = fechaTarjeta[1];

        const year  = (dt.getFullYear()+5).toString().substr(-2);
        const month = (dt.getMonth() + 1).toString().padStart(2, "0");
        //let fechaActual = year + month;
        let fechaActual = year;

        console.log("fechaActual:",fechaActual)
        console.log("fecTarj",fecTarj)
        console.log("fecTarj - fechaActual:",(fecTarj - fechaActual))
        

        if(fecTarj - fechaActual != 0){
            response.code = 'error'
            response.message = 'Fecha actual no corresponde'
            return response
        }

        var queryPromise = new Promise((resolve, reject) => {
            con.query("SELECT * FROM Tarjeta where pan = ? ",[pan], (error, results) => {
                if (error) {
                    Logger.debug(error);
                    reject(error);
                }
                resolve(results);
            });
        });
  
        var result = await queryPromise;

        if(result[0] != null){
        const tarjeta = result[0];

        if(tarjeta.fechaVenc != fechaVenc){
            response.code = 'error'
            response.message = 'Fecha de vencimiento no coincide en base datos'
            return response
        }

        if(tarjeta.cvc != cvc){
            response.code = 'error'
            response.message = 'CVC no existe en base de datos'
            return response
        }

        var nombreTarjetaExiste = {
            nombre: null,
            porcentaje: null
        }

        for(let nombreTarjeta of nombres){
            console.log("nombreTarjeta", nombreTarjeta)
            if(nombreTarjeta.nombre == tarjeta.nombre){
                nombreTarjetaExiste.nombre = nombreTarjeta.nombre
                nombreTarjetaExiste.porcentaje = nombreTarjeta.porcentaje
            }
        }

        console.log("nombreTarjetaExiste",nombreTarjetaExiste)

        if(nombreTarjetaExiste.nombre == null){
            response.code = 'error'
            response.message = 'Nombre de Tarjeta no existe'
            return response
        }


        }else{
            response.code = 'error'
            response.message = 'No existe tarjeta'
            return response
        }

        //Validación porcentajes
        //Porcentaje Pan
        queryPromise = new Promise((resolve, reject) => {
            con.query("SELECT * from Tarjeta_config where codigo = 'pan' AND ? >= porcentaje",[panPorc], (error, results) => {
                if (error) {
                    Logger.debug(error);
                    reject(error);
                }
                resolve(results);
            });
        });
  
        result = await queryPromise;
        if(result[0] == null){
            response.code = 'error'
            response.message = 'Porcentaje Pan no válido'
            return response
        }

        //Porcentaje fechaVenc
        queryPromise = new Promise((resolve, reject) => {
            con.query("SELECT * from Tarjeta_config where codigo = 'fechaVenc' AND ? >= porcentaje",[fecPorc], (error, results) => {
                if (error) {
                    Logger.debug(error);
                    reject(error);
                }
                resolve(results);
            });
        });
  
        result = await queryPromise;
        if(result[0] == null){
            response.code = 'error'
            response.message = 'Porcentaje Fecha Vencimiento no válido'
            return response
        }

        //Porcentaje CVC
        queryPromise = new Promise((resolve, reject) => {
            con.query("SELECT * from Tarjeta_config where codigo = 'cvc' AND ? >= porcentaje",[cvcPorc], (error, results) => {
                if (error) {
                    Logger.debug(error);
                    reject(error);
                }
                resolve(results);
            });
        });
  
        result = await queryPromise;
        if(result[0] == null){
            response.code = 'error'
            response.message = 'Porcentaje CVC no válido'
            return response
        }

        return response

    }

}
module.exports = { CoreConnection };