const Line = require('@app/models/line');

class MissingLineError extends Error {
    constructor(...args) {
        super(...args)
        Error.captureStackTrace(this, MissingLineError)
    }
}

function isFloat(value){
    if(!isNaN(value) && value >=0){
        return true;
    } else{
        return false;
    }
}

async function place(line) {
    if (!line) {
        throw new Error('Line parameter required.');
    }

    if (!line.line_user_id || !line.line_start_lat || !line.line_start_lon || !line.line_end_lat
        || !line.line_end_lon || !line.line_name || !line.line_description || !isFloat(line.line_start_lat)
        || !isFloat(line.line_start_lon) || !isFloat(line.line_end_lat) ||  !isFloat(line.line_end_lon)
        ) {
        throw new Error('Please supply a valid Line object: { line_user_id: String, '
            + 'line_start_lat: Number, line_start_lon: Number, line_end_lat: Number, '
            + 'line_end_lon: Number, line_name: String, line_description: String}');
    }
    let result = await Line.insert(line);
    console.log(result);

    return;
}

async function getAll() {
    let res = await Line.getAll();
    return res;
}

async function get(id) {
    if (parseInt(id) != NaN && id >= 0) {
        let res = await Line.getByPrimaryKey(id);
        if(res === undefined){
            throw new MissingLineError('Line with this LineID not found');
        }
        return res;
    }
    else{
        throw new Error('Please enter a valid LineID');
    }
}

module.exports = {
    MissingLineError,
    place,
    getAll,
    get
};
