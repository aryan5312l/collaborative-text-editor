function isValidOperation(operation) {
    return operation && operation.type && operation.position >= 0;
}

module.exports = {isValidOperation};