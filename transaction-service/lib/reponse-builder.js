
export const success = (data, message) => buildResponse(200, data, message);
export const failure = (data, message) => buildResponse(500, data, message);
export const badRequest = (data, message) => buildResponse(400, data, message);


const buildResponse = (statusCode, data, message) => {

    const response = {
        status : statusCode == 200 ? "true" : "false",
        data: data
    };

    if (message) {
        response.message = message;
    }

    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(response)
    };
};