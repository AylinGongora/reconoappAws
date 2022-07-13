const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const loadParameters = async (parameterPaths) => {
    let parameterResult;

    const start = new Date();
    const params = {
        Name: parameterPaths,
        WithDecryption: true,
    };
    const request = await ssm.getParameter(params).promise();
    parameterResult = request.Parameter.Value;

    const end = new Date();
    console.log(`Parametros Cargados (time: ${end - start})`);
    return parameterResult;
};

module.exports = {
    loadParameters,
};
