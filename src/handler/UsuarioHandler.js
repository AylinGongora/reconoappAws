const { CoreConnection } = require('../db/CoreConnection.js')

let model = null;

module.exports =  {

    async consultarUsuario(event, context, callback){ 
        //const origin = event.headers.origin;
        console.log("inicio validaTarjeta"); 
        //console.log(event); 
        console.log(event.body); 

        //var jsonPer = event;
        var jsonPer = JSON.parse(event.body);       

        var result = await CoreConnection.obtenerPool(jsonPer.persona.email,jsonPer.persona.password);
        
        const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            
            message: 'Autentica 1: success | 0: unsuccess',
            input: result.code =='success'?1:0,
            nombre: result.message
        }),
        };
    
        return response;
    },

    async validaTarjeta(event, context, callback){ 
        //const origin = event.headers.origin;
        console.log("inicio validaTarjeta"); 
        console.log(event); 
        
        var tarjeta = JSON.parse(event.body);
        //var tarjeta = event;

        var result = await CoreConnection.validacionTarjeta(tarjeta.tarjeta);
        
        const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            code: result.code,
            message: result.message
        }),
        };
    
        return response;
    }


};