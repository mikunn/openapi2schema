# openapi2schema
Convert OpenAPI 3.0 document into a tree of request/response JSON Schemas. This builds on [openapi-schema-to-json-schema](https://www.npmjs.com/package/openapi-schema-to-json-schema) to enable request/response validation.

You can use it as a CLI tool or a library. Create your own CLI around the library if the standard one doesn't suit your needs.

## Example

Let's say we have an OpenAPI 3.0 file called `spec.yaml` that looks like the following

```yaml

openapi: "3.0.0"
info:
  title: Sample API
  version: 0.1.0
paths:
  /data:
    post:
      summary: Post data
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Data'
              
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DataResp'
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                properties:
                  status:
                    type: integer
components:
  schemas:
    DataResp:
      properties:
        total:
          type: integer
    Data:
      properties:
        date:
          type: string
          format: date-time
          nullable: true
``` 

Let's use the CLI tool on that:

```bash

$ openapi2schema -i spec.yaml -p
{
  "/data": {
    "post": {
      "body": {
        "properties": {
          "date": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        },
        "$schema": "http://json-schema.org/draft-04/schema#"
      },
      "responses": {
        "200": {
          "properties": {
            "total": {
              "type": "integer"
            }
          },
          "$schema": "http://json-schema.org/draft-04/schema#"
        },
        "400": {
          "properties": {
            "status": {
              "type": "integer"
            }
          },
          "$schema": "http://json-schema.org/draft-04/schema#"
        }
      }
    }
  }
}

```

The created JSON consists of the defined paths, in this case only `/data`, on the root level. Each path consists of `body` and/or `responses` object. `body` has the converted schema of the request body and `requests` has the response body schemas. Parameters are not currently supported.

## Usage

### CLI

The CLI tool will print the created JSON to stdout.

```bash

$ openapi2schema --help

  Usage: openapi2schema [options]


  Options:

    -i, --input [filepath]  OpenAPI file
    -p, --pretty-print      Enable pretty printing
    -d, --date-to-datetime  Convert dates to datetimes
    --pattern-properties    Support patternProperties with x-patternProperties
    --no-responses          Exclude responses
    --merge-allof           Merge allOfs
    -h, --help              output usage information
```

Let's walk through the options:
* `-i`: path to the OpenAPI file (or root file if it consists of many files)
* `-p`: pretty prints the JSON rather than outputting everything in a single line
* `-d`
  * if you have types with `format: date`, change these to `format: date-time`
  * this parameter goes directly to [openapi-schema-to-json-schema](https://www.npmjs.com/package/openapi-schema-to-json-schema), so check out its documentation for more info
* `--pattern-properties`
  * Setting this option changes `x-patternProperties` to `patternProperties` to enable validation against a pattern. If you have `additionalProperties` set as well in the same schema, this might do a bit of juggling on that. Scroll down for an example.
  * this parameter goes directly to [openapi-schema-to-json-schema](https://www.npmjs.com/package/openapi-schema-to-json-schema), so check out its documentation for more info
* `--no-responses`: include only requests in the created JSON
* `--merge-allof` will merge (and remove) allOf's to condence the JSON if possible

### Library

Let's start with an example:

```js
var openapi2schema = require('openapi2schema');

openapi2schema('test.yaml', function(err, result) {
  if (err) {
    console.log(err);
  }
  console.log(result);
});
```

This prints out the same structure as in the main CLI example, but as an object instead of JSON.

#### openapi2schema(spec, [options,] callback)

* `spec` (required)
  * either a path to OpenAPI spec file or an object
* `options` (optional)
  * `includeBodies` (boolean, default: `true`)
    * includes request bodies in the result structure
  * `includeResponses` (boolean, default: `true`)
    * includes response bodies in the result structure
  * `mergeAllOf` (boolean, default: `false`)
    * will merge (and remove) allOfs to condence the JSON if possible
  * `dateToDateTime` (boolean, default: `false`)
    * if you have types with `format: date`, change these to `format: date-time`
    * this parameter goes directly to [openapi-schema-to-json-schema](https://www.npmjs.com/package/openapi-schema-to-json-schema), so check out its documentation for more info
  * `supportPatternProperties`:
    * enable regex pattern based properties with `x-patternProperties`
    * this parameter goes directly to [openapi-schema-to-json-schema](https://www.npmjs.com/package/openapi-schema-to-json-schema), so check out its documentation for more info
* `callback` (required)
  * a function that will receive the result

### Using patternProperties

Consider the following spec called `pattern.yaml`:

```yaml

openapi: "3.0.0"
info:
  title: Sample API
  version: 0.1.0
paths:
  /data:
    get:
      responses:
        200:
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Data'
components:
  schemas:
    Data:
      additionalProperties:
        type: string
      x-patternProperties:
        "^[a-z]+$":
          type: string
```

We will use the CLI tool on that:

```bash

$ openapi2schema -i pattern.yaml -p --pattern-properties

{
  "/data": {
    "get": {
      "responses": {
        "200": {
          "additionalProperties": false,
          "patternProperties": {
            "^[a-z]+$": {
              "type": "string"
            }
          },
          "$schema": "http://json-schema.org/draft-04/schema#"
        }
      }
    }
  }
}
```

What is going on?

OpenAPI 3.0 doesn't support `patternProperties`. Luckily, OpenAPI supports additional properties starting with `x-`. We can leverage this feature to enable `patternProperties` for validation.

Here we set `x-patternProperties` in the schema, but we also set `additionalProperties`, because we want to use that in our API documentation. When we use the CLI tool, we set the `pattern-properties` flag, which changes `x-patternProperties` to `patternProperties`.

Notice also that `additionalProperties` is set to `false`. This is because if we allow additional string properties in the spec file, we would allow any property of type string. By setting it to `false`, we restrict additional properties to those defined by the pattern.

If we allow pattern properties of primitive types (string, numeric types, boolean) in the spec, `additionalProperties` will be set to `false` if that type is found in `patternProperties`.
