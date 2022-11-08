# Backend Gateway
Backend Gateway APIs

## Requirements
- NodeJs 14.x
- npm
- Serverless framework 3
- serverless-offline (dev dependency)

## Importing the existing API Gateway
```
Ex.

  httpApi:
    id: !ImportValue NearGatewayHttpApiId

```

## Importing the existing Token Authorizer

```
Ex.

functions:
  create-user:
    handler: create.handler
    events:
      - httpApi:
          path: /users
          method: post
          authorizer:            
            type: jwt            
            id: !ImportValue NearGatewayAuthorizerId
```

## Directory structure

- user-service
- contacts-service
- nfts-service
- ...

## Shared variables on YAML

```
Ex. 

provider:
  name: aws
  runtime: nodejs14.x
  region: ${file(../serverless-config.json):region}

```
