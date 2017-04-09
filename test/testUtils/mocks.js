module.exports = {
    SCHEMA_ONE_TABLE: [
        {
            "name": "users",
            "columns": [
                {
                    "name": "id",
                    "primary": true,
                    "unique": true,
                    "allowNull": false,
                    "dataType": {
                        "type": "number",
                        "size": null
                    }
                },
                {
                    "name": "firstName",
                    "primary": false,
                    "unique": false,
                    "allowNull": true,
                    "dataType": {
                        "type": "string",
                        "size": 255
                    }
                },
                {
                    "name": "lastName",
                    "primary": false,
                    "unique": false,
                    "allowNull": true,
                    "dataType": {
                        "type": "string",
                        "size": 255
                    }
                },
                {
                    "name": "email",
                    "primary": false,
                    "unique": true,
                    "allowNull": false,
                    "dataType": {
                        "type": "string",
                        "size": 50
                    }
                }
            ]
        }
    ]
};