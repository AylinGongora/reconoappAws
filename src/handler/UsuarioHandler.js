const { CoreConnection } = require('../db/CoreConnection.js')

let model = null;

module.exports =  {

    async consultarUsuario(event, context, callback){ 
        //const origin = event.headers.origin;
        console.log(event.body); 

        var jsonPer = JSON.parse(event.body);       

        var result = await CoreConnection.obtenerPool(jsonPer.persona.email,jsonPer.persona.password);
        
        const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            
            message: 'Autentica 1: success | 0: unsuccess',
            input: result,
        }),
        };
    
        return response;
    }


};