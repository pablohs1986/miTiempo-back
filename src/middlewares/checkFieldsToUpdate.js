/** Middleware that takes all the fields from the body of the request
 * and returns the fields to update, checking if fields have value.
 * */
module.exports = (req, res, next) => {
	let fields = getFieldsFromBody(req.body);
	fieldsToUpdate = deleteFieldsWithoutValue(fields);
	req.fieldsToUpdate = fieldsToUpdate;
	next();
};

/** Method that takes all the fields from the request body. */
function getFieldsFromBody(body) {
	let fields = {};
	for (const [key, value] of Object.entries(body)) {
		fields[key] = value;
	}
	return fields;
}

/** Method that removes from the json object that receives as a parameter,
 * the keys whose value is '' or undefined.
 * */
function deleteFieldsWithoutValue(fields) {
	let fieldsToUpdate = fields;
	for (const [key, value] of Object.entries(fields)) {
		if (value === '' || value === undefined) {
			delete fields[key];
		}
	}
	return fieldsToUpdate;
}
