module.exports = class RamlSchemaPreprocessor {

  // {
//   "name": "firstName",
//   "primary": false,
//   "unique": false,
//   "allowNull": false,
//   "dataType": {
//     "type": "string",
//     "size": 255
//   }

// { name: 'users',
//   displayName: 'users',
//   typePropertyKind: 'TYPE_EXPRESSION',
//   type: [ 'array' ],
//   required: false,
//   items: 'User' }
// { name: 'id',
//   displayName: 'id',
//   typePropertyKind: 'TYPE_EXPRESSION',
//   type: [ 'number' ],
//   required: true }
// { name: 'active',
//   displayName: 'active',
//   typePropertyKind: 'TYPE_EXPRESSION',
//   type: [ 'sent | not-sent' ],
//   required: true,
//   fixedFacets: { required: true } }
  /**
   * Normalize the table schema.
   *
   * @param {*} columnSchema column schema to be normalized
   * @returns {{}} normalized column schema
   */
  convertToStandardSchema(columnSchema) {
    return {
      name: columnSchema.name,
      primary: columnSchema.name === 'id',
      unique: columnSchema.name === 'id',
      allowNull: columnSchema.required,
      dataType: {},
    };
  }
};
